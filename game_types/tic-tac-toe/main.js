﻿
var io = require('../../server.js').io;

var info = {
    title: "Kółko i krzyżyk",
    logo: "tic-tac-toe.png",
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
    function onMove(pos) {
        if( game.status != 'going on' )
            return;
        
        if( game.logic.turn != game.players.indexOf(user) )
            return;
            
        if( game.logic.map[pos] != ' ' )
            return;
            
        game.logic.map[pos] = ['x','o'][game.logic.turn];
        game.logic.turn = 1-game.logic.turn;
        
        io.to(game.room()).emit('update', game.logic.map);
        
        var win = game.logic.checkWin();
        if( win || game.logic.map.indexOf(' ') == -1 )
            game.changeStatus('ended');
            
        if( win )
            io.to(game.room()).emit('win', win.pos );
    }

    socket.emit('update', game.logic.map);
    var win = game.logic.checkWin();
    if( win )
        socket.emit('win', win.pos );
    
    socket.join(game.room());
    socket.on('move', onMove );
}


module.exports = {
    info: info,
    Logic: Logic,
    Connection: Connection
}
