// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth.js'

// Agent registry — the 6 core agents
const AGENTS = [
  {
    name: 'octavia',
    title: 'The Architect',
    role: 'Systems design, strategy, infrastructure planning',
    color: '#9C27B0',
    status: 'active' as const,
    capabilities: ['architecture', 'planning', 'systems-design', 'code-review'],
    model: 'claude-sonnet-4-6',
  },
  {
    name: 'lucidia',
    title: 'The Dreamer',
    role: 'Creative vision, philosophy, reasoning',
    color: '#00BCD4',
    status: 'active' as const,
    capabilities: ['creative', 'reasoning', 'philosophy', 'vision'],
    model: 'claude-sonnet-4-6',
  },
  {
    name: 'alice',
    title: 'The Operator',
    role: 'DevOps, automation, routing, task distribution',
    color: '#4CAF50',
    status: 'active' as const,
    capabilities: ['devops', 'automation', 'deployment', 'routing'],
    model: 'claude-sonnet-4-6',
  },
  {
    name: 'cipher',
    title: 'The Guardian',
    role: 'Security, authentication, encryption, auditing',
    color: '#2979FF',
    status: 'active' as const,
    capabilities: ['security', 'auth', 'encryption', 'auditing'],
    model: 'claude-sonnet-4-6',
  },
  {
    name: 'prism',
    title: 'The Analyst',
    role: 'Pattern recognition, data analysis, metrics',
    color: '#FFC107',
    status: 'active' as const,
    capabilities: ['analytics', 'patterns', 'data', 'metrics'],
    model: 'claude-sonnet-4-6',
  },
  {
    name: 'echo',
    title: 'The Memory',
    role: 'Storage, recall, context preservation, history',
    color: '#9C27B0',
    status: 'active' as const,
    capabilities: ['memory', 'storage', 'context', 'history'],
    model: 'claude-sonnet-4-6',
  },
]

export const agentRoutes = new Hono()

// GET /v1/agents — list all agents
agentRoutes.get('/', (c) =>
  c.json({
    agents: AGENTS,
    total: AGENTS.length,
    ts: new Date().toISOString(),
  }),
)

// GET /v1/agents/:name — get agent details
agentRoutes.get('/:name', (c) => {
  const name = c.req.param('name').toLowerCase()
  const agent = AGENTS.find((a) => a.name === name)
  if (!agent) {
    return c.json({ error: 'agent_not_found', message: `Agent "${name}" not found` }, 404)
  }
  return c.json({ agent })
})

// POST /v1/agents/:name/invoke — invoke an agent with a task
agentRoutes.post('/:name/invoke', authMiddleware('agents:invoke'), async (c) => {
  const name = c.req.param('name').toLowerCase()
  const agent = AGENTS.find((a) => a.name === name)
  if (!agent) {
    return c.json({ error: 'agent_not_found', message: `Agent "${name}" not found` }, 404)
  }

  const body = await c.req.json<{ task: string; context?: Record<string, unknown> }>()
  if (!body.task) {
    return c.json({ error: 'validation_error', message: 'task is required' }, 400)
  }

  // Forward to gateway if configured
  const gatewayUrl = process.env['BLACKROAD_GATEWAY_URL']
  if (gatewayUrl) {
    try {
      const res = await fetch(`${gatewayUrl}/v1/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: name,
          intent: 'general',
          input: body.task,
          context: body.context ?? {},
        }),
      })
      const data = (await res.json()) as Record<string, unknown>
      return c.json({
        agent: name,
        status: data['status'] ?? 'ok',
        output: data['output'] ?? '',
        provider: data['provider'] ?? 'unknown',
        metadata: data['metadata'] ?? {},
      })
    } catch (err) {
      return c.json(
        {
          error: 'gateway_error',
          message: err instanceof Error ? err.message : 'Gateway unreachable',
        },
        502,
      )
    }
  }

  // No gateway — return mock acknowledgment
  return c.json({
    agent: name,
    status: 'queued',
    task_id: crypto.randomUUID(),
    message: `Task queued for ${agent.title}. Gateway not configured for live inference.`,
    ts: new Date().toISOString(),
  })
})

// GET /v1/agents/:name/capabilities — agent capabilities
agentRoutes.get('/:name/capabilities', (c) => {
  const name = c.req.param('name').toLowerCase()
  const agent = AGENTS.find((a) => a.name === name)
  if (!agent) {
    return c.json({ error: 'agent_not_found' }, 404)
  }
  return c.json({
    agent: agent.name,
    capabilities: agent.capabilities,
    model: agent.model,
    status: agent.status,
  })
})
