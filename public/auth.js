var socket = io();

$(function(){
    $('#login-box').submit(function(){
        var username = $('#login-box input[name="username"]').val();
        socket.emit('login', {username: username});
        return false;
    });
});

function displayLoginBox() {
    if( $('#login-box').length == 0 ) {
        window.location.href = '/';
        return;
    }
    $('#login-box').slideDown();
}

socket.on('login-ok', function(data) {
    $('#login-box').slideUp();
    localStorage.setItem('the-game session-id', data.sessionId);
});

socket.on('login-request', displayLoginBox);

socket.on('authed', function(data) {
    $('#user-data').html('Zalogowany jako <b>'+data.username+'</b>.');
});


var sessionId = localStorage.getItem('the-game session-id');
if( sessionId ){ 
    socket.emit('session-id', sessionId);
    socket.emit('session-id', sessionId);
} else
    displayLoginBox();
    
    
socket.on('redirect', function(href) {
    window.location.href = href;
});

function joinGame() {
    var id = window.location.hash.substring(1);
    socket.on('authed', function() { socket.emit('join', {join: 'game', id: id}); });
}