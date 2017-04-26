const User = require('../models/User');

exports.getArticle = (req, res) => {
  res.render('content/article', {
    title: 'Post'
  });
};