module.exports = function(manager) {
    return {
        route: '/printer-types',
        method: 'get',
        handler: async function(req, res) {
            try {
                res.success(await manager.db.getPrinterTypes());
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};