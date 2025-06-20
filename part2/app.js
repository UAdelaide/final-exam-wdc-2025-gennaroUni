const express = require('express');
const path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));
// session setup;
app.use(cookieParser());
app.use(session({
    secret: 'string of choice',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
   }));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;