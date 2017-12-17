module.exports = function(db) {
    return {
        route: '/devices/:device_id',
        method: 'delete',
        handler: async function (req, res) {
            try {
                await db.deleteDevice(req.params['device_id']);

                res.success();
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};