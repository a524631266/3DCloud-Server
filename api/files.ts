import * as express from "express";
import * as uniqid from "uniqid";
import { ApiEndpoint } from "../api-endpoint";
import { ApiEndpointCollection } from "../api-endpoint-collection";
import { DB } from "../db";
import { Logger } from "../logger";

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

    private async getFiles(req: express.Request, res: express.Response) {
        try {
            res.success(await DB.getFiles());
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async uploadFile(req: express.Request, res: express.Response) {
        Logger.log("Got file upload request");

        const key = uniqid();
        const name = req.query.name;

        if (!name) {
            res.error("A name must be specified");
            return;
        }

        try {
            Logger.log(`Uploading file to "uploads/${key}"...`);

            // res.success(await DB.uploadFile(key, name, req));
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async getFile(req: express.Request, res: express.Response) {
        try {
            res.success(await DB.getFile(req.params.file_id));
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async deleteFile(req: express.Request, res: express.Response) {
        try {
            await DB.deleteFile(req.params.file_id);

            res.success();
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async downloadFile(req: express.Request, res: express.Response) {
        Logger.info("Got download request for file " + req.params.file_id);

        try {
            // res.redirect(await DB.getPresignedDownloadUrl(req.params.file_id));
        } catch (ex) {
            res.exception(ex);
        }
    }
}
