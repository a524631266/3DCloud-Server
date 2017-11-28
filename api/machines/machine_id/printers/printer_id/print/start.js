module.exports = function(io) {
    return {
        route: '/machines/:machine_id/printers/:printer_id/print/start',
        method: 'get',
        handler: function(req, res) {
            global.logger.info('Sending print request');

            let machineId = req.params['machine_id'];
            let printerId = req.params['printer_id'];
            let printKey  = req.query['key'];
            let printName = req.query['name'];

            if (!printerId)
                throw new Error('You must specify a printer ID');

            if (!printName)
                throw new Error('You must specify a print name');

            if (!io.hosts[machineId])
                throw new Error('Host is not connected.');

            io.hosts[machineId].emit('print', {'printer_id': printerId, 'key': printKey, 'name': printName}, function(data) {
                res.json(data)
            });
        }
    }
};