const mysql = require('mysql2/promise');

// Default XAMPP: user root, tanpa password
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'toko_maju_jaya',
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = db;