module.exports = function(hosts) {
    return {
        route: '/print',
        method: 'get',
        handler: function(req, res) {
            console.log('Sending print request');

            if (hosts[req.query.host_id] !== undefined) {
                hosts[req.query.host_id].emit('print', {'printer_id': req.query.printer_id, 'name': req.query.name}, function(data) {
                    res.json(data)
                });
            } else {
                throw new Error('Host is not connected.');
            }
        }
    }
};