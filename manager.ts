import { Request } from "express";
import { Server } from "http";
import { AWSHelper } from "./aws";
import { DB } from "./db";
import { Socket } from "./socket";

const UPLOADS_PREFIX = "uploads/";

export class Manager {
    private io: Socket;
    private db: DB;
    private aws: AWSHelper;

    public constructor(server: Server) {
        this.db = new DB();
        this.aws = new AWSHelper();
        this.io = new Socket(server, this.db);
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
}
