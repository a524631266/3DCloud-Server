module.exports = function(db, io) {
    return {
        route: '/hosts/:host_id/printers/:printer_id/print/cancel',
        method: 'get',
        handler: function(req, res) {
            global.logger.info('Sending cancel request');
            io.hosts[req.params['host_id']].emit('cancel', {'printer_id': req.params['printer_id']}, function(data) {
                res.json(data)
            });
        }
    }
};