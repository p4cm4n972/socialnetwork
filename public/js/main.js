   (function (window, io){
    window.addEventListener('DOMContentLoaded', function () {
        console.log('JAVASCRIPT chargé !')
        var socket = io('http://127.0.0.1:3000');
        window.addEventListener("submit", function (e) {
            var userMessage = document.getElementById('userMessage').value;
            var username = document.getElementById('chatbox-username').innerHTML;
            console.log('SEND');
            e.preventDefault();
            socket.emit('chatMessage', {
                message: userMessage,
                username: username
            });
            document.getElementById('userMessage').value = "";
            return false;
        });
        socket.on('chatMessage', function (data) {
            var chatlist = document.getElementById('messages');
            var newMessage = document.createElement('li');
            chatlist.appendChild(newMessage);
            newMessage.innerHTML = '<br>'+data.username+':'+ data.message;
        });
    });
    })(window, io);