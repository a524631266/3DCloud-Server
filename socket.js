let profiles = [
    {
        "id": "d3b8b322d33baad341613523f1fc5fe327ca400eb8baef2f10216a48bc616603",
        "host_id": 190016740214819,
        "type": "makerbot"
    }
];

module.exports = (server) => {
    console.log('Initializing socket');

    let io = require('socket.io')(server);
    let hosts = {};

    io.on('connection', function (client) {
        console.log('client ' + client.id + ' (' + client.handshake.query.host_id + ') connected');

        let hostId = client.handshake.query.host_id;
        hosts[hostId] = client;

        client.on('status', function (data) {
            console.log('status: ' + JSON.stringify(data))
        });

        client.on('printer', function (data, ack) {
            console.log('got printer: ' + JSON.stringify(data));

            for (let i = 0; i < profiles.length; i++) {
                if (profiles[i]['host_id']   === data['host_id'] &&
                    profiles[i]['id'] === data['device']['id']) {
                    ack({'defined': true, 'profile': profiles[i]});
                }
            }

            ack({'defined': false})
        });

        client.on('disconnect', function () {
            delete hosts[hostId];
            console.log('client disconnected');
        });
    });

    console.log('Socket initialized');

    return hosts;
};