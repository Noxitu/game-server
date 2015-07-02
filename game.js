
var games = {};

function gid() {
  return 'xxxxxx'.replace(/[xy]/g, function(c) {
    var v = Math.random()*16|0;
    return v.toString(16);
  });
}

function Game(data) {
  do {
    this.id = gid();
  } while( this.id in games );
  this.type = data.id;
  this.settings = data;
  this.status = 'setting up';
  this.players = [null, null];
  this.preRoom = 'pregame:'+this.id;
  
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

Game.prototype.serializeToDetails = function() {
  return {
    id: this.id
  };
}

module.exports = {
  Game: Game,
  games: games
};