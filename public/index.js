
socket.on('authed', function() { socket.emit('join', {join: 'lobby'}); });

// lobby()
$(function(){
  $('#new-game').click(function(){
    $('#create-game').slideDown();
    return false;
  });
});

var games = {};

function onJoinGame(game) {

}


socket.on('lobby-games', function(data) {
  for( var i = 0; i < data.length; i++ ) {
    var game = data[i];
    games[game.id] = game;
    
    var game_e = $('.game[data-game-id="'+game.id+'"]');
    if( !game_e.is('*') ) {
      game_e = $('<li></li>');
      $('#games-open').append(game_e);
      game_e
        .addClass('game')
        .attr('data-game-id', game.id)
        .append('<img class="img" src="tic-tac-toe.png">')
        .append('<h4 class="title">Kółko i krzyżyk</h3>')
        .append('<span class="players"><span>?</span></span>');
    }
      
  }
});

socket.on('lobby-game-join', function(game) {
  creating_game = false;
  $('#new-game').attr('disabled',null);
});