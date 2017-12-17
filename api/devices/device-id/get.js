module.exports = function(db) {
    return {
        route: '/devices/:device_id',
        method: 'get',
        handler: async function (req, res) {
            try {
                let device = await db.getDevice(req.params['device_id']);

                if (device)
                    res.success(device);
                else
                    res.error('Not found', 404);
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};