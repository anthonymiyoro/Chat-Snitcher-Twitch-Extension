// /* eslint-disable no-console */

// // Get the party started
// $(function() {

//         // Socket connection to EBS
//         var socket = io('https://localhost:9999', {
//             autoConnect: false
//         });
    
//         // WebSocket Handlers
//         socket.on('connect', () => {
//             console.log("Socket connected successfully, my Socket ID is " + socket.id);
//         });
//         socket.on('connect_error', (err) => {
//             console.log("Failed to connect to socket:", err);
//         });
//         socket.on('connect_timeout', (timeout) => {
//             console.log("Socket connection timed out:", timeout);
//         });
//         socket.on('error', (err) => {
//             console.log("Socket error:", err);
//         });
//         socket.on('disconnect', (reason) => {
//             console.log("Socket disconnected:", reason);
//         });
//         socket.on('reconnect', (attemptNumber) => {
//             console.log("Successfully reconnected to socket after " + attemptNumber + " attempts");
//         });
//         socket.on('reconnect_attempt', (attemptNumber) => {
//             console.log("Attempting reconnect... " + attemptNumber);
//         });
//         socket.on('reconnect_error', (err) => {
//             console.log("Failed to reconnect to socket:", err);
//         });
//         socket.on('test', (msg) => {
//             console.log("New socket 'test' message:", msg);
//         });
//         socket.on('whisper', (msg) => {
//             console.log("New socket 'whisper' message:", msg);
//         });
    

//     // Twitch function handlers
//     var twitch = window.Twitch.ext;
//     var firstTimeOnly = true;
//     var latestAuth = {};

//     // This bit of disgustingness is to deal with a bug (28/11/2017) in the Twitch JS Helper.
//     // Normally you would call listen for the whisper channel inside onAuthorized when you get
//     // your opaque ID, however, calling twitch.listen inside onAuthorise causes the listen
//     // function to be registered more than one time for some reason. So we wait for onAuth to
//     // be called and then register the listener here.
//     function whisperHack() {
//         if (!firstTimeOnly) {
//             // Listen to this viewer's private PubSub whisper channel
//             twitch.listen('whisper-'+latestAuth.userId, (target, type, msg) => {
//                 console.log("New Twitch PubSub whisper:", msg);
//             });
//         } else {
//             setTimeout(whisperHack, 1000);
//         }
//     }
//     whisperHack();

//     // onAuth handler. Gives us JWT and the viewer's opaque ID
//     twitch.onAuthorized((auth) => {
//         console.log("Twitch: onAuthorized called");
//         console.log("The channel ID is", auth.channelId);
//         // console.log("The extension clientId is", auth.clientId);
//         console.log("My Twitch opaque user id is", auth.userId);
//         // console.log("The JWT token is", auth.token);

//         // var channel_Id = auth.channelId.toString();
//         // console.log("Channel ID Below")
//         // console.log(channel_Id)

//         latestAuth = auth;
//         // Set up the header for requests
//         $.ajaxSetup({
//             headers: {
//                 'x-twitch-jwt': latestAuth.token
//             }
//         });

//         // Update the socket query with new JWT
//         socket.io.opts.query = {
//             jwt: auth.token
//         };

//         if (firstTimeOnly) {
//             firstTimeOnly = false;

//             // Open the websocket
//             socket.open();
//         }

//         getChannelId(latestAuth);
//         // getLatestAnalysisWorker(latestAuth);
//         // getLatestAnalysis(auth);

//     // Sub all viewers to the broadcast channel
//     twitch.listen('broadcast', (target, type, msg) => {
//         console.log("New Twitch PubSub broadcast message:", msg);
//     });

//     // Error handler
//     twitch.onError((err) => {
//         console.log("Twitch: onError called");
//         console.log("The error was", err);
//     });
//     // onContext handler. Providers viewer mode, resolution, delay and other stuff
//     // This can be very spammy, commented out by default
//     twitch.onContext((context, diff) => {
//         // console.log("Twitch: onContext called");
//         // console.log(context);
//         // console.log(diff);
//     });
// });



// // Collect streamers channelId from twitch and send to backend.
// // The /collect_channel_name url then uses this ID to get the channel name
// // which can then be used to begin analysing the channels chat room on my AWS
// // server.

// function getChannelId(auth) {
//     console.log("Getting channel ID");
//     var channel_id = auth.channelId.toString()
//     $.ajax({
//         type: "POST",
//         url: "/collect_channel_name",
//         contentType: 'application/json',
//         data: JSON.stringify({ channel_Id: channel_id}),
//         success: function(data) {
//           console.log('message', data.message);
//         },
//         error: function(jqXHR, textStatus, err) {
//             alert('text status '+textStatus+', err '+err)
//         }
//     });
// }


// function getLatestAnalysis(auth) {
//     var channel_id = auth.channelId.toString()
//     console.log("sending ajax call");
//     $.ajax({
//         type: "POST",
//         url: "/collect_chat_analysis",
//         contentType: 'application/json',
//         data: JSON.stringify({ channel_Id: channel_id}),
//         success: function(data) {
//           console.log('message', data.message);
//         },
//         error: function(jqXHR, textStatus, err) {
//             alert('text status '+textStatus+', err '+err)
//         }
//     });
// }



// // The function below is immediately invoked
// // Gets latest analysis every 20 seconds
// function getLatestAnalysisWorker(auth) {
//     var channel_id = auth.channelId.toString()
//     console.log("sending ajax call");
//     $.ajax({
//         type: "POST",
//         url: "/collect_chat_analysis",
//         contentType: 'application/json',
//         data: JSON.stringify({ channel_Id: channel_id}),
//         success: function(data) {
//             console.log('Worker message!!!', data.message);
//             // Schedule the next request when the current one's complete
//             setTimeout(getLatestAnalysisWorker, 20000);
//         },
//         error: function(jqXHR, textStatus, err) {
//             alert('text status '+textStatus+', err '+err)
//         }
//     });
// };



// // Collect streamers channelId from twitch and send to backend where it 
// // will be converted to the streamer name. From backend analyssi of chat room 
// // will stop.

// function stopLogging(auth){
//     var channel_id = auth.channelId.toString()
//     $.ajax({
//         type: "POST",
//         url: "/collect_channel_name",
//         contentType: 'application/json',
//         data: JSON.stringify({ channel_Id: channel_id}),
//         success: function(data) {
//           console.log('message', data.message);
//         },
//         error: function(jqXHR, textStatus, err) {
//             alert('text status '+textStatus+', err '+err)
//         }
//     });
// }


/* eslint-disable no-console */

// Get the party started
$(function() {

    // Socket connection to EBS
    var socket = io('https://localhost:9999', {
        autoConnect: false
    });

    // WebSocket Handlers
    socket.on('connect', () => {
        console.log("Socket connected successfully, my Socket ID is " + socket.id);
    });
    socket.on('connect_error', (err) => {
        console.log("Failed to connect to socket:", err);
    });
    socket.on('connect_timeout', (timeout) => {
        console.log("Socket connection timed out:", timeout);
    });
    socket.on('error', (err) => {
        console.log("Socket error:", err);
    });
    socket.on('disconnect', (reason) => {
        console.log("Socket disconnected:", reason);
    });
    socket.on('reconnect', (attemptNumber) => {
        console.log("Successfully reconnected to socket after " + attemptNumber + " attempts");
    });
    socket.on('reconnect_attempt', (attemptNumber) => {
        console.log("Attempting reconnect... " + attemptNumber);
    });
    socket.on('reconnect_error', (err) => {
        console.log("Failed to reconnect to socket:", err);
    });
    socket.on('test', (msg) => {
        console.log("New socket 'test' message:", msg);
    });
    socket.on('whisper', (msg) => {
        console.log("New socket 'whisper' message:", msg);
    });


    // Twitch function handlers
    var twitch = window.Twitch.ext;
    var firstTimeOnly = true;
    var latestAuth = {};

    // This bit of disgustingness is to deal with a bug (28/11/2017) in the Twitch JS Helper.
    // Normally you would call listen for the whisper channel inside onAuthorized when you get
    // your opaque ID, however, calling twitch.listen inside onAuthorise causes the listen
    // function to be registered more than one time for some reason. So we wait for onAuth to
    // be called and then register the listener here.
    function whisperHack() {
        if (!firstTimeOnly) {
            // Listen to this viewer's private PubSub whisper channel
            twitch.listen('whisper-'+latestAuth.userId, (target, type, msg) => {
                console.log("New Twitch PubSub whisper:", msg);
            });
        } else {
            setTimeout(whisperHack, 1000);
        }
    }
    whisperHack();

    // onAuth handler. Gives us JWT and the viewer's opaque ID
    twitch.onAuthorized((auth) => {
        console.log("Twitch: onAuthorized called");
        console.log("The channel ID is", auth.channelId);
        // console.log("The extension clientId is", auth.clientId);
        console.log("My Twitch opaque user id is", auth.userId);
        // console.log("The JWT token is", auth.token);

        // var channel_Id = auth.channelId.toString();
        // console.log("Channel ID Below")
        // console.log(channel_Id)

        latestAuth = auth;
        // Set up the header for requests
        $.ajaxSetup({
            headers: {
                'x-twitch-jwt': latestAuth.token
            }
        });

        // Update the socket query with new JWT
        socket.io.opts.query = {
            jwt: auth.token
        };

        if (firstTimeOnly) {
            firstTimeOnly = false;

            // Open the websocket
            socket.open();
        }
        // getChannelId(latestAuth);
        getLatestAnalysis(latestAuth);

       
    });

    // Sub all viewers to the broadcast channel
    twitch.listen('broadcast', (target, type, msg) => {
        console.log("New Twitch PubSub broadcast message:", msg);
    });


    // Error handler
    twitch.onError((err) => {
        console.log("Twitch: onError called");
        console.log("The error was", err);
    });
    // onContext handler. Providers viewer mode, resolution, delay and other stuff
    // This can be very spammy, commented out by default
    twitch.onContext((context, diff) => {
        // console.log("Twitch: onContext called");
        // console.log(context);
        // console.log(diff);
    });
});



// Collect streamers channelId from twitch and send to backend.
// The /collect_channel_name url then uses this ID to get the channel name
// which can then be used to begin analysing the channels chat room on my AWS
// server.

function getChannelId(auth) {
var channel_id = auth.channelId.toString()
$.ajax({
    type: "POST",
    url: "/collect_channel_name",
    contentType: 'application/json',
    data: JSON.stringify({ channel_Id: channel_id}),
    success: function(data) {
      console.log('message', data.message);
    },
    error: function(jqXHR, textStatus, err) {
        alert('text status '+textStatus+', err '+err)
    }
});
}


function getLatestAnalysis(auth) {
var channel_id = auth.channelId.toString()
var div = document.querySelector("#viewer_sentiment");
div.innerHTML = "This is the text, <strong>markup</strong> works too.";
$.ajax({
    type: "POST",
    url: "/collect_chat_analysis",
    contentType: 'application/json',
    data: JSON.stringify({ channel_Id: channel_id}),
    success: function(data) {
      console.log('message', data.message);
    },
    error: function(jqXHR, textStatus, err) {
        alert('text status '+textStatus+', err '+err)
    }
});
}

// (function worker() {
// $.ajax({
//   url: 'ajax/test.html', 
//   success: function(data) {
//     $('.result').html(data);
//   },
//   complete: function() {
//     // Schedule the next request when the current one's complete
//     setTimeout(worker, 5000);
//   }
// });
// })();


// Collect streamers channelId from twitch and send to backend where it 
// will be converted to the streamer name. From backend analyssi of chat room 
// will stop.

function stopLogging(auth){
    var channel_id = auth.channelId.toString()
    $.ajax({
        type: "POST",
        url: "/collect_channel_name",
        contentType: 'application/json',
        data: JSON.stringify({ channel_Id: channel_id}),
        success: function(data) {
        console.log('message', data.message);
        },
        error: function(jqXHR, textStatus, err) {
            alert('text status '+textStatus+', err '+err)
        }
    });
}