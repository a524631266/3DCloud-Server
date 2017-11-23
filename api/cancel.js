module.exports = function(hosts) {
    return {
        route: '/cancel',
        method: 'get',
        handler: function(req, res) {
            console.log('Sending cancel request');
            hosts[req.query.host_id].emit('cancel', {'printer_id': req.query.printer_id}, function(data) {
                res.json(data)
            });
        }
    }
};