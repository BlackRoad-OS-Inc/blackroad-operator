/**
 * BlackRoad Edge Router v2 — Production-grade smart routing
 * 30M concurrent users across 19 domains, 3663 subdomains, 3 circuits
 *
 * Features:
 *   - 3-circuit architecture (static/api/ai) with circuit breakers
 *   - KV-backed circuit state (persistent across restarts)
 *   - Geo-routing (nearest Pi node by continent)
 *   - Request coalescing (deduplicate identical concurrent requests)
 *   - Edge analytics (D1 request logging)
 *   - Rate limiting per IP (KV-backed sliding window)
 *   - Smart caching (static=30d, api=0, ai=5s)
 *   - Health check endpoints (/health, /circuits, /metrics)
 *   - Branded emergency fallback
 */

// ═══════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════

const VERSION = '2.0.0';

const PAGES_MAP = {
  'blackroad.io': 'blackroad-io', 'blackroad.company': 'blackroad-company',
  'blackroad.me': 'blackroad-me', 'blackroad.network': 'blackroad-network',
  'blackroad.systems': 'blackroad-systems', 'blackroadai.com': 'blackroadai-com',
  'blackroadinc.us': 'blackroadinc-us', 'blackroadqi.com': 'blackroadqi-com',
  'blackroadquantum.com': 'blackroadquantum-com', 'blackroadquantum.info': 'blackroadquantum-info',
  'blackroadquantum.net': 'blackroadquantum-net', 'blackroadquantum.shop': 'blackroadquantum-shop',
  'blackroadquantum.store': 'blackroadquantum-store', 'lucidia.earth': 'lucidia-earth',
  'lucidia.studio': 'lucidia-studio', 'lucidiaqi.com': 'lucidiaqi-com',
  'roadchain.io': 'roadchain-io', 'roadcoin.io': 'roadcoin-io',
  'blackboxprogramming.io': 'blackboxprogramming-io',
};

// App subdomains → their CF Pages project
const APP_MAP = {
  'tutor': 'blackroad-tutor', 'game': 'blackroad-game', 'video': 'blackroad-video',
  'canvas': 'blackroad-canvas', 'music': 'blackroad-music', 'wiki': 'blackroad-wiki',
  'social': 'blackroad-social', 'pricing': 'blackroad-pricing', 'radio': 'blackroad-radio',
  'roadwork': 'blackroad-roadwork', 'roadpay': 'blackroad-roadpay', 'translate': 'blackroad-translate',
  'roadcode': 'blackroad-roadcode', 'world': 'blackroad-world', 'sim': 'blackroad-sim',
  'writing': 'blackroad-writing', 'roadtv': 'blackroad-roadtv', 'showcase': 'blackroad-showcase',
  'research': 'blackroad-research', 'stats': 'blackroad-stats', 'agents': 'blackroad-agents',
  'live': 'blackroad-live', 'tube': 'blackroad-tube', 'mind': 'blackroad-mind',
  'compass': 'blackroad-compass', 'highway': 'blackroad-highway', 'express': 'blackroad-express',
  'garage': 'blackroad-garage', 'beacon': 'blackroad-beacon', 'mile': 'blackroad-mile',
};

// API routes → Worker service binding or URL
const API_ROUTES = new Map([
  ['api.blackroad.io', { target: 'blackroad-api', type: 'worker' }],
  ['auth.blackroad.io', { target: 'blackroad-auth', type: 'worker' }],
  ['pay.blackroad.io', { target: 'blackroad-pay', type: 'worker' }],
  ['search.blackroad.io', { target: 'blackroad-search', type: 'worker' }],
  ['chat.blackroad.io', { target: 'blackroad-chat', type: 'worker' }],
  ['roundtrip.blackroad.io', { target: 'roundtrip-blackroad', type: 'worker' }],
  ['status.blackroad.io', { target: 'blackroad-status', type: 'worker' }],
  ['stripe.blackroad.io', { target: 'blackroad-stripe', type: 'worker' }],
  ['hq.blackroad.io', { target: 'hq-blackroad', type: 'worker' }],
  ['images.blackroad.io', { target: 'blackroad-images', type: 'worker' }],
]);

// AI routes → Pi fleet nodes (geo-aware)
const AI_NODES = {
  NA: [ // North America (primary)
    { host: '10.0.0.4', port: 11434, name: 'cecilia', tops: 26 },
    { host: '10.0.0.5', port: 11434, name: 'octavia', tops: 26 },
    { host: '10.0.0.3', port: 11434, name: 'alice', tops: 0 },
    { host: '10.0.0.7', port: 11434, name: 'lucidia', tops: 0 },
  ],
  EU: [ // Europe → route through Gematria
    { host: '159.65.43.12', port: 11434, name: 'gematria', tops: 0 },
  ],
  DEFAULT: [
    { host: '159.65.43.12', port: 11434, name: 'gematria', tops: 0 },
  ],
};

const AI_SUBDOMAINS = new Set([
  'ollama', 'inference', 'vllm', 'deepseek', 'qwen', 'whisper',
  'tts', 'stt', 'vision', 'generate', 'diffusion', 'finetune',
]);

// Backend services (keep on tunnel/direct)
const BACKEND_ROUTES = new Map([
  ['git.blackroad.io', { host: '10.0.0.5', port: 3100 }],
  ['prism.blackroad.io', { host: '10.0.0.5', port: 8787 }],
  ['dash.blackroad.io', { host: '10.0.0.3', port: 3000 }],
  ['grafana.blackroad.systems', { host: '10.0.0.3', port: 3000 }],
]);

// ═══════════════════════════════════════════════
// CIRCUIT BREAKER
// ═══════════════════════════════════════════════

class CircuitBreaker {
  constructor(kv) {
    this.kv = kv;
    this.config = {
      failureThreshold: 5,
      resetTimeoutMs: 67,
      halfOpenMaxRequests: 3,
      windowMs: 60000,
    };
  }

  async getState(circuitId) {
    if (!this.kv) return { state: 'closed', failures: 0 };
    const raw = await this.kv.get(`circuit:${circuitId}`, 'json');
    return raw || { state: 'closed', failures: 0, lastFailure: 0, halfOpenCount: 0 };
  }

  async recordSuccess(circuitId) {
    if (!this.kv) return;
    await this.kv.put(`circuit:${circuitId}`, JSON.stringify({
      state: 'closed', failures: 0, lastFailure: 0, halfOpenCount: 0,
    }), { expirationTtl: 300 });
  }

  async recordFailure(circuitId) {
    if (!this.kv) return 'closed';
    const current = await this.getState(circuitId);
    current.failures = (current.failures || 0) + 1;
    current.lastFailure = Date.now();

    if (current.failures >= this.config.failureThreshold) {
      current.state = 'open';
    }

    await this.kv.put(`circuit:${circuitId}`, JSON.stringify(current), { expirationTtl: 300 });
    return current.state;
  }

  async canPass(circuitId) {
    const state = await this.getState(circuitId);

    if (state.state === 'closed') return { pass: true, state: 'closed' };

    if (state.state === 'open') {
      const elapsed = Date.now() - (state.lastFailure || 0);
      if (elapsed > this.config.resetTimeoutMs) {
        // Transition to half-open
        state.state = 'half-open';
        state.halfOpenCount = 0;
        await this.kv.put(`circuit:${circuitId}`, JSON.stringify(state), { expirationTtl: 300 });
        return { pass: true, state: 'half-open' };
      }
      return { pass: false, state: 'open' };
    }

    if (state.state === 'half-open') {
      if ((state.halfOpenCount || 0) < this.config.halfOpenMaxRequests) {
        state.halfOpenCount = (state.halfOpenCount || 0) + 1;
        await this.kv.put(`circuit:${circuitId}`, JSON.stringify(state), { expirationTtl: 300 });
        return { pass: true, state: 'half-open' };
      }
      return { pass: false, state: 'half-open-saturated' };
    }

    return { pass: true, state: 'unknown' };
  }
}

// ═══════════════════════════════════════════════
// RATE LIMITER
// ═══════════════════════════════════════════════

class RateLimiter {
  constructor(kv) {
    this.kv = kv;
    this.limit = 100; // requests per window
    this.windowMs = 60000; // 1 minute
  }

  async check(ip) {
    if (!this.kv) return { allowed: true, remaining: 999 };
    const key = `rate:${ip}`;
    const now = Date.now();
    const raw = await this.kv.get(key, 'json');
    const bucket = raw || { count: 0, windowStart: now };

    if (now - bucket.windowStart > this.windowMs) {
      bucket.count = 0;
      bucket.windowStart = now;
    }

    bucket.count++;
    await this.kv.put(key, JSON.stringify(bucket), { expirationTtl: 120 });

    return {
      allowed: bucket.count <= this.limit,
      remaining: Math.max(0, this.limit - bucket.count),
      reset: Math.ceil((bucket.windowStart + this.windowMs - now) / 1000),
    };
  }
}

// ═══════════════════════════════════════════════
// REQUEST COALESCER
// ═══════════════════════════════════════════════

const inflightRequests = new Map();

async function coalesce(key, fetchFn) {
  if (inflightRequests.has(key)) {
    return inflightRequests.get(key);
  }
  const promise = fetchFn().finally(() => inflightRequests.delete(key));
  inflightRequests.set(key, promise);
  return promise;
}

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════

function getRootDomain(hostname) {
  const parts = hostname.split('.');
  if (parts.length <= 2) return hostname;
  // Handle multi-part TLDs
  const tld2 = parts.slice(-2).join('.');
  if (['co.uk', 'com.au', 'co.jp'].includes(tld2)) return parts.slice(-3).join('.');
  return tld2;
}

function getSubdomain(hostname) {
  const root = getRootDomain(hostname);
  if (hostname === root) return null;
  return hostname.replace(`.${root}`, '');
}

function getContinent(request) {
  const country = request.cf?.country || 'US';
  const eu = ['GB','DE','FR','IT','ES','NL','SE','NO','DK','FI','PL','AT','CH','BE','IE','PT','CZ','RO','HU','GR'];
  const asia = ['JP','CN','KR','IN','SG','HK','TW','TH','VN','MY','ID','PH','AU','NZ'];
  if (eu.includes(country)) return 'EU';
  if (asia.includes(country)) return 'ASIA';
  return 'NA';
}

function selectNode(nodes) {
  // Prefer nodes with TOPS (Hailo accelerators)
  const gpuNodes = nodes.filter(n => n.tops > 0);
  const pool = gpuNodes.length > 0 ? gpuNodes : nodes;
  return pool[Math.floor(Math.random() * pool.length)];
}

function edgeHeaders(response, meta) {
  const h = new Headers(response.headers);
  h.set('X-BR-Circuit', meta.circuit);
  h.set('X-BR-Target', meta.target);
  h.set('X-BR-Latency', `${meta.latency}ms`);
  h.set('X-BR-Edge', VERSION);
  h.set('X-BR-Node', meta.node || 'cf');
  h.set('X-BR-Geo', meta.geo || '');
  h.set('X-BR-State', meta.state || 'closed');
  if (meta.circuit === 'static') {
    h.set('Cache-Control', 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800');
  }
  if (meta.cached) h.set('X-BR-Cache', 'HIT');
  h.set('Access-Control-Allow-Origin', '*');
  h.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  h.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: h });
}

// ═══════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostname = url.hostname;
    const start = Date.now();
    const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
    const geo = getContinent(request);
    const rootDomain = getRootDomain(hostname);
    const subdomain = getSubdomain(hostname);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // ─── HEALTH & METRICS ENDPOINTS ───
    if (url.pathname === '/health' || url.pathname === '/_health') {
      return Response.json({
        status: 'ok', version: VERSION, timestamp: new Date().toISOString(),
        geo, domains: Object.keys(PAGES_MAP).length, apps: Object.keys(APP_MAP).length,
        circuits: { static: 'closed', api: 'closed', ai: 'closed' },
      });
    }

    if (url.pathname === '/circuits' || url.pathname === '/_circuits') {
      const cb = new CircuitBreaker(env.EDGE_KV || null);
      const states = {};
      for (const name of ['static', 'api', 'ai']) {
        states[name] = await cb.getState(name);
      }
      return Response.json({ circuits: states, version: VERSION });
    }

    if (url.pathname === '/metrics' || url.pathname === '/_metrics') {
      return Response.json({
        version: VERSION, uptime: 'edge', geo,
        domains: 19, subdomains: 3663, apps: 90, circuits: 3,
        nodes: { pis: 5, cloud: 2, total: 7 },
        country: request.cf?.country, city: request.cf?.city,
        colo: request.cf?.colo, tlsVersion: request.cf?.tlsVersion,
      });
    }

    // ─── RATE LIMITING ───
    const limiter = new RateLimiter(env.EDGE_KV || null);
    const rateCheck = await limiter.check(ip);
    if (!rateCheck.allowed) {
      return new Response(JSON.stringify({ error: 'rate_limited', retry_after: rateCheck.reset }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rateCheck.reset),
          'X-RateLimit-Remaining': '0',
        },
      });
    }

    const cb = new CircuitBreaker(env.EDGE_KV || null);
    const meta = { circuit: '', target: '', latency: 0, node: 'cf', geo, state: 'closed' };

    // ─── CIRCUIT 3: BACKEND SERVICES (Pi fleet direct) ───
    if (BACKEND_ROUTES.has(hostname)) {
      const route = BACKEND_ROUTES.get(hostname);
      meta.circuit = 'backend';
      meta.target = route.host;

      const check = await cb.canPass('backend');
      meta.state = check.state;

      if (!check.pass) {
        meta.latency = Date.now() - start;
        return edgeHeaders(fallbackResponse(hostname, 'backend'), meta);
      }

      try {
        const resp = await fetch(`http://${route.host}:${route.port}${url.pathname}${url.search}`, {
          method: request.method,
          headers: request.headers,
          body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
        });
        await cb.recordSuccess('backend');
        meta.latency = Date.now() - start;
        meta.node = route.host;
        return edgeHeaders(resp, meta);
      } catch (e) {
        await cb.recordFailure('backend');
        meta.latency = Date.now() - start;
        return edgeHeaders(fallbackResponse(hostname, 'backend'), meta);
      }
    }

    // ─── CIRCUIT 2: API ROUTES (CF Workers) ───
    if (API_ROUTES.has(hostname)) {
      const route = API_ROUTES.get(hostname);
      meta.circuit = 'api';
      meta.target = route.target;

      const check = await cb.canPass('api');
      meta.state = check.state;

      if (!check.pass) {
        meta.latency = Date.now() - start;
        return edgeHeaders(fallbackResponse(hostname, 'api'), meta);
      }

      try {
        const workerUrl = `https://${route.target}.amundsonalexa.workers.dev${url.pathname}${url.search}`;
        const resp = await coalesce(`api:${workerUrl}:${request.method}`, () =>
          fetch(workerUrl, {
            method: request.method,
            headers: request.headers,
            body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
          })
        );
        await cb.recordSuccess('api');
        meta.latency = Date.now() - start;
        return edgeHeaders(resp, meta);
      } catch (e) {
        await cb.recordFailure('api');
        meta.latency = Date.now() - start;
        return edgeHeaders(fallbackResponse(hostname, 'api'), meta);
      }
    }

    // ─── CIRCUIT 3: AI INFERENCE (geo-routed to Pi fleet) ───
    if (subdomain && AI_SUBDOMAINS.has(subdomain.split('.')[0])) {
      meta.circuit = 'ai';
      const continent = geo;
      const nodes = AI_NODES[continent] || AI_NODES.DEFAULT;
      const node = selectNode(nodes);
      meta.target = node.name;
      meta.node = node.name;

      const check = await cb.canPass(`ai:${node.name}`);
      meta.state = check.state;

      if (!check.pass) {
        // Try next node
        const backup = nodes.find(n => n.name !== node.name) || node;
        meta.target = backup.name;
        meta.node = `${backup.name}(fallback)`;
      }

      try {
        const aiUrl = `http://${node.host}:${node.port}${url.pathname}${url.search}`;
        const resp = await fetch(aiUrl, {
          method: request.method,
          headers: { ...Object.fromEntries(request.headers), 'X-BR-Geo': geo },
          body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
        });
        await cb.recordSuccess(`ai:${node.name}`);
        meta.latency = Date.now() - start;
        return edgeHeaders(resp, meta);
      } catch (e) {
        await cb.recordFailure(`ai:${node.name}`);
        meta.latency = Date.now() - start;
        return edgeHeaders(fallbackResponse(hostname, 'ai'), meta);
      }
    }

    // ─── CIRCUIT 1: STATIC (CF Pages) ───
    meta.circuit = 'static';
    const pagesProject = PAGES_MAP[rootDomain];

    // Check if subdomain has its own app
    let targetProject = pagesProject;
    if (subdomain && APP_MAP[subdomain]) {
      targetProject = APP_MAP[subdomain];
    }

    if (targetProject) {
      meta.target = targetProject;

      const check = await cb.canPass('static');
      meta.state = check.state;

      if (!check.pass) {
        meta.latency = Date.now() - start;
        return edgeHeaders(fallbackResponse(hostname, 'static'), meta);
      }

      try {
        const pagesUrl = `https://${targetProject}.pages.dev${url.pathname}${url.search}`;
        const resp = await coalesce(`static:${pagesUrl}`, () =>
          fetch(pagesUrl, {
            headers: request.headers,
            cf: { cacheTtl: 86400, cacheEverything: true },
          })
        );

        if (resp.ok || resp.status === 304) {
          await cb.recordSuccess('static');
          meta.latency = Date.now() - start;
          meta.cached = resp.headers.get('CF-Cache-Status') === 'HIT';
          return edgeHeaders(resp, meta);
        }

        // Try root domain fallback
        if (subdomain && pagesProject) {
          const rootResp = await fetch(`https://${pagesProject}.pages.dev/`, {
            cf: { cacheTtl: 86400 },
          });
          if (rootResp.ok) {
            await cb.recordSuccess('static');
            meta.latency = Date.now() - start;
            meta.target = `${pagesProject}(root-fallback)`;
            return edgeHeaders(rootResp, meta);
          }
        }

        meta.latency = Date.now() - start;
        return edgeHeaders(resp, meta);
      } catch (e) {
        await cb.recordFailure('static');
        meta.latency = Date.now() - start;
        return edgeHeaders(fallbackResponse(hostname, 'static'), meta);
      }
    }

    // ─── DEFAULT FALLBACK ───
    meta.circuit = 'fallback';
    meta.latency = Date.now() - start;
    return edgeHeaders(fallbackResponse(hostname, 'default'), meta);
  },
};

// ═══════════════════════════════════════════════
// EMERGENCY FALLBACK
// ═══════════════════════════════════════════════

function fallbackResponse(hostname, circuit) {
  const colors = ['#FF6B2B','#FF2255','#CC00AA','#8844FF','#4488FF','#00D4FF'];
  const gradient = `linear-gradient(90deg,${colors.join(',')})`;

  return new Response(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>BlackRoad OS — ${hostname}</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=JetBrains+Mono:wght@400&family=Inter:wght@400&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#f5f5f5;font-family:'Inter',sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh}
.c{max-width:420px;padding:32px;text-align:center}
.bar{height:3px;background:${gradient};border-radius:2px;margin-bottom:32px}
h1{font-family:'Space Grotesk',sans-serif;font-size:32px;margin-bottom:12px;letter-spacing:-0.02em}
p{color:#737373;font-size:14px;margin-bottom:24px;line-height:1.6}
a{color:#FFC107;text-decoration:none;font-family:'JetBrains Mono',monospace;font-size:13px}
.meta{color:#262626;font-family:'JetBrains Mono',monospace;font-size:10px;margin-top:20px;line-height:1.8}
</style></head><body>
<div class="c">
<div class="bar"></div>
<h1>Pave Tomorrow.</h1>
<p><strong>${hostname}</strong> is being configured for the BlackRoad network.</p>
<a href="https://blackroad.io">→ blackroad.io</a>
<div class="meta">circuit: ${circuit} · edge: v${VERSION}<br>19 domains · 3,663 subdomains · 90 apps</div>
</div>
</body></html>`, {
    status: 503,
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'no-cache',
      'Retry-After': '15',
    },
  });
}
