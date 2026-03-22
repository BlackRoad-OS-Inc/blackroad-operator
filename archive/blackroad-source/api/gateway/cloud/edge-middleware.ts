/**
 * BlackRoad Cloud Gateway — Edge Middleware
 * Auth, rate limiting, CORS, logging at the edge
 */

export interface Env {
  BLACKROAD_API_KEY: string;
  RATE_LIMIT_KV: KVNamespace;
  GATEWAY_URL: string;
}

const RATE_LIMIT_WINDOW = 60;  // seconds
const RATE_LIMIT_MAX = 100;    // requests per window

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Health check
    if (url.pathname === "/health") {
      return Response.json({ status: "ok", gateway: env.GATEWAY_URL });
    }

    // Auth check
    const authError = checkAuth(request, env);
    if (authError) return authError;

    // Rate limiting
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const rateLimitError = await checkRateLimit(ip, env);
    if (rateLimitError) return rateLimitError;

    // Proxy to upstream gateway
    const upstream = new URL(url.pathname + url.search, env.GATEWAY_URL);
    const proxyResponse = await fetch(upstream.toString(), {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers),
        "X-Forwarded-For": ip,
        "X-BlackRoad-Edge": "cloudflare",
      },
      body: request.method !== "GET" ? request.body : undefined,
    });

    // Add security headers
    const headers = new Headers(proxyResponse.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

    return new Response(proxyResponse.body, {
      status: proxyResponse.status,
      headers,
    });
  },
};

function checkAuth(request: Request, env: Env): Response | null {
  const auth = request.headers.get("Authorization");
    // Allow unauthenticated health + public endpoints
    const url = new URL(request.url);
    if (url.pathname === "/health" || url.pathname.startsWith("/public/")) {
      return null;
    }
    return Response.json({ error: "Missing Authorization header" }, { status: 401 });
  }
  const token = auth.replace("Bearer ", "");
    return Response.json({ error: "Invalid API key" }, { status: 403 });
  }
  return null;
}

async function checkRateLimit(ip: string, env: Env): Promise<Response | null> {
  const key = ;
  const current = parseInt(await env.RATE_LIMIT_KV.get(key) || "0");
  if (current >= RATE_LIMIT_MAX) {
    return Response.json(
      { error: "Rate limit exceeded", retry_after: RATE_LIMIT_WINDOW },
      { status: 429, headers: { "Retry-After": String(RATE_LIMIT_WINDOW) } }
    );
  }
  await env.RATE_LIMIT_KV.put(key, String(current + 1), { expirationTtl: RATE_LIMIT_WINDOW * 2 });
  return null;
}
