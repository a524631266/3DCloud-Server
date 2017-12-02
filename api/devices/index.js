module.exports = function(db, io) {
    return {
        route: '/devices',
        method: 'get',
        handler: async function (req, res) {
            try {
                res.success(await db.getDevices());
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};