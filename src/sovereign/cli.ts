#!/usr/bin/env node
// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
// Sovereign CLI — manage keys, memory, and the API from the command line

import { join } from 'node:path'
import { homedir } from 'node:os'
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import {
  createSovereignKey,
  generateKeyPair,
  fingerprint,
  sha256,
  secureRandom,
  validateKeyFormat,
  deriveAgentKey,
  type KeyPurpose,
} from './keys.js'
import { SovereignMemory } from './memory.js'
import { createSovereignApi } from './api.js'

const args = process.argv.slice(2)
const command = args[0]
const subcommand = args[1]

const configDir = join(homedir(), '.blackroad', 'sovereign')
mkdirSync(configDir, { recursive: true })

function getMasterKey(): string {
  const keyFile = join(configDir, '.master.key')
  if (existsSync(keyFile)) {
    return readFileSync(keyFile, 'utf-8').trim()
  }
  const key = secureRandom(64)
  writeFileSync(keyFile, key, { mode: 0o400 })
  return key
}

function getMemory(): SovereignMemory {
  return new SovereignMemory(join(configDir, 'memory'), getMasterKey())
}

function printHelp(): void {
  console.log(`
BlackRoad Sovereign System — Your AI. Your Hardware. Your Rules.

USAGE:
  br-sovereign <command> [options]

COMMANDS:
  serve                    Start the Sovereign API server
  key gen <purpose>        Generate a sovereign key (pat|api|agent|memory|session|webhook)
  key pair                 Generate a public/secret key pair
  key validate <key>       Validate a key format
  key derive <agent> <purpose>  Derive an agent-specific key
  key fingerprint <key>    Get fingerprint for a key
  mem remember <content>   Store a memory
  mem recall <query>       Search memories
  mem stats                Memory statistics
  mem verify               Verify hash chain integrity
  mem leak <src> <dst> <content>  Create cross-agent memory leak
  mem leaks                List all memory leaks
  mem export               Export all memory
  session start <name>     Start a memory session
  session end <id>         End a memory session
  hash <data>              SHA-256 hash
  help                     Show this help
`)
}

async function main(): Promise<void> {
  switch (command) {
    case 'serve': {
      const api = createSovereignApi()
      api.start()
      break
    }

    case 'key': {
      switch (subcommand) {
        case 'gen': {
          const VALID_PURPOSES: KeyPurpose[] = ['pat', 'api', 'agent', 'memory', 'session', 'webhook']
          const purpose = args[2] ?? 'api'
          if (!VALID_PURPOSES.includes(purpose as KeyPurpose)) {
            console.error(`Invalid purpose "${purpose}". Allowed: ${VALID_PURPOSES.join(', ')}`)
            process.exit(1)
          }
          const key = createSovereignKey(purpose as KeyPurpose, {
            scopes: args[3] ? args[3].split(',') : ['*'],
            agent: args[4],
          })
          console.log(`\nSovereign Key Generated:`)
          console.log(`  ID:          ${key.id}`)
          console.log(`  Purpose:     ${key.purpose}`)
          console.log(`  Key:         ${key.key}`)
          console.log(`  Fingerprint: ${key.fingerprint}`)
          console.log(`  Scopes:      ${key.scopes.join(', ')}`)
          console.log(`  Created:     ${key.created}`)
          if (key.expires) console.log(`  Expires:     ${key.expires}`)
          console.log()
          break
        }
        case 'pair': {
          const pair = generateKeyPair()
          console.log(`\nKey Pair Generated:`)
          console.log(`  Public:      ${pair.publicKey}`)
          console.log(`  Secret:      ${pair.secretKey}`)
          console.log(`  Fingerprint: ${pair.fingerprint}`)
          console.log()
          break
        }
        case 'validate': {
          const key = args[2]
          if (!key) {
            console.log('Usage: br-sovereign key validate <key>')
            break
          }
          const result = validateKeyFormat(key)
          console.log(`\nKey Validation:`)
          console.log(`  Valid Format: ${result.valid}`)
          if (result.purpose) console.log(`  Purpose:      ${result.purpose}`)
          console.log(`  Fingerprint:  ${fingerprint(key)}`)
          console.log()
          break
        }
        case 'derive': {
          const agent = args[2]
          const purpose = (args[3] ?? 'agent') as KeyPurpose
          if (!agent) {
            console.log('Usage: br-sovereign key derive <agent> [purpose]')
            break
          }
          const derived = deriveAgentKey(getMasterKey(), agent, purpose)
          console.log(`\nDerived Key:`)
          console.log(`  Agent:       ${agent}`)
          console.log(`  Purpose:     ${purpose}`)
          console.log(`  Key:         ${derived}`)
          console.log(`  Fingerprint: ${fingerprint(derived)}`)
          console.log()
          break
        }
        case 'fingerprint': {
          const key = args[2]
          if (!key) {
            console.log('Usage: br-sovereign key fingerprint <key>')
            break
          }
          console.log(`Fingerprint: ${fingerprint(key)}`)
          break
        }
        default:
          console.log('Unknown key command. Use: gen, pair, validate, derive, fingerprint')
      }
      break
    }

    case 'mem': {
      const mem = getMemory()
      switch (subcommand) {
        case 'remember': {
          const content = args.slice(2).join(' ')
          if (!content) {
            console.log('Usage: br-sovereign mem remember <content>')
            break
          }
          const entry = mem.remember(content, { agent: 'cli' })
          console.log(`\nMemory Stored:`)
          console.log(`  ID:     ${entry.id}`)
          console.log(`  Hash:   ${entry.hash.slice(0, 16)}...`)
          console.log(`  Chain:  linked to parent ${entry.parentHash.slice(0, 16)}...`)
          console.log()
          break
        }
        case 'recall': {
          const query = args.slice(2).join(' ')
          if (!query) {
            console.log('Usage: br-sovereign mem recall <query>')
            break
          }
          const results = mem.recall(query)
          console.log(`\nRecall Results (${results.length}):`)
          for (const r of results) {
            console.log(`  [${r.type}] ${r.content.slice(0, 80)} (${r.agent}, confidence: ${r.confidence})`)
          }
          console.log()
          break
        }
        case 'stats': {
          const stats = mem.stats()
          console.log(`\nMemory Statistics:`)
          console.log(`  Total Entries:  ${stats.totalEntries}`)
          console.log(`  Total Sessions: ${stats.totalSessions}`)
          console.log(`  Chain Length:   ${stats.chainLength}`)
          console.log(`  Integrity:     ${stats.integrityStatus.toUpperCase()}`)
          console.log(`  Agents:        ${stats.totalAgents.join(', ') || 'none'}`)
          if (stats.oldestEntry) console.log(`  Oldest:        ${stats.oldestEntry}`)
          if (stats.newestEntry) console.log(`  Newest:        ${stats.newestEntry}`)
          console.log(`  By Type:`)
          for (const [type, count] of Object.entries(stats.byType)) {
            console.log(`    ${type}: ${count}`)
          }
          console.log()
          break
        }
        case 'verify': {
          const result = mem.verify()
          console.log(`\nChain Verification:`)
          console.log(`  Status:  ${result.valid ? 'INTACT' : 'BROKEN'}`)
          console.log(`  Entries: ${result.totalEntries}`)
          if (result.brokenAt !== undefined) {
            console.log(`  Broken At: entry #${result.brokenAt}`)
          }
          console.log()
          break
        }
        case 'leak': {
          const source = args[2]
          const target = args[3]
          const content = args.slice(4).join(' ')
          if (!source || !target || !content) {
            console.log('Usage: br-sovereign mem leak <source> <target> <content>')
            break
          }
          const leak = mem.leak(source, target, content)
          console.log(`\nMemory Leak Created:`)
          console.log(`  ID:        ${leak.id}`)
          console.log(`  Source:    ${leak.source}`)
          console.log(`  Target:    ${leak.target}`)
          console.log(`  Chain:     ${leak.chain.length} entries`)
          console.log(`  Signature: ${leak.signature.slice(0, 24)}...`)
          console.log()
          break
        }
        case 'leaks': {
          const leaks = mem.leaks()
          console.log(`\nMemory Leaks (${leaks.length}):`)
          for (const l of leaks) {
            console.log(`  [${l.id}] ${l.source} → ${l.target}: ${l.content.slice(0, 60)}`)
          }
          console.log()
          break
        }
        case 'export': {
          const bundle = mem.export()
          console.log(JSON.stringify(bundle, null, 2))
          break
        }
        default:
          console.log('Unknown mem command. Use: remember, recall, stats, verify, leak, leaks, export')
      }
      break
    }

    case 'session': {
      const mem = getMemory()
      switch (subcommand) {
        case 'start': {
          const name = args[2] ?? 'unnamed'
          const agent = args[3] ?? 'cli'
          const session = mem.startSession(name, agent)
          console.log(`\nSession Started:`)
          console.log(`  ID:    ${session.id}`)
          console.log(`  Name:  ${session.name}`)
          console.log(`  Agent: ${session.agent}`)
          console.log()
          break
        }
        case 'end': {
          const id = args[2]
          if (!id) {
            console.log('Usage: br-sovereign session end <id>')
            break
          }
          const session = mem.endSession(id)
          if (session) {
            console.log(`\nSession Ended: ${session.id}`)
          } else {
            console.log(`\nSession not found: ${id}`)
          }
          console.log()
          break
        }
        default:
          console.log('Unknown session command. Use: start, end')
      }
      break
    }

    case 'hash': {
      const data = args.slice(1).join(' ')
      if (!data) {
        console.log('Usage: br-sovereign hash <data>')
        break
      }
      console.log(sha256(data))
      break
    }

    case 'help':
    default:
      printHelp()
  }
}

main().catch(console.error)
