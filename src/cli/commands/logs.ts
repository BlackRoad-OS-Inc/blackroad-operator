// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import { createReadStream } from 'node:fs'
import { access } from 'node:fs/promises'
import { createInterface } from 'node:readline'
import { logger } from '../../core/logger.js'

const DEFAULT_LOG_PATH = 'blackroad-core/gateway/logs/gateway.jsonl'

export const logsCommand = new Command('logs')
  .description('Tail gateway logs')
  .option('-n <lines>', 'Number of lines', '50')
  .option('-f, --file <path>', 'Log file path', DEFAULT_LOG_PATH)
  .option('--json', 'Output raw JSON lines')
  .action(async (opts: { n: string; file: string; json?: boolean }) => {
    const count = parseInt(opts.n, 10)
    if (isNaN(count) || count <= 0) {
      logger.error('Line count must be a positive integer.')
      process.exitCode = 1
      return
    }

    try {
      await access(opts.file)
    } catch {
      logger.warn(`Log file not found: ${opts.file}`)
      logger.info('Gateway may not have written any logs yet.')
      return
    }

    const lines: string[] = []
    const rl = createInterface({
      input: createReadStream(opts.file, 'utf-8'),
      crlfDelay: Infinity,
    })

    for await (const line of rl) {
      lines.push(line)
      if (lines.length > count) lines.shift()
    }

    for (const line of lines) {
      if (opts.json) {
        console.log(line)
      } else {
        try {
          const entry = JSON.parse(line) as {
            timestamp: string
            agent: string
            status: string
            intent: string
          }
          const status =
            entry.status === 'ok' ? '\x1b[32mOK\x1b[0m' : '\x1b[31mERR\x1b[0m'
          console.log(
            `${entry.timestamp} [${status}] ${entry.agent ?? '-'} ${entry.intent ?? '-'}`,
          )
        } catch {
          console.log(line)
        }
      }
    }
  })
