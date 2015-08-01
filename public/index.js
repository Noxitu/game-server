
var Debug = {
    on: function() { localStorage.debug = 'socket.io-client:socket'; },
    off: function() { localStorage.removeItem('debug'); },
};

function addListeners(events) {
    for( var e in events )
        socket.on(e, events[e]);
}

function removeListeners(events) {
    for( var e in events )
        socket.removeListener(e, events[e]);
}

var Toast = {
    show: function(data) {
        console.log('Toast: ['+data.type+'] '+data.message);
        var color = {'info': 'light-blue', 'warning': 'yellow', 'error': 'red'}[data.type];
        if( data.type == 'info' )
            data.type = 'info_outline';
        Materialize.toast('<i class="material-icons '+color+'-text text-lighten-1 left">'+data.type+'</i>'+data.message, 3000);
        Audio.notify();
    },
    init: function() {
        socket.on('Toast.show', Toast.show );
    }
};

var Login = {
    auth: function(e) {
        Room.set('loading');
        var username = $(this).find('input[name="login"]').val();
        socket.emit('Login.auth', {
            username: username
        });
        
        return false;
    },
    onLogout: function() {
        localStorage.removeItem('the-game session-id');
        document.location.reload();
        return false;
    },
    events: {
        'Login.showForm': function(socket) {
            $('[data-loged="true"]').hide();
            $('[data-loged="false"]').show();
            Room.set('login');
        },
        'Login.storeSessionId': function(data) {
            localStorage.setItem('the-game session-id', data.sessionId);
        },
        'Login.onLogin': function(data) {
            $('[data-bind="username"]').text(data.username);
            $('[data-loged="false"]').hide();
            $('[data-loged="true"]').show();
            
            removeListeners(Login.events);
            Room.clear();
            Room.hashUpdated();
        },
    },
    init: function() {
        var sessionId = localStorage.getItem('the-game session-id');
        if( sessionId ){ 
            socket.emit('session-id', sessionId);
        } else
            Login.events['Login.showForm']();
            
        addListeners(Login.events);
        
        $('[data-action="logout"]').click( Login.onLogout );
        $('[data-submit="login"]').submit( Login.auth );
    },
};

var Room = {
    clear: function() {
        $('main:visible').hide();
    },
    set: function(id) {
        if( $('main#'+id).is(':visible') )
            return;
            
        Room.clear();
        $('main#'+id).show();
    },
    get: function() {
        return $('main:visible').attr('id');
    },
    hashUpdated: function() {
        if( Room.get() == 'loading' )
            return;
            
        if( location.hash.length > 1 ) {
            Room.join( location.hash.substr(1) );
        } else {
            Room.join();
        }
    },
    join: function(id) {
        Room.set('loading');
        location.hash = id || '';
            
        if( id )
            socket.emit('Room.join', {id: id});
        else
            socket.emit('Room.join', {});
    },
    load: function(data) {
        Room.set('loading');
        
        if( Room.handler )
            removeListeners(Room.currentHandler.events);
            
        if( data.id ) {
            return;
        } else {
            Room.currentHandler = Lobby;
        }
            
        Room.currentHandler.init();
        addListeners(Room.currentHandler.events);
    },
    showLobby() {
        var room = Room.get();
        if( room == 'loading' || room == 'lobby' )
            return;
        if( room == 'create-game' )
            Room.set('lobby');
        else
            Room.join();
    },
    init: function() {
        $('[data-action="lobby"]').click( Room.showLobby );
        $('[data-show]').click(function() { Room.set(this.dataset.show); return false; });
        window.onhashchange = Room.hashUpdated;
        
        socket.on('Room.set', Room.set);
        socket.on('Room.load', Room.load);
        socket.on('Room.join', Room.join);
    }
};

var Lobby = {
    appendSelect: function(element, name, label, values, labels) {
        var div_e = $('<div class="input-field"></div>');
        var select_e = $('<select name="'+name+'"></select>');
        for( var j = 0; j < values.length; j++ )
            select_e.append('<option value="'+values[j]+'">'+labels[j]+'</option>');
            
        div_e.append(select_e);
        div_e.append('<label for="'+name+'">'+label+'</label>');
        element.append(div_e);
        select_e.material_select();
    },
    createGameTypeChanged: function() {
        var game_type = Lobby.game_types[$(this).val()];
        var element = $('main#create-game .settings');
        element.children().remove();
        
        if( game_type === undefined ) {
            $('main#create-game [data-action="submit"]').attr('disabled', true);
            return;
        }
        
        $('main#create-game [data-action="submit"]').attr('disabled', null);
        
        if( game_type.players.length !== undefined ) {
            Lobby.appendSelect(element, 'players_count', 'Liczba graczy', game_type.players, game_type.players);
        }
        
        for( var i = 0; i < game_type.settings.length; i++ ) {
            var setting = game_type.settings[i];
            if( 'options' in setting ) {
                Lobby.appendSelect(element, setting.name, setting.label, setting.options, setting.options_labels);
            } else {
                var label_attrs = '', input_attrs = '';
                if( setting.value_ex && setting.value_ex['default'] ) {
                    label_attrs += ' class="active"';
                    input_attrs += ' value="' + setting.value_ex['default'] + '"';
                }
                element.append('<div class="input-field"><label for="'+setting.name+'"'+label_attrs+'>'+setting.label+': </label><input type="number" name="'+setting.name+'" required'+input_attrs+'></div>');
            }
        }    
        
        UI.fixClickableLabels(element);
    },
    createGame: function() {
        Room.set('loading');
        socket.emit('Lobby.createGame', $(this).serialize());
        return false;
    },
    joinGame: function() {
        if( Room.get() == 'loading' )
            return;
            
        Room.join(this.dataset.gameId);
        return true;
    },
    events: {
        'Lobby.game_types': function(game_types) {
            Lobby.game_types = game_types;
            $('main#create-game select[name="id"] option:not([disabled])').remove();
            $('main#create-game select[name="id"]').change();
            
            for( var t in game_types ) {
                var type = game_types[t];
                $('main#create-game select[name="id"]').append('<option value="'+type.id+'">'+type.title+'</option>');
            }
            
            $('main#create-game select[name="id"]').material_select();
            $('main#create-game select[name="id"]').closest('.input-field').children('.caret').remove();
        },
        'Lobby.update': function(data) {
            for( var i = 0; i < data.length; i++ ) {
                var game = data[i];
                
                var game_e = $('main#lobby [data-game-list] > [data-game-id="'+game.id+'"]');
                if( game_e.length == 0 ) {
                    game_e = $('[data-templates] [data-template="lobby-game"]').clone();
                    $('main#lobby [data-game-list]').prepend( game_e );
                    game_e.attr('data-game-id', game.id);
                    game_e.click(Lobby.joinGame);
                }
                    
                game_e.find('img').attr('src', '/game_types/'+game.type+'/'+Lobby.game_types[game.type].logo);
                game_e.find('.title').text( Lobby.game_types[game.type].title );
                var player_list = '';
                for( var j = 0; j < game.players.length; j++ ) {
                    player_list += (game.players[j] ? game.players[j] : '-') + ' ';
                }
                game_e.find('p').text( player_list );
                switch(game.status) {
                    case 'setting up':
                        game_e.find('i').text('');
                        break;
                    case 'ended':
                        game_e.find('i').text('done');
                        break;
                    default:
                        game_e.find('i').text('play_arrow');
                }
            }
        }
    },
    init_global: function() {
        $('main#create-game select[name="id"]').change(Lobby.createGameTypeChanged);
        $('main#create-game form').submit(Lobby.createGame);
    },
    init: function() {
        $('main#lobby [data-game-list] *').remove();
    },
};

var Audio = {
    notify: function() {
        if( Audio.enabled ) {
            Audio.notifyElement.currentTime = 0;
            Audio.notifyElement.play();
        }
    },
    switchState: function() {
        Audio.enabled = !Audio.enabled;
        $('audio').each( function() { this.muted = !Audio.enabled; });
        localStorage.setItem('the-game audio-enabled', Audio.enabled ? 'true' : 'false');
        Audio.updateIcon();
    },
    updateIcon: function() {
        $('i[data-volume-state]').text(Audio.enabled ? 'volume_up' : 'volume_off');
    },
    init: function() {
        if( !window.AUTOPLAY_ENABLED ) {
            function onAutoplayEnabled() {
                window.removeEventListener('autoplayenabled', onAutoplayEnabled, false);
                Audio.init();
                return false;
            }
            window.addEventListener('autoplayenabled', onAutoplayEnabled, false);
            return;
        }
        $('[data-require-autoplay]').removeAttr('data-require-autoplay');
        Audio.enabled = localStorage.getItem('the-game audio-enabled') == 'true';
        if( Audio.enabled === null )
            Audio.enabled = true;
            
        Audio.updateIcon();
        $('[data-action="Audio.switchState"]').click(Audio.switchState);
        $('body').append('<audio id="Audio-notify" hidden preload="auto"> <source src="sound/notify.mp3" type="audio/mpeg"> <source src="sound/notify.wav" type="audio/wav"> </audio>');
        Audio.notifyElement = $('#Audio-notify')[0];
    }
};

var UI = {
    fixClickableLabels: function(obj) {
        var sel = '.input-field label';
        var e = obj ? obj.find(sel) : $(sel);
        e.click( function() { $(this).closest('.input-field').find('input').focus(); } );
    },
    init: function() {
        $('select').material_select();
        $(".dropdown-button").dropdown();
        $('.button-collapse').sideNav();
        $('[data-action="submit"]').click(function(){ $(this).closest('form').submit(); return false; });
        UI.fixClickableLabels();
    }
};


var socket;

$(function() {
    socket = io();
    Login.init();
    Room.init();     
    Toast.init();
    UI.init();
    Lobby.init_global();
    Audio.init();
});
