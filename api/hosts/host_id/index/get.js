module.exports = function(manager) {
    return {
        route: '/hosts/:host_id',
        method: 'get',
        handler: async function (req, res) {
            try {
                res.success(await manager.db.getHost(req.params['host_id']));
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};