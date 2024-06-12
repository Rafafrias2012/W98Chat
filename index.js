var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));

var buddies = [];
var admins = [];

io.on('connection', function(socket) {
    console.log('a user connected');

    socket.on('set username', function(username) {
        socket.username = username;
        buddies.push({ id: socket.id, username: username });
        io.emit('buddy list', buddies);
    });

    socket.on('chat message', function(data) {
        console.log('message: ', data.message);
        io.emit('chat message', data);
    });

    socket.on('admin', function(password) {
        if (password === 'your_admin_password') {
            admins.push(socket.id);
            socket.emit('admin tag', true);
        } else {
            socket.emit('admin tag', false);
        }
    });

    socket.on('kick', function(username) {
        if (admins.includes(socket.id)) {
            var userToKick = buddies.find(function(buddy) {
                return buddy.username === username;
            });
            if (userToKick) {
                io.to(userToKick.id).emit('kick');
            }
        }
    });

    socket.on('disconnect', function() {
        console.log('a user disconnected');
        var index = buddies.findIndex(function(buddy) {
            return buddy.id === socket.id;
        });
        if (index !== -1) {
            buddies.splice(index, 1);
            io.emit('buddy list', buddies);
        }
        var adminIndex = admins.indexOf(socket.id);
        if (adminIndex !== -1) {
            admins.splice(adminIndex, 1);
        }
    });
});

server.listen(3000, function() {
    console.log('Server listening on port 3000');
});
