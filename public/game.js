
var id = window.location.hash.substring(1)  ;

socket.on('authed', function() { socket.emit('join', {join: 'pregame', id: id}); });

var game_type = null;
socket.on('game-type', function(_game_type) {
  game_type = _game_type;
  $('#settings #game-type').text(game_type.title);
});

socket.on('game', function(game) {
  $('#settings #players-count').text(game.players.length);
});

socket.on('settings', function(settings) {
  $('#settings li').not('[data-permanent]').remove();
  
  for( var i = 0; i < game_type.settings.length; i++ ) {
    var setting = game_type.settings[i];
    var name = setting.label;
    var value;
    if( 'options' in setting ) {
      var pos = setting.options.indexOf(settings[setting.name]);
      value = setting.options_labels[pos];
    } else if( setting.value == 'int' ) {
      value = settings[setting.name];
    }
    $('#settings').append('<li>' + name + ': ' + value + '</li>');
  }
});

$( function() {
  $('#start-game').click( function() { alert('Not yet implemented'); } );
});