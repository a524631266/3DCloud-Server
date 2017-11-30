module.exports = function(db, io) {
    return {
        route: '/devices',
        method: 'get',
        handler: async function (req, res) {
            res.send(await db.getDevices());
        }
    }
};