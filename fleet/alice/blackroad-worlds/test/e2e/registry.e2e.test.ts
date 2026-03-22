// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
// E2E: starts the agents registry on a real TCP port using fetch().
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { serve } from '@hono/node-server'
import type { ServerType } from '@hono/node-server'

// Set TEST_MODE before importing server so it doesn't auto-start
process.env['TEST_MODE'] = '1'

const PORT = 13001
const BASE = `http://127.0.0.1:${PORT}`
let server: ServerType

beforeAll(async () => {
  const { app } = await import('../../src/registry/server.js')
  await new Promise<void>((resolve) => {
    server = serve({ fetch: app.fetch, port: PORT, hostname: '127.0.0.1' }, () => resolve())
  })
})

afterAll(() => { server?.close() })

describe('E2E: Registry health', () => {
  it('GET /health returns ok with agentCount', async () => {
    const res = await fetch(`${BASE}/health`)
    expect(res.status).toBe(200)
    const body = await res.json() as { status: string; agentCount: number }
    expect(body.status).toBe('healthy')
    expect(typeof body.agentCount).toBe('number')
    expect(body.agentCount).toBeGreaterThan(0)
  })
})

describe('E2E: Agent CRUD', () => {
  it('GET /agents returns agent list', async () => {
    const res = await fetch(`${BASE}/agents`)
    expect(res.status).toBe(200)
    const body = await res.json() as { agents: Array<{ name: string }> }
    expect(Array.isArray(body.agents)).toBe(true)
    expect(body.agents.length).toBeGreaterThan(0)
  })

  it('GET /agents/octavia returns octavia agent', async () => {
    const res = await fetch(`${BASE}/agents/octavia`)
    expect(res.status).toBe(200)
    const body = await res.json() as { name: string; status: string }
    expect(body.name).toBe('octavia')
    expect(body.status).toBe('available')
  })

  it('GET /agents/unknownagent returns 404', async () => {
    const res = await fetch(`${BASE}/agents/unknownagent_xyz`)
    expect(res.status).toBe(404)
  })
})

describe('E2E: Task marketplace', () => {
  let taskId: string

  it('POST /tasks creates a task', async () => {
    const res = await fetch(`${BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'E2E Test Task',
        description: 'Created by e2e registry test',
        priority: 'high',
        tags: ['e2e', 'test'],
        requiredCapabilities: ['reasoning'],
      }),
    })
    expect(res.status).toBe(201)
    const body = await res.json() as { task: { id: string; title: string; status: string } }
    expect(body.task.id).toBeTruthy()
    expect(body.task.title).toBe('E2E Test Task')
    expect(body.task.status).toBe('pending')
    taskId = body.task.id
  })

  it('GET /tasks lists created task', async () => {
    const res = await fetch(`${BASE}/tasks`)
    const body = await res.json() as { tasks: Array<{ id: string }> }
    expect(body.tasks.some((t) => t.id === taskId)).toBe(true)
  })

  it('GET /tasks/:id returns task details', async () => {
    const res = await fetch(`${BASE}/tasks/${taskId}`)
    expect(res.status).toBe(200)
    const body = await res.json() as { task: { id: string; title: string } }
    expect(body.task.id).toBe(taskId)
    expect(body.task.title).toBe('E2E Test Task')
  })

  it('PATCH /tasks/:id claims task', async () => {
    const res = await fetch(`${BASE}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'claimed', assignedAgent: 'octavia' }),
    })
    expect(res.status).toBe(200)
    const body = await res.json() as { task: { status: string; assignedAgent: string } }
    expect(body.task.status).toBe('claimed')
    expect(body.task.assignedAgent).toBe('octavia')
  })
})
