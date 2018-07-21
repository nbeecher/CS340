var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_beechern',
  password        : '0900',
  database        : 'cs340_beechern',
  multipleStatements: true
});

module.exports.pool = pool;
