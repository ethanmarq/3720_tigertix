const fs = require('fs');
const path = require('path');
const db = require('./db');

const initSqlPath = path.join(__dirname, 'init.sql');
const sql = fs.readFileSync(initSqlPath, 'utf8');

db.exec(sql, (err) => {
  if (err) {
    console.error('Error running init.sql:', err);
    process.exit(1);
  } else {
    console.log('Database initialized from init.sql');
    process.exit(0);
  }
});