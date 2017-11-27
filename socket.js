let util = require('util');

let profiles = [
    {
        "id": "d3b8b322d33baad341613523f1fc5fe327ca400eb8baef2f10216a48bc616603",
        "name": "RPL2-04",
        "host_id": 190016740214819,
        "type": "makerbot"
    },
    {
        "id": "90bbc252a7cfe1894b4e48a912e213a8e682e45047b185d7eab8ba33d12b695a",
        "name": "RPL2-01",
        "host_id": 190016740214819,
        "type": "makerbot"
    },
    {
        "id": "9af6c7a2cac7db05b950c9bf1cd4ed5ca2b88e5720f28e53c93e5c232746a536",
        "name": "RPL2-05",
        "host_id": 190016740214819,
        "type": "makerbot"
    }
];

let statuses = {};

module.exports = (server) => {
    console.log('Initializing socket...');

    let io = require('socket.io')(server);
    let hosts = {};

    let machines = io.of('/machines');
    let users = io.of('/users');

    users.on('connection', function (client) {
        console.log('client ' + client.id + ' connected to users channel');
    });

    machines.on('connection', function (client) {
        let hostId = client.handshake.query.host_id;

        if (!hostId) {
            console.error('Client attempted to connect without host ID');
            client.disconnect();
        }

        hosts[hostId] = client;

        console.log(util.format('Client %s (machine ID %s) connected to machines namespace', client.id, hostId));

        client.on('status', function (data) {
            statuses[hostId] = data
        });

        client.on('printer', function (data) {
            console.log('Received request for printer with ID ' + data['device']['id']);

            for (let i = 0; i < profiles.length; i++) {
                if (profiles[i]['host_id'] === data['host_id'] && profiles[i]['id'] === data['device']['id']) {
                    console.log(util.format('Sending printer profile for %s (%s)', profiles[i]['id'], profiles[i]['name']));
                    client.emit('printer_updated', profiles[i], function (response) {
                        console.log(response)
                    });
                    break;
                }
            }
        });

        client.on('disconnect', function () {
            delete hosts[hostId];
        })
    });

    io.on('connection', function (client) {
        console.log(util.format('Client %s connected', client.id));

        client.on('disconnect', function () {
            console.log('client disconnected');
        });
    });

    let statusUpdate = () => {
        users.emit('status', statuses);
        setTimeout(statusUpdate, 1000);
    };

    statusUpdate();

    console.log('Socket initialized');

    return {
        hosts: hosts,
        profiles: profiles,
        statuses: statuses
    };
};