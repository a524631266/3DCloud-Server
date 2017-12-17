module.exports = function(db) {
    return {
        route: '/hosts/:host_id',
        method: 'delete',
        handler: async function (req, res) {
            try {
                await db.deleteHost(req.params['host_id']);
                res.success();
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};