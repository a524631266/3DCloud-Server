import * as express from "express";
import { ApiEndpoint } from "../api-endpoint";
import { ApiEndpointCollection } from "../api-endpoint-collection";
import { Manager } from "../manager";

export class HostsEndpointCollection extends ApiEndpointCollection {
    public getEndpoints(): ApiEndpoint[] {
        return [
            new ApiEndpoint("/hosts", "GET", this.getHosts),
            new ApiEndpoint("/hosts/:host_id", "GET", this.getHost),
            new ApiEndpoint("/hosts/:host_id", "POST", this.updateHost),
            new ApiEndpoint("/hosts/:host_id", "DELETE", this.deleteHost)
        ];
    }

    private async getHosts(manager: Manager, req: express.Request, res: express.Response) {
        try {
            res.success(await manager.getHosts());
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async getHost(manager: Manager, req: express.Request, res: express.Response) {
        try {
            res.success(await manager.getHost(req.params.host_id));
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async updateHost(manager: Manager, req: express.Request, res: express.Response) {
        if (!req.body.name) {
            res.error("Name must be specified.");
            return;
        }

        try {
            res.success(await manager.updateHost(req.params.host_id, req.body.name));
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async deleteHost(manager: Manager, req: express.Request, res: express.Response) {
        try {
            await manager.deleteHost(req.params.host_id);
            res.success();
        } catch (ex) {
            res.exception(ex);
        }
    }
}