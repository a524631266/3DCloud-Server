let profiles = [
    {
        "id": "oe586ubqeyvoa4",
        "host_id": 190016740214819,
        "type": "makerbot",
        "device": {
            "com": "/dev/ttyACM0",          // todo: get rid of this
            "vendor_id": "23c1",
            "product_id": "b016",
            "serial": "7533131303335111C2A1",
        }
    }
];

module.exports = (server) => {
    console.log('Initializing socket');

    let io = require('socket.io')(server);

    io.on('connection', function (client) {
        console.log('client connected');

        client.on('status', function (data) {
            console.log('status: ' + JSON.stringify(data))
        });

        client.on('printer', function (data, ack) {
            console.log('got printer: ' + JSON.stringify(data));

            for (let i = 0; i < profiles.length; i++) {
                if (profiles[i]['host_id']              === data['host_id'] &&
                    profiles[i]['device']['com']        === data['device']['com'] &&    // todo: get rid of this
                    profiles[i]['device']['vendor_id']  === data['device']['vendor_id'] &&
                    profiles[i]['device']['product_id'] === data['device']['product_id'] &&
                    profiles[i]['device']['serial']     === data['device']['serial']) {
                    ack({'defined': true, 'profile': profiles[i]});
                }
            }

            ack({'defined': false})
        });

        client.on('disconnect', function () {
            console.log('client disconnected');
        });
    });

    console.log('Socket initialized');

    return io;
};