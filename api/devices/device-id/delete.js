module.exports = function(db, io) {
    return {
        route: '/devices/:device_id',
        method: 'delete',
        handler: async function (req, res) {
            try {
                await db.deleteDevice(req.params['device_id']);

                res.json({ 'success': true });
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};