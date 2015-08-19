
var io = require('../../server.js').io;

var info = {
    l20n_prefix: "_50Stones",
    logo: "logo.jpg",
    players: [2,3,4,5,6,7,8],
    settings: [
        {
            name: 'wins',
            value: 'int',
            value_ex: { min: 1, 'default': 3 }
        },
        {
            name: 'stones',
            value: 'int',
            value_ex: { min: 1, 'default': 50 }
        }
    ]
}

function Logic(game) {
    this.stones = game.players.map( function(e) { return game.settings.stones|0; } );
    this.picks = game.players.map( function(e) { return null; } );
    this.scores = game.players.map( function(e) { return 0; } );
    this.history = [];
}

Logic.prototype.winner = function() {
    var winner = -1, best = -1;
    for( var i = 0; i < this.picks.length; i++ )
        if( best < this.picks[i] ) {
            winner = i;
            best = this.picks[i];
        } else if( best == this.picks[i] )
            winner = -1;
    return winner;
}

Logic.prototype.ended = function(wins) {
    if( this.scores.indexOf(wins|0) != -1 )
        return true;
    
    for( var i = 0; i < this.stones.length; i++ )
        if( this.stones[i] > 0 )
            return false;
         
    return true;
}

function Connection(socket, user, game) {
    var game_room = game.room(), player_room = game_room + ':player:' + game.players.indexOf(user);
    var player_i = game.players.indexOf(user);
    
    function hasEnded() {
        return game.status == 'ended';
    }
    
    var Rooms = [game_room, player_room];
    var Events = {
        '50Stones.pick': function(pick) {
            if( hasEnded() || player_i == -1 || game.logic.picks[player_i] !== null )
                return;
                
            pick |= 0;
                
            if( pick < 0 || pick > game.logic.stones[player_i] )
                return;
                
            game.logic.picks[player_i] = pick;
            io.to(player_room).emit('50Stones.pick', game.logic.picks[player_i] );
            
            if( game.logic.picks.indexOf(null) != -1 ) {
                return;
            }
            
            for( var i = 0; i < game.logic.picks.length; i++ ) {
                game.logic.stones[i] -= game.logic.picks[i];
                if( game.logic.stones[i] == 0 )
                    io.to(game_room+':player:' + i).emit('50Stones.cantPlay');
            }
            
            io.to(game_room).emit('50Stones.picks', game.logic.picks );
            var winner = game.logic.winner();
            if( winner != -1 ) {
                game.logic.scores[winner]++;
                io.to(game_room).emit('50Stones.scores', game.logic.scores );
            }
            io.to(game_room).emit('50Stones.stones', game.logic.stones );
            
            game.logic.history.push( game.logic.picks );
            game.logic.picks = game.logic.stones.map( function(s) { return s == 0 ? 0 : null; } );
            
            if( game.logic.ended(game.settings.wins) ) {
                io.to(game_room).emit('50Stones.end', 'now');
                game.end();
            } else {
                io.to(game_room).emit('50Stones.round');
            }
        }
    };
    
    if( hasEnded() )
        socket.emit('50Stones.end');
    else if( player_i == -1 )
        socket.emit('50Stones.cantPlay');
    
    socket.emit('50Stones.players', game.players.map( function(u) { return u.username; } ) );
    socket.emit('50Stones.history', game.logic.history );
    socket.emit('50Stones.scores', game.logic.scores );
    socket.emit('50Stones.stones', game.logic.stones );
    
    if( player_i != -1 ) {
        socket.emit('50Stones.i', player_i );
        if( ! hasEnded() ) {
            if( game.logic.picks[player_i] !== null )
                socket.emit('50Stones.pick', game.logic.picks[player_i] );
            else
                socket.emit('50Stones.round');
        }
    }

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
