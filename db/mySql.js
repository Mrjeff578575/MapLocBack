var mysql = require('mysql');
var dbConfig = require('./config')

function createConnection() {
    var connection = mysql.createConnection({
        host     : dbConfig.host,
        user     : dbConfig.user,
        password : dbConfig.password,
        database : dbConfig.database
      });
      return  connection;        
}
function selectUserById(connection, userId, cb) {
    var sql;
    if (userId == 'all') {
        sql = 'SELECT * FROM user_tbl';
    } else {
        sql = 'SELECT * FROM user_tbl WHERE userId = ?';
    }
    connection.connect();
    connection.query(sql, [userId], function(err, rows) {
        if (err) throw err;
        cb && cb(rows)
    });
}

function selectUserByName(connection, username, cb) {
    var sql = 'SELECT * FROM user_tbl WHERE name = ?';
    connection.connect();
    connection.query(sql, [username], function(err, rows) {
        if (err) throw err;
        cb && cb(rows)
    });
}

function insertUser(connection, user,  cb) {
    selectUserByName(connection, user.username, function(result) {
        if (result.length) {
            cb && cb({errMsg: 'The userName is already exists'}, result);
        } else {
            var sql = 'INSERT INTO user_tbl (name, password, sex, qq, phone, birthday) VALUES (?, ?, ?, ?, ?, ?)';
            var {username, password, sex, qq, phone, birthday} = user
            connection.query(sql, [username, password, sex, qq, phone, birthday], function(err, rows, fields) {
                if (err) throw err;
                cb && cb(null, rows);
            });
        }
    })
}
function selectFriend(connection, payload, cb) {
    var sql = 'SELECT * FROM friend_tbl WHERE userId = ? AND friendId = ?';
    connection.query(sql, [payload.userId, payload.friendId], function(err, rows, fields) {
        if (err) throw err;
        cb && cb(rows)

    })
}

function insertFriend(connection, payload, cb) {
    if (payload.userId > payload.friendId) {
        var temp = payload.friendId;
        payload.friendId = payload.userId;
        payload.userId = temp;
    }
    selectFriend(connection, payload, function(result) {
        if (result.length) {
            cb && cb({errMsg: `userId: ${payload.userId} and friendId: ${payload.friendId} is already friends`}, result);
        } else {
            var insertSql = 'INSERT INTO friend_tbl (userId, friendId) VALUES (?, ?)';
            connection.query(insertSql, [payload.userId, payload.friendId], function(err, rows, fields) {
                if (err) throw err;
                cb && cb(null, rows);
            })
        }
    })
}

function deleteFriend(connection, payload, cb) {
    if (payload.userId > payload.friendId) {
        var temp = payload.friendId;
        payload.friendId = payload.userId;
        payload.userId = temp;
    }
    selectFriend(connection, payload, function(result) {
        if (result.length) {
            var deleteSql = 'DELETE FROM friend_tbl WHERE userId = ? AND friendId = ?';
            connection.query(deleteSql, [payload.userId, payload.friendId], function(err, rows, fields) {
                if (err) throw err;
                cb && cb(null, rows);
            })
        } else {
            cb && cb({errMsg: `userId: ${payload.userId} and friendId: ${payload.friendId} is not friends`}, result);
        }
    })
}

function selectFriendById(connection, userId, cb) {
    var sql = 'SELECT * FROM friend_tbl WHERE userId = ? OR friendId = ?';
    connection.query(sql, [userId, userId], function(err, rows, fields) {
        if (err) throw err;
        cb && cb(rows);
    })
}

exports.connect = createConnection;
exports.insertUser = insertUser;
exports.selectUserById = selectUserById;
exports.selectUserByName = selectUserByName;
exports.selectFriendById = selectFriendById;
exports.insertFriend = insertFriend;
exports.deleteFriend = deleteFriend;
// connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
//   if (err) throw err;
//   console.log('The solution is: ', rows[0].solution);
// });

// $sql = "CREATE TABLE user_tbl( \
// userId INT NOT NULL AUTO_INCREMENT, \
// name VARCHAR(100) NOT NULL, \
// password VARCHAR(100) NOT NULL,\
// sex int(2) NOT NULL, \
// qq VARCHAR(40),\
// phone VARCHAR(40),\
// birthday VARCHAR(40), \
// PRIMARY KEY ( userId ))ENGINE=InnoDB DEFAULT CHARSET=utf8"