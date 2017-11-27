let util = require('util');

let profiles = [
    {
        "id": "d3b8b322d33baad341613523f1fc5fe327ca400eb8baef2f10216a48bc616603",
        "name": "RPL2-04",
        "driver": "makerbot"
    },
    {
        "id": "90bbc252a7cfe1894b4e48a912e213a8e682e45047b185d7eab8ba33d12b695a",
        "name": "RPL2-01",
        "driver": "makerbot"
    },
    {
        "id": "9af6c7a2cac7db05b950c9bf1cd4ed5ca2b88e5720f28e53c93e5c232746a536",
        "name": "RPL2-05",
        "driver": "makerbot"
    }
];

let statuses = {};

module.exports = (server) => {
    global.logger.info('Initializing socket...');

    let io = require('socket.io')(server);
    let hosts = {};

    let machines = io.of('/machines');
    let users = io.of('/users');

    users.on('connection', function (client) {
        global.logger.info(util.format('Client %s connected to users channel', client.id));
    });

    machines.on('connection', function (client) {
        let hostId = client.handshake.query.host_id;

        if (!hostId) {
            global.logger.error('Client attempted to connect to machines namespace without host ID');
            client.disconnect();
        }

        hosts[hostId] = client;

        global.logger.info(util.format('Client %s (machine ID %s) connected to machines namespace', client.id, hostId));

        client.on('status', function (data) {
            statuses[hostId] = data
        });

        client.on('printer', function (data) {
            global.logger.info('Received request for printer with ID ' + data['device']['id']);

            for (let i = 0; i < profiles.length; i++) {
                if (profiles[i]['id'] === data['device']['id']) {
                    global.logger.info(util.format('Sending printer profile for %s (%s)', profiles[i]['name'], profiles[i]['id']));

                    client.emit('printer_updated', profiles[i], function (response) {
                        global.logger.info(response)
                    });

                    users.emit('printer_updated', profiles[i]);

                    break;
                }
            }
        });

        client.on('disconnect', function () {
            delete hosts[hostId];
        })
    });

    io.on('connection', function (client) {
        global.logger.info(util.format('Client %s connected', client.id));

        client.on('disconnect', function () {
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
        profiles: profiles,
        statuses: statuses
    };
};