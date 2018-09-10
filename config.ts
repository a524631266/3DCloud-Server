import * as fs from "fs";
import { Logger, LogLevel } from "./logger";

export class Config {
    private static obj: object;

    public static load() {
        const content = fs.readFileSync("./config.json", "utf-8");

        this.obj = JSON.parse(content);

        Logger.level = LogLevel.INFO;
    }

    public static get(key: string, defaultValue: any = "boink") {
        const parts = key.split(".");
        let current = this.obj;

        for (const item of parts) {
            Logger.info(item);

            if (!(item in current)) {
                return defaultValue;
            }

            current = current[item];
        }

        return current;
    }
}
