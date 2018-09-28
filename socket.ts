import * as http from "http";
import { Document } from "mongoose";
import * as SocketIO from "socket.io";
import { DB } from "./db";
import { Logger } from "./logger";

export class Socket {
    private static usersNamespace: SocketIO.Namespace;
    private static hostsNamespace: SocketIO.Namespace;

    private static connectedHosts: {[id: string]: SocketIO.Socket} = {};
    private static devices = {};
    private static statuses = {};

    public static init(server: http.Server) {
        Logger.info("Initializing socket...");

        const io = SocketIO(server);

        this.hostsNamespace = io.of("/hosts");
        this.usersNamespace = io.of("/users");

        this.usersNamespace.on("connection", async (client) => {
            Logger.info(`Client ${client.id} connected to users channel`);
        });

        this.hostsNamespace.on("connection", async (client) => {
            await this.onHostConnected(client);
        });

        io.on("connection", async (client) =>  {
            Logger.info(`Client ${client.id} connected`);

            client.on("disconnect", async () => {
                Logger.info(`Client ${client.id} disconnected`);
            });
        });

        const statusUpdate = () => {
            Logger.log("Emitting status");

            this.usersNamespace.emit("status", this.statuses);

            setTimeout(statusUpdate, 1000);
        };

        statusUpdate();

        Logger.info("Socket initialized");
    }

    public static documentSaved(type: string, doc: Document): void {
        Logger.debug(`Sending saved notification for document of type ${type} with ID ${doc._id}`);

        this.emitToUsers("saved", {
            "type": type,
            "document": doc
        });
    }

    public static documentRemoved(type: string, doc: Document) {
        Logger.debug(`Sending removed notification for document of type ${type} with ID ${doc._id} to all users`);

        this.emitToUsers("removed", {
            "type": type,
            "document": doc
        });
    }

    public static hostIsConnected(id: string): boolean {
        return this.getHost(id) !== null;
    }

    public static getHost(id: string): SocketIO.Socket {
        return this.connectedHosts[id] || null;
    }

    public static emitToHosts(event: string | symbol, ...args: any[]): void {
        this.hostsNamespace.emit(event, args);
    }

    public static emitToUsers(event: string | symbol, ...args: any[]): void {
        this.usersNamespace.emit(event, args);
    }

    private static async onHostConnected(client: SocketIO.Socket) {
        const hostId = client.handshake.query.host_id;

        if (!hostId) {
            Logger.error("Client attempted to connect to hosts namespace without host ID");
            client.disconnect();
        }

        this.connectedHosts[hostId] = client;

        // add host here

        Logger.info(`Client ${client.id} (host ID ${hostId}) connected to hosts namespace`);

        client.on("printer", async (data) => {
            Logger.info("Received request for printer with ID " + data.device.id);

            this.devices[data.device.id] = hostId;

            await DB.updateDevice(data.device.id, hostId);

            if (await DB.printerExists(data.device.id)) {
                const printer = await DB.getPrinter(data.device.id);
                const type = await DB.getPrinterType(printer.type);

                const send = {
                    "device_id": printer._id,
                    "driver": type.driver
                };

                client.emit("printer_updated", send, (response) => {
                    Logger.log("printer_updated response: " + JSON.stringify(response));
                });
            }
        });

        client.on("status", (data) => {
            Logger.log(`Received statuses for host ${hostId}: ${JSON.stringify(data)}`);
            this.statuses[hostId] = data;
        });

        client.on("print-status", async (data, ack) => {
            Logger.debug(`Received print status notification "${data.status}" for print ${data.print_id}`);

            try {
                await DB.updatePrint(data.print_id, data.status, data.description);
            } catch (ex) {
                Logger.error(ex);
            }

            // event has been processed
            ack();
        });

        client.on("reset", async () => {
            // await manager.resetHostPrints(hostId);
        });

        client.on("disconnect", async () => {
            delete this.connectedHosts[hostId];
            delete this.statuses[hostId];
        });
    }
}
