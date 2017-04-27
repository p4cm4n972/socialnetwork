const bluebird = require('bluebird');
const User = require('../models/User');
const Article = require('../models/Article');

exports.getArticle = function (req, res) {
    res.render('content/article', {
        title: 'Post'
    });
};

exports.postArticle = function (req, res, next) {
        req.assert('title', 'Title cannot be blank').notEmpty();
        req.assert('content', 'Content cannot be blank').notEmpty();

        const errors = req.validationErrors();

        if (errors) {
    req.flash('errors', errors);
    return res.redirect('article');
    console.log('error');
  };

        const article = new Article({
            title: req.body.title,
            content: req.body.content,
        });
        article.save([{title: req.body.title},{content: req.body.content}], function (err, integred){
        if(err) {
            return next(err);
        }
        article.save(function (err) {
            console.log('save');
                if (err) {
                    req.flash('errors', {
                        msg: err.message
                    });
                    return res.redirect('article');
                }
                        req.flash('success', {
                            msg: 'Article has been added successfully!'
                        });
                        res.redirect('/');
                });
        });
        };