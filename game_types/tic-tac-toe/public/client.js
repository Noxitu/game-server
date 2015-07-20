
var id = window.location.hash.substring(1);
socket.on('authed', function() { socket.emit('join', {join: 'game', id: id}); });

$('.box').click( function() {
    socket.emit('move', $(this).attr('id').substr(3) );
});

socket.on('update', function(data) {
    for( var i = 0; i < 9; i++ ) {
        var c = data[i];
        $('#box'+i).attr('data-sprite', c == ' ' ? null : c );
    }
});

socket.on('win', function(pos) {
    $('body').attr('data-win', pos);
});
