
var DotsAndBoxes = {
    click: function() {
        function pos_reverse(pos) {
            pos = pos.split(',');
            return {x: pos[0]|0, y: pos[1]|0};
        }
        if( this.dataset.vwall )
            socket.emit('DotsAndBoxes.vwall', pos_reverse(this.dataset.vwall) );
        else
            socket.emit('DotsAndBoxes.hwall', pos_reverse(this.dataset.hwall) );
    },
    events: {
        'Game.yourTurn': function() {
            $('[data-bind="DotsAndBoxes.board"]').attr('data-turn', '');
        },
        'Game.setTurn': function(c) {
            $('[data-bind="DotsAndBoxes.board"]').removeAttr('data-turn');
        },
        'DotsAndBoxes.color': function(c) {
            $('[data-bind="DotsAndBoxes.board"]').attr('data-color', c);
        },
        'DotsAndBoxes.board': function(board) {
            function pos(x,y) { return x+','+y; }
            function tile(x, y) { return '<div class="box" data-tile="'+pos(x,y)+'" data-owner="'+board.tiles[x][y]+'"></div>'; }
            function vwall(x, y) { return '<div class="dash" data-vwall="'+pos(x,y)+'" data-owner="'+board.vwalls[x][y]+'"></div>'; }
            function hwall(x, y) { return '<div class="dash" data-hwall="'+pos(x,y)+'" data-owner="'+board.hwalls[x][y]+'"></div>'; }
            
            var s = '';
            for( var y = 0; y <= board.tiles[0].length; y++ ) {
                if( y != 0 ) {
                    s += '<div class="box-row">';
                    for( var x = 0; x <= board.tiles.length; x++ ) {
                        if( x != 0 )
                            s += tile(x-1, y-1);
                        s += vwall(x, y-1);
                    }
                    s += '</div>';
                }
                    
                s += '<div class="dash-row">';
                for( var x = 0; x <= board.tiles.length; x++ ) {
                    if( x != 0 )
                        s += hwall(x-1,y);
                    s += '<div class="dot"></div>';
                }
                s += '</div>';
                
            }
            $('[data-bind="DotsAndBoxes.board"]').html(s);
            $('[data-bind="DotsAndBoxes.board"] .dash').click( DotsAndBoxes.click );
            $('[data-bind="DotsAndBoxes.board"] [data-owner]').each( function() {
                if( this.dataset.owner != -1 )
                    $(this).addClass({0:'blue lighten-2', 1:'orange lighten-2'}[this.dataset.owner]);
            });
        },
        'DotsAndBoxes.names': function(names) {
            for( var i = 0; i < 2; i++ )
                $('[data-bind="DotsAndBoxes.name'+i+'"]').text(names[i]);
        },
        'DotsAndBoxes.scores': function(scores) {
            for( var i = 0; i < 2; i++ )
                $('[data-bind="DotsAndBoxes.score'+i+'"]').text(scores[i]);
        },
        'DotsAndBoxes.update': function(data) {
            function pos(x,y) { return x+','+y; }
            $('[data-'+data.what+'="'+pos(data.x, data.y)+'"]')
                .attr('data-owner', data.value)
                .addClass({0:'blue lighten-2', 1:'orange lighten-2'}[data.value]);
        }
    },
    init: function() {
    },
    deinit: function() {}
};

$( function() {
    Game.init( DotsAndBoxes );
});