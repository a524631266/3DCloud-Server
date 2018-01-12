import * as AWS from "aws-sdk";
import { Config } from "./config";
import { Logger } from "./logger";

const UPLOADS_PREFIX = "uploads/";

export class AWSHelper {
    private s3: AWS.S3;

    constructor() {
        this.s3 = new AWS.S3({
            accessKeyId: Config.AWS_ACCESS_KEY_ID,
            secretAccessKey: Config.AWS_SECRET_ACCESS_KEY,
            region: Config.AWS_REGION
        });
    }

    public async uploadFile(key, body) {
        const params = {
            Bucket: Config.AWS_BUCKET,
            Key: UPLOADS_PREFIX + key,
            Body: body
        };

        const options = {
            queueSize: 1,
            partSize: 1024 * 1024 * 5
        };

        return new Promise((resolve, reject) => {
            this.s3.upload(params, options, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    public async getFile(key) {
        Logger.info("Downloading file with key " + key);

        const params = {
            Bucket: Config.AWS_BUCKET,
            Key: UPLOADS_PREFIX + key
        };

        return new Promise((resolve, reject) => {
            this.s3.getObject(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    public async deleteFile(key) {
        Logger.info("Deleting file with key " + key);

        const params = {
            Bucket: Config.AWS_BUCKET,
            Key: UPLOADS_PREFIX + key
        };

        return new Promise((resolve, reject) => {
            this.s3.deleteObject(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    public getPresignedDownloadUrl(key, name) {
        const params = {
            Bucket: Config.AWS_BUCKET,
            Key: UPLOADS_PREFIX + key,
            Expires: 5,
            ResponseContentDisposition: 'attachment, filename="' + name + '"'
        };

        return this.s3.getSignedUrl("getObject", params);
    }
}
