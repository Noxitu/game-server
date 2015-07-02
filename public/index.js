
socket.on('authed', function() { socket.emit('join', {join: 'lobby'}); });

var games = {};

socket.on('lobby-games', function(data) {
  console.log(data);
  for( var i = 0; i < data.length; i++ ) {
    var game = data[i];
    games[game.id] = game;
    
    var game_e = $('.game[data-game-id="'+game.id+'"]');
    if( game_e.length == 0 ) {
      game_e = $('<li></li>');
      $('#games-open').append(game_e);
      var players_e = $('<span class="players"></span>');
      for( var j = 0; j < game.players.length; j++ ) {
        if( game.players[j] )
          players_e.append('<span>'+game.players[j]+'</span> ');
        else
          players_e.append('<span>-</span> ');
      }
      game_e
        .addClass('game')
        .attr('data-game-id', game.id)
        .append('<img class="img" src="/game:'+game.type+'/'+game_types[game.type].logo+'">')
        .append('<h4 class="title">'+game_types[game.type].title+'</h3>')
        .append(players_e);
    }
      
  }
});

var game_types = {};
socket.on('game-types', function(_game_types) {
  game_types = _game_types;
  $('#create-game select[name="id"] option').remove();
  var types = Object.keys(game_types);
  for( var i = 0; i < types.length; i++ ) {
    var type = game_types[types[i]];
    $('#create-game select[name="id"]').append('<option value="'+type.id+'">'+type.title+'</option>');
  }
});

$( function() {
  $('#new-game').click(function(){
    $('#create-game').slideDown();
    $('#create-game select[name="id"]').change();
    return false;
  });

  $('#create-game select[name="id"]').change(function() {
    var id = $(this).val();
    $('#create-game .settings *').remove();
    for( var i = 0; i < game_types[id].settings.length; i++ ) {
      var setting = game_types[id].settings[i];
      $('#create-game .settings').append('<label for="'+setting.name+'">'+setting.label+': </label>');
      if( 'options' in setting ) {
        var select_e = $('<select name="'+setting.name+'"></select>');
        for( var j = 0; j < setting.options.length; j++ )
          select_e.append('<option value="'+setting.options[j]+'">'+setting.options_labels[j]+'</option>');
        $('#create-game .settings').append(select_e);
      }else{
        $('#create-game .settings').append('<input name="'+setting.name+'">');
      }
      $('#create-game .settings').append('<br><br>');
    }
  });
  
  $('#create-game').submit( function() {
    socket.emit('create-game', $(this).serialize());
    return false;
  });
  
  $('#create-game .cancel').click( function() {
    $('#create-game').slideUp();
    return false;
  });
  
});