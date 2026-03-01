// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Hono } from 'hono'

const startTime = Date.now()

export const healthRoutes = new Hono()

// Liveness probe — always returns 200 if process is alive
healthRoutes.get('/healthz', (c) =>
  c.json({
    status: 'ok',
    service: 'blackroad-operator',
    version: '0.1.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    ts: new Date().toISOString(),
  }),
)

// Readiness probe — checks dependencies before accepting traffic
healthRoutes.get('/readyz', async (c) => {
  const checks: Record<string, 'ok' | 'fail'> = {}

  // Check gateway connectivity (if configured)
  const gatewayUrl = process.env['BLACKROAD_GATEWAY_URL']
  if (gatewayUrl) {
    try {
      const res = await fetch(`${gatewayUrl}/healthz`, { signal: AbortSignal.timeout(3000) })
      checks['gateway'] = res.ok ? 'ok' : 'fail'
    } catch {
      checks['gateway'] = 'fail'
    }
  } else {
    checks['gateway'] = 'ok' // no gateway configured, skip check
  }

  const allOk = Object.values(checks).every((v) => v === 'ok')
  return c.json(
    {
      status: allOk ? 'ready' : 'not_ready',
      checks,
      ts: new Date().toISOString(),
    },
    allOk ? 200 : 503,
  )
})

// Version/info endpoint
healthRoutes.get('/version', (c) =>
  c.json({
    service: 'blackroad-operator',
    version: '0.1.0',
    node: process.version,
    env: process.env['NODE_ENV'] ?? 'development',
    commit: process.env['BR_OS_SERVICE_COMMIT'] ?? 'unknown',
  }),
)
