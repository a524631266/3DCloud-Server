module.exports = function (db, io) {
    return {
        route: '/hosts/:host_id/printers',
        method: 'get',
        handler: async function (req, res) {
            try {
                let printers = await db.getPrintersForHost(req.params['host_id']);

                res.send({
                    'success': true,
                    'data': printers
                });
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};