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
const mongodb_1 = require("mongodb");
const config = require("./config");
class DB {
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.info(`Connecting to database at
                            ${config.DATABASE_URL}:${config.DATABASE_PORT}/${config.DATABASE_NAME}...`);
            this.db = yield mongodb_1.MongoClient.connect("mongodb://" + config.DATABASE_URL + ":" + config.DATABASE_PORT + "/" + config.DATABASE_NAME);
            global.logger.info("Successfully connected.");
        });
    }
    // region Hosts
    getHosts() {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log("Fetching all hosts");
            const collection = this.db.collection("hosts");
            return yield yield collection.find().toArray();
        });
    }
    getHost(id) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log(`'Fetching host with ID "${id}"`);
            const collection = this.db.collection("hosts");
            return yield collection.findOne({ _id: id });
        });
    }
    hostExists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log(`Checking if host with ID "${id}" exists`);
            return (yield this.getHost(id)) !== null;
        });
    }
    addHost(id) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log("Adding host with ID " + id);
            const name = "Machine " + id;
            const collection = this.db.collection("hosts");
            return yield collection.insertOne({ _id: id, name: name }).then((result) => {
                return result.result.n === 1;
            });
        });
    }
    deleteHost(id) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log("Deleting host with ID " + id);
            const collection = this.db.collection("hosts");
            return yield collection.deleteOne({ _id: id });
        });
    }
    updateHost(id, name) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log("Updating host with ID " + id);
            const collection = this.db.collection("hosts");
            const data = {
                _id: id,
                name: name
            };
            const result = yield collection.updateOne({ _id: id }, { $set: data });
            return result;
        });
    }
    // endregion
    // region Devices
    getDevice(id) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log(`Fetching device with ID "${id}"`);
            const collection = this.db.collection("devices");
            return yield collection.findOne({ _id: id });
        });
    }
    getDevices() {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log("Fetching all devices");
            const collection = this.db.collection("devices");
            return yield collection.find().toArray();
        });
    }
    deviceExists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log(`Checking if device with ID "${id}" exists`);
            return (yield this.getDevice(id)) !== null;
        });
    }
    updateDevice(id, hostId) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = this.db.collection("devices");
            if (yield this.deviceExists(id)) {
                global.logger.log(`Updating device with ID "%${id}"`);
                return yield collection.updateOne({ _id: id }, { host_id: hostId }).then((result) => {
                    return result.result.n === 1;
                });
            }
            else {
                global.logger.log(`Inserting device with ID "${id}"`);
                return yield collection.insertOne({ _id: id, host_id: hostId }).then((result) => {
                    return result.result.n === 1;
                });
            }
        });
    }
    deleteDevice(id) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log(`Removing device with ID "${id}"`);
            const collection = this.db.collection("devices");
            return yield collection.deleteOne({ _id: id }).then((result) => {
                return result.result.n === 1;
            });
        });
    }
    // endregion
    // region Printers
    getPrinters() {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log("Fetching all printers");
            const collection = this.db.collection("printers");
            return yield collection.find().toArray();
        });
    }
    getPrinter(id) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log("Fetching printer with ID " + id);
            const collection = this.db.collection("printers");
            return yield collection.findOne({ _id: id });
        });
    }
    deletePrinter(id) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log("Deleting printer with ID " + id);
            const collection = this.db.collection("printers");
            return yield collection.deleteOne({ _id: id });
        });
    }
    getPrintersForHost(hostId) {
        return __awaiter(this, void 0, void 0, function* () {
            const devicesCollection = this.db.collection("devices");
            const printersCollection = this.db.collection("printers");
            const devices = yield devicesCollection.find({ host_id: hostId }).toArray().then((devices) => {
                return devices.map((d) => d._id);
            });
            return yield printersCollection.find().toArray().then((printers) => {
                return printers.filter((p) => devices.indexOf(p._id) > -1);
            });
        });
    }
    updatePrinter(id, name, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = this.db.collection("printers");
            if (yield this.printerExists(id)) {
                global.logger.log(`Updating printer with ID "${id}"`);
                return collection.updateOne({ _id: id }, { name: name, type: type }).then((result) => {
                    return result.result.n === 1;
                });
            }
            else {
                global.logger.log(`Inserting printer with ID "${id}"`);
                return collection.insertOne({ _id: id, name: name, type: type }).then((result) => {
                    return result.result.n === 1;
                });
            }
        });
    }
    printerExists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log(`Checking if printer with ID "${id}" exists`);
            return (yield this.getPrinter(id)) !== null;
        });
    }
    // endregion
    // region Files
    getFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log("Fetching all files from database");
            const collection = this.db.collection("files");
            return yield collection.find().toArray();
        });
    }
    getFile(id) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log(`Fetching file with ID "${id}"`);
            const collection = this.db.collection("files");
            return yield collection.findOne({ _id: id });
        });
    }
    addFile(key, name) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log(`Adding file "${key}" (${name}) to database`);
            const collection = this.db.collection("files");
            return collection.insertOne({ _id: key, name: name, date_added: new Date() }).then((result) => {
                return result.ops[0];
            });
        });
    }
    deleteFile(id) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log("Deleting file with ID " + id);
            const collection = this.db.collection("files");
            return yield collection.deleteOne({ _id: id }).then((result) => {
                return result.result.n === 1;
            }).catch((error) => {
                global.logger.error(error);
                return false;
            });
        });
    }
    // endregion
    // region Prints
    getPrints() {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log("Fetching all prints");
            const collection = this.db.collection("prints");
            return yield collection.find().toArray();
        });
    }
    getPrint(id) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log("Fetching print with ID " + id);
            const collection = this.db.collection("prints");
            return yield collection.findOne({ _id: new mongodb_1.ObjectID(id) });
        });
    }
    addPrint(fileId, printerId, status = "pending", hostId = null) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log(`'Adding print for "${fileId}" on "${printerId}"'`);
            const collection = this.db.collection("prints");
            const file = yield this.getFile(fileId);
            const printer = yield this.getPrinter(printerId);
            return yield collection.insertOne({
                file_id: fileId,
                file_name: file.name,
                printer_id: printerId,
                printer_name: printer.name,
                created: new Date(),
                status: status,
                host_id: hostId
            }).then((result) => {
                return result.ops[0];
            });
        });
    }
    queuePrint(fileId, printerId) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log(`Queueing print for file "${fileId}" on printer "${printerId}"`);
            return yield this.addPrint(fileId, printerId, "queued");
        });
    }
    getNextQueuedPrint(printerId) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log(`Fetching next print for printer "${printerId}"`);
            const collection = this.db.collection("prints");
            return yield collection.find({ printer_id: printerId, status: "queued" }).sort({ created: 1 }).limit(1).next();
        });
    }
    setPrintPending(printId, hostId) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log(`Setting print "${printId}" as pending`);
            const collection = this.db.collection("prints");
            return yield collection.updateOne({ _id: new mongodb_1.ObjectID(printId) }, { $set: { status: "pending", host_id: hostId } });
        });
    }
    updatePrint(printId, status, description = null) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log(`Updating print "${printId}" to status "${status}"`);
            const collection = this.db.collection("prints");
            const data = {
                status: status,
                description: description
            };
            if (status === "running") {
                data["started"] = new Date();
            }
            if (["success", "error", "canceled"].indexOf(status) > -1) {
                data["completed"] = new Date();
            }
            const result = yield collection.updateOne({ _id: new mongodb_1.ObjectID(printId) }, { $set: data });
            data["_id"] = printId;
            return result;
        });
    }
    deletePrint(printId) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log(`Deleting print "${printId}"`);
            const collection = this.db.collection("prints");
            return yield collection.deleteOne({ _id: new mongodb_1.ObjectID(printId) });
        });
    }
    resetHostPrints(hostId) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log("Resetting printers for host " + hostId);
            const collection = this.db.collection("prints");
            yield collection.updateMany({
                host_id: hostId,
                $or: [
                    { status: "pending" },
                    { status: "downloading" },
                    { status: "running" },
                    { status: "canceling" }
                ]
            }, {
                $set: {
                    status: "error",
                    description: "Host lost power",
                    completed: new Date()
                }
            });
        });
    }
    // endregion
    // region Printer Types
    getPrinterTypes() {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log("Fetching all printer types");
            const collection = this.db.collection("printer_types");
            return yield collection.find().toArray();
        });
    }
    addPrinterType(name, driver) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log(`Adding new printer type with name "${name}"`);
            const collection = this.db.collection("printer_types");
            return yield collection.insertOne({ name: name, driver: driver });
        });
    }
    getPrinterType(id) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.log("Fetching all printer types");
            const collection = this.db.collection("printer_types");
            return yield collection.findOne({ _id: new mongodb_1.ObjectID(id) });
        });
    }
}
exports.DB = DB;
//# sourceMappingURL=db.js.map