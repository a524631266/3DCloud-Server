module.exports = function(db, io) {
    return {
        route: '/printers/:printer_id',
        method: 'post',
        handler: async function(req, res) {
            let printerId = req.params['printer_id'];
            let name = req.body['name'];
            let driver = req.body['driver'];

            if (!name)
                res.error('A name must be specified');

            if (!driver)
                res.error('A driver must be specified');

            global.logger.log('Updating printer with ID ' + printerId);

            try {
                await db.updatePrinter(printerId, name, driver);

                let device = await db.getDevice(printerId);

                // check if device exists and is currently connected
                if (device && io.hosts[device['host_id']]) {
                    // emit device update
                    io.hosts[device['host_id']].emit('printer_updated', { 'device_id': printerId, 'driver': driver }, function(data) {
                        if (!data['success'])
                            res.exception(data['error']);
                    });
                } else {
                    global.logger.log('Printer is not currently connected, omitting printer update emit');
                }

                res.success();
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};