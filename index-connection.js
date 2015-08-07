
var io = require('./server.js').io;
var game_module = require('./game.js');
var game_types_info = require('./game_types.js').game_types_info;
var querystring = require('querystring');

function IndexConnection(socket, user) {
    var Rooms = ['index'];
    var Events = {
        'Index.createGame': function(data) {
            var settings = querystring.parse(data);
            var error = game_module.verify_settings(settings);
            if( error ) {
                socket.emit('Toast.show', {
                    entity: error,
                    type: 'error'
                });
                socket.emit('Room.set', 'create-game');
                return;
            }
                
            var game = new game_module.Game(settings, user);
            io.to('index').emit('Index.update', [game.serializeToLobby()] );
            socket.emit('Room.join', game.id );
        }
    };
    
    
    socket.emit('Index.game_types', game_types_info);
    socket.emit('Index.update', Object.keys(game_module.games).map( function(id) { return game_module.games[id].serializeToLobby(); } ));
    
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
    IndexConnection: IndexConnection
};