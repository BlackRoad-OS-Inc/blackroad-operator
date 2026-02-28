/**
 * BlackRoad Operator — API Worker (Cloudflare Workers)
 *
 * Production API running on Cloudflare's edge network.
 * Mirrors the Node.js API server endpoints for global distribution.
 *
 * Endpoints:
 *   GET  /                — service info
 *   GET  /healthz         — liveness probe
 *   GET  /v1/agents       — list agents
 *   GET  /v1/agents/:name — agent details
 *   POST /v1/auth/token   — issue BRAT token
 *   POST /v1/auth/verify  — verify token
 *   GET  /v1/auth/me      — identity from token
 *   GET  /v1/billing/plans — pricing plans
 *   GET  /v1/metrics      — request metrics
 */

interface Env {
  BRAT_MASTER_KEY?: string
  METRICS?: KVNamespace
  INSTANCE?: string
  VERSION?: string
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}

const AGENTS = [
  { name: 'octavia', title: 'The Architect', role: 'Systems design, strategy', color: '#9C27B0', status: 'active', capabilities: ['architecture', 'planning', 'systems-design'] },
  { name: 'lucidia', title: 'The Dreamer', role: 'Creative vision, philosophy', color: '#00BCD4', status: 'active', capabilities: ['creative', 'reasoning', 'philosophy'] },
  { name: 'alice', title: 'The Operator', role: 'DevOps, automation, routing', color: '#4CAF50', status: 'active', capabilities: ['devops', 'automation', 'deployment'] },
  { name: 'cipher', title: 'The Guardian', role: 'Security, auth, encryption', color: '#2979FF', status: 'active', capabilities: ['security', 'auth', 'encryption'] },
  { name: 'prism', title: 'The Analyst', role: 'Pattern recognition, analytics', color: '#FFC107', status: 'active', capabilities: ['analytics', 'patterns', 'data'] },
  { name: 'echo', title: 'The Memory', role: 'Storage, recall, context', color: '#9C27B0', status: 'active', capabilities: ['memory', 'storage', 'context'] },
]

const PLANS = [
  { id: 'free', name: 'Free', price_monthly: 0, limits: { requests_per_day: 100, agents: 2 } },
  { id: 'pro', name: 'Pro', price_monthly: 49, limits: { requests_per_day: 10000, agents: 6 } },
  { id: 'team', name: 'Team', price_monthly: 199, limits: { requests_per_day: 100000, agents: 30 } },
  { id: 'enterprise', name: 'Enterprise', price_monthly: null, limits: { requests_per_day: null, agents: null } },
]

// ─── Token helpers (same as auth worker) ────────────────────────────────────
const HEADER = 'BRAT_v1'

function b64enc(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function b64dec(str: string): Uint8Array {
  const padded = str + '='.repeat((4 - str.length % 4) % 4)
  const bin = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(bin, c => c.charCodeAt(0))
}
function hexToBytes(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) arr[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  return arr
}
async function hmacSign(keyHex: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', hexToBytes(keyHex), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg))
  return b64enc(new Uint8Array(sig))
}
function randHex(bytes = 8): string {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function mintToken(masterKey: string, sub: string, role = 'agent') {
  const SCOPES: Record<string, string[]> = { owner: ['*'], coordinator: ['mesh:*', 'agents:read'], agent: ['mesh:read', 'agents:read'], guest: ['api:read'] }
  const TTLS: Record<string, number> = { owner: 86400, coordinator: 14400, agent: 3600, guest: 900 }
  const now = Math.floor(Date.now() / 1000)
  const payload = { v: 1, iss: 'blackroad-api', sub, iat: now, exp: now + (TTLS[role] ?? 3600), jti: randHex(8), role, scope: SCOPES[role] ?? ['api:read'] }
  const payloadB64 = b64enc(new TextEncoder().encode(JSON.stringify(payload)))
  const msg = `${HEADER}.${payloadB64}`
  const sig = await hmacSign(masterKey, msg)
  return { token: `${msg}.${sig}`, payload }
}

async function verifyToken(token: string, masterKey: string) {
  const parts = token.trim().split('.')
  if (parts.length !== 3) return { ok: false as const, error: 'malformed token' }
  const [hdr, payloadB64, sigB64] = parts
  if (hdr !== HEADER) return { ok: false as const, error: 'invalid header' }
  const expected = await hmacSign(masterKey, `${hdr}.${payloadB64}`)
  // Constant-time comparison to prevent timing side-channel attacks
  if (expected.length !== sigB64.length) return { ok: false as const, error: 'invalid signature' }
  const encA = new TextEncoder().encode(expected)
  const encB = new TextEncoder().encode(sigB64)
  let diff = 0
  for (let i = 0; i < encA.length; i++) diff |= encA[i] ^ encB[i]
  if (diff !== 0) return { ok: false as const, error: 'invalid signature' }
  let payload: Record<string, unknown>
  try { payload = JSON.parse(new TextDecoder().decode(b64dec(payloadB64))) } catch { return { ok: false as const, error: 'decode error' } }
  if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) return { ok: false as const, error: 'expired' }
  return { ok: true as const, payload }
}

// ─── Metrics (in-memory, resets on cold start) ─────────────────────────────
let totalRequests = 0
let totalErrors = 0
const startTime = Date.now()

// ─── Router ─────────────────────────────────────────────────────────────────
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method

    totalRequests++

    if (method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })

    // GET / — service info
    if (path === '/' && method === 'GET') {
      return json({
        service: env.INSTANCE ?? 'blackroad-operator-api',
        version: env.VERSION ?? '0.1.0',
        status: 'operational',
        runtime: 'cloudflare-workers',
        ts: new Date().toISOString(),
      })
    }

    // GET /healthz
    if (path === '/healthz' && method === 'GET') {
      return json({ status: 'ok', service: 'blackroad-operator', uptime: Math.floor((Date.now() - startTime) / 1000), ts: new Date().toISOString() })
    }

    // GET /v1/agents
    if (path === '/v1/agents' && method === 'GET') {
      return json({ agents: AGENTS, total: AGENTS.length, ts: new Date().toISOString() })
    }

    // GET /v1/agents/:name
    const agentMatch = path.match(/^\/v1\/agents\/([a-z0-9_-]+)$/i)
    if (agentMatch && method === 'GET') {
      const agent = AGENTS.find(a => a.name === agentMatch[1].toLowerCase())
      if (!agent) return json({ error: 'agent_not_found' }, 404)
      return json({ agent })
    }

    // POST /v1/auth/token
    if (path === '/v1/auth/token' && method === 'POST') {
      if (!env.BRAT_MASTER_KEY) return json({ error: 'auth_not_configured' }, 500)
      let body: { sub?: string; role?: string }
      try { body = await request.json() } catch { return json({ error: 'invalid JSON' }, 400) }
      if (!body.sub) return json({ error: 'sub required' }, 400)
      const { token, payload } = await mintToken(env.BRAT_MASTER_KEY, body.sub, body.role)
      return json({ ok: true, token, payload })
    }

    // POST /v1/auth/verify
    if (path === '/v1/auth/verify' && method === 'POST') {
      if (!env.BRAT_MASTER_KEY) return json({ error: 'auth_not_configured' }, 500)
      let body: { token?: string }
      try { body = await request.json() } catch { body = {} }
      const tkn = body.token ?? (request.headers.get('Authorization') ?? '').replace('Bearer ', '').trim()
      if (!tkn) return json({ error: 'token required' }, 400)
      const result = await verifyToken(tkn, env.BRAT_MASTER_KEY)
      return json(result, result.ok ? 200 : 401)
    }

    // GET /v1/auth/me
    if (path === '/v1/auth/me' && method === 'GET') {
      if (!env.BRAT_MASTER_KEY) return json({ error: 'auth_not_configured' }, 500)
      const tkn = (request.headers.get('Authorization') ?? '').replace('Bearer ', '').trim()
      if (!tkn) return json({ error: 'no token' }, 401)
      const result = await verifyToken(tkn, env.BRAT_MASTER_KEY)
      if (!result.ok) return json({ error: result.error }, 401)
      return json({ ok: true, identity: result.payload })
    }

    // GET /v1/billing/plans
    if (path === '/v1/billing/plans' && method === 'GET') {
      return json({ plans: PLANS, currency: 'USD', billing_cycle: 'monthly' })
    }

    // GET /v1/metrics
    if (path === '/v1/metrics' && method === 'GET') {
      return json({
        status: 'ok',
        metrics: {
          uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
          total_requests: totalRequests,
          total_errors: totalErrors,
          runtime: 'cloudflare-workers',
        },
      })
    }

    totalErrors++
    return json({ error: 'not_found', message: `${method} ${path} not found` }, 404)
  },
}
