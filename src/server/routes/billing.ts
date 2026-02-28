// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth.js'

// Plans and pricing
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price_monthly: 0,
    limits: {
      requests_per_day: 100,
      agents: 2,
      models: ['ollama'],
      storage_mb: 100,
      support: 'community',
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    price_monthly: 49,
    limits: {
      requests_per_day: 10_000,
      agents: 6,
      models: ['ollama', 'claude', 'openai', 'gemini'],
      storage_mb: 10_000,
      support: 'email',
    },
  },
  {
    id: 'team',
    name: 'Team',
    price_monthly: 199,
    limits: {
      requests_per_day: 100_000,
      agents: 30,
      models: ['ollama', 'claude', 'openai', 'gemini'],
      storage_mb: 100_000,
      support: 'priority',
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price_monthly: null, // custom pricing
    limits: {
      requests_per_day: null, // unlimited
      agents: null, // unlimited
      models: ['ollama', 'claude', 'openai', 'gemini'],
      storage_mb: null, // unlimited
      support: 'dedicated',
    },
  },
]

// In-memory usage tracking (replace with persistent store in production)
const usageStore = new Map<
  string,
  {
    requests_today: number
    requests_total: number
    tokens_total: number
    last_reset: string
    plan: string
  }
>()

function getOrCreateUsage(sub: string) {
  if (!usageStore.has(sub)) {
    usageStore.set(sub, {
      requests_today: 0,
      requests_total: 0,
      tokens_total: 0,
      last_reset: new Date().toISOString().split('T')[0],
      plan: 'free',
    })
  }
  const usage = usageStore.get(sub)!
  // Reset daily counter if date changed
  const today = new Date().toISOString().split('T')[0]
  if (usage.last_reset !== today) {
    usage.requests_today = 0
    usage.last_reset = today
  }
  return usage
}

export const billingRoutes = new Hono()

// GET /v1/billing/plans — list available plans
billingRoutes.get('/plans', (c) =>
  c.json({
    plans: PLANS,
    currency: 'USD',
    billing_cycle: 'monthly',
    ts: new Date().toISOString(),
  }),
)

// GET /v1/billing/usage — get usage for authenticated user
billingRoutes.get('/usage', authMiddleware('billing:read'), (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const identity = (c as any).get('identity') as { sub?: string } | undefined
  const sub = identity?.sub ?? 'unknown'
  const usage = getOrCreateUsage(sub)
  const plan = PLANS.find((p) => p.id === usage.plan) ?? PLANS[0]

  return c.json({
    sub,
    plan: plan.id,
    plan_name: plan.name,
    usage: {
      requests_today: usage.requests_today,
      requests_total: usage.requests_total,
      tokens_total: usage.tokens_total,
      daily_limit: plan.limits.requests_per_day,
      remaining_today: plan.limits.requests_per_day
        ? Math.max(0, plan.limits.requests_per_day - usage.requests_today)
        : null,
    },
    ts: new Date().toISOString(),
  })
})

// POST /v1/billing/record — record usage (internal, called by gateway)
billingRoutes.post('/record', authMiddleware('billing:write'), async (c) => {
  let body: { sub: string; requests?: number; tokens?: number }
  try {
    body = await c.req.json<{ sub: string; requests?: number; tokens?: number }>()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }
  if (!body.sub) return c.json({ error: 'sub required' }, 400)

  const usage = getOrCreateUsage(body.sub)
  usage.requests_today += body.requests ?? 1
  usage.requests_total += body.requests ?? 1
  usage.tokens_total += body.tokens ?? 0

  return c.json({ ok: true, usage })
})

// GET /v1/billing/quota — check if user has quota remaining
billingRoutes.get('/quota', authMiddleware('billing:read'), (c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const identity = (c as any).get('identity') as { sub?: string } | undefined
  const sub = identity?.sub ?? 'unknown'
  const usage = getOrCreateUsage(sub)
  const plan = PLANS.find((p) => p.id === usage.plan) ?? PLANS[0]
  const limit = plan.limits.requests_per_day
  const allowed = limit === null || usage.requests_today < limit

  return c.json({
    sub,
    plan: plan.id,
    allowed,
    requests_today: usage.requests_today,
    daily_limit: limit,
  })
})
