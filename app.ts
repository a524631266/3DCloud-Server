import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as dateFormat from "dateformat";
import * as express from "express";
import * as http from "http";
import * as morgan from "morgan";
import * as sourceMapSupport from "source-map-support";

import { Request, Response } from "express";
import { Api } from "./api";
import { Config } from "./config";
import { Logger } from "./logger";
import { Manager } from "./manager";

Logger.info("Starting 3DCloud Server");

sourceMapSupport.install();

try {
    Config.load();
} catch (ex) {
    Logger.error(ex);
    process.exit(1);
}

const app = express();
const server = http.createServer(app);

(async () => {
    server.listen(Config.SERVER_PORT);
    server.on("listening", onListening);

    const manager = new Manager(server);

    await manager.init();

    app.use((req: Request, res: Response, next) => {
        res.success = (data: any) => {
            res.json({
                data: data,
                success: true
            });
        };

        res.error = (message: string, status: number = 500) => {
            Logger.error(message);

            res.status(status).json({
                success: false,
                error: {
                    message: message,
                    code: status
                }
            });
        };

        res.exception = (ex) => {
            Logger.error(ex);
            console.trace(ex);

            res.status(ex.status || 500).json({
                success: false,
                error: {
                    type: ex.type || ex.constructor.name || "Error",
                    message: ex.message,
                    code: ex.code,
                    status: ex.status || 500
                },
            });
        };

        next();
    });

    app.use(cors());

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    app.use(morgan((tokens, req, res) => {
        return [
            dateFormat("yyyy-mm-dd HH:MM:ss.l"),
            "|   HTTP |",
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            "-",
            tokens.res(req, res, "content-length"),
            "-",
            tokens["response-time"](req, res), "ms",
        ].join(" ");
    }));

    app.use("/api", Api.init(manager));

    // catch 404 and forward to error handler
    app.use((req, res, next) => {
        const err = new Error("Cannot " + req.method + " " + req.url);
        next(err);
    });

    // error handler
    // noinspection JSUnusedLocalSymbols
    app.use((err, req, res, next) => {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get("env") === "development" ? err : {};

        res.exception(err);

        Logger.error(err);
    });
})();

function onListening() {
    const addr = server.address();
    const bind = typeof addr === "string"
        ? "pipe " + addr
        : "port " + addr.port;

    Logger.info("Listening on " + bind);
}
