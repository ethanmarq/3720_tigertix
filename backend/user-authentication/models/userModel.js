const bcrypt = require('bcryptjs');
const db = require('../../shared-db/db');

function runAsync(sql, params) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function getAsync(sql, params) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

async function createUser(email, password) {
  const hashed = await bcrypt.hash(password, 10);
  const result = await runAsync(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    [email, hashed]
  );
  return { id: result.id, email };
}

async function findUserByEmail(email) {
  const row = await getAsync('SELECT * FROM users WHERE email = ?', [email]);
  return row;
}

module.exports = { createUser, findUserByEmail };
