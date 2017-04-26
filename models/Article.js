const mongoose = require('mongoose');

const articleShema = new mongoose.Shema({
    author: this.user,
    content: String,
    title: String,
    picture: String
});

const Article = mongoose.model('Article', articleShema);

module.exports = Article;