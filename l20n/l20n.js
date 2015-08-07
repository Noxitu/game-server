
var fs = require('fs');
var express = require('express');
var app = require('../server.js').app;

try{
    fs.mkdirSync('tmp');
}catch(e){}

var data = JSON.parse( fs.readFileSync('l20n/l20n.json', {'encoding': 'utf8'}) );
app.use('/l20n.json', express.static('l20n/l20n.json'));
console.log('Found languages: '+data.locales);


module.exports.addResource = function(dir) {
    for( var i = 0; i < data.locales.length; i++ ) {
        var content;
        try {
            content = fs.readFileSync(dir+'/'+data.locales[i]+'.l20n', {'encoding': 'utf8'});
        } catch(e){
            content = fs.readFileSync(dir+'/'+data.default_locale+'.l20n', {'encoding': 'utf8'});
        }
        fs.appendFileSync('tmp/'+data.locales[i]+'.l20n', content, {'encoding': 'utf8'});
    }
}

for( var i = 0; i < data.locales.length; i++ ) {
    fs.writeFileSync('tmp/'+data.locales[i]+'.l20n', '', {'encoding': 'utf8'});
    app.use('/l20n/'+data.locales[i]+'.l20n', express.static('tmp/'+data.locales[i]+'.l20n'));
}

module.exports.addResource('l20n');