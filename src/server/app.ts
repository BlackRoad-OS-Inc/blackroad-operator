// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { healthRoutes } from './routes/health.js'
import { authRoutes } from './routes/auth.js'
import { agentRoutes } from './routes/agents.js'
import { billingRoutes } from './routes/billing.js'
import { gatewayRoutes } from './routes/gateway.js'
import { metricsMiddleware, metricsRoutes } from './middleware/metrics.js'
import { authMiddleware } from './middleware/auth.js'

export function createApp() {
  const app = new Hono()

  // Global middleware
  const allowedOriginsEnv = process.env['BLACKROAD_ALLOWED_ORIGINS']
  const allowedOrigins =
    allowedOriginsEnv && allowedOriginsEnv.trim().length > 0
      ? allowedOriginsEnv
          .split(',')
          .map((origin) => origin.trim())
          .filter((origin) => origin.length > 0)
      : []

  const corsOptions =
    allowedOriginsEnv === '*'
      ? { origin: '*' as const }
      : {
          origin: (origin: string) => {
            return allowedOrigins.includes(origin) ? origin : ''
          },
        }

  app.use('*', cors(corsOptions))
  app.use('/v1/*', metricsMiddleware())

  // Public routes (no auth required)
  app.route('/', healthRoutes)
  app.route('/v1/auth', authRoutes)

  // Protected routes
  app.route('/v1/agents', agentRoutes)
  app.route('/v1/billing', billingRoutes)
  app.route('/v1/gateway', gatewayRoutes)
  app.use('/v1/metrics/*', authMiddleware('metrics:read'))
  app.route('/v1/metrics', metricsRoutes)

  // Root info
  app.get('/', (c) =>
    c.json({
      service: 'blackroad-operator',
      version: '0.1.0',
      status: 'operational',
      endpoints: {
        health: 'GET /healthz',
        ready: 'GET /readyz',
        auth_token: 'POST /v1/auth/token',
        auth_verify: 'POST /v1/auth/verify',
        agents_list: 'GET /v1/agents',
        agents_invoke: 'POST /v1/agents/:name/invoke',
        billing_usage: 'GET /v1/billing/usage',
        billing_plans: 'GET /v1/billing/plans',
        gateway_proxy: 'POST /v1/gateway/invoke',
        metrics: 'GET /v1/metrics',
      },
      docs: 'https://docs.blackroad.io',
      ts: new Date().toISOString(),
    }),
  )

  // 404 fallback
  app.notFound((c) =>
    c.json({ error: 'not_found', message: `${c.req.method} ${c.req.path} not found` }, 404),
  )

  // Error handler
  app.onError((err, c) =>
    c.json(
      {
        error: 'internal_error',
        message: process.env['NODE_ENV'] === 'production' ? 'Internal server error' : err.message,
      },
      500,
    ),
  )

  return app
}
