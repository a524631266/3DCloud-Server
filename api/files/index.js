module.exports = function (manager) {
    return {
        route: '/files',
        method: 'get',
        handler: async function (req, res) {
            try {
                res.success(await manager.db.getFiles());
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};