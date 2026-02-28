// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { createApp } from '../../src/server/app.js'

const app = createApp()

async function req(method: string, path: string, body?: unknown) {
  const init: RequestInit = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) init.body = JSON.stringify(body)
  return app.request(path, init)
}

describe('Health endpoints', () => {
  it('GET /healthz returns 200 with status ok', async () => {
    const res = await req('GET', '/healthz')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.status).toBe('ok')
    expect(data.service).toBe('blackroad-operator')
    expect(data.version).toBe('0.1.0')
    expect(typeof data.uptime).toBe('number')
  })

  it('GET /readyz returns 200 or 503', async () => {
    const res = await req('GET', '/readyz')
    expect([200, 503]).toContain(res.status)
    const data = await res.json()
    expect(['ready', 'not_ready']).toContain(data.status)
    expect(data.checks).toBeDefined()
  })

  it('GET /version returns service info', async () => {
    const res = await req('GET', '/version')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.service).toBe('blackroad-operator')
    expect(data.version).toBe('0.1.0')
  })

  it('GET / returns service root info', async () => {
    const res = await req('GET', '/')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.service).toBe('blackroad-operator')
    expect(data.endpoints).toBeDefined()
  })

  it('GET /nonexistent returns 404', async () => {
    const res = await req('GET', '/nonexistent')
    expect(res.status).toBe(404)
    const data = await res.json()
    expect(data.error).toBe('not_found')
  })
})
