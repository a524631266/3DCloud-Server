module.exports = function(db) {
    return {
        route: '/printers/:printer_id/print/queue',
        method: 'get',
        handler: async function(req, res) {
            global.logger.info('Adding print to queue');

            let printerId = req.params['printer_id'];
            let fileId = req.query['id'];

            let file = await db.getFile(fileId);

            if (!file) {
                res.error('File not found');
                return;
            }

            try {
                let print = await db.queuePrint(fileId, printerId);

                res.success(print);
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};