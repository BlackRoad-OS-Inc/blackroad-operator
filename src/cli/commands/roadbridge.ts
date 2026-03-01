// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import { logger } from '../../core/logger.js'

const ROADBRIDGE_URL =
  process.env['ROADBRIDGE_URL'] || 'https://roadbridge.blackroad.io'

async function fetchJson(path: string) {
  const res = await fetch(`${ROADBRIDGE_URL}${path}`)
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`)
  }
  return res.json()
}

export const roadbridgeCommand = new Command('roadbridge')
  .alias('rb')
  .description('roadbridge GitHub ↔ Drive sync engine')

// br roadbridge status
roadbridgeCommand
  .command('status')
  .description('Show roadbridge service status')
  .action(async () => {
    try {
      const data = (await fetchJson('/status')) as {
        ok: boolean
        service: string
        version: string
        witness: { entries: number }
        configured: Record<string, boolean>
        ts: string
      }
      logger.success(`${data.service} v${data.version}`)
      logger.info(`Witness entries: ${data.witness.entries}`)
      logger.info(`GitHub webhook: ${data.configured.github_webhook ? 'configured' : 'not configured'}`)
      logger.info(`GitHub App: ${data.configured.github_app ? 'configured' : 'not configured'}`)
      logger.info(`Drive channel: ${data.configured.drive_channel ? 'configured' : 'not configured'}`)
      logger.info(`Last checked: ${data.ts}`)
    } catch (err) {
      logger.error(
        `roadbridge unreachable at ${ROADBRIDGE_URL}: ${err instanceof Error ? err.message : err}`,
      )
    }
  })

// br roadbridge ledger [date]
roadbridgeCommand
  .command('ledger [date]')
  .description('View roadchain witness ledger (default: today)')
  .action(async (date?: string) => {
    try {
      const path = date ? `/ledger/${date}` : '/ledger'
      const data = (await fetchJson(path)) as {
        ok: boolean
        date: string
        count: number
        entries: Array<{
          id: string
          timestamp: number
          eventType: string
          artifactType: string
          direction: string
          status: string
          hash: string
        }>
      }
      logger.info(`Ledger for ${data.date}: ${data.count} entries`)
      if (data.entries.length === 0) {
        logger.info('No entries found.')
        return
      }
      for (const entry of data.entries) {
        const time = new Date(entry.timestamp).toLocaleTimeString()
        const icon = entry.status === 'success' ? '\u2713' : '\u2717'
        const dir =
          entry.direction === 'github_to_drive' ? 'GH\u2192Drive' : 'Drive\u2192GH'
        console.log(
          `  ${icon} [${time}] ${entry.eventType} | ${entry.artifactType} | ${dir} | ${entry.hash}`,
        )
      }
    } catch (err) {
      logger.error(`Failed to fetch ledger: ${err instanceof Error ? err.message : err}`)
    }
  })

// br roadbridge verify <id>
roadbridgeCommand
  .command('verify <id>')
  .description('Verify integrity of a roadchain witness entry')
  .action(async (id: string) => {
    try {
      const data = (await fetchJson(`/ledger/verify/${id}`)) as {
        ok: boolean
        id: string
        hash: string
        prevHash: string
        integrity: string
        verified: boolean
      }
      if (data.verified) {
        logger.success(`Entry ${data.id}: integrity VERIFIED`)
        logger.info(`Hash: ${data.hash}`)
        logger.info(`Prev: ${data.prevHash}`)
      } else {
        logger.error(`Entry ${data.id}: integrity CORRUPTED`)
        logger.warn('This entry may have been tampered with.')
      }
    } catch (err) {
      logger.error(`Verification failed: ${err instanceof Error ? err.message : err}`)
    }
  })

// br roadbridge entry <id>
roadbridgeCommand
  .command('entry <id>')
  .description('View a specific witness entry')
  .action(async (id: string) => {
    try {
      const data = (await fetchJson(`/ledger/entry/${id}`)) as {
        ok: boolean
        entry: Record<string, unknown>
      }
      console.log(JSON.stringify(data.entry, null, 2))
    } catch (err) {
      logger.error(`Failed to fetch entry: ${err instanceof Error ? err.message : err}`)
    }
  })
