const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// GET all dogs owned by users;
router.get('/my-dogs', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  const { user_id } = req.session.user; // get id from session;
  try {
    const [result] = await db.query(`
      SELECT d.dog_id, d.name FROM Dogs d
      WHERE owner_id = ?
    `, [user_id]);

    console.log(result);
    res.json(result);

  } catch (error) {
    res.status(500).json({ error: 'Request Failed' });
  }
});


// GET session information;
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// POST login;
router.post('/login', async (req, res) => {
  // chnaged to username to align with login form;
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(`
      SELECT user_id, email, role FROM Users
      WHERE username = ? AND password_hash = ?
    `, [username, password]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // store user information in session;
    req.session.user = rows[0];
    console.log('Login Successful'); // log for validation;

    // if statement determines which dashboard redirect to return;
    if (req.session.user.role === 'owner') {
      return res.json({ redirect: '/api/users/owner-dashboard' });
    }

    return res.json({ redirect: '/api/users/walker-dashboard' });

  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET for owner dahsboard;
router.get('/owner-dashboard', (req, res) => {
  // checks is session exists and user is indeed an owner;
  if (!req.session.user || req.session.user.role !== 'owner') {
    return res.status(403).send('Forbidden');
  }

  res.sendFile(path.join(__dirname, '..', 'public', 'owner-dashboard.html'));
});

router.get('/walker-dashboard', (req, res) => {
  // checks is session exists and user is indeed a walker;
  if (!req.session.user || req.session.user.role !== 'walker') {
    return res.status(403).send('Forbidden');
  }

  res.sendFile(path.join(__dirname, '..', 'public', 'walker-dashboard.html'));
});

// Logout route;
router.get('/logout', (req, res) => {
  // end session;
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }

    // Clear the session cookie
    res.clearCookie('connect.sid'); // default cookie name;
    return res.json({ redirect: '/' }); // return root url (index.html);
  });
});

module.exports = router;