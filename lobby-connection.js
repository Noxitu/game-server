
var io = require('./server.js').io;

function PregameConnection(socket, user, game) {
    if( game.status != 'setting up' ) {
        socket.emit('redirect', game.getHref() );
        socket.disconnect();
        return;
    }
    
    function onSit(i) {
        if( game.status != 'setting up' ) {
            socket.emit('redirect', game.getHref() );
            socket.disconnect();
            return;
        }
        
        if( game.players.indexOf(user) != -1 )
            return;
            
        if( game.players[i] !== null )
            return;
            
        game.players[i] = user;
        socket.emit('seated', true);
        
        io.to('lobby').emit('lobby-games', [game.serializeToLobby()] );
        io.to(game.room()).emit('game', game.serializeToPregame() );
    } 
    
    function onStand() {
        if( game.status != 'setting up' ) {
            socket.emit('redirect', game.getHref() );
            socket.disconnect();
            return;
        }
        
        var i = game.players.indexOf(user);
        if( i == -1 )
            return;
            
        game.players[i] = null;
        socket.emit('seated', false);
        
        io.to('lobby').emit('lobby-games', [game.serializeToLobby()] );
        io.to(game.room()).emit('game', game.serializeToPregame() );
    } 
    
    
    function onStartGame() {
        if( game.status != 'setting up' ) {
            socket.emit('redirect', game.getHref() );
            return;
        }
    
        if( user !== game.owner || game.players.indexOf(null) != -1 )
            return;
            
        game.logic = new (game.game_type().Logic)(game);
        game.changeStatus('going on');
        io.to(game.room()).emit('redirect', game.getHref() );
        
    }
    
    
    socket.emit('game-type', game.game_type().info );
    socket.emit('settings', game.settings );
    socket.emit('owner', game.owner === user );
    socket.emit('seated', game.players.indexOf(user) != -1 );
    socket.emit('game', game.serializeToPregame() );
    
    socket.join(game.room());
    
    socket.on('sit', onSit);
    socket.on('stand', onStand);
    socket.on('start-game', onStartGame);
}

module.exports = {
    PregameConnection: PregameConnection
};