var express = require('express');
var router = express.Router();
const db = require('../models/db');

/* /api/dogs . */
router.get('/', async function(req, res, next) {
  try {
    const query = `
        SELECT d.name AS dog_name, d.size, u.username AS owner_username FROM Dogs d
        JOIN Users u ON d.owner_id = u.user_id;
      `;
    const [result] = await db.query(query);
    console.log(result);
    res.json(result);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Error fetching listings');
  }
});

module.exports = router;