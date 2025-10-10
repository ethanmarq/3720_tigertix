const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../../shared-db/database.sqlite');

const addEvent = (event, callback) => {
    const db = new sqlite3.Database(dbPath);
    const { name, date, tickets } = event;
    const sql = `INSERT INTO events (name, date, tickets) VALUES (?, ?, ?)`;
    db.run(sql, [name, date, tickets], function(err) {
        callback(err, { id: this.lastID });
    });
    db.close();
};

module.exports = { addEvent };
