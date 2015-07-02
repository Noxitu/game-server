
var io = require('./server.js').io;
var game_module = require('./game.js');
var game_types = require('./game_types.js').game_types;
var querystring = require('querystring');

function LobbyConnection(socket, user) {
  socket.emit('game-types', game_types);

  function onLobbyGameCreate(data) {
    data = querystring.parse(data);
    var game_type = game_types[data.id];
    for( var i = 0; i < game_type.settings.length; i++ ) {
      var setting = game_type.settings[i];
      if( ! setting.name in data )
        return;
      if( 'options' in setting ) {
        if( ! data[setting.name] in setting.options )
          return;
      } else if( setting.value == 'int' ) {
        if( isNaN(data[setting.name]) )
          return;
      }
    }
  
    var game = new game_module.Game(data);
    io.to('lobby').emit('lobby-games', [game.serializeToLobby()] );
    socket.emit('join-game', game.id);
    socket.disconnect();
  }
  
  socket.join('lobby');
  socket.emit('lobby-games', Object.keys(game_module.games).map( function(id) { return game_module.games[id].serializeToLobby(); } ));
  socket.on('create-game', onLobbyGameCreate );
}

module.exports = {
  LobbyConnection: LobbyConnection
};