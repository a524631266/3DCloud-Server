module.exports = function(db) {
    return {
        route: '/prints/:print_id',
        method: 'delete',
        handler: async function (req, res) {
            try {
                res.success(await db.deletePrint(req.params['print_id']));
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};