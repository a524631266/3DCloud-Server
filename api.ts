import * as express from "express";
import { Router } from "express-serve-static-core";
import { ApiEndpoint } from "./api-endpoint";
import { ApiEndpointCollection } from "./api-endpoint-collection";
import { DevicesEndpointCollection } from "./api/devices";
import { Logger } from "./logger";
import { Manager } from "./manager";

export class Api {
    private static collections: ApiEndpointCollection[] = [
        new DevicesEndpointCollection()
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
            router[endpoint.getMethod().toLowerCase()](
                endpoint.getRoute(),
                (req: express.Request, res: express.Response) => {
                    endpoint.trigger(manager, req, res);
                }
            );
        }
    }
}
