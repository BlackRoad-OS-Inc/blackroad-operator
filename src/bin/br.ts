#!/usr/bin/env node
// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { program } from '../cli/commands/index.js'
import { formatError, OperatorError } from '../core/errors.js'
import { logger } from '../core/logger.js'

process.on('SIGINT', () => {
  process.exit(130)
})

process.on('SIGTERM', () => {
  process.exit(143)
})

process.on('uncaughtException', (error) => {
  logger.error(formatError(error))
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  logger.error(formatError(reason))
  process.exit(1)
})

program.exitOverride()

try {
  await program.parseAsync()
} catch (error) {
  if (error instanceof OperatorError) {
    logger.error(formatError(error))
    process.exit(1)
  }
  // Commander exit overrides throw on --help / --version — exit cleanly
  const code =
    error && typeof error === 'object' && 'exitCode' in error
      ? (error.exitCode as number)
      : 1
  process.exit(code)
}
