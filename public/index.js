
var Debug = {
    on: function() { localStorage.debug = 'socket.io-client:socket'; },
    off: function() { localStorage.removeItem('debug'); },
};

function addListeners(events) {
    for( var e in events ) {
        socket.on(e, events[e]);
    }
}

function removeListeners(events) {
    for( var e in events ) {
        socket.removeListener(e, events[e]);
    }
}

var Toast = {
    show: function(data) {
        var message = 'entity' in data ? document.l10n.getEntitySync(data.entity).value : data.message;
        console.log('Toast: ['+data.type+'] '+message);
        var color = {'info': 'light-blue', 'warning': 'yellow', 'error': 'red'}[data.type];
        if( data.type == 'info' )
            data.type = 'info_outline';
        Materialize.toast('<i class="material-icons '+color+'-text text-lighten-1 left">'+data.type+'</i>'+message, 3000);
        
        if( data.notify === true )
            Audio.notify();
        if( 'more' in data )
            console.log(data.more);
    },
    init: function() {
        socket.on('Toast.show', Toast.show );
    }
};

var Title = {
    priority_list: '*!^',
    notifications: {},
    add: function(c) {
        if( c in Title.notifications )
            Title.notifications[c]++;
        else
            Title.notifications[c] = 1;
        Title.update();
    },
    remove: function(c) {
        if( Title.notifications[c] > 0 )
            Title.notifications[c]--;
        Title.update();
    },
    clear: function(c) {
        if( c )
            delete Title.notifications[c];
        else
            Title.notifications = {};
        Title.update();
    },
    update: function() {
        for( var i = 0; i < Title.priority_list.length; i++ ) {
            var c = Title.priority_list.charAt(i);
            if( Title.notifications[c] > 0 ) {
                document.title = c + ' ' + Title.title;
                return;
            }
        }
        document.title = Title.title;
    },
    init: function() {
        Title.title = document.title;
    }
};

var Focus = {
    init: function() {
        Focus.state = document.hidden ? 'off' : 'on';
        window.onfocus = function() { Focus.state = 'on'; };
        window.onblur = function() { Focus.state = 'off'; };
    },
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
    logout: function() {
        localStorage.removeItem('the-game session-id');
        document.location.reload();
        return false;
    },
    events: {
        'Login.showForm': function() {
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
        if( sessionId !== null ){ 
            socket.emit('session-id', sessionId);
        } else {
            Login.events['Login.showForm']();
        }
            
        addListeners(Login.events);
        
        $('[data-action="Login.logout"]').click( Login.logout );
        $('[data-submit="Login.auth"]').submit( Login.auth );
    },
};

var Room = {
    clear: function() {
        Title.clear();
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
        
        if( Room.currentHandler ) {
            removeListeners(Room.currentHandler.events);
            Room.currentHandler.deinit();
        }
            
        if( data.id ) {
            if( data.type ) {
                $.get('/game_types/'+data.type, function(html) {
                    html = html.replace(/([^\\])~/g, '$1/game_types/'+data.type);
                    html = html.replace('\\~', '~');
                    $('main#game').html(html);
                });
                Room.currentHandler = Game;
                addListeners(Room.currentHandler.events);
                return;
            } else
                Room.currentHandler = Lobby;
        } else {
            Room.currentHandler = Index;
        }
            
        Room.currentHandler.init();
        addListeners(Room.currentHandler.events);
    },
    showIndex() {
        var room = Room.get();
        if( room == 'loading' || room == 'index' )
            return;
        if( room == 'create-game' )
            Room.set('index');
        else
            Room.join();
    },
    init: function() {
        Room.clear();
        Room.set('loading');
        $('[data-action="Room.showIndex"]').click( Room.showIndex );
        $('[data-show]').click(function() { Room.set(this.dataset.show); return false; });
        window.onhashchange = Room.hashUpdated;
        
        socket.on('Room.set', Room.set);
        socket.on('Room.load', Room.load);
        socket.on('Room.join', Room.join);
    }
};

var Index = {
    appendSelect: function(element, name, label, values, labels) {
        console.log(labels);
        var div_e = $('<div class="input-field"></div>');
        var select_e = $('<select name="'+name+'"></select>');
        for( var j = 0; j < values.length; j++ )
            if( labels === undefined || labels[j] === undefined )
                select_e.append('<option value="'+values[j]+'">'+values[j]+'</option>');
            else
                select_e.append('<option value="'+values[j]+'" data-l10n-id="'+labels[j]+'"></option>');
              
            
        div_e.append(select_e);
        div_e.append('<label for="'+name+'" data-l10n-id="'+label+'">'+label+'</label>');
        element.append(div_e);
        select_e.material_select();
    },
    createGameTypeChanged: function() {
        var game_type = Index.game_types[$(this).val()];
        var element = $('main#create-game .settings');
        element.children().remove();
        
        if( game_type === undefined ) {
            $('main#create-game [data-action="submit"]').attr('disabled', true);
            return;
        }
        
        $('main#create-game [data-action="submit"]').attr('disabled', null);
        
        if( game_type.players.length !== undefined ) {
            Index.appendSelect(element, 'players_count', 'player_count', game_type.players);
        }
        
        for( var i = 0; i < game_type.settings.length; i++ ) {
            var setting = game_type.settings[i];
            if( 'options' in setting ) {
                Index.appendSelect(element, setting.name, game_type.l20n_prefix+'_settings_'+setting.name, setting.options, setting.options.map(function(e) {
                    return game_type.l20n_prefix+'_settings_'+setting.name+'_'+e; }
                ) );
            } else {
                var label_attrs = '', input_attrs = '';
                if( setting.value_ex && setting.value_ex['default'] ) {
                    label_attrs += ' class="active"';
                    input_attrs += ' value="' + setting.value_ex['default'] + '"';
                }
                element.append('<div class="input-field"><label for="'+setting.name+'"'+label_attrs+'><span data-l10n-id="'+game_type.l20n_prefix+'_settings_'+setting.name+'"></span>: </label><input type="number" name="'+setting.name+'" required'+input_attrs+'></div>');
            }
        }    
        element.each( function() {
            document.l10n.localizeNode(this);
        });
        element.find('select').material_select();
        element.find('select').closest('.input-field').children('.caret').remove();
        UI.fixClickableLabels(element);
    },
    createGame: function() {
        Room.set('loading');
        socket.emit('Index.createGame', $(this).serialize());
        return false;
    },
    joinGame: function() {
        if( Room.get() == 'loading' )
            return;
            
        Room.join(this.dataset.gameId);
        return true;
    },
    events: {
        'Index.game_types': function(game_types) {
            Index.game_types = game_types;
            $('main#create-game select[name="id"] option:not([disabled])').remove();
            $('main#create-game select[name="id"]').change();
            
            for( var t in game_types ) {
                var type = game_types[t];
                $('main#create-game select[name="id"]').append('<option value="'+type.id+'" data-l10n-id="'+type.l20n_prefix+'_title">'+type.id+'</option>');
            }
            document.l10n.localizeNode($('main#create-game select[name="id"]')[0]);
            
            $('main#create-game select[name="id"]').material_select();
            $('main#create-game select[name="id"]').closest('.input-field').children('.caret').remove();
        },
        'Index.update': function(data) {
            window.games = data;
            for( var i = 0; i < data.length; i++ ) {
                var game = data[i]; 
                
                var game_e = $('main#index [data-game-list] > [data-game-id="'+game.id+'"]');
                if( game_e.length == 0 ) {
                    game_e = $('[data-templates] [data-template="index-game"]').clone(true);
                    $('main#index [data-game-list]').prepend( game_e );
                    game_e.attr('data-game-id', game.id);
                    game_e.click(Index.joinGame);
                }
                    
                game_e.find('img').attr('src', '/game_types/'+game.type+'/'+Index.game_types[game.type].logo);
                game_e.find('.title').attr('data-l10n-id', Index.game_types[game.type].l20n_prefix+'_title');
                var player_list = '';
                for( var j = 0; j < game.players.length; j++ ) {
                    player_list += (game.players[j] ? game.players[j] : '-') + ' ';
                }
                game_e.find('p').text( player_list );
                switch(game.status) {
                    case 'lobby':
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
        $('main#create-game select[name="id"]').change(Index.createGameTypeChanged);
        $('[data-submit="Index.createGame"]').submit(Index.createGame);
    },
    init: function() {
        $('main#index [data-game-list] *').remove();
    },
    deinit: function() {}
};

var Lobby = {
    sit: function() {
        var i = $(this).closest('[data-lobby-player-i]').attr('data-lobby-player-i')|0;
        socket.emit('Lobby.sit', i );
        return false;
    },
    stand: function() { 
        socket.emit('Lobby.stand');
        return false;
    },
    startGame: function() { 
        socket.emit('Lobby.startGame');
        return false;
    },
    events: {
        'Lobby.setGameTypeInfo': function(game_type) {
            Lobby.game_type = game_type;
            $('main#lobby [data-bind="lobby-game-type"]')
                .attr('data-l10n-id', game_type.l20n_prefix+'_title')
                .each(function(){
                    document.l10n.localizeNode(this);
                });
        },
        'Lobby.setSettings': function(settings) {
            for( var i = 0; i < Lobby.game_type.settings.length; i++ ) {
                var setting = Lobby.game_type.settings[i];
                var name = Lobby.game_type.l20n_prefix+'_settings_'+setting.name;
                var value = settings[setting.name];;
                if( 'options' in setting ) {
                    $('main#lobby table[data-bind="lobby-settings"]').append('<tr><td data-l10n-id="' + name + '"></td><td data-l10n-id="' + name + '_' + value + '"></td></tr>');
                } else if( setting.value == 'int' ) {
                    $('main#lobby table[data-bind="lobby-settings"]').append('<tr><td data-l10n-id="' + name + '"></td><td>' + value + '</td></tr>');
                }
            }
            $('main#lobby table[data-bind="lobby-settings"]').each(function(){
                document.l10n.localizeNode(this);
            });
        },
        'Lobby.setIsOwner': function(value) {
            Lobby.isOwner = value;
        },
        'Lobby.setIsSeated': function(value) {
            $('main#lobby [data-action="Lobby.stand"]').toggleClass('disabled', !value );
            $('main#lobby .sit-here-btn').toggleClass('disabled', value );
        },
        'Lobby.update': function(game) {
            $('main#lobby [data-bind="lobby-player-count"]').text(game.players.length);
            var playerSlots = $('main#lobby [data-bind="lobby-player-list"] tbody tr');
            
            if( playerSlots.length == 0 ) {
                for( var i = 0; i < game.players.length; i++ )
                    $('main#lobby [data-bind="lobby-player-list"] tbody').append('<tr data-lobby-player-i="'+i+'"><td><span data-bind="lobby-player-name"></span></tr>');
                playerSlots = $('main#lobby [data-bind="lobby-player-list"] tbody tr');
                playerSlots.find('td').each( function(){ 
                    var e = $('[data-templates] [data-template="lobby-sit-here"]').clone(true);
                    e.click(Lobby.sit);
                    $(this).append(e);
                });
            }
            
            for( var i = 0; i < game.players.length; i++ ) {
                if( game.players[i] === null ) {
                    playerSlots.eq(i).find('.sit-here-btn').show();
                    playerSlots.eq(i).find('span[data-bind="lobby-player-name"]').text('');
                } else {
                    playerSlots.eq(i).find('.sit-here-btn').hide();
                    playerSlots.eq(i).find('span[data-bind="lobby-player-name"]').text(game.players[i]);
                }
            }
            
            if( Lobby.isOwner && game.players.indexOf(null) == -1 ) 
                $('main#lobby [data-action="Lobby.startGame"]').removeClass('disabled');
                Title.add('*');
                Audio.notify();
            else {
                $('main#lobby [data-action="Lobby.startGame"]').addClass('disabled');
                Title.clear('*');
            }
        }
    },
    init_global: function() {
        $('main#lobby [data-action="Lobby.startGame"]').click(Lobby.startGame);
        $('main#lobby [data-action="Lobby.stand"]').click(Lobby.stand);
    },
    init: function() {
        $('main#lobby [data-bind="lobby-settings"] tbody tr:not([data-permanent])').remove();
        $('main#lobby [data-bind="lobby-player-list"] tbody tr').remove();
    },
    deinit: function() {}
};

var Audio = {
    enabled: false,
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
    mobileEnableAudio: function() {
        Audio.switchState();
        Audio.notifyElement.play();
        Audio.notifyElement.pause();
        Audio.init_state(); 
    },
    init_state: function() {
        $('[data-no-autoplay]').removeAttr('data-no-autoplay');
        var stored = localStorage.getItem('the-game audio-enabled');
        if( stored == 'true' || stored === null )
            Audio.enabled = true;
        else
            Audio.enabled = false;
            
        Audio.updateIcon();
    },
    init: function() {
        if( !window.AUTOPLAY_ENABLED ) {
            function onAutoplayEnabled() {
                window.removeEventListener('autoplayenabled', onAutoplayEnabled, false);
                Audio.init_state();
                return false;
            }
            window.addEventListener('autoplayenabled', onAutoplayEnabled, false);
        } else
            Audio.init_state();
            
        $('[data-action="Audio.switchState"]').click(Audio.switchState);
        $('[data-action="Audio.mobileEnableAudio"]').click(Audio.mobileEnableAudio);
        $('body').append('<audio id="Audio-notify" hidden preload="auto"> <source src="sound/notify.mp3" type="audio/mpeg"> <source src="sound/notify.wav" type="audio/wav"> </audio>');
        Audio.notifyElement = $('#Audio-notify')[0];
    }
};

var Game = {
    rematch: function() {
        if( Room.get() == 'loading' )
            return;
        
        if( Game.rematch_id ) {
            Room.join(Game.rematch_id);
        } else {
            Room.set('loading');
            socket.emit('Game.rematch');
        }
    },
    events: {
        'Game.setTurn': function(name) {
            Title.clear('*');
            if( name === undefined ) {
                $('main#game .game-turn-info').remove();
                return;
            }
            var e = $('main#game .game-turn-info');
            if( e.length == 0 ) {
                e = $('[data-templates] [data-template="game-turn-info"]').clone(true);
                $('main#game').prepend(e);
            }
            e.find('.card-panel')
                .removeClass('teal')
                .addClass('red')
                .find('b')
                    .text(name);
        },
        'Game.yourTurn': function() {
            Title.add('*');
            Audio.notify();
            $('main#game .game-turn-info .card-panel')
                .removeClass('red')
                .addClass('teal');
        },
        'Game.ended': function() {
            Title.clear('*');
            var e = $('[data-templates] [data-template="postgame-rematch"]').clone(true);
            $('main#game').append(e);
            e.click(Game.rematch);
            Game.rematch_id = undefined;
            Toast.show({
                entity: 'game_ended',
                type: 'info'
            });
        },
        'Game.rematch': function(data) {
            Title.add('!');
            $('main#game .postgame-rematch-btn ').addClass('spinning-btn').addClass('light-blue');
            Game.rematch_id = data.id;
            if( 'who' in data )
                Toast.show({
                    message: document.l10n.getEntitySync('regame_proposed', data).value,
                    type: 'info',
                    notify: true
                });
        },
    },
    init: function(internal) {
        if( Room.currentHandler != Game )
            throw 'Shouldn\'t happen.';
            
        Game.internal = internal;
        
        Game.internal.init();
        addListeners(Game.internal.events);
        socket.emit('Game.init');
    },
    deinit: function() {
        if( Game.internal !== undefined ) {
            removeListeners(Game.internal.events);
            Game.internal.deinit();
        }
        Game.internal = undefined;
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
        $('main#disconnected').click( function() {window.location.reload() } );
    }
};


var socket;

function global_init() {
    socket = io();
    Toast.init();
    Audio.init();
    Room.init();     
    UI.init();
    Index.init_global();
    Lobby.init_global();
    Login.init();
    Title.init();
    Focus.init();
    $('body').removeAttr('data-loading');
    
    socket.on('disconnect', function() {
        socket.on('connect', function() {
            window.location.reload();
        });
        
        $('[data-loged="true"]').hide();
        $('[data-loged="false"]').hide();
        Room.clear();
        Room.set('disconnected');
        
        Toast.show( {
            entity: 'disconnected',
            type: 'warning'
        });
    });
    
    document.l10n.ready( function() {
        $('select').material_select();
        $('select').closest('.input-field').children('.caret').remove();
    });
    
}

$( function() {
    var done = false;
    document.l10n.ready( function() {
        if( !done )
            global_init();
        done = true;
    });
});
