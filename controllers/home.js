const User = require('../models/User');

exports.index = function (req, res) {
    User.find({}, {
        'email': 1,
        _id: 0
    }, function (err, exist) {
        if (exist) {
            var memberJsonList = JSON.stringify(exist);
            var memberArrayList = JSON.parse(memberJsonList);
            
            var memberName = memberArrayList;
            res.render('index', {
                title: 'proZe',
                memberName: memberName
            });
        }
    });
};