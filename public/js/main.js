window.onload = function () {
console.log('JAVASCRIPT chargé !');
var username = document.getElementById('chatbox-username').value();
var userMessage = function(name, text){
    return ('<li class="media"><div class="media-body"><div class="media">' + '<div class="media-body"/>' + '<b>' + name + '</b> :' + text + '<hr/></div></div></div></li>');
};

var sendMessage = function () {
    console.log('send');
    var userMessage = ('#userMessage').value();
    socket.emit('chatMessage', {message: userMessage, username: username});
    ('#userMessage').value("");
};

socket.on('chatMessage', function(data) {
    document.getElementById('chatbox-listMessages').append(userMessage(data.username, data.message))
})
};