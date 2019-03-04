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

// Deal with global variables

// global average sentiment variable
var setGlobalSentiment = (function(global) {
  return function(value) {
    global.average_sentiment = value;
  }
}(this));
var readGlobalSentiment = (function(global) {
  return function() {
    return global.average_sentiment;
  }
}(this));

// initialise global sentiment score
setGlobalSentiment(0);

var setGlobalSentCount = (function(global) {
  return function(value) {
    global.sentiment_count = value;
  }
}(this));
var readGlobalSentCount = (function(global) {
  return function() {
    return global.sentiment_count;
  }
}(this));

// Initialise sentiment count
setGlobalSentCount(0);


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
  console.log('unhandledRejection');
  console.log(e);
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
  console.log("We are in production!!!");
} else {
  app.locals.pretty = true;
  app.use((req, res, next) => {
    console.log("We are not in production!!!");
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

//  View that starts logging a channels chat
app.use('/collect_channel_name', function(req, res){
  console.log("Colect channel name!")
  // console.log(req.body);
  var request_body = (req.body); // { channel_Id: 'ninja' }
  // collect channe_id from json request
  var channel_name = request_body.channel_Id;

  // console.log(channel_id);
  // always send a response:
  res.json({ ok: true });
  // Start logging the streamers channel
  startLogging(channel_name);
});


// send post request to server to start logging process
function startLogging(channel_name){
  var options = {
      uri: 'http://chatsnitcherserver-dev.eu-west-2.elasticbeanstalk.com/initiate_logging/',
      method: 'POST',
      json: {
        "streamer_id": channel_name
      }
    };
      
  request(options, function (error, response, body) {
    if (response.statusCode == 201) {
        // collect log_task_id from response. it will be used to terminate logging
        // var request_body = JSON.parse(body, 'utf8').data; // [ 'Logging of twitch chat has began successfully.','8b8b816e-f425-414a-a9b2-87148cfa2974' ]
        for (var i = 0, l = body.length; i < l; i++){
          var obj = body[i];
          log_task_id = obj;
          console.log("Successfully started logging!")
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

//   View that posts average sentiment and timestamp to frontend
app.use('/collect_chat_analysis', function(req, res){
  console.log("Collect chat analysis!!");
  var request_body = (req.body); // { channel_Id: 'ninja' }
  // collect channel_id from json request, get anlysis and send to frontend JS

  var channel_id = request_body.channel_Id;
  console.log("channel_id_collected", channel_id);
  collectAnalysis(channel_id); 

  // Collect avergae sentiment from global variable after getStreamerNameAnalysis
    // is done 
  var average_sentiment = readGlobalSentiment();
  console.log("average sent", average_sentiment);
  res.status(200).json({ "average_sentiment": average_sentiment });

});


//  // get streamer name so we can start logging the chat
// function getStreamerNameLogging(channel_id) {
//     var options = { method: 'GET',
//     url: 'https://api.twitch.tv/helix/users',
//     qs: { id: channel_id },
//     headers: { 'Client-ID': 's72s2j2mm94920a4hk4921e5vc67ks' }};

//     request(options, function (error, response, body) {
//         if (error) throw new Error(error);
//         // Collect login name from response
//         // console.log(body);
//         var channel_detail = JSON.parse(body).data;
//         channel_name = channel_detail[0].login;
//         startLogging(channel_name);
//     });
// }

//  // get streamer name so we can analyse the chat
//  function getStreamerNameAnalysis(channel_id) {
//   var options = { method: 'GET',
//   url: 'https://api.twitch.tv/helix/users',
//   qs: { id: 154139682 },
//   headers: { 'Client-ID': 's72s2j2mm94920a4hk4921e5vc67ks' }};
//   request(options, function (error, response, body) {
//       if (error) throw new Error(error);
//       // Collect login name from response
//       // console.log(body);
//       var channel_detail = JSON.parse(body);
//       console.log(channel_detail);
//       channel_name = channel_detail[0];
//       console.log(channel_name);
//       collectAnalysis("amiyoro");
//       // return calculated sentiment to previous function
//   });
// }
    

function collectAnalysis(streamer_name){
  var options = {
    uri: 'http://chatsnitcherserver-dev.eu-west-2.elasticbeanstalk.com/initiate_analysis/',
    method: 'POST',
    json: {
      "streamer_id": streamer_name
    }
  };

  // Send request and collect response which consists of comments, their score and its timestamp
  request(options, function (error, response, body) {
    if (response.statusCode == 201) {
        // collect comment, score, timestamp from response, calculate average and send it to frontend
      
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
              var score = comment[key];
              var sentiment_count = readGlobalSentCount();
              sentiment_count = sentiment_count + 1;
              setGlobalSentCount(sentiment_count);

              var average_sentiment = readGlobalSentiment();
              average_sentiment = (average_sentiment + score)/sentiment_count;
              console.log("Calculated average sentiment");
              console.log(average_sentiment);

              // put average sentiment in global variable
              setGlobalSentiment(average_sentiment);
          }
        }
      });
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
