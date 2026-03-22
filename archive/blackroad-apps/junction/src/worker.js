// Junction v1.0.0 — BlackRoad Unified API Gateway
// junction.blackroad.io
// Routes ANY request to the right BlackRoad service. One endpoint, every service.
// From Full-Stack Plan: "NGINX proxies the request to the appropriate application"
// Junction replaces that with an intelligent, AI-aware edge gateway.

const VERSION = '1.0.0';

// ── Service Registry ───────────────────────────────────────────
const SERVICES = {
  // Core
  roadcode:   { url: 'https://roadcode.blackroad.io',   name: 'RoadCode',   desc: 'Coding orchestration' },
  roundtrip:  { url: 'https://roundtrip.blackroad.io',  name: 'RoundTrip',  desc: 'Agent chat & orchestration' },
  search:     { url: 'https://search.blackroad.io',     name: 'RoadSearch', desc: 'Full-text search' },
  auth:       { url: 'https://auth.blackroad.io',       name: 'Auth',       desc: 'Authentication & JWT' },
  git:        { url: 'https://git.blackroad.io',        name: 'Gitea',      desc: 'Git hosting (414 repos)' },
  pay:        { url: 'https://pay.blackroad.io',        name: 'RoadPay',    desc: 'Billing & subscriptions' },
  hq:         { url: 'https://hq.blackroad.io',         name: 'HQ',         desc: 'Pixel headquarters' },
  chat:       { url: 'https://chat.blackroad.io',       name: 'Chat',       desc: 'Sovereign chat rooms' },
  ollama:     { url: 'https://ollama.gematria.blackroad.io', name: 'Ollama', desc: 'AI inference' },
  // New
  crossroads: { url: 'https://crossroads.blackroad.io', name: 'CrossRoads', desc: 'Decision engine' },
  bypass:     { url: 'https://bypass.blackroad.io',     name: 'ByPass',     desc: 'Code execution sandbox' },
  express:    { url: 'https://express.blackroad.io',    name: 'Express',    desc: 'One-click deploy' },
  signal:     { url: 'https://signal.blackroad.io',     name: 'Signal',     desc: 'Real-time events' },
  ramp:       { url: 'https://ramp.blackroad.io',       name: 'Ramp',       desc: 'Onboarding' },
  detour:     { url: 'https://detour.blackroad.io',     name: 'Detour',     desc: 'Feature flags' },
};

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Service,X-Junction-Key' };
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS } }); }

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    // Health
    if (path === '/api/health' || path === '/health') {
      return json({ status: 'alive', service: 'junction', version: VERSION, services: Object.keys(SERVICES).length, description: 'Unified API gateway for all BlackRoad services' });
    }

    // Service directory
    if (path === '/api/services') {
      return json(Object.entries(SERVICES).map(([id, s]) => ({ id, ...s })));
    }

    // Health check ALL services
    if (path === '/api/status') {
      const checks = await Promise.allSettled(
        Object.entries(SERVICES).map(async ([id, svc]) => {
          try {
            const r = await fetch(svc.url + '/api/health', { signal: AbortSignal.timeout(5000) });
            const d = await r.json().catch(() => ({}));
            return { id, name: svc.name, status: r.ok ? 'up' : 'degraded', http: r.status, ...d };
          } catch (e) { return { id, name: svc.name, status: 'down', error: e.message }; }
        })
      );
      const results = checks.map(c => c.status === 'fulfilled' ? c.value : { status: 'error' });
      const up = results.filter(r => r.status === 'up').length;
      return json({ gateway: 'junction', version: VERSION, checked_at: new Date().toISOString(), services: results, summary: { total: results.length, up, down: results.length - up } });
    }

    // ── Proxy: /api/route/{service}/{path} → service URL ────────
    const routeMatch = path.match(/^\/api\/route\/([^/]+)(\/.*)?$/);
    if (routeMatch) {
      const [, serviceId, servicePath] = routeMatch;
      const svc = SERVICES[serviceId];
      if (!svc) return json({ error: `Unknown service: ${serviceId}`, available: Object.keys(SERVICES) }, 404);

      const targetUrl = svc.url + (servicePath || '/');
      try {
        const headers = new Headers(request.headers);
        headers.set('X-Forwarded-By', 'junction');
        headers.delete('host');
        const proxyRes = await fetch(targetUrl, {
          method: request.method,
          headers,
          body: request.method !== 'GET' ? request.body : undefined,
          signal: AbortSignal.timeout(25000),
        });
        const responseHeaders = new Headers(proxyRes.headers);
        Object.entries(CORS).forEach(([k, v]) => responseHeaders.set(k, v));
        responseHeaders.set('X-Junction-Service', serviceId);
        return new Response(proxyRes.body, { status: proxyRes.status, headers: responseHeaders });
      } catch (e) {
        return json({ error: `Service ${serviceId} unreachable: ${e.message}` }, 502);
      }
    }

    // ── Smart route by X-Service header ─────────────────────────
    const serviceHeader = request.headers.get('X-Service');
    if (serviceHeader && SERVICES[serviceHeader]) {
      const svc = SERVICES[serviceHeader];
      try {
        const headers = new Headers(request.headers);
        headers.delete('host');
        headers.set('X-Forwarded-By', 'junction');
        const r = await fetch(svc.url + path, { method: request.method, headers, body: request.method !== 'GET' ? request.body : undefined, signal: AbortSignal.timeout(25000) });
        return new Response(r.body, { status: r.status, headers: { ...Object.fromEntries(r.headers), ...CORS, 'X-Junction-Service': serviceHeader } });
      } catch (e) { return json({ error: e.message }, 502); }
    }

    // Landing
    return json({
      service: 'Junction — BlackRoad API Gateway',
      version: VERSION,
      tagline: 'One endpoint. Every service.',
      usage: {
        'GET /api/services': 'List all services',
        'GET /api/status': 'Health check all services',
        'ANY /api/route/{service}/{path}': 'Proxy to any service (e.g. /api/route/roadcode/api/projects)',
        'ANY + X-Service header': 'Route by header',
      },
      services: Object.keys(SERVICES),
    });
  }
};
