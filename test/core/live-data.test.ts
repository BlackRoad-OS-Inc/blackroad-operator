// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { probeService } from '../../src/core/live-data.js'

describe('probeService', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should return "up" when response is 200 OK with application/json', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
      }),
    )
    const result = await probeService(
      'Gateway',
      'http://127.0.0.1:8787/v1/health',
    )
    expect(result.status).toBe('up')
    expect(result.name).toBe('Gateway')
    expect(result.error).toBeUndefined()
  })

  it('should return "degraded" when response is 200 OK but content-type is text/html', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'text/html; charset=utf-8' },
      }),
    )
    const result = await probeService('SomeEndpoint', 'http://example.com/api')
    expect(result.status).toBe('degraded')
    expect(result.error).toContain('Expected application/json')
    expect(result.error).toContain('text/html')
  })

  it('should return "degraded" when response is 200 OK but no content-type header', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => null },
      }),
    )
    const result = await probeService('NoType', 'http://example.com/api')
    expect(result.status).toBe('degraded')
    expect(result.error).toContain('Expected application/json')
    expect(result.error).toContain('no content-type')
  })

  it('should return "degraded" when response is non-200', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        headers: { get: () => 'application/json' },
      }),
    )
    const result = await probeService('BadService', 'http://example.com')
    expect(result.status).toBe('degraded')
    expect(result.error).toBe('HTTP 503')
  })

  it('should return "down" when fetch throws (connection refused)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')))
    const result = await probeService('Offline', 'http://127.0.0.1:1')
    expect(result.status).toBe('down')
    expect(result.error).toContain('ECONNREFUSED')
  })

  it('should include latency in the result', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
      }),
    )
    const result = await probeService('Fast', 'http://127.0.0.1:8787/v1/health')
    expect(typeof result.latencyMs).toBe('number')
    expect(result.latencyMs).toBeGreaterThanOrEqual(0)
  })
})
