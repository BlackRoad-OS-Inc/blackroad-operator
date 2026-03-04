// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.

export class OperatorError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'OperatorError'
  }
}

export class GatewayError extends OperatorError {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly path: string,
    cause?: unknown,
  ) {
    super(message, 'GATEWAY_ERROR', cause)
    this.name = 'GatewayError'
  }
}

export class GatewayUnreachableError extends OperatorError {
  constructor(
    public readonly url: string,
    cause?: unknown,
  ) {
    super(`Gateway unreachable at ${url}`, 'GATEWAY_UNREACHABLE', cause)
    this.name = 'GatewayUnreachableError'
  }
}

export class TimeoutError extends OperatorError {
  constructor(
    public readonly timeoutMs: number,
    cause?: unknown,
  ) {
    super(`Request timed out after ${timeoutMs}ms`, 'TIMEOUT', cause)
    this.name = 'TimeoutError'
  }
}

export class ValidationError extends OperatorError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export function isRetryable(error: unknown): boolean {
  if (error instanceof GatewayError) {
    return error.statusCode >= 500 || error.statusCode === 429
  }
  if (error instanceof GatewayUnreachableError) return true
  if (error instanceof TimeoutError) return true
  return false
}

export function formatError(error: unknown): string {
  if (error instanceof OperatorError) {
    return `[${error.code}] ${error.message}`
  }
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}
