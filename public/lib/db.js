const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '111111',
    database: 'wallet'
});

module.exports =db;