
var JanKenPon = {
    click: function() {
        socket.emit('JanKenPon.click', this.dataset.pick);
    },
    events: {
        'JanKenPon.cantPlay': function() {
            $('main#game [data-jankenpon-buttons]').hide();
        },
        'JanKenPon.players': function(players) {
            var e = $('main#game [data-bind="name"]')
            for( var i = 0; i < 2; i++ )
                e.eq(i).text(players[i]);
        },
        'JanKenPon.history': function(history) {
            for( var j = 0; j < history.length; j++ ) {
                var tr = $('<tr></tr>');
                for( var i = 0; i < 2; i++ )
                    tr.append('<td><img src="'+JanKenPon.srcs[history[j][i]]+'"></td>');
                $('main#game table tbody').prepend(tr);
            }
        },
        'JanKenPon.scores': function(scores) {
            var e = $('main#game [data-bind="score"]')
            for( var i = 0; i < 2; i++ )
                e.eq(i).text(scores[i]);
        },
        'JanKenPon.picks': function(picks) {
            var e = $('main#game [data-jankenpon-picks] img');
            e.clearQueue().stop(true);
            for( var i = 0; i < 2; i++ ) 
                if( picks[i] === null )
                    e.eq(i).css('opacity', 0);
                else {
                    e.eq(i).attr('src', JanKenPon.srcs[picks[i]]);
                    e.eq(i).animate({opacity: 1 }, 200);
                }
                
            if( picks.indexOf(null) != -1 )
                return;
                
            e.delay(2000).animate({opacity: 0}, 1000);
            JanKenPon.events['JanKenPon.history']( [picks] );
            var picks_dict = {};
            for( var i = 0; i < 2; i++ )
                picks_dict[picks[i]] = 1;
            
            console.log(picks_dict);
            if( Object.keys(picks_dict).length == 1 ) {
                Toast.show( { message: 'Remis', type: 'info' } );
                return;
            }
            
            if( !('rock' in picks_dict) )
                Toast.show( { message: 'Nożyce tną papier', type: 'info' } );
            else if( !('paper' in picks_dict) )
                Toast.show( { message: 'Kamień tępi nożyce', type: 'info' } );
            else
                Toast.show( { message: 'Papier owija kamień', type: 'info' } );
        },
        'JanKenPon.players': function(players) {
            var e = $('main#game [data-bind="name"]')
            for( var i = 0; i < 2; i++ )
                e.eq(i).text(players[i]);
        },
        'JanKenPon.end': function(now) {
            if( now ) {
                $('main#game [data-jankenpon-buttons]').slideUp();
                $('main#game [data-jankenpon-picks] img').slideUp();
            } else {
                $('main#game [data-jankenpon-buttons]').hide();
                $('main#game [data-jankenpon-picks] img').hide();
            }
        }
    },
    init: function() {
        $('main#game [data-jankenpon-buttons] img').click( JanKenPon.click );
        JanKenPon.srcs = {};
        $('main#game [data-jankenpon-buttons] img').each( function() {
            JanKenPon.srcs[this.dataset.pick] = $(this).attr('src');
        });
    },
    deinit: function() {}
};

$( function() {
    Game.init( JanKenPon );
});