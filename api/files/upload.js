let AWS = require('aws-sdk');
let util = require('util');
let config = require('../../config');
let crypto = require('crypto');
let uniqid = require('uniqid');

let s3 = new AWS.S3({accessKeyId: config.aws.accessKeyId, secretAccessKey: config.aws.secretAccessKey, region: config.aws.region});

module.exports = function (db, io) {
    return {
        route: '/files/upload',
        method: 'put',
        handler: function (req, res) {
            global.logger.log('Got file upload request');

            if (!req.query['name'])
                res.error('Name must be specified');

            if (!req.body)
                res.error('Body is empty');

            let key = uniqid();

            global.logger.log(util.format('Uploading file to "uploads/%s"...', key));

            let params = {
                Body: req.body,
                Bucket: config.aws.bucket,
                Key: 'uploads/' + key
            };

            s3.putObject(params, async (err, data) => {
                if (err) {
                    res.exception(err);
                } else {
                    try {
                        await db.addFile(key, req.query['name']);
                        res.json({'success': true, 'data': data});
                    } catch (ex) {
                        res.exception(ex);
                    }
                }
            });
        }
    }
};