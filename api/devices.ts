import * as express from "express";

import { ApiEndpointCollection } from "../api-endpoint-collection";
import { ApiEndpoint } from "../api-endpoint";
import { Manager } from "../manager";

export class DevicesEndpointCollection implements ApiEndpointCollection {
    getEndpoints(): ApiEndpoint[] {
        return [
            new ApiEndpoint('/devices', 'GET', this.getDevices),
            new ApiEndpoint('/devices/:device_id', 'GET', this.getDevice),
            new ApiEndpoint('/devices/:device_id', 'DELETE', this.deleteDevice)
        ];
    }

    private async getDevices(manager: Manager, req: express.Request, res: express.Response) {
        try {
            res.success(await manager.getDevices());
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async getDevice(manager: Manager, req: express.Request, res: express.Response) {
        try {
            let device = await manager.getDevice(req.params['device_id']);

            if (device)
                res.success(device);
            else
                res.error('Not found', 404);
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async deleteDevice(manager: Manager, req: express.Request, res: express.Response) {
        try {
            await manager.deleteDevice(req.params['device_id']);

            res.success();
        } catch (ex) {
            res.exception(ex);
        }
    }
}