const User = require('../models/User');
const Chat = require('../models/Chat');


exports.getChat = function(req, res) {
    res.render('content/chat', {
        title: 'Chat'
    })
}