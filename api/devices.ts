import * as express from "express";

import { ApiEndpoint } from "../api-endpoint";
import { ApiEndpointCollection } from "../api-endpoint-collection";
import { DB } from "../db";

export class DevicesEndpointCollection extends ApiEndpointCollection {
    public getEndpoints(): ApiEndpoint[] {
        return [
            new ApiEndpoint("/devices", "GET", this.getDevices),
            new ApiEndpoint("/devices/:device_id", "GET", this.getDevice),
            new ApiEndpoint("/devices/:device_id", "DELETE", this.deleteDevice)
        ];
    }

    private async getDevices(req: express.Request, res: express.Response) {
        try {
            res.success(await DB.getDevices());
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async getDevice(req: express.Request, res: express.Response) {
        try {
            const device = await DB.getDevice(req.params.device_id);

            if (device) {
                res.success(device);
            } else {
                res.error("Not found", 404);
            }
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async deleteDevice(req: express.Request, res: express.Response) {
        try {
            await DB.deleteDevice(req.params.device_id);

            res.success();
        } catch (ex) {
            res.exception(ex);
        }
    }
}
