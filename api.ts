import * as express from 'express';
import * as requireDirectory from "require-directory";

import { Logger } from "./logger";
import { Manager } from "./manager";
import { Router } from "express-serve-static-core";

import * as stuff from "./api";

export class Api {
    static init(manager: Manager): Router {
        Logger.info(JSON.stringify(stuff));

        Logger.info('Loading API endpoints');

        let router = express.Router();

        function addEndpoints(endpoints) {
            for (let name in endpoints) {
                // noinspection JSUnfilteredForInLoop
                let endpoint = endpoints[name];

                if (typeof endpoint === 'function') {
                    let result = endpoint(manager);
                    Logger.info(`Adding ${result.method.toUpperCase()} handler for /api${result.route}`);
                    router[result.method](result.route, result.handler);
                } else {
                    addEndpoints(endpoint);
                }
            }
        }

        let apiEndpoints = requireDirectory(module, './api');

        addEndpoints(apiEndpoints);

        Logger.info('Done');

        return router;
    }
}