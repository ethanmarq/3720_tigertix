const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../../shared-db/database.sqlite');

const getAllEvents = (callback) => {
	const db = new sqlite3.Database(dbPath);
	db.all("SELECT * FROM events", [], (err, rows) => {
		callback(err, rows);

		db.close();
	});
};

const purchaseTicket = (eventId, callback) => {
    const db = new sqlite3.Database(dbPath);

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const selectSql = `SELECT tickets FROM events WHERE id = ?`;
        db.get(selectSql, [eventId], (err, row) => {
            if (err) {
                db.run('ROLLBACK');
                return callback(err);
            }
            if (!row) {
                db.run('ROLLBACK');
                return callback(new Error('Event not found'));
            }
            if (row.tickets <= 0) {
                db.run('ROLLBACK');
                return callback(new Error('No tickets available'));
            }

            const updateSql = `UPDATE events SET tickets = tickets - 1 WHERE id = ?`;
            db.run(updateSql, [eventId], function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    return callback(err);
                }
                db.run('COMMIT', (err) => {
									callback(err, { remaining: row.tickets - 1 });
									db.close();
								});
            });
        });
    });

};


module.exports = { getAllEvents, purchaseTicket };
