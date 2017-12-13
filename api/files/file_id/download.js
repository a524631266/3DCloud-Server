let util = require('util');

module.exports = function (db, io, aws) {
    return {
        route: '/files/:file_id/download',
        method: 'get',
        handler: async function (req, res) {
            global.logger.info('Got download request for file ' + req.params['file_id']);

            let file = await db.getFile(req.params['file_id']);

            if (!file)
                res.error('File not found', 404);

            try {
                let data = await aws.getFile(file['_id']);

                res.header('Content-Disposition', util.format('attachment; filename="%s"', file['name'])).send(data.Body);
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};