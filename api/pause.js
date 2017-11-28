module.exports = function(io) {
    return {
        route: '/machines/:machine_id/printers/:printer_id/print/pause',
        method: 'get',
        handler: function(req, res) {
            global.logger.info('Sending pause request');
            io.hosts[req.params['machine_id']].emit('pause', {'printer_id': req.params['printer_id']}, function(data) {
                res.json(data)
            });
        }
    }
};