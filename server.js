// Setup web server
var express = require('express');
var app = express();
var server = require('http').createServer(app);

// Serve static files
app.use(express.static('public'));

// socket.io
var io = require('socket.io')(server);

// run
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d...', port);
});

var Connection = {
    init: function(socket, Rooms, Events) {
        for( var i in Rooms )
            socket.join(Rooms[i]);
        for( var e in Events )
            socket.on(e, Events[e]);
    },
    deinit: function(socket, Rooms, Events) {
        for( var i in Rooms )
            socket.leave(Rooms[i]);
        for( var e in Events )
            socket.removeListener(e, Events[e]);    
    }
};

module.exports = {
  io: io,
  app: app,
  Connection: Connection
};