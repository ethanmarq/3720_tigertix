const express = require('express');
const router = express.Router();
const { createEvent } = require('../controllers/adminController');

router.post('/admin/clear-events', (req, res) => {
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');
  const dbPath = path.resolve(__dirname, '../../shared-db/database.sqlite');
  const db = new sqlite3.Database(dbPath);
  db.run('DELETE FROM events', function(err) {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// This should come AFTER the clear-events route
router.post('/admin/events', createEvent);

module.exports = router;

