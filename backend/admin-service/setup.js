const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../shared-db/database.sqlite');
const sqlScriptPath = path.resolve(__dirname, '../shared-db/init.sql');

const setupDatabase = () => {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database', err.message);
        } else {
            console.log('Connected to the SQLite database.');
            const sqlScript = fs.readFileSync(sqlScriptPath, 'utf8');
            db.exec(sqlScript, (err) => {
                if (err) {
                    console.error('Error executing SQL script', err.message);
                } else {
                    console.log('Database tables created or already exist.');
                }
            });
        }
    });
    return db;
};

module.exports = setupDatabase;
