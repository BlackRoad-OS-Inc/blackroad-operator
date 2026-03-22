// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { app } from '../../src/registry/server.js'

describe('Task Marketplace API', () => {
  it('creates a task', async () => {
    const res = await app.request('/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Build auth module',
        description: 'Add JWT-based auth to gateway',
        priority: 'high',
        tags: ['backend', 'security'],
        requiredCapabilities: ['coding', 'security'],
      }),
    })
    expect(res.status).toBe(201)
    const { task } = await res.json()
    expect(task.id).toMatch(/^task_/)
    expect(task.title).toBe('Build auth module')
    expect(task.status).toBe('pending')
    expect(task.assignedAgent).toBeNull()
  })

  it('lists tasks', async () => {
    const res = await app.request('/tasks')
    expect(res.status).toBe(200)
    const { tasks, count } = await res.json()
    expect(Array.isArray(tasks)).toBe(true)
    expect(count).toBeGreaterThanOrEqual(0)
  })

  it('filters tasks by status', async () => {
    const res = await app.request('/tasks?status=pending')
    expect(res.status).toBe(200)
    const { tasks } = await res.json()
    tasks.forEach((t: { status: string }) => expect(t.status).toBe('pending'))
  })

  it('claims a task', async () => {
    const createRes = await app.request('/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test claim task', priority: 'low' }),
    })
    const { task } = await createRes.json()

    const claimRes = await app.request(`/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'claimed', assignedAgent: 'octavia' }),
    })
    expect(claimRes.status).toBe(200)
    const updated = (await claimRes.json()).task
    expect(updated.status).toBe('claimed')
    expect(updated.assignedAgent).toBe('octavia')
  })

  it('completes a task with result', async () => {
    const createRes = await app.request('/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test complete task' }),
    })
    const { task } = await createRes.json()

    const doneRes = await app.request(`/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed', assignedAgent: 'alice', result: 'Done!' }),
    })
    expect(doneRes.status).toBe(200)
    const updated = (await doneRes.json()).task
    expect(updated.status).toBe('completed')
    expect(updated.result).toBe('Done!')
  })

  it('returns 404 for unknown task', async () => {
    const res = await app.request('/tasks/nonexistent', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'claimed' }),
    })
    expect(res.status).toBe(404)
  })
})
