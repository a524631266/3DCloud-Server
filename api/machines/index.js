module.exports = function(io) {
    return {
        route: '/machines',
        method: 'get',
        handler: function (req, res) {
            let hosts = [];

            for (let hostId in io.hosts) {
                // noinspection JSUnfilteredForInLoop
                hosts.push({
                    'id': hostId
                });
            }

            res.send(hosts);
        }
    }
};