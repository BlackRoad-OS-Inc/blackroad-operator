// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { createApp } from '../../src/server/app.js'

const app = createApp()

async function req(method: string, path: string) {
  return app.request(path, { method })
}

describe('Metrics endpoint', () => {
  it('GET /v1/metrics returns metrics snapshot', async () => {
    // Make a few requests first to generate metrics
    await req('GET', '/healthz')
    await req('GET', '/v1/agents')

    const res = await req('GET', '/v1/metrics')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.status).toBe('ok')
    expect(data.metrics).toBeDefined()
    expect(typeof data.metrics.uptime_seconds).toBe('number')
    expect(typeof data.metrics.total_requests).toBe('number')
  })
})
