'use strict'

const http = require('node:http')
const crypto = require('node:crypto')
const { execFile } = require('node:child_process')
const { promisify } = require('node:util')
const path = require('node:path')
const express = require('express')

const execFileAsync = promisify(execFile)

function parseAllowedOrigins(value = '') {
  return String(value)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

function parseCookies(header = '') {
  return Object.fromEntries(
    String(header)
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf('=')
        return index === -1
          ? [part, '']
          : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))]
      }),
  )
}

function createLoginLimiter() {
  const attempts = new Map()
  const windowMs = 60_000
  const maxAttempts = 5

  return {
    check(key) {
      const now = Date.now()
      const state = attempts.get(key)
      if (!state || now - state.startedAt > windowMs) {
        attempts.set(key, { count: 0, startedAt: now })
        return false
      }
      return state.count >= maxAttempts
    },
    increment(key) {
      const now = Date.now()
      const state = attempts.get(key)
      if (!state || now - state.startedAt > windowMs) {
        attempts.set(key, { count: 1, startedAt: now })
        return 1
      }
      state.count += 1
      return state.count
    },
    resetKey(key) {
      attempts.delete(key)
    },
  }
}

function createServer({
  allowedOrigins = parseAllowedOrigins(process.env.ALLOW_ORIGINS || ''),
  sessionSecret = process.env.SESSION_SECRET || 'dev-secret',
  gitRepoPath = process.env.GIT_REPO_PATH
    ? path.resolve(process.env.GIT_REPO_PATH)
    : process.cwd(),
} = {}) {
  void sessionSecret

  const app = express()
  const sessions = new Map()
  const tasks = []
  const loginLimiter = createLoginLimiter()
  const VALID_USER = { username: 'root', password: 'Codex2025' }

  app.use(express.json({ limit: '1mb' }))

  app.use((req, res, next) => {
    res.setHeader('x-request-id', crypto.randomUUID())
    res.setHeader('x-dns-prefetch-control', 'off')
    res.setHeader('x-frame-options', 'SAMEORIGIN')
    res.setHeader('referrer-policy', 'strict-origin-when-cross-origin')

    const origin = req.headers.origin
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('access-control-allow-origin', origin)
      res.setHeader('access-control-allow-credentials', 'true')
      res.setHeader('vary', 'Origin')
    }

    if (req.method === 'OPTIONS') {
      res.setHeader('access-control-allow-methods', 'GET, POST, OPTIONS')
      res.setHeader('access-control-allow-headers', 'Content-Type')
      res.status(204).end()
      return
    }

    next()
  })

  function getSession(req) {
    const cookies = parseCookies(req.headers.cookie)
    return cookies.session ? sessions.get(cookies.session) : undefined
  }

  function requireAuth(req, res, next) {
    const session = getSession(req)
    if (!session) {
      res.status(401).json({ error: 'unauthorized' })
      return
    }
    req.session = session
    next()
  }

  async function runGit(args) {
    const { stdout } = await execFileAsync('git', args, {
      cwd: gitRepoPath,
      maxBuffer: 4 * 1024 * 1024,
    })
    return stdout.toString()
  }

  function computeCounts(statusOutput) {
    const counts = { staged: 0, unstaged: 0, untracked: 0 }
    for (const line of String(statusOutput).split('\n').filter(Boolean)) {
      const state = line.slice(0, 2)
      if (state === '??') {
        counts.untracked += 1
        continue
      }
      if (state[0] && state[0] !== ' ') counts.staged += 1
      if (state[1] && state[1] !== ' ') counts.unstaged += 1
    }
    return counts
  }

  app.get('/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.get('/healthz', (_req, res) => {
    res.json({ ok: true })
  })

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, uptime: process.uptime() })
  })

  app.post('/api/login', (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    if (!req.body || typeof req.body !== 'object') {
      res.status(400).json({ error: 'invalid json payload' })
      return
    }

    const { username, password } = req.body
    if (!username || !password) {
      res.status(400).json({ error: 'missing_credentials' })
      return
    }

    if (loginLimiter.check(ip)) {
      res.status(429).json({ error: 'too_many_attempts' })
      return
    }

    if (username !== VALID_USER.username || password !== VALID_USER.password) {
      loginLimiter.increment(ip)
      res.status(401).json({ error: 'invalid credentials' })
      return
    }

    loginLimiter.resetKey(ip)
    const sessionId = crypto.randomUUID()
    sessions.set(sessionId, { username })
    res.setHeader(
      'Set-Cookie',
      `session=${encodeURIComponent(sessionId)}; HttpOnly; Path=/; SameSite=Lax`,
    )
    res.json({ ok: true })
  })

  app.get('/api/billing/entitlements/me', requireAuth, (_req, res) => {
    res.json({
      planName: 'Free',
      entitlements: {
        can: {
          math: {
            pro: false,
          },
        },
      },
    })
  })

  app.get('/api/quantum', (_req, res) => {
    res.json({
      topics: [
        { topic: 'reasoning', summary: 'Quantum reasoning summary' },
        { topic: 'memory', summary: 'Quantum memory summary' },
        { topic: 'symbolic', summary: 'Quantum symbolic summary' },
      ],
    })
  })

  app.get('/api/quantum/:topic', (req, res) => {
    res.json({
      topic: req.params.topic,
      summary: `Quantum ${req.params.topic} summary`,
    })
  })

  app.get('/api/math/health', (_req, res) => {
    res.status(503).json({ ok: false, error: 'engine_unavailable' })
  })

  app.post('/api/math/eval', (_req, res) => {
    res.status(503).json({ error: 'engine_unavailable' })
  })

  app.post('/api/tasks', requireAuth, (req, res) => {
    if (!req.body || typeof req.body.title !== 'string' || req.body.title.trim() === '') {
      res.status(400).json({ error: 'invalid task' })
      return
    }
    const task = { id: tasks.length + 1, title: req.body.title.trim() }
    tasks.push(task)
    res.status(201).json({ ok: true, task })
  })

  app.get('/api/tasks', requireAuth, (_req, res) => {
    res.json({ tasks })
  })

  app.get('/api/git/health', requireAuth, async (_req, res) => {
    try {
      const inside = await runGit(['rev-parse', '--is-inside-work-tree'])
      res.json({
        ok: true,
        insideWorkTree: inside.trim() === 'true',
        repoPath: gitRepoPath,
        readOnly: true,
      })
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message })
    }
  })

  app.get('/api/git/status', requireAuth, async (_req, res) => {
    try {
      const [branchRaw, statusRaw] = await Promise.all([
        runGit(['rev-parse', '--abbrev-ref', 'HEAD']),
        runGit(['status', '--porcelain']),
      ])
      const counts = computeCounts(statusRaw)
      const isDirty = Object.values(counts).some((value) => value > 0)
      res.json({
        ok: !isDirty,
        branch: branchRaw.trim(),
        counts,
        isDirty,
      })
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message })
    }
  })

  app.use((req, res) => {
    res.status(404).json({ error: 'not_found', path: req.path })
  })

  const server = http.createServer(app)

  function start(port = Number.parseInt(process.env.PORT || '4000', 10), callback) {
    return server.listen(port, callback)
  }

  function shutdown(done) {
    if (!server.listening) {
      if (typeof done === 'function') done()
      return
    }
    server.close(done)
  }

  return { app, server, start, shutdown, loginLimiter }
}

const defaultServer = createServer()

if (require.main === module) {
  defaultServer.start(undefined, () => {
    const address = defaultServer.server.address()
    const port = typeof address === 'object' && address ? address.port : process.env.PORT || 4000
    console.log(`[blackroad-api] listening on port ${port}`)
  })
}

module.exports = {
  ...defaultServer,
  createServer,
  parseAllowedOrigins,
}
