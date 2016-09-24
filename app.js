
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    color = require('./routes/color'),
    custom = require('./routes/custom'),
    http = require('http'),
    path = require('path'),
    request = require('request'),
    _ = require('underscore'),
    WebSocketServer = require('ws').Server;

var app = express();

var wss;

// all environments
app.set('port',  process.env.TRACKER_PORT || 3000);
app.set('host',  process.env.TRACKER_HOST || 'localhost');
app.set('bothost',  process.env.BOTHOST || null);
app.set('botservice',  process.env.BOTSERVICE || null);
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
app.get('/custom', custom.track);

// REST services
app.get('/color/rest/list', color.list);

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

var lastColor = "", lastExpression = "";

wss.on('connection', function(ws) {
  ws.on('message', _.debounce(function() {
    var message = arguments[0];
    var msg = JSON.parse(message || {});
    console.log("*******",message);

    if (msg && msg.color) {
        // do whatever
        console.log(msg.color+" postIt note detected");
        if (lastColor !== msg.color) {
            lastColor = msg.color;
            postToBot("The cat says......you are holding a "+msg.color+" postIt note!  Meow!");
        }
    } else if (msg && msg.expression) {
        console.log(msg.expression+" detected");
        if (lastExpression !== msg.expression) {
            lastExpression = msg.expression;
            postToBot("The cat says......you are " + (msg.expression === 'smile' ? "happy" : "sad") + "! Meow!"); 
        }
    }
  }, 100, true));
});

function postToBot(message) {
    var webhook_host = app.get('bothost');
    var webhook_path = app.get('botservice');

    if (!webhook_host || !webhook_path) {
        console.log("NO BOTURL CONFIGURED.  CANNOT POST TO BOT");
        return;
    }

    var post_data = {
        channel: "#random",
        username: "catbot",
        text: message,
        icon_emoji: ":cat2:"
    };

    var post_options = {
        host: webhook_host,
        path: webhook_path,
        method: 'POST',
        headers: {
            //'Content-Type': 'application/x-www-form-urlencoded',
            'Context-Type': 'application/json',
            'Content-Length': Buffer.byteLength(post_data)
        }
    };

    console.log("Sending: ",post_data);
    console.log("with opts: ",post_options);

    var url = webhook_host+webhook_path;

    request.post(url, 
        {json: post_data},
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
            }
        }
    );
}

function handleColor(data) {
    wss.clients.forEach(function(client){
        try {
            //console.log("Sending emotion data to browser: ",JSON.stringify(data));
            client.send(JSON.stringify(data));
        } catch(e) {
            console.log("error updating clients: ",e);
        }
    });
};
