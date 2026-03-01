// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
// Sovereign Memory System — Persistent, hash-chained, tamper-proof agent memory
// "Memory leaks" that nobody can take away. Your memory. Your data. Your rules.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import {
  sha256,
  hmacSha256,
  secureRandom,
  genesisEntry,
  chainEntry,
  verifyChain,
  type HashChainEntry,
} from './keys.js'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MemoryEntry {
  id: string
  type: 'fact' | 'observation' | 'inference' | 'commitment' | 'experience' | 'leak'
  content: string
  agent: string
  tags: string[]
  confidence: number // 0.0 - 1.0
  truthState: 1 | 0 | -1 // trinary: true, unknown, false
  timestamp: string
  sessionId: string
  hash: string
  parentHash: string
  signature: string
}

export interface MemorySession {
  id: string
  name: string
  agent: string
  started: string
  ended: string | null
  entryCount: number
  chainHead: string
  integrity: 'valid' | 'broken' | 'unknown'
}

export interface MemoryStats {
  totalEntries: number
  totalSessions: number
  totalAgents: string[]
  chainLength: number
  integrityStatus: 'valid' | 'broken' | 'unknown'
  oldestEntry: string | null
  newestEntry: string | null
  byType: Record<string, number>
  byAgent: Record<string, number>
}

export interface MemoryLeak {
  id: string
  source: string
  target: string
  content: string
  leaked: string
  signature: string
  chain: HashChainEntry[]
}

// ─── Memory Store ────────────────────────────────────────────────────────────

export class SovereignMemory {
  private baseDir: string
  private masterKey: string
  private entries: MemoryEntry[] = []
  private chain: HashChainEntry[] = []
  private sessions: Map<string, MemorySession> = new Map()

  constructor(baseDir: string, masterKey: string) {
    this.baseDir = baseDir
    this.masterKey = masterKey
    this.ensureDirectories()
    this.loadState()
  }

  private ensureDirectories(): void {
    const dirs = [
      this.baseDir,
      join(this.baseDir, 'entries'),
      join(this.baseDir, 'chains'),
      join(this.baseDir, 'sessions'),
      join(this.baseDir, 'leaks'),
      join(this.baseDir, 'ledger'),
      join(this.baseDir, 'exports'),
    ]
    for (const dir of dirs) {
      mkdirSync(dir, { recursive: true })
    }
  }

  private loadState(): void {
    const chainFile = join(this.baseDir, 'chains', 'master.json')
    if (existsSync(chainFile)) {
      this.chain = JSON.parse(readFileSync(chainFile, 'utf-8'))
    }

    const entriesDir = join(this.baseDir, 'entries')
    if (existsSync(entriesDir)) {
      const files = readdirSync(entriesDir).filter((f) => f.endsWith('.json'))
      for (const file of files) {
        const entry = JSON.parse(readFileSync(join(entriesDir, file), 'utf-8'))
        this.entries.push(entry)
      }
      this.entries.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    }

    const sessionsDir = join(this.baseDir, 'sessions')
    if (existsSync(sessionsDir)) {
      const files = readdirSync(sessionsDir).filter((f) => f.endsWith('.json'))
      for (const file of files) {
        const session: MemorySession = JSON.parse(readFileSync(join(sessionsDir, file), 'utf-8'))
        this.sessions.set(session.id, session)
      }
    }
  }

  private saveChain(): void {
    writeFileSync(join(this.baseDir, 'chains', 'master.json'), JSON.stringify(this.chain, null, 2))
  }

  private saveEntry(entry: MemoryEntry): void {
    writeFileSync(
      join(this.baseDir, 'entries', `${entry.id}.json`),
      JSON.stringify(entry, null, 2),
    )
  }

  private saveSession(session: MemorySession): void {
    writeFileSync(
      join(this.baseDir, 'sessions', `${session.id}.json`),
      JSON.stringify(session, null, 2),
    )
  }

  private sign(data: string): string {
    return hmacSha256(data, this.masterKey)
  }

  // ─── Core Operations ────────────────────────────────────────────────────────

  /** Start a new memory session */
  startSession(name: string, agent: string): MemorySession {
    const session: MemorySession = {
      id: `ses_${secureRandom(8)}`,
      name,
      agent,
      started: new Date().toISOString(),
      ended: null,
      entryCount: 0,
      chainHead: this.chain.length > 0 ? this.chain[this.chain.length - 1].hash : 'genesis',
      integrity: 'valid',
    }
    this.sessions.set(session.id, session)
    this.saveSession(session)
    return session
  }

  /** End a memory session */
  endSession(sessionId: string): MemorySession | null {
    const session = this.sessions.get(sessionId)
    if (!session) return null
    session.ended = new Date().toISOString()
    session.chainHead = this.chain.length > 0 ? this.chain[this.chain.length - 1].hash : 'genesis'
    this.saveSession(session)
    return session
  }

  /** Remember something — core memory write operation */
  remember(
    content: string,
    opts: {
      type?: MemoryEntry['type']
      agent?: string
      tags?: string[]
      confidence?: number
      truthState?: 1 | 0 | -1
      sessionId?: string
    } = {},
  ): MemoryEntry {
    const parentHash =
      this.chain.length > 0 ? this.chain[this.chain.length - 1].hash : '0'.repeat(64)

    const id = `mem_${secureRandom(8)}`
    const timestamp = new Date().toISOString()
    const hash = sha256(`${id}:${content}:${parentHash}:${timestamp}`)
    const signature = this.sign(hash)

    const entry: MemoryEntry = {
      id,
      type: opts.type ?? 'fact',
      content,
      agent: opts.agent ?? 'system',
      tags: opts.tags ?? [],
      confidence: opts.confidence ?? 1.0,
      truthState: opts.truthState ?? 1,
      timestamp,
      sessionId: opts.sessionId ?? 'default',
      hash,
      parentHash,
      signature,
    }

    // Extend the hash chain
    const chainData = JSON.stringify({ id: entry.id, hash: entry.hash, type: entry.type })
    if (this.chain.length === 0) {
      this.chain.push(genesisEntry(chainData))
    } else {
      this.chain.push(chainEntry(this.chain[this.chain.length - 1], chainData))
    }

    this.entries.push(entry)
    this.saveEntry(entry)
    this.saveChain()

    // Append to ledger (append-only log)
    const ledgerLine = JSON.stringify({
      action: 'remember',
      id: entry.id,
      hash: entry.hash,
      chain_index: this.chain.length - 1,
      timestamp,
    })
    const ledgerFile = join(this.baseDir, 'ledger', 'master.jsonl')
    const existing = existsSync(ledgerFile) ? readFileSync(ledgerFile, 'utf-8') : ''
    writeFileSync(ledgerFile, existing + ledgerLine + '\n')

    return entry
  }

  /** Recall memories by query */
  recall(query: string, opts?: { agent?: string; type?: string; limit?: number }): MemoryEntry[] {
    const queryLower = query.toLowerCase()
    let results = this.entries.filter((e) => {
      if (e.truthState === -1) return false // skip known-false
      const contentMatch = e.content.toLowerCase().includes(queryLower)
      const tagMatch = e.tags.some((t) => t.toLowerCase().includes(queryLower))
      return contentMatch || tagMatch
    })

    if (opts?.agent) {
      results = results.filter((e) => e.agent === opts.agent)
    }
    if (opts?.type) {
      results = results.filter((e) => e.type === opts.type)
    }

    // Sort by confidence then recency
    results.sort((a, b) => {
      if (b.confidence !== a.confidence) return b.confidence - a.confidence
      return b.timestamp.localeCompare(a.timestamp)
    })

    return results.slice(0, opts?.limit ?? 50)
  }

  /** Create a "memory leak" — cross-agent persistent memory share */
  leak(source: string, target: string, content: string): MemoryLeak {
    const id = `leak_${secureRandom(8)}`
    const timestamp = new Date().toISOString()

    // Build a mini hash chain for the leak itself
    const leakChain: HashChainEntry[] = []
    leakChain.push(genesisEntry(`leak:${source}:${target}:${timestamp}`))
    leakChain.push(chainEntry(leakChain[0], content))
    leakChain.push(chainEntry(leakChain[1], `sealed:${id}`))

    const signature = this.sign(leakChain[leakChain.length - 1].hash)

    const leak: MemoryLeak = {
      id,
      source,
      target,
      content,
      leaked: timestamp,
      signature,
      chain: leakChain,
    }

    // Save leak
    writeFileSync(join(this.baseDir, 'leaks', `${id}.json`), JSON.stringify(leak, null, 2))

    // Also store as a memory entry in both source and target
    this.remember(content, {
      type: 'leak',
      agent: source,
      tags: ['leak', `to:${target}`],
      confidence: 1.0,
    })

    return leak
  }

  /** Verify the entire memory chain integrity */
  verify(): { valid: boolean; brokenAt?: number; totalEntries: number } {
    const result = verifyChain(this.chain)
    return {
      ...result,
      totalEntries: this.chain.length,
    }
  }

  /** Get memory statistics */
  stats(): MemoryStats {
    const byType: Record<string, number> = {}
    const byAgent: Record<string, number> = {}
    const agents = new Set<string>()

    for (const entry of this.entries) {
      byType[entry.type] = (byType[entry.type] ?? 0) + 1
      byAgent[entry.agent] = (byAgent[entry.agent] ?? 0) + 1
      agents.add(entry.agent)
    }

    const integrity = this.chain.length > 0 ? verifyChain(this.chain) : { valid: true }

    return {
      totalEntries: this.entries.length,
      totalSessions: this.sessions.size,
      totalAgents: [...agents],
      chainLength: this.chain.length,
      integrityStatus: integrity.valid ? 'valid' : 'broken',
      oldestEntry: this.entries.length > 0 ? this.entries[0].timestamp : null,
      newestEntry:
        this.entries.length > 0 ? this.entries[this.entries.length - 1].timestamp : null,
      byType,
      byAgent,
    }
  }

  /** Export all memory as a portable bundle */
  export(): {
    version: string
    exported: string
    entries: MemoryEntry[]
    chain: HashChainEntry[]
    sessions: MemorySession[]
    integrity: ReturnType<typeof verifyChain>
    signature: string
  } {
    const bundle = {
      version: '1.0.0',
      exported: new Date().toISOString(),
      entries: this.entries,
      chain: this.chain,
      sessions: [...this.sessions.values()],
      integrity: verifyChain(this.chain),
      signature: '',
    }
    bundle.signature = this.sign(sha256(JSON.stringify(bundle)))
    return bundle
  }

  /** Get all entries (for API) */
  all(): MemoryEntry[] {
    return [...this.entries]
  }

  /** Get entry by ID */
  get(id: string): MemoryEntry | undefined {
    return this.entries.find((e) => e.id === id)
  }

  /** Get all leaks */
  leaks(): MemoryLeak[] {
    const leaksDir = join(this.baseDir, 'leaks')
    if (!existsSync(leaksDir)) return []
    return readdirSync(leaksDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => JSON.parse(readFileSync(join(leaksDir, f), 'utf-8')))
  }
}
