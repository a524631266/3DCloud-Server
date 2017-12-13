module.exports = function (db, io, aws) {
    return {
        route: '/files/:file_id',
        method: 'delete',
        handler: async function (req, res) {
            try {
                let file = await db.getFile(req.params['file_id']);

                try {
                    await db.deleteFile(file._id);
                    await aws.deleteFile(file._id);

                    res.success();
                } catch (ex) {
                    res.exception(ex);
                }
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};