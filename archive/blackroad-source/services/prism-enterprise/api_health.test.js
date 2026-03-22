// <!-- FILE: tests/api_health.test.js -->
/* eslint-env node, jest */
const process = require('node:process');
const { describe, it, expect } = require('@jest/globals');
process.env.SESSION_SECRET = 'test-secret';
process.env.INTERNAL_TOKEN = 'x';
process.env.ALLOW_ORIGINS = 'https://example.com';
process.env.MINT_PK = '0x' + '1'.repeat(64);
process.env.CLAIMREG_ADDR = '0x' + '2'.repeat(40);
process.env.BR_TEST_DISABLE_DB = '1';
process.env.MINT_PK = '0x' + '11'.repeat(32);
const request = require('supertest');
const { app, server, loginLimiter } = require('../srv/blackroad-api/server_full.js');
const { app, server } = require('../srv/blackroad-api/server_full.js');
// Login helper reused across tests to obtain authenticated cookies.
// Helper to obtain an auth cookie for requests requiring authentication
const { getAuthCookie } = require('./helpers/auth');

describe('API security and health', () => {
  afterAll((done) => {
    loginLimiter.resetKey('::ffff:127.0.0.1');
    loginLimiter.resetKey('127.0.0.1');
    server.close(done);
process.env.MINT_PK =
  '0x1111111111111111111111111111111111111111111111111111111111111111';
process.env.CLAIMREG_ADDR = '0x2222222222222222222222222222222222222222';
process.env.ETH_RPC_URL = 'http://127.0.0.1:8545';
const request = require('supertest');
const { app, shutdown } = require('../srv/blackroad-api/server_full.js');

describe('API security and health', () => {
  afterAll((done) => {
    shutdown(done);
  });

  it('responds to /health', async () => {
    const res = await request(app).get('/health');
process.env.ETH_RPC_URL = 'http://127.0.0.1:8545';
process.env.MATH_ENGINE_URL = '';

const fs = require('node:fs');
const path = require('node:path');
const request = require('supertest');

// eslint-disable-next-line no-undef
const originKeyPath = path.join(__dirname, 'origin.key');
fs.writeFileSync(originKeyPath, 'test-origin-key');
process.env.ORIGIN_KEY_PATH = originKeyPath;

const originHeaders = {
  'X-BlackRoad-Key': 'test-origin-key',
};

const { app, server } = require('../srv/blackroad-api/server_full.js');

describe('API security and health', () => {
  afterAll((done) => {
    server.close(() => {
      fs.rm(originKeyPath, { force: true }, () => done());
    });
  });

  it('responds to /health', async () => {
    const res = await request(app).get('/health').set(originHeaders);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('returns security headers on /api/health', async () => {
  it('responds to /healthz', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('responds to /api/health with security headers', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://example.com');
    expect(res.status).toBe(200);
    expect(res.headers['x-dns-prefetch-control']).toBe('off');
    expect(res.headers['access-control-allow-origin']).toBe(
      'https://example.com'
    );
  });

  it('validates login payload', async () => {
    const res = await request(app).post('/api/login').send({});
    const res = await request(app)
      .post('/api/login')
      .set(originHeaders)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'missing_credentials' });
  });

  it('returns default entitlements for logged-in user', async () => {
    const cookie = await getAuthCookie(app);
    const res = await request(app)
      .get('/api/billing/entitlements/me')
      .set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.planName).toBe('Free');
    expect(res.body.entitlements.can.math.pro).toBe(false);
  });

  it('rate limits repeated failed login attempts', async () => {
    loginLimiter.resetKey('::ffff:127.0.0.1');
    loginLimiter.resetKey('127.0.0.1');

    for (let i = 0; i < 5; i += 1) {
      const res = await request(app)
        .post('/api/login')
        .send({ username: 'root', password: 'wrong' });
      expect([400, 401]).toContain(res.status);
    }

    const final = await request(app)
      .post('/api/login')
      .send({ username: 'root', password: 'wrong' });
    expect(final.status).toBe(429);
    expect(final.body.error).toBe('too_many_attempts');
const test = require('node:test');
const assert = require('node:assert/strict');

const { createServer } = require('../srv/blackroad-api/server_full.js');
const { getAuthCookie } = require('./helpers/auth.js');

const allowedOrigin = 'https://example.com';

async function withServer(options, callback) {
  const { server } = createServer(options);
  await new Promise((resolve) => server.listen(0, resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    await callback({ baseUrl });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('GET /health responds with ok', async () => {
  await withServer(
    { sessionSecret: 'test-session-secret', allowedOrigins: [allowedOrigin] },
    async ({ baseUrl }) => {
      const response = await fetch(`${baseUrl}/health`, {
        headers: { Origin: allowedOrigin },
      });

      assert.equal(response.status, 200);
      const body = await response.json();
      assert.equal(body.ok, true);
      assert.equal(response.headers.get('access-control-allow-origin'), allowedOrigin);
      assert.ok(response.headers.get('x-request-id'));
    }
  );
});

test('GET /api/health applies security headers', async () => {
  await withServer(
    { sessionSecret: 'test-session-secret', allowedOrigins: [allowedOrigin] },
    async ({ baseUrl }) => {
      const response = await fetch(`${baseUrl}/api/health`, {
        headers: { Origin: allowedOrigin },
      });

      assert.equal(response.status, 200);
      const body = await response.json();
      assert.equal(body.ok, true);
      assert.equal(response.headers.get('x-dns-prefetch-control'), 'off');
      assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
      assert.equal(response.headers.get('access-control-allow-origin'), allowedOrigin);
    }
  );
});

test('authenticated task creation succeeds', async () => {
  await withServer({ sessionSecret: 'test-session-secret' }, async ({ baseUrl }) => {
    const cookie = await getAuthCookie(baseUrl);

    const response = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie.join('; '),
      },
      body: JSON.stringify({ title: 'Ship secure endpoint' }),
    });

    assert.equal(response.status, 201);
    const body = await response.json();
    assert.equal(body.ok, true);
    assert.equal(body.task.title, 'Ship secure endpoint');
  });

  it('exposes seeded quantum research summaries', async () => {
    const list = await request(app).get('/api/quantum').set(originHeaders);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.topics)).toBe(true);
    expect(list.body.topics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ topic: 'reasoning' }),
        expect.objectContaining({ topic: 'memory' }),
        expect.objectContaining({ topic: 'symbolic' }),
      ])
    );

    const detail = await request(app)
      .get('/api/quantum/reasoning')
      .set(originHeaders);
    expect(detail.status).toBe(200);
    expect(detail.body).toEqual(
      expect.objectContaining({
        topic: 'reasoning',
      })
    );
    expect(detail.body.summary).toMatch(/Quantum/i);
  });

  it('reports math engine unavailable when not configured', async () => {
    const res = await request(app).get('/api/math/health').set(originHeaders);
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ ok: false, error: 'engine_unavailable' });
  });

  it('blocks math evaluation when engine is unavailable', async () => {
    const res = await request(app)
      .post('/api/math/eval')
      .set(originHeaders)
      .send({ expr: '2+2' });
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ error: 'engine_unavailable' });
  });
});
