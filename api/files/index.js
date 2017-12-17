module.exports = function (db) {
    return {
        route: '/files',
        method: 'get',
        handler: async function (req, res) {
            try {
                res.success(await db.getFiles());
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};