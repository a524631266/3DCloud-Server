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
                let url = aws.getPresignedDownloadUrl(file['_id'], file['name']);

                res.redirect(url);
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};