module.exports = function(io) {
    return {
        route: '/cancel',
        method: 'get',
        handler: function(req, res) {
            console.log('Sending cancel request');
            io.hosts[req.query.host_id].emit('cancel', {'printer_id': req.query.printer_id}, function(data) {
                res.json(data)
            });
        }
    }
};