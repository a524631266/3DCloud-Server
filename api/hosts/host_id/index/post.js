module.exports = function(db) {
    return {
        route: '/hosts/:host_id',
        method: 'post',
        handler: async function (req, res) {
            try {
                res.success(await db.updateHost(req.params['host_id'], req.body['name']));
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};