'use strict'

var socketIO = require('socket.io');

module.exports = function (server) {
    var io = socketIO(server);
    io.on('connection', function (socket) {
        console.log('user connected')
        socket.on('chatMessage', function (data) {
            io.emit('chatMessage', data);
        });
        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
    })
}