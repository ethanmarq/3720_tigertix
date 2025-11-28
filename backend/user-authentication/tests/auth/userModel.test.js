const path = require('path');
const fs = require('fs');
const db = require('../../../backend/shared-db/db');
const { createUser, findUserByEmail } = require('../../models/userModel');

beforeAll((done) => {
  const initSql = fs.readFileSync(
    path.join(__dirname, '../../../shared-db/init.sql'),
    'utf8'
  );
  db.exec(initSql, done);
});

afterAll((done) => {
  db.close(done);
});

describe('User model and database', () => {
  const email = 'modeltest@example.com';
  const password = 'secret123';

  test('createUser inserts user and hashes password', async () => {
    const user = await createUser(email, password);
    expect(user.id).toBeDefined();
    expect(user.email).toBe(email);

    const row = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });

    expect(row).toBeDefined();
    expect(row.password_hash).not.toBe(password);
  });

  test('findUserByEmail returns existing user', async () => {
    const user = await findUserByEmail(email);
    expect(user).toBeDefined();
    expect(user.email).toBe(email);
  });

  test('enforces unique email (simulated concurrency)', async () => {
    const dupEmail = 'duplicate@example.com';

    await createUser(dupEmail, password);

    let error = null;
    try {
      await createUser(dupEmail, password);
    } catch (err) {
      error = err;
    }

    expect(error).not.toBeNull();
    expect(error.code).toBe('SQLITE_CONSTRAINT');
  });
});
