'use strict';
var server = require('./app');



module.exports = function (server) {
var io = require('socket.io').listen(server);
    io.on('connection', function (socket) {
        console.log('user connected')
        socket.on('chatMessage', function (data) {
            console.log('CHAT');
            io.emit('chatMessage', data);
        });
        socket.on('disconnect', function() {
            console.log('user disconnected')
        });
    });
};