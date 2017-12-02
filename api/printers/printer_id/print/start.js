module.exports = function(db, io) {
    return {
        route: '/printers/:printer_id/print/start',
        method: 'get',
        handler: async function(req, res) {
            global.logger.info('Sending print request');

            let printerId = req.params['printer_id'];
            let machineId = io.devices[printerId];
            let fileId = req.query['id'];

            let file = await db.getFile(fileId);

            if (!file) {
                res.error('File not found');
                return;
            }
            if (io.hosts[machineId]) {
                io.hosts[machineId].emit('print', {
                    'printer_id': printerId,
                    'key': file.key,
                    'name': file.name
                }, function (data) {
                    res.json(data);
                });
            } else {
                res.error('Host is not connected.');
            }
        }
    }
};