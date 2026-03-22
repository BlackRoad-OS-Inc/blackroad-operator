process.env.SESSION_SECRET = 'test-secret'
process.env.INTERNAL_TOKEN = 'x'
process.env.ALLOW_ORIGINS = 'https://example.com'
process.env.BR_TEST_DISABLE_DB = '1'

const request = require('supertest')
const { createServer } = require('../srv/blackroad-api/server_full.js')
const { getAuthCookie } = require('./helpers/auth')

describe('API security and health', () => {
  let app
  let shutdown

  beforeAll(() => {
    const serverState = createServer({
      allowedOrigins: ['https://example.com'],
      sessionSecret: 'test-secret',
      gitRepoPath: process.cwd(),
    })
    app = serverState.app
    shutdown = serverState.shutdown
  })

  afterAll((done) => {
    shutdown(done)
  })

  it('responds to /health', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
  })

  it('responds to /healthz', async () => {
    const res = await request(app).get('/healthz')
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
  })

  it('returns security headers on /api/health', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://example.com')

    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(res.headers['x-dns-prefetch-control']).toBe('off')
    expect(res.headers['access-control-allow-origin']).toBe('https://example.com')
  })

  it('validates login payload', async () => {
    const res = await request(app).post('/api/login').send({})
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'missing_credentials' })
  })

  it('returns default entitlements for logged-in user', async () => {
    const cookie = await getAuthCookie(app)
    const res = await request(app)
      .get('/api/billing/entitlements/me')
      .set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.planName).toBe('Free')
    expect(res.body.entitlements.can.math.pro).toBe(false)
  })

  it('rate limits repeated failed login attempts', async () => {
    for (let i = 0; i < 5; i += 1) {
      const res = await request(app)
        .post('/api/login')
        .send({ username: 'root', password: 'wrong' })
      expect([401, 429]).toContain(res.status)
    }

    const final = await request(app)
      .post('/api/login')
      .send({ username: 'root', password: 'wrong' })
    expect(final.status).toBe(429)
    expect(final.body.error).toBe('too_many_attempts')
  })

  it('exposes seeded quantum research summaries', async () => {
    const list = await request(app).get('/api/quantum')
    expect(list.status).toBe(200)
    expect(Array.isArray(list.body.topics)).toBe(true)
    expect(list.body.topics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ topic: 'reasoning' }),
        expect.objectContaining({ topic: 'memory' }),
        expect.objectContaining({ topic: 'symbolic' }),
      ]),
    )

    const detail = await request(app).get('/api/quantum/reasoning')
    expect(detail.status).toBe(200)
    expect(detail.body.topic).toBe('reasoning')
    expect(detail.body.summary).toMatch(/Quantum/i)
  })

  it('reports math engine unavailable when not configured', async () => {
    const res = await request(app).get('/api/math/health')
    expect(res.status).toBe(503)
    expect(res.body).toEqual({ ok: false, error: 'engine_unavailable' })
  })

  it('blocks math evaluation when engine is unavailable', async () => {
    const res = await request(app).post('/api/math/eval').send({ expr: '2+2' })
    expect(res.status).toBe(503)
    expect(res.body).toEqual({ error: 'engine_unavailable' })
  })
})
