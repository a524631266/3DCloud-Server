import * as mongoose from "mongoose";
import { Connection, Types } from "mongoose";
import { Config } from "./config";
import { Logger } from "./logger";
import Device from "./schemas/device";
import File from "./schemas/file";
import Host from "./schemas/host";
import {IColor, IMaterialVariant, Material} from "./schemas/material";
import Print from "./schemas/print";
import Printer from "./schemas/printer";
import PrinterType from "./schemas/printer-type";

export class DB {
    private static db: Connection;

    public static async connect() {
        const host = Config.get("db.host", "127.0.0.1");
        const port = Config.get("db.port", 27017);
        const name = Config.get("db.database_name", "3dcloud");

        const uri = `mongodb://${host}:${port}/${name}`;

        Logger.info(`Connecting to database at ${uri}...`);

        await mongoose.connect(uri);

        this.db = mongoose.connection;
    }

    // region Hosts
    public static async getHosts() {
        Logger.log("Fetching all hosts");

        return await Host.find();
    }

    public static async getHost(id) {
        Logger.log(`Fetching host with ID "${id}"`);

        return await Host.findById(id);
    }

    public static async hostExists(id) {
        Logger.log(`Checking if host with ID "${id}" exists`);

        return await this.getHost(id) !== null;
    }

    public static async addHost(id) {
        Logger.log("Adding host with ID " + id);

        const name = "Machine " + id;

        const host = new Host({"_id": id, "name": name});

        await host.save();

        return host;
    }

    public static async deleteHost(id) {
        Logger.log("Deleting host with ID " + id);

        await Host.findOne({"_id": id}, async (err, document) => {
            await document.remove();
        });
    }

    public static async updateHost(id, name) {
        Logger.log("Updating host with ID " + id);

        return await Host.findById(id, { "$set": { "name": name } }, {"new": true}, async (err, host) => {
            await host.remove();
        });
    }

    // endregion

    // region Devices
    public static async getDevice(id) {
        Logger.log(`Fetching device with ID "${id}"`);

        return await Device.findById(id);
    }

    public static async getDevices() {
        Logger.log("Fetching all devices");

        return await Device.find();
    }

    public static async deviceExists(id) {
        Logger.log(`Checking if device with ID "${id}" exists`);

        return await this.getDevice(id) !== null;
    }

    public static async updateDevice(id, hostId) {
        if (await this.deviceExists(id)) {
            Logger.log(`Updating device with ID "%${id}"`);

            return await Device.findByIdAndUpdate(id, { "$set": { "host": hostId } }, {"new": true});
        } else {
            Logger.log(`Inserting device with ID "${id}"`);

            const device = new Device({"_id": id, "host": hostId});

            await device.save();

            return device;
        }
    }

    public static async deleteDevice(id) {
        Logger.log(`Removing device with ID "${id}"`);

        return await Device.findByIdAndRemove(id);
    }

    // endregion

    // region Printers
    public static async getPrinters() {
        Logger.log("Fetching all printers");

        return await Printer.find();
    }

    public static async getPrinter(id) {
        Logger.log("Fetching printer with ID " + id);

        return await Printer.findById(id);
    }

    public static async printerExists(id) {
        Logger.log(`Checking if printer with ID "${id}" exists`);

        return await this.getPrinter(id) !== null;
    }

    public static async updatePrinter(id, name, type) {
        if (await this.printerExists(id)) {
            Logger.log(`Updating printer with ID "${id}"`);

            return await Printer.findByIdAndUpdate(id, { "$set": { "name": name, "type": type } }, {"new": true});
        } else {
            Logger.log(`Inserting printer with ID "${id}"`);

            const printer = new Printer({"_id": id, "name": name, "type": type, "device": id});

            await printer.save();

            return await Printer.findById(id);
        }
    }

    public static async deletePrinter(id) {
        Logger.log("Deleting printer with ID " + id);

        return await Printer.findByIdAndRemove(id);
    }
    // endregion

    // region Files
    public static async getFiles() {
        Logger.log("Fetching all files from database");

        return await File.find();
    }

    public static async getFile(id) {
        Logger.log(`Fetching file with ID "${id}"`);

        return await File.findById(id);
    }

    public static async addFile(id, name) {
        Logger.log(`Adding file "${id}" (${name}) to database`);

        const file = new File({"_id": id, "name": name, "date_added": new Date()});

        await file.save();

        return file;
    }

    public static async deleteFile(id) {
        Logger.log("Deleting file with ID " + id);

        return await File.findByIdAndRemove(id);
    }

    // endregion

    // region Prints
    public static async getPrints() {
        Logger.log("Fetching all prints");

        const collection = this.db.collection("prints");

        return await collection.find().toArray();
    }

    public static async getPrint(id) {
        Logger.log("Fetching print with ID " + id);

        const collection = this.db.collection("prints");

        return await collection.findOne({"_id": new Types.ObjectId(id)});
    }

    public static async addPrint(fileId, printerId, status = "pending", hostId = null) {
        Logger.log(`'Adding print for "${fileId}" on "${printerId}"'`);

        const file = await this.getFile(fileId);
        const printer = await this.getPrinter(printerId);

        const print = new Print({
            "file_id": fileId,
            "file_name": file.name,
            "printer_id": printerId,
            "printer_name": printer.name,
            "created": new Date(),
            "status": status,
            "host_id": hostId,
            "timestamp": Date.now() * 1000
        });

        await print.save();

        return print;
    }

    public static async queuePrint(fileId, printerId) {
        Logger.log(`Queueing print for file "${fileId}" on printer "${printerId}"`);

        return await this.addPrint(fileId, printerId, "queued");
    }

    public static async getNextQueuedPrint(printerId) {
        Logger.log(`Fetching next print for printer "${printerId}"`);

        return await Print.findOne({"printer_id": printerId, "status": "queued"}).sort({"created": 1}).limit(1).exec();
    }

    public static async setPrintPending(printId, hostId) {
        Logger.log(`Setting print "${printId}" as pending`);

        return await Print.findByIdAndUpdate(
            new Types.ObjectId(printId),
            {"$set": {"status": "pending", "host_id": hostId, "timestamp": Date.now()}},
            {"new": true}
        );
    }

    public static async updatePrint(printId, status, description = null) {
        Logger.log(`Updating print "${printId}" to status "${status}"`);

        const print = await Print.findById(new Types.ObjectId(printId));

        print.status = status;
        print.description = description;

        if (status === "running") {
            print.started = new Date();
        }

        if (["success", "error", "canceled"].indexOf(status) > -1) {
            print.completed = new Date();
        }

        print.save();

        return print;
    }

    public static async deletePrint(printId) {
        Logger.log(`Deleting print "${printId}"`);

        Print.findByIdAndRemove(new Types.ObjectId(printId));
    }

    public static async resetHostPrints(hostId) {
        Logger.log("Resetting printers for host " + hostId);

        await Print.updateMany({
            "host_id": hostId,
            "$or": [
                {"status": "pending"},
                {"status": "downloading"},
                {"status": "running"},
                {"status": "canceling"}
            ]
        }, {
            "$set": {
                "status": "error",
                "description": "Host lost power",
                "completed": new Date()
            }
        });
    }

    // endregion

    // region Printer Types
    public static async getPrinterTypes() {
        Logger.log("Fetching all printer types");

        return await PrinterType.find();
    }

    public static async getPrinterType(id) {
        Logger.log("Fetching all printer types");

        return await PrinterType.findById(Types.ObjectId(id));
    }

    public static async addPrinterType(name, driver) {
        Logger.log(`Adding new printer type with name "${name}"`);

        const printerType = new PrinterType({"name": name, "driver": driver});

        await printerType.save();

        return printerType;
    }
    // endregion

    // region Materials

    public static async getMaterials() {
        return await Material.find();
    }

    public static async getMaterial(id: string) {
        return await Material.findById(Types.ObjectId(id));
    }

    public static async addMaterial(name: string, brand: string, variants: IMaterialVariant[]) {
        const material = new Material({"name": name, "brand": brand, "variants": variants});

        await material.save();

        return material;
    }

    public static async addMaterialVariant(materialId: string, name: string, color: IColor): Promise<IMaterialVariant> {
        const variant = {"_id": new Types.ObjectId(), "name": name, "color": color};

        await Material.findByIdAndUpdate(
            materialId,
            {"$push": {"variants": variant}}
        );

        return variant;
    }

    public static async updateMaterial(id: string, name: string, brand: string, variants: IMaterialVariant[]) {
        return await Material.findByIdAndUpdate(
            id,
            {"$set": {"_id": id, "name": name, "brand": brand, "variants": variants}},
            {"new": true}
        );
    }

    public static async deleteMaterial(id: string) {
        return await Material.findByIdAndRemove(Types.ObjectId(id));
    }

    // endregion
}
