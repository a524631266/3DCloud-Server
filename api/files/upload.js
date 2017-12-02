let util = require('util');
let uniqid = require('uniqid');

module.exports = function (db, io, aws) {
    return {
        route: '/files/upload',
        method: 'put',
        handler: async function (req, res) {
            global.logger.log('Got file upload request');

            let key = uniqid();
            let name = req.query['name'];

            if (!name)
                res.error('A name must be specified');

            if (!req.body)
                res.error('Body is empty');

            try {
                global.logger.log(util.format('Uploading file to "uploads/%s"...', key));

                await aws.uploadFile(key, req.body);

                let file = await db.addFile(key, name);

                res.success(file);
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};