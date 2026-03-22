import test from 'node:test'
import assert from 'node:assert/strict'

process.env.SESSION_SECRET = 'test-secret'
process.env.INTERNAL_TOKEN = 'x'
process.env.ALLOW_ORIGINS = 'https://example.com'
process.env.GIT_REPO_PATH = process.cwd()

const { createServer } = await import('../srv/blackroad-api/server_full.js')

async function withServer(callback) {
  const { server } = createServer({
    allowedOrigins: ['https://example.com'],
    sessionSecret: 'test-secret',
    gitRepoPath: process.cwd(),
  })
  await new Promise((resolve) => server.listen(0, resolve))
  const address = server.address()
  const baseUrl = `http://127.0.0.1:${address.port}`
  try {
    await callback(baseUrl)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
}

async function login(baseUrl) {
  const response = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://example.com',
    },
    body: JSON.stringify({ username: 'root', password: 'Codex2025' }),
  })
  assert.equal(response.status, 200)
  const cookie = response.headers.get('set-cookie')
  assert.ok(cookie)
  return cookie
}

test('api smoke flow works', async () => {
  await withServer(async (baseUrl) => {
    const health = await fetch(`${baseUrl}/health`, {
      headers: { Origin: 'https://example.com' },
    })
    assert.equal(health.status, 200)
    assert.equal((await health.json()).ok, true)

    const cookie = await login(baseUrl)

    const gitHealth = await fetch(`${baseUrl}/api/git/health`, {
      headers: { Cookie: cookie, Origin: 'https://example.com' },
    })
    assert.equal(gitHealth.status, 200)

    const taskCreate = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
        Origin: 'https://example.com',
      },
      body: JSON.stringify({ title: 'Ship secure endpoint' }),
    })
    assert.equal(taskCreate.status, 201)
    const created = await taskCreate.json()
    assert.equal(created.task.title, 'Ship secure endpoint')
  })
})
