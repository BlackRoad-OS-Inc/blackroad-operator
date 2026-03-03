/**
 * BlackRoad OS — Worker Health Monitor
 *
 * Monitors all Cloudflare Workers, Pages projects, and infrastructure services.
 * Runs health checks on a schedule and exposes a dashboard API.
 *
 * Endpoints:
 *   GET  /              — service info
 *   GET  /health        — self health check
 *   GET  /status        — full status of all monitored services
 *   GET  /status/:name  — status of a single service
 *   GET  /history       — recent health check history
 *   GET  /dashboard     — HTML dashboard
 *   POST /check         — trigger an immediate health check (auth required)
 *   POST /register      — register a new service to monitor (auth required)
 *   DELETE /services/:name — remove a monitored service (auth required)
 *
 * Scheduled:
 *   Every 10 minutes — health check all registered services
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
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

// ─── Default monitored workers ──────────────────────────────────────────────

const DEFAULT_SERVICES = [
  // Root workers (this repo)
  { name: "blackroad-auth",         url: "https://blackroad-auth.blackroad.workers.dev/auth/status",   type: "worker",  category: "core" },
  { name: "copilot-cli",            url: "https://copilot-cli.blackroad.workers.dev/health",           type: "worker",  category: "mesh" },
  { name: "blackroad-email",        url: "https://blackroad-email.blackroad.workers.dev/",             type: "worker",  category: "email" },
  { name: "blackroad-email-setup",  url: "https://blackroad-email-setup.blackroad.workers.dev/",      type: "worker",  category: "email" },
  { name: "blackroad-repo-index",   url: "https://blackroad-repo-index.blackroad.workers.dev/health", type: "worker",  category: "index" },
  { name: "blackroad-tunnel-proxy", url: "https://blackroad-tunnel-proxy.blackroad.workers.dev/health",type: "worker",  category: "tunnel" },
  { name: "blackroad-search",       url: "https://blackroad-search.blackroad.workers.dev/health",     type: "worker",  category: "search" },

  // OS Workers
  { name: "blackroad-os-api",       url: "https://blackroad-os-api.blackroad.workers.dev/",           type: "worker",  category: "os" },
  { name: "agents-api",             url: "https://agents-api.blackroad.workers.dev/",                  type: "worker",  category: "agents" },
  { name: "command-center",         url: "https://command-center.blackroad.workers.dev/",              type: "worker",  category: "core" },
  { name: "tools-api",              url: "https://tools-api.blackroad.workers.dev/",                   type: "worker",  category: "tools" },
  { name: "roadgateway",            url: "https://roadgateway.blackroad.workers.dev/",                 type: "worker",  category: "payments" },

  // Subdomain workers (sample of 41)
  { name: "api-blackroadio",        url: "https://api.blackroad.io/",                                  type: "subdomain", category: "api" },
  { name: "agents-blackroadio",     url: "https://agents.blackroad.io/",                               type: "subdomain", category: "agents" },
  { name: "ai-blackroadio",         url: "https://ai.blackroad.io/",                                   type: "subdomain", category: "ai" },
  { name: "dashboard-blackroadio",  url: "https://dashboard.blackroad.io/",                            type: "subdomain", category: "dashboard" },
  { name: "docs-blackroadio",       url: "https://docs.blackroad.io/",                                 type: "subdomain", category: "docs" },
  { name: "dev-blackroadio",        url: "https://dev.blackroad.io/",                                  type: "subdomain", category: "dev" },
  { name: "console-blackroadio",    url: "https://console.blackroad.io/",                              type: "subdomain", category: "admin" },
  { name: "cli-blackroadio",        url: "https://cli.blackroad.io/",                                  type: "subdomain", category: "tools" },

  // Cloudflare Pages
  { name: "blackroad-network",      url: "https://blackroad.network/",                                 type: "pages", category: "domain" },
  { name: "blackroad-systems",      url: "https://blackroad.systems/",                                 type: "pages", category: "domain" },
  { name: "blackroad-me",           url: "https://blackroad.me/",                                      type: "pages", category: "domain" },
  { name: "lucidia-earth",          url: "https://lucidia.earth/",                                     type: "pages", category: "domain" },

  // GitHub Pages
  { name: "blackroad-os-pages",     url: "https://blackroad-os.github.io/",                            type: "github-pages", category: "pages" },
  { name: "blackbox-pages",         url: "https://blackboxprogramming.github.io/",                     type: "github-pages", category: "pages" },

  // External APIs
  { name: "github-api",             url: "https://api.github.com/",                                    type: "external", category: "api" },
  { name: "cloudflare-api",         url: "https://api.cloudflare.com/client/v4/",                      type: "external", category: "api" },
];

// ─── Health checking ────────────────────────────────────────────────────────

async function checkService(service) {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(service.url, {
      method: "GET",
      headers: { "User-Agent": "BlackRoad-Worker-Health/1.0" },
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const latency = Date.now() - start;

    return {
      name: service.name,
      url: service.url,
      type: service.type,
      category: service.category,
      status: res.ok ? "up" : "degraded",
      http_status: res.status,
      latency_ms: latency,
      checked_at: new Date().toISOString(),
    };
  } catch (err) {
    return {
      name: service.name,
      url: service.url,
      type: service.type,
      category: service.category,
      status: "down",
      http_status: 0,
      latency_ms: Date.now() - start,
      error: err.message,
      checked_at: new Date().toISOString(),
    };
  }
}

async function checkAllServices(env) {
  // Get custom services from KV
  const customServices = [];
  if (env.HEALTH) {
    const list = await env.HEALTH.list({ prefix: "svc:" });
    for (const key of list.keys) {
      const val = await env.HEALTH.get(key.name);
      if (val) customServices.push(JSON.parse(val));
    }
  }

  const allServices = [...DEFAULT_SERVICES, ...customServices];

  // Check all in parallel (batched to avoid rate limits)
  const batchSize = 10;
  const results = [];
  for (let i = 0; i < allServices.length; i += batchSize) {
    const batch = allServices.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(checkService));
    results.push(...batchResults);
  }

  // Store results
  const summary = {
    total: results.length,
    up: results.filter((r) => r.status === "up").length,
    degraded: results.filter((r) => r.status === "degraded").length,
    down: results.filter((r) => r.status === "down").length,
    avg_latency_ms: Math.round(
      results.reduce((sum, r) => sum + r.latency_ms, 0) / results.length
    ),
    checked_at: new Date().toISOString(),
    services: results,
  };

  if (env.HEALTH) {
    await env.HEALTH.put("__latest__", JSON.stringify(summary), {
      expirationTtl: 86400,
    });

    // Store in history (keep last 144 checks = 24 hours at 10min intervals)
    const historyKey = `history:${new Date().toISOString().replace(/[:.]/g, "-")}`;
    await env.HEALTH.put(
      historyKey,
      JSON.stringify({
        total: summary.total,
        up: summary.up,
        degraded: summary.degraded,
        down: summary.down,
        avg_latency_ms: summary.avg_latency_ms,
        checked_at: summary.checked_at,
      }),
      { expirationTtl: 86400 * 7 } // 7 days
    );
  }

  return summary;
}

// ─── HTML escaping ──────────────────────────────────────────────────────────

function escapeHtml(str) {
  if (typeof str !== "string") return String(str ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─── Dashboard HTML ─────────────────────────────────────────────────────────

function renderDashboard(data) {
  const statusIcon = (s) =>
    s === "up" ? "&#x2705;" : s === "degraded" ? "&#x26A0;&#xFE0F;" : "&#x274C;";

  const rows = (data.services || [])
    .map(
      (s) => `<tr>
      <td>${statusIcon(s.status)}</td>
      <td><strong>${escapeHtml(s.name)}</strong></td>
      <td>${escapeHtml(s.type)}</td>
      <td>${escapeHtml(s.category)}</td>
      <td>${escapeHtml(s.status)}</td>
      <td>${s.http_status}</td>
      <td>${s.latency_ms}ms</td>
    </tr>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>BlackRoad Worker Health</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; background: #000; color: #fff; padding: 2rem; }
  h1 { background: linear-gradient(135deg, #F5A623 0%, #FF1D6C 38.2%, #9C27B0 61.8%, #2979FF 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1rem; }
  .stats { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
  .stat { background: #111; border: 1px solid #333; border-radius: 8px; padding: 1rem 1.5rem; }
  .stat-val { font-size: 2rem; font-weight: bold; }
  .up { color: #4caf50; } .degraded { color: #ff9800; } .down { color: #f44336; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 0.5rem 1rem; text-align: left; border-bottom: 1px solid #222; }
  th { color: #888; font-size: 0.85rem; text-transform: uppercase; }
  tr:hover { background: #111; }
  .ts { color: #666; margin-top: 1rem; font-size: 0.85rem; }
</style>
</head>
<body>
  <h1>BlackRoad Worker Health</h1>
  <div class="stats">
    <div class="stat"><div class="stat-val">${data.total}</div>Total</div>
    <div class="stat"><div class="stat-val up">${data.up}</div>Up</div>
    <div class="stat"><div class="stat-val degraded">${data.degraded}</div>Degraded</div>
    <div class="stat"><div class="stat-val down">${data.down}</div>Down</div>
    <div class="stat"><div class="stat-val">${data.avg_latency_ms}ms</div>Avg Latency</div>
  </div>
  <table>
    <thead><tr><th></th><th>Service</th><th>Type</th><th>Category</th><th>Status</th><th>HTTP</th><th>Latency</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="ts">Last checked: ${data.checked_at || "never"}</p>
</body>
</html>`;
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
        service: "blackroad-worker-health",
        version: "1.0.0",
        description: "Monitors all BlackRoad workers, pages, and infrastructure services",
        monitored: DEFAULT_SERVICES.length,
        endpoints: [
          "GET  /health",
          "GET  /status",
          "GET  /status/:name",
          "GET  /history",
          "GET  /dashboard",
          "POST /check",
          "POST /register",
          "DELETE /services/:name",
        ],
        ts: new Date().toISOString(),
      });
    }

    // GET /health
    if (path === "/health" && method === "GET") {
      return json({
        ok: true,
        service: "blackroad-worker-health",
        kv: !!env.HEALTH,
        monitored_default: DEFAULT_SERVICES.length,
        ts: new Date().toISOString(),
      });
    }

    // GET /status — full status from last check
    if (path === "/status" && method === "GET") {
      if (env.HEALTH) {
        const raw = await env.HEALTH.get("__latest__");
        if (raw) return json(JSON.parse(raw));
      }
      return json({ message: "No health data yet. POST /check to run first check.", services: [] });
    }

    // GET /status/:name
    const statusMatch = path.match(/^\/status\/([^/]+)$/);
    if (statusMatch && method === "GET") {
      const name = statusMatch[1];
      if (env.HEALTH) {
        const raw = await env.HEALTH.get("__latest__");
        if (raw) {
          const data = JSON.parse(raw);
          const svc = data.services?.find((s) => s.name === name);
          if (svc) return json(svc);
        }
      }
      return json({ error: `Service "${name}" not found in latest check` }, 404);
    }

    // GET /history
    if (path === "/history" && method === "GET") {
      const entries = [];
      if (env.HEALTH) {
        const list = await env.HEALTH.list({ prefix: "history:", limit: 144 });
        for (const key of list.keys) {
          const val = await env.HEALTH.get(key.name);
          if (val) entries.push(JSON.parse(val));
        }
      }
      entries.sort((a, b) => (b.checked_at || "").localeCompare(a.checked_at || ""));
      return json({ count: entries.length, history: entries });
    }

    // GET /dashboard — HTML dashboard
    if (path === "/dashboard" && method === "GET") {
      let data = { total: 0, up: 0, degraded: 0, down: 0, avg_latency_ms: 0, services: [], checked_at: null };
      if (env.HEALTH) {
        const raw = await env.HEALTH.get("__latest__");
        if (raw) data = JSON.parse(raw);
      }
      return new Response(renderDashboard(data), {
        headers: { "Content-Type": "text/html; charset=utf-8", ...CORS },
      });
    }

    // POST /check — run an immediate health check
    if (path === "/check" && method === "POST") {
      if (!requireAuth(request, env)) return json({ error: "Unauthorized" }, 401);
      const result = await checkAllServices(env);
      return json(result);
    }

    // POST /register — add a custom service to monitor
    if (path === "/register" && method === "POST") {
      if (!requireAuth(request, env)) return json({ error: "Unauthorized" }, 401);
      let body;
      try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
      if (!body.name || !body.url) return json({ error: "name + url required" }, 400);

      const svc = {
        name: body.name,
        url: body.url,
        type: body.type || "custom",
        category: body.category || "custom",
      };

      if (env.HEALTH) {
        await env.HEALTH.put(`svc:${svc.name}`, JSON.stringify(svc), {
          expirationTtl: 86400 * 365,
        });
      }
      return json({ ok: true, registered: svc });
    }

    // DELETE /services/:name
    const deleteMatch = path.match(/^\/services\/([^/]+)$/);
    if (deleteMatch && method === "DELETE") {
      if (!requireAuth(request, env)) return json({ error: "Unauthorized" }, 401);
      const name = deleteMatch[1];
      if (env.HEALTH) await env.HEALTH.delete(`svc:${name}`);
      return json({ ok: true, deleted: name });
    }

    return json({ error: `Not found: ${method} ${path}` }, 404);
  },

  async scheduled(event, env) {
    await checkAllServices(env);
  },
};
