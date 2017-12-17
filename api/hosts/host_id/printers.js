module.exports = function(db) {
    return {
        route: '/hosts/:host_id/printers',
        method: 'get',
        handler: async function (req, res) {
            try {
                res.success(await db.getPrintersForHost(req.params['host_id']));
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};