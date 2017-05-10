       window.addEventListener('load', function () {
           console.log('JAVASCRIPT CHAT LIVE chargé !');
           var socket = io.connect();
           var writeMessage = function (name, text) {
               return ('<li class="media"><div class="media-body"><div class="media">' + '<div class="media-body"/>' + '<b>' + name + '</b> :' + text + '<hr/></div></div></div></li>');
           };

           function sendMessage() {
               var userMessage = document.getElementById('userMessage').value;
               var username = document.getElementById('chatbox-username').innerText;
               socket.emit('chatMessage', {
                   message: userMessage,
                   username: username
               });
               document.getElementById('userMessage').value = "";
               return false;
           };

           socket.on('chatMessage', function (data) {
               console.log(data.text);
               alert(data.text)
               
       });
       });