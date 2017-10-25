var utils = require('../config/utils');

module.exports = function(req, res, next) {
    var token = req.headers['token'];
    var uid = req.headers['uid'];
    if (utils.checkToken(token, uid)) {
        next()
    } else {
        return res.json({
            status: 401,
            data: {
                errMsg: 'auth failed'
            }
        })
    }
}