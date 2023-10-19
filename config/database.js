var mysql = require('mysql');
var configuration = {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    dateStrings: 'date'
};
var con = mysql.createPool(configuration);
module.exports = con;