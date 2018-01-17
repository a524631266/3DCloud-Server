import * as express from "express";
import * as uniqid from "uniqid";
import { ApiEndpoint } from "../api-endpoint";
import { ApiEndpointCollection } from "../api-endpoint-collection";
import { Logger } from "../logger";
import { Manager } from "../manager";

export class FilesEndpointCollection extends ApiEndpointCollection {
    public getEndpoints(): ApiEndpoint[] {
        return [
            new ApiEndpoint("/files", "GET", this.getFiles),
            new ApiEndpoint("/files/upload", "PUT", this.uploadFile),
            new ApiEndpoint("/files/:file_id", "GET", this.getFile),
            new ApiEndpoint("/files/:file_id", "DELETE", this.deleteFile),
            new ApiEndpoint("/files/:file_id/download", "GET", this.downloadFile),
        ];
    }

    private async getFiles(manager: Manager, req: express.Request, res: express.Response) {
        try {
            res.success(await manager.getFiles());
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async uploadFile(manager: Manager, req: express.Request, res: express.Response) {
        Logger.log("Got file upload request");

        const key = uniqid();
        const name = req.query.name;

        if (!name) {
            res.error("A name must be specified");
            return;
        }

        try {
            Logger.log(`Uploading file to "uploads/${key}"...`);

            res.success(await manager.uploadFile(key, name, req));
        } catch (ex) {
            Logger.error(ex);
        }
    }

    private async getFile(manager: Manager, req: express.Request, res: express.Response) {
        try {
            res.success(await manager.getFile(req.params.file_id));
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async deleteFile(manager: Manager, req: express.Request, res: express.Response) {
        try {
            await manager.deleteFile(req.params.file_id);

            res.success();
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async downloadFile(manager: Manager, req: express.Request, res: express.Response) {
        Logger.info("Got download request for file " + req.params.file_id);

        try {
            res.redirect(await manager.getPresignedDownloadUrl(req.params.file_id));
        } catch (ex) {
            res.exception(ex);
        }
    }
}
