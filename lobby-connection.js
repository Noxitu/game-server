
var io = require('./server.js').io;

function LobbyConnection(socket, user, game) {
    var game_room = game.room(), user_room = game.room_for_user(user);
    
    function gameHasStarted() {
        if( game.status != 'lobby' ) {
            socket.emit('join', game.id);
            return true;
        }
        return false;
    }
    
    var Rooms = [game_room, user_room];
    var Events = {
        'Lobby.sit': function onSit(i) {
            if( gameHasStarted() )
                return;
            
            if( game.players.indexOf(user) != -1 )
                return;
                
            if( game.players[i] !== null )
                return;
                
            game.players[i] = user;
            io.to(user_room).emit('Lobby.setIsSeated', true);
            
            io.to('index').emit('Index.update', [game.serializeToLobby()] );
            io.to(game_room).emit('Lobby.update', game.serializeToPregame() );
        },
        'Lobby.stand': function onStand() {
            if( gameHasStarted() )
                return;
            
            var i = game.players.indexOf(user);
            if( i == -1 )
                return;
                
            game.players[i] = null;
            io.to(user_room).emit('Lobby.setIsSeated', false);
            
            io.to('index').emit('Index.update', [game.serializeToLobby()] );
            io.to(game_room).emit('Lobby.update', game.serializeToPregame() );
        },
        'Lobby.startGame': function() {
            if( gameHasStarted() )
                return;
        
            if( user !== game.owner || game.players.indexOf(null) != -1 )
                return;
                
            //game.logic = new (game.game_type().Logic)(game);
            game.changeStatus('ongoing');
            io.to(game_room).emit('Room.join', game.id );
        }
    };
    
    
    socket.emit('Lobby.setGameTypeInfo', game.game_type().info );
    socket.emit('Lobby.setSettings', game.settings );
    // Warning, order of emits is important: owner -> player_list(update) -> seated
    socket.emit('Lobby.setIsOwner', game.owner === user );
    socket.emit('Lobby.update', game.serializeToPregame() );
    socket.emit('Lobby.setIsSeated', game.players.indexOf(user) != -1 );
    
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