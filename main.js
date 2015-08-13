
var users = {};

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

function getUser( username ) {
    if( username in users )
        return users[username];
    var user = users[username] = { 
        id: newid( user_id, users ),
        username: username
    };
    return user;
}

var io = require('./server.js').io;
require('./l20n/l20n.js');

var IndexConnection = require('./index-connection.js').IndexConnection;
var LobbyConnection = require('./lobby-connection.js').LobbyConnection;
var GameConnection = require('./game-connection.js').GameConnection;
var game_module = require('./game.js');
var db = require('./db.js');

io.on('connection', function (socket) {
    var user = null;
    
    // auth()
    function onSessionId(data) {
        db.session_restore( data, function(username) {
            if( username === null )
                socket.emit('Login.showForm');
            else {
                user = getUser( username );
                initizeSession();
            }
        });
    }
    
    function onLogin(data) {
        if( data.username.length < 3 ) {
            socket.emit('Toast.show', {
                entity: 'invalid_login',
                type: 'error'
            });
            socket.emit('Login.showForm');
            return;
        }
           
        user = getUser( data.username );
            
        db.session_create( user.username, function(sessionId) {
            socket.emit('Login.storeSessionId', {sessionId: sessionId});
            initizeSession();
        });
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
                entity: 'game_not_found',
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
            function onLoaded() {
                socket.removeListener('Game.init', onLoaded );
                destroyConnection = GameConnection(socket, user, game);
                socket.emit('Room.set', 'game');
            }
            socket.emit('Room.load', {id: game.id, type: game.type});
            socket.on('Game.init', onLoaded );
        }
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
            message: 'ServerSideException',
            type: 'error',
            notify: true,
            more: e.stack
        });
    });
   
});

