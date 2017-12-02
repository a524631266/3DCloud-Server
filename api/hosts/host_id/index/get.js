module.exports = function(db, io) {
    return {
        route: '/hosts/:host_id',
        method: 'get',
        handler: async function (req, res) {
            try {
                res.send(await db.getHost(req.params['host_id']));
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};