const path = require('path');
const fs = require('fs');
const db = require('../../../shared-db/db');
const { createUser, findUserByEmail } = require('../../models/userModel');


beforeEach((done) => {
  // Clean up the specific test users to ensure a fresh start
  db.run("DELETE FROM users WHERE email IN ('modeltest@example.com', 'duplicate@example.com')", done);
});

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
    const newUser = await createUser(email, password); 
    const user = await findUserByEmail(email);
    expect(user).toBeDefined();
    expect(user.email).toBe(email);
  });


  test('enforces unique email', async () => {
    await createUser('unique@example.com', 'hash');
    try {
        await createUser('unique@example.com', 'hash'); // Should fail
    } catch (error) {
        expect(error).not.toBeNull();
        expect(error.code).toBe('SQLITE_CONSTRAINT');
    }
  });

});
