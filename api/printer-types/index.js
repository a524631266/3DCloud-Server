module.exports = function(db) {
    return {
        route: '/printer-types',
        method: 'get',
        handler: async function(req, res) {
            try {
                res.success(await db.getPrinterTypes());
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};