import { DB } from "./db";

import * as http from "http";
import * as SocketIO from "socket.io";
import { Logger } from "./logger";

export class Socket {
    private usersNamespace: SocketIO.Namespace;
    private hostsNamespace: SocketIO.Namespace;

    private connectedHosts: {[id: string]: SocketIO.Socket};

    public constructor(server: http.Server, db: DB) {
        Logger.info("Initializing socket...");

        const io = SocketIO(server);
        const devices = {};
        const statuses = {};

        this.hostsNamespace = io.of("/hosts");
        this.usersNamespace = io.of("/users");

        this.connectedHosts = {};

        this.usersNamespace.on("connection", async (client) => {
            Logger.info(`Client ${client.id} connected to users channel`);
        });

        this.hostsNamespace.on("connection", async (client) => {
            const hostId = client.handshake.query.host_id;

            if (!hostId) {
                Logger.error("Client attempted to connect to hosts namespace without host ID");
                client.disconnect();
            }

            this.connectedHosts[hostId] = client;

            if (!await db.hostExists(hostId)) {
                await db.addHost(hostId);
            }

            Logger.info(`Client ${client.id} (host ID ${hostId}) connected to hosts namespace`);

            client.on("printer", async (data) => {
                Logger.info("Received request for printer with ID " + data.device.id);

                devices[data.device.id] = hostId;

                await db.updateDevice(data.device.id, hostId);

                this.usersNamespace.emit("device_updated", data.device); // TODO: actual structure

                if (await db.printerExists(data.device.id)) {
                    const printer = await db.getPrinter(data.device.id);
                    const printerType = await db.getPrinterType(printer.type);

                    const send = {
                        device_id: printer._id,
                        driver: printerType.driver
                    };

                    client.emit("printer_updated", send, (response) => {
                        Logger.log("printer_updated response: " + JSON.stringify(response));

                        this.usersNamespace.emit("printer_updated", printer);
                    });
                }
            });

            client.on("status", (data) => {
                statuses[hostId] = data;
            });

            client.on("print-status", async (data) => {
                Logger.log(data);

                try {
                    await db.updatePrint(data.print_id, data.status, data.description);
                } catch (ex) {
                    Logger.error(ex);
                }
            });

            client.on("reset", async () => {
                await db.resetHostPrints(hostId);
            });

            client.on("disconnect", async () => {
                delete this.connectedHosts[hostId];
                delete statuses[hostId];
            });
        });

        io.on("connection", async (client) =>  {
            Logger.info(`Client ${client.id} connected`);

            client.on("disconnect", async () => {
                Logger.info(`Client ${client.id} disconnected`);
            });
        });

        const statusUpdate = () => {
            Logger.log("Emitting status");

            this.usersNamespace.emit("status", statuses);

            setTimeout(statusUpdate, 1000);
        };

        statusUpdate();

        Logger.info("Socket initialized");
    }

    public hostIsConnected(id: string): boolean {
        return this.getHost(id) !== null;
    }

    public getHost(id: string): SocketIO.Socket {
        return this.connectedHosts[id] || null;
    }

    public emitToHosts(event: string | symbol, ...args: any[]): void {
        this.hostsNamespace.emit(event, args);
    }

    public emitToUsers(event: string | symbol, ...args: any[]): void {
        this.usersNamespace.emit(event, args);
    }
}
