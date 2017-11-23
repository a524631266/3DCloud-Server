module.exports = function(hosts) {
    return {
        route: '/update-printer',
        method: 'post',
        handler: function(req, res) {
            console.log('Sending printer update');

            if (!(req.body['host_id'] && req.body['id'] && req.body['name'] && req.body['type']))
                throw new Error('Not all required arguments are present');

            let data = {
                'host_id': req.body['host_id'],
                'id': req.body['id'],
                'name': req.body['name'],
                'type': req.body['type']
            };

            if (hosts[req.body['host_id']]) {
                hosts[req.body['host_id']].emit('printer-updated', data, function(data) {
                    res.json(data)
                });
            } else {
                throw new Error('Host not connected')
            }
        }
    }
};