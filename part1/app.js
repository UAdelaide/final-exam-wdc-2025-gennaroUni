var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');
const fs = require('fs/promises');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dogsRouter = require('./routes/dogs');
var walkersRouter = require('./routes/walkers');
var walkrequestsRouter = require('./routes/walkrequests');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

(async () => {
  try {
    // Read the full SQL file;
    const db = await fs.readFile('./dogwalks.sql', 'utf8');

    // Connect to MySQL without specifying a database;
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      multipleStatements: true // allows execution of multiple queries;
    });

    // Execute the whole dogwalks.sql file (it creates & uses the database itself);
    await connection.query(db);

    // add data using Q5 queries;
    await connection.query(`
        INSERT INTO Users (username, email, password_hash, role) VALUES
            ('alice123', 'alice@example.com', 'hashed123', 'owner'),
            ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
            ('carol123', 'carol@example.com', 'hashed789', 'owner'),
            ('bingo200', 'bingo@bingo.com', 'hashedcheese', 'walker'),
            ('oldmate', 'waiting@foramate.com', 'hashedmate', 'owner');

        INSERT INTO Dogs (owner_id, name, size) VALUES
            ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),
            ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'),
            ((SELECT user_id FROM Users WHERE username = 'oldmate'), 'Jeff', 'large'),
            ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Franky', 'small'),
            ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Charlie', 'small');

        INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
            ((SELECT dog_id FROM Dogs WHERE name = 'Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
            ((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),
            ((SELECT dog_id FROM Dogs WHERE name = 'Franky'), '2025-06-10 06:30:00', 45, 'Parade', 'completed'),
            ((SELECT dog_id FROM Dogs WHERE name = 'Charlie'), '2025-06-10 11:30:00', 45, 'Glenelg', 'open'),
            ((SELECT dog_id FROM Dogs WHERE name = 'Jeff'), '2025-06-10 11:30:00', 45, 'Glenelg', 'accepted');

        INSERT INTO WalkRatings (request_id, walker_id, owner_id, rating, comments)
        VALUES (
            (SELECT request_id FROM WalkRequests wr
                JOIN Dogs d ON wr.dog_id = d.dog_id
                WHERE d.name = 'Franky' AND wr.status = 'completed'),
            (SELECT user_id FROM Users WHERE username = 'bobwalker'),
            (SELECT owner_id FROM Dogs WHERE name = 'Franky'),
            5,
            'Great walk, very professional!'
        );
    `);

    console.log('Database created and initialized from dogwalks.sql file');

    await connection.end();
  } catch (err) {
    console.error('Error setting up database. Ensure Mysql is running: service mysql start', err);
  }
})();

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/dogs', dogsRouter);
app.use('/api/walkers', walkersRouter);
app.use('/api/walkrequests', walkrequestsRouter);

module.exports = app;
