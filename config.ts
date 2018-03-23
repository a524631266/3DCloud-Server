import { Logger, LogLevel } from "./logger";

export class Config {
    public static SERVER_PORT;

    public static AWS_ACCESS_KEY_ID;
    public static AWS_SECRET_ACCESS_KEY;
    public static AWS_REGION;
    public static AWS_BUCKET;

    public static DATABASE_URL;
    public static DATABASE_PORT;
    public static DATABASE_NAME;

    public static load() {
        /* tslint:disable:no-var-requires */
        const config = require("./config.json");

        this.SERVER_PORT = config.SERVER_PORT || 3000;

        this.AWS_ACCESS_KEY_ID = config.AWS_ACCESS_KEY_ID;
        this.AWS_SECRET_ACCESS_KEY = config.AWS_SECRET_ACCESS_KEY;
        this.AWS_REGION = config.AWS_REGION;
        this.AWS_BUCKET = config.AWS_BUCKET || "3dcloud";

        this.DATABASE_URL = config.DATABASE_URL || "localhost";
        this.DATABASE_PORT = config.DATABASE_PORT || 27017;
        this.DATABASE_NAME = config.DATABASE_NAME || "3dcloud";

        if (!this.AWS_ACCESS_KEY_ID) {
            throw new Error("AWS_ACCESS_KEY_ID must be defined in config.json");
        }

        if (!this.AWS_SECRET_ACCESS_KEY) {
            throw new Error("AWS_SECRET_ACCESS_KEY must be defined in config.json");
        }

        if (!this.AWS_REGION) {
            throw new Error("AWS_REGION must be defined in config.json");
        }

        Logger.level = LogLevel.INFO;
    }
}
