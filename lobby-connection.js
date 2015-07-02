
var io = require('./server.js').io;
var game_module = require('./game.js');
var game_types = require('./game_types.js').game_types;

function LobbyConnection(socket, user) {
  socket.emit('game-types', game_types);

  function onLobbyGameCreate() {
    var game = new game_module.Game();
    socket.join(game.preRoom);
    
    io.to('lobby').emit('lobby-games', [game.serializeToLobby()] );
    io.to(game.preRoom).emit('game-details', game.serializeToDetails());
  }
  
  socket.join('lobby');
  socket.emit('lobby-games', Object.keys(game_module.games).map( function(id) { return game_module.games[id].serializeToLobby(); } ));
  socket.on('game-create', onLobbyGameCreate );
}

module.exports = {
  LobbyConnection: LobbyConnection
};