
var io = require('../../server.js').io;

var info = {
    title: "Kółko i krzyżyk",
    logo: "tic-tac-toe.png",
    players: 2,
    settings: [
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
    this.map = [' ', ' ', ' ',' ', ' ', ' ',' ', ' ', ' '];
}

var wining_moves = [0,1,2, 3,4,5, 6,7,8, 0,3,6, 1,4,7, 2,5,8, 0,4,8, 2,4,6 ];
Logic.prototype.checkWin = function() {
    for( var i = 0; i < 8; i++ ) 
        if( ' ' != this.map[wining_moves[3*i]] && this.map[wining_moves[3*i]] == this.map[wining_moves[3*i+1]] && this.map[wining_moves[3*i]] == this.map[wining_moves[3*i+2]] )
            return { 
                pos: i
            };
                
}


function Connection(socket, user, game) {
    var game_room = game.room(), player_room = game_room + ':player:' + game.players.indexOf(user);
    var player_i = game.players.indexOf(user);
    function hasEnded() {
        return game.status == 'ended';
    }
    
    var Rooms = [game_room, player_room];
    var Events = {
        'TicTacToe.click': function(pos) {
            if( hasEnded() )
                return;
        
            if( user != game.players[game.logic.turn] )
                return;
            
            if( game.logic.map[pos] != ' ' )
                return;
            
            game.logic.map[pos] = ['x','o'][game.logic.turn];
            game.logic.turn = 1-game.logic.turn;
            
            io.to(game_room).emit('TicTacToe.update', game.logic.map);
            
            var win = game.logic.checkWin();
            if( win || game.logic.map.indexOf(' ') == -1 ) {
                game.end();
                io.to(game_room).emit('Game.setTurn');
            } else {
                io.to(game_room).emit('Game.setTurn', game.players[game.logic.turn].username );
                io.to(game_room + ':player:' + game.logic.turn).emit('Game.yourTurn');
            }
                
            if( win )
                io.to(game_room).emit('TicTacToe.win', win.pos );
        }
    };
    
    socket.emit('TicTacToe.update', game.logic.map);
    
    if( hasEnded() ) {
        socket.emit('Game.setTurn');
    } else {
        socket.emit('Game.setTurn', game.players[game.logic.turn].username );   
        if( user == game.players[game.logic.turn] )
            socket.emit('Game.yourTurn');
    }
    
    var win = game.logic.checkWin();
    if( win )
        socket.emit('TicTacToe.win', win.pos );
        
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
