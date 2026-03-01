// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { runPreflight } from '../../src/bootstrap/preflight.js'

describe('runPreflight', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should return true when gateway is reachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({ ok: true, json: async () => ({ status: 'ok' }) }),
    )
    const result = await runPreflight()
    expect(result).toBe(true)
  })

  it('should return true even when gateway is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')))
    const result = await runPreflight()
    expect(result).toBe(true)
  })
})
