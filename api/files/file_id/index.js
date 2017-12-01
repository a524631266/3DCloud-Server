let util = require('util');

module.exports = function (db, io) {
    return {
        route: '/files/:file_id',
        method: 'get',
        handler: async function (req, res) {
            res.json(await db.getFile(req.params['file_id']))
        }
    }
};