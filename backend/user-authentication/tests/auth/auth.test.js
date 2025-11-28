const request = require('supertest');
const path = require('path');
const fs = require('fs');
const db = require('../../../shared-db/db');

const express = require('express');
const originalApp = require('../../server');

const app = express();
app.use(express.json());
app.use('/', originalApp);

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

  test('prevents duplicate registration for same email', async () => {
    const res = await request(app)
      .post(`${base}/register`)
      .send({ email, password });

    expect(res.statusCode).toBe(409);
  });

  test('logs in with correct credentials', async () => {
    const res = await request(app)
      .post(`/login`)
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

  test('/auth/me requires valid token (cookie)', async () => {
    const loginRes = await request(app)
      .post(`/login`)
      .send({ email, password });

    const cookie = loginRes.headers['set-cookie'];

    const meRes = await request(app)
      .get(`/me`)
      .set('Cookie', cookie);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.user.email).toBe(email);
  });

  test('logout clears token cookie', async () => {
    const loginRes = await request(app)
      .post(`/login`)
      .send({ email, password });

    const cookie = loginRes.headers['set-cookie'];

    const logoutRes = await request(app)
      .post(`/logout`)
      .set('Cookie', cookie);

    expect(logoutRes.statusCode).toBe(200);
  });
});
