
// sessions
var sessions = {};

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

function newid(func, collection) {
  var id;
  do {
    id = func();
  } while( id in collection );
  return id;
}

var io = require('./server.js').io;

var LobbyConnection = require('./lobby-connection.js').LobbyConnection;
var PregameConnection = require('./pregame-connection.js').PregameConnection;
var game_module = require('./game.js');

io.on('connection', function (socket) {
  var user = null;
  
  // auth()
  function onSessionId(data) {
    if( data in sessions ) {
      user = sessions[data];
      initizeSession();
    } else
      socket.emit('login-request');
  }
  
  function onLogin(data) {
    user = { username: data.username };
    var sessionId = newid( uuid, sessions );
    
    socket.emit('login-ok', {sessionId: sessionId});
    sessions[sessionId] = user;
    initizeSession();
  }
  
  function onJoin(data) {
    switch(data.join) {
      case 'lobby':
        LobbyConnection(socket, user);
        break;
        
      case 'game':
        if( ! (data.id in game_module.games) ) {
          socket.emit('redirect', '/');
          break;
        }
        var game = game_module.games[data.id];
        if( game.status == 'setting up' )
          PregameConnection(socket, user, game);
        else
          game.game_type().Connection(socket, user, game);
    }
    socket.removeListener( 'join', onJoin );
  }
  
  function initizeSession() {
    socket.emit('authed', {
      username: user.username
    });
    socket.removeListener( 'session-id', onSessionId );
    socket.removeListener( 'login', onLogin );
    
    socket.on('join', onJoin );
  }
  
  socket.on('session-id', onSessionId);
  socket.on('login', onLogin);
  
});

