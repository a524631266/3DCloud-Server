require("source-map-support").install();

import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as dateFormat from "dateformat";
import * as express from "express";
import * as http from "http";
import * as morgan from "morgan";

import { Manager } from "./manager";

const config = require("./config");

const app = express();
const server = http.createServer(app);

global.logger = console;

(async () => {
    global.logger.info("Starting 3DCloud Server");

    server.listen(config.SERVER_PORT);
    server.on("listening", onListening);

    const manager = new Manager(server);

    app.use((req, res, next) => {
        res.success = (data) => {
            res.json({
                data: data,
                success: true
            });
        };

        res.error = (message, status = 500) => {
            global.logger.error(message);

            res.status(status).json({
                success: false,
                error: {
                    message: message,
                    code: status
                }
            });
        };

        res.exception = (ex) => {
            global.logger.error(ex);

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
            tokens.res(req, res, "content-length") || "none",
            "-",
            tokens["response-time"](req, res), "ms",
        ].join(" ");
    }));

    app.use("/api", require("./api.js")(manager));

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

        global.logger.error(err);
    });
})();

function onListening() {
    const addr = server.address();
    const bind = typeof addr === "string"
        ? "pipe " + addr
        : "port " + addr.port;

    global.logger.info("Listening on " + bind);
}
