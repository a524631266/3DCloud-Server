import * as express from "express";
import { ApiEndpoint } from "../api-endpoint";
import { ApiEndpointCollection } from "../api-endpoint-collection";
import { DB } from "../db";
import { Logger } from "../logger";

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

    private async getPrinters(req: express.Request, res: express.Response) {
        try {
            res.success(await DB.getPrinters());
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async getPrinter(req: express.Request, res: express.Response) {
        try {
            res.success(await DB.getPrinter(req.params.printer_id));
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async updatePrinter(req: express.Request, res: express.Response) {
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
            res.success(await DB.updatePrinter(printerId, name, typeId));
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async deletePrinter(req: express.Request, res: express.Response) {
        try {
            await DB.deletePrinter(req.params.printer_id);

            res.success();
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async cancelPrint(req: express.Request, res: express.Response) {
        Logger.info("Sending cancel request");

        try {
            // await DB.cancelPrint(req.params.printer_id);

            res.success();
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async nextPrint(req: express.Request, res: express.Response) {
        Logger.info("Adding print to queue");

        const printerId = req.params.printer_id;

        try {
            // await DB.nextPrint(printerId);

            res.success();
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async pausePrint(req: express.Request, res: express.Response) {
        Logger.info("Sending pause request");

        try {
            // await DB.pausePrint(req.params.printer_id);

            res.success();
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async queuePrint(req: express.Request, res: express.Response) {
        Logger.info("Adding print to queue");

        try {
            await DB.queuePrint(req.params.printer_id, req.query.id);

            res.success();
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async startPrint(req: express.Request, res: express.Response) {
        Logger.info("Sending print request");

        try {
            // res.success(await DB.startPrint(req.params.printer_id, req.query.id));
        } catch (ex) {
            res.exception(ex);
        }
    }

    private async unpausePrint(req: express.Request, res: express.Response) {
        Logger.info("Sending unpause request");

        try {
            // await DB.unpausePrint(req.params.printer_id);

            res.success();
        } catch (ex) {
            res.exception(ex);
        }
    }
}
