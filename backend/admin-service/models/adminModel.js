const sqlite3 = require('sqlite3').verbose();
const path = require('path');
let db = new sqlite3.Database(path.resolve(__dirname, '../../shared-db/database.sqlite'));

function setDatabase(database) {
  db = database;
}

function addEvent(event, callback) {
  const { name, date, tickets } = event;
  const sql = `INSERT INTO events (name, date, tickets) VALUES (?, ?, ?)`;
  db.run(sql, [name, date, tickets], function(err) {
    // Return all relevant values for test assertions
    callback(err, {
      id: this.lastID,
      name,
      date,
      tickets
    });
  });
}

module.exports = { addEvent, setDatabase };

