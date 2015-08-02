
var io = require('./server.js').io;
var Connection = require('./server.js').Connection;

function GameConnection(socket, user, game) {
    var game_room = game.room();
    
    var Rooms = [game_room];
    var Events = {
    };
        
    var internal = game.game_type().Connection(socket, user, game);
        
    Connection.init(socket, Rooms, Events);
    Connection.init(socket, internal.Rooms, internal.Events);
    
    return function() {
        Connection.deinit(socket, Rooms, Events);
        Connection.deinit(socket, internal.Rooms, internal.Events);
    };
}

module.exports = {
    GameConnection: GameConnection
};