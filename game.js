
var games = {};
var game_types = require('./game_types.js').game_types;
var io = require('./server.js').io;

function gid() {
  return 'xxxxxx'.replace(/[xy]/g, function(c) {
    var v = Math.random()*16|0;
    return v.toString(16);
  });
}

function verify_settings(settings) {
    var game_type_info = game_types[settings.id].info;
        
    if( game_type_info.players.length === undefined ) {
        if( 'players_count' in settings )
            return 'invalid_player_count'; //return 'Player count provided while not allowed';
    } else {
        if( game_type_info.players.indexOf(settings.players_count|0) == -1 )
            return 'invalid_player_count'; //return 'Illegal player count';
    }
    
    for( var i = 0; i < game_type_info.settings.length; i++ ) {
        var setting = game_type_info.settings[i];
        if( ! (setting.name in settings) )
            return 'Setting `'+setting.name+'` required';
            
        var value = settings[setting.name];
        if( 'options' in setting ) {
            if( setting.options.indexOf(value) == -1 )
                return 'Setting `'+setting.name+'` has illegal value';
        } else if( setting.value == 'int' ) {
            if( isNaN(value) )
                return 'Setting `'+setting.name+'` has illegal value';
            value |= 0;
            if( setting.value_ex ) {
                if( setting.value_ex.min && setting.value_ex.min > value )
                    return 'Setting `'+setting.name+'` is too small';
                if( setting.value_ex.max && setting.value_ex.max < value )
                    return 'Setting `'+setting.name+'` is too big';
            }
        }
    }
}

function Game(settings, owner) {
  do {
    this.id = gid();
  } while( this.id in games );
  this.type = settings.id;
  this.owner = owner;
  this.settings = settings;
  this.status = 'lobby';
  
  this.players = [];
  var players_count = settings.players_count || game_types[this.type].info.players;
  for( var i = 0; i < players_count; i++ )
    this.players[i] = null;
  
  games[this.id] = this;
}

Game.prototype.serializeToLobby = function() {
  return {
    id: this.id,
    type: this.type,
    status: this.status,
    players: this.players.map( function(u) { return u ? u.username : null; } )
  };
};

Game.prototype.serializeToPregame = function() {
  return {
    players: this.players.map( function(u) { return u ? u.username : null; } )
  };
}

Game.prototype.room = function() { return 'game:'+this.id; }
Game.prototype.game_type = function() { return game_types[this.type]; }

Game.prototype.changeStatus = function(status) {
    this.status = status;
    io.to('index').emit('Index.update', [this.serializeToLobby()] );
}

Game.prototype.end = function() {
    this.changeStatus('ended');
    io.to(this.room()).emit('Game.ended');
}

module.exports = {
  Game: Game,
  games: games,
  verify_settings: verify_settings
};