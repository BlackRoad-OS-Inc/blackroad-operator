// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import chalk from 'chalk'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const DEFAULT_LOG_LEVEL: LogLevel = 'info'
const VALID_LOG_LEVELS: readonly LogLevel[] = ['debug', 'info', 'warn', 'error']

function isValidLogLevel(value: string): value is LogLevel {
  return (VALID_LOG_LEVELS as readonly string[]).includes(value)
}

let warnedInvalidEnvLevel = false

function getInitialLogLevel(): LogLevel {
  const raw = process.env['BLACKROAD_LOG_LEVEL']
  if (!raw) {
    return DEFAULT_LOG_LEVEL
  }

  const normalized = raw.trim().toLowerCase()
  if (isValidLogLevel(normalized)) {
    return normalized
  }

  if (!warnedInvalidEnvLevel) {
    warnedInvalidEnvLevel = true
    console.warn(
      chalk.yellow('⚠'),
      `Invalid BLACKROAD_LOG_LEVEL "${raw}", falling back to "${DEFAULT_LOG_LEVEL}". Valid levels: ${VALID_LOG_LEVELS.join(
        ', ',
      )}.`,
    )
  }

  return DEFAULT_LOG_LEVEL
}

let currentLevel: LogLevel = getInitialLogLevel()
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
