let http = require('http');
let express = require('express');
let bodyParser = require('body-parser');
let morgan = require('morgan');
let cors = require('cors');
let dateformat = require('dateformat');

let db = require('./db').DB;
let aws = require('./aws').AWSHelper;

let app = express();
let server = http.createServer(app);

global.logger = require('tracer').colorConsole({
    transport: function(data) {
        console.log(data.output);
    },
    format: [
        "{{timestamp}} <{{title}}> {{file}}:{{line}} {{message}}",
        {
            log:   "\033[0;37m{{timestamp}} |    LOG | {{file}}:{{line}} {{message}}\033[0m",
            trace: "\033[0;37m{{timestamp}} |  TRACE | {{file}}:{{line}} {{message}}\033[0m",
            debug: "\033[0;34m{{timestamp}} |  DEBUG | {{file}}:{{line}} {{message}}\033[0m",
            info:  "\033[0;32m{{timestamp}} |   INFO | {{file}}:{{line}} {{message}}\033[0m",
            warn:  "\033[0;33m{{timestamp}} |   WARN | {{file}}:{{line}} {{message}}\033[0m",  // for colors codes, see:
            error: "\033[0;31m{{timestamp}} |  ERROR | {{file}}:{{line}} {{message}}\033[0m"   // https://en.wikipedia.org/wiki/ANSI_escape_code#Colors
        }
    ],
    dateformat: "yyyy-mm-dd HH:MM:ss.l",
    level: 'log'
});

(async function () {
    global.logger.info('Starting 3DCloud Server');

    await db.connect();

    server.listen(3000);
    server.on('listening', onListening);

    let io = require('./socket.js')(server, db);

    app.use(function(req, res, next) {
        res.success = (data) => {
            res.json({
                'success': true,
                'data': data
            });
        };

        res.error = (message, status = 500) => {
            global.logger.error(message);

            res.status(status).json({
                'success': false,
                'error': {
                    'message': message,
                    'code': status
                }
            });
        };

        res.exception = (ex) => {
            global.logger.error(ex);

            res.status(ex.status || 500).json({
                'success': false,
                'error': {
                    'type': ex.constructor.name || 'Error',
                    'message': ex.message,
                    'code': ex.code,
                    'status': ex.status || 500
                }
            });
        };

        next();
    });

    app.use(cors());

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(bodyParser.raw({ limit: '1000mb', type: '*/*' }));

    app.use(morgan((tokens, req, res) => {
        return [
            dateformat('yyyy-mm-dd HH:MM:ss.l'),
            '|   HTTP |',
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            '-',
            tokens.res(req, res, 'content-length') || 'none',
            '-',
            tokens['response-time'](req, res), 'ms'
        ].join(' ');
    }));

    app.use('/api', require('./api.js')(db, io, aws));

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        let err = new Error('Cannot ' + req.method + ' ' + req.url);
        err.status = 404;
        next(err);
    });

    // error handler
    // noinspection JSUnusedLocalSymbols
    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        res.exception(err);

        global.logger.error(err);
    });
})();

function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;

    global.logger.info('Listening on ' + bind);
}