import * as dateFormat from "dateformat";
import * as path from "path";

export class Logger {
    public static log(message: string) {
        this.write(message, "LOG", 37);
    }

    public static trace(message: string) {
        this.write(message, "TRACE", 37);
    }

    public static debug(message: string) {
        this.write(message, "DEBUG", 34);
    }

    public static info(message: string) {
        this.write(message, "INFO", 32);
    }

    public static warn(message: string) {
        this.write(message, "WARN", 33);
    }

    public static error(message: string) {
        this.write(message, "ERROR", 31);
    }

    public static fatal(message: string) {
        this.write(message, "FATAL", 31);
    }

    private static stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/i;
    private static stackReg2 = /at\s+()(.*):(\d*):(\d*)/i;

    private static write(message: string, level: string, color: number) {
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
