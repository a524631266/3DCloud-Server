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

            res.success({'status': 'uploading', 'id': key});

            try {
                global.logger.log(util.format('Uploading file to "uploads/%s"...', key));

                await aws.uploadFile(key, req.body, (loaded, total) => {
                    io.namespaces.users.emit('file-upload-progress', { id: key, loaded: loaded, total: total });
                });

                let file = await db.addFile(key, name);

                io.namespaces.users.emit('file-uploaded', file);
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};