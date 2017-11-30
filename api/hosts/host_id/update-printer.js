module.exports = function(db, io) {
    return {
        route: '/hosts/:host_id/update-printer',
        method: 'post',
        handler: async function(req, res) {
            console.log('Sending printer update');

            let required = ['device_id', 'name', 'driver'];

            required.forEach((item) => {
                if (!req.body[item])
                    res.error('Missing ' + item + ' in body');
            });

            let printer = {
                'device_id': req.body['device_id'],
                'name': req.body['name'],
                'driver': req.body['driver']
            };

            await db.updatePrinter(printer['device_id'], printer['name'], printer['driver']);

            if (io.hosts[req.params['host_id']]) {
                io.hosts[req.params['host_id']].emit('printer_updated', printer, function(data) {
                    res.json(data);
                });
            } else {
                throw new Error('Host not connected');
            }
        }
    }
};