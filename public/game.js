
joinGame();

function onSeatClick() {
  if( $('#players.seated').length == 0 )
    socket.emit('sit', $(this).attr('data-i') );
}

var game_type = null;
socket.on('game-type', function(_game_type) {
  game_type = _game_type;
  $('#settings #game-type').text(game_type.title);
});

socket.on('seated', function(seated) {
  $('#players').toggleClass('seated', seated);
  $('#stand-up').attr('disabled', seated ? null : 'disabled');
});

var owner = false;
socket.on('owner', function(_owner) {
  owner = _owner;
});

var initized = false;
socket.on('game', function(game) {
  $('#settings #players-count').text(game.players.length);
  
  if( ! initized ) {
    for( var i = 0; i < game.players.length; i++ ) {
      $('#players').append('<li data-i="'+i+'"></li>');
    }
    $('#players li').click( onSeatClick );
    initized = true;
  }
  
  for( var i = 0; i < game.players.length; i++ ) {
    var e = $('#players li[data-i="'+i+'"]');
    if( game.players[i] === null ) {
      e.toggleClass('free-seat', true);
      e.text('Usiądź tu');
    } else {
      e.toggleClass('free-seat', false);
      e.text(game.players[i]);
    }
  }
  
  if( owner && game.players.indexOf(null) == -1 ) 
    $('#start-game').attr('disabled', null);
  else
    $('#start-game').attr('disabled', 'disabled');
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
  $('#start-game').click( function() { socket.emit('start-game'); } );
  $('#stand-up').click( function() { socket.emit('stand'); } );
});