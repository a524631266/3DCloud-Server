module.exports = function(io) {
    return {
        route: '/pause',
        method: 'get',
        handler: function(req, res) {
            global.logger.info('Sending pause request');
            io.hosts[req.query.host_id].emit('pause', {'printer_id': req.query.printer_id}, function(data) {
                res.json(data)
            });
        }
    }
};