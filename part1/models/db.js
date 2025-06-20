// models/db.js
const mysql = require('mysql2/promise');

// Create a pooled connection to handle concurrent queries efficiently
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'DogWalkService',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;