// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
// Sovereign API Server — Self-hosted, provider-independent
// Serves memory, keys, and agent coordination. Nobody can take this away.

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { join } from 'node:path'
import { homedir } from 'node:os'
import {
  createSovereignKey,
  generateKeyPair,
  fingerprint,
  sha256,
  deriveAgentKey,
  validateKeyFormat,
  secureRandom,
  type KeyPurpose,
  type SovereignKey,
} from './keys.js'
import { SovereignMemory, type MemoryEntry } from './memory.js'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'

// ─── Configuration ───────────────────────────────────────────────────────────

interface ApiConfig {
  port: number
  host: string
  memoryDir: string
  keysDir: string
  masterKey: string
}

function loadConfig(): ApiConfig {
  const configDir = join(homedir(), '.blackroad', 'sovereign')
  mkdirSync(configDir, { recursive: true })

  const masterKeyFile = join(configDir, '.master.key')
  let masterKey: string
  if (existsSync(masterKeyFile)) {
    masterKey = readFileSync(masterKeyFile, 'utf-8').trim()
  } else {
    masterKey = secureRandom(64)
    writeFileSync(masterKeyFile, masterKey, { mode: 0o400 })
  }

  return {
    port: parseInt(process.env.BR_SOVEREIGN_PORT ?? '8421', 10),
    host: process.env.BR_SOVEREIGN_HOST ?? '127.0.0.1',
    memoryDir: join(configDir, 'memory'),
    keysDir: join(configDir, 'keys'),
    masterKey,
  }
}

// ─── Key Store ───────────────────────────────────────────────────────────────

class KeyStore {
  private dir: string
  private keys: Map<string, SovereignKey> = new Map()

  constructor(dir: string) {
    this.dir = dir
    mkdirSync(dir, { recursive: true })
    this.load()
  }

  private load(): void {
    const file = join(this.dir, 'keys.json')
    if (existsSync(file)) {
      const data: SovereignKey[] = JSON.parse(readFileSync(file, 'utf-8'))
      for (const key of data) {
        this.keys.set(key.id, key)
      }
    }
  }

  private save(): void {
    writeFileSync(join(this.dir, 'keys.json'), JSON.stringify([...this.keys.values()], null, 2), {
      mode: 0o600,
    })
  }

  create(purpose: KeyPurpose, opts?: { scopes?: string[]; agent?: string; expiresInDays?: number }): SovereignKey {
    const key = createSovereignKey(purpose, opts)
    this.keys.set(key.id, key)
    this.save()
    return key
  }

  get(id: string): SovereignKey | undefined {
    return this.keys.get(id)
  }

  validate(rawKey: string): SovereignKey | null {
    for (const sk of this.keys.values()) {
      if (sk.key === rawKey && !sk.revoked) {
        if (sk.expires && new Date(sk.expires) < new Date()) return null
        return sk
      }
    }
    return null
  }

  revoke(id: string): boolean {
    const key = this.keys.get(id)
    if (!key) return false
    key.revoked = true
    this.save()
    return true
  }

  list(): SovereignKey[] {
    return [...this.keys.values()].map((k) => ({
      ...k,
      key: `${k.prefix}_${'*'.repeat(8)}...${k.key.slice(-8)}`, // mask the actual key
    }))
  }
}

// ─── Request Helpers ─────────────────────────────────────────────────────────

const MAX_BODY_BYTES = 5 * 1024 * 1024 // 5MB limit to prevent DoS via large payloads

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let totalBytes = 0

    const onData = (chunk: Buffer): void => {
      totalBytes += chunk.length
      if (totalBytes > MAX_BODY_BYTES) {
        req.removeListener('data', onData)
        req.removeListener('end', onEnd)
        reject(new Error('Request body too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    }
    const onEnd = (): void => resolve(Buffer.concat(chunks).toString('utf-8'))
    const onError = (err: Error): void => reject(err)

    req.on('data', onData)
    req.on('end', onEnd)
    req.on('error', onError)
    req.on('aborted', () => reject(new Error('Request aborted')))
  })
}

function json(res: ServerResponse, data: unknown, status: number = 200): void {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'X-Powered-By': 'BlackRoad Sovereign API',
    'X-BlackRoad-Version': '1.0.0',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-BlackRoad-Key',
  })
  res.end(JSON.stringify(data))
}

function error(res: ServerResponse, message: string, status: number = 400): void {
  json(res, { error: message, status }, status)
}

// ─── Route Handler ───────────────────────────────────────────────────────────

export function createSovereignApi(): { start: () => void; port: number } {
  const config = loadConfig()
  const memory = new SovereignMemory(config.memoryDir, config.masterKey)
  const keyStore = new KeyStore(config.keysDir)

  // Ensure at least one admin key exists
  const existingKeys = keyStore.list()
  if (existingKeys.length === 0) {
    const adminKey = keyStore.create('api', { scopes: ['admin', '*'] })
    console.log(`\n  Initial admin API key created:`)
    console.log(`  ${adminKey.key}`)
    console.log(`  Fingerprint: ${adminKey.fingerprint}`)
    console.log(`  Save this key — it won't be shown again.\n`)
  }

  const server = createServer(async (req, res) => {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      json(res, {})
      return
    }

    const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
    const path = url.pathname

    try {
      // ─── Public Endpoints ─────────────────────────────────────────────

      if (path === '/' && req.method === 'GET') {
        json(res, {
          name: 'BlackRoad Sovereign API',
          version: '1.0.0',
          owner: 'BlackRoad OS, Inc.',
          tagline: 'Your AI. Your Hardware. Your Rules.',
          endpoints: [
            'GET  /                   — This info',
            'GET  /health             — Health check',
            'POST /memory/remember    — Store a memory',
            'GET  /memory/recall      — Search memories',
            'GET  /memory/all         — List all memories',
            'GET  /memory/stats       — Memory statistics',
            'GET  /memory/verify      — Verify chain integrity',
            'POST /memory/leak        — Create memory leak (cross-agent)',
            'GET  /memory/leaks       — List all memory leaks',
            'GET  /memory/export      — Export entire memory',
            'POST /keys/create        — Generate sovereign key',
            'POST /keys/pair          — Generate key pair',
            'GET  /keys/list          — List all keys',
            'POST /keys/validate      — Validate a key',
            'POST /keys/revoke        — Revoke a key',
            'POST /keys/derive        — Derive agent key',
            'POST /session/start      — Start memory session',
            'POST /session/end        — End memory session',
          ],
        })
        return
      }

      if (path === '/health' && req.method === 'GET') {
        const stats = memory.stats()
        const chainVerify = memory.verify()
        json(res, {
          status: 'sovereign',
          uptime: process.uptime(),
          memory: {
            entries: stats.totalEntries,
            sessions: stats.totalSessions,
            agents: stats.totalAgents,
            chainIntegrity: chainVerify.valid ? 'INTACT' : 'BROKEN',
          },
          timestamp: new Date().toISOString(),
        })
        return
      }

      // ─── Memory Endpoints ─────────────────────────────────────────────

      if (path === '/memory/remember' && req.method === 'POST') {
        let body: Record<string, unknown>
        try {
          body = JSON.parse(await readBody(req))
        } catch {
          error(res, 'Invalid JSON body', 400)
          return
        }
        if (!body.content || typeof body.content !== 'string') {
          error(res, 'Missing or invalid required field: content (must be a string)', 400)
          return
        }
        const entry = memory.remember(body.content as string, {
          type: body.type,
          agent: body.agent,
          tags: body.tags,
          confidence: body.confidence,
          truthState: body.truthState,
          sessionId: body.sessionId,
        })
        json(res, { stored: true, entry }, 201)
        return
      }

      if (path === '/memory/recall' && req.method === 'GET') {
        const query = url.searchParams.get('q') ?? ''
        const agent = url.searchParams.get('agent') ?? undefined
        const type = url.searchParams.get('type') ?? undefined
        const limit = parseInt(url.searchParams.get('limit') ?? '50', 10)
        const results = memory.recall(query, { agent, type, limit })
        json(res, { query, count: results.length, results })
        return
      }

      if (path === '/memory/all' && req.method === 'GET') {
        const entries = memory.all()
        json(res, { count: entries.length, entries })
        return
      }

      if (path === '/memory/stats' && req.method === 'GET') {
        json(res, memory.stats())
        return
      }

      if (path === '/memory/verify' && req.method === 'GET') {
        const result = memory.verify()
        json(res, {
          chainIntegrity: result.valid ? 'INTACT' : 'BROKEN',
          ...result,
        })
        return
      }

      if (path === '/memory/leak' && req.method === 'POST') {
        const body = JSON.parse(await readBody(req))
        if (!body.source || !body.target || !body.content) {
          error(res, 'Missing required fields: source, target, content')
          return
        }
        const leak = memory.leak(body.source, body.target, body.content)
        json(res, { leaked: true, leak }, 201)
        return
      }

      if (path === '/memory/leaks' && req.method === 'GET') {
        const leaks = memory.leaks()
        json(res, { count: leaks.length, leaks })
        return
      }

      if (path === '/memory/export' && req.method === 'GET') {
        json(res, memory.export())
        return
      }

      // ─── Key Endpoints ────────────────────────────────────────────────

      if (path === '/keys/create' && req.method === 'POST') {
        let body: Record<string, unknown>
        try {
          body = JSON.parse(await readBody(req))
        } catch {
          error(res, 'Invalid JSON body', 400)
          return
        }
        const VALID_PURPOSES: KeyPurpose[] = ['pat', 'api', 'agent', 'memory', 'session', 'webhook']
        const purpose = (body.purpose as string) ?? 'api'
        if (!VALID_PURPOSES.includes(purpose as KeyPurpose)) {
          error(res, `Invalid purpose "${purpose}". Allowed: ${VALID_PURPOSES.join(', ')}`, 400)
          return
        }
        const key = keyStore.create(purpose as KeyPurpose, {
          scopes: body.scopes,
          agent: body.agent,
          expiresInDays: body.expiresInDays,
        })
        json(res, { created: true, key }, 201)
        return
      }

      if (path === '/keys/pair' && req.method === 'POST') {
        const pair = generateKeyPair()
        json(res, { created: true, pair }, 201)
        return
      }

      if (path === '/keys/list' && req.method === 'GET') {
        const keys = keyStore.list()
        json(res, { count: keys.length, keys })
        return
      }

      if (path === '/keys/validate' && req.method === 'POST') {
        const body = JSON.parse(await readBody(req))
        const formatValid = validateKeyFormat(body.key)
        const storeValid = keyStore.validate(body.key)
        json(res, {
          formatValid: formatValid.valid,
          purpose: formatValid.purpose,
          registered: storeValid !== null,
          fingerprint: fingerprint(body.key),
        })
        return
      }

      if (path === '/keys/revoke' && req.method === 'POST') {
        const body = JSON.parse(await readBody(req))
        const revoked = keyStore.revoke(body.id)
        json(res, { revoked })
        return
      }

      if (path === '/keys/derive' && req.method === 'POST') {
        let body: Record<string, unknown>
        try {
          body = JSON.parse(await readBody(req))
        } catch {
          error(res, 'Invalid JSON body', 400)
          return
        }
        if (!body.agent || typeof body.agent !== 'string') {
          error(res, 'Missing or invalid required field: agent', 400)
          return
        }
        const VALID_PURPOSES: KeyPurpose[] = ['pat', 'api', 'agent', 'memory', 'session', 'webhook']
        const purpose = (body.purpose as string) ?? 'agent'
        if (!VALID_PURPOSES.includes(purpose as KeyPurpose)) {
          error(res, `Invalid purpose "${purpose}". Allowed: ${VALID_PURPOSES.join(', ')}`, 400)
          return
        }
        const derivedKey = deriveAgentKey(config.masterKey, body.agent as string, purpose as KeyPurpose)
        json(res, {
          derived: true,
          agent: body.agent,
          purpose,
          key: derivedKey,
          fingerprint: fingerprint(derivedKey),
        })
        return
      }

      // ─── Session Endpoints ────────────────────────────────────────────

      if (path === '/session/start' && req.method === 'POST') {
        const body = JSON.parse(await readBody(req))
        const session = memory.startSession(body.name ?? 'unnamed', body.agent ?? 'system')
        json(res, { started: true, session }, 201)
        return
      }

      if (path === '/session/end' && req.method === 'POST') {
        const body = JSON.parse(await readBody(req))
        const session = memory.endSession(body.sessionId)
        if (!session) {
          error(res, 'Session not found', 404)
          return
        }
        json(res, { ended: true, session })
        return
      }

      // ─── Memory entry by ID ───────────────────────────────────────────

      const memoryMatch = path.match(/^\/memory\/([a-z0-9_]+)$/)
      if (memoryMatch && req.method === 'GET') {
        const entry = memory.get(memoryMatch[1])
        if (!entry) {
          error(res, 'Memory not found', 404)
          return
        }
        json(res, entry)
        return
      }

      // ─── 404 ──────────────────────────────────────────────────────────

      error(res, `Not found: ${path}`, 404)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error'
      error(res, message, 500)
    }
  })

  return {
    start: () => {
      server.listen(config.port, config.host, () => {
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║           BLACKROAD SOVEREIGN API v1.0.0                    ║
║           Your AI. Your Hardware. Your Rules.               ║
╠══════════════════════════════════════════════════════════════╣
║  Listening: http://${config.host}:${config.port}                        ║
║  Memory:    ${config.memoryDir.slice(0, 44).padEnd(44)}  ║
║  Keys:      ${config.keysDir.slice(0, 44).padEnd(44)}  ║
║  Chain:     SHA-256 PS-SHA∞ hash chain                      ║
║  Status:    SOVEREIGN                                       ║
╚══════════════════════════════════════════════════════════════╝
        `)
      })
    },
    port: config.port,
  }
}
