import * as express from "express";
import { ApiEndpoint } from "../api-endpoint";
import { ApiEndpointCollection } from "../api-endpoint-collection";
import { DB } from "../db";

export class HostsEndpointCollection extends ApiEndpointCollection {
    public getEndpoints(): ApiEndpoint[] {
        return [
            new ApiEndpoint("/hosts", "GET", this.getHosts),
            new ApiEndpoint("/hosts/:host_id", "GET", this.getHost),
            new ApiEndpoint("/hosts/:host_id", "POST", this.updateHost),
            new ApiEndpoint("/hosts/:host_id", "DELETE", this.deleteHost)
        ];
    }

    private async getHosts(req: express.Request, res: express.Response) {
        try {
            res.success(await DB.getHosts());
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async getHost(req: express.Request, res: express.Response) {
        try {
            res.success(await DB.getHost(req.params.host_id));
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async updateHost(req: express.Request, res: express.Response) {
        if (!req.body.name) {
            res.error("Name must be specified.");
            return;
        }

        try {
            res.success(await DB.updateHost(req.params.host_id, req.body.name));
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async deleteHost(req: express.Request, res: express.Response) {
        try {
            await DB.deleteHost(req.params.host_id);
            res.success();
        } catch (ex) {
            res.exception(ex);
        }
    }
}
