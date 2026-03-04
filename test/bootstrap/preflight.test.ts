// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { runPreflight } from '../../src/bootstrap/preflight.js'

describe('runPreflight', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('returns true when Node.js version is 22+', async () => {
    // Current test runner uses Node 22+, so this should pass
    const result = await runPreflight()
    expect(result).toBe(true)
  })

  it('logs Node.js version', async () => {
    const spy = vi.spyOn(console, 'log')
    await runPreflight()
    const calls = spy.mock.calls.map((c) => c.join(' '))
    expect(calls.some((c) => c.includes('Node.js'))).toBe(true)
  })
})
