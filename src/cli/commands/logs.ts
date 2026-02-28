// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import { GatewayClient } from '../../core/client.js'
import { logger } from '../../core/logger.js'

export const logsCommand = new Command('logs')
  .description('Fetch recent gateway logs')
  .option('-n <lines>', 'Number of lines', '50')
  .action(async (opts: { n: string }) => {
    const client = new GatewayClient()
    try {
      const data = await client.get<{ logs: string[] }>(
        `/v1/logs?limit=${opts.n}`,
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
