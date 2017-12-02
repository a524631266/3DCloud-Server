module.exports = function (db, io) {
    return {
        route: '/files/:file_id',
        method: 'get',
        handler: async function (req, res) {
            res.success(await db.getFile(req.params['file_id']));
        }
    }
};