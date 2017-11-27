module.exports = function(io) {
    return {
        route: '/unpause',
        method: 'get',
        handler: function(req, res) {
            global.logger.info('Sending unpause request');
            io.hosts[req.query.host_id].emit('unpause', {'printer_id': req.query.printer_id}, function(data) {
                res.json(data)
            });
        }
    }
};