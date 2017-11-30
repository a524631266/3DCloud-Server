module.exports = function(db, io) {
    return {
        route: '/devices/:device_id',
        method: 'get',
        handler: async function (req, res) {
            let dev = await db.getDevice(req.params['device_id']);

            if (dev)
                res.send(dev);
            else
                res.error('Not found', 404);
        }
    }
};