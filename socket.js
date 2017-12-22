"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const SocketIO = require("socket.io");
class Socket {
    constructor(server, db) {
        global.logger.info("Initializing socket...");
        const io = SocketIO(server);
        const hosts = {};
        const devices = {};
        const statuses = {};
        this.hostsNamespace = io.of("/hosts");
        this.usersNamespace = io.of("/users");
        this.usersNamespace.on("connection", (client) => __awaiter(this, void 0, void 0, function* () {
            global.logger.info(`Client ${client.id} connected to users channel`);
        }));
        this.hostsNamespace.on("connection", (client) => __awaiter(this, void 0, void 0, function* () {
            const hostId = client.handshake.query.host_id;
            if (!hostId) {
                global.logger.error("Client attempted to connect to hosts namespace without host ID");
                client.disconnect();
            }
            hosts[hostId] = client;
            if (!(yield db.hostExists(hostId))) {
                yield db.addHost(hostId);
            }
            global.logger.info(`Client ${client.id} (host ID ${hostId}) connected to hosts namespace`);
            client.on("printer", (data) => __awaiter(this, void 0, void 0, function* () {
                global.logger.info("Received request for printer with ID " + data.device.id);
                devices[data.device.id] = hostId;
                this.usersNamespace.emit("device_updated", data.device); // TODO: actual structure
                if (yield db.printerExists(data.device.id)) {
                    const printer = yield db.getPrinter(data.device.id);
                    const printerType = yield db.getPrinterType(printer.type);
                    const send = {
                        device_id: printer._id,
                        driver: printerType.driver
                    };
                    client.emit("printer_updated", send, (response) => {
                        global.logger.log("printer_updated response: " + JSON.stringify(response));
                        this.usersNamespace.emit("printer_updated", printer);
                    });
                }
            }));
            client.on("status", (data) => {
                statuses[hostId] = data;
            });
            client.on("print-status", (data) => __awaiter(this, void 0, void 0, function* () {
                global.logger.log(data);
                try {
                    yield db.updatePrint(data.print_id, data.status, data.description);
                }
                catch (ex) {
                    global.logger.error(ex);
                }
            }));
            client.on("reset", () => __awaiter(this, void 0, void 0, function* () {
                yield db.resetHostPrints(hostId);
            }));
            client.on("disconnect", () => __awaiter(this, void 0, void 0, function* () {
                delete hosts[hostId];
                delete statuses[hostId];
            }));
        }));
        io.on("connection", (client) => __awaiter(this, void 0, void 0, function* () {
            global.logger.info(`Client ${client.id} connected`);
            client.on("disconnect", () => __awaiter(this, void 0, void 0, function* () {
                global.logger.info(`Client ${client.id} disconnected`);
            }));
        }));
        const statusUpdate = () => {
            global.logger.debug("Emitting status");
            this.usersNamespace.emit("status", statuses);
            setTimeout(statusUpdate, 1000);
        };
        statusUpdate();
        global.logger.info("Socket initialized");
    }
    emitToHosts(event, ...args) {
        this.hostsNamespace.emit(event, args);
    }
    emitToUsers(event, ...args) {
        this.usersNamespace.emit(event, args);
    }
}
exports.Socket = Socket;
//# sourceMappingURL=socket.js.map