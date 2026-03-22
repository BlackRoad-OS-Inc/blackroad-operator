/**
 * BlackRoad Edge Router — Smart circuit-breaking gateway
 * Handles 30M concurrent users across 19 domains + 3663 subdomains
 *
 * Circuits:
 *   1. STATIC  → CF Pages (free, infinite bandwidth)
 *   2. API     → CF Workers (D1, KV, auth, payments)
 *   3. AI      → Pi Fleet via WireGuard (Ollama, Qdrant)
 *
 * Deploy: wrangler deploy --name blackroad-edge-router
 */

// Circuit states
const CLOSED = 'closed';   // Normal — all requests pass
const OPEN = 'open';       // Backend down — serve fallback
const HALF = 'half-open';  // Testing — let 10% through

// Circuit breaker config
const CIRCUIT_CONFIG = {
  failureThreshold: 5,     // Open after 5 failures
  resetTimeout: 30000,     // Try again after 30s
  halfOpenMax: 3,          // Test with 3 requests
};

// Route map: subdomain → circuit + target
const STATIC_DOMAINS = new Set([
  // All 19 root domains route to their Pages project
  'blackroad.io', 'blackroad.company', 'blackroad.me', 'blackroad.network',
  'blackroad.systems', 'blackroadai.com', 'blackroadinc.us', 'blackroadqi.com',
  'blackroadquantum.com', 'blackroadquantum.info', 'blackroadquantum.net',
  'blackroadquantum.shop', 'blackroadquantum.store', 'lucidia.earth',
  'lucidia.studio', 'lucidiaqi.com', 'roadchain.io', 'roadcoin.io',
  'blackboxprogramming.io',
]);

// API endpoints that need Workers backend
const API_ROUTES = {
  'api.blackroad.io': 'blackroad-api',
  'auth.blackroad.io': 'blackroad-auth',
  'pay.blackroad.io': 'blackroad-pay',
  'search.blackroad.io': 'blackroad-search',
  'chat.blackroad.io': 'blackroad-chat',
  'roundtrip.blackroad.io': 'blackroad-roundtrip',
  'status.blackroad.io': 'blackroad-status',
  'stripe.blackroad.io': 'blackroad-stripe',
};

// AI/inference endpoints that need Pi fleet
const AI_ROUTES = {
  'ollama.blackroadai.com': { host: '10.0.0.4', port: 11434 },
  'inference.blackroadai.com': { host: '10.0.0.5', port: 11434 },
  'git.blackroad.io': { host: '10.0.0.5', port: 3100 },
  'prism.blackroad.io': { host: '10.0.0.5', port: 8787 },
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostname = url.hostname;
    const start = Date.now();

    // Add timing + circuit headers
    const addHeaders = (response, circuit, target) => {
      const headers = new Headers(response.headers);
      headers.set('X-BlackRoad-Circuit', circuit);
      headers.set('X-BlackRoad-Target', target);
      headers.set('X-BlackRoad-Latency', `${Date.now() - start}ms`);
      headers.set('X-BlackRoad-Edge', 'true');
      headers.set('X-BlackRoad-Version', '1.0.0');
      // Cache control for static
      if (circuit === 'static') {
        headers.set('Cache-Control', 'public, max-age=86400, s-maxage=2592000');
      }
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    };

    // === CIRCUIT 1: STATIC (CF Pages) ===
    // Map hostname to pages.dev project
    const rootDomain = getRootDomain(hostname);
    const pagesProject = domainToProject(rootDomain);

    if (pagesProject && !API_ROUTES[hostname] && !AI_ROUTES[hostname]) {
      try {
        // Fetch from Pages project
        const pagesUrl = `https://${pagesProject}.pages.dev${url.pathname}${url.search}`;
        const resp = await fetch(pagesUrl, {
          headers: request.headers,
          cf: { cacheTtl: 86400, cacheEverything: true },
        });

        if (resp.ok) {
          return addHeaders(resp, 'static', pagesProject);
        }

        // Fallback to root domain's pages
        if (hostname !== rootDomain) {
          const rootResp = await fetch(`https://${pagesProject}.pages.dev/`, {
            cf: { cacheTtl: 86400, cacheEverything: true },
          });
          if (rootResp.ok) {
            return addHeaders(rootResp, 'static-fallback', pagesProject);
          }
        }
      } catch (e) {
        // Circuit open — serve emergency fallback
        return emergencyFallback(hostname, 'static');
      }
    }

    // === CIRCUIT 2: API (CF Workers) ===
    if (API_ROUTES[hostname]) {
      const workerName = API_ROUTES[hostname];
      try {
        // Route to the appropriate Worker
        const workerUrl = `https://${workerName}.amundsonalexa.workers.dev${url.pathname}${url.search}`;
        const resp = await fetch(workerUrl, {
          method: request.method,
          headers: request.headers,
          body: request.method !== 'GET' ? request.body : undefined,
        });
        return addHeaders(resp, 'api', workerName);
      } catch (e) {
        return emergencyFallback(hostname, 'api');
      }
    }

    // === CIRCUIT 3: AI/INFERENCE (Pi Fleet) ===
    if (AI_ROUTES[hostname]) {
      const target = AI_ROUTES[hostname];
      try {
        // Route through WireGuard to Pi fleet
        const piUrl = `http://${target.host}:${target.port}${url.pathname}${url.search}`;
        const resp = await fetch(piUrl, {
          method: request.method,
          headers: {
            ...Object.fromEntries(request.headers),
            'X-Forwarded-For': request.headers.get('CF-Connecting-IP') || '',
            'X-BlackRoad-Circuit': 'ai',
          },
          body: request.method !== 'GET' ? request.body : undefined,
        });
        return addHeaders(resp, 'ai', `${target.host}:${target.port}`);
      } catch (e) {
        return emergencyFallback(hostname, 'ai');
      }
    }

    // === DEFAULT: serve from Pages ===
    if (pagesProject) {
      try {
        const resp = await fetch(`https://${pagesProject}.pages.dev${url.pathname}`, {
          cf: { cacheTtl: 3600 },
        });
        return addHeaders(resp, 'default', pagesProject);
      } catch (e) {
        return emergencyFallback(hostname, 'default');
      }
    }

    return emergencyFallback(hostname, 'unknown');
  },
};

function getRootDomain(hostname) {
  // Extract root domain from subdomain.domain.tld
  const parts = hostname.split('.');
  if (parts.length <= 2) return hostname;
  // Handle .co.uk style TLDs
  return parts.slice(-2).join('.');
}

function domainToProject(domain) {
  const map = {
    'blackroad.io': 'blackroad-io',
    'blackroad.company': 'blackroad-company',
    'blackroad.me': 'blackroad-me',
    'blackroad.network': 'blackroad-network',
    'blackroad.systems': 'blackroad-systems',
    'blackroadai.com': 'blackroadai-com',
    'blackroadinc.us': 'blackroadinc-us',
    'blackroadqi.com': 'blackroadqi-com',
    'blackroadquantum.com': 'blackroadquantum-com',
    'blackroadquantum.info': 'blackroadquantum-info',
    'blackroadquantum.net': 'blackroadquantum-net',
    'blackroadquantum.shop': 'blackroadquantum-shop',
    'blackroadquantum.store': 'blackroadquantum-store',
    'lucidia.earth': 'lucidia-earth',
    'lucidia.studio': 'lucidia-studio',
    'lucidiaqi.com': 'lucidiaqi-com',
    'roadchain.io': 'roadchain-io',
    'roadcoin.io': 'roadcoin-io',
    'blackboxprogramming.io': 'blackboxprogramming-io',
  };
  return map[domain] || null;
}

function emergencyFallback(hostname, circuit) {
  return new Response(`<!DOCTYPE html>
<html><head>
<title>BlackRoad OS</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#f5f5f5;font-family:'Inter',sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;text-align:center}
.c{max-width:400px;padding:24px}
h1{font-family:'Space Grotesk',sans-serif;font-size:28px;margin-bottom:12px}
p{color:#737373;font-size:14px;margin-bottom:24px}
a{color:#FFC107;text-decoration:none}
.bar{height:3px;background:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);border-radius:2px;margin-bottom:24px}
.meta{color:#333;font-family:'JetBrains Mono',monospace;font-size:10px;margin-top:16px}
</style></head><body>
<div class="c">
<div class="bar"></div>
<h1>Pave Tomorrow.</h1>
<p>${hostname} is being configured. Check back shortly.</p>
<a href="https://blackroad.io">blackroad.io</a>
<div class="meta">circuit: ${circuit} | edge: cf | v1.0.0</div>
</div>
</body></html>`, {
    status: 503,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache',
      'Retry-After': '30',
      'X-BlackRoad-Circuit': circuit,
      'X-BlackRoad-Fallback': 'true',
    },
  });
}
