    window.addEventListener('DOMContentLoaded', function () {
        console.log('JAVASCRIPT chargé !')
        var writeMessage = function (name, text) {
            return ('<li class="media"><div class="media-body"><div class="media">' + '<div class="media-body"/>' + '<b>' + name + '</b> :' + text + '<hr/></div></div></div></li>');
        };
        window.addEventListener("submit", function (e) {
            var userMessage = document.getElementById('userMessage').value;
            var username = document.getElementById('chatbox-username').innerText;
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
            console.log(data.text);
            alert('receive');
        });
    });