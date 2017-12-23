"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const requireDirectory = require("require-directory");
const logger_1 = require("./logger");
const stuff = require("./api");
class Api {
    static init(manager) {
        logger_1.Logger.info(JSON.stringify(stuff));
        logger_1.Logger.info('Loading API endpoints');
        let router = express.Router();
        function addEndpoints(endpoints) {
            for (let name in endpoints) {
                // noinspection JSUnfilteredForInLoop
                let endpoint = endpoints[name];
                if (typeof endpoint === 'function') {
                    let result = endpoint(manager);
                    logger_1.Logger.info(`Adding ${result.method.toUpperCase()} handler for /api${result.route}`);
                    router[result.method](result.route, result.handler);
                }
                else {
                    addEndpoints(endpoint);
                }
            }
        }
        let apiEndpoints = requireDirectory(module, './api');
        addEndpoints(apiEndpoints);
        logger_1.Logger.info('Done');
        return router;
    }
}
exports.Api = Api;
//# sourceMappingURL=api.js.map