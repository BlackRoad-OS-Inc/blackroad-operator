// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import { logger } from '../../core/logger.js'

export const serveCommand = new Command('serve')
  .description('Start the BlackRoad Operator API server')
  .option('-p, --port <port>', 'Port to listen on', '8080')
  .option('--host <host>', 'Hostname to bind to', '0.0.0.0')
  .action(async (opts: { port: string; host: string }) => {
    process.env['PORT'] = opts.port
    process.env['HOST'] = opts.host
    logger.info(`Starting BlackRoad Operator API on ${opts.host}:${opts.port}...`)
    await import('../../server/start.js')
  })
