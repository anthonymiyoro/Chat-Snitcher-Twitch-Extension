const express = require('express');
const router = express.Router();
const wins = require('winston');
var app = express();
var http = require('http');
var server = http.createServer(app);

const twitch = require('../custom_modules/twitch');
const ext_sockets = require('../custom_modules/extension_sockets');
const mw = require('./middleware');


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Twitch Extension template'});
});

// Test message to all sockets in a channel
router.post('/testChannelSocket', (req, res, next) => {
    wins.debug("Sending socket broadcast!");
    wins.debug(req.body);

    ext_sockets.io.to(req.body.channelID).emit('test', req.body.message);
    res.end();
});

// Test to a specific socket
router.post('/testUserSocket', (req, res, next) => {
    wins.debug("Sending socket whisper!");
    wins.debug(req.body);

    ext_sockets.io.to(req.body.socketID).emit('whisper', req.body.message);
    res.end();
});

// Test to all viewers in a channel via Twitch PubSub
router.post('/testPubsubBroadcast', async (req, res, next) => {
    wins.debug("Sending PubSub broadcast!");
    wins.debug(req.body);

    await twitch.sendPubSub(req.body.channelID, 'broadcast', 'application/text', req.body.message);
    res.end();
});

// Test whisper to a specific user in a specific channel via Twitch PubSub
router.post('/testPubsubWhisper', async (req, res, next) => {
    wins.debug("Sending PubSub whisper!");
    wins.debug(req.body);

    await twitch.sendPubSub(req.body.channelID, "whisper-"+req.body.opaqueID, 'application/text', req.body.message);
    res.end();
});

module.exports = router;



