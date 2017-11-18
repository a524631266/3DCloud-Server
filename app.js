let http = require('http');
let express = require('express');
let bodyParser = require('body-parser');
let requireDirectory = require('require-directory');

let app = express();
let router = express.Router();
let server = http.createServer(app);

server.listen(3000);
server.on('listening', onListening);

let hosts = require('./socket.js')(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

let endpoints = require('./api');

for (let i in endpoints) {
    let endpoint = endpoints[i](hosts);
    console.log('Adding endpoint ' + endpoint.route);
    router[endpoint.method](endpoint.route, endpoint.handler)
}

app.use('/', router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
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

    console.error(err);
});

function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;

    console.log('Listening on ' + bind);
}
