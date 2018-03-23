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
    public db: Connection;

    public async connect() {
        Logger.info("Connecting to database at" +
            `${Config.DATABASE_URL}:${Config.DATABASE_PORT}/${Config.DATABASE_NAME}...`);

        return new Promise((resolve, reject) => {
            mongoose.connect(
                "mongodb://" + Config.DATABASE_URL + ":" + Config.DATABASE_PORT + "/" + Config.DATABASE_NAME
            );

            this.db = mongoose.connection;

            this.db.on("error", (error) => {
                Logger.error(error);
                reject(error);
            });

            this.db.once("open", () => {
                Logger.info("Successfully connected.");

                resolve();
            });
        });
    }

    // region Hosts
    public async getHosts() {
        Logger.log("Fetching all hosts");

        return await Host.find();
    }

    public async getHost(id) {
        Logger.log(`Fetching host with ID "${id}"`);

        return await Host.findById(id);
    }

    public async hostExists(id) {
        Logger.log(`Checking if host with ID "${id}" exists`);

        return await this.getHost(id) !== null;
    }

    public async addHost(id) {
        Logger.log("Adding host with ID " + id);

        const name = "Machine " + id;

        const host = new Host({_id: id, name: name});

        await host.save();

        return host;
    }

    public async deleteHost(id) {
        Logger.log("Deleting host with ID " + id);

        await Host.deleteOne({_id: id});
    }

    public async updateHost(id, name) {
        Logger.log("Updating host with ID " + id);

        return await Host.findByIdAndUpdate(id, { $set: { name: name } }, {new: true});
    }

    // endregion

    // region Devices
    public async getDevice(id) {
        Logger.log(`Fetching device with ID "${id}"`);

        return await Device.findById(id).populate("host");
    }

    public async getDevices() {
        Logger.log("Fetching all devices");

        return await Device.find().populate("host");
    }

    public async deviceExists(id) {
        Logger.log(`Checking if device with ID "${id}" exists`);

        return await this.getDevice(id) !== null;
    }

    public async updateDevice(id, hostId) {
        if (await this.deviceExists(id)) {
            Logger.log(`Updating device with ID "%${id}"`);

            return await Device.findByIdAndUpdate(id, { $set: { host: hostId } }, {new: true});
        } else {
            Logger.log(`Inserting device with ID "${id}"`);

            const device = new Device({_id: id, host: hostId});

            await device.save();

            return device;
        }
    }

    public async deleteDevice(id) {
        Logger.log(`Removing device with ID "${id}"`);

        return await Device.findByIdAndRemove(id);
    }

    // endregion

    // region Printers
    public async getPrinters() {
        Logger.log("Fetching all printers");

        return await Printer.find().populate("device").populate("type");
    }

    public async getPrinter(id) {
        Logger.log("Fetching printer with ID " + id);

        return await Printer.findById(id).populate("device").populate("type");
    }

    public async printerExists(id) {
        Logger.log(`Checking if printer with ID "${id}" exists`);

        return await this.getPrinter(id) !== null;
    }

    public async updatePrinter(id, name, type) {
        if (await this.printerExists(id)) {
            Logger.log(`Updating printer with ID "${id}"`);

            return await Printer.findByIdAndUpdate(id, { $set: { name: name, type: type } }, {new: true}).populate("device").populate("type").exec();
        } else {
            Logger.log(`Inserting printer with ID "${id}"`);

            const printer = new Printer({_id: id, name: name, type: type, device: id});

            await printer.save();

            return await Printer.findById(id).populate("device").populate("type").exec();
        }
    }

    public async deletePrinter(id) {
        Logger.log("Deleting printer with ID " + id);

        return await Printer.findByIdAndRemove(id);
    }
    // endregion

    // region Files
    public async getFiles() {
        Logger.log("Fetching all files from database");

        return await File.find();
    }

    public async getFile(id) {
        Logger.log(`Fetching file with ID "${id}"`);

        return await File.findById(id);
    }

    public async addFile(id, name) {
        Logger.log(`Adding file "${id}" (${name}) to database`);

        const file = new File({_id: id, name: name, date_added: new Date()});

        await file.save();

        return file;
    }

    public async deleteFile(id) {
        Logger.log("Deleting file with ID " + id);

        return await File.findByIdAndRemove(id);
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

        return await collection.findOne({_id: new Types.ObjectId(id)});
    }

    public async addPrint(fileId, printerId, status = "pending", hostId = null) {
        Logger.log(`'Adding print for "${fileId}" on "${printerId}"'`);

        const file = await this.getFile(fileId);
        const printer = await this.getPrinter(printerId);

        const print = new Print({
            file_id: fileId,
            file_name: file.name,
            printer_id: printerId,
            printer_name: printer.name,
            created: new Date(),
            status: status,
            host_id: hostId
        });

        await print.save();

        return print;
    }

    public async queuePrint(fileId, printerId) {
        Logger.log(`Queueing print for file "${fileId}" on printer "${printerId}"`);

        return await this.addPrint(fileId, printerId, "queued");
    }

    public async getNextQueuedPrint(printerId) {
        Logger.log(`Fetching next print for printer "${printerId}"`);

        return await Print.findOne({printer_id: printerId, status: "queued"}).sort({created: 1}).limit(1).exec();
    }

    public async setPrintPending(printId, hostId) {
        Logger.log(`Setting print "${printId}" as pending`);

        return await Print.findByIdAndUpdate(
            new Types.ObjectId(printId),
            {$set: {status: "pending", host_id: hostId}},
            {new: true}
        );
    }

    public async updatePrint(printId, status, description = null) {
        Logger.log(`Updating print "${printId}" to status "${status}"`);

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

        return await Print.findByIdAndUpdate(new Types.ObjectId(printId), {$set: data}, {new: true});
    }

    public async deletePrint(printId) {
        Logger.log(`Deleting print "${printId}"`);

        Print.findByIdAndRemove(new Types.ObjectId(printId));
    }

    public async resetHostPrints(hostId) {
        Logger.log("Resetting printers for host " + hostId);

        await Print.updateMany({
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
        });
    }

    // endregion

    // region Printer Types
    public async getPrinterTypes() {
        Logger.log("Fetching all printer types");

        return await PrinterType.find();
    }

    public async getPrinterType(id) {
        Logger.log("Fetching all printer types");

        return await PrinterType.findById(Types.ObjectId(id));
    }

    public async addPrinterType(name, driver) {
        Logger.log(`Adding new printer type with name "${name}"`);

        const printerType = new PrinterType({name: name, driver: driver});

        await printerType.save();

        return printerType;
    }
    // endregion

    // region Materials

    public async getMaterials() {
        return await Material.find();
    }

    public async getMaterial(id: string) {
        return await Material.findById(Types.ObjectId(id));
    }

    public async addMaterial(name: string, brand: string, variants: IMaterialVariant[]) {
        const material = new Material({name: name, brand: brand, variants: variants});

        await material.save();

        return material;
    }

    public async addMaterialVariant(materialId: string, name: string, color: IColor): Promise<IMaterialVariant> {
        const variant = {_id: new Types.ObjectId(), name: name, color: color};

        await Material.findByIdAndUpdate(
            materialId,
            {$push: {variants: variant}}
        );

        return variant;
    }

    public async updateMaterial(id: string, name: string, brand: string, variants: IMaterialVariant[]) {
        return await Material.findByIdAndUpdate(
            id,
            {$set: {_id: id, name: name, brand: brand, variants: variants}},
            {new: true}
        );
    }

    public async deleteMaterial(id: string) {
        return await Material.findByIdAndRemove(Types.ObjectId(id));
    }

    // endregion
}
