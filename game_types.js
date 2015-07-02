
var server = require('./server.js');
var express = require('express');
var fs = require('fs');
var game_types = {};

function initizeStaticFiles(game_type) {
  server.app.use('/game:'+game_type.id, express.static('./game_types/'+game_type.id+'/public'));
}

fs.readdir('./game_types/', function( err, list ) {
  for( var i = 0; i < list.length; i++ ) {
    var id = list[i];
    var game_type = game_types[id] = require('./game_types/'+id+'/main.js').info;
    game_type.id = id;
    initizeStaticFiles(game_type);
  }
});

module.exports = {
  game_types: game_types
};