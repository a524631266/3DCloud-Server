module.exports = function(db, io) {
    return {
        route: '/printers',
        method: 'get',
        handler: async function (req, res) {
            try {
                res.send({
                    'success': true,
                    'printers': await db.getPrinters()
                });
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};