
var TicTacToe = {
    click: function() {
        socket.emit('TicTacToe.click', this.dataset.boxId|0 );
    },
    events: {
        'TicTacToe.update': function(data) {
            for( var i = 0; i < 9; i++ ) {
                var c = data[i];
                $('main#game [data-box-id="'+i+'"]').attr('data-sprite', c == ' ' ? null : c );
            }
        },
        'TicTacToe.win': function(pos) {
            $('main#game [data-boxes]').attr('data-win', pos);
        }
    },
    init: function() {
        $('main#game .box').click(TicTacToe.click);
    },
    deinit: function() {}
};

$( function() {
    Game.init( TicTacToe );
});