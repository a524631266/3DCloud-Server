import * as express from "express";
import { ApiEndpoint } from "../api-endpoint";
import { ApiEndpointCollection } from "../api-endpoint-collection";
import { Manager } from "../manager";

export class PrinterTypesEndpointCollection extends ApiEndpointCollection {
    public getEndpoints(): ApiEndpoint[] {
        return [
            new ApiEndpoint("/printer-types", "GET", this.getPrinterTypes),
            new ApiEndpoint("/printer-types/new", "POST", this.addPrinterType)
        ];
    }

    private async getPrinterTypes(manager: Manager, req: express.Request, res: express.Response) {
        try {
            res.success(await manager.getPrinterTypes());
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async addPrinterType(manager: Manager, req: express.Request, res: express.Response) {
        if (!name) {
            if (!req.body.name) {
                res.error("Name must be specified");
                return;
            }

            if (!req.body.driver) {
                res.error("Driver must be specified");
                return;
            }

            try {
                await manager.addPrinterType(req.body.name, req.body.driver);

                res.success();
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
}
