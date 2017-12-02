module.exports = function(db, io) {
    return {
        route: '/printers/:printer_id/print/start',
        method: 'get',
        handler: async function(req, res) {
            global.logger.info('Sending print request');

            let printerId = req.params['printer_id'];
            let machineId = io.devices[printerId];
            let fileId = req.query['id'];

            if (!io.hosts[machineId])
                res.error('Host is not connected.');

            let file = await db.getFile(fileId);

            if (!file) {
                res.error('File not found');
                return;
            }

            io.hosts[machineId].emit('print', {'printer_id': printerId, 'key': file.key, 'name': file.name}, function(data) {
                res.json(data);
            });
        }
    }
};