let util = require('util');

module.exports = (server, db) => {
    global.logger.info('Initializing socket...');

    let io = require('socket.io')(server);
    let hosts = {};
    let devices = {};
    let statuses = {};

    let machines = io.of('/hosts');
    let users = io.of('/users');

    users.on('connection', async function (client) {
        global.logger.info(util.format('Client %s connected to users channel', client.id));
    });

    machines.on('connection', async function (client) {
        let hostId = client.handshake.query.host_id;

        if (!hostId) {
            global.logger.error('Client attempted to connect to hosts namespace without host ID');
            client.disconnect();
        }

        hosts[hostId] = client;

        if (!await db.hostExists(hostId))
            await db.addHost(hostId);

        global.logger.info(util.format('Client %s (machine ID %s) connected to hosts namespace', client.id, hostId));

        client.on('printer', async function (data) {
            global.logger.info('Received request for printer with ID ' + data['device']['id']);

            devices[data['device']['id']] = hostId;

            users.emit('device_updated', data['device']); // TODO: actual structure

            if (await db.printerExists(data['device']['id'])) {
                let printer = await db.getPrinter(data['device']['id']);

                let send = {
                    'device_id': printer['_id'],
                    'driver': printer['driver']
                };

                client.emit('printer_updated', send, function (response) {
                    global.logger.log('printer_updated response: ' + JSON.stringify(response));

                    users.emit('printer_updated', printer);
                });
            }
        });

        client.on('status', function (data) {
            statuses[hostId] = data;
        });

        client.on('disconnect', async function () {
            delete hosts[hostId];
            delete statuses[hostId];
        })
    });

    io.on('connection', async function (client) {
        global.logger.info(util.format('Client %s connected', client.id));

        client.on('disconnect', async function () {
            global.logger.info(util.format('Client %s disconnected', client.id));
        });
    });

    let statusUpdate = () => {
        users.emit('status', statuses);

        setTimeout(statusUpdate, 1000);
    };

    statusUpdate();

    global.logger.info('Socket initialized');

    return {
        hosts: hosts,
        devices: devices
    };
};