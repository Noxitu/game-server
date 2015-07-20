
var games = {};
var game_types = require('./game_types.js').game_types;
var io = require('./server.js').io;

function gid() {
  return 'xxxxxx'.replace(/[xy]/g, function(c) {
    var v = Math.random()*16|0;
    return v.toString(16);
  });
}

function Game(settings, owner) {
  do {
    this.id = gid();
  } while( this.id in games );
  this.type = settings.id;
  this.owner = owner;
  this.settings = settings;
  this.status = 'setting up';
  this.players = [null, null];
  
  games[this.id] = this;
}

Game.prototype.getHref = function() {
  switch(this.status) {
    case 'setting up':
      return '/game.html#'+this.id;
    default:
      return '/game:'+this.type+'/#'+this.id;
  }
}

Game.prototype.serializeToLobby = function() {
  return {
    id: this.id,
    type: this.type,
    status: this.status,
    href: this.getHref(),
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
    io.to('lobby').emit('lobby-games', [this.serializeToLobby()] );
}

module.exports = {
  Game: Game,
  games: games
};