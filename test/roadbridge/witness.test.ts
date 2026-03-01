// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect, beforeEach } from 'vitest'
import {
  witness,
  getEntry,
  getEntriesByDate,
  getEntryCount,
  verifyEntry,
  hashPayload,
} from '../../workers/roadbridge/src/witness.js'

/**
 * In-memory KV mock that implements the Cloudflare KV interface
 * subset used by the witness module.
 */
function createMockKV(): Record<string, string> & {
  get: (key: string) => Promise<string | null>
  put: (key: string, value: string, opts?: { expirationTtl?: number }) => Promise<void>
} {
  const store: Record<string, string> = {}
  return Object.assign(store, {
    async get(key: string) {
      return store[key] ?? null
    },
    async put(key: string, value: string) {
      store[key] = value
    },
  })
}

describe('witness', () => {
  let kv: ReturnType<typeof createMockKV>

  beforeEach(() => {
    kv = createMockKV()
  })

  it('should create a witness entry with all required fields', async () => {
    const entry = await witness(kv, {
      eventType: 'github.release',
      artifactType: 'release_artifact',
      direction: 'github_to_drive',
      source: 'BlackRoad-OS/core@v1.0.0',
      destination: '/releases/core/v1.0.0/',
      payloadHash: 'abc123',
      status: 'success',
    })

    expect(entry.id).toMatch(/^rb-\d+-[a-f0-9]+$/)
    expect(entry.hash).toBeTruthy()
    expect(entry.prevHash).toBeTruthy()
    expect(entry.timestamp).toBeGreaterThan(0)
    expect(entry.eventType).toBe('github.release')
    expect(entry.artifactType).toBe('release_artifact')
    expect(entry.direction).toBe('github_to_drive')
    expect(entry.status).toBe('success')
    expect(entry.error).toBeNull()
  })

  it('should chain entries via prevHash', async () => {
    const first = await witness(kv, {
      eventType: 'test.first',
      artifactType: 'unknown',
      direction: 'github_to_drive',
      source: 'test',
      destination: 'test',
      payloadHash: 'hash1',
      status: 'success',
    })

    const second = await witness(kv, {
      eventType: 'test.second',
      artifactType: 'unknown',
      direction: 'github_to_drive',
      source: 'test',
      destination: 'test',
      payloadHash: 'hash2',
      status: 'success',
    })

    expect(second.prevHash).toBe(first.hash)
  })

  it('should record failure entries with error messages', async () => {
    const entry = await witness(kv, {
      eventType: 'github.push',
      artifactType: 'memory_journal',
      direction: 'github_to_drive',
      source: 'lucidia/memory@abc123',
      destination: '/lucidia/journals/',
      payloadHash: 'xyz789',
      status: 'failure',
      error: 'Drive API quota exceeded',
    })

    expect(entry.status).toBe('failure')
    expect(entry.error).toBe('Drive API quota exceeded')
  })

  it('should increment entry count', async () => {
    expect(await getEntryCount(kv)).toBe(0)

    await witness(kv, {
      eventType: 'test',
      artifactType: 'unknown',
      direction: 'github_to_drive',
      source: 'test',
      destination: 'test',
      payloadHash: 'h1',
      status: 'success',
    })
    expect(await getEntryCount(kv)).toBe(1)

    await witness(kv, {
      eventType: 'test',
      artifactType: 'unknown',
      direction: 'github_to_drive',
      source: 'test',
      destination: 'test',
      payloadHash: 'h2',
      status: 'success',
    })
    expect(await getEntryCount(kv)).toBe(2)
  })
})

describe('getEntry', () => {
  it('should retrieve a stored entry by ID', async () => {
    const kv = createMockKV()
    const created = await witness(kv, {
      eventType: 'test',
      artifactType: 'release_artifact',
      direction: 'github_to_drive',
      source: 'test-repo',
      destination: '/releases/',
      payloadHash: 'abc',
      status: 'success',
    })

    const retrieved = await getEntry(kv, created.id)
    expect(retrieved).not.toBeNull()
    expect(retrieved!.id).toBe(created.id)
    expect(retrieved!.hash).toBe(created.hash)
  })

  it('should return null for non-existent entry', async () => {
    const kv = createMockKV()
    const result = await getEntry(kv, 'rb-nonexistent')
    expect(result).toBeNull()
  })
})

describe('getEntriesByDate', () => {
  it('should return entries for a given date', async () => {
    const kv = createMockKV()
    const today = new Date().toISOString().split('T')[0]

    await witness(kv, {
      eventType: 'test.1',
      artifactType: 'unknown',
      direction: 'github_to_drive',
      source: 'a',
      destination: 'b',
      payloadHash: 'h1',
      status: 'success',
    })
    await witness(kv, {
      eventType: 'test.2',
      artifactType: 'unknown',
      direction: 'drive_to_github',
      source: 'c',
      destination: 'd',
      payloadHash: 'h2',
      status: 'success',
    })

    const entries = await getEntriesByDate(kv, today)
    expect(entries).toHaveLength(2)
  })

  it('should return empty for date with no entries', async () => {
    const kv = createMockKV()
    const entries = await getEntriesByDate(kv, '2020-01-01')
    expect(entries).toHaveLength(0)
  })
})

describe('verifyEntry', () => {
  it('should verify a valid entry', async () => {
    const kv = createMockKV()
    const entry = await witness(kv, {
      eventType: 'test',
      artifactType: 'unknown',
      direction: 'github_to_drive',
      source: 'a',
      destination: 'b',
      payloadHash: 'h',
      status: 'success',
    })

    const valid = await verifyEntry(entry)
    expect(valid).toBe(true)
  })

  it('should detect tampered entries', async () => {
    const kv = createMockKV()
    const entry = await witness(kv, {
      eventType: 'test',
      artifactType: 'unknown',
      direction: 'github_to_drive',
      source: 'a',
      destination: 'b',
      payloadHash: 'h',
      status: 'success',
    })

    // Tamper with the entry
    const tampered = { ...entry, status: 'failure' }
    const valid = await verifyEntry(tampered)
    expect(valid).toBe(false)
  })
})

describe('hashPayload', () => {
  it('should produce consistent SHA-256 hashes', async () => {
    const hash1 = await hashPayload('hello world')
    const hash2 = await hashPayload('hello world')
    expect(hash1).toBe(hash2)
    expect(hash1).toHaveLength(64) // 32 bytes as hex
  })

  it('should produce different hashes for different inputs', async () => {
    const hash1 = await hashPayload('payload-a')
    const hash2 = await hashPayload('payload-b')
    expect(hash1).not.toBe(hash2)
  })
})
