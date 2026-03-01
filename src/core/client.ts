// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.

export class GatewayClient {
  readonly baseUrl: string
  readonly timeoutMs: number

  constructor(baseUrl?: string, timeoutMs = 10_000) {
    this.baseUrl =
      baseUrl ?? process.env['BLACKROAD_GATEWAY_URL'] ?? 'http://127.0.0.1:8787'
    this.timeoutMs = timeoutMs
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      signal: AbortSignal.timeout(this.timeoutMs),
    })
    if (!res.ok) {
      throw new Error(`GET ${path} failed: ${res.status} ${res.statusText}`)
    }
    return res.json() as Promise<T>
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeoutMs),
    })
    if (!res.ok) {
      throw new Error(`POST ${path} failed: ${res.status} ${res.statusText}`)
    }
    return res.json() as Promise<T>
  }
}
