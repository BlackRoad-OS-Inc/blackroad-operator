/**
 * BlackRoad OS — Tunnel Proxy Worker
 *
 * Unified tunneling proxy that routes requests across all BlackRoad services,
 * repos, and infrastructure. Acts as the central gateway for tunneling through
 * the entire ecosystem.
 *
 * Endpoints:
 *   GET  /                  — service info
 *   GET  /health            — health check
 *   GET  /routes            — list all registered routes
 *   POST /routes            — register a new route (auth required)
 *   DELETE /routes/:id      — remove a route (auth required)
 *   GET  /tunnel/:target/*  — proxy request through tunnel to target service
 *   GET  /repo/:org/:name/* — tunnel into a GitHub repo (raw file access)
 *   GET  /service/:name/*   — tunnel to a named service
 *   GET  /map               — full topology map of all tunneled services
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Tunnel-Target",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function requireAuth(request, env) {
  if (!env.AUTH_TOKEN) return true;
  const auth = request.headers.get("Authorization") || "";
  return auth.replace("Bearer ", "").trim() === env.AUTH_TOKEN;
}

// ─── Built-in service registry ──────────────────────────────────────────────

const BUILTIN_SERVICES = {
  // Cloudflare Workers
  "auth":           { url: "https://blackroad-auth.blackroad.workers.dev",          type: "worker" },
  "email":          { url: "https://blackroad-email.blackroad.workers.dev",         type: "worker" },
  "email-setup":    { url: "https://blackroad-email-setup.blackroad.workers.dev",   type: "worker" },
  "copilot-cli":    { url: "https://copilot-cli.blackroad.workers.dev",             type: "worker" },
  "repo-index":     { url: "https://blackroad-repo-index.blackroad.workers.dev",    type: "worker" },
  "search":         { url: "https://blackroad-search.blackroad.workers.dev",        type: "worker" },
  "worker-health":  { url: "https://blackroad-worker-health.blackroad.workers.dev", type: "worker" },
  "agents-api":     { url: "https://agents-api.blackroad.workers.dev",              type: "worker" },
  "command-center": { url: "https://command-center.blackroad.workers.dev",          type: "worker" },
  "tools-api":      { url: "https://tools-api.blackroad.workers.dev",               type: "worker" },

  // Cloudflare Pages
  "os":           { url: "https://os.blackroad.io",           type: "pages" },
  "products":     { url: "https://products.blackroad.io",     type: "pages" },
  "docs":         { url: "https://docs.blackroad.io",         type: "pages" },

  // Infrastructure
  "gateway":      { url: "http://127.0.0.1:8787",             type: "local" },
  "ollama":       { url: "http://127.0.0.1:11434",            type: "local" },
  "mcp-bridge":   { url: "http://127.0.0.1:8420",             type: "local" },

  // Raspberry Pi
  "pi-primary":   { url: "http://192.168.4.64:8080",          type: "pi" },
  "pi-secondary": { url: "http://192.168.4.38:8080",          type: "pi" },
  "pi-alternate": { url: "http://192.168.4.99:8080",          type: "pi" },

  // DigitalOcean
  "droplet":      { url: "http://159.65.43.12:8080",          type: "droplet" },
};

// ─── GitHub repo tunneling ──────────────────────────────────────────────────

async function fetchRepoContent(org, repo, path, env) {
  const headers = {
    Accept: "application/vnd.github.raw+json",
    "User-Agent": "BlackRoad-Tunnel-Proxy/1.0",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  }

  // Try raw content first
  const res = await fetch(
    `https://api.github.com/repos/${org}/${repo}/contents/${path}`,
    { headers }
  );

  if (!res.ok) {
    return json(
      { error: `GitHub: ${res.status} ${res.statusText}`, org, repo, path },
      res.status === 404 ? 404 : 502
    );
  }

  const contentType = res.headers.get("content-type") || "application/octet-stream";

  // If the response is JSON (directory listing), return as-is
  if (contentType.includes("application/json")) {
    const data = await res.json();
    if (Array.isArray(data)) {
      return json({
        org,
        repo,
        path: path || "/",
        type: "directory",
        entries: data.map((e) => ({
          name: e.name,
          type: e.type,
          size: e.size,
          path: e.path,
          download_url: e.download_url,
        })),
      });
    }
    return json(data);
  }

  // Return raw file content
  return new Response(res.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "X-Tunnel-Source": `github:${org}/${repo}`,
      "X-Tunnel-Path": path,
      ...CORS,
    },
  });
}

// ─── Service proxying ───────────────────────────────────────────────────────

async function proxyToService(serviceUrl, subpath, request) {
  const target = `${serviceUrl}${subpath}`;
  try {
    const proxyRes = await fetch(target, {
      method: request.method,
      headers: request.headers,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
    });

    const responseHeaders = new Headers(proxyRes.headers);
    responseHeaders.set("X-Tunnel-Target", target);
    Object.entries(CORS).forEach(([k, v]) => responseHeaders.set(k, v));

    return new Response(proxyRes.body, {
      status: proxyRes.status,
      headers: responseHeaders,
    });
  } catch (err) {
    return json({ error: `Tunnel failed: ${err.message}`, target }, 502);
  }
}

// ─── Custom routes from KV ──────────────────────────────────────────────────

async function getCustomRoutes(env) {
  if (!env.ROUTES) return {};
  const list = await env.ROUTES.list({ prefix: "route:" });
  const routes = {};
  for (const key of list.keys) {
    const val = await env.ROUTES.get(key.name);
    if (val) {
      const route = JSON.parse(val);
      routes[route.id] = route;
    }
  }
  return routes;
}

// ─── Router ─────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "") || "/";
    const method = request.method;

    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    // GET / — service info
    if (path === "/" && method === "GET") {
      return json({
        service: "blackroad-tunnel-proxy",
        version: "1.0.0",
        description:
          "Unified tunneling proxy for all BlackRoad services, repos, and infrastructure",
        endpoints: [
          "GET  /health",
          "GET  /routes",
          "POST /routes",
          "DELETE /routes/:id",
          "GET  /tunnel/:target/*",
          "GET  /repo/:org/:name/*",
          "GET  /service/:name/*",
          "GET  /map",
        ],
        builtin_services: Object.keys(BUILTIN_SERVICES).length,
        ts: new Date().toISOString(),
      });
    }

    // GET /health
    if (path === "/health" && method === "GET") {
      return json({
        ok: true,
        service: "blackroad-tunnel-proxy",
        routes_kv: !!env.ROUTES,
        github_token: !!env.GITHUB_TOKEN,
        builtin_services: Object.keys(BUILTIN_SERVICES).length,
        ts: new Date().toISOString(),
      });
    }

    // GET /map — full topology
    if (path === "/map" && method === "GET") {
      const customRoutes = await getCustomRoutes(env);
      return json({
        builtin: Object.entries(BUILTIN_SERVICES).map(([id, svc]) => ({
          id,
          ...svc,
          tunnel_path: `/service/${id}`,
        })),
        custom: Object.values(customRoutes),
        summary: {
          builtin: Object.keys(BUILTIN_SERVICES).length,
          custom: Object.keys(customRoutes).length,
          types: {
            worker: Object.values(BUILTIN_SERVICES).filter((s) => s.type === "worker").length,
            pages: Object.values(BUILTIN_SERVICES).filter((s) => s.type === "pages").length,
            local: Object.values(BUILTIN_SERVICES).filter((s) => s.type === "local").length,
            pi: Object.values(BUILTIN_SERVICES).filter((s) => s.type === "pi").length,
            droplet: Object.values(BUILTIN_SERVICES).filter((s) => s.type === "droplet").length,
          },
        },
        ts: new Date().toISOString(),
      });
    }

    // GET /routes
    if (path === "/routes" && method === "GET") {
      const customRoutes = await getCustomRoutes(env);
      return json({
        builtin: Object.entries(BUILTIN_SERVICES).map(([id, svc]) => ({ id, ...svc })),
        custom: Object.values(customRoutes),
      });
    }

    // POST /routes — register custom route
    if (path === "/routes" && method === "POST") {
      if (!requireAuth(request, env)) return json({ error: "Unauthorized" }, 401);
      let body;
      try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
      if (!body.id || !body.url) return json({ error: "id + url required" }, 400);

      const route = {
        id: body.id,
        url: body.url,
        type: body.type || "custom",
        description: body.description || "",
        created_at: new Date().toISOString(),
      };

      if (env.ROUTES) {
        await env.ROUTES.put(`route:${route.id}`, JSON.stringify(route), {
          expirationTtl: 86400 * 365,
        });
      }
      return json({ ok: true, route });
    }

    // DELETE /routes/:id
    const deleteRouteMatch = path.match(/^\/routes\/([^/]+)$/);
    if (deleteRouteMatch && method === "DELETE") {
      if (!requireAuth(request, env)) return json({ error: "Unauthorized" }, 401);
      const id = deleteRouteMatch[1];
      if (env.ROUTES) await env.ROUTES.delete(`route:${id}`);
      return json({ ok: true, deleted: id });
    }

    // GET /repo/:org/:name/* — tunnel into GitHub repo
    const repoMatch = path.match(/^\/repo\/([^/]+)\/([^/]+)(?:\/(.*))?$/);
    if (repoMatch && method === "GET") {
      const [, org, repo, subpath] = repoMatch;
      return fetchRepoContent(org, repo, subpath || "", env);
    }

    // GET /service/:name/* — tunnel to named service
    const serviceMatch = path.match(/^\/service\/([^/]+)(\/.*)?$/);
    if (serviceMatch) {
      const [, serviceName, subpath] = serviceMatch;
      const svc = BUILTIN_SERVICES[serviceName];

      if (!svc) {
        // Check custom routes
        if (env.ROUTES) {
          const raw = await env.ROUTES.get(`route:${serviceName}`);
          if (raw) {
            const route = JSON.parse(raw);
            return proxyToService(route.url, subpath || "", request);
          }
        }
        return json({ error: `Service "${serviceName}" not found` }, 404);
      }

      return proxyToService(svc.url, subpath || "", request);
    }

    // GET /tunnel/:target/* — generic tunnel by URL
    const tunnelMatch = path.match(/^\/tunnel\/(.+)$/);
    if (tunnelMatch && method === "GET") {
      const targetEncoded = tunnelMatch[1];
      let target;
      try {
        target = decodeURIComponent(targetEncoded);
        if (!target.startsWith("http")) target = `https://${target}`;
        new URL(target); // validate
      } catch {
        return json({ error: "Invalid tunnel target URL" }, 400);
      }
      return proxyToService(target, "", request);
    }

    return json({ error: `Not found: ${method} ${path}` }, 404);
  },
};
