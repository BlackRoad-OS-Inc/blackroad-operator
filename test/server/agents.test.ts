// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { createApp } from '../../src/server/app.js'

const app = createApp()

async function req(method: string, path: string, body?: unknown) {
  const init: RequestInit = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) init.body = JSON.stringify(body)
  return app.request(path, init)
}

describe('Agent endpoints', () => {
  it('GET /v1/agents returns agent list', async () => {
    const res = await req('GET', '/v1/agents')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.agents).toBeInstanceOf(Array)
    expect(data.agents.length).toBe(6)
    expect(data.total).toBe(6)

    const names = data.agents.map((a: { name: string }) => a.name)
    expect(names).toContain('octavia')
    expect(names).toContain('lucidia')
    expect(names).toContain('alice')
    expect(names).toContain('cipher')
    expect(names).toContain('prism')
    expect(names).toContain('echo')
  })

  it('GET /v1/agents/:name returns specific agent', async () => {
    const res = await req('GET', '/v1/agents/octavia')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.agent.name).toBe('octavia')
    expect(data.agent.title).toBe('The Architect')
    expect(data.agent.capabilities).toBeInstanceOf(Array)
  })

  it('GET /v1/agents/:name returns 404 for unknown agent', async () => {
    const res = await req('GET', '/v1/agents/unknown-agent')
    expect(res.status).toBe(404)
    const data = await res.json()
    expect(data.error).toBe('agent_not_found')
  })

  it('GET /v1/agents/:name/capabilities returns capabilities', async () => {
    const res = await req('GET', '/v1/agents/cipher/capabilities')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.agent).toBe('cipher')
    expect(data.capabilities).toContain('security')
  })

  it('POST /v1/agents/:name/invoke returns queued without gateway', async () => {
    // In dev mode (no BRAT_MASTER_KEY), auth middleware passes through
    const res = await req('POST', '/v1/agents/alice/invoke', { task: 'Deploy service X' })
    expect(res.status).toBe(200)
    const data = await res.json()
    // Without gateway, should return queued
    expect(data.agent).toBe('alice')
    expect(['queued', 'ok']).toContain(data.status)
  })

  it('POST /v1/agents/:name/invoke rejects missing task', async () => {
    const res = await req('POST', '/v1/agents/alice/invoke', {})
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('validation_error')
  })
})
