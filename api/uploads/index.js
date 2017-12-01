let AWS = require('aws-sdk');
let util = require('util');

let s3 = new AWS.S3({accessKeyId: 'AKIAIZJK5BFS3FOUKA7Q', secretAccessKey: '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'});

let baseRoute = '/uploads';
let bucket = 'richard-labbe-makerspace';
let prefix = 'uploads/';

module.exports = function (db, io) {
    return {
        route: baseRoute + '/*',
        method: 'get',
        handler: function (req, res) {
            let requestedKey = decodeURIComponent(req.originalUrl.substr(req.baseUrl.length + baseRoute.length + 1));

            console.log(requestedKey);

            s3.getObject({ Bucket: bucket, Key: prefix + requestedKey }, (err, data) => {
                if (!data)
                    res.error('Key not found', 404);
                else if (data.ContentType === 'application/x-directory')
                    listDirectory(requestedKey, res);
                else
                    streamObject(requestedKey, res);
            });
        }
    }
};

function listDirectory(requestedKey, res) {
    s3.listObjectsV2({ Bucket: bucket, Prefix: prefix + requestedKey }, (err, data) => {
        let objects = [];

        data.Contents.forEach(obj=> {
            let name = obj.Key;

            if (prefix)
                name = obj.Key.substr(prefix.length);

            if (name) {
                objects.push({
                    'key': name,
                    'modified': obj.LastModified,
                    'etag': obj.ETag,
                    'size': obj.Size
                })
            }
        });

        res.json({
            'success': true,
            'data': objects
        });
    });
}

function streamObject(requestedKey, res) {
    global.logger.log(util.format('Streaming key "%s"...', prefix + requestedKey));

    let request = s3.getObject({ Bucket: bucket, Key: prefix + requestedKey });

    let stream = request.createReadStream();

    stream.pipe(res);
}