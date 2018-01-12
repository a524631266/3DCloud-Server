module.exports = function(manager) {
    return {
        route: '/printers/:printer_id/print/start',
        method: 'get',
        handler: async function(req, res) {
            //Logger.info('Sending print request');

            let printerId = req.params['printer_id'];
            let fileId = req.query['id'];
            let hostId = null;

            try {
                let device = await manager.db.getDevice(printerId);

                hostId = device['host_id'];
            } catch (ex) {
                res.exception(ex);
                return;
            }

            let file = await manager.db.getFile(fileId);

            if (!file) {
                res.error('File not found');
                return;
            }

            if (manager.io.getHost(hostId)) {
                try {
                    let print = await manager.db.addPrint(fileId, printerId, 'pending', hostId);

                    manager.io.getHost(hostId).emit('print', {
                        'printer_id': printerId,
                        'print_id': print['_id'],
                        'key': file['_id'],
                        'name': file.name
                    }, async function (data) {
                        if (data['success']) {
                            res.success(print);
                        } else if (data['error']) {
                            res.exception(data['error']);
                            await manager.db.updatePrint(print['_id'], 'error', data['error']['message']);
                        } else {
                            res.error('Failed to start print');
                            await manager.db.updatePrint(print['_id'], 'error', 'Unknown error');
                        }
                    });
                } catch (ex) {
                    res.exception(ex);
                }
            } else {
                res.error('Host is not connected.');
            }
        }
    }
};