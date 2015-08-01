
var io = require('./server.js').io;
var game_module = require('./game.js');
var game_types_info = require('./game_types.js').game_types_info;
var querystring = require('querystring');

function LobbyConnection(socket, user) {
    var Rooms = ['lobby'];
    var Events = {
        'Lobby.createGame': function(data) {
            var settings = querystring.parse(data);
            var error = game_module.verify_settings(settings);
            if( error ) {
                socket.emit('Toast.show', {
                    message: error,
                    type: 'error'
                });
                socket.emit('Room.set', 'create-game');
                return;
            }
                
            var game = new game_module.Game(settings, user);
            io.to('lobby').emit('Lobby.update', [game.serializeToLobby()] );
            socket.emit('Room.join', game.id );
        }
    };
    
    
    socket.emit('Lobby.game_types', game_types_info);
    socket.emit('Lobby.update', Object.keys(game_module.games).map( function(id) { return game_module.games[id].serializeToLobby(); } ));
    
    for( var i in Rooms )
        socket.join(Rooms[i]);
    for( var e in Events )
        socket.on(e, Events[e]);
    
    return function() {
        for( var i in Rooms )
            socket.leave(Rooms[i]);
        for( var e in Events )
            socket.removeListener(e, Events[e]);
    };
}

module.exports = {
    LobbyConnection: LobbyConnection
};