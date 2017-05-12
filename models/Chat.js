const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    content: String
});

chatSchema.pre('save', function save(next){
    const chat = this;
    next();
})
const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;