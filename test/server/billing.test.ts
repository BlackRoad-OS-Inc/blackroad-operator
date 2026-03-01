// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { createApp } from '../../src/server/app.js'

const app = createApp()

async function req(method: string, path: string, body?: unknown) {
  const init: RequestInit = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) init.body = JSON.stringify(body)
  return app.request(path, init)
}

describe('Billing endpoints', () => {
  it('GET /v1/billing/plans returns pricing plans', async () => {
    const res = await req('GET', '/v1/billing/plans')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.plans).toBeInstanceOf(Array)
    expect(data.plans.length).toBe(4)
    expect(data.currency).toBe('USD')

    const planIds = data.plans.map((p: { id: string }) => p.id)
    expect(planIds).toContain('free')
    expect(planIds).toContain('pro')
    expect(planIds).toContain('team')
    expect(planIds).toContain('enterprise')
  })

  it('GET /v1/billing/plans has correct free tier pricing', async () => {
    const res = await req('GET', '/v1/billing/plans')
    const data = await res.json()
    const free = data.plans.find((p: { id: string }) => p.id === 'free')
    expect(free.price_monthly).toBe(0)
    expect(free.limits.requests_per_day).toBe(100)
    expect(free.limits.agents).toBe(2)
  })

  it('GET /v1/billing/plans has correct pro tier pricing', async () => {
    const res = await req('GET', '/v1/billing/plans')
    const data = await res.json()
    const pro = data.plans.find((p: { id: string }) => p.id === 'pro')
    expect(pro.price_monthly).toBe(49)
    expect(pro.limits.requests_per_day).toBe(10000)
    expect(pro.limits.agents).toBe(6)
  })

  it('GET /v1/billing/usage returns usage in dev mode', async () => {
    // In dev mode (no BRAT_MASTER_KEY), auth passes through with dev-user identity
    const res = await req('GET', '/v1/billing/usage')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.sub).toBeDefined()
    expect(data.plan).toBeDefined()
    expect(data.usage).toBeDefined()
    expect(typeof data.usage.requests_today).toBe('number')
    expect(typeof data.usage.requests_total).toBe('number')
  })
})
