/**
 * BlackRoad Prism Console v2.0
 * Multi-panel operations dashboard with live agent data
 */

interface Env {
  AGENT_DB: D1Database;
}

interface AgentStats {
  total: number;
  byCore: Record<string, number>;
  byZone: Record<string, number>;
  byStatus: Record<string, number>;
  avgHealth: number;
  unhealthyCount: number;
  recentErrors: any[];
}

const SERVICES = [
  { name: "API Gateway", url: "https://blackroad-api-gateway.blackroad.workers.dev/health", sub: "api.blackroad.io" },
  { name: "MCP Agent Manager", url: "https://blackroad-mcp-agent-manager.blackroad.workers.dev/health", sub: "mcp.blackroad.io" },
  { name: "Status Hub", url: "https://blackroad-status-hub.blackroad.workers.dev/health", sub: "status.blackroad.io" },
  { name: "Command Center", url: "https://blackroad-command-center.blackroad.workers.dev/", sub: "cmd.blackroad.io" },
  { name: "Platform Hub", url: "https://blackroad-platform-hub.blackroad.workers.dev/api/platform/health", sub: "hub.blackroad.io" },
  { name: "CLI", url: "https://blackroad-cli.blackroad.workers.dev/health", sub: "cli.blackroad.io" },
  { name: "Tools", url: "https://blackroad-tools.blackroad.workers.dev/health", sub: "tools.blackroad.io" },
  { name: "OS Mesh", url: "https://blackroad-os-mesh.blackroad.workers.dev/health", sub: "mesh.blackroad.io" },
  { name: "Payment Gateway", url: "https://blackroad-payment-gateway.blackroad.workers.dev/health", sub: "pay" },
  { name: "Subdomain Router", url: "https://blackroad-subdomain-router.blackroad.workers.dev", sub: "router" },
  { name: "Landing Worker", url: "https://blackroad-landing-worker.blackroad.workers.dev", sub: "landing" },
  { name: "BlackRoad API", url: "https://blackroad-api.blackroad.workers.dev", sub: "api-legacy" },
  { name: "Agents API", url: "https://blackroad-agents-api.blackroad.workers.dev", sub: "agents-api" },
  { name: "BlackRoad IO", url: "https://blackroad-io.blackroad.workers.dev", sub: "io" },
  { name: "RemoteJobs", url: "https://remotejobs-platform.blackroad.workers.dev", sub: "jobs.blackroad.io" },
  { name: "Break Worker", url: "https://break-worker.blackroad.workers.dev", sub: "break" },
];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function getAgentStats(db: D1Database): Promise<AgentStats> {
  const [coreR, zoneR, statusR, healthR, errorsR] = await Promise.all([
    db.prepare("SELECT core, COUNT(*) as count FROM agents GROUP BY core").all(),
    db.prepare("SELECT zone, COUNT(*) as count FROM agents GROUP BY zone").all(),
    db.prepare("SELECT status, COUNT(*) as count FROM agents GROUP BY status").all(),
    db.prepare("SELECT COUNT(*) as total, AVG(health_score) as avg_health, SUM(CASE WHEN health_score < 80 THEN 1 ELSE 0 END) as unhealthy FROM agents").first<{total:number;avg_health:number;unhealthy:number}>(),
    db.prepare("SELECT id, hash, core, zone, status, health_score FROM agents WHERE status = 'error' ORDER BY health_score ASC LIMIT 10").all(),
  ]);

  const byCore: Record<string, number> = {};
  const byZone: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  for (const r of coreR.results as any[]) byCore[r.core] = r.count;
  for (const r of zoneR.results as any[]) byZone[r.zone] = r.count;
  for (const r of statusR.results as any[]) byStatus[r.status] = r.count;

  return {
    total: healthR?.total || 0,
    byCore, byZone, byStatus,
    avgHealth: Math.round((healthR?.avg_health || 0) * 100) / 100,
    unhealthyCount: healthR?.unhealthy || 0,
    recentErrors: errorsR.results || [],
  };
}

async function checkServices(): Promise<{name:string;status:string;ms:number;sub:string}[]> {
  return Promise.all(SERVICES.map(async (s) => {
    const start = Date.now();
    try {
      const r = await fetch(s.url, { method: "GET", signal: AbortSignal.timeout(4000) });
      return { name: s.name, status: r.status < 500 ? "up" : "degraded", ms: Date.now() - start, sub: s.sub };
    } catch {
      return { name: s.name, status: "down", ms: Date.now() - start, sub: s.sub };
    }
  }));
}

function renderDashboard(agents: AgentStats, services: {name:string;status:string;ms:number;sub:string}[]): string {
  const up = services.filter(s => s.status === "up").length;
  const down = services.filter(s => s.status === "down").length;
  const degraded = services.filter(s => s.status === "degraded").length;

  const coreColors: Record<string, string> = {
    aria: "#FF1D6C", lucidia: "#2979FF", silas: "#F5A623",
    cecilia: "#9C27B0", cadence: "#00FF88", alice: "#FF6B35",
  };

  const serviceRows = services.map(s => {
    const color = s.status === "up" ? "#00FF88" : s.status === "degraded" ? "#F5A623" : "#FF1D6C";
    return `<div class="svc-row"><span class="svc-dot" style="background:${color}"></span><span class="svc-name">${s.name}</span><span class="svc-sub">${s.sub}</span><span class="svc-ms">${s.ms}ms</span></div>`;
  }).join("");

  const coreChart = Object.entries(agents.byCore).map(([core, count]) => {
    const pct = Math.round((count / agents.total) * 100);
    const color = coreColors[core] || "#F5A623";
    return `<div class="core-bar"><span class="core-label">${core}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div><span class="core-count">${count.toLocaleString()}</span></div>`;
  }).join("");

  const zoneBoxes = Object.entries(agents.byZone).map(([zone, count]) =>
    `<div class="zone-box"><div class="zone-name">${zone}</div><div class="zone-count">${count.toLocaleString()}</div></div>`
  ).join("");

  const statusItems = Object.entries(agents.byStatus).map(([status, count]) => {
    const color = status === "active" ? "#00FF88" : status === "paused" ? "#F5A623" : status === "error" ? "#FF1D6C" : "#666";
    return `<div class="status-item"><span class="status-dot-lg" style="background:${color}"></span><span>${status}</span><span class="status-count">${count.toLocaleString()}</span></div>`;
  }).join("");

  const errorRows = agents.recentErrors.map((e: any) =>
    `<div class="err-row"><span class="err-id">${(e.hash || e.id || "").slice(0, 12)}</span><span class="err-core">${e.core}</span><span class="err-zone">${e.zone}</span><span class="err-health">${e.health_score}%</span></div>`
  ).join("") || '<div class="empty">No error agents</div>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>PRISM Console - BlackRoad OS</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000;color:#fff;font-family:'SF Mono','Fira Code','Cascadia Code',monospace;overflow-x:hidden}
.top-bar{display:flex;align-items:center;justify-content:space-between;padding:0.8rem 1.5rem;border-bottom:1px solid #1a1a1a;background:#050505}
.top-bar h1{font-size:1rem;letter-spacing:3px;color:#F5A623}
.top-bar .meta{font-size:0.7rem;color:#555}
.top-bar .live{display:flex;align-items:center;gap:6px;font-size:0.75rem;color:#00FF88}
.top-bar .live-dot{width:6px;height:6px;border-radius:50%;background:#00FF88;animation:pulse 1.5s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}

.hero{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:#111;border-bottom:1px solid #1a1a1a}
.hero-cell{background:#000;padding:1.2rem;text-align:center}
.hero-val{font-size:2rem;font-weight:700;color:#F5A623}
.hero-val.health{color:#00FF88}
.hero-val.workers{color:#2979FF}
.hero-val.errors{color:${agents.unhealthyCount > 0 ? "#FF1D6C" : "#00FF88"}}
.hero-val.down-val{color:${down > 0 ? "#FF1D6C" : "#00FF88"}}
.hero-label{font-size:0.65rem;color:#555;text-transform:uppercase;letter-spacing:2px;margin-top:4px}

.grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:#111}
.panel{background:#000;padding:1.2rem;min-height:200px}
.panel-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;padding-bottom:0.5rem;border-bottom:1px solid #1a1a1a}
.panel-title{font-size:0.75rem;text-transform:uppercase;letter-spacing:2px;color:#F5A623}
.panel-badge{font-size:0.6rem;padding:2px 8px;border-radius:3px;background:#1a1a1a;color:#888}

.svc-row{display:flex;align-items:center;gap:8px;padding:5px 0;font-size:0.75rem;border-bottom:1px solid #0a0a0a}
.svc-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.svc-name{flex:1;color:#ccc}
.svc-sub{color:#444;font-size:0.65rem}
.svc-ms{color:#555;font-size:0.65rem;width:45px;text-align:right}

.core-bar{display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:0.75rem}
.core-label{width:60px;color:#888;text-transform:capitalize}
.bar-track{flex:1;height:8px;background:#111;border-radius:4px;overflow:hidden}
.bar-fill{height:100%;border-radius:4px;transition:width 0.5s}
.core-count{width:50px;text-align:right;color:#555;font-size:0.65rem}

.zone-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.zone-box{background:#0a0a0a;border:1px solid #1a1a1a;border-radius:6px;padding:0.8rem;text-align:center}
.zone-name{font-size:0.7rem;color:#888;text-transform:uppercase;letter-spacing:1px}
.zone-count{font-size:1.4rem;font-weight:700;color:#2979FF;margin-top:4px}

.status-item{display:flex;align-items:center;gap:8px;padding:6px 0;font-size:0.8rem;border-bottom:1px solid #0a0a0a}
.status-dot-lg{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.status-count{margin-left:auto;color:#555}

.err-row{display:flex;gap:8px;padding:5px 0;font-size:0.7rem;border-bottom:1px solid #0a0a0a}
.err-id{color:#FF1D6C;font-family:monospace}
.err-core{color:#888}
.err-zone{color:#555}
.err-health{margin-left:auto;color:#FF1D6C}
.empty{color:#333;font-size:0.75rem;padding:1rem 0}

.nav-links{display:flex;gap:1px;background:#111;border-bottom:1px solid #1a1a1a}
.nav-link{flex:1;padding:0.6rem;text-align:center;font-size:0.65rem;color:#555;text-decoration:none;background:#000;text-transform:uppercase;letter-spacing:1px;transition:color 0.2s}
.nav-link:hover{color:#F5A623}

.footer{padding:0.8rem;text-align:center;font-size:0.6rem;color:#222;border-top:1px solid #0a0a0a}

@media(max-width:900px){
  .hero{grid-template-columns:repeat(3,1fr)}
  .grid{grid-template-columns:1fr}
}
</style>
</head>
<body>

<div class="top-bar">
  <h1>PRISM CONSOLE</h1>
  <span class="meta">BlackRoad OS v2.0</span>
  <span class="live"><span class="live-dot"></span> LIVE</span>
</div>

<div class="hero">
  <div class="hero-cell"><div class="hero-val">${agents.total.toLocaleString()}</div><div class="hero-label">Total Agents</div></div>
  <div class="hero-cell"><div class="hero-val health">${agents.avgHealth}%</div><div class="hero-label">Avg Health</div></div>
  <div class="hero-cell"><div class="hero-val workers">${up}/${services.length}</div><div class="hero-label">Workers Up</div></div>
  <div class="hero-cell"><div class="hero-val errors">${agents.unhealthyCount}</div><div class="hero-label">Unhealthy</div></div>
  <div class="hero-cell"><div class="hero-val down-val">${down}</div><div class="hero-label">Workers Down</div></div>
</div>

<div class="nav-links">
  <a href="https://status.blackroad.io" class="nav-link">Status Hub</a>
  <a href="https://cmd.blackroad.io" class="nav-link">Command Center</a>
  <a href="https://hub.blackroad.io" class="nav-link">Platform Hub</a>
  <a href="https://mcp.blackroad.io" class="nav-link">MCP Server</a>
  <a href="https://cli.blackroad.io" class="nav-link">CLI API</a>
  <a href="https://mesh.blackroad.io" class="nav-link">OS Mesh</a>
</div>

<div class="grid">
  <div class="panel">
    <div class="panel-head"><span class="panel-title">Workers</span><span class="panel-badge">${services.length} services</span></div>
    ${serviceRows}
  </div>

  <div class="panel">
    <div class="panel-head"><span class="panel-title">Agents by Core</span><span class="panel-badge">${Object.keys(agents.byCore).length} cores</span></div>
    ${coreChart}
    <div style="margin-top:1rem">
      <div class="panel-head"><span class="panel-title">Status</span></div>
      ${statusItems}
    </div>
  </div>

  <div class="panel">
    <div class="panel-head"><span class="panel-title">Zones</span><span class="panel-badge">${Object.keys(agents.byZone).length} zones</span></div>
    <div class="zone-grid">${zoneBoxes}</div>
    <div style="margin-top:1rem">
      <div class="panel-head"><span class="panel-title">Error Agents</span><span class="panel-badge">${agents.recentErrors.length}</span></div>
      ${errorRows}
    </div>
  </div>
</div>

<div class="footer">BLACKROAD OS &middot; prism.blackroad.io &middot; ${new Date().toISOString()} &middot; Powered by Cloudflare Workers + D1</div>

<script>setTimeout(()=>location.reload(),30000)</script>
</body>
</html>`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    if (url.pathname === "/health") {
      return Response.json({ status: "ok", service: "prism-console", version: "2.0.0" });
    }

    // JSON API endpoints
    if (url.pathname === "/api/agents/stats") {
      const stats = await getAgentStats(env.AGENT_DB);
      return Response.json(stats, { headers: CORS });
    }

    if (url.pathname === "/api/services") {
      const services = await checkServices();
      return Response.json(services, { headers: CORS });
    }

    if (url.pathname === "/api/agents/errors") {
      const errors = await env.AGENT_DB.prepare(
        "SELECT id, hash, core, zone, status, health_score FROM agents WHERE status = 'error' ORDER BY health_score ASC LIMIT 50"
      ).all();
      return Response.json(errors.results, { headers: CORS });
    }

    if (url.pathname === "/api/agents/search") {
      const core = url.searchParams.get("core");
      const zone = url.searchParams.get("zone");
      const status = url.searchParams.get("status");
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);

      let query = "SELECT id, hash, core, zone, status, health_score FROM agents WHERE 1=1";
      const binds: any[] = [];
      if (core) { query += " AND core = ?"; binds.push(core); }
      if (zone) { query += " AND zone = ?"; binds.push(zone); }
      if (status) { query += " AND status = ?"; binds.push(status); }
      query += " LIMIT ?";
      binds.push(limit);

      const stmt = env.AGENT_DB.prepare(query);
      const result = await (binds.length === 1 ? stmt.bind(binds[0]) : binds.length === 2 ? stmt.bind(binds[0], binds[1]) : binds.length === 3 ? stmt.bind(binds[0], binds[1], binds[2]) : stmt.bind(binds[0], binds[1], binds[2], binds[3])).all();
      return Response.json(result.results, { headers: CORS });
    }

    // Dashboard HTML
    const [agents, services] = await Promise.all([
      getAgentStats(env.AGENT_DB),
      checkServices(),
    ]);

    return new Response(renderDashboard(agents, services), {
      headers: { "Content-Type": "text/html;charset=UTF-8", "Cache-Control": "public, max-age=15" },
    });
  },
};
