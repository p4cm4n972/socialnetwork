const User = require('../models/User');

exports.getArticle = function (req, res) {
    res.render('content/article', {
        title: 'Post'
    });
};

exports.postArticle = function (req, res) {
        req.assert('title', 'Title cannot be blank').notEmpty();
        req.assert('body', 'Message cannot be blank').notEmpty();

        const errors = req.validationErrors();

        const article = new Article({
            title: req.body.title,
            content: req.body.content,
            author: this.user
        });
        article.save(function (err) {
                if (err) {
                    req.flash('errors', {
                        msg: err.message
                    });
                    return res.redirect('content/article');
                }
                        req.flash('success', {
                            msg: 'Article has been added successfully!'
                        });
                        res.redirect('/');
            
                });
        };