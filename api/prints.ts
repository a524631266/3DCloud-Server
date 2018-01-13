import * as express from "express";
import { ApiEndpoint } from "../api-endpoint";
import { ApiEndpointCollection } from "../api-endpoint-collection";
import { Manager } from "../manager";

export class PrintsEndpointCollection extends ApiEndpointCollection {
    public getEndpoints(): ApiEndpoint[] {
        return [
            new ApiEndpoint("/prints", "GET", this.getPrints),
            new ApiEndpoint("/prints/:print_id", "GET", this.getPrint),
            new ApiEndpoint("/prints/:print_id", "DELETE", this.deletePrint)
        ];
    }

    private async getPrints(manager: Manager, req: express.Request, res: express.Response) {
        try {
            res.success(await manager.getPrints());
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async getPrint(manager: Manager, req: express.Request, res: express.Response) {
        try {
            res.success(await manager.getPrint(req.params.print_id));
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async deletePrint(manager: Manager, req: express.Request, res: express.Response) {
        try {
            res.success(await manager.deletePrint(req.params.print_id));
        } catch (ex) {
            res.exception(ex);
        }
    }
}
