
var _50Stones = {
    submit: function() {
        Title.clear('*');
        var pick = $(this).find('input[name="pick"]').val();
        socket.emit('50Stones.pick', pick );
        _50Stones.events['50Stones.pick'](pick);
        _50Stones.idleSince = new Date().getTime();
        return false;
    },
    events: {
        '50Stones.cantPlay': function() {
            _50Stones.cantPlay = true;
            $('main#game [data-50stones-inputs]').hide();
        },
        '50Stones.players': function(players) {
            var e = $('[data-bind="50stones-players-row"]');
            e.html('');
            for( var i = 0; i < players.length; i++ )
                e.append('<th>'+players[i]+' (<span data-bind="score">0</span>) [<span data-bind="stones">0</span>]</th>');
        },
        '50Stones.history': function(history) {
            for( var j = 0; j < history.length; j++ ) {
                var tr = $('<tr></tr>');
                for( var i = 0; i < history[j].length; i++ )
                    tr.append('<td>'+history[j][i]+'</td>');
                $('main#game table tbody').prepend(tr);
            }
        },
        '50Stones.pick': function(pick) {
            $('main#game [data-50stones-inputs] input').val(pick).hide();
            $('main#game [data-50stones-inputs] a').hide();
            $('main#game [data-50stones-inputs] h1').show().text(pick);
        },
        '50Stones.scores': function(scores) {
            var e = $('main#game [data-bind="score"]')
            for( var i = 0; i < scores.length; i++ )
                e.eq(i).text(scores[i]);
        },
        '50Stones.stones': function(stones) {
            var e = $('main#game [data-bind="stones"]')
            for( var i = 0; i < stones.length; i++ )
                e.eq(i).text(stones[i]);
        },
        '50Stones.picks': function(picks) {
            var tr = $('<tr></tr>');
            for( var i = 0; i < picks.length; i++ )
                tr.append('<td>'+picks[i]+'</td>');
            $('main#game table tbody').prepend(tr);
        },
        '50Stones.end': function(now) {
            Title.clear('*');
            if( now ) {
                $('main#game [data-50stones-inputs]').slideUp();
            } else {
                $('main#game [data-50stones-inputs]').hide();
            }
        },
        '50Stones.round': function() {
            if( _50Stones.cantPlay !== true ) {
                Title.add('*');
                $('main#game [data-50stones-inputs] input').show();
                $('main#game [data-50stones-inputs] a').show();
                $('main#game [data-50stones-inputs] h1').hide();
                if( Focus.state == 'off' || _50Stones.idleSince + 20000 < new Date().getTime() )
                    Audio.notify();
            }
        }
    },
    init: function() {
        $('main#game [data-50stones-inputs]').submit( _50Stones.submit );
        $('main#game [data-50stones-inputs] a').click( function() { $('main#game [data-50stones-inputs]').submit(); return false; } );
        _50Stones.idleSince = new Date().getTime();
    },
    deinit: function() {}
};

$( function() {
    Game.init( _50Stones );
});