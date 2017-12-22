module.exports = function(db, io) {
    return {
        route: '/printers/:printer_id/print/cancel',
        method: 'get',
        handler: async function(req, res) {
            Logger.info('Sending cancel request');

            let device = await db.getDevice(req.params['printer_id']);

            if (device) {
                if (io.hosts[device['host_id']]) {
                    io.hosts[device['host_id']].emit('cancel', {'printer_id': req.params['printer_id']}, function(data) {
                        if (data['success'])
                            res.success();
                        else
                            res.exception(data['error']);
                    });
                } else {
                    res.error('Host is not connected');
                }
            } else {
                res.error('Device not found', 404);
            }
        }
    }
};