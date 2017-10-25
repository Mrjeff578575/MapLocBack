var jwt = require('jwt-simple');
var moment = require('moment')

var secretStr = 'expressExpress'
var utils = {
    generateToken: function(userId) {
        var expires = moment().add('days', 7).valueOf();
        var token = jwt.encode({
          userId: userId,
          exp: expires,
          created: moment().valueOf()
        }, secretStr);
        return token;
    },
    checkToken: function(token, uid) {
        var decodeToken = jwt.decode(token, secretStr);
        console.log(decodeToken)
        if(!decodeToken) return false;
        var isExpire = moment().valueOf() - decodeToken.created > decodeToken.exp ? true : false;
        if (isExpire || decodeToken.userId == uid) return true;
        return false;
    }
}
module.exports = utils;