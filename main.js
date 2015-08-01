
// sessions
var users = {};
var sessions = {};

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

function user_id() {
    return 'xxxx-xxxx-xxxx'.replace(/[xy]/g, function(c) {
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

var io = require('./server.js').io;

var IndexConnection = require('./index-connection.js').IndexConnection;
var LobbyConnection = require('./lobby-connection.js').LobbyConnection;
var game_module = require('./game.js');

io.on('connection', function (socket) {
    var user = null;
    
    // auth()
    function onSessionId(data) {
        if( data in sessions ) {
            user = sessions[data];
            initizeSession();
        } else
            socket.emit('Login.showForm');
    }
    
    function onLogin(data) {
        if( data.username.length < 3 ) {
            socket.emit('Toast.show', {
                message: 'Błędne dane logowania.',
                type: 'error'
            });
            socket.emit('Login.showForm');
            return;
        }
           
        if( data.username in users )
            user = users[data.username];
        else
            user = users[data.username] = { 
                id: new_id( user_id, users ),
                username: data.username
            };
            
        var sessionId = newid( uuid, sessions );
        
        socket.emit('Login.storeSessionId', {sessionId: sessionId});
        sessions[sessionId] = user;
        initizeSession();
    }
    
    var destroyConnection;
    function onJoin(data) {
        if( destroyConnection )
            destroyConnection();
            
        if( data.id === undefined ) {
            socket.emit('Room.load', {});
            destroyConnection = IndexConnection(socket, user);
            socket.emit('Room.set', 'index');
            return;
        }
        
        if( ! (data.id in game_module.games) ) {
            socket.emit('Toast.show', {
                message: 'Game not found',
                type: 'warning'
            });
            socket.emit('Room.join');
            return;
        }
        
        var game = game_module.games[data.id];
        if( game.status == 'lobby' ) {
            socket.emit('Room.load', {id: game.id});
            destroyConnection = LobbyConnection(socket, user, game);
            socket.emit('Room.set', 'lobby');
        } else {
            socket.emit('Toast.show', {
                message: 'Not implemented',
                type: 'error'
            });           
            socket.emit('Room.join');
        }
            
        /*switch(data.join) {
            case 'lobby':
                LobbyConnection(socket, user);
                break;
                
            case 'game':
                if( ! (data.id in game_module.games) ) {
                    socket.emit('redirect', '/');
                    break;
                }
                var game = game_module.games[data.id];
                if( game.status == 'setting up' )
                    PregameConnection(socket, user, game);
                else
                    game.game_type().Connection(socket, user, game);
        }
        socket.removeListener( 'join', onJoin );*/
    }
    
    function initizeSession() {
        socket.emit('Login.onLogin', {
            username: user.username
        });
        socket.removeListener( 'session-id', onSessionId );
        socket.removeListener( 'Login.auth', onLogin );
        
        socket.on('Room.join', onJoin );
    }
    
    socket.on('session-id', onSessionId);
    socket.on('Login.auth', onLogin);
    
    socket.on('error', function(e) {
        socket.emit('Toast.show', {
            message: 'socketerrror='+e.stack,
            type: 'error'
        });
    });
});

