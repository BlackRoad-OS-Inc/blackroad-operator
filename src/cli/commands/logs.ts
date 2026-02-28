// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import { GatewayClient } from '../../core/client.js'
import { logger } from '../../core/logger.js'

export const logsCommand = new Command('logs')
  .description('Fetch recent gateway logs')
  .option('-n <lines>', 'Number of lines', '50')
  .action(async (opts: { n: string }) => {
    const client = new GatewayClient()
    const DEFAULT_LIMIT = 50
    const MAX_LIMIT = 1000
    let limit = parseInt(opts.n, 10)
    if (!Number.isFinite(limit) || limit < 1) limit = DEFAULT_LIMIT
    if (limit > MAX_LIMIT) limit = MAX_LIMIT
    try {
      const url = new URL('/v1/logs', 'http://placeholder')
      url.searchParams.set('limit', String(limit))
      const data = await client.get<{ logs: string[] }>(
        `${url.pathname}?${url.searchParams.toString()}`,
      )
      if (data.logs.length === 0) {
        logger.info('No logs available.')
        return
      }
      for (const line of data.logs) {
        console.log(line)
      }
    } catch (err) {
      logger.warn('Could not fetch logs from gateway.')
      logger.info('Use "wrangler tail" or "railway logs" for live log streams.')
      logger.debug(err instanceof Error ? err.message : String(err))
    }
  })
