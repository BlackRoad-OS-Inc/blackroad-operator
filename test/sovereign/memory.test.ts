import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { SovereignMemory } from '../../src/sovereign/memory.js'
import { secureRandom } from '../../src/sovereign/keys.js'

describe('Sovereign Memory', () => {
  let tempDir: string
  let memory: SovereignMemory

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'br-test-'))
    memory = new SovereignMemory(tempDir, secureRandom(64))
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  describe('remember', () => {
    it('stores a memory entry', () => {
      const entry = memory.remember('The sky is blue', {
        type: 'fact',
        agent: 'LUCIDIA',
        tags: ['nature', 'observation'],
        confidence: 0.95,
      })
      expect(entry.id).toMatch(/^mem_/)
      expect(entry.content).toBe('The sky is blue')
      expect(entry.type).toBe('fact')
      expect(entry.agent).toBe('LUCIDIA')
      expect(entry.hash).toHaveLength(64)
      expect(entry.signature).toHaveLength(64)
    })

    it('builds a hash chain', () => {
      memory.remember('first')
      memory.remember('second')
      memory.remember('third')
      const result = memory.verify()
      expect(result.valid).toBe(true)
      expect(result.totalEntries).toBe(3)
    })
  })

  describe('recall', () => {
    it('searches by content', () => {
      memory.remember('The deployment uses Docker', { agent: 'ALICE' })
      memory.remember('The API runs on port 8421', { agent: 'OCTAVIA' })
      memory.remember('Docker containers need cleanup', { agent: 'ALICE' })

      const results = memory.recall('Docker')
      expect(results.length).toBe(2)
    })

    it('filters by agent', () => {
      memory.remember('Task A', { agent: 'LUCIDIA' })
      memory.remember('Task B', { agent: 'OCTAVIA' })

      const results = memory.recall('Task', { agent: 'LUCIDIA' })
      expect(results.length).toBe(1)
      expect(results[0].agent).toBe('LUCIDIA')
    })

    it('filters by type', () => {
      memory.remember('observed: it works', { type: 'observation' })
      memory.remember('fact: it is true', { type: 'fact' })

      const results = memory.recall('it', { type: 'fact' })
      expect(results.length).toBe(1)
      expect(results[0].type).toBe('fact')
    })

    it('excludes false memories', () => {
      memory.remember('This is true', { truthState: 1 })
      memory.remember('This is false', { truthState: -1 })

      const results = memory.recall('This is')
      expect(results.length).toBe(1)
      expect(results[0].truthState).toBe(1)
    })
  })

  describe('sessions', () => {
    it('starts and ends sessions', () => {
      const session = memory.startSession('test-session', 'LUCIDIA')
      expect(session.id).toMatch(/^ses_/)
      expect(session.name).toBe('test-session')
      expect(session.ended).toBeNull()

      const ended = memory.endSession(session.id)
      expect(ended?.ended).not.toBeNull()
    })

    it('returns null for unknown session', () => {
      expect(memory.endSession('fake-id')).toBeNull()
    })
  })

  describe('leaks', () => {
    it('creates cross-agent memory leaks', () => {
      const leak = memory.leak('LUCIDIA', 'OCTAVIA', 'shared deployment context')
      expect(leak.id).toMatch(/^leak_/)
      expect(leak.source).toBe('LUCIDIA')
      expect(leak.target).toBe('OCTAVIA')
      expect(leak.chain.length).toBe(3) // genesis + content + sealed
      expect(leak.signature).toHaveLength(64)
    })

    it('also stores leak as memory entry', () => {
      memory.leak('ALICE', 'CIPHER', 'security protocol update')
      const results = memory.recall('security protocol')
      expect(results.length).toBe(1)
      expect(results[0].type).toBe('leak')
    })

    it('lists all leaks', () => {
      memory.leak('A', 'B', 'first')
      memory.leak('B', 'C', 'second')
      expect(memory.leaks().length).toBe(2)
    })
  })

  describe('verify', () => {
    it('validates empty chain', () => {
      const result = memory.verify()
      expect(result.valid).toBe(true)
      expect(result.totalEntries).toBe(0)
    })

    it('validates chain after multiple entries', () => {
      for (let i = 0; i < 10; i++) {
        memory.remember(`entry ${i}`, { agent: `agent-${i % 3}` })
      }
      const result = memory.verify()
      expect(result.valid).toBe(true)
      expect(result.totalEntries).toBe(10)
    })
  })

  describe('stats', () => {
    it('returns correct statistics', () => {
      memory.remember('fact 1', { type: 'fact', agent: 'LUCIDIA' })
      memory.remember('obs 1', { type: 'observation', agent: 'OCTAVIA' })
      memory.remember('fact 2', { type: 'fact', agent: 'LUCIDIA' })
      memory.startSession('test', 'LUCIDIA')

      const stats = memory.stats()
      expect(stats.totalEntries).toBe(3)
      expect(stats.totalSessions).toBe(1)
      expect(stats.totalAgents).toContain('LUCIDIA')
      expect(stats.totalAgents).toContain('OCTAVIA')
      expect(stats.byType.fact).toBe(2)
      expect(stats.byType.observation).toBe(1)
      expect(stats.byAgent.LUCIDIA).toBe(2)
      expect(stats.integrityStatus).toBe('valid')
    })
  })

  describe('export', () => {
    it('exports complete memory bundle', () => {
      memory.remember('test entry')
      const bundle = memory.export()
      expect(bundle.version).toBe('1.0.0')
      expect(bundle.entries.length).toBe(1)
      expect(bundle.chain.length).toBe(1)
      expect(bundle.integrity.valid).toBe(true)
      expect(bundle.signature).toHaveLength(64)
    })
  })

  describe('persistence', () => {
    it('persists and reloads memory', () => {
      const masterKey = secureRandom(64)
      const mem1 = new SovereignMemory(tempDir, masterKey)
      mem1.remember('persistent memory')

      // Create new instance pointing to same dir
      const mem2 = new SovereignMemory(tempDir, masterKey)
      const results = mem2.recall('persistent')
      expect(results.length).toBe(1)
      expect(results[0].content).toBe('persistent memory')
    })
  })
})
