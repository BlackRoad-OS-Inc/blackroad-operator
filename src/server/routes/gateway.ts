// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth.js'

export const gatewayRoutes = new Hono()

// POST /v1/gateway/invoke — proxy an invocation through the gateway
gatewayRoutes.post('/invoke', authMiddleware('gateway:invoke'), async (c) => {
  const gatewayUrl = process.env['BLACKROAD_GATEWAY_URL'] ?? 'http://127.0.0.1:8787'

  let body: {
    agent: string
    intent: string
    input: string
    provider?: string
    context?: Record<string, unknown>
  }

  try {
    body = await c.req.json<{
      agent: string
      intent: string
      input: string
      provider?: string
      context?: Record<string, unknown>
    }>()
  } catch {
    return c.json(
      {
        error: 'invalid_json',
        message: 'Request body must be valid JSON',
      },
      400,
    )
  }
  if (!body.agent) return c.json({ error: 'agent required' }, 400)
  if (!body.intent) return c.json({ error: 'intent required' }, 400)
  if (!body.input) return c.json({ error: 'input required' }, 400)

  try {
    const res = await fetch(`${gatewayUrl}/v1/agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent: body.agent,
        intent: body.intent,
        input: body.input,
        provider: body.provider,
        context: body.context ?? {},
      }),
    })

    const data = (await res.json()) as Record<string, unknown>
    return c.json(data, res.status as 200)
  } catch (err) {
    return c.json(
      {
        error: 'gateway_unreachable',
        message: err instanceof Error ? err.message : 'Cannot connect to gateway',
        gateway_url: gatewayUrl,
      },
      502,
    )
  }
})

// GET /v1/gateway/health — check gateway health
gatewayRoutes.get('/health', async (c) => {
  const gatewayUrl = process.env['BLACKROAD_GATEWAY_URL'] ?? 'http://127.0.0.1:8787'

  try {
    const res = await fetch(`${gatewayUrl}/healthz`, { signal: AbortSignal.timeout(5000) })
    const data = (await res.json()) as Record<string, unknown>
    return c.json({ status: 'ok', gateway: data })
  } catch (err) {
    return c.json(
      {
        status: 'unreachable',
        gateway_url: gatewayUrl,
        error: err instanceof Error ? err.message : 'Connection failed',
      },
      502,
    )
  }
})

// GET /v1/gateway/metrics — proxy gateway metrics
gatewayRoutes.get('/metrics', authMiddleware('metrics:read'), async (c) => {
  const gatewayUrl = process.env['BLACKROAD_GATEWAY_URL'] ?? 'http://127.0.0.1:8787'

  try {
    const res = await fetch(`${gatewayUrl}/metrics`, { signal: AbortSignal.timeout(5000) })
    const data = (await res.json()) as Record<string, unknown>
    return c.json(data)
  } catch {
    return c.json({ error: 'gateway_unreachable' }, 502)
  }
})

// GET /v1/gateway/providers — list available providers
gatewayRoutes.get('/providers', (c) =>
  c.json({
    providers: [
      { name: 'ollama', type: 'local', status: 'available', models: ['llama3.1', 'qwen2.5:7b'] },
      { name: 'anthropic', type: 'cloud', status: 'available', models: ['claude-sonnet-4-6'] },
      { name: 'openai', type: 'cloud', status: 'available', models: ['gpt-4o-mini'] },
      { name: 'gemini', type: 'cloud', status: 'available', models: ['gemini-2.0-flash'] },
    ],
    ts: new Date().toISOString(),
  }),
)
