/**
 * BlackRoad Cloud Gateway — Cloudflare Worker
 * Routes traffic across BlackRoad cloud infrastructure.
 * Tokenless: all secrets injected via Cloudflare environment bindings.
 */

export interface Env {
  // KV Namespaces
  CACHE: KVNamespace;
  // Environment
  ENVIRONMENT: string;
  BLACKROAD_API_URL: string;
  BLACKROAD_AGENTS_URL: string;
  BLACKROAD_MEMORY_URL: string;
  ALLOWED_ORIGINS: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-BlackRoad-Agent",
  "Access-Control-Max-Age": "86400",
};

function corsHeaders(origin: string, allowed: string): HeadersInit {
  const allowedList = allowed.split(",").map(o => o.trim());
  const allowOrigin = allowedList.includes(origin) || allowedList.includes("*")
    ? origin : allowedList[0];
  return { ...CORS_HEADERS, "Access-Control-Allow-Origin": allowOrigin };
}

async function proxyRequest(
  request: Request,
  target: string,
  path: string,
  env: Env
): Promise<Response> {
  const url = `${target}${path}`;
  const init: RequestInit = {
    method: request.method,
    headers: {
      "Content-Type": request.headers.get("Content-Type") || "application/json",
      "X-Forwarded-By": "blackroad-cloud-gateway",
      "X-Environment": env.ENVIRONMENT,
    },
  };
  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = request.body;
  }
  return fetch(url, init);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "*";
    const cors = corsHeaders(origin, env.ALLOWED_ORIGINS || "*");

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const path = url.pathname;

    // ── Health ─────────────────────────────────────────────
    if (path === "/" || path === "/health") {
      return Response.json({
        status: "ok",
        gateway: "blackroad-cloud-gateway",
        environment: env.ENVIRONMENT,
        timestamp: new Date().toISOString(),
        routes: ["/api", "/agents", "/memory", "/health"],
      }, { headers: cors });
    }

    // ── Agents ─────────────────────────────────────────────
    if (path.startsWith("/agents")) {
      const agentsUrl = env.BLACKROAD_AGENTS_URL;
      if (!agentsUrl) {
        return Response.json({ error: "Agents service not configured" }, { status: 503, headers: cors });
      }
      const upstream = await proxyRequest(request, agentsUrl, path, env);
      const data = await upstream.json();
      return Response.json(data, { status: upstream.status, headers: cors });
    }

    // ── Memory ─────────────────────────────────────────────
    if (path.startsWith("/memory")) {
      const memUrl = env.BLACKROAD_MEMORY_URL;
      if (!memUrl) {
        return Response.json({ error: "Memory service not configured" }, { status: 503, headers: cors });
      }
      // Cache GET requests in KV
      if (request.method === "GET" && env.CACHE) {
        const cacheKey = path + url.search;
        const cached = await env.CACHE.get(cacheKey);
        if (cached) {
          return Response.json(JSON.parse(cached), {
            headers: { ...cors, "X-Cache": "HIT" }
          });
        }
      }
      const upstream = await proxyRequest(request, memUrl, path, env);
      const data = await upstream.json();
      return Response.json(data, { status: upstream.status, headers: cors });
    }

    // ── API ────────────────────────────────────────────────
    if (path.startsWith("/api")) {
      const apiUrl = env.BLACKROAD_API_URL;
      if (!apiUrl) {
        return Response.json({ error: "API service not configured" }, { status: 503, headers: cors });
      }
      const upstream = await proxyRequest(request, apiUrl, path.replace("/api", ""), env);
      const data = await upstream.json();
      return Response.json(data, { status: upstream.status, headers: cors });
    }

    // ── 404 ────────────────────────────────────────────────
    return Response.json({
      error: "Not found",
      path,
      available: ["/health", "/agents", "/memory", "/api"],
    }, { status: 404, headers: cors });
  },
};
