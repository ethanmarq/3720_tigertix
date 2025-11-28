const request = require('supertest');
const path = require('path');
const fs = require('fs');
const db = require('../../../shared-db/db');

const express = require('express');
const originalApp = require('../../server');

const app = express();
app.use(express.json());
app.use('/', originalApp);

beforeEach((done) => {
    // Delete the users we are about to test with
    // Adjust 'test@example.com' to match whatever email your test uses
    db.run("DELETE FROM users WHERE email LIKE 'test%' OR email = 'duplicate@example.com'", done);
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

describe('User authentication API', () => {
  const base = '/auth';
  const email = 'test@example.com';
  const password = 'password123';

  test('registers a new user and sets token cookie', async () => {
    const res = await request(app)
      .post(`/register`)
      .send({ email, password });

    expect(res.statusCode).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(email);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('prevents duplicate registration', async () => {
    const email = 'duplicate-test@example.com';
    const password = 'password123';
    
    // 1. First registration (Should succeed)
    await request(app).post('/register').send({ email, password });
    
    // 2. Second registration (Should fail)
    const res = await request(app)
      .post('/register')
      .send({ email, password });
      
    expect(res.statusCode).toBe(409);
  });


  test('logs in with correct credentials', async () => {
    const email = 'login-test@example.com';
    const password = 'password123';
    
    // 1. Register first (Create the user)
    await request(app).post('/register').send({ email, password });
    
    // 2. Then Login
    const res = await request(app)
      .post('/login')
      .send({ email, password });
      
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(email);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('rejects login with wrong password', async () => {
    const res = await request(app)
      .post(`/login`)
      .send({ email, password: 'wrong' });

    expect(res.statusCode).toBe(401);
  });

  test('/me requires valid token (cookie)', async () => {
      const email = 'me-test@example.com';
      const password = 'password123';
      
      // 1. Register
      await request(app).post('/register').send({ email, password });

      // 2. Login to get the cookie
      const loginRes = await request(app)
          .post('/login')
          .send({ email, password });
          
      // Extract the cookie
      const cookie = loginRes.headers['set-cookie'];
      expect(cookie).toBeDefined();

      // 3. Use cookie to access /me
      const res = await request(app)
          .get('/me')
          .set('Cookie', cookie) // Set the cookie header
          .send();
          
      expect(res.statusCode).toBe(200);
      expect(res.body.user.email).toBe(email);
  });

  test('logout clears token cookie', async () => {
      const email = 'logout-test@example.com';
      const password = 'password123';

      // 1. Register
      await request(app).post('/register').send({ email, password });

      // 2. Login
      const loginRes = await request(app)
          .post('/login')
          .send({ email, password });
          
      const cookie = loginRes.headers['set-cookie'];

      // 3. Logout
      const res = await request(app)
          .post('/logout')
          .set('Cookie', cookie)
          .send();
          
      expect(res.statusCode).toBe(200);
  });

});
