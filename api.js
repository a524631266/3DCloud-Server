"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const logger_1 = require("./logger");
const stuff = require("./api");
const devices_1 = require("./api/devices");
class Api {
    static init(manager) {
        logger_1.Logger.info(JSON.stringify(stuff));
        logger_1.Logger.info('Loading API endpoints');
        let router = express.Router();
        for (let i = 0; i < this.collections.length; i++) {
            this.addEndpoints(router, manager, this.collections[i].getEndpoints());
        }
        logger_1.Logger.info('Done');
        return router;
    }
    static addEndpoints(router, manager, endpoints) {
        for (let i = 0; i < endpoints.length; i++) {
            router[endpoints[i].getMethod().toLowerCase()](endpoints[i].getRoute(), (req, res) => {
                endpoints[i].trigger(manager, req, res);
            });
        }
    }
}
Api.collections = [
    new devices_1.DevicesEndpointCollection()
];
exports.Api = Api;
//# sourceMappingURL=api.js.map