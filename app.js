/**
* Module dependencies.
*/
// mongoose setup
var express = require( 'express' );
var http = require( 'http' );
var path = require( 'path' );
var logger = require( 'morgan' );
var errorHandler = require( 'errorhandler' );
var static = require( 'serve-static' );
var routes = require( './routes' );

var app = express();

app.engine('jade', require('jade').__express);

app.set( 'views', path.join( __dirname, 'views' ));
app.set( 'view engine', 'jade' );
app.use( logger( 'dev' ));

app.get( '/', routes.index );
app.use( static( path.join( __dirname, 'public' )));

app.set( 'port', process.env.PORT || 3000 );

// development only
if( 'development' == app.get( 'env' )){
    app.use( errorHandler());
}

app.get('/', function (req, res) {
  res.render('index', { title: 'Hey', message: 'Hello there!'});
});

// ### UCI Engine Communication Stuff ###

var notifyClient = function(type,data){
    var eventData = {type: type,
                     data : data};
    return JSON.stringify(eventData);
}

var sockjs = require('sockjs');
var sockjs_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"};
var sockjs_engine = sockjs.createServer(sockjs_opts);

var Engine = require('uci');
var engine = new Engine('/Volumes/DATA/bin/stockfish-5-mac/Mac/stockfish-5-64');

engine.runProcess().then(function () {
    console.log('Started');
    return engine.uciCommand();
}).then(function (idAndOptions) {
    console.log('Engine name - ' + idAndOptions.id.name);
    return engine.isReadyCommand();
}).then(function () {
    console.log('Ready');
    return engine.uciNewGameCommand();
}).done();

sockjs_engine.on('connection', function(conn) {
    conn.on('data', function(message) {
        var boardInfo = JSON.parse(message);
        console.log(boardInfo);
        engine.positionCommand(boardInfo.fen,boardInfo.from + "" + boardInfo.to).then(function () {
            console.log('Starting position set');
            console.log('Starting analysis');
            return engine.goInfiniteCommand(function infoHandler(info) {
                console.log(info);
                conn.write(notifyClient("log",info));
            });
        }).delay(2000).then(function () {
            console.log('Stopping analysis');
            return engine.stopCommand();
        }).then(function (bestmove) {
            console.log('Bestmove: ');
            console.log(bestmove);
            conn.write(notifyClient("move",bestmove));
            //return engine.quitCommand();
        });
    });
});

// ### Start Server ###

var server = http.createServer( app );

sockjs_engine.installHandlers(server, {prefix:'/engine'});

server.listen( app.get( 'port' ), function (){
    console.log( 'Listening on port ' + app.get( 'port' ));
});

process.on('exit', function(code) {
  console.log('NODE is shutting down with code ' + code);
    engine.quitCommand().then(function () {
        console.log('Chess Engine Stopped');
    }).fail(function (error) {
        console.log(error);
    });
});
