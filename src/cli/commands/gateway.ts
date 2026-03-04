// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import { GatewayClient } from '../../core/client.js'
import { logger } from '../../core/logger.js'
import { formatError } from '../../core/errors.js'

export const gatewayCommand = new Command('gateway').description(
  'Gateway management',
)

gatewayCommand
  .command('health')
  .description('Check gateway health')
  .action(async () => {
    const client = new GatewayClient()
    try {
      const health = await client.get<{ status: string; version: string }>(
        '/v1/health',
      )
      logger.success(`Gateway is ${health.status} (v${health.version})`)
    } catch (error) {
      logger.error(formatError(error))
      process.exitCode = 1
    }
  })

gatewayCommand
  .command('url')
  .description('Show gateway URL')
  .action(() => {
    const client = new GatewayClient()
    console.log(client.baseUrl)
  })

gatewayCommand
  .command('metrics')
  .description('Show gateway metrics')
  .action(async () => {
    const client = new GatewayClient()
    try {
      const data = await client.get<{
        metrics: {
          uptime_seconds: number
          total_requests: number
          total_ok: number
          total_errors: number
        }
      }>('/metrics')
      const m = data.metrics
      logger.info(`Uptime: ${m.uptime_seconds}s`)
      logger.info(
        `Requests: ${m.total_requests} (ok: ${m.total_ok}, errors: ${m.total_errors})`,
      )
    } catch (error) {
      logger.error(formatError(error))
      process.exitCode = 1
    }
  })
