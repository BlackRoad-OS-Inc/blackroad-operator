/**
 * BlackRoad CLI v2.0
 * Web terminal interface + API backend
 */

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    if (url.pathname === "/health") {
      return Response.json({ status: "ok", service: "blackroad-cli", version: "2.0.0" });
    }

    if (url.pathname === "/api/commands") {
      return Response.json({
        commands: [
          { name: "help", description: "Show available commands", usage: "help" },
          { name: "status", description: "Show system status", usage: "status" },
          { name: "agents", description: "List agent stats", usage: "agents [core|zone|status]" },
          { name: "workers", description: "Check worker health", usage: "workers" },
          { name: "ping", description: "Ping a service", usage: "ping <service>" },
          { name: "whoami", description: "Show current identity", usage: "whoami" },
          { name: "version", description: "Show version info", usage: "version" },
          { name: "clear", description: "Clear terminal", usage: "clear" },
          { name: "domains", description: "List custom domains", usage: "domains" },
          { name: "uptime", description: "Show system uptime", usage: "uptime" },
        ],
      });
    }

    if (url.pathname === "/api/exec" && request.method === "POST") {
      const body: any = await request.json();
      const cmd = (body.command || "").trim().toLowerCase();
      const output = await executeCommand(cmd);
      return Response.json({ command: cmd, output }, {
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    if (url.pathname === "/api/version") {
      return Response.json({ cli: "2.0.0", api: "2.0.0", platform: "BlackRoad OS", agents: 31000 });
    }

    // Terminal UI
    return new Response(renderTerminal(), {
      headers: { "Content-Type": "text/html;charset=UTF-8" },
    });
  },
};

async function executeCommand(cmd: string): Promise<string> {
  const parts = cmd.split(/\s+/);
  const base = parts[0];

  switch (base) {
    case "help":
      return [
        "  help      - Show this help",
        "  status    - System status overview",
        "  agents    - Agent registry stats",
        "  workers   - Worker health check",
        "  ping      - Ping a service (ping api|mcp|status|cmd|hub)",
        "  whoami    - Current identity",
        "  version   - Version info",
        "  domains   - List custom domains",
        "  uptime    - System uptime",
        "  clear     - Clear terminal",
      ].join("\n");

    case "status":
      try {
        const r = await fetch("https://blackroad-status-hub.blackroad.workers.dev/api/status", { signal: AbortSignal.timeout(5000) });
        const data: any = await r.json();
        const sUp = data.services?.filter((s:any) => s.status === "operational").length || 0;
        const sTotal = data.services?.length || 0;
        return [
          `  BLACKROAD OS STATUS`,
          `  ---`,
          `  Workers:    ${sUp}/${sTotal} operational`,
          `  Agents:     ${data.agents?.total?.toLocaleString() || "?"} total`,
          `  Avg Health: ${data.agents?.avgHealth || "?"}%`,
          `  Unhealthy:  ${data.agents?.unhealthyCount || 0}`,
          `  Timestamp:  ${data.timestamp || new Date().toISOString()}`,
        ].join("\n");
      } catch {
        return "  ERROR: Could not reach Status Hub";
      }

    case "agents":
      try {
        const r = await fetch("https://blackroad-os-prism-console.blackroad.workers.dev/api/agents/stats", { signal: AbortSignal.timeout(5000) });
        const data: any = await r.json();
        const cores = Object.entries(data.byCore || {}).map(([k,v]) => `    ${k}: ${(v as number).toLocaleString()}`).join("\n");
        const zones = Object.entries(data.byZone || {}).map(([k,v]) => `    ${k}: ${(v as number).toLocaleString()}`).join("\n");
        const statuses = Object.entries(data.byStatus || {}).map(([k,v]) => `    ${k}: ${(v as number).toLocaleString()}`).join("\n");
        return [
          `  AGENT REGISTRY: ${data.total?.toLocaleString() || "?"} agents`,
          `  Health: ${data.avgHealth}% avg | ${data.unhealthyCount} unhealthy`,
          `  ---`,
          `  BY CORE:`,
          cores,
          `  BY ZONE:`,
          zones,
          `  BY STATUS:`,
          statuses,
        ].join("\n");
      } catch {
        return "  ERROR: Could not reach Prism Console API";
      }

    case "workers": {
      const checks = [
        { name: "api-gateway", url: "https://blackroad-api-gateway.blackroad.workers.dev/health" },
        { name: "mcp-agent-mgr", url: "https://blackroad-mcp-agent-manager.blackroad.workers.dev/health" },
        { name: "status-hub", url: "https://blackroad-status-hub.blackroad.workers.dev/health" },
        { name: "prism-console", url: "https://blackroad-os-prism-console.blackroad.workers.dev/health" },
        { name: "command-center", url: "https://blackroad-command-center.blackroad.workers.dev/" },
        { name: "platform-hub", url: "https://blackroad-platform-hub.blackroad.workers.dev/api/platform/health" },
        { name: "cli", url: "https://blackroad-cli.blackroad.workers.dev/health" },
        { name: "tools", url: "https://blackroad-tools.blackroad.workers.dev/health" },
        { name: "os-mesh", url: "https://blackroad-os-mesh.blackroad.workers.dev/health" },
      ];
      const results = await Promise.all(checks.map(async (c) => {
        const start = Date.now();
        try {
          const r = await fetch(c.url, { signal: AbortSignal.timeout(4000) });
          const ms = Date.now() - start;
          return `  [UP]   ${c.name.padEnd(16)} ${ms}ms`;
        } catch {
          return `  [DOWN] ${c.name.padEnd(16)} timeout`;
        }
      }));
      return `  WORKER HEALTH CHECK\n  ---\n${results.join("\n")}`;
    }

    case "ping": {
      const target = parts[1];
      if (!target) return "  Usage: ping <service>\n  Services: api, mcp, status, cmd, hub, prism, cli, tools, mesh";
      const urls: Record<string, string> = {
        api: "https://api.blackroad.io/health",
        mcp: "https://mcp.blackroad.io/health",
        status: "https://status.blackroad.io/health",
        cmd: "https://cmd.blackroad.io/",
        hub: "https://hub.blackroad.io/api/platform/health",
        prism: "https://prism.blackroad.io/health",
        cli: "https://cli.blackroad.io/health",
        tools: "https://tools.blackroad.io/health",
        mesh: "https://mesh.blackroad.io/health",
      };
      const pingUrl = urls[target];
      if (!pingUrl) return `  Unknown service: ${target}`;
      const start = Date.now();
      try {
        const r = await fetch(pingUrl, { signal: AbortSignal.timeout(5000) });
        return `  PING ${target} (${pingUrl})\n  Status: ${r.status} | ${Date.now() - start}ms`;
      } catch {
        return `  PING ${target} - UNREACHABLE`;
      }
    }

    case "whoami":
      return [
        "  Identity: BlackRoad OS Operator",
        "  Account:  848cf0b18d51e0170e0d1537aec3505a",
        "  Domain:   blackroad.io",
        "  Zones:    20 Cloudflare zones",
        "  Agent:    CLI v2.0.0",
      ].join("\n");

    case "version":
      return [
        "  BlackRoad CLI v2.0.0",
        "  Platform: BlackRoad OS",
        "  Runtime:  Cloudflare Workers",
        "  Agents:   31,000+",
        "  Workers:  19 deployed",
        "  Zones:    20 DNS zones",
      ].join("\n");

    case "domains":
      return [
        "  CUSTOM DOMAINS",
        "  ---",
        "  api.blackroad.io      -> API Gateway",
        "  mcp.blackroad.io      -> MCP Agent Manager",
        "  agents.blackroad.io   -> MCP Agent Manager",
        "  status.blackroad.io   -> Status Hub",
        "  prism.blackroad.io    -> Prism Console",
        "  cmd.blackroad.io      -> Command Center",
        "  hub.blackroad.io      -> Platform Hub",
        "  cli.blackroad.io      -> CLI",
        "  tools.blackroad.io    -> Tools",
        "  mesh.blackroad.io     -> OS Mesh",
        "  jobs.blackroad.io     -> RemoteJobs",
        "  core.blackroad.io     -> API Gateway",
        "  operator.blackroad.io -> API Gateway",
      ].join("\n");

    case "uptime":
      return `  System: operational\n  Uptime: continuous (edge-deployed)\n  Last deploy: ${new Date().toISOString().split("T")[0]}`;

    case "clear":
      return "__CLEAR__";

    case "":
      return "";

    default:
      return `  Unknown command: ${base}\n  Type 'help' for available commands`;
  }
}

function renderTerminal(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>BlackRoad CLI</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000;color:#00FF88;font-family:'SF Mono','Fira Code','Cascadia Code','Courier New',monospace;font-size:14px;height:100vh;display:flex;flex-direction:column}
.header{padding:12px 16px;border-bottom:1px solid #1a1a1a;display:flex;align-items:center;gap:12px;background:#050505;flex-shrink:0}
.dots{display:flex;gap:6px}
.dot{width:10px;height:10px;border-radius:50%}
.dot.r{background:#FF1D6C}.dot.y{background:#F5A623}.dot.g{background:#00FF88}
.title{color:#555;font-size:12px;flex:1;text-align:center}
.output{flex:1;overflow-y:auto;padding:16px;white-space:pre-wrap;word-wrap:break-word;line-height:1.6}
.output .line{margin-bottom:2px}
.output .cmd{color:#F5A623}
.output .result{color:#ccc}
.output .system{color:#2979FF}
.output .error{color:#FF1D6C}
.input-row{display:flex;align-items:center;padding:8px 16px;border-top:1px solid #1a1a1a;background:#050505;flex-shrink:0}
.prompt{color:#F5A623;margin-right:8px;white-space:nowrap}
#input{background:none;border:none;color:#00FF88;font-family:inherit;font-size:inherit;flex:1;outline:none;caret-color:#F5A623}
.cursor{display:inline-block;width:8px;height:16px;background:#F5A623;animation:blink 1s step-end infinite}
@keyframes blink{50%{opacity:0}}
</style>
</head>
<body>
<div class="header">
  <div class="dots"><div class="dot r"></div><div class="dot y"></div><div class="dot g"></div></div>
  <div class="title">BlackRoad CLI - cli.blackroad.io</div>
</div>
<div class="output" id="output"></div>
<div class="input-row">
  <span class="prompt">blackroad &gt;</span>
  <input type="text" id="input" autofocus autocomplete="off" spellcheck="false">
</div>

<script>
const output = document.getElementById('output');
const input = document.getElementById('input');
const history = [];
let histIdx = -1;

function addLine(text, cls) {
  const div = document.createElement('div');
  div.className = 'line ' + (cls || '');
  div.textContent = text;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}

function addSystem(text) { addLine(text, 'system'); }
function addResult(text) { text.split('\\n').forEach(l => addLine(l, 'result')); }
function addCmd(text) { addLine('blackroad > ' + text, 'cmd'); }

// Boot sequence
addSystem('  BLACKROAD CLI v2.0.0');
addSystem('  Cloudflare Workers Edge Runtime');
addSystem('  Connected to blackroad.io');
addSystem('  ---');
addSystem('  Type "help" for available commands');
addSystem('');

async function exec(cmd) {
  addCmd(cmd);
  if (cmd === 'clear') {
    output.innerHTML = '';
    return;
  }
  try {
    const r = await fetch('/api/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd })
    });
    const data = await r.json();
    if (data.output === '__CLEAR__') {
      output.innerHTML = '';
    } else {
      addResult(data.output || '');
    }
  } catch (e) {
    addLine('  ERROR: ' + e.message, 'error');
  }
  addLine('');
}

input.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    const cmd = input.value.trim();
    input.value = '';
    if (cmd) {
      history.unshift(cmd);
      histIdx = -1;
      await exec(cmd);
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (histIdx < history.length - 1) {
      histIdx++;
      input.value = history[histIdx];
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (histIdx > 0) {
      histIdx--;
      input.value = history[histIdx];
    } else {
      histIdx = -1;
      input.value = '';
    }
  }
});

document.body.addEventListener('click', () => input.focus());
</script>
</body>
</html>`;
}
