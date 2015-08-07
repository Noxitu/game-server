
var io = require('../../server.js').io;

var info = {
    title: "Papier, kamień, nożyce",
    logo: "logo.png",
    players: 2,
    settings: [
        {
            name: 'wins',
            label: 'Do ilu wygranych',
            value: 'int',
            value_ex: { min: 1, 'default': 5 }
        }
    ]
}

function Logic(game) {
    this.picks = [null, null];
    this.scores = [0, 0];
    this.history = [];
}

function beats(a, b) {
    switch(a) {
        case 'paper': return b == 'rock';
        case 'rock': return b == 'scissors';
        case 'scissors': return b == 'paper';
    }
}

function Connection(socket, user, game) {
    var game_room = game.room(), player_room = game_room + ':player:' + game.players.indexOf(user);
    var player_i = game.players.indexOf(user);
    
    function hasEnded() {
        return game.status == 'ended';
    }
    
    var Rooms = [game_room, player_room];
    var Events = {
        'JanKenPon.click': function(pick) {
            if( hasEnded() || player_i == -1 || game.logic.picks[player_i] !== null )
                return;
                
            if( {'rock':1,'paper':1,'scissors':1}[pick] !== 1 )
                return;
                
            game.logic.picks[player_i] = pick;
            
            if( game.logic.picks.indexOf(null) != -1 ) {
                io.to(player_room).emit('JanKenPon.picks', [0,1].map( function(i) { return i == player_i ? game.logic.picks[i] : null; } ) );
                return;
            }
            
            io.to(game_room).emit('JanKenPon.picks', game.logic.picks );
            for( var i = 0; i < 2; i++ ) {
                if( beats(game.logic.picks[i], game.logic.picks[1-i]) )
                    game.logic.scores[i]++;
            }
            
            io.to(game_room).emit('JanKenPon.scores', game.logic.scores );
            
            game.logic.history.push( game.logic.picks );
            game.logic.picks = [null, null];
            
            if( game.logic.scores.indexOf(game.settings.wins|0) != -1 ) {
                io.to(game_room).emit('JanKenPon.end', 'now');
                game.end();
            }
        }
    };
    
    if( hasEnded() )
        socket.emit('JanKenPon.end');
    else if( player_i == -1 )
        socket.emit('JanKenPon.cantPlay');
        
    
    socket.emit('JanKenPon.players', game.players.map( function(u) { return u.username; } ) );
    socket.emit('JanKenPon.history', game.logic.history );
    socket.emit('JanKenPon.scores', game.logic.scores );
    socket.emit('JanKenPon.picks', [0,1].map( function(i) { return i == player_i ? game.logic.picks[i] : null; } ) );

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
