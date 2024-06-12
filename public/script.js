$(document).ready(function() {
    var socket = io();
    var username = '';
    var blockedUsers = [];
    var isAdmin = false;

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    $('.loading-screen').show();

    $('#set-username').click(function() {
        username = $('#username').val();
        socket.emit('set username', username);
        $('#username').val('');
    });

    $('#chat-form').submit(function() {
        var message = $('#chat-input').val();
        socket.emit('chat message', { message: message, username: username });
        $('#chat-input').val('');
        return false;
    });

    socket.on('chat message', function(data) {
        var userColor = getRandomColor();
        var messageDisplay = data.username + ': ' + data.message;
        if (blockedUsers.indexOf(data.username) === -1) {
            $('#chat-log').append($('<li>').text(messageDisplay).css('color', userColor));
        }
    });

    socket.on('buddy list', function(buddies) {
        $('#buddy-list').empty();
        $.each(buddies, function(index, buddy) {
            var buddyDisplay = $('<li>').text(buddy.username).css('color', getRandomColor());
            $('#buddy-list').append(buddyDisplay);
        });
    });

    socket.on('buddy online', function(buddy) {
        var buddyDisplay = $('<li>').text(buddy.username).css('color', getRandomColor());
        $('#buddy-list').append(buddyDisplay);
    });

    socket.on('buddy offline', function(buddy) {
        $('#buddy-list li:contains(' + buddy.username + ')').remove();
    });

    // Handle /clear command
    $('#chat-input').on('keypress', function(e) {
        if (e.which === 13) {
            var message = $('#chat-input').val();
            if (message.startsWith('/clear')) {
                $('#chat-log').empty();
                $('#chat-input').val('');
                return false;
            }
        }
    });

    // Handle /block and /unblock commands
    $('#chat-input').on('keypress', function(e) {
        if (e.which === 13) {
            var message = $('#chat-input').val();
            var command = message.split(' ')[0];
            var user = message.split(' ')[1];
            if (command === '/block') {
                blockedUsers.push(user);
                $('#chat-input').val('');
                return false;
            } else if (command === '/unblock') {
                var index = blockedUsers.indexOf(user);
                if (index !== -1) {
                    blockedUsers.splice(index, 1);
                }
                $('#chat-input').val('');
                return false;

            }
        }
    });

    $('#chat-input').on('keypress', function(e) {
        if (e.which === 13) {
            var message = $('#chat-input').val();
            if (message.startsWith('/admin')) {
                var password = message.split(' ')[1];
                socket.emit('admin', password);
                $('#chat-input').val('');
                return false;
            } else if (message.startsWith('/kick')) {
                if (isAdmin) {
                    var usernameToKick = message.split(' ')[1];
                    socket.emit('kick', usernameToKick);
                    $('#chat-input').val('');
                    return false;
                } else {
                    alert('You are not an admin!');
                }
            }
        }
    });

    socket.on('admin tag', function(isAdmin) {
        if (isAdmin) {
            $('#username').after('<span style="color: green;">(Admin)</span>');
            isAdmin = true;
        } else {
            $('#username').next('span').remove();
            isAdmin = false;
        }
    });

    socket.on('kick', function() {
        alert('You have been kicked from the chat!');
        socket.disconnect();
    });

    socket.on('connect', function() {
        // hide loading screen
        $('.loading-screen').hide();
    });

});
