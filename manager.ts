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
        this.io = new Socket(server, this.db);
    }

    public async getHosts() {
        return await this.db.getHosts();
    }

    public async addHost(id) {
        const host = await this.db.addHost(id);

        this.io.emitToUsers("host-added", host);

        return host;
    }

    public async updateHost(id, name) {
        const host = await this.db.updateHost(id, name);

        this.io.emitToUsers("host-updated", host);

        return host;
    }

    public async deleteHost(id) {
        await this.db.deleteHost(id);

        this.io.emitToUsers("host-deleted", id);
    }
}
