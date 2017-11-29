let http = require('http');
let express = require('express');
let bodyParser = require('body-parser');
let cors = require('cors');

let app = express();
let server = http.createServer(app);

global.logger  = require('tracer').colorConsole({
    transport: function(data) {
        console.log(data.output);
    },
    format: [
        "{{timestamp}} <{{title}}> {{file}}:{{line}} {{message}}",
        {
            log:   "\033[0;37m{{timestamp}} |    LOG | {{file}}:{{line}} {{message}}\033[0m",
            debug: "\033[0;34m{{timestamp}} |  DEBUG | {{file}}:{{line}} {{message}}\033[0m",
            info:  "\033[0;32m{{timestamp}} |   INFO | {{file}}:{{line}} {{message}}\033[0m",
            warn:  "\033[0;33m{{timestamp}} |   WARN | {{file}}:{{line}} {{message}}\033[0m",// for colors codes, see:
            error: "\033[0;31m{{timestamp}} |  ERROR | {{file}}:{{line}} {{message}}\033[0m"   // https://en.wikipedia.org/wiki/ANSI_escape_code#Colors
        }
    ],
    dateformat: "yyyy-mm-dd HH:MM:ss.l",
    level: 'log'
});

global.logger.info('Starting 3DCloud Server');

server.listen(3000);
server.on('listening', onListening);

let io = require('./socket.js')(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(cors());

app.use('/api', require('./api.js')(io));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error(req.url + ' Not Found');
    err.status = 404;
    next(err);
});

// error handler
// noinspection JSUnusedLocalSymbols
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);

    res.json({
        'success': false,
        'error': {
            'type': err.constructor.name,
            'message': err.message
        }
    });

    global.logger.error(err);
});

function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;

    global.logger.info('Listening on ' + bind);
}