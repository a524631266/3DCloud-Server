"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require("aws-sdk");
const config = require("./config");
const s3 = new AWS.S3({
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    region: config.AWS_REGION
});
const UPLOADS_PREFIX = "uploads/";
class AWSHelper {
    static uploadFile(key, body, progress) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    }
                    else {
                        resolve(data);
                    }
                }).on("httpUploadProgress", (event) => {
                    progress(event.loaded, event.total);
                });
            });
        });
    }
    static getFile(key) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.info("Downloading file with key " + key);
            const params = {
                Bucket: config.AWS_BUCKET,
                Key: UPLOADS_PREFIX + key
            };
            return new Promise((resolve, reject) => {
                s3.getObject(params, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
            });
        });
    }
    static deleteFile(key) {
        return __awaiter(this, void 0, void 0, function* () {
            global.logger.info("Deleting file with key " + key);
            const params = {
                Bucket: config.AWS_BUCKET,
                Key: UPLOADS_PREFIX + key
            };
            return new Promise((resolve, reject) => {
                s3.deleteObject(params, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
            });
        });
    }
    static getPresignedDownloadUrl(key, name) {
        const params = {
            Bucket: config.AWS_BUCKET,
            Key: UPLOADS_PREFIX + key,
            Expires: 5,
            ResponseContentDisposition: 'attachment, filename="' + name + '"'
        };
        return s3.getSignedUrl("getObject", params);
    }
}
exports.AWSHelper = AWSHelper;
//# sourceMappingURL=aws.js.map