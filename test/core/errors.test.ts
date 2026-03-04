// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import {
  OperatorError,
  GatewayError,
  GatewayUnreachableError,
  TimeoutError,
  ValidationError,
  isRetryable,
  formatError,
} from '../../src/core/errors.js'

describe('OperatorError', () => {
  it('stores code and message', () => {
    const err = new OperatorError('boom', 'TEST_CODE')
    expect(err.message).toBe('boom')
    expect(err.code).toBe('TEST_CODE')
    expect(err.name).toBe('OperatorError')
    expect(err).toBeInstanceOf(Error)
  })

  it('stores cause', () => {
    const cause = new Error('root')
    const err = new OperatorError('wrapper', 'WRAP', cause)
    expect(err.cause).toBe(cause)
  })
})

describe('GatewayError', () => {
  it('stores status code and path', () => {
    const err = new GatewayError('not found', 404, '/v1/health')
    expect(err.statusCode).toBe(404)
    expect(err.path).toBe('/v1/health')
    expect(err.code).toBe('GATEWAY_ERROR')
    expect(err.name).toBe('GatewayError')
    expect(err).toBeInstanceOf(OperatorError)
  })
})

describe('GatewayUnreachableError', () => {
  it('stores url', () => {
    const err = new GatewayUnreachableError('http://localhost:8787')
    expect(err.url).toBe('http://localhost:8787')
    expect(err.message).toContain('localhost:8787')
    expect(err.code).toBe('GATEWAY_UNREACHABLE')
  })
})

describe('TimeoutError', () => {
  it('stores timeout duration', () => {
    const err = new TimeoutError(5000)
    expect(err.timeoutMs).toBe(5000)
    expect(err.message).toContain('5000ms')
    expect(err.code).toBe('TIMEOUT')
  })
})

describe('ValidationError', () => {
  it('has correct code', () => {
    const err = new ValidationError('bad input')
    expect(err.code).toBe('VALIDATION_ERROR')
    expect(err.name).toBe('ValidationError')
  })
})

describe('isRetryable', () => {
  it('returns true for 500 status', () => {
    expect(isRetryable(new GatewayError('fail', 500, '/x'))).toBe(true)
  })

  it('returns true for 429 status', () => {
    expect(isRetryable(new GatewayError('rate', 429, '/x'))).toBe(true)
  })

  it('returns false for 400 status', () => {
    expect(isRetryable(new GatewayError('bad', 400, '/x'))).toBe(false)
  })

  it('returns false for 404 status', () => {
    expect(isRetryable(new GatewayError('nope', 404, '/x'))).toBe(false)
  })

  it('returns true for GatewayUnreachableError', () => {
    expect(isRetryable(new GatewayUnreachableError('http://x'))).toBe(true)
  })

  it('returns true for TimeoutError', () => {
    expect(isRetryable(new TimeoutError(1000))).toBe(true)
  })

  it('returns false for generic Error', () => {
    expect(isRetryable(new Error('nope'))).toBe(false)
  })
})

describe('formatError', () => {
  it('formats OperatorError with code', () => {
    const err = new GatewayError('fail', 500, '/v1')
    expect(formatError(err)).toBe('[GATEWAY_ERROR] fail')
  })

  it('formats generic Error', () => {
    expect(formatError(new Error('boom'))).toBe('boom')
  })

  it('formats non-Error values', () => {
    expect(formatError('string error')).toBe('string error')
    expect(formatError(42)).toBe('42')
    expect(formatError(null)).toBe('null')
  })
})
