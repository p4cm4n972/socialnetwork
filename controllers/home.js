const User = require('../models/User');
var t =[];
exports.index = function (req, res) {
    User.find({}, {
        'email': 1,
        _id: 0
    }, function (err, exist) {
        if (exist) {
            console.log(exist);
            var memberJsonList = JSON.stringify(exist);
            var memberArrayList = JSON.parse(memberJsonList);
            
            var memberName = memberArrayList;
            console.log(typeof(memberName));
            res.render('index', {
                title: 'proZe',
                memberName: memberName
            });
        }
    });
};