module.exports = function(db) {
    return {
        route: '/printer-types/new',
        method: 'post',
        handler: async function(req, res) {
            try {
                let name = req.body['name'];
                let driver = req.body['driver'];

                console.log(req.body);

                if (!name) {
                    res.error('Name must be specified');
                    return;
                }

                if (!driver) {
                    res.error('Driver must be specified');
                    return;
                }

                res.success(await db.addPrinterType(name, driver));
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};