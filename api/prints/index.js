module.exports = function(manager) {
    return {
        route: '/prints',
        method: 'get',
        handler: async function (req, res) {
            try {
                res.success(await manager.db.getPrints());
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};