// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createApp } from '../../src/server/app.js'

const MASTER_KEY = 'a'.repeat(64) // 64-char hex key for testing

const app = createApp()

async function req(method: string, path: string, body?: unknown, headers?: Record<string, string>) {
  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  }
  if (body) init.body = JSON.stringify(body)
  return app.request(path, init)
}

describe('Auth endpoints', () => {
  beforeAll(() => {
    process.env['BRAT_MASTER_KEY'] = MASTER_KEY
  })

  afterAll(() => {
    delete process.env['BRAT_MASTER_KEY']
  })

  it('GET /v1/auth/status returns auth info', async () => {
    const res = await req('GET', '/v1/auth/status')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.ok).toBe(true)
    expect(data.protocol).toBe('BRAT v1')
    expect(data.configured).toBe(true)
    expect(data.roles).toContain('owner')
    expect(data.roles).toContain('agent')
  })

  it('POST /v1/auth/token issues a token', async () => {
    const res = await req('POST', '/v1/auth/token', { sub: 'test-user', role: 'agent' })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.ok).toBe(true)
    expect(data.token).toBeTruthy()
    expect(data.payload.sub).toBe('test-user')
    expect(data.payload.role).toBe('agent')
  })

  it('POST /v1/auth/token rejects missing sub', async () => {
    const res = await req('POST', '/v1/auth/token', { role: 'agent' })
    expect(res.status).toBe(400)
  })

  it('POST /v1/auth/verify validates a token', async () => {
    // First, issue a token
    const issueRes = await req('POST', '/v1/auth/token', { sub: 'verify-test', role: 'agent' })
    const { token } = await issueRes.json()

    // Then verify it
    const verifyRes = await req('POST', '/v1/auth/verify', { token })
    expect(verifyRes.status).toBe(200)
    const data = await verifyRes.json()
    expect(data.ok).toBe(true)
    expect(data.payload.sub).toBe('verify-test')
  })

  it('POST /v1/auth/verify rejects invalid token', async () => {
    const res = await req('POST', '/v1/auth/verify', { token: 'garbage.token.here' })
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.ok).toBe(false)
  })

  it('GET /v1/auth/me returns identity from Bearer header', async () => {
    // Issue a token
    const issueRes = await req('POST', '/v1/auth/token', { sub: 'me-test', role: 'agent' })
    const { token } = await issueRes.json()

    // Use it in Authorization header
    const meRes = await req('GET', '/v1/auth/me', undefined, {
      Authorization: `Bearer ${token}`,
    })
    expect(meRes.status).toBe(200)
    const data = await meRes.json()
    expect(data.ok).toBe(true)
    expect(data.identity.sub).toBe('me-test')
  })

  it('GET /v1/auth/me rejects missing token', async () => {
    const res = await req('GET', '/v1/auth/me')
    expect(res.status).toBe(401)
  })
})
