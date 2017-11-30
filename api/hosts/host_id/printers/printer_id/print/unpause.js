module.exports = function(db, io) {
    return {
        route: '/hosts/:host_id/printers/:printer_id/print/unpause',
        method: 'get',
        handler: function(req, res) {
            global.logger.info('Sending unpause request');
            io.hosts[req.params['host_id']].emit('unpause', {'printer_id': req.params['printer_id']}, function(data) {
                res.json(data)
            });
        }
    }
};