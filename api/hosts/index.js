module.exports = function(manager) {
    return {
        route: '/hosts',
        method: 'get',
        handler: async function (req, res) {
            try {
                res.success(await manager.db.getHosts());
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};