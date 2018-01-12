import * as express from 'express';

import { Logger } from "./logger";
import { Manager } from "./manager";
import { Router } from "express-serve-static-core";

import * as stuff from "./api";
import { ApiEndpoint } from "./api-endpoint";
import { DevicesEndpointCollection } from "./api/devices";
import { ApiEndpointCollection } from "./api-endpoint-collection";

export class Api {
    static collections: ApiEndpointCollection[] = [
        new DevicesEndpointCollection()
    ];

    static init(manager: Manager): Router {
        Logger.info(JSON.stringify(stuff));

        Logger.info('Loading API endpoints');

        let router = express.Router();

        for (let i = 0; i < this.collections.length; i++) {
            this.addEndpoints(router, manager, this.collections[i].getEndpoints());
        }

        Logger.info('Done');

        return router;
    }

    private static addEndpoints(router: express.Router, manager: Manager, endpoints: ApiEndpoint[]) {
        for (let i = 0; i < endpoints.length; i++) {
            router[endpoints[i].getMethod().toLowerCase()](endpoints[i].getRoute(), (req: express.Request, res: express.Response) => {
                endpoints[i].trigger(manager, req, res);
            });
        }
    }
}