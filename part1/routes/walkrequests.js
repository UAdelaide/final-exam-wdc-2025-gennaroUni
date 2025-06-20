var express = require('express');
var router = express.Router();
const db = require('../models/db');

/* /api/dogs . */
router.get('/open', async function(req, res, next) {
  try {
    const query = `
        SELECT
            wr.request_id,
            d.name AS dog_name,
            wr.requested_time,
            wr.duration_minutes,
            wr.location,
            u.username AS owner_username
        FROM WalkRequests wr
        JOIN Dogs d ON wr.dog_id = d.dog_id
        JOIN Users u ON d.owner_id = u.user_id
        WHERE wr.status = 'open'
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