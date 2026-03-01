// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Hono } from 'hono'
import { verifyToken, hasScope, type TokenPayload } from '../middleware/auth.js'

const HEADER = 'BRAT_v1'

const IMPLICIT_SCOPES: Record<string, string[]> = {
  owner: ['*'],
  coordinator: ['mesh:*', 'agents:read', 'workers:read', 'api:read', 'billing:read'],
  agent: ['mesh:read', 'agents:read'],
  guest: ['api:read'],
}

const TTL_DEFAULT: Record<string, number> = {
  owner: 86400,
  coordinator: 14400,
  agent: 3600,
  guest: 900,
}

function b64enc(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function hexToBytes(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) arr[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  return arr
}

function randHex(bytes = 8): string {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function hmacSign(keyHex: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    hexToBytes(keyHex) as unknown as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg))
  return b64enc(new Uint8Array(sig))
}

async function mintToken(
  masterKey: string,
  opts: { sub: string; iss?: string; role?: string; ttl?: number; scope?: string[] },
) {
  const role = opts.role ?? 'agent'
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    v: 1,
    iss: opts.iss ?? 'blackroad-auth',
    sub: opts.sub,
    iat: now,
    exp: now + (opts.ttl ?? TTL_DEFAULT[role] ?? 3600),
    jti: randHex(8),
    role,
    scope: opts.scope ?? IMPLICIT_SCOPES[role] ?? ['api:read'],
  }
  const payloadB64 = b64enc(new TextEncoder().encode(JSON.stringify(payload)))
  const msg = `${HEADER}.${payloadB64}`
  const sig = await hmacSign(masterKey, msg)
  return { token: `${msg}.${sig}`, payload }
}

export const authRoutes = new Hono()

// POST /v1/auth/token — issue a token
authRoutes.post('/token', async (c) => {
  const masterKey = process.env['BRAT_MASTER_KEY']
  if (!masterKey) return c.json({ error: 'auth_not_configured' }, 500)

  const body = await c.req.json<{
    sub?: string
    iss?: string
    role?: string
    ttl?: number
    scope?: string[]
  }>()
  if (!body.sub) return c.json({ error: 'sub required' }, 400)

  const auth = c.req.header('Authorization') ?? ''
  const callerToken = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  let callerPayload: TokenPayload | null = null
  let callerCanIssue = false

  if (callerToken) {
    const callerResult = await verifyToken(callerToken, masterKey)
    if (!callerResult.ok) {
      return c.json({ error: `caller auth failed: ${callerResult.error}` }, 401)
    }
    callerPayload = callerResult.payload
    callerCanIssue =
      hasScope(callerPayload, 'auth:issue') || callerPayload.scope?.includes('*') === true
  }

  // Elevated roles require authenticated caller with auth:issue (or wildcard)
  if (body.role === 'owner' || body.role === 'coordinator') {
    if (!callerPayload) {
      return c.json({ error: 'elevated roles require caller auth' }, 401)
    }
    if (!callerCanIssue) {
      return c.json({ error: 'caller lacks auth:issue scope' }, 403)
    }
  }

  // Custom TTL/scope overrides require auth:issue (or wildcard)
  if ((body.ttl !== undefined || body.scope !== undefined) && !callerCanIssue) {
    return c.json({ error: 'custom ttl/scope requires auth:issue' }, 403)
  }
  const { token, payload } = await mintToken(masterKey, { ...body, sub: body.sub! })
  return c.json({ ok: true, token, payload })
})

// POST /v1/auth/verify — verify a token
authRoutes.post('/verify', async (c) => {
  const masterKey = process.env['BRAT_MASTER_KEY']
  if (!masterKey) return c.json({ error: 'auth_not_configured' }, 500)

  let token: string | null = null
  try {
    const body = await c.req.json<{ token?: string }>()
    token = body.token ?? null
  } catch {
    // try header
  }

  if (!token) {
    const auth = c.req.header('Authorization') ?? ''
    if (auth.startsWith('Bearer ')) token = auth.slice(7).trim()
  }
  if (!token) return c.json({ error: 'token required' }, 400)

  const result = await verifyToken(token, masterKey)
  return c.json(result, result.ok ? 200 : 401)
})

// GET /v1/auth/me — decode token from Authorization header
authRoutes.get('/me', async (c) => {
  const masterKey = process.env['BRAT_MASTER_KEY']
  if (!masterKey) return c.json({ error: 'auth_not_configured' }, 500)

  const auth = c.req.header('Authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  if (!token) return c.json({ error: 'no token provided' }, 401)

  const result = await verifyToken(token, masterKey)
  if (!result.ok) return c.json({ error: result.error }, 401)
  return c.json({ ok: true, identity: result.payload })
})

// GET /v1/auth/status — public health
authRoutes.get('/status', (c) =>
  c.json({
    ok: true,
    protocol: 'BRAT v1',
    signing: 'HMAC-SHA256',
    configured: !!process.env['BRAT_MASTER_KEY'],
    endpoints: ['/v1/auth/token', '/v1/auth/verify', '/v1/auth/me', '/v1/auth/status'],
    roles: Object.keys(IMPLICIT_SCOPES),
    ts: new Date().toISOString(),
  }),
)
