var express = require('express');
var router = express.Router();
const db = require('../models/db');

/* /api/dogs . */
router.get('/summary', async function(req, res, next) {
  try {
    const query = `
        SELECT
            u.username AS walker_username,
            COUNT(r.rating_id) AS total_ratings,
            ROUND(AVG(r.rating), 1) as average_rating,
            SUM(CASE WHEN wr.status = 'completed' THEN 1 END) AS completed_walks
        FROM Users u
        LEFT JOIN WalkRatings r ON u.user_id = r.walker_id
        LEFT JOIN WalkRequests wr ON r.request_id = wr.request_id
        WHERE u.role = 'walker'
        GROUP BY u.user_id
        ORDER BY u.username;
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