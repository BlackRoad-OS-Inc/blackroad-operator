// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  checkCloudflare,
  checkCloudflareWorker,
  checkRailway,
  checkHuggingFace,
  checkHuggingFaceModel,
  checkSalesforce,
  checkPi,
  checkOllama,
  checkGateway,
  checkFullMesh,
} from '../../src/infra/providers.js'

describe('Infrastructure Providers', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.unstubAllGlobals()
  })

  describe('checkCloudflare', () => {
    it('should return healthy when blackroad.io responds', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: true, status: 200 }),
      )
      const result = await checkCloudflare()
      expect(result.provider).toBe('cloudflare')
      expect(result.status).toBe('healthy')
      expect(result.latencyMs).toBeGreaterThanOrEqual(0)
    })

    it('should return degraded on non-ok response', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: false, status: 503 }),
      )
      const result = await checkCloudflare()
      expect(result.status).toBe('degraded')
    })

    it('should return unreachable on network error', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('ECONNREFUSED')),
      )
      const result = await checkCloudflare()
      expect(result.status).toBe('unreachable')
      expect(result.latencyMs).toBe(-1)
    })
  })

  describe('checkCloudflareWorker', () => {
    it('should check a specific worker URL', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: true, status: 200 }),
      )
      const result = await checkCloudflareWorker('https://test.workers.dev')
      expect(result.provider).toBe('cloudflare-worker')
      expect(result.status).toBe('healthy')
      expect(result.details).toContain('test.workers.dev')
    })
  })

  describe('checkRailway', () => {
    it('should return degraded when no URL configured', async () => {
      delete process.env['RAILWAY_SERVICE_URL']
      const result = await checkRailway()
      expect(result.provider).toBe('railway')
      expect(result.status).toBe('degraded')
      expect(result.details).toContain('No RAILWAY_SERVICE_URL')
    })

    it('should check provided URL', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: true, status: 200 }),
      )
      const result = await checkRailway('https://my-service.railway.app')
      expect(result.status).toBe('healthy')
    })
  })

  describe('checkHuggingFace', () => {
    it('should return healthy when API is reachable and authed', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: true, status: 200 }),
      )
      const result = await checkHuggingFace()
      expect(result.provider).toBe('huggingface')
      expect(result.status).toBe('healthy')
    })

    it('should return healthy on 401 (API up, token missing)', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: false, status: 401 }),
      )
      const result = await checkHuggingFace()
      expect(result.status).toBe('healthy')
    })

    it('should return degraded on 500', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: false, status: 500 }),
      )
      const result = await checkHuggingFace()
      expect(result.status).toBe('degraded')
    })
  })

  describe('checkHuggingFaceModel', () => {
    it('should check a specific model', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: true, status: 200 }),
      )
      const result = await checkHuggingFaceModel('Qwen/Qwen2.5-7B')
      expect(result.provider).toBe('huggingface-model')
      expect(result.status).toBe('healthy')
      expect(result.details).toBe('Qwen/Qwen2.5-7B')
    })
  })

  describe('checkSalesforce', () => {
    it('should return degraded when no instance URL configured', async () => {
      delete process.env['SALESFORCE_INSTANCE_URL']
      const result = await checkSalesforce()
      expect(result.provider).toBe('salesforce')
      expect(result.status).toBe('degraded')
      expect(result.details).toContain('No SALESFORCE_INSTANCE_URL')
    })

    it('should check instance when configured', async () => {
      process.env['SALESFORCE_INSTANCE_URL'] = 'https://test.salesforce.com'
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: true, status: 200 }),
      )
      const result = await checkSalesforce()
      expect(result.status).toBe('healthy')
      delete process.env['SALESFORCE_INSTANCE_URL']
    })
  })

  describe('checkOllama', () => {
    it('should return healthy with model list', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({
            models: [{ name: 'qwen2.5:7b' }, { name: 'llama3.2:3b' }],
          }),
        }),
      )
      const result = await checkOllama()
      expect(result.provider).toBe('ollama')
      expect(result.status).toBe('healthy')
      expect(result.models).toEqual(['qwen2.5:7b', 'llama3.2:3b'])
      expect(result.details).toBe('2 models loaded')
    })

    it('should return unreachable when Ollama is down', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('ECONNREFUSED')),
      )
      const result = await checkOllama()
      expect(result.status).toBe('unreachable')
    })
  })

  describe('checkGateway', () => {
    it('should check default gateway URL', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: true, status: 200 }),
      )
      const result = await checkGateway()
      expect(result.provider).toBe('gateway')
      expect(result.status).toBe('healthy')
    })

    it('should return unreachable when gateway is down', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('ECONNREFUSED')),
      )
      const result = await checkGateway()
      expect(result.status).toBe('unreachable')
    })
  })

  describe('checkPi', () => {
    it('should return unreachable for offline Pi', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ETIMEDOUT')))
      const result = await checkPi('192.168.4.64', 'blackroad-pi')
      expect(result.provider).toBe('pi:blackroad-pi')
      expect(result.status).toBe('unreachable')
    })
  })

  describe('checkFullMesh', () => {
    it('should return a complete mesh report', async () => {
      // Mock all fetch calls to fail fast (no real network)
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('no network in test')),
      )
      const report = await checkFullMesh()
      expect(report.timestamp).toBeDefined()
      expect(report.results).toBeInstanceOf(Array)
      expect(report.results.length).toBeGreaterThan(0)
      expect(report.summary.total).toBe(report.results.length)
      expect(
        report.summary.healthy +
          report.summary.degraded +
          report.summary.unreachable,
      ).toBe(report.summary.total)
    })
  })
})
