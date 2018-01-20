import * as dateFormat from "dateformat";
import * as path from "path";

export class Logger {
    public static level: LogLevel;

    public static trace(message: any) {
        if (this.level <= LogLevel.TRACE)
            this.write(message, "TRACE", 37);
    }

    public static log(message: any) {
        if (this.level <= LogLevel.LOG)
            this.write(message, "LOG", 37);
    }

    public static debug(message: any) {
        if (this.level <= LogLevel.DEBUG)
            this.write(message, "DEBUG", 34);
    }

    public static info(message: any) {
        if (this.level <= LogLevel.INFO || !this.level)
            this.write(message, "INFO", 32);
    }

    public static warn(message: any) {
        if (this.level <= LogLevel.WARN || !this.level)
            this.write(message, "WARN", 33);
    }

    public static error(message: any) {
        if (this.level <= LogLevel.ERROR || !this.level)
            this.write(message, "ERROR", 31);
    }

    public static fatal(message: any) {
        if (this.level <= LogLevel.FATAL || !this.level)
            this.write(message, "FATAL", 31);
    }

    private static stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/i;
    private static stackReg2 = /at\s+()(.*):(\d*):(\d*)/i;

    private static write(message: any, level: string, color: number) {
        const stackLine = (new Error()).stack.split("\n").slice(3)[0];
        const match = this.stackReg.exec(stackLine) || this.stackReg2.exec(stackLine);

        const file = path.basename(match[2]);
        const line = match[3];

        const timestamp = dateFormat("yyyy-mm-dd HH:MM:ss.l");

        console.log(`\u001b[0;${color}m${timestamp} | ${this.padStart(level, 5)} | ${file}:${line} ${message}\u001b[0m`);
    }

    private static padStart(str: string, length: number, fill: string = " ") {
        let result = "";

        for (let i = 0; i < length - str.length; i++) {
            result += fill;
        }

        return result + str;
    }
}

export enum LogLevel {
    TRACE = 0,
    LOG = 1,
    DEBUG = 2,
    INFO = 3,
    WARN = 4,
    ERROR = 5,
    FATAL = 6
}
