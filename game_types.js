
var server = require('./server.js');
var express = require('express');
var fs = require('fs');
var game_types = {};
var game_types_info = {};

function initizeStaticFiles(id) {
  server.app.use('/game:'+id, express.static('./game_types/'+id+'/public'));
}

fs.readdir('./game_types/', function( err, list ) {
  for( var i = 0; i < list.length; i++ ) {
    var id = list[i];
    var game_type = game_types[id] = require('./game_types/'+id+'/main.js');
    game_types_info[id] = game_type.info;
    
    game_type.info.id = id;
    initizeStaticFiles(id);
  }
});

module.exports = {
  game_types: game_types,
  game_types_info: game_types_info
};