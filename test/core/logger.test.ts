// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger } from '../../src/core/logger.js'

describe('logger', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>
  let consoleErrSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
    consoleErrSpy.mockRestore()
    delete process.env['DEBUG']
  })

  it('logs info messages to stdout', () => {
    logger.info('test info')
    expect(consoleSpy).toHaveBeenCalledTimes(1)
    expect(consoleSpy.mock.calls[0][1]).toBe('test info')
  })

  it('logs success messages to stdout', () => {
    logger.success('worked')
    expect(consoleSpy).toHaveBeenCalledTimes(1)
    expect(consoleSpy.mock.calls[0][1]).toBe('worked')
  })

  it('logs warn messages to stdout', () => {
    logger.warn('careful')
    expect(consoleSpy).toHaveBeenCalledTimes(1)
    expect(consoleSpy.mock.calls[0][1]).toBe('careful')
  })

  it('logs error messages to stderr', () => {
    logger.error('bad')
    expect(consoleErrSpy).toHaveBeenCalledTimes(1)
    expect(consoleErrSpy.mock.calls[0][1]).toBe('bad')
  })

  it('only logs debug when DEBUG is set', () => {
    logger.debug('hidden')
    expect(consoleSpy).not.toHaveBeenCalled()

    process.env['DEBUG'] = '1'
    logger.debug('visible')
    expect(consoleSpy).toHaveBeenCalledTimes(1)
    expect(consoleSpy.mock.calls[0][1]).toBe('visible')
  })
})
