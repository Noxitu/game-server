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

module.exports = {
  io: io,
  app: app
};