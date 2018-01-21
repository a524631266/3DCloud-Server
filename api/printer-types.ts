import { Request, Response } from "express";
import { ApiEndpoint } from "../api-endpoint";
import { ApiEndpointCollection } from "../api-endpoint-collection";
import { Manager } from "../manager";

export class PrinterTypesEndpointCollection extends ApiEndpointCollection {
    public getEndpoints(): ApiEndpoint[] {
        return [
            new ApiEndpoint("/printer-types", "GET", this.getPrinterTypes),
            new ApiEndpoint("/printer-types/:id", "GET", this.getPrinterType),
            new ApiEndpoint("/printer-types/new", "POST", this.addPrinterType)
        ];
    }

    private async getPrinterTypes(manager: Manager, req: Request, res: Response) {
        try {
            res.success(await manager.getPrinterTypes());
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async getPrinterType(manager: Manager, req: Request, res: Response) {
        try {
            res.success(await manager.getPrinterType(req.params.id));
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async addPrinterType(manager: Manager, req: Request, res: Response) {
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
