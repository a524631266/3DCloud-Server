import * as express from "express";
import { Router } from "express-serve-static-core";
import { ApiEndpoint } from "./api-endpoint";
import { ApiEndpointCollection } from "./api-endpoint-collection";
import { DevicesEndpointCollection } from "./api/devices";
import { FilesEndpointCollection } from "./api/files";
import { HostsEndpointCollection } from "./api/hosts";
import { PrinterTypesEndpointCollection } from "./api/printer-types";
import { PrintersEndpointCollection } from "./api/printers";
import { PrintsEndpointCollection } from "./api/prints";
import { Logger } from "./logger";
import { Manager } from "./manager";

export class Api {
    private static collections: ApiEndpointCollection[] = [
        new DevicesEndpointCollection(),
        new FilesEndpointCollection(),
        new HostsEndpointCollection(),
        new PrintsEndpointCollection(),
        new PrintersEndpointCollection(),
        new PrinterTypesEndpointCollection()
    ];

    public static init(manager: Manager): Router {
        Logger.info("Loading API endpoints");

        const router = express.Router();

        for (const collection of this.collections) {
            this.addEndpoints(router, manager, collection.getEndpoints());
        }

        Logger.info("Done");

        return router;
    }

    private static addEndpoints(router: express.Router, manager: Manager, endpoints: ApiEndpoint[]) {
        for (const endpoint of endpoints) {
            Logger.debug(`Adding ${endpoint.getMethod().toUpperCase()} handler for route ${endpoint.getRoute()}`);
            router[endpoint.getMethod().toLowerCase()](
                endpoint.getRoute(),
                (req: express.Request, res: express.Response) => {
                    endpoint.trigger(manager, req, res);
                }
            );
        }
    }
}
