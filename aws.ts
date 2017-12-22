import * as AWS from "aws-sdk";
import { Logger } from "./logger";

const config = require("./config");
const s3 = new AWS.S3({
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    region: config.AWS_REGION
});

const UPLOADS_PREFIX = "uploads/";

export class AWSHelper {
    public static async uploadFile(key, body) {
        const params = {
            Bucket: config.AWS_BUCKET,
            Key: UPLOADS_PREFIX + key,
            Body: body
        };

        const options = {
            queueSize: 1,
            partSize: 1024 * 1024 * 5
        };

        return new Promise((resolve, reject) => {
            s3.upload(params, options, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    public static async getFile(key) {
        Logger.info("Downloading file with key " + key);

        const params = {
            Bucket: config.AWS_BUCKET,
            Key: UPLOADS_PREFIX + key
        };

        return new Promise((resolve, reject) => {
            s3.getObject(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    public static async deleteFile(key) {
        Logger.info("Deleting file with key " + key);

        const params = {
            Bucket: config.AWS_BUCKET,
            Key: UPLOADS_PREFIX + key
        };

        return new Promise((resolve, reject) => {
            s3.deleteObject(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    public static getPresignedDownloadUrl(key, name) {
        const params = {
            Bucket: config.AWS_BUCKET,
            Key: UPLOADS_PREFIX + key,
            Expires: 5,
            ResponseContentDisposition: 'attachment, filename="' + name + '"'
        };

        return s3.getSignedUrl("getObject", params);
    }
}
