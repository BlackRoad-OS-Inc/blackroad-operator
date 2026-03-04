// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import { GatewayClient } from '../../core/client.js'
import { logger } from '../../core/logger.js'
import { formatError } from '../../core/errors.js'
import { createSpinner } from '../../core/spinner.js'

export const invokeCommand = new Command('invoke')
  .description('Invoke an agent with a task')
  .argument('<agent>', 'Agent name')
  .argument('<task>', 'Task description')
  .option('--timeout <ms>', 'Request timeout in milliseconds', '30000')
  .action(async (agent: string, task: string, opts: { timeout: string }) => {
    const timeoutMs = parseInt(opts.timeout, 10)
    if (isNaN(timeoutMs) || timeoutMs <= 0) {
      logger.error('Timeout must be a positive integer.')
      process.exitCode = 1
      return
    }

    const client = new GatewayClient({ timeoutMs })
    const spinner = createSpinner(`Invoking ${agent}...`)
    spinner.start()
    try {
      const result = await client.post<{ content: string }>('/v1/invoke', {
        agent,
        task,
      })
      spinner.stop()
      console.log(result.content)
    } catch (error) {
      spinner.stop()
      logger.error(formatError(error))
      process.exitCode = 1
    }
  })
