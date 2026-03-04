// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import { runPreflight } from '../../bootstrap/preflight.js'
import { logger } from '../../core/logger.js'

export const preflightCommand = new Command('preflight')
  .description('Run preflight checks (Node.js version, gateway connectivity)')
  .action(async () => {
    const ok = await runPreflight()
    if (!ok) {
      logger.error('Preflight checks failed.')
      process.exitCode = 1
    } else {
      logger.success('All preflight checks passed.')
    }
  })
