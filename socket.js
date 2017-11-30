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

/**
 *
 * @param server
 * @param {DB} db
 * @returns {{hosts: {}, profiles: *[], statuses: {}}}
 */
module.exports = (server, db) => {
    global.logger.info('Initializing socket...');

    let io = require('socket.io')(server);
    let hosts = {};

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

        await db.updateHost(hostId);

        global.logger.info(util.format('Client %s (machine ID %s) connected to hosts namespace', client.id, hostId));

        client.on('status', async function (data) {
            statuses[hostId] = data
        });

        client.on('printer', async function (data) {
            global.logger.info('Received request for printer with ID ' + data['device']['id']);

            await db.updateDevice(data['device']['id'], hostId);

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

        client.on('disconnect', async function () {
            delete hosts[hostId];
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
        global.logger.log(JSON.stringify(statuses));
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