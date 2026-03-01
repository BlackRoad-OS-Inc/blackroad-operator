// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import chalk from 'chalk'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const VALID_LOG_LEVELS: readonly LogLevel[] = ['debug', 'info', 'warn', 'error']

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

function parseLogLevel(raw: string | undefined): LogLevel {
  if (!raw) return 'info'
  const normalized = raw.trim().toLowerCase()
  if (VALID_LOG_LEVELS.includes(normalized as LogLevel)) {
    return normalized as LogLevel
  }
  console.warn(`[logger] Invalid BLACKROAD_LOG_LEVEL "${raw}", falling back to "info"`)
  return 'info'
}

let currentLevel: LogLevel = parseLogLevel(process.env['BLACKROAD_LOG_LEVEL'])

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[currentLevel]
}

export const logger = {
  setLevel(level: LogLevel) {
    currentLevel = level
  },
  getLevel(): LogLevel {
    return currentLevel
  },
  info(msg: string) {
    if (shouldLog('info')) console.log(chalk.cyan('ℹ'), msg)
  },
  success(msg: string) {
    if (shouldLog('info')) console.log(chalk.green('✓'), msg)
  },
  warn(msg: string) {
    if (shouldLog('warn')) console.log(chalk.yellow('⚠'), msg)
  },
  error(msg: string) {
    if (shouldLog('error')) console.error(chalk.red('✗'), msg)
  },
  debug(msg: string) {
    if (shouldLog('debug') || process.env['DEBUG']) {
      console.log(chalk.gray('⊙'), msg)
    }
  },
}
