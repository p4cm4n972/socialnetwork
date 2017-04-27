const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    content: String,
    title: String,
});

articleSchema.pre('save', function save(next){
    const article = this;
    next();
})
const Article = mongoose.model('Article', articleSchema);

module.exports = Article;