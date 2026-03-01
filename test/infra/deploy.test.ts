// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { deployService } from '../../src/infra/deploy.js'

describe('deployService', () => {
  it('should support dry-run for cloudflare', () => {
    const result = deployService({
      target: 'cloudflare',
      service: 'test-worker',
      env: 'production',
      dryRun: true,
    })
    expect(result.provider).toBe('cloudflare')
    expect(result.success).toBe(true)
  })

  it('should support dry-run for railway', () => {
    const result = deployService({
      target: 'railway',
      service: 'test-service',
      env: 'production',
      dryRun: true,
    })
    expect(result.provider).toBe('railway')
    expect(result.success).toBe(true)
  })

  it('should support dry-run for vercel', () => {
    const result = deployService({
      target: 'vercel',
      service: 'test-app',
      env: 'staging',
      dryRun: true,
    })
    expect(result.provider).toBe('vercel')
    expect(result.success).toBe(true)
  })

  it('should support dry-run for pi', () => {
    const result = deployService({
      target: 'pi',
      service: 'test-service',
      env: 'production',
      dryRun: true,
    })
    expect(result.provider).toContain('pi')
    expect(result.success).toBe(true)
  })

  it('should auto-detect target in dry-run mode', () => {
    const result = deployService({
      target: 'auto',
      service: 'operator',
      env: 'production',
      dryRun: true,
    })
    expect(result.success).toBe(true)
    expect(result.provider).toBeDefined()
  })
})
