
var io = require('./server.js').io;
var game_module = require('./game.js');
var game_types_info = require('./game_types.js').game_types_info;
var querystring = require('querystring');

function LobbyConnection(socket, user) {

    function onLobbyGameCreate(data) {
        var settings = querystring.parse(data);
        var game_type_info = game_types_info[settings.id];
        
        for( var i = 0; i < game_type_info.settings.length; i++ ) {
            var setting = game_type_info.settings[i];
            if( ! setting.name in settings )
                return;
            if( 'options' in setting ) {
                if( ! settings[setting.name] in setting.options )
                    return;
            } else if( setting.value == 'int' ) {
                if( isNaN(settings[setting.name]) )
                    return;
            }
        }
    
        var game = new game_module.Game(settings, user);
        io.to('lobby').emit('lobby-games', [game.serializeToLobby()] );
        socket.emit('redirect', game.getHref() );
        socket.disconnect();
    }
    
    function onJoinGame(id) {
        if( ! id in game_module.games )
            return;
        socket.emit('redirect', game_module.games[id].getHref() );
    }
    
    socket.emit('game-types', game_types_info);
    socket.emit('lobby-games', Object.keys(game_module.games).map( function(id) { return game_module.games[id].serializeToLobby(); } ));
    
    socket.join('lobby');
    
    socket.on('create-game', onLobbyGameCreate );
    socket.on('join-game', onJoinGame );
}

module.exports = {
    LobbyConnection: LobbyConnection
};