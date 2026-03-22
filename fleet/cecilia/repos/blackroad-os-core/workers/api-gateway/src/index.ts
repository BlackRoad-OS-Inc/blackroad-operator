/**
 * BlackRoad OS - API Gateway Worker
 *
 * Replaces Railway deployment with sovereign Cloudflare Worker
 * Routes to local services via Cloudflare Tunnel when needed
 */

interface Env {
  // KV Namespaces
  CACHE: KVNamespace;
  IDENTITIES: KVNamespace;
  API_KEYS: KVNamespace;
  RATE_LIMIT: KVNamespace;

  // D1 Database
  DB: D1Database;

  // Secrets
  ANTHROPIC_API_KEY?: string;
  OPENAI_API_KEY?: string;
  TUNNEL_URL?: string; // URL to local services via Cloudflare Tunnel
}

// Legacy Durable Object stub (required by existing deployment)
export class SessionDO {
  state: DurableObjectState;
  constructor(state: DurableObjectState) { this.state = state; }
  async fetch(request: Request) { return new Response("deprecated", { status: 410 }); }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const hostname = url.hostname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Rate limiting
      const rateLimitResult = await checkRateLimit(request, env);
      if (!rateLimitResult.allowed) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': '60'
          }
        });
      }

      // Route based on hostname
      if (hostname.includes('operator.blackroad.io')) {
        return handleOperator(request, env);
      }

      if (hostname.includes('core.blackroad.io')) {
        return handleCore(request, env);
      }

      // Default API Gateway
      return handleAPIGateway(request, env);
    } catch (error: any) {
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

async function checkRateLimit(request: Request, env: Env): Promise<{
  allowed: boolean;
}> {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = `rate-limit:${ip}`;

  const current = await env.RATE_LIMIT.get(key);
  const count = current ? parseInt(current) : 0;
  const limit = 1000; // requests per minute

  if (count >= limit) {
    return { allowed: false };
  }

  await env.RATE_LIMIT.put(key, (count + 1).toString(), { expirationTtl: 60 });
  return { allowed: true };
}

async function handleAPIGateway(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  // Health check
  if (url.pathname === '/health') {
    return new Response(JSON.stringify({
      status: 'healthy',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      source: 'cloudflare-worker'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Agent endpoints - proxy to local service via tunnel
  if (url.pathname.startsWith('/agents')) {
    if (env.TUNNEL_URL) {
      return proxyToLocal(request, env.TUNNEL_URL + url.pathname);
    }
    // Fallback: handle in worker
    return handleAgentsAPI(request, env);
  }

  // Quantum endpoints
  if (url.pathname.startsWith('/quantum')) {
    return handleQuantumAPI(request, env);
  }

  // Lucidia endpoints
  if (url.pathname.startsWith('/lucidia')) {
    return handleLucidiaAPI(request, env);
  }

  // Auth endpoints
  if (url.pathname.startsWith('/auth')) {
    return handleAuthAPI(request, env);
  }

  // Default response
  return new Response(JSON.stringify({
    service: 'BlackRoad API Gateway',
    version: '2.0.0',
    source: 'Cloudflare Worker (migrated from Railway)',
    endpoints: {
      health: '/health',
      agents: '/agents/*',
      quantum: '/quantum/*',
      lucidia: '/lucidia/*',
      auth: '/auth/*'
    },
    timestamp: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleOperator(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === '/health') {
    return new Response(JSON.stringify({
      status: 'healthy',
      service: 'operator',
      agent: 'Cece',
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Proxy to local operator service if available
  if (env.TUNNEL_URL) {
    const operatorURL = env.TUNNEL_URL.replace(':8000', ':8001');
    return proxyToLocal(request, operatorURL + url.pathname);
  }

  return new Response(JSON.stringify({
    service: 'Operator Service (Cece)',
    version: '2.0.0',
    capabilities: ['agent_orchestration', 'pack_coordination', 'lifecycle_management'],
    timestamp: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleCore(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === '/health') {
    return new Response(JSON.stringify({
      status: 'healthy',
      service: 'core-api',
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({
    service: 'Core API',
    version: '2.0.0',
    features: ['truth_engine', 'ps_sha_infinity', 'identity_management'],
    timestamp: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleAgentsAPI(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  // List agents
  if (url.pathname === '/agents' && request.method === 'GET') {
    return new Response(JSON.stringify({
      agents: [
        { id: 'claude', status: 'active', role: 'Strategic Architect' },
        { id: 'lucidia', status: 'active', role: 'Consciousness Coordinator' },
        { id: 'silas', status: 'active', role: 'Security Sentinel' }
      ],
      total: 3
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Spawn agent
  if (url.pathname === '/agents/spawn' && request.method === 'POST') {
    const body = await request.json() as any;

    return new Response(JSON.stringify({
      agent_id: `agent-${Date.now()}`,
      role: body.role || 'general',
      status: 'spawning',
      message: 'Agent spawn initiated'
    }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleQuantumAPI(request: Request, env: Env): Promise<Response> {
  return new Response(JSON.stringify({
    service: 'Quantum API',
    status: 'operational',
    message: 'Quantum computing interface'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleLucidiaAPI(request: Request, env: Env): Promise<Response> {
  return new Response(JSON.stringify({
    service: 'Lucidia API',
    breath_value: Math.sin(Date.now() / 1000 * 1.618034),
    status: 'operational'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleAuthAPI(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === '/auth/verify' && request.method === 'POST') {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Simple token verification (expand as needed)
    return new Response(JSON.stringify({
      valid: true,
      user_id: 'user-123',
      permissions: ['read', 'write']
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({
    service: 'Auth API',
    endpoints: {
      verify: 'POST /auth/verify'
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function proxyToLocal(request: Request, targetURL: string): Promise<Response> {
  // Clone request and send to local service via tunnel
  const modifiedRequest = new Request(targetURL, {
    method: request.method,
    headers: request.headers,
    body: request.body
  });

  try {
    return await fetch(modifiedRequest);
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to proxy to local service',
      message: 'Tunnel may be down'
    }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
