
var io = require('./server.js').io;
var game_types = require('./game_types.js').game_types;
var game_module = require('./game.js');

function PregameConnection(socket, user, gameid) {
  var game = game_module.games[gameid];
  socket.emit('game-type', game_types[game.type]);
  socket.emit('game', game.serializeToPregame() );
  socket.emit('settings', game.settings );
  
  socket.join(game.pregameRoom);
}

module.exports = {
  PregameConnection: PregameConnection
};