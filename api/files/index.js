let util = require('util');

module.exports = function (db, io) {
    return {
        route: '/files',
        method: 'get',
        handler: async function (req, res) {
            try {
                let files = await db.getFiles();

                res.json({
                    'success': true,
                    'data': files
                })
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};