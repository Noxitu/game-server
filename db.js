
module.exports = {};

if( process.env.DATABASE_URL ) {
    var pg = require('pg');
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    
        client.query("CREATE TABLE sessions( session_id uuid primary key, username text, expires timestamp default now()::timestamp);", function(err, result) {
            
            client.query("DELETE FROM sessions WHERE expires + interval '1 month' < now()::timestamp", function(err, result) {
                if( err ) console.log(err);
                done();
            });
        });
    });
    
    module.exports.session_restore = function(session_id, callback) {
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query("UPDATE sessions SET expires = now()::timestamp WHERE session_id = $1::uuid RETURNING username;", [session_id], function(err, result) {
                done();
                if( err ) { console.log(err); callback(null); return; }
                if( result.rowCount == 0 )
                    callback(null);
                else
                    callback(result.rows[0].username);
            });
        });
    };
    
    module.exports.session_create = function(username, callback) {
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query("INSERT INTO sessions VALUES( md5(random()::text || clock_timestamp()::text)::uuid, $1) RETURNING session_id;", [username], function(err, result) {
                done();
                if( err ) { console.log(err); return; }
                callback(result.rows[0].session_id);
            });
        });
    };
    
} else {
    var sessions = {};
    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    function newid(func, collection) {
        var id;
        do {
            id = func();
        } while( id in collection );
        return id;
    }
    
    module.exports.session_restore = function(session_id, callback) {
        if( session_id in sessions )
            callback( sessions[session_id] );
        else
            callback( null );
    };
    
    module.exports.session_create = function(user_id, callback) {
        var session_id = newid(uuid, sessions);
        sessions[session_id] = user_id;
        callback(session_id);
    };
}