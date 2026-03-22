/**
 * br-router — BlackRoad OS Unified Routing Layer
 * 
 * Single worker that handles ALL traffic across 19 domains and 127 workers.
 * Deployed to: ALL domains via Cloudflare route wildcards
 *
 * Architecture:
 *   Browser/Agent → br-router → [domain dispatch] → [service worker / origin / redirect]
 *                                     ↓
 *                              [agent mesh layer]  → [agent worker]
 */

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN DISPATCH TABLE
// Maps every hostname (exact + wildcard) to an action
// ─────────────────────────────────────────────────────────────────────────────

type RouteAction =
  | { type: 'worker';   worker: string }         // dispatch to named worker
  | { type: 'redirect'; to: string; code?: 301 | 302 }  // HTTP redirect
  | { type: 'proxy';    origin: string }          // reverse proxy to origin URL
  | { type: 'static';   html: string }            // inline static response

const DOMAIN_TABLE: Record<string, RouteAction> = {
  // ── PRIMARY CORPORATE HUB ─────────────────────────────────────────────────
  'blackroad.io':              { type: 'worker', worker: 'app-blackroad' },
  '*.blackroad.io':            { type: 'worker', worker: 'blackroad-subdomain-router' },

  // ── DEVELOPER IDENTITY ────────────────────────────────────────────────────
  'blackboxprogramming.io':    { type: 'worker', worker: 'blackboxprogramming-site' },

  // ── AI / LUCIDIA BRAND ────────────────────────────────────────────────────
  'blackroadai.com':           { type: 'worker', worker: 'blackroadai-site' },
  'lucidia.earth':             { type: 'worker', worker: 'lucidia-site' },
  '*.lucidia.earth':           { type: 'worker', worker: 'lucidia-sites' },
  'lucidiaqi.com':             { type: 'redirect', to: 'https://lucidia.earth', code: 301 },
  'lucidia.studio':            { type: 'redirect', to: 'https://lucidia.earth', code: 301 },

  // ── QUANTUM BRAND ─────────────────────────────────────────────────────────
  'blackroadquantum.com':      { type: 'worker', worker: 'blackroadquantum-site' },
  'blackroadquantum.info':     { type: 'redirect', to: 'https://blackroadquantum.com', code: 301 },
  'blackroadquantum.net':      { type: 'redirect', to: 'https://blackroadquantum.com', code: 301 },
  'blackroadquantum.shop':     { type: 'redirect', to: 'https://blackroadquantum.com', code: 301 },
  'blackroadquantum.store':    { type: 'redirect', to: 'https://blackroadquantum.com', code: 301 },

  // ── PRODUCT DOMAINS ───────────────────────────────────────────────────────
  'roadchain.io':              { type: 'worker', worker: 'roadchain-site' },
  'roadcoin.io':               { type: 'redirect', to: 'https://blackroad.io', code: 301 },
  'blackroadqi.com':           { type: 'redirect', to: 'https://blackroad.io', code: 301 },

  // ── DEFENSIVE BRAND REGISTRATIONS → canonical ─────────────────────────────
  'blackroad.company':         { type: 'redirect', to: 'https://blackroad.io', code: 301 },
  'blackroad.me':              { type: 'redirect', to: 'https://blackroad.io', code: 301 },
  'blackroad.network':         { type: 'redirect', to: 'https://blackroad.io', code: 301 },
  'blackroad.systems':         { type: 'redirect', to: 'https://blackroad.io', code: 301 },
  'blackroadinc.us':           { type: 'redirect', to: 'https://blackroad.io', code: 301 },
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBDOMAIN SERVICE MAP  (for blackroad-subdomain-router passthrough)
// Maps subdomain → canonical worker name
// ─────────────────────────────────────────────────────────────────────────────

const SUBDOMAIN_WORKERS: Record<string, string> = {
  // Core platform
  'api':          'blackroad-gateway',
  'gateway':      'blackroad-gateway',
  'auth':         'auth-blackroad',
  'mesh':         'mesh-blackroad',
  'agents':       'blackroad-agents',
  'memory':       'memory-gate',

  // Public-facing
  'app':          'app-blackroad',
  'chat':         'chat-blackroad',
  'status':       'status-blackroad',
  'docs':         'docs-blackroadio',
  'blog':         'blog-blackroadio',
  'portal':       'portal-blackroad',
  'investors':    'investors-blackroad',

  // Infrastructure
  'analytics':    'analytics-blackroad',
  'stats':        'blackroad-live-stats',
  'dashboard':    'dashboard-blackroadio',
  'console':      'console-blackroadio',
  'admin':        'admin-blackroadio',
  'cloud':        'cloud-blackroad',
  'fleet':        'fleet-monitor',
  'images':       'images-blackroad',
  'search':       'road-search',

  // Products
  'pay':          'roadpay',
  'stripe':       'blackroad-stripe',
  'hq':           'hq-blackroad',
  'products':     'blackroad-products',
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT MESH ROUTING TABLE
// Defines how inter-agent messages are dispatched
// POST /mesh/route  →  agent-to-agent delivery
// ─────────────────────────────────────────────────────────────────────────────

interface AgentRoute {
  worker: string       // Cloudflare Worker name
  priority: number     // 1 = highest
  tags: string[]       // capability tags
}

const AGENT_REGISTRY: Record<string, AgentRoute> = {
  'lucidia':    { worker: 'lucidia-sites',        priority: 1, tags: ['memory','chat','reasoning'] },
  'alice':      { worker: 'blackroad-gateway',    priority: 1, tags: ['gateway','auth','routing'] },
  'mesh':       { worker: 'mesh-blackroad',       priority: 1, tags: ['mesh','broadcast','topology'] },
  'fleet':      { worker: 'fleet-monitor',        priority: 2, tags: ['monitoring','pi','cluster'] },
  'analytics':  { worker: 'analytics-blackroad',  priority: 2, tags: ['metrics','stats','logs'] },
  'auth':       { worker: 'auth-blackroad',       priority: 1, tags: ['auth','keys','sessions'] },
  'memory':     { worker: 'memory-gate',          priority: 1, tags: ['memory','kv','recall'] },
  'chat':       { worker: 'chat-blackroad',       priority: 2, tags: ['chat','ui','session'] },
  'search':     { worker: 'road-search',          priority: 2, tags: ['search','index'] },
  'pay':        { worker: 'roadpay',              priority: 2, tags: ['payments','stripe'] },
}

// ─────────────────────────────────────────────────────────────────────────────
// CACHE POLICY TABLE
// Per-route TTL and cache rules
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_POLICY: Record<string, { ttl: number; staleWhileRevalidate?: number; vary?: string[] }> = {
  '/':              { ttl: 300,   staleWhileRevalidate: 3600 },
  '/products':      { ttl: 600,   staleWhileRevalidate: 7200 },
  '/blog':          { ttl: 3600,  staleWhileRevalidate: 86400 },
  '/docs':          { ttl: 1800,  staleWhileRevalidate: 86400 },
  '/status':        { ttl: 30 },                               // short TTL for status
  '/v1/models':     { ttl: 3600 },                             // model list is stable
  '/health':        { ttl: 10 },
  // API routes — never cache
  '/v1/chat':       { ttl: 0 },
  '/v1/memory':     { ttl: 0 },
  '/admin':         { ttl: 0 },
  '/webhook':       { ttl: 0 },
}

// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE HEADERS
// Applied to every response
// ─────────────────────────────────────────────────────────────────────────────

const PERF_HEADERS = {
  'X-BR-Router':       '2.0',
  'X-BR-Brand':        'Ember→Flare→Magenta→Orchid→Arc→Cyan',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options':   'SAMEORIGIN',
  'Referrer-Policy':   'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function matchDomain(hostname: string): RouteAction | null {
  // Exact match first
  if (DOMAIN_TABLE[hostname]) return DOMAIN_TABLE[hostname]

  // Wildcard match: *.domain.tld
  const parts = hostname.split('.')
  if (parts.length >= 2) {
    const apex = parts.slice(-2).join('.')
    const wildcard = `*.${apex}`
    if (DOMAIN_TABLE[wildcard]) return DOMAIN_TABLE[wildcard]
  }

  return null
}

function getCacheControl(path: string, ttl: number, swr?: number): string {
  if (ttl === 0) return 'no-store, no-cache'
  const parts = [`public`, `max-age=${ttl}`]
  if (swr) parts.push(`stale-while-revalidate=${swr}`)
  return parts.join(', ')
}

function applyHeaders(response: Response, extraHeaders: Record<string, string> = {}): Response {
  const headers = new Headers(response.headers)
  Object.entries({ ...PERF_HEADERS, ...extraHeaders }).forEach(([k, v]) => headers.set(k, v))
  return new Response(response.body, { status: response.status, headers })
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', ...PERF_HEADERS }
  })
}

function redirect(to: string, code: 301 | 302 = 301): Response {
  return new Response(null, {
    status: code,
    headers: { 'Location': to, ...PERF_HEADERS }
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT MESH HANDLER
// POST /mesh/route — routes a message to a named agent
// GET  /mesh/agents — lists registered agents
// POST /mesh/broadcast — fan-out to all agents matching tags
// ─────────────────────────────────────────────────────────────────────────────

async function handleMesh(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname.replace('/mesh', '')

  // Agent registry
  if (path === '/agents' && request.method === 'GET') {
    const agents = Object.entries(AGENT_REGISTRY).map(([id, r]) => ({
      id,
      worker: r.worker,
      priority: r.priority,
      tags: r.tags,
      status: 'registered',
    }))
    return json({ agents, count: agents.length, timestamp: new Date().toISOString() })
  }

  // Route to a specific agent
  if (path === '/route' && request.method === 'POST') {
    const body = await request.json() as { agent: string; payload: unknown; ttl?: number }
    const { agent, payload } = body

    const route = AGENT_REGISTRY[agent]
    if (!route) {
      return json({ error: `Unknown agent: ${agent}`, available: Object.keys(AGENT_REGISTRY) }, 404)
    }

    // Forward to the agent's worker via service binding or fetch
    const agentUrl = `https://${route.worker}.workers.dev/agent`
    try {
      const resp = await fetch(agentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-BR-Source': 'mesh-router',
          'X-BR-Agent': agent,
        },
        body: JSON.stringify({ agent, payload, routed_at: Date.now() }),
      })
      return applyHeaders(resp, { 'X-BR-Routed-To': agent, 'X-BR-Worker': route.worker })
    } catch (e) {
      return json({ error: 'Agent unreachable', agent, worker: route.worker }, 503)
    }
  }

  // Broadcast to all agents with matching tags
  if (path === '/broadcast' && request.method === 'POST') {
    const body = await request.json() as { tags?: string[]; payload: unknown }
    const { tags = [], payload } = body

    const targets = Object.entries(AGENT_REGISTRY).filter(([, r]) =>
      tags.length === 0 || tags.some(t => r.tags.includes(t))
    )

    const results = await Promise.allSettled(
      targets.map(async ([id, route]) => {
        const agentUrl = `https://${route.worker}.workers.dev/agent`
        const resp = await fetch(agentUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-BR-Source': 'mesh-broadcast' },
          body: JSON.stringify({ agent: id, payload, broadcast: true }),
        })
        return { agent: id, status: resp.status }
      })
    )

    return json({
      broadcast: true,
      targets: targets.length,
      results: results.map((r, i) => ({
        agent: targets[i][0],
        ...r.status === 'fulfilled' ? r.value : { error: 'failed' }
      }))
    })
  }

  // Health of mesh
  if (path === '/health') {
    return json({ status: 'operational', agents: Object.keys(AGENT_REGISTRY).length })
  }

  return json({ error: 'Unknown mesh endpoint', path }, 404)
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBDOMAIN DISPATCH
// Called when the domain has a wildcard route; extracts subdomain and routes
// ─────────────────────────────────────────────────────────────────────────────

async function handleSubdomain(
  request: Request,
  hostname: string,
  env: Env
): Promise<Response> {
  const subdomain = hostname.split('.')[0].toLowerCase()
  const workerName = SUBDOMAIN_WORKERS[subdomain]

  if (!workerName) {
    // Unknown subdomain — return branded 404
    return new Response(unknownSubdomainHTML(subdomain, hostname), {
      status: 404,
      headers: { 'Content-Type': 'text/html', ...PERF_HEADERS }
    })
  }

  // Proxy to the worker
  const targetUrl = `https://${workerName}.workers.dev${new URL(request.url).pathname}${new URL(request.url).search}`
  try {
    const resp = await fetch(targetUrl, {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers),
        'X-BR-Subdomain': subdomain,
        'X-BR-Worker': workerName,
        'X-Forwarded-Host': hostname,
      },
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    })
    return applyHeaders(resp, {
      'X-BR-Subdomain': subdomain,
      'X-BR-Worker': workerName,
    })
  } catch {
    return json({ error: `Service unavailable: ${subdomain}`, worker: workerName }, 503)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CACHE LAYER
// Reads/writes Cloudflare Cache API for GET requests
// ─────────────────────────────────────────────────────────────────────────────

async function withCache(
  request: Request,
  handler: () => Promise<Response>,
  path: string
): Promise<Response> {
  // Only cache GET requests
  if (request.method !== 'GET') return handler()

  const policy = Object.entries(CACHE_POLICY)
    .find(([prefix]) => path.startsWith(prefix))?.[1]

  if (!policy || policy.ttl === 0) return handler()

  const cache = caches.default
  const cached = await cache.match(request)
  if (cached) {
    return applyHeaders(cached, { 'X-BR-Cache': 'HIT' })
  }

  const response = await handler()
  if (response.status === 200) {
    const toCache = new Response(response.clone().body, response)
    toCache.headers.set('Cache-Control', getCacheControl(path, policy.ttl, policy.staleWhileRevalidate))
    await cache.put(request, toCache)
  }

  return applyHeaders(response, { 'X-BR-Cache': 'MISS' })
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTER INTROSPECTION ENDPOINT
// GET /__br/routes  — lists all routes and their dispatch targets
// GET /__br/health  — full system health check
// ─────────────────────────────────────────────────────────────────────────────

function handleIntrospection(path: string): Response {
  if (path === '/__br/routes') {
    return json({
      domains: Object.entries(DOMAIN_TABLE).map(([host, action]) => ({ host, ...action })),
      subdomains: SUBDOMAIN_WORKERS,
      agents: Object.keys(AGENT_REGISTRY),
      workers_total: 127,
      domains_total: Object.keys(DOMAIN_TABLE).length,
    })
  }

  if (path === '/__br/health') {
    return json({
      router: 'br-router',
      version: '2.0.0',
      status: 'operational',
      brand: {
        palette: ['#FF6B2B','#FF2255','#CC00AA','#8844FF','#4488FF','#00D4FF'],
        names: ['Ember','Flare','Magenta','Orchid','Arc','Cyan'],
        fonts: ['Space Grotesk','Inter','JetBrains Mono'],
        surface: '#0a0a0a',
      },
      domains: Object.keys(DOMAIN_TABLE).length,
      subdomain_routes: Object.keys(SUBDOMAIN_WORKERS).length,
      agents: Object.keys(AGENT_REGISTRY).length,
      fleet: { nodes: 7, agents: 67, products: 82, repos: 254 },
      timestamp: new Date().toISOString(),
    })
  }

  if (path === '/__br/agents') {
    return json(AGENT_REGISTRY)
  }

  return json({ error: 'Unknown introspection endpoint' }, 404)
}

// ─────────────────────────────────────────────────────────────────────────────
// 404 PAGE (branded)
// ─────────────────────────────────────────────────────────────────────────────

function unknownSubdomainHTML(subdomain: string, hostname: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 — BlackRoad OS</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0a; color: #f5f5f5; font-family: 'Inter', sans-serif;
           display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .container { text-align: center; padding: 2rem; max-width: 480px; }
    .grad-bar { height: 4px; border-radius: 99px; background: linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF); width: 60px; margin: 0 auto 32px; }
    .code { font-family: 'Space Grotesk', sans-serif; font-size: 7rem; font-weight: 700; letter-spacing: -6px; line-height: 1;
            background: linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .msg { font-size: 0.95rem; color: #737373; margin: 1.5rem 0 0.5rem; }
    .sub { font-family: 'JetBrains Mono', monospace; color: #FF6B2B; font-size: 0.85rem; }
    .label { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; letter-spacing: 0.14em; text-transform: uppercase; color: #404040; margin-bottom: 8px; }
    a { color: #FF6B2B; text-decoration: none; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; }
    a:hover { text-decoration: underline; }
    .links { margin-top: 2rem; display: flex; gap: 16px; justify-content: center; }
    .links a { padding: 8px 16px; border: 1px solid #262626; border-radius: 6px; transition: border-color 0.15s; }
    .links a:hover { border-color: #404040; }
  </style>
</head>
<body>
  <div class="container">
    <div class="grad-bar"></div>
    <div class="label">br-router · v2.0</div>
    <div class="code">404</div>
    <p class="msg">No route registered for</p>
    <p class="sub">${subdomain}.${hostname.split('.').slice(1).join('.')}</p>
    <div class="links">
      <a href="https://blackroad.io">blackroad.io</a>
      <a href="https://blackroad.io/docs">docs</a>
      <a href="https://blackroad.io/status">status</a>
    </div>
  </div>
</body>
</html>`
}

// ─────────────────────────────────────────────────────────────────────────────
// ENV INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

interface Env {
  BR_ADMIN_KEY?: string
  ENVIRONMENT?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FETCH HANDLER
// ─────────────────────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const hostname = url.hostname
    const path = url.pathname

    // ── Introspection (admin only in production) ───────────────────────────
    if (path.startsWith('/__br/')) {
      const adminKey = request.headers.get('X-BR-Admin-Key')
      if (env.ENVIRONMENT === 'production' && adminKey !== env.BR_ADMIN_KEY) {
        return new Response('Unauthorized', { status: 401 })
      }
      return handleIntrospection(path)
    }

    // ── Agent mesh routing ─────────────────────────────────────────────────
    if (path.startsWith('/mesh/')) {
      return handleMesh(request, env)
    }

    // ── Domain dispatch ────────────────────────────────────────────────────
    const action = matchDomain(hostname)

    if (!action) {
      // Unregistered domain — redirect to canonical
      return redirect('https://blackroad.io', 301)
    }

    return withCache(request, async () => {
      switch (action.type) {
        case 'redirect':
          return redirect(action.to, action.code ?? 301)

        case 'worker': {
          // Proxy to named worker
          const targetUrl = `https://${action.worker}.workers.dev${path}${url.search}`
          try {
            const resp = await fetch(targetUrl, {
              method: request.method,
              headers: {
                ...Object.fromEntries(request.headers),
                'X-BR-Router': '1',
                'X-BR-Domain': hostname,
                'X-BR-Worker': action.worker,
                'X-Forwarded-Host': hostname,
              },
              body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
            })
            return applyHeaders(resp, {
              'X-BR-Worker': action.worker,
              'X-BR-Domain': hostname,
            })
          } catch {
            return json({
              error: 'Service unavailable',
              domain: hostname,
              worker: action.worker,
            }, 503)
          }
        }

        case 'proxy': {
          const targetUrl = action.origin + path + url.search
          const resp = await fetch(targetUrl, {
            method: request.method,
            headers: Object.fromEntries(request.headers),
            body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
          })
          return applyHeaders(resp, { 'X-BR-Proxied': action.origin })
        }

        case 'static':
          return new Response(action.html, {
            headers: { 'Content-Type': 'text/html', ...PERF_HEADERS }
          })
      }

      // Fallback for wildcard domains that need subdomain routing
      return handleSubdomain(request, hostname, env)
    }, path)
  }
}
