console.log('JAVASCRIPT CHAT LIVE chargé !');
var username = document.getElementById('chatbox-username').value;
    console.log(username);

var writeMessage = function(name, text){
    console.log('WRITE');
    return ('<li class="media"><div class="media-body"><div class="media">' + '<div class="media-body"/>' + '<b>' + name + '</b> :' + text + '<hr/></div></div></div></li>');
};

var sendMessage = function () {
    console.log('send');
    var userMessage = document.getElementById('userMessage').value;
    console.log(userMessage);
    console.log(username);
    socket.emit('chatMessage', {message: userMessage, username: username});
    document.getElementById('userMessage').value = "";
};

socket.on('chatMessage', function(data) {
    document.getElementById('chatbox-listMessages').append(writeMessage(data.username, data.message))
});