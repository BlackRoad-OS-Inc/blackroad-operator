// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { GatewayClient } from '../../src/core/client.js'
import { GatewayError, GatewayUnreachableError } from '../../src/core/errors.js'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('GatewayClient', () => {
  it('should use default base URL', () => {
    const client = new GatewayClient()
    expect(client.baseUrl).toBe('http://127.0.0.1:8787')
  })

  it('should accept custom base URL string', () => {
    const client = new GatewayClient('http://custom:9999')
    expect(client.baseUrl).toBe('http://custom:9999')
  })

  it('should accept options object', () => {
    const client = new GatewayClient({
      baseUrl: 'http://opts:1234',
      timeoutMs: 5000,
      retries: 0,
    })
    expect(client.baseUrl).toBe('http://opts:1234')
  })

  it('should throw GatewayError on non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      }),
    )
    const client = new GatewayClient({ retries: 0 })
    await expect(client.get('/v1/health')).rejects.toThrow(GatewayError)
  })

  it('should throw GatewayError with status info', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      }),
    )
    const client = new GatewayClient({ retries: 0 })
    try {
      await client.get('/v1/missing')
      expect.unreachable('should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(GatewayError)
      const ge = error as GatewayError
      expect(ge.statusCode).toBe(404)
      expect(ge.path).toBe('/v1/missing')
    }
  })

  it('should return parsed JSON on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'healthy' }),
      }),
    )
    const client = new GatewayClient({ retries: 0 })
    const result = await client.get<{ status: string }>('/v1/health')
    expect(result.status).toBe('healthy')
  })

  it('should send JSON body on POST', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ content: 'done' }),
    })
    vi.stubGlobal('fetch', mockFetch)
    const client = new GatewayClient({ retries: 0 })
    await client.post('/v1/invoke', { agent: 'octavia', task: 'test' })
    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [, init] = mockFetch.mock.calls[0]
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({
      agent: 'octavia',
      task: 'test',
    })
  })

  it('should throw GatewayUnreachableError on network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('fetch failed')),
    )
    const client = new GatewayClient({ retries: 0 })
    await expect(client.get('/v1/health')).rejects.toThrow(
      GatewayUnreachableError,
    )
  })

  it('should retry on retryable errors', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true }),
      })
    vi.stubGlobal('fetch', mockFetch)
    const client = new GatewayClient({ retries: 1, retryDelayMs: 1 })
    const result = await client.get<{ ok: boolean }>('/v1/health')
    expect(result.ok).toBe(true)
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('should not retry on non-retryable errors', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
    })
    vi.stubGlobal('fetch', mockFetch)
    const client = new GatewayClient({ retries: 2, retryDelayMs: 1 })
    await expect(client.get('/v1/health')).rejects.toThrow(GatewayError)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})
