
var io = require('../../server.js').io;

var info = {
    l20n_prefix: 'DotsAndBoxes',
    logo: "logo.png",
    players: 2,
    settings: [
        {
            name: 'width',
            value: 'int',
            value_ex: {min: 2, 'default': 3}
        },
        {
            name: 'height',
            value: 'int',
            value_ex: {min: 2, 'default': 3}
        },
        {
            name: 'first',
            label: 'Zaczyna gracz',
            options: ['random', '1p', '2p'],
            options_labels: ['Losowo', 'Gracz nr 1', 'Gracz nr 2']
        }
    ]
}

function Logic(game) {
    switch( game.settings['first'] ) {
        case 'random':
            this.turn = Math.random()*2|0;
            break;
        case '1p':
            this.turn = 0;
            break;
        case '2p':
            this.turn = 1;
            break;
    }
    this.board = {
        vwalls: [],
        hwalls: [],
        tiles: []
    };
    this.scores = [0, 0];
    
    for( var x = 0; x < game.settings.width; x++ ) {
        this.board.tiles[x] = [];
        this.board.vwalls[x] = [];
        this.board.hwalls[x] = [];
        for( var y = 0; y < game.settings.height; y++ ) {
            this.board.tiles[x][y] = -1;
            this.board.vwalls[x][y] = -1;
            this.board.hwalls[x][y] = -1;
        }
    }
    
    this.board.vwalls[game.settings.width] = [];
    for( var y = 0; y < game.settings.height; y++ )
        this.board.vwalls[game.settings.width][y] = -1;
    
    for( var x = 0; x < game.settings.width; x++ )
        this.board.hwalls[x][game.settings.height] = -1;
    
}

function Connection(socket, user, game) {
    var player_i = game.players.indexOf(user);
    var game_room = game.room(), player_room = game_room + ':player:' + player_i;
    
    function hasEnded() {
        return game.status == 'ended';
    }
    
    function updateTile(x, y) {
        if( game.logic.board.tiles[x][y] != -1 )
            return false;
    
        if( game.logic.board.vwalls[x][y] == -1 || game.logic.board.vwalls[x+1][y] == -1 || game.logic.board.hwalls[x][y] == -1 || game.logic.board.hwalls[x][y+1] == -1 )
            return false;
                
        game.logic.board.tiles[x][y] = player_i;
        io.to(game_room).emit('DotsAndBoxes.update', {
            what: 'tile',
            x: x,
            y: y,
            value: player_i
        });
        game.logic.scores[player_i]++;
        io.to(game_room).emit('DotsAndBoxes.scores', game.logic.scores );
        
        return true;
    }
    
    function advanceTurn(bonus) {
        if( game.logic.scores[0]+game.logic.scores[1] == game.settings.width*game.settings.height ) {
            io.to(game_room).emit('Game.setTurn');
            game.end();
            return;
        }
        
        if( !bonus ) {
            game.logic.turn = 1-game.logic.turn;
            io.to(game_room).emit('Game.setTurn', game.players[game.logic.turn].username );
            
        }
        io.to(game_room + ':player:' + game.logic.turn).emit('Game.yourTurn');
    }
    
    var Rooms = [game_room, player_room];
    var Events = {
        'DotsAndBoxes.vwall': function(pos) {
            if( hasEnded() )
                return;
                
            if( player_i != game.logic.turn )   
                return;
                
            if( pos.x < 0 || pos.x > game.settings.width || pos.y < 0 || pos.y >= game.settings.height )
                return;
            
            if( game.logic.board.vwalls[pos.x][pos.y] != -1 )
                return;
            
            game.logic.board.vwalls[pos.x][pos.y] = player_i;
            io.to(game_room).emit('DotsAndBoxes.update', {
                what: 'vwall',
                x: pos.x,
                y: pos.y,
                value: player_i
            });
            
            var bonus = false;
            
            if( pos.x < game.settings.width )
                bonus |= updateTile(pos.x, pos.y);
            
            if( pos.x > 0 )
                bonus |= updateTile(pos.x-1, pos.y);
                
            advanceTurn(bonus);
        },
        'DotsAndBoxes.hwall': function(pos) {
            if( hasEnded() )
                return;
            
            if( player_i != game.logic.turn )   
                return;

            if( pos.x < 0 || pos.x >= game.settings.width || pos.y < 0 || pos.y > game.settings.height )
                return;
            
            if( game.logic.board.hwalls[pos.x][pos.y] != -1 )
                return;
            
            game.logic.board.hwalls[pos.x][pos.y] = player_i;
            io.to(game_room).emit('DotsAndBoxes.update', {
                what: 'hwall',
                x: pos.x,
                y: pos.y,
                value: player_i
            });
            
            var bonus = false;
            
            if( pos.y < game.settings.height )
                bonus |= updateTile(pos.x, pos.y);
            
            if( pos.y > 0 )
                bonus |= updateTile(pos.x, pos.y-1);
                
            advanceTurn(bonus);
        }
    };
    
    if( hasEnded() ) {
        socket.emit('Game.setTurn');
    } else {
        socket.emit('Game.setTurn', game.players[game.logic.turn].username );   
        if( player_i == game.logic.turn )
            socket.emit('Game.yourTurn');
    }
    
    socket.emit('DotsAndBoxes.color', player_i );
    socket.emit('DotsAndBoxes.names', game.players.map(function(p) { return p.username; }) );
    socket.emit('DotsAndBoxes.board', game.logic.board );
    socket.emit('DotsAndBoxes.scores', game.logic.scores );
    
    return {
        Rooms: Rooms,
        Events: Events
    };
}


module.exports = {
    info: info,
    Logic: Logic,
    Connection: Connection
}
