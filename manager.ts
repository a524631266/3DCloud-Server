import { Request } from "express";
import { Server } from "http";
import { AWSHelper } from "./aws";
import { DB } from "./db";
import { Logger } from "./logger";
import { IColor, IMaterialVariant } from "./schemas/material";
import { IPrint } from "./schemas/print";
import { Socket } from "./socket";

export class Manager {
    private io: Socket;
    private db: DB;
    private aws: AWSHelper;

    public constructor(server: Server) {
        this.db = new DB();
        this.aws = new AWSHelper();
        this.io = new Socket(server, this);
    }

    public async init() {
        await this.db.connect();
    }

    // region Devices

    public async getDevices() {
        return await this.db.getDevices();
    }

    public async getDevice(id: string) {
        return await this.db.getDevice(id);
    }

    public async updateDevice(id: string, hostId: string) {
        return await this.db.updateDevice(id, hostId);
    }

    public async deleteDevice(id: string) {
        return await this.db.deleteDevice(id);
    }

    // endregion

    // region Files

    public async getFiles() {
        return this.db.getFiles();
    }

    public async uploadFile(key: string, name: string, req: Request) {
        await this.aws.uploadFile(key, req);
        return this.db.addFile(key, name);
    }

    public async getFile(id: string) {
        return this.db.getFile(id);
    }

    public async deleteFile(id: string) {
        return this.db.deleteFile(id);
    }

    public async getPresignedDownloadUrl(id: string) {
        const file = await this.db.getFile(id);
        return this.aws.getPresignedDownloadUrl(file._id, file.name);
    }

    // endregion

    // region Hosts

    public async getHosts() {
        return await this.db.getHosts();
    }

    public async getHost(id: string) {
        return await this.db.getHost(id);
    }

    public async hostExists(id: string) {
        return await this.db.hostExists(id);
    }

    public async addHost(id: string) {
        const host = await this.db.addHost(id);

        this.io.emitToUsers("host-added", host);

        return host;
    }

    public async updateHost(id: string, name: string) {
        const host = await this.db.updateHost(id, name);

        this.io.emitToUsers("host-updated", host);

        return host;
    }

    public async deleteHost(id: string) {
        await this.db.deleteHost(id);

        this.io.emitToUsers("host-deleted", id);
    }

    // endregion

    // region Prints

    public async getPrints() {
        return this.db.getPrints();
    }

    public async getPrint(id: string) {
        return this.db.getPrint(id);
    }

    public async deletePrint(id: string) {
        const result = await this.db.deletePrint(id);

        this.io.emitToUsers("delete-print", id);

        return result;
    }

    public async setPrintPending(id: string, hostId: string) {
        const result = await this.db.setPrintPending(id, hostId);

        this.io.emitToUsers("set-print-pending", id, hostId);

        return result;
    }

    public async updatePrint(id: string, status: string, description: any = null) {
        const print: IPrint = await this.db.updatePrint(id, status, description);

        this.io.emitToUsers("update-print", print);

        return print;
    }

    public async resetHostPrints(hostId: string) {
        return this.db.resetHostPrints(hostId);
    }

    // endregion

    // region Printers

    public async getPrinters() {
        return await this.db.getPrinters();
    }

    public async getPrinter(id: string) {
        return this.db.getPrinter(id);
    }

    public async printerExists(id: string) {
        return this.db.printerExists(id);
    }

    public async deletePrinter(id: string) {
        return this.db.deletePrinter(id);
    }

    public async updatePrinter(id: string, name: string, typeId: string) {
        const device = await this.db.getDevice(id);
        const type = await this.db.getPrinterType(typeId);
        const host = await this.db.getHost(device.host);

        const printer = await this.db.updatePrinter(id, name, typeId);

        // check if device exists and is currently connected
        if (device && this.io.hostIsConnected(host._id)) {
            // emit device update
            this.io.getHost(host._id).emit("printer_updated", { device_id: id, driver: type.driver }, (data) => {
                if (!data.success && data.error.type !== "PrinterOfflineError") {
                    throw new Error(data.error.message);
                }
            });
        } else {
            Logger.log("Printer is not currently connected, omitting printer update emit");
        }

        return printer;
    }

    public async nextPrint(printerId) {
        const device = await this.db.getDevice(printerId);
        const host = await this.db.getHost(device.host);

        if (!this.io.hostIsConnected(host._id)) {
            throw new Error("Host not connected");
        }

        const print = await this.db.getNextQueuedPrint(printerId);

        if (!print) {
            throw new Error("No prints in queue");
        }

        await this.setPrintPending(print._id.toHexString(), host._id);

        this.io.getHost(host._id).emit("print", {
            printer_id: printerId,
            print_id: print._id,
            key: print.file_id,
            name: print.file_name
        }, async (data) => {
            if (!data.success) {
                if (data.error && data.error.message) {
                    await this.updatePrint(print._id.toHexString(), "error", data.error.message);
                    throw new Error("Failed to start print: " + data.error.message);
                } else {
                    await this.updatePrint(print._id.toHexString(), "error");
                    throw new Error("Failed to start print");
                }
            }
        });
    }

    public async pausePrint(printerId: string) {
        const device = await this.db.getDevice(printerId);
        const host = await this.db.getHost(device.host);

        if (device) {
            if (this.io.hostIsConnected(host._id)) {
                this.io.getHost(host._id).emit("pause", {printer_id: printerId}, (data) => {
                    if (!data.success) {
                        throw new Error(data.error.message);
                    }
                });
            } else {
                throw new Error("Host is not connected");
            }
        } else {
            throw new Error("Device not found");
        }
    }

    public async unpausePrint(printerId: string) {
        const device = await this.db.getDevice(printerId);
        const host = await this.db.getHost(device.host);

        if (device) {
            if (this.io.hostIsConnected(host._id)) {
                this.io.getHost(host._id).emit("unpause", {printer_id: printerId}, (data) => {
                    if (!data.success) {
                        throw new Error(data.error.message);
                    }
                });
            } else {
                throw new Error("Host is not connected");
            }
        } else {
            throw new Error("Device not found");
        }
    }

    public async queuePrint(printerId: string, fileId: string) {
        const file = await this.db.getFile(fileId);

        if (!file) {
            throw new Error("File not found");
        }

        return await this.db.queuePrint(fileId, printerId);
    }

    public async startPrint(printerId: string, fileId: string) {
        const device = await this.db.getDevice(printerId);
        const file = await this.db.getFile(fileId);
        const host = await this.db.getHost(device.host);

        if (!device) {
            throw new Error(`Device "${printerId}" not found`);
        }

        if (!file) {
            throw new Error(`File "${fileId}" not found`);
        }

        if (host) {
            if (this.io.hostIsConnected(host._id)) {
                const print = await this.db.addPrint(fileId, printerId, "pending", host._id);

                return new Promise((resolve, reject) => {
                    this.io.getHost(host._id).emit("print", {
                        printer_id: printerId,
                        print_id: print._id,
                        key: file._id,
                        name: file.name
                    }, async (data) => {
                        if (data.success) {
                            resolve(print);
                        } else if (data.error && data.error.message) {
                            await this.updatePrint(print._id.toHexString(), "error", data.error.message);
                            reject(data.error.message);
                        } else {
                            await this.updatePrint(print._id.toHexString(), "error", "Unknown error");
                            reject("Failed to start print");
                        }
                    });
                });
            } else {
                throw new Error("Host is not connected.");
            }
        } else {
            throw new Error("Host does not exist");
        }
    }

    public async cancelPrint(printerId: string) {
        const device = await this.getDevice(printerId);
        const host = await this.getHost(device.host);

        if (device) {
            if (this.io.hostIsConnected(host._id)) {
                this.io.getHost(host._id).emit("cancel", {printer_id: printerId}, (data) => {
                    if (!data.success) {
                        throw new Error(data.error.message);
                    }
                });
            } else {
                throw new Error("Host is not connected");
            }
        } else {
            throw new Error("Device not found");
        }
    }

    // endregion

    // region Printer Types

    public async getPrinterTypes() {
        return await this.db.getPrinterTypes();
    }

    public async getPrinterType(id: string) {
        return await this.db.getPrinterType(id);
    }

    public async addPrinterType(name: string, driver: string) {
        return await this.db.addPrinterType(name, driver);
    }

    // endregion

    // region Materials

    public async getMaterials() {
        return await this.db.getMaterials();
    }

    public async getMaterial(id: string) {
        return await this.db.getMaterial(id);
    }

    public async addMaterial(name: string, brand: string, variants: IMaterialVariant[]) {
        return await this.db.addMaterial(name, brand, variants);
    }

    public async addMaterialVariant(materialId: string, name: string, color: IColor) {
        return await this.db.addMaterialVariant(materialId, name, color);
    }

    public async updateMaterial(id: string, name: string, brand: string, variants: IMaterialVariant[]) {
        return await this.db.updateMaterial(id, name, brand, variants);
    }

    public async deleteMaterial(id: string) {
        return await this.db.deleteMaterial(id);
    }

    // endregion
}
