let requireDirectory = require('require-directory');
let express = require('express');
let cors = require('cors');

module.exports = function(io) {
    global.logger.info('Loading API endpoints');

    let router = express.Router();

    function addEndpoints(endpoints) {
        for (let name in endpoints) {
            // noinspection JSUnfilteredForInLoop
            let endpoint = endpoints[name];

            if (typeof endpoint === 'function') {
                let result = endpoint(io);
                global.logger.info('Adding endpoint /api' + result.route);
                router[result.method](result.route, cors(), result.handler);
            } else {
                addEndpoints(endpoint)
            }
        }
    }

    let apiEndpoints = requireDirectory(module, './api');

    addEndpoints(apiEndpoints);

    global.logger.info('Done');

    return router;
};