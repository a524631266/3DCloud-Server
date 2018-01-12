module.exports = function(manager) {
    return {
        route: '/printers/:printer_id',
        method: 'post',
        handler: async function(req, res) {
            let printerId = req.params['printer_id'];
            let name = req.body['name'];
            let typeId = req.body['type'];

            console.log(typeId);

            if (!name) {
                res.error('A name must be specified');
                return;
            }

            if (!typeId) {
                res.error('A type ID must be specified');
                return;
            }

            //Logger.log('Updating printer with ID ' + printerId);

            try {
                await manager.db.updatePrinter(printerId, name, typeId);

                let type = await manager.db.getPrinterType(typeId);
                let device = await manager.db.getDevice(printerId);

                // check if device exists and is currently connected
                /*if (device && io.hosts[device['host_id']]) {
                    // emit device update
                    io.hosts[device['host_id']].emit('printer_updated', { 'device_id': printerId, 'driver': type.driver }, function(data) {
                        if (!data['success'] && data['error']['type'] !== 'PrinterOfflineError')
                            res.exception(data['error']);
                        else
                            res.success();
                    });
                } else {
                    Logger.log('Printer is not currently connected, omitting printer update emit');
                }*/
            } catch (ex) {
                res.exception(ex);
            }
        }
    }
};