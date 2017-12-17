module.exports = function(db) {
    return {
        route: '/printers/:printer_id',
        method: 'get',
        handler: async function (req, res) {
            try {
                res.success(await db.getPrinter(req.params['printer_id']));
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};