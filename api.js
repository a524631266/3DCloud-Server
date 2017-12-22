let requireDirectory = require('require-directory');
let express = require('express');
let util = require('util');

module.exports = function(db, io, aws) {
    Logger.info('Loading API endpoints');

    let router = express.Router();

    function addEndpoints(endpoints) {
        for (let name in endpoints) {
            // noinspection JSUnfilteredForInLoop
            let endpoint = endpoints[name];

            if (typeof endpoint === 'function') {
                let result = endpoint(db, io, aws);
                Logger.info(util.format('Adding %s handler for /api%s', result.method.toUpperCase(), result.route));
                router[result.method](result.route, result.handler);
            } else {
                addEndpoints(endpoint)
            }
        }
    }

    let apiEndpoints = requireDirectory(module, './api');

    addEndpoints(apiEndpoints);

    Logger.info('Done');

    return router;
};