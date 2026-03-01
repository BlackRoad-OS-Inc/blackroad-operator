// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
// Sovereign Key System — SHA256-based key generation, custom PATs, API keys
// Provider-independent. Your keys. Your hardware. Your rules.

import { createHash, randomBytes, createHmac } from 'node:crypto'

// ─── Key Types ───────────────────────────────────────────────────────────────

export type KeyPurpose = 'pat' | 'api' | 'agent' | 'memory' | 'session' | 'webhook'

export interface SovereignKey {
  id: string
  key: string
  prefix: string
  purpose: KeyPurpose
  created: string
  expires: string | null
  fingerprint: string
  agent?: string
  scopes: string[]
  revoked: boolean
}

export interface KeyPair {
  publicKey: string
  secretKey: string
  fingerprint: string
}

// ─── Prefixes ────────────────────────────────────────────────────────────────

const KEY_PREFIXES: Record<KeyPurpose, string> = {
  pat: 'br_pat',
  api: 'br_api',
  agent: 'br_agt',
  memory: 'br_mem',
  session: 'br_ses',
  webhook: 'br_whk',
}

// ─── Core Key Generation ─────────────────────────────────────────────────────

/** Generate a SHA256 fingerprint from arbitrary data */
export function sha256(data: string): string {
  return createHash('sha256').update(data).digest('hex')
}

/** Generate a double-SHA256 (like Bitcoin) for extra entropy mixing */
export function doubleSha256(data: string): string {
  const first = createHash('sha256').update(data).digest()
  return createHash('sha256').update(first).digest('hex')
}

/** Generate HMAC-SHA256 for authenticated hashing */
export function hmacSha256(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('hex')
}

/** Generate cryptographically secure random bytes as hex */
export function secureRandom(bytes: number = 32): string {
  return randomBytes(bytes).toString('hex')
}

/** Generate a sovereign key with BlackRoad prefix */
export function generateKey(purpose: KeyPurpose, opts?: { bytes?: number }): string {
  const prefix = KEY_PREFIXES[purpose]
  const entropy = secureRandom(opts?.bytes ?? 32)
  return `${prefix}_${entropy}`
}

/** Generate a fingerprint for a key (safe to share/display) */
export function fingerprint(key: string): string {
  const hash = sha256(key)
  // Return first 16 chars in groups of 4 separated by colons
  return hash
    .slice(0, 16)
    .match(/.{4}/g)!
    .join(':')
}

/** Generate a full SovereignKey object */
export function createSovereignKey(
  purpose: KeyPurpose,
  opts?: {
    scopes?: string[]
    agent?: string
    expiresInDays?: number
  },
): SovereignKey {
  const key = generateKey(purpose)
  const now = new Date()
  const expires = opts?.expiresInDays
    ? new Date(now.getTime() + opts.expiresInDays * 86400000).toISOString()
    : null

  return {
    id: `key_${secureRandom(8)}`,
    key,
    prefix: KEY_PREFIXES[purpose],
    purpose,
    created: now.toISOString(),
    expires,
    fingerprint: fingerprint(key),
    agent: opts?.agent,
    scopes: opts?.scopes ?? ['*'],
    revoked: false,
  }
}

// ─── Key Pair Generation ─────────────────────────────────────────────────────

/** Generate a public/secret key pair for agent-to-agent auth */
export function generateKeyPair(): KeyPair {
  const seed = secureRandom(64)
  const secretKey = `br_sk_${sha256(seed)}`
  const publicKey = `br_pk_${sha256(secretKey)}`
  return {
    publicKey,
    secretKey,
    fingerprint: fingerprint(secretKey),
  }
}

// ─── Hash Chain (PS-SHA∞) ────────────────────────────────────────────────────

export interface HashChainEntry {
  index: number
  timestamp: string
  data: string
  previousHash: string
  hash: string
  nonce: string
}

/** Create genesis entry for a new hash chain */
export function genesisEntry(data: string): HashChainEntry {
  const nonce = secureRandom(16)
  const timestamp = new Date().toISOString()
  const previousHash = '0'.repeat(64)
  const payload = `0:${timestamp}:${data}:${previousHash}:${nonce}`
  return {
    index: 0,
    timestamp,
    data,
    previousHash,
    hash: sha256(payload),
    nonce,
  }
}

/** Append an entry to a hash chain */
export function chainEntry(previous: HashChainEntry, data: string): HashChainEntry {
  const nonce = secureRandom(16)
  const timestamp = new Date().toISOString()
  const index = previous.index + 1
  const payload = `${index}:${timestamp}:${data}:${previous.hash}:${nonce}`
  return {
    index,
    timestamp,
    data,
    previousHash: previous.hash,
    hash: sha256(payload),
    nonce,
  }
}

/** Verify integrity of a hash chain */
export function verifyChain(entries: HashChainEntry[]): {
  valid: boolean
  brokenAt?: number
} {
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    const payload = `${entry.index}:${entry.timestamp}:${entry.data}:${entry.previousHash}:${entry.nonce}`
    const expected = sha256(payload)
    if (expected !== entry.hash) {
      return { valid: false, brokenAt: i }
    }
    if (i > 0 && entry.previousHash !== entries[i - 1].hash) {
      return { valid: false, brokenAt: i }
    }
  }
  return { valid: true }
}

// ─── Key Derivation ──────────────────────────────────────────────────────────

/** Derive a child key from a master key + path (like HD wallets) */
export function deriveKey(masterKey: string, path: string): string {
  const segments = path.split('/')
  let current = masterKey
  for (const segment of segments) {
    current = hmacSha256(segment, current)
  }
  return `br_dk_${current}`
}

/** Derive agent-specific keys from a master */
export function deriveAgentKey(masterKey: string, agentName: string, purpose: KeyPurpose): string {
  return deriveKey(masterKey, `blackroad/${agentName}/${purpose}`)
}

// ─── Token Validation ────────────────────────────────────────────────────────

/** Validate a sovereign key format */
export function validateKeyFormat(key: string): { valid: boolean; purpose?: KeyPurpose } {
  for (const [purpose, prefix] of Object.entries(KEY_PREFIXES)) {
    if (key.startsWith(`${prefix}_`)) {
      const body = key.slice(prefix.length + 1)
      if (/^[a-f0-9]{64}$/.test(body)) {
        return { valid: true, purpose: purpose as KeyPurpose }
      }
    }
  }
  // Check derived keys
  if (key.startsWith('br_dk_') && /^[a-f0-9]{64}$/.test(key.slice(6))) {
    return { valid: true }
  }
  // Check key pairs
  if (
    (key.startsWith('br_sk_') || key.startsWith('br_pk_')) &&
    /^[a-f0-9]{64}$/.test(key.slice(6))
  ) {
    return { valid: true }
  }
  return { valid: false }
}
