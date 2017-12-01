let AWS = require('aws-sdk');
let util = require('util');
let config = require('../../../config');

let s3 = new AWS.S3({accessKeyId: config.aws.accessKeyId, secretAccessKey: config.aws.secretAccessKey, region: config.aws.region});

module.exports = function (db, io) {
    return {
        route: '/files/:file_id/download',
        method: 'get',
        handler: async function (req, res) {
            let file = await db.getFile(req.params['file_id']);

            console.log(file['name']);

            s3.getObject({ Bucket: config.aws.bucket, Key: 'uploads/' + file['key'] }, (err, data) => {
                res.header('Content-Disposition', util.format('attachment; filename="%s"', file['name'])).send(data.Body);
            });
        }
    }
};