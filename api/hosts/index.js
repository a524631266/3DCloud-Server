module.exports = function(db, io) {
    return {
        route: '/hosts',
        method: 'get',
        handler: async function (req, res) {
            try {
                res.send({
                    'success': true,
                    'data': await db.getHosts()
                });
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};