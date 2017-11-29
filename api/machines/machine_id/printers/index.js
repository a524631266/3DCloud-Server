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

module.exports = function (io) {
    return {
        route: '/machines/:machine_id/printers',
        method: 'get',
        handler: function (req, res) {
            let printers = [];

            for (let profile in profiles) {
                printers.push({
                    'id': profiles[profile]['id'],
                    'name': profiles[profile]['name']
                })
            }

            res.send(printers);
        }
    }
};