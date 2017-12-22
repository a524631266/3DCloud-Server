module.exports = function(db, io) {
    return {
        route: '/printers/:printer_id/print/next',
        method: 'get',
        handler: async function(req, res) {
            Logger.info('Adding print to queue');

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

                await db.setPrintPending(print['_id'], hostId);

                io.hosts[hostId].emit('print', {
                    'printer_id': printerId,
                    'print_id': print['_id'],
                    'key': print['file_id'],
                    'name': print['file_name']
                }, async function (data) {
                    if (!data['success']) {
                        if (data['error'] && data['error']['message']) {
                            res.exception(data['error']);
                            Logger.error('Failed to start print: ' + data['error']['message']);
                            await db.updatePrint(print['_id'], 'error', data['error']['message']);
                        } else {
                            res.error('Failed to start print');
                            Logger.error('Failed to start print');
                            await db.updatePrint(print['_id'], 'error');
                        }
                    } else {
                        res.success(print);
                    }
                });
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};