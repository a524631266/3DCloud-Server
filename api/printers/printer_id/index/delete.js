module.exports = function(db) {
    return {
        route: '/printers/:printer_id',
        method: 'delete',
        handler: async function (req, res) {
            try {
                await db.deletePrinter(req.params['printer_id']);
                res.success();
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};