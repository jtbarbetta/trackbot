
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path'),
    WebSocketServer = require('ws').Server;

var app = express();

var wss;

// all environments
app.set('port',  process.env.TRACKER_PORT || 3000);
app.set('host',  process.env.TRACKER_HOST || 'localhost');
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.users);
//app.get('/word_count', user.word_count);

// REST services for geographical
//app.get('/geographical/rest/housingAvgs', geographical.housingAvgs);

// web UI for geographical
//app.get('/geographical/maps', geographical.maps);

var server = http.createServer(app).listen(
  app.get('port'), 
  app.get('host'), 
  function(){
    console.log('Express server listening on port ' + app.get('port'));
  }
);

wss = new WebSocketServer({
  server: server
});

wss.on('connection', function(ws) {
  ws.on('message', function(message) {
    var msg = JSON.parse(message);

    console.log("*******",message);

    // Not really using this now - could be anything really.
    if (msg && msg.color) {
        // do whatever
        console.log(msg.color+" postIt note detected");
    } else if (msg && msg.expression) {
        console.log(msg.expression+" detected");
    }
  });
});

/*
trackerbot.startUpdates(function(data){
    // we got data from the bot 
    var data = JSON.parse(data);
    if (data && data.type === 'emotion') {
        //console.log("Got emotion data from trackerbot: ",JSON.stringify(data));
        // If we need to do anything with the data now is our chance.
        handleEmotion(data);
    }
});
*/

function handleEmotion(data) {
    wss.clients.forEach(function(client){
        try {
            //console.log("Sending emotion data to browser: ",JSON.stringify(data));
            client.send(JSON.stringify(data));
        } catch(e) {
            console.log("error updating clients: ",e);
        }
    });
};
