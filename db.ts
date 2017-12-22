import { Db, MongoClient, ObjectID } from "mongodb";
import { Logger } from "./logger";

const config = require("./config");

export class DB {
    public db: Db;

    public async connect() {
        Logger.info(`Connecting to database at
                            ${config.DATABASE_URL}:${config.DATABASE_PORT}/${config.DATABASE_NAME}...`);

        this.db = await MongoClient.connect(
            "mongodb://" + config.DATABASE_URL + ":" + config.DATABASE_PORT + "/" + config.DATABASE_NAME
        );

        Logger.info("Successfully connected.");
    }

    // region Hosts
    public async getHosts() {
        Logger.log("Fetching all hosts");

        const collection = this.db.collection("hosts");

        return await await collection.find().toArray();
    }

    public async getHost(id) {
        Logger.log(`Fetching host with ID "${id}"`);

        const collection = this.db.collection("hosts");

        return await collection.findOne({_id: id});
    }

    public async hostExists(id) {
        Logger.log(`Checking if host with ID "${id}" exists`);

        return await this.getHost(id) !== null;
    }

    public async addHost(id) {
        Logger.log("Adding host with ID " + id);

        const name = "Machine " + id;

        const collection = this.db.collection("hosts");

        return await collection.insertOne({_id: id, name: name}).then((result) => {
            return result.result.n === 1;
        });
    }

    public async deleteHost(id) {
        Logger.log("Deleting host with ID " + id);

        const collection = this.db.collection("hosts");

        return await collection.deleteOne({_id: id});
    }

    public async updateHost(id, name) {
        Logger.log("Updating host with ID " + id);

        const collection = this.db.collection("hosts");

        const data = {
            _id: id,
            name: name
        };

        return await collection.updateOne({_id: id}, {$set: data});
    }

    // endregion

    // region Devices
    public async getDevice(id) {
        Logger.log(`Fetching device with ID "${id}"`);

        const collection = this.db.collection("devices");

        return await collection.findOne({_id: id});
    }

    public async getDevices() {
        Logger.log("Fetching all devices");

        const collection = this.db.collection("devices");

        return await collection.find().toArray();
    }

    public async deviceExists(id) {
        Logger.log(`Checking if device with ID "${id}" exists`);

        return await this.getDevice(id) !== null;
    }

    public async updateDevice(id, hostId) {
        const collection = this.db.collection("devices");

        if (await this.deviceExists(id)) {
            Logger.log(`Updating device with ID "%${id}"`);

            return await collection.updateOne({_id: id}, {host_id: hostId}).then((result) => {
                return result.result.n === 1;
            });
        } else {
            Logger.log(`Inserting device with ID "${id}"`);

            return await collection.insertOne({_id: id, host_id: hostId}).then((result) => {
                return result.result.n === 1;
            });
        }
    }

    public async deleteDevice(id) {
        Logger.log(`Removing device with ID "${id}"`);

        const collection = this.db.collection("devices");

        return await collection.deleteOne({_id: id}).then((result) => {
            return result.result.n === 1;
        });
    }

    // endregion

    // region Printers
    public async getPrinters() {
        Logger.log("Fetching all printers");

        const collection = this.db.collection("printers");

        return await collection.find().toArray();
    }

    public async getPrinter(id) {
        Logger.log("Fetching printer with ID " + id);

        const collection = this.db.collection("printers");

        return await collection.findOne({_id: id});
    }

    public async deletePrinter(id) {
        Logger.log("Deleting printer with ID " + id);

        const collection = this.db.collection("printers");

        return await collection.deleteOne({_id: id});
    }

    public async updatePrinter(id, name, type) {
        const collection = this.db.collection("printers");

        if (await this.printerExists(id)) {
            Logger.log(`Updating printer with ID "${id}"`);

            return collection.updateOne({_id: id}, {name: name, type: type}).then((result) => {
                return result.result.n === 1;
            });
        } else {
            Logger.log(`Inserting printer with ID "${id}"`);

            return collection.insertOne({_id: id, name: name, type: type}).then((result) => {
                return result.result.n === 1;
            });
        }
    }

    public async printerExists(id) {
        Logger.log(`Checking if printer with ID "${id}" exists`);

        return await this.getPrinter(id) !== null;
    }

    // endregion

    // region Files
    public async getFiles() {
        Logger.log("Fetching all files from database");

        const collection = this.db.collection("files");

        return await collection.find().toArray();
    }

    public async getFile(id) {
        Logger.log(`Fetching file with ID "${id}"`);

        const collection = this.db.collection("files");

        return await collection.findOne({_id: id});
    }

    public async addFile(key, name) {
        Logger.log(`Adding file "${key}" (${name}) to database`);

        const collection = this.db.collection("files");

        return collection.insertOne({_id: key, name: name, date_added: new Date()}).then((result) => {
            return result.ops[0];
        });
    }

    public async deleteFile(id) {
        Logger.log("Deleting file with ID " + id);

        const collection = this.db.collection("files");

        return await collection.deleteOne({_id: id}).then((result) => {
            return result.result.n === 1;
        }).catch((error) => {
            Logger.error(error);
            return false;
        });
    }

    // endregion

    // region Prints
    public async getPrints() {
        Logger.log("Fetching all prints");

        const collection = this.db.collection("prints");

        return await collection.find().toArray();
    }

    public async getPrint(id) {
        Logger.log("Fetching print with ID " + id);

        const collection = this.db.collection("prints");

        return await collection.findOne({_id: new ObjectID(id)});
    }

    public async addPrint(fileId, printerId, status = "pending", hostId = null) {
        Logger.log(`'Adding print for "${fileId}" on "${printerId}"'`);

        const collection = this.db.collection("prints");

        const file = await this.getFile(fileId);
        const printer = await this.getPrinter(printerId);

        return await collection.insertOne({
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
    }

    public async queuePrint(fileId, printerId) {
        Logger.log(`Queueing print for file "${fileId}" on printer "${printerId}"`);

        return await this.addPrint(fileId, printerId, "queued");
    }

    public async getNextQueuedPrint(printerId) {
        Logger.log(`Fetching next print for printer "${printerId}"`);

        const collection = this.db.collection("prints");

        return await collection.find({printer_id: printerId, status: "queued"}).sort({created: 1}).limit(1).next();
    }

    public async setPrintPending(printId, hostId) {
        Logger.log(`Setting print "${printId}" as pending`);

        const collection = this.db.collection("prints");

        return await collection.updateOne({_id: new ObjectID(printId)}, {$set: {status: "pending", host_id: hostId}});
    }

    public async updatePrint(printId, status, description = null) {
        Logger.log(`Updating print "${printId}" to status "${status}"`);

        const collection = this.db.collection("prints");

        const data: { [id: string]: any } = {
            status: status,
            description: description
        };

        if (status === "running") {
            data.started = new Date();
        }

        if (["success", "error", "canceled"].indexOf(status) > -1) {
            data.completed = new Date();
        }

        const result = await collection.updateOne({_id: new ObjectID(printId)}, {$set: data});

        data._id = printId;

        return result;
    }

    public async deletePrint(printId) {
        Logger.log(`Deleting print "${printId}"`);

        const collection = this.db.collection("prints");

        return await collection.deleteOne({_id: new ObjectID(printId)});
    }

    public async resetHostPrints(hostId) {
        Logger.log("Resetting printers for host " + hostId);

        const collection = this.db.collection("prints");

        await collection.updateMany(
            {
                host_id: hostId,
                $or: [
                    {status: "pending"},
                    {status: "downloading"},
                    {status: "running"},
                    {status: "canceling"}
                ]
            }, {
                $set: {
                    status: "error",
                    description: "Host lost power",
                    completed: new Date()
                }
            }
        );
    }

    // endregion

    // region Printer Types
    public async getPrinterTypes() {
        Logger.log("Fetching all printer types");

        const collection = this.db.collection("printer_types");

        return await collection.find().toArray();
    }

    public async addPrinterType(name, driver) {
        Logger.log(`Adding new printer type with name "${name}"`);

        const collection = this.db.collection("printer_types");

        return await collection.insertOne({name: name, driver: driver});
    }

    public async getPrinterType(id) {
        Logger.log("Fetching all printer types");

        const collection = this.db.collection("printer_types");

        return await collection.findOne({_id: new ObjectID(id)});
    }
    // endregion
}
