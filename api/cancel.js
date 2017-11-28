module.exports = function(io) {
    return {
        route: '/machines/:machine_id/printers/:printer_id/print/cancel',
        method: 'get',
        handler: function(req, res) {
            global.logger.info('Sending cancel request');
            io.hosts[req.params['machine_id']].emit('cancel', {'printer_id': req.params['printer_id']}, function(data) {
                res.json(data)
            });
        }
    }
};