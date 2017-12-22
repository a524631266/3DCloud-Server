import { DB } from "./db";

import * as http from "http";
import * as SocketIO from "socket.io";

export class Socket {
    private usersNamespace: SocketIO.Namespace;
    private hostsNamespace: SocketIO.Namespace;

    public constructor(server: http.Server, db: DB) {
        global.logger.info("Initializing socket...");

        const io = SocketIO(server);
        const hosts =  {};
        const devices = {};
        const statuses = {};

        this.hostsNamespace = io.of("/hosts");
        this.usersNamespace = io.of("/users");

        this.usersNamespace.on("connection", async (client) => {
            global.logger.info(`Client ${client.id} connected to users channel`);
        });

        this.hostsNamespace.on("connection", async (client) => {
            const hostId = client.handshake.query.host_id;

            if (!hostId) {
                global.logger.error("Client attempted to connect to hosts namespace without host ID");
                client.disconnect();
            }

            hosts[hostId] = client;

            if (!await db.hostExists(hostId)) {
                await db.addHost(hostId);
            }

            global.logger.info(`Client ${client.id} (host ID ${hostId}) connected to hosts namespace`);

            client.on("printer", async (data) => {
                global.logger.info("Received request for printer with ID " + data.device.id);

                devices[data.device.id] = hostId;

                this.usersNamespace.emit("device_updated", data.device); // TODO: actual structure

                if (await db.printerExists(data.device.id)) {
                    const printer = await db.getPrinter(data.device.id);
                    const printerType = await db.getPrinterType(printer.type);

                    const send = {
                        device_id: printer._id,
                        driver: printerType.driver
                    };

                    client.emit("printer_updated", send, (response) => {
                        global.logger.log("printer_updated response: " + JSON.stringify(response));

                        this.usersNamespace.emit("printer_updated", printer);
                    });
                }
            });

            client.on("status", (data) => {
                statuses[hostId] = data;
            });

            client.on("print-status", async (data) => {
                global.logger.log(data);

                try {
                    await db.updatePrint(data.print_id, data.status, data.description);
                } catch (ex) {
                    global.logger.error(ex);
                }
            });

            client.on("reset", async () => {
                await db.resetHostPrints(hostId);
            });

            client.on("disconnect", async () => {
                delete hosts[hostId];
                delete statuses[hostId];
            });
        });

        io.on("connection", async (client) =>  {
            global.logger.info(`Client ${client.id} connected`);

            client.on("disconnect", async () => {
                global.logger.info(`Client ${client.id} disconnected`);
            });
        });

        const statusUpdate = () => {
            global.logger.debug("Emitting status");

            this.usersNamespace.emit("status", statuses);

            setTimeout(statusUpdate, 1000);
        };

        statusUpdate();

        global.logger.info("Socket initialized");
    }

    public emitToHosts(event: string | symbol, ...args: any[]): void {
        this.hostsNamespace.emit(event, args);
    }

    public emitToUsers(event: string | symbol, ...args: any[]): void {
        this.usersNamespace.emit(event, args);
    }
}
