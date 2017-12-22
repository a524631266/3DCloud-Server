let util = require('util');
let uniqid = require('uniqid');

module.exports = function (db, io, aws) {
    return {
        route: '/files/upload',
        method: 'put',
        handler: async function (req, res) {
            Logger.log('Got file upload request');

            let key = uniqid();
            let name = req.query['name'];

            if (!name)
                res.error('A name must be specified');

            try {
                Logger.log(util.format('Uploading file to "uploads/%s"...', key));

                await aws.uploadFile(key, req);

                let file = await db.addFile(key, name);

                res.success(file);
            } catch (ex) {
                Logger.error(ex);
            }
        }
    }
};