const test = require('node:test');
const assert = require('node:assert/strict');

const { createServer } = require('../srv/blackroad-api/server_full.js');
const { getAuthCookie } = require('./helpers/auth.js');

async function withServer(options, callback) {
  const { server } = createServer(options);
  await new Promise((resolve) => server.listen(0, resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}
process.env.JWT_SECRET = 'test-secret';
const { app } = require('../backend/server');

async function getToken(port) {
  const loginRes = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'root', password: 'Codex2025' })
  });
  assert.equal(loginRes.status, 200);
  assert.match(loginRes.headers.get('content-type'), /^application\/json/);

  const loginJson = await loginRes.json();
  assert.ok(loginJson.token, 'expected login token');
  return loginJson.token;
}

test('rejects malformed json and missing fields', async () => {
  const server = app.listen(0);
  const port = getPort(server);
  try {
    const token = await getToken(port);
  try {
    await callback({ baseUrl });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('rejects malformed json payloads', async () => {
  await withServer({ sessionSecret: 'validation-secret' }, async ({ baseUrl }) => {
    const cookie = await getAuthCookie(baseUrl);

    const response = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie.join('; '),
      },
      body: '{"title": "missing brace"',
    });
    assert.equal(badRes.status, 400);
    assert.match(badRes.headers.get('content-type'), /^application\/json/);
    const badJson = await badRes.json();
    assert.equal(badJson.error, 'invalid json');

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error, 'invalid json');
  });
});

test('requires a non-empty title field', async () => {
  await withServer({ sessionSecret: 'validation-secret' }, async ({ baseUrl }) => {
    const cookie = await getAuthCookie(baseUrl);

    const response = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie.join('; '),
      },
      body: JSON.stringify({ title: '' }),
    });
    assert.equal(missRes.status, 400);
    assert.match(missRes.headers.get('content-type'), /^application\/json/);
    const missJson = await missRes.json();
    assert.equal(missJson.error, 'invalid task');
  } finally {
    await closeServer(server);
  }
});

test('returns json for not found routes', async () => {
  const server = app.listen(0);
  const port = getPort(server);
  try {
    const res = await fetch(`http://127.0.0.1:${port}/nope`);
    assert.equal(res.status, 404);
    assert.match(res.headers.get('content-type'), /^application\/json/);
    const body = await res.json();
    assert.equal(body.error, 'not found');
  } finally {
    await closeServer(server);
  }
process.env.NODE_ENV = 'test';
process.env.USE_SQLITE_MOCK = '1';
process.env.JWT_SECRET = 'test-secret';
jest.mock('better-sqlite3', () => require('./mocks/better-sqlite3.js'));
const request = require('supertest');
const { app } = require('../backend/server');

describe('Backend validation', () => {
  it('rejects malformed json and missing fields', async () => {
    const agent = request(app);

    const loginRes = await agent
      .post('/api/auth/login')
      .send({ username: 'root', password: 'Codex2025' });

    expect(loginRes.status).toBe(200);
    const token = loginRes.body.token;
    expect(token).toBeDefined();

    const badRes = await agent
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send('{"title": "bad"');
    expect(badRes.status).toBe(400);

    const missingRes = await agent
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(missingRes.status).toBe(400);
  });

  it('returns json for not found routes', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.body.error).toBe('not found');
  });
});


    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error, 'invalid task');
  });
});

test('returns json for unknown routes', async () => {
  await withServer({ sessionSecret: 'validation-secret' }, async ({ baseUrl }) => {
    const response = await fetch(`${baseUrl}/nope`);

    assert.equal(response.status, 404);
    assert.equal(response.headers.get('content-type'), 'application/json; charset=utf-8');
    const body = await response.json();
    assert.equal(body.error, 'not found');
  });
});
describe('backend validation', () => {
  it('rejects malformed json and missing fields', async () => {
    const server = app.listen(0);
    const port = getPort(server);
    try {
      const loginRes = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'root', password: 'Codex2025' }),
      });
      const loginJson = await loginRes.json();
      const token = loginJson.token;

      const badRes = await fetch(`http://127.0.0.1:${port}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: '{"title": "bad"',
      });
      expect(badRes.status).toBe(400);

      const missRes = await fetch(`http://127.0.0.1:${port}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      expect(missRes.status).toBe(400);
    } finally {
      server.close();
    }
  });

  it('returns json for not found routes', async () => {
    const server = app.listen(0);
    const port = getPort(server);
    try {
      const res = await fetch(`http://127.0.0.1:${port}/nope`);
      expect(res.status).toBe(404);
      const contentType = res.headers.get('content-type') || '';
      expect(contentType.includes('application/json')).toBe(true);
      const body = await res.json();
      expect(body.error).toBe('not found');
    } finally {
      server.close();
    }
  });
});
