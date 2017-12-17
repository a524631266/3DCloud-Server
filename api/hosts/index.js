module.exports = function(db) {
    return {
        route: '/hosts',
        method: 'get',
        handler: async function (req, res) {
            try {
                res.success(await db.getHosts());
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};