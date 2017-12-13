module.exports = function(db, io) {
    return {
        route: '/printers/:printer_id/print/next',
        method: 'get',
        handler: async function(req, res) {
            global.logger.info('Adding print to queue');

            let printerId = req.params['printer_id'];
            let hostId = null;

            try {
                let device = await db.getDevice(printerId);

                hostId = device['host_id'];
            } catch (ex) {
                res.exception(ex);
                return;
            }

            try {
                let print = await db.getNextQueuedPrint(printerId);

                if (!print) {
                    res.error('No prints in queue');
                    return;
                }

                io.hosts[hostId].emit('print', {
                    'printer_id': printerId,
                    'print_id': print['_id'],
                    'key': print['file_id'],
                    'name': print['file_name']
                }, async function (data) {
                    res.json(data);
                });

                io.namespaces.users.emit('print-started', print)
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};