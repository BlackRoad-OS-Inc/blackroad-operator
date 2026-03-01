import { describe, it, expect } from 'vitest'
import {
  sha256,
  doubleSha256,
  hmacSha256,
  secureRandom,
  generateKey,
  fingerprint,
  createSovereignKey,
  generateKeyPair,
  deriveKey,
  deriveAgentKey,
  validateKeyFormat,
  genesisEntry,
  chainEntry,
  verifyChain,
} from '../../src/sovereign/keys.js'

describe('Sovereign Key System', () => {
  describe('sha256', () => {
    it('produces consistent hashes', () => {
      const hash1 = sha256('hello')
      const hash2 = sha256('hello')
      expect(hash1).toBe(hash2)
      expect(hash1).toHaveLength(64)
    })

    it('produces different hashes for different inputs', () => {
      expect(sha256('hello')).not.toBe(sha256('world'))
    })
  })

  describe('doubleSha256', () => {
    it('differs from single sha256', () => {
      expect(doubleSha256('test')).not.toBe(sha256('test'))
    })
  })

  describe('hmacSha256', () => {
    it('produces authenticated hashes', () => {
      const hmac = hmacSha256('data', 'secret')
      expect(hmac).toHaveLength(64)
      expect(hmacSha256('data', 'secret')).toBe(hmac)
      expect(hmacSha256('data', 'different')).not.toBe(hmac)
    })
  })

  describe('secureRandom', () => {
    it('generates unique random hex strings', () => {
      const r1 = secureRandom()
      const r2 = secureRandom()
      expect(r1).toHaveLength(64) // 32 bytes = 64 hex chars
      expect(r1).not.toBe(r2)
    })

    it('respects byte count', () => {
      expect(secureRandom(16)).toHaveLength(32) // 16 bytes = 32 hex
    })
  })

  describe('generateKey', () => {
    it('generates keys with correct prefixes', () => {
      expect(generateKey('pat')).toMatch(/^br_pat_[a-f0-9]{64}$/)
      expect(generateKey('api')).toMatch(/^br_api_[a-f0-9]{64}$/)
      expect(generateKey('agent')).toMatch(/^br_agt_[a-f0-9]{64}$/)
      expect(generateKey('memory')).toMatch(/^br_mem_[a-f0-9]{64}$/)
      expect(generateKey('session')).toMatch(/^br_ses_[a-f0-9]{64}$/)
      expect(generateKey('webhook')).toMatch(/^br_whk_[a-f0-9]{64}$/)
    })
  })

  describe('fingerprint', () => {
    it('generates consistent colon-separated fingerprints', () => {
      const key = generateKey('api')
      const fp = fingerprint(key)
      expect(fp).toMatch(/^[a-f0-9]{4}:[a-f0-9]{4}:[a-f0-9]{4}:[a-f0-9]{4}$/)
      expect(fingerprint(key)).toBe(fp) // consistent
    })
  })

  describe('createSovereignKey', () => {
    it('creates a full key object', () => {
      const key = createSovereignKey('pat', {
        scopes: ['read', 'write'],
        agent: 'LUCIDIA',
        expiresInDays: 30,
      })
      expect(key.id).toMatch(/^key_/)
      expect(key.key).toMatch(/^br_pat_/)
      expect(key.purpose).toBe('pat')
      expect(key.scopes).toEqual(['read', 'write'])
      expect(key.agent).toBe('LUCIDIA')
      expect(key.expires).not.toBeNull()
      expect(key.revoked).toBe(false)
    })

    it('creates keys without expiry', () => {
      const key = createSovereignKey('api')
      expect(key.expires).toBeNull()
      expect(key.scopes).toEqual(['*'])
    })
  })

  describe('generateKeyPair', () => {
    it('generates a public/secret key pair', () => {
      const pair = generateKeyPair()
      expect(pair.publicKey).toMatch(/^br_pk_[a-f0-9]{64}$/)
      expect(pair.secretKey).toMatch(/^br_sk_[a-f0-9]{64}$/)
      expect(pair.fingerprint).toMatch(/[a-f0-9]{4}:[a-f0-9]{4}/)
    })
  })

  describe('deriveKey', () => {
    it('derives deterministic keys from path', () => {
      const master = secureRandom(64)
      const derived1 = deriveKey(master, 'a/b/c')
      const derived2 = deriveKey(master, 'a/b/c')
      expect(derived1).toBe(derived2)
      expect(derived1).toMatch(/^br_dk_/)
    })

    it('different paths produce different keys', () => {
      const master = secureRandom(64)
      expect(deriveKey(master, 'a/b')).not.toBe(deriveKey(master, 'a/c'))
    })
  })

  describe('deriveAgentKey', () => {
    it('derives agent-specific keys', () => {
      const master = secureRandom(64)
      const key = deriveAgentKey(master, 'LUCIDIA', 'memory')
      expect(key).toMatch(/^br_dk_/)
    })
  })

  describe('validateKeyFormat', () => {
    it('validates correctly formatted keys', () => {
      expect(validateKeyFormat(generateKey('pat'))).toEqual({ valid: true, purpose: 'pat' })
      expect(validateKeyFormat(generateKey('api'))).toEqual({ valid: true, purpose: 'api' })
    })

    it('rejects malformed keys', () => {
      expect(validateKeyFormat('invalid')).toEqual({ valid: false })
      expect(validateKeyFormat('br_pat_tooshort')).toEqual({ valid: false })
    })

    it('validates derived keys', () => {
      const master = secureRandom(64)
      const derived = deriveKey(master, 'test')
      expect(validateKeyFormat(derived).valid).toBe(true)
    })
  })

  describe('Hash Chain (PS-SHA∞)', () => {
    it('creates genesis entry', () => {
      const genesis = genesisEntry('hello world')
      expect(genesis.index).toBe(0)
      expect(genesis.data).toBe('hello world')
      expect(genesis.previousHash).toBe('0'.repeat(64))
      expect(genesis.hash).toHaveLength(64)
    })

    it('chains entries together', () => {
      const genesis = genesisEntry('first')
      const second = chainEntry(genesis, 'second')
      expect(second.index).toBe(1)
      expect(second.previousHash).toBe(genesis.hash)
      expect(second.hash).not.toBe(genesis.hash)
    })

    it('verifies valid chain', () => {
      const genesis = genesisEntry('first')
      const second = chainEntry(genesis, 'second')
      const third = chainEntry(second, 'third')
      expect(verifyChain([genesis, second, third])).toEqual({ valid: true })
    })

    it('detects tampered chain', () => {
      const genesis = genesisEntry('first')
      const second = chainEntry(genesis, 'second')
      const tampered = { ...second, data: 'tampered!' }
      const result = verifyChain([genesis, tampered])
      expect(result.valid).toBe(false)
      expect(result.brokenAt).toBe(1)
    })

    it('detects broken parent reference', () => {
      const genesis = genesisEntry('first')
      const second = chainEntry(genesis, 'second')
      const broken = { ...second, previousHash: 'bad'.repeat(21) + 'a' }
      // Recalculate hash with broken parent
      const result = verifyChain([genesis, broken])
      expect(result.valid).toBe(false)
    })
  })
})
