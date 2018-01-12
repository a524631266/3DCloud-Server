module.exports = function(manager) {
    return {
        route: '/printers',
        method: 'get',
        handler: async function (req, res) {
            try {
                res.success(await manager.db.getPrinters());
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};