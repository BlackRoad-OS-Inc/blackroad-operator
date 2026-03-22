process.env.SESSION_SECRET = 'test-secret'
process.env.INTERNAL_TOKEN = 'x'
process.env.ALLOW_ORIGINS = 'https://example.com'
process.env.GIT_REPO_PATH = process.cwd()

const request = require('supertest')
const { createServer } = require('../srv/blackroad-api/server_full.js')
const { getAuthCookie } = require('./helpers/auth')

describe('Git API', () => {
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

  it('returns git health info', async () => {
    const cookie = await getAuthCookie(app)
    const res = await request(app)
      .get('/api/git/health')
      .set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(typeof res.body.repoPath).toBe('string')
    expect(res.body.readOnly).toBe(true)
  })

  it('returns git status info', async () => {
    const cookie = await getAuthCookie(app)
    const res = await request(app)
      .get('/api/git/status')
      .set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(typeof res.body.ok).toBe('boolean')
    expect(typeof res.body.branch).toBe('string')
    expect(res.body.counts).toBeDefined()
    expect(res.body.counts).toHaveProperty('staged')
    expect(res.body.counts).toHaveProperty('unstaged')
    expect(res.body.counts).toHaveProperty('untracked')
    expect(typeof res.body.isDirty).toBe('boolean')
  })
})
