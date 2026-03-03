// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import type { Context, Next } from 'hono'

export interface TokenPayload {
  v: number
  iss: string
  sub: string
  iat: number
  exp: number
  jti: string
  role: 'owner' | 'coordinator' | 'agent' | 'guest'
  scope: string[]
}

const HEADER = 'BRAT_v1'

function b64enc(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function b64dec(str: string): Uint8Array {
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4)
  const bin = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

function hexToBytes(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) arr[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  return arr
}

async function hmacSign(keyHex: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    hexToBytes(keyHex),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg))
  return b64enc(new Uint8Array(sig))
}

export async function verifyToken(
  token: string,
  masterKey: string,
): Promise<{ ok: true; payload: TokenPayload } | { ok: false; error: string }> {
  const parts = token.trim().split('.')
  if (parts.length !== 3) return { ok: false, error: 'malformed token' }
  const [hdr, payloadB64, sigB64] = parts
  if (hdr !== HEADER) return { ok: false, error: `invalid header: ${hdr}` }

  const msg = `${hdr}.${payloadB64}`
  const expected = await hmacSign(masterKey, msg)
  // Constant-time comparison to prevent timing side-channel attacks
  if (expected.length !== sigB64.length) return { ok: false, error: 'invalid signature' }
  const a = new TextEncoder().encode(expected)
  const b = new TextEncoder().encode(sigB64)
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  if (diff !== 0) return { ok: false, error: 'invalid signature' }

  let payload: TokenPayload
  try {
    payload = JSON.parse(new TextDecoder().decode(b64dec(payloadB64)))
  } catch {
    return { ok: false, error: 'payload decode error' }
  }

  const now = Math.floor(Date.now() / 1000)
  if (payload.exp < now) return { ok: false, error: `token expired ${now - payload.exp}s ago` }

  return { ok: true, payload }
}

export function hasScope(payload: TokenPayload, required: string): boolean {
  const scopes = payload.scope || []
  if (scopes.includes('*')) return true
  if (scopes.includes(required)) return true
  const [res] = required.split(':')
  return scopes.includes(`${res}:*`)
}

function extractToken(c: Context): string | null {
  const auth = c.req.header('Authorization') ?? ''
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim()

  // In production, do not accept tokens via query parameters to avoid leakage via logs, referrers, etc.
  if (process.env['NODE_ENV'] === 'production') {
    return null
  }
  const token = new URL(c.req.url).searchParams.get('token')
  return token || null
}

/** Middleware that enforces BRAT auth on all routes under this scope */
export function authMiddleware(requiredScope?: string) {
  return async (c: Context, next: Next) => {
    const masterKey = process.env['BRAT_MASTER_KEY']
    if (!masterKey) {
      // If no master key configured, allow through (development mode)
      if (process.env['NODE_ENV'] !== 'production') {
        c.set('identity', {
          sub: 'dev-user',
          role: 'owner',
          scope: ['*'],
        } as TokenPayload)
        return next()
      }
      return c.json({ error: 'auth_not_configured' }, 500)
    }

    const token = extractToken(c)
    if (!token) {
      return c.json({ error: 'unauthorized', message: 'Bearer token required' }, 401)
    }

    const result = await verifyToken(token, masterKey)
    if (!result.ok) {
      return c.json({ error: 'unauthorized', message: result.error }, 401)
    }

    if (requiredScope && !hasScope(result.payload, requiredScope)) {
      return c.json(
        { error: 'forbidden', message: `requires scope: ${requiredScope}` },
        403,
      )
    }

    c.set('identity', result.payload)
    return next()
  }
}
