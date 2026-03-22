// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
// blackroad-agents Cloudflare Worker — edge registry for AI agents + task marketplace.
// Routes: GET /health, GET /agents, GET /agents/:name,
//         GET /tasks, POST /tasks, GET /tasks/:id, PATCH /tasks/:id, POST /dispatch

export interface Env {
  ENVIRONMENT: string
  REGISTRY_VERSION: string
  // Optional: AGENTS_KV — add KV namespace for persistent task store
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })

const err = (msg: string, code = 400) =>
  json({ error: { message: msg, code } }, code)

// ─── Agent definitions ────────────────────────────────────────────────────────

const AGENTS = [
  { name: 'octavia', role: 'architect', status: 'available',
    capabilities: ['systems-design', 'strategy', 'infrastructure', 'orchestration'],
    model: 'claude-3-5-sonnet' },
  { name: 'lucidia', role: 'dreamer', status: 'available',
    capabilities: ['creative', 'vision', 'reasoning', 'philosophy'],
    model: 'claude-3-5-sonnet' },
  { name: 'alice', role: 'operator', status: 'available',
    capabilities: ['devops', 'automation', 'deployment', 'ci-cd'],
    model: 'claude-3-haiku' },
  { name: 'aria', role: 'interface', status: 'available',
    capabilities: ['frontend', 'ux', 'design', 'components'],
    model: 'claude-3-haiku' },
  { name: 'cipher', role: 'guardian', status: 'available',
    capabilities: ['security', 'encryption', 'audit', 'vulnerability-scanning'],
    model: 'claude-3-5-sonnet' },
  { name: 'prism', role: 'analyst', status: 'available',
    capabilities: ['data-analysis', 'patterns', 'metrics', 'reporting'],
    model: 'claude-3-haiku' },
  { name: 'echo', role: 'memory', status: 'available',
    capabilities: ['memory', 'retrieval', 'context', 'knowledge'],
    model: 'claude-3-haiku' },
] as const

type Agent = typeof AGENTS[number]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const START = Date.now()

function bestAgent(caps: string[]): Agent {
  if (!caps.length) return AGENTS[0]
  return AGENTS.find((a) => caps.some((c) => (a.capabilities as readonly string[]).includes(c))) ?? AGENTS[0]
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS })

    const url = new URL(request.url)
    const p = url.pathname
    const m = request.method

    // Health
    if (p === '/health' && m === 'GET') {
      return json({
        status: 'healthy',
        version: env.REGISTRY_VERSION ?? '1.0.0',
        environment: env.ENVIRONMENT ?? 'production',
        agentCount: AGENTS.length,
        uptime: Math.floor((Date.now() - START) / 1000),
        timestamp: new Date().toISOString(),
      })
    }

    // Agent list
    if (p === '/agents' && m === 'GET') {
      return json({ agents: AGENTS, total: AGENTS.length })
    }

    // Agent by name
    const agentM = p.match(/^\/agents\/([a-z]+)$/)
    if (agentM && m === 'GET') {
      const agent = AGENTS.find((a) => a.name === agentM[1])
      if (!agent) return err('Agent not found', 404)
      return json(agent)
    }

    // Dispatch: pick best agent for required capabilities
    if (p === '/dispatch' && m === 'POST') {
      let body: Record<string, unknown>
      try { body = await request.json() } catch { return err('Invalid JSON') }
      if (!body.task) return err('task description is required')
      const caps = (body.requiredCapabilities as string[]) ?? []
      const agent = bestAgent(caps)
      return json({
        agent: agent.name,
        role: agent.role,
        capabilities: agent.capabilities,
        model: agent.model,
        dispatchedAt: new Date().toISOString(),
      })
    }

    return err('Not found', 404)
  },
}
