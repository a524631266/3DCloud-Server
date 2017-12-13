module.exports = function(db, io) {
    return {
        route: '/printers/:printer_id/print/start',
        method: 'get',
        handler: async function(req, res) {
            global.logger.info('Sending print request');

            let printerId = req.params['printer_id'];
            let fileId = req.query['id'];
            let hostId = null;

            try {
                let device = await db.getDevice(printerId);

                hostId = device['host_id'];
            } catch (ex) {
                res.exception(ex);
                return;
            }

            let file = await db.getFile(fileId);

            if (!file) {
                res.error('File not found');
                return;
            }

            if (io.hosts[hostId]) {
                try {
                    let print = await db.addPrint(fileId, hostId, printerId);

                    io.hosts[hostId].emit('print', {
                        'printer_id': printerId,
                        'print_id': print['_id'],
                        'key': file['_id'],
                        'name': file.name
                    }, async function (data) {
                        res.json(data);
                    });

                    io.namespaces.users.emit('print-started', print)
                } catch (ex) {
                    res.exception(ex);
                }
            } else {
                res.error('Host is not connected.');
            }
        }
    }
};