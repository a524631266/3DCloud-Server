module.exports = function(db, io) {
    return {
        route: '/prints',
        method: 'get',
        handler: async function (req, res) {
            try {
                res.success(await db.getPrints());
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};