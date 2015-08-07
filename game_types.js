
var server = require('./server.js');
var express = require('express');
var l20n = require('./l20n/l20n.js');
var fs = require('fs');
var game_types = {};
var game_types_info = {};

function initizeStaticFiles(id) {
  server.app.use('/game_types/'+id, express.static('./game_types/'+id+'/public'));
}

fs.readdir('./game_types/', function( err, list ) {
  for( var i = 0; i < list.length; i++ ) {
    var id = list[i];
    var game_type = require('./game_types/'+id+'/main.js');
    if( game_type.info.hidden === true )
      continue;
      
    l20n.addResource('./game_types/'+id+'/l20n/');
      
    game_types[id] = game_type;
    game_types_info[id] = game_type.info;
    
    game_type.info.id = id;
    initizeStaticFiles(id);
  }
});

module.exports = {
  game_types: game_types,
  game_types_info: game_types_info
};