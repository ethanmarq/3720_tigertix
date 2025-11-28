const sqlite3 = require('sqlite3');
const path = require('path');

// In CommonJS, __dirname is available globally, so we don't need the fileURLToPath workaround
const dbPath = path.resolve(__dirname, '../../shared-db/database.sqlite');

const getDb = () => new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Error opening database', err.message);
});

const getEvents = () => {
    const db = getDb();
    return new Promise((resolve, reject) => {
        db.all("SELECT id, name, tickets FROM events WHERE tickets > 0", [], (err, rows) => {
            db.close();
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

const findEventByName = (name) => {
    const db = getDb();
    return new Promise((resolve, reject) => {
        db.get("SELECT id, name, tickets FROM events WHERE name LIKE ?", [`%${name}%`], (err, row) => {
            db.close();
            if (err) return reject(err);
            resolve(row);
        });
    });
};

const bookTickets = (eventId, quantity) => {
    const db = getDb();
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            const selectSql = `SELECT tickets FROM events WHERE id = ?`;
            db.get(selectSql, [eventId], (err, row) => {
                if (err) {
                    db.run('ROLLBACK');
                    db.close();
                    return reject(err);
                }
                if (!row) {
                    db.run('ROLLBACK');
                    db.close();
                    return reject(new Error('Event not found'));
                }
                if (row.tickets < quantity) {
                    db.run('ROLLBACK');
                    db.close();
                    return reject(new Error('Not enough tickets available'));
                }

                const updateSql = `UPDATE events SET tickets = tickets - ? WHERE id = ?`;
                db.run(updateSql, [quantity, eventId], function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        db.close();
                        return reject(err);
                    }
                    db.run('COMMIT', (err) => {
                        db.close();
                        if (err) return reject(err);
                        resolve({ remaining: row.tickets - quantity });
                    });
                });
            });
        });
    });
};

module.exports = { getEvents, findEventByName, bookTickets };
