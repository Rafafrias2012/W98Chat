var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));

var buddies = [];

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

    socket.on('disconnect', function() {
        console.log('a user disconnected');
        var index = buddies.findIndex(function(buddy) {
            return buddy.id === socket.id;
        });
        if (index!== -1) {
            buddies.splice(index, 1);
            io.emit('buddy list', buddies);
        }
    });
});

server.listen(3000, function() {
    console.log('Server listening on port 3000');
});