// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import { GatewayClient } from '../../core/client.js'
import { logger } from '../../core/logger.js'
import { GatewayUnreachableError, formatError } from '../../core/errors.js'

export const statusCommand = new Command('status')
  .description('Show system status')
  .action(async () => {
    const client = new GatewayClient()
    try {
      const health = await client.get<{
        status: string
        version: string
        uptime: number
      }>('/v1/health')
      logger.success(
        `Gateway: ${health.status} (v${health.version}, uptime: ${Math.round(health.uptime)}s)`,
      )
      const agents = await client.get<{ agents: unknown[] }>('/v1/agents')
      logger.info(`Agents: ${agents.agents.length} registered`)
    } catch (error) {
      if (error instanceof GatewayUnreachableError) {
        logger.error('Gateway unreachable. Is the gateway running?')
        logger.info(`Tried: ${error.url}`)
      } else {
        logger.error(formatError(error))
      }
      process.exitCode = 1
    }
  })
