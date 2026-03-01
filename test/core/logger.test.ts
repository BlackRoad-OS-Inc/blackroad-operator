// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger } from '../../src/core/logger.js'

describe('logger', () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    logger.setLevel('debug')
  })

  afterEach(() => {
    logSpy.mockRestore()
    errorSpy.mockRestore()
    logger.setLevel('info')
  })

  it('should log info messages', () => {
    logger.info('test info')
    expect(logSpy).toHaveBeenCalledOnce()
    expect(logSpy.mock.calls[0][1]).toBe('test info')
  })

  it('should log success messages', () => {
    logger.success('test success')
    expect(logSpy).toHaveBeenCalledOnce()
    expect(logSpy.mock.calls[0][1]).toBe('test success')
  })

  it('should log warn messages', () => {
    logger.warn('test warn')
    expect(logSpy).toHaveBeenCalledOnce()
    expect(logSpy.mock.calls[0][1]).toBe('test warn')
  })

  it('should log error messages to stderr', () => {
    logger.error('test error')
    expect(errorSpy).toHaveBeenCalledOnce()
    expect(errorSpy.mock.calls[0][1]).toBe('test error')
  })

  it('should log debug messages when level is debug', () => {
    logger.setLevel('debug')
    logger.debug('test debug')
    expect(logSpy).toHaveBeenCalledOnce()
    expect(logSpy.mock.calls[0][1]).toBe('test debug')
  })

  it('should suppress info when level is warn', () => {
    logger.setLevel('warn')
    logger.info('hidden')
    expect(logSpy).not.toHaveBeenCalled()
  })

  it('should suppress warn when level is error', () => {
    logger.setLevel('error')
    logger.warn('hidden')
    expect(logSpy).not.toHaveBeenCalled()
  })

  it('should get and set level', () => {
    logger.setLevel('error')
    expect(logger.getLevel()).toBe('error')
  })
})
