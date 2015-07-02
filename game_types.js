

var fs = require('fs');
var game_types = {};

fs.readdir('./games/', function( err, list ) {
    for( var i = 0; i < list.length; i++ ) {
        var id = list[i];
        game_types[id] = require('./games/'+id+'/main.js').info;
    }
});

/*var path = require('path');
var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};*/

module.exports = {
  game_types: game_types
};