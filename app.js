let http = require('http');
let express = require('express');
let bodyParser = require('body-parser');

let app = express();
let router = express.Router();
let server = http.createServer(app);

server.listen(3000);
server.on('listening', onListening);

let io = require('./socket.js')(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

router.get('/print', function(req, res) {
    io.emit('print', {'printer_id': req.query.printer_id, 'name': req.query.name});
    res.send('printing...');
});

router.get('/pause', function(req, res) {
    io.emit('pause', {'printer_id': req.query.printer_id});
    res.send('pausing...');
});

router.get('/unpause', function(req, res) {
    io.emit('unpause', {'printer_id': req.query.printer_id});
    res.send('unpausing...');
});

app.use('/', router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send('error');

    console.error(err);
});

function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;

    console.log('Listening on ' + bind);
}
