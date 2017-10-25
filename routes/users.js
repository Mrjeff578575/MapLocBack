var express = require('express');
var router = express.Router();
var dbHandler = require('../db/mySql');
var msgConfig = require('../config/msgConfig');
var utils = require('../config/utils')
var _ = require('lodash');
var authToken = require('../middleware/authToken');

//register
router.post('/signup', function(req, res, next) {
    var params = req.body;
    if (!params || !params.username || !params.password || !params.sex) {
        return res.json({
            status: 400,
            data: {
                errMsg: 'please input enough params'
            }
        });
    }
    var connection = dbHandler.connect();
    dbHandler.insertUser(connection, params, function(err, result) {
        if (!err) {
            return res.json({
                status: 200,
                data: null
            });
        } else {
            return res.json({
                status: 400,
                data: {
                    errMsg: err.errMsg
                }
            });
        }
    })
});
//login
router.post('/signin', function(req, res, next) {
    var params = req.body;
    if (!params || !params.username || !params.password) {
        return res.json(msgConfig.signErrorMsg);
    }
    var connection = dbHandler.connect();
    dbHandler.selectUserByName(connection, params.username, function(result) {
        if (result.length) {
            if (_.result(result, '0.password') == params.password) {
                //need to generate token
                var userId = _.result(result, '0.userId');
                var token = utils.generateToken(userId);
                return res.json({
                    status: 200,
                    data: {
                        token: token,
                        userId: userId
                    }
                });
            } else {
                return res.json(msgConfig.signErrorMsg);
            }

        } else {
            return res.json(msgConfig.signErrorMsg);
        }
    })
});

router.get('/:id', function(req, res, next) {
    var userId = req.params.id;
    var connection =  dbHandler.connect();
    dbHandler.selectUserById(connection, userId, function(result) {
        res.json({
            status: 200,   
            data: {
                userList: result
            }
        })
    })
})

router.put('/:id', function() {

});

router.delete('/:id', function() {

});

router.post('/addFriend', [authToken], function(req, res, next) {
    var userId = req.body.fromId;
    var friendId = req.body.toId;
    var connection = dbHandler.connect();
    dbHandler.insertFriend(connection, {userId, friendId}, function(err, result) {
        if (!err) {
            return res.json({
                status: 200,
                data: null
            });
        } else {
            return res.json({
                status: 400,
                data: {
                    errMsg: err.errMsg
                }
            });
        }
    });
});

router.post('/unAddFriend', function(req, res, next) {
    var userId = req.body.fromId;
    var friendId = req.body.toId;
    var connection = dbHandler.connect();
    dbHandler.deleteFriend(connection, {userId, friendId}, function(err, result) {
        if (!err) {
            return res.json({
                status: 200,
                data: null
            });
        } else {
            return res.json({
                status: 400,
                data: {
                    errMsg: err.errMsg
                }
            });
        }
    });
});

router.get('/friends/:id', [authToken], function(req, res, next) {
    var userId = req.params.id;
    var connection = dbHandler.connect();
    dbHandler.selectFriendById(connection, userId, function(result) {
        return res.json({
                status: 200,   
                data: {
                    friends: result
                }
            });
    })
})




module.exports = router;
