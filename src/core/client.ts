// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import {
  GatewayError,
  GatewayUnreachableError,
  TimeoutError,
  isRetryable,
} from './errors.js'

export interface ClientOptions {
  baseUrl?: string
  timeoutMs?: number
  retries?: number
  retryDelayMs?: number
}

const DEFAULT_TIMEOUT_MS = 10_000
const DEFAULT_RETRIES = 2
const DEFAULT_RETRY_DELAY_MS = 500

export class GatewayClient {
  readonly baseUrl: string
  private readonly timeoutMs: number
  private readonly retries: number
  private readonly retryDelayMs: number

  constructor(options?: string | ClientOptions) {
    if (typeof options === 'string') {
      this.baseUrl = options
      this.timeoutMs = DEFAULT_TIMEOUT_MS
      this.retries = DEFAULT_RETRIES
      this.retryDelayMs = DEFAULT_RETRY_DELAY_MS
    } else {
      this.baseUrl =
        options?.baseUrl ??
        process.env['BLACKROAD_GATEWAY_URL'] ??
        'http://127.0.0.1:8787'
      this.timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS
      this.retries = options?.retries ?? DEFAULT_RETRIES
      this.retryDelayMs = options?.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS
    }
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path)
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, body)
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    let lastError: unknown

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        return await this.doRequest<T>(method, path, body)
      } catch (error) {
        lastError = error
        if (attempt < this.retries && isRetryable(error)) {
          const delay = this.retryDelayMs * Math.pow(2, attempt)
          await sleep(delay)
          continue
        }
        throw error
      }
    }

    throw lastError
  }

  private async doRequest<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const init: RequestInit = {
        method,
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
      }
      if (body !== undefined) {
        init.body = JSON.stringify(body)
      }

      const res = await fetch(url, init)
      if (!res.ok) {
        throw new GatewayError(
          `${method} ${path} failed: ${res.status} ${res.statusText}`,
          res.status,
          path,
        )
      }
      return (await res.json()) as T
    } catch (error) {
      if (error instanceof GatewayError) throw error
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new TimeoutError(this.timeoutMs, error)
      }
      throw new GatewayUnreachableError(this.baseUrl, error)
    } finally {
      clearTimeout(timer)
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
