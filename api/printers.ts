import * as express from "express";
import { ApiEndpoint } from "../api-endpoint";
import { ApiEndpointCollection } from "../api-endpoint-collection";
import { Logger } from "../logger";
import { Manager } from "../manager";

export class PrintersEndpointCollection extends ApiEndpointCollection {
    public getEndpoints(): ApiEndpoint[] {
        return [
            new ApiEndpoint("/printers", "GET", this.getPrinters),
            new ApiEndpoint("/printers/:printer_id", "GET", this.getPrinter),
            new ApiEndpoint("/printers/:printer_id", "POST", this.updatePrinter),
            new ApiEndpoint("/printers/:printer_id", "DELETE", this.deletePrinter),
            new ApiEndpoint("/printers/:printer_id/print/cancel", "GET", this.cancelPrint),
            new ApiEndpoint("/printers/:printer_id/print/next", "GET", this.nextPrint),
            new ApiEndpoint("/printers/:printer_id/print/pause", "GET", this.pausePrint),
            new ApiEndpoint("/printers/:printer_id/print/queue", "GET", this.queuePrint),
            new ApiEndpoint("/printers/:printer_id/print/start", "GET", this.startPrint),
            new ApiEndpoint("/printers/:printer_id/print/unpause", "GET", this.unpausePrint)
        ];
    }

    private async getPrinters(manager: Manager, req: express.Request, res: express.Response) {
        try {
            res.success(await manager.getPrinters());
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async getPrinter(manager: Manager, req: express.Request, res: express.Response) {
        try {
            res.success(await manager.getPrinter(req.params.printer_id));
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async updatePrinter(manager: Manager, req: express.Request, res: express.Response) {
        const printerId = req.params.printer_id;
        const name = req.body.name;
        const typeId = req.body.type;

        if (!name) {
            res.error("A name must be specified");
            return;
        }

        if (!typeId) {
            res.error("A type ID must be specified");
            return;
        }

        Logger.log("Updating printer with ID " + printerId);

        try {
            await manager.updatePrinter(printerId, name, typeId);

            res.success();
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async deletePrinter(manager: Manager, req: express.Request, res: express.Response) {
        try {
            await manager.deletePrinter(req.params.printer_id);

            res.success();
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async cancelPrint(manager: Manager, req: express.Request, res: express.Response) {
        Logger.info("Sending cancel request");

        try {
            await manager.cancelPrint(req.params.printer_id);

            res.success();
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async nextPrint(manager: Manager, req: express.Request, res: express.Response) {
        Logger.info("Adding print to queue");

        const printerId = req.params.printer_id;

        try {
            await manager.nextPrint(printerId);

            res.success();
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async pausePrint(manager: Manager, req: express.Request, res: express.Response) {
        Logger.info("Sending pause request");

        try {
            await manager.pausePrint(req.params.printer_id);

            res.success();
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async queuePrint(manager: Manager, req: express.Request, res: express.Response) {
        Logger.info("Adding print to queue");

        try {
            await manager.queuePrint(req.params.printer_id, req.query.id);

            res.success();
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async startPrint(manager: Manager, req: express.Request, res: express.Response) {
        Logger.info("Sending print request");

        try {
            res.success(await manager.startPrint(req.params.printer_id, req.query.id));
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async unpausePrint(manager: Manager, req: express.Request, res: express.Response) {
        Logger.info("Sending unpause request");

        try {
            await manager.unpausePrint(req.params.printer_id);

            res.success();
        } catch (ex) {
            res.exception(ex);
        }
    }
}
