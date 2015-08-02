
var io = require('./server.js').io;
var Connection = require('./server.js').Connection;
var game_module = require('./game.js');

function GameConnection(socket, user, game) {
    var game_room = game.room();
    
    var Rooms = [game_room];
    var Events = {
        'Game.rematch': function(data) {
            var settings = game.settings;
            var error = game_module.verify_settings(settings);
            if( error ) {
                socket.emit('Toast.show', {
                    message: error,
                    type: 'error'
                });
                return;
            }
                
            var new_game = new game_module.Game(settings, user);
            io.to('index').emit('Index.update', [new_game.serializeToLobby()] );
            socket.emit('Room.join', new_game.id );
            socket.broadcast.to(game_room).emit('Game.rematch', {
                id: new_game.id, 
                who: user.username
            });
            game.rematch_id = new_game.id;
        }
    };
    
    if( game.status == 'ended' ) {
        socket.emit('Game.ended');
        if( 'rematch_id' in game )
            socket.emit('Game.rematch', { id: game.rematch_id });
    }
        
    Connection.init(socket, Rooms, Events);
    
    var internal = game.game_type().Connection(socket, user, game);
    Connection.init(socket, internal.Rooms, internal.Events);
    
    return function() {
        Connection.deinit(socket, Rooms, Events);
        Connection.deinit(socket, internal.Rooms, internal.Events);
    };
}

module.exports = {
    GameConnection: GameConnection
};