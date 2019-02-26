/* eslint-disable no-console */
var express = require('express');
require('express-async-errors');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require("request");

let mw = require('./routes/middleware');

// Global variables will be used in functions
var log_task_id;
var channel_name;
var average_sentiment = 0;
var sentiment_count = 0;


// Set up the winston logger
let wins = require('winston');
const safeStringify = require('fast-safe-stringify');
let log_level = "debug";

if (process.env.LOG_LEVEL) log_level = process.env.LOG_LEVEL;
const customPrinter = wins.format.printf((info) => {
    if (info instanceof Error) {
        if (info.name == "StatusCodeError") {
            let level = info.level;
            delete info.level;
            return `${level}: ${info.name}: ${info.message}\n${safeStringify(info, null, '  ')}`;
            info.message = JSON.stringify(info, null, '  ');
        } else {
            if (info.stack) {
                return `${info.level}: ${info.stack}`;
            } else {
                return `${info.level}: ${info.name} - ${info.message}`;
            }
        }
    } else {
        if (typeof info.message == 'object') {
            return `${info.level}: ${safeStringify(info.message, null, '  ')}`;
        } else {
            return `${info.level}: ${info.message}`;
        }
    }
});
wins.configure({
    format: customPrinter,
    transports: [new wins.transports.Console()],
    level: log_level
});

// Terminate on unhandle Promise rejections
process.on('unhandledRejection', e => {
  wins.error("UNHANDLED PROMISE EXCEPTION");
  wins.error(e);
  process.exit(1);
});

// Routes
let index = require('./routes/index');

// Initial render of the frontend HTML
// index.renderFrontend();

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');

// Middleware for enforcing https on heroku
var enforceHttps = (req, res, next) => {
    if (req.header('x-forwarded-proto') != 'https') {
        res.redirect(301, `https://${req.get('host')}${req.originalUrl}`);
    } else {
        next();
    }
};

if (process.env.NODE_ENV == 'production') {
  // Uncomment the line below to enforce HTTPS in production on Heroku
  // app.use(enforceHttps);
} else {
  app.locals.pretty = true;
  app.use((req, res, next) => {
    // In dev mode every page load will re-render the frontend
    // index.renderFrontend();
    next();
  });
}

app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-twitch-jwt');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
    // Note that the origin of an extension iframe will be null
    // so the Access-Control-Allow-Origin has to be wildcard.
    res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.use('/', index);
app.use('/frontend', express.static(path.join(__dirname, 'frontend')));


app.use(bodyParser.json());

//  View that collects the stremer name and assigns it to global variable
app.post('/collect_channel_name', function(req, res){
  // you have address available in req.body:
  console.log(req.body);
  var request_body = (req.body); // { channel_Id: '154139682' }
  // collect channe_id from json request
  var channel_id = request_body.channel_Id;

  console.log(channel_id);
  // always send a response:
  res.json({ ok: true });
  // run function that gets the streamer name
  getStreamerNameLogging(channel_id);
  });

//   View that posts average sentiment and timestamp to frontend
app.post('/collect_chat_analysis', function(req, res){
  // you have address available in req.body:
  console.log(req.body);
  var request_body = (req.body); // { channel_Id: '154139682' }
  // collect channe_id from json request
  var channel_id = request_body.channel_Id;

  console.log(channel_id);
  // always send a response:
  res.json({ ok: true });
  // run function that gets the streamer name
  getStreamerNameAnalysis(channel_id);

  });


 // get streamer name so we can start logging the chat
function getStreamerNameLogging(channel_id) {
    var options = { method: 'GET',
    url: 'https://api.twitch.tv/helix/users',
    qs: { id: channel_id },
    headers: { 'Client-ID': 's72s2j2mm94920a4hk4921e5vc67ks' }};

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        // Collect login name from response
        // console.log(body);
        var channel_detail = JSON.parse(body).data;
        channel_name = channel_detail[0].login;
        startLogging(channel_name);
    });
}

 // get streamer name so we can analyse the chat
 function getStreamerNameAnalysis(channel_id) {
  var options = { method: 'GET',
  url: 'https://api.twitch.tv/helix/users',
  qs: { id: channel_id },
  headers: { 'Client-ID': 's72s2j2mm94920a4hk4921e5vc67ks' }};

  request(options, function (error, response, body) {
      if (error) throw new Error(error);
      // Collect login name from response
      // console.log(body);
      var channel_detail = JSON.parse(body).data;
      channel_name = channel_detail[0].login;
      collectAnalysis(channel_name);
  });
}
    

// send post request to server to start logging process
function startLogging(channel_name){
  var options = {
      uri: 'http://127.0.0.1:8000/initiate_logging/',
      method: 'POST',
      json: {
        "streamer_id": channel_name
      }
    };
      
  request(options, function (error, response, body) {
    if (response.statusCode == 201) {
        // collect log_task_id from response. it will be used to terminate logging
        // console.log("This is the body!");
        // console.log(body); // Print the shortened url.
        // var request_body = JSON.parse(body, 'utf8').data; // [ 'Logging of twitch chat has began successfully.','8b8b816e-f425-414a-a9b2-87148cfa2974' ]
        for (var i = 0, l = body.length; i < l; i++){
          var obj = body[i];
          // console.log(obj)
          log_task_id = obj
        }
        return (log_task_id)
        
    }else{
        // console.log(response);
        console.log("This is an error!")
        console.log(error);
        console.log(body);
    }
  });
}

// Collects the comments and sentiment sent by the server and
// calculates the average sentiment. Must be ran afer the startLogging function.
function collectAnalysis(streamer_name){
  var options = {
    uri: 'http://127.0.0.1:8000/initiate_analysis/',
    method: 'POST',
    json: {
      "streamer_id": streamer_name
    }
  };

  // Send request and collect response which consists of comments, their score and its timestamp
  request(options, function (error, response, body) {
    if (response.statusCode == 201) {
        // collect comment, score, timestamp from response, calculate average and send it to frontend
        // console.log("This is the latest analysis!!!!");
        // console.log(body); // Print the response we get.
        var request_body = (body); 
        // [
        //   {
        //       "message": "hows everyone doing?\r",
        //       "timestamp": "2019-02-25 17:02:49.053323+00:00",
        //       "sentiment_score": 0
        //   },
        //   {
        //       "message": "Solidarity!\r",
        //       "timestamp": "2019-02-25 17:02:57.357600+00:00",
        //       "sentiment_score": 0.3595
        //   }
        // ]

        request_body.forEach(function (arrayItem) {
        // Collect individual JSON objects
        var comment = arrayItem;
        // console.log(comment);
        // Loop through each JSON Object and collect score
        for (var key in comment) {
          if (comment.hasOwnProperty(key) &&  key === "sentiment_score") {
              // console.log(key + " -> " + comment[key]);
              var score = comment[key];
              console.log(score);
              sentiment_count = sentiment_count + 1;
              console.log("Sentiment Count!!");
              console.log(sentiment_count);
              average_sentiment = (average_sentiment + score)/sentiment_count;
              console.log("average sentiment");
              console.log(average_sentiment);
          }
        }
      });
        console.log("This is the id!");
        console.log(log_task_id);
        return log_task_id;

    }else{
        // console.log(response);
        console.log("This is an error!")
        console.log(error);
        console.log(body);
    }
    });
}


// send post request to server to stop logging a stream
function stopLogging(log_task_id){
    var options = {
        uri: 'http://ChatSnitcherServer-dev2.eu-west-2.elasticbeanstalk.com/terminate_logging/',
        method: 'POST',
        json: {
          "log_task_id": log_task_id
        }
      };
      
    request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(response);
        console.log(body); // Print the shortened url.
    }else{
        console.log(response);
        console.log(error);
        console.log(body)
    }
    });
}


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


app.use(mw.customErrorHandler);

// error handler
app.use(function(err, req, res, next) {
    wins.error("Caught error in backup error handler!");
    wins.error(err);

    // render the error page
    if (err.status == 404) {
      res.status(404).send({err: "Page Not Found!"});
    } else {
      res.status(500).send({err: "Server Error"});
    }
});
module.exports = app;
