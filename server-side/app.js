var http = require('http'),
    path = require('path'),
    fileUpload = require('express-fileupload'),
    methods = require('methods'),
    express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    cors = require('cors'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    errorhandler = require('errorhandler');


// Create global app object
var app = express();
app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Access-Control-Allow-Headers", "Content-Type");
        res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
        next();
    });
// Use sockets for realtime updates about file loading
var server = require('http').Server(app);
var io = require('socket.io')(server);
global.io = io;

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
});

// Connect to DB
mongoose.connect('mongodb://localhost/csvfile', function(err){
  console.log(err);
});

app.use(cors());
app.use(fileUpload());

// Normal express config defaults
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(session({ secret: 'conduit', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));

app.use(errorhandler());
app.use(express.static(__dirname + '/public'));

var routes = require('./routes/csvRoutes'); //importing route
routes(app); //register the route


//Get index page
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({'errors': {
    message: err.message,
    error: {}
  }});
});

// finally, let's start our server...
server.listen( process.env.PORT || 3000, function(){
  console.log('Listening on port ' + server.address().port);
});
