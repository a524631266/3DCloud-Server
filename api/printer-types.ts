import { Request, Response } from "express";
import { ApiEndpoint } from "../api-endpoint";
import { ApiEndpointCollection } from "../api-endpoint-collection";
import { DB } from "../db";

export class PrinterTypesEndpointCollection extends ApiEndpointCollection {
    public getEndpoints(): ApiEndpoint[] {
        return [
            new ApiEndpoint("/printer-types", "GET", this.getPrinterTypes),
            new ApiEndpoint("/printer-types/:id", "GET", this.getPrinterType),
            new ApiEndpoint("/printer-types/new", "POST", this.addPrinterType)
        ];
    }

    private async getPrinterTypes(req: Request, res: Response) {
        try {
            res.success(await DB.getPrinterTypes());
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async getPrinterType(req: Request, res: Response) {
        try {
            res.success(await DB.getPrinterType(req.params.id));
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async addPrinterType(req: Request, res: Response) {
        if (!req.body.name) {
            res.error("Name must be specified");
            return;
        }

        if (!req.body.driver) {
            res.error("Driver must be specified");
            return;
        }

        try {
            await DB.addPrinterType(req.body.name, req.body.driver);

            res.success();
        } catch (ex) {
            res.exception(ex);
        }
    }
}
