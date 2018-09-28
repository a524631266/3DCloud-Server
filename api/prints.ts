import * as express from "express";
import { ApiEndpoint } from "../api-endpoint";
import { ApiEndpointCollection } from "../api-endpoint-collection";
import { DB } from "../db";

export class PrintsEndpointCollection extends ApiEndpointCollection {
    public getEndpoints(): ApiEndpoint[] {
        return [
            new ApiEndpoint("/prints", "GET", this.getPrints),
            new ApiEndpoint("/prints/:print_id", "GET", this.getPrint),
            new ApiEndpoint("/prints/:print_id", "DELETE", this.deletePrint)
        ];
    }

    private async getPrints(req: express.Request, res: express.Response) {
        try {
            res.success(await DB.getPrints());
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async getPrint(req: express.Request, res: express.Response) {
        try {
            res.success(await DB.getPrint(req.params.print_id));
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async deletePrint(req: express.Request, res: express.Response) {
        try {
            res.success(await DB.deletePrint(req.params.print_id));
        } catch (ex) {
            res.exception(ex);
        }
    }
}
