import { Db, MongoClient, ObjectID } from "mongodb";

const config = require("./config");

export class DB {
    public db: Db;

    public async connect() {
        global.logger.info(`Connecting to database at
                            ${config.DATABASE_URL}:${config.DATABASE_PORT}/${config.DATABASE_NAME}...`);

        this.db = await MongoClient.connect(
            "mongodb://" + config.DATABASE_URL + ":" + config.DATABASE_PORT + "/" + config.DATABASE_NAME
        );

        global.logger.info("Successfully connected.");
    }

    // region Hosts
    public async getHosts() {
        global.logger.log("Fetching all hosts");

        const collection = this.db.collection("hosts");

        return await await collection.find().toArray();
    }

    public async getHost(id) {
        global.logger.log(`Fetching host with ID "${id}"`);

        const collection = this.db.collection("hosts");

        return await collection.findOne({_id: id});
    }

    public async hostExists(id) {
        global.logger.log(`Checking if host with ID "${id}" exists`);

        return await this.getHost(id) !== null;
    }

    public async addHost(id) {
        global.logger.log("Adding host with ID " + id);

        const name = "Machine " + id;

        const collection = this.db.collection("hosts");

        return await collection.insertOne({_id: id, name: name}).then((result) => {
            return result.result.n === 1;
        });
    }

    public async deleteHost(id) {
        global.logger.log("Deleting host with ID " + id);

        const collection = this.db.collection("hosts");

        return await collection.deleteOne({_id: id});
    }

    public async updateHost(id, name) {
        global.logger.log("Updating host with ID " + id);

        const collection = this.db.collection("hosts");

        const data = {
            _id: id,
            name: name
        };

        const result =  await collection.updateOne({_id: id}, {$set: data});

        return result;
    }

    // endregion

    // region Devices
    public async getDevice(id) {
        global.logger.log(`Fetching device with ID "${id}"`);

        const collection = this.db.collection("devices");

        return await collection.findOne({_id: id});
    }

    public async getDevices() {
        global.logger.log("Fetching all devices");

        const collection = this.db.collection("devices");

        return await collection.find().toArray();
    }

    public async deviceExists(id) {
        global.logger.log(`Checking if device with ID "${id}" exists`);

        return await this.getDevice(id) !== null;
    }

    public async updateDevice(id, hostId) {
        const collection = this.db.collection("devices");

        if (await this.deviceExists(id)) {
            global.logger.log(`Updating device with ID "%${id}"`);

            return await collection.updateOne({_id: id}, {host_id: hostId}).then((result) => {
                return result.result.n === 1;
            });
        } else {
            global.logger.log(`Inserting device with ID "${id}"`);

            return await collection.insertOne({_id: id, host_id: hostId}).then((result) => {
                return result.result.n === 1;
            });
        }
    }

    public async deleteDevice(id) {
        global.logger.log(`Removing device with ID "${id}"`);

        const collection = this.db.collection("devices");

        return await collection.deleteOne({_id: id}).then((result) => {
            return result.result.n === 1;
        });
    }

    // endregion

    // region Printers
    public async getPrinters() {
        global.logger.log("Fetching all printers");

        const collection = this.db.collection("printers");

        return await collection.find().toArray();
    }

    public async getPrinter(id) {
        global.logger.log("Fetching printer with ID " + id);

        const collection = this.db.collection("printers");

        return await collection.findOne({_id: id});
    }

    public async deletePrinter(id) {
        global.logger.log("Deleting printer with ID " + id);

        const collection = this.db.collection("printers");

        return await collection.deleteOne({_id: id});
    }

    public async getPrintersForHost(hostId) {
        const devicesCollection = this.db.collection("devices");
        const printersCollection = this.db.collection("printers");

        const devices = await devicesCollection.find({host_id: hostId}).toArray().then((devices) => {
            return devices.map((d) => d._id);
        });

        return await printersCollection.find().toArray().then((printers) => {
            return printers.filter((p) => devices.indexOf(p._id) > -1);
        });
    }

    public async updatePrinter(id, name, type) {
        const collection = this.db.collection("printers");

        if (await this.printerExists(id)) {
            global.logger.log(`Updating printer with ID "${id}"`);

            return collection.updateOne({_id: id}, {name: name, type: type}).then((result) => {
                return result.result.n === 1;
            });
        } else {
            global.logger.log(`Inserting printer with ID "${id}"`);

            return collection.insertOne({_id: id, name: name, type: type}).then((result) => {
                return result.result.n === 1;
            });
        }
    }

    public async printerExists(id) {
        global.logger.log(`Checking if printer with ID "${id}" exists`);

        return await this.getPrinter(id) !== null;
    }

    // endregion

    // region Files
    public async getFiles() {
        global.logger.log("Fetching all files from database");

        const collection = this.db.collection("files");

        return await collection.find().toArray();
    }

    public async getFile(id) {
        global.logger.log(`Fetching file with ID "${id}"`);

        const collection = this.db.collection("files");

        return await collection.findOne({_id: id});
    }

    public async addFile(key, name) {
        global.logger.log(`Adding file "${key}" (${name}) to database`);

        const collection = this.db.collection("files");

        return collection.insertOne({_id: key, name: name, date_added: new Date()}).then((result) => {
            return result.ops[0];
        });
    }

    public async deleteFile(id) {
        global.logger.log("Deleting file with ID " + id);

        const collection = this.db.collection("files");

        return await collection.deleteOne({_id: id}).then((result) => {
            return result.result.n === 1;
        }).catch((error) => {
            global.logger.error(error);
            return false;
        });
    }

    // endregion

    // region Prints
    public async getPrints() {
        global.logger.log("Fetching all prints");

        const collection = this.db.collection("prints");

        return await collection.find().toArray();
    }

    public async getPrint(id) {
        global.logger.log("Fetching print with ID " + id);

        const collection = this.db.collection("prints");

        return await collection.findOne({_id: new ObjectID(id)});
    }

    public async addPrint(fileId, printerId, status = "pending", hostId = null) {
        global.logger.log(`'Adding print for "${fileId}" on "${printerId}"'`);

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
        global.logger.log(`Queueing print for file "${fileId}" on printer "${printerId}"`);

        return await this.addPrint(fileId, printerId, "queued");
    }

    public async getNextQueuedPrint(printerId) {
        global.logger.log(`Fetching next print for printer "${printerId}"`);

        const collection = this.db.collection("prints");

        return await collection.find({printer_id: printerId, status: "queued"}).sort({created: 1}).limit(1).next();
    }

    public async setPrintPending(printId, hostId) {
        global.logger.log(`Setting print "${printId}" as pending`);

        const collection = this.db.collection("prints");

        return await collection.updateOne({_id: new ObjectID(printId)}, {$set: {status: "pending", host_id: hostId}});
    }

    public async updatePrint(printId, status, description = null) {
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

        const result = await collection.updateOne({_id: new ObjectID(printId)}, {$set: data});

        data["_id"] = printId;

        return result;
    }

    public async deletePrint(printId) {
        global.logger.log(`Deleting print "${printId}"`);

        const collection = this.db.collection("prints");

        return await collection.deleteOne({_id: new ObjectID(printId)});
    }

    public async resetHostPrints(hostId) {
        global.logger.log("Resetting printers for host " + hostId);

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
        global.logger.log("Fetching all printer types");

        const collection = this.db.collection("printer_types");

        return await collection.find().toArray();
    }

    public async addPrinterType(name, driver) {
        global.logger.log(`Adding new printer type with name "${name}"`);

        const collection = this.db.collection("printer_types");

        return await collection.insertOne({name: name, driver: driver});
    }

    public async getPrinterType(id) {
        global.logger.log("Fetching all printer types");

        const collection = this.db.collection("printer_types");

        return await collection.findOne({_id: new ObjectID(id)});
    }
    // endregion
}
