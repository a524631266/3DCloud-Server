let AWS = require('aws-sdk');
let config = require('./config');

let s3 = new AWS.S3({accessKeyId: config.aws.accessKeyId, secretAccessKey: config.aws.secretAccessKey, region: config.aws.region});

const UPLOADS_PREFIX = 'uploads/';

module.exports.AWSHelper = class {
    static async uploadFile(key, body) {
        let params = {
            Bucket: config.aws.bucket,
            Key: UPLOADS_PREFIX + key,
            Body: body
        };

        return new Promise((resolve, reject) => {
            s3.putObject(params, (err, data) => {
                if (err)
                    reject(err);
                else
                    resolve(data);
            })
        })
    }

    static async getFile(key) {
        global.logger.info('Downloading file with key ' + key);

        let params = {
            Bucket: config.aws.bucket,
            Key: UPLOADS_PREFIX + key
        };

        return new Promise((resolve, reject) => {
            s3.getObject(params, (err, data) => {
                if (err)
                    reject(err);
                else
                    resolve(data);
            })
        });
    }

    static async deleteFile(key) {
        global.logger.info('Deleting file with key ' + key);

        let params = {
            Bucket: config.aws.bucket,
            Key: UPLOADS_PREFIX + key
        };

        return new Promise((resolve, reject) => {
            s3.deleteObject(params, (err, data) => {
                if (err)
                    reject(err);
                else
                    resolve(data);
            })
        })
    }
};