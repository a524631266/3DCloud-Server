module.exports = function(db) {
    return {
        route: '/prints/:print_id',
        method: 'get',
        handler: async function (req, res) {
            try {
                res.success(await db.getPrint(req.params['print_id']));
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};