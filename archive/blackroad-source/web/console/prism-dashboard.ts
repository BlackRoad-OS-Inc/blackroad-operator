// ============================================================================
// BLACKROAD OS, INC. — Prism Console Dashboard
// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
// ============================================================================

export function dashboard(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PRISM CONSOLE — BlackRoad OS</title>
<meta name="description" content="BlackRoad OS fleet command center — Prism Console">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>
:root {
  --bg: #000;
  --card: #0a0a0a;
  --border: #1a1a1a;
  --text: #f5f5f5;
  --sub: #737373;
  --muted: #444;
  --radius-card: 10px;
  --radius-badge: 4px;
  --radius-node: 6px;
  --font-heading: 'Space Grotesk', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --font-body: 'Inter', sans-serif;
  --dot-green: #22c55e;
  --dot-yellow: #eab308;
  --dot-red: #ef4444;
  --dot-blue: #3b82f6;
  --accent-pink: #FF1D6C;
  --accent-amber: #F5A623;
  --accent-blue: #2979FF;
  --accent-violet: #9C27B0;
  --gradient: linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 14px;
  min-height: 100vh;
  padding-bottom: 48px;
}

/* Top gradient bar */
body::before {
  content: '';
  display: block;
  height: 4px;
  background: var(--gradient);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

/* Header */
.header {
  padding: 24px 32px 16px;
  margin-top: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
}
.header h1 {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0.5px;
}
.header h1 span {
  color: var(--sub);
  font-weight: 400;
  font-size: 14px;
  margin-left: 12px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.header .meta {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted);
}
.refresh-btn {
  background: none;
  border: 1px solid var(--border);
  color: var(--sub);
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 4px 10px;
  border-radius: var(--radius-badge);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.refresh-btn:hover { border-color: var(--sub); color: var(--text); }

/* Search bar */
.search-wrap {
  padding: 16px 32px;
}
.search-bar {
  display: flex;
  gap: 8px;
}
.search-bar input {
  flex: 1;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 10px 16px;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text);
  outline: none;
  transition: border-color 0.2s;
}
.search-bar input::placeholder { color: var(--muted); }
.search-bar input:focus { border-color: var(--sub); }
.search-bar button {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 10px 20px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text);
  cursor: pointer;
  transition: border-color 0.2s;
  white-space: nowrap;
}
.search-bar button:hover { border-color: var(--sub); }
.search-results {
  margin-top: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--sub);
  max-height: 200px;
  overflow-y: auto;
}
.search-results .sr-item {
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
}
.search-results .sr-item:last-child { border-bottom: none; }

/* Grid layout */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px 32px;
}

/* Cards */
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 20px;
  overflow: hidden;
}
.card.span-2 { grid-column: span 2; }
.card.span-3 { grid-column: span 3; }
.card h2 {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--sub);
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}

/* Node grid */
.node-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 8px;
}
.node {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-node);
  padding: 12px;
}
.node .node-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.node .name {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 13px;
  color: var(--text);
}
.node .ip {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--muted);
  margin-bottom: 2px;
}
.node .role {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--sub);
}
.node .services {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--muted);
  margin-top: 6px;
  line-height: 1.5;
}

/* Status dot */
.dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot.green { background: var(--dot-green); }
.dot.yellow { background: var(--dot-yellow); }
.dot.red { background: var(--dot-red); }
.dot.blue { background: var(--dot-blue); }

/* KPI grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
}
.kpi {
  text-align: center;
  padding: 10px 4px;
  background: var(--bg);
  border-radius: var(--radius-node);
  border: 1px solid var(--border);
}
.kpi .value {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
}
.kpi .label {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 4px;
}

/* Agent grid */
.agent-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.agent-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-node);
  padding: 12px;
}
.agent-card .agent-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}
.agent-card .agent-name {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 13px;
  color: var(--text);
}
.agent-card .agent-role {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--sub);
  margin-bottom: 4px;
}
.agent-card .agent-node {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--muted);
}
.agent-card .agent-desc {
  font-family: var(--font-body);
  font-size: 11px;
  color: var(--muted);
  margin-top: 6px;
  line-height: 1.4;
}

/* Task list */
.task-list { list-style: none; }
.task-list li {
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
}
.task-list li:last-child { border-bottom: none; }
.task-list a {
  color: var(--text);
  text-decoration: none;
  transition: color 0.2s;
}
.task-list a:hover { color: var(--sub); }
.tag {
  font-family: var(--font-mono);
  font-size: 9px;
  padding: 2px 6px;
  border-radius: var(--radius-badge);
  border: 1px solid;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}
.tag.urgent { border-color: var(--dot-red); color: var(--dot-red); }
.tag.high { border-color: var(--accent-amber); color: var(--accent-amber); }
.tag.medium { border-color: var(--dot-yellow); color: var(--dot-yellow); }
.tag.low { border-color: var(--dot-green); color: var(--dot-green); }

/* Event list */
.event-list { list-style: none; }
.event-list li {
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--sub);
}
.event-list li:last-child { border-bottom: none; }
.event-list .type { color: var(--accent-blue); }
.event-list .time { color: var(--muted); }

/* Stat rows */
.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
  font-family: var(--font-mono);
  font-size: 12px;
}
.stat-row:last-child { border-bottom: none; }
.stat-row .stat-label { color: var(--sub); }
.stat-row .stat-value { color: var(--text); font-weight: 500; }

/* Memory stats */
.mem-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.mem-item {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-node);
  padding: 12px;
  text-align: center;
}
.mem-item .mem-val {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}
.mem-item .mem-label {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}

/* Status bar */
.status-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--card);
  border-top: 1px solid var(--border);
  padding: 8px 32px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 99;
}
.status-bar .tagline {
  color: var(--sub);
  font-family: var(--font-heading);
  font-size: 11px;
  letter-spacing: 0.3px;
}

/* Loading shimmer */
.loading {
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 11px;
}

/* Scrollable panels */
.scroll-panel {
  max-height: 300px;
  overflow-y: auto;
}
.scroll-panel::-webkit-scrollbar { width: 4px; }
.scroll-panel::-webkit-scrollbar-track { background: transparent; }
.scroll-panel::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

/* Responsive */
@media (max-width: 1024px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
  .card.span-3 { grid-column: span 2; }
  .agent-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .grid { grid-template-columns: 1fr; padding: 12px 16px; }
  .card.span-2, .card.span-3 { grid-column: span 1; }
  .header { padding: 16px; flex-direction: column; gap: 8px; align-items: flex-start; }
  .header h1 { font-size: 18px; }
  .header h1 span { display: block; margin-left: 0; margin-top: 4px; }
  .search-wrap { padding: 12px 16px; }
  .agent-grid { grid-template-columns: 1fr; }
  .mem-grid { grid-template-columns: repeat(2, 1fr); }
  .status-bar { padding: 8px 16px; font-size: 10px; }
  .node-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
</head>
<body>

<div class="header">
  <h1>PRISM CONSOLE <span>BlackRoad OS v3.0</span></h1>
  <div class="header-right">
    <button class="refresh-btn" onclick="refresh()">REFRESH</button>
    <div class="meta"><span id="clock"></span></div>
  </div>
</div>

<!-- Search -->
<div class="search-wrap">
  <div class="search-bar">
    <input type="text" id="search-input" placeholder="Search BlackRoad OS (repos, docs, agents, tools...)" onkeydown="if(event.key==='Enter')doSearch()">
    <button onclick="doSearch()">SEARCH</button>
  </div>
  <div class="search-results" id="search-results"></div>
</div>

<div class="grid">

  <!-- Fleet Status -->
  <div class="card span-2">
    <h2>Fleet Nodes</h2>
    <div class="node-grid" id="fleet"><span class="loading">Loading fleet...</span></div>
  </div>

  <!-- Health + KPIs -->
  <div class="card">
    <h2>System KPIs</h2>
    <div class="kpi-grid" id="kpis"><span class="loading">Loading...</span></div>
  </div>

  <!-- Agents -->
  <div class="card span-3">
    <h2>Agents</h2>
    <div class="agent-grid" id="agents"><span class="loading">Loading agents...</span></div>
  </div>

  <!-- Engineering Tasks -->
  <div class="card span-2">
    <h2>Engineering Tasks</h2>
    <div class="scroll-panel">
      <ul class="task-list" id="tasks"><li class="loading">Loading tasks...</li></ul>
    </div>
  </div>

  <!-- Memory Stats -->
  <div class="card">
    <h2>Memory System</h2>
    <div id="memory"><span class="loading">Loading memory stats...</span></div>
  </div>

  <!-- Events -->
  <div class="card">
    <h2>Events</h2>
    <div class="scroll-panel">
      <ul class="event-list" id="events"><li class="loading">Loading events...</li></ul>
    </div>
  </div>

  <!-- Auth Stats -->
  <div class="card">
    <h2>Auth</h2>
    <div id="auth-stats"><span class="loading">Loading auth...</span></div>
  </div>

  <!-- Billing Stats -->
  <div class="card">
    <h2>RoadPay Billing</h2>
    <div id="billing-stats"><span class="loading">Loading billing...</span></div>
  </div>

  <!-- Cloudflare -->
  <div class="card">
    <h2>Cloudflare</h2>
    <div class="kpi-grid">
      <div class="kpi"><div class="value">95+</div><div class="label">Pages</div></div>
      <div class="kpi"><div class="value">40</div><div class="label">KV</div></div>
      <div class="kpi"><div class="value">8</div><div class="label">D1</div></div>
      <div class="kpi"><div class="value">10</div><div class="label">R2</div></div>
      <div class="kpi"><div class="value">18</div><div class="label">Tunnels</div></div>
      <div class="kpi"><div class="value">20</div><div class="label">Domains</div></div>
    </div>
  </div>

  <!-- Mesh Stats -->
  <div class="card">
    <h2>Mesh Network</h2>
    <div id="mesh-stats"><span class="loading">Loading mesh...</span></div>
  </div>

  <!-- Recent Repos -->
  <div class="card">
    <h2>Recent Repos</h2>
    <div class="scroll-panel">
      <ul class="event-list" id="repos"><li class="loading">Loading repos...</li></ul>
    </div>
  </div>

</div>

<div class="status-bar">
  <span style="display:flex;align-items:center;gap:6px;">
    <span class="dot green" id="health-dot"></span>
    <span id="health-text">Loading...</span>
  </span>
  <span class="tagline">BlackRoad OS — Pave Tomorrow.</span>
  <span>prism.blackroad.io</span>
</div>

<script>
const BASE = '';
let refreshTimer = null;

// ---------------------------------------------------------------------------
// Clock
// ---------------------------------------------------------------------------
function updateClock() {
  const el = document.getElementById('clock');
  if (el) el.textContent = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

// ---------------------------------------------------------------------------
// Fleet
// ---------------------------------------------------------------------------
async function loadFleet() {
  try {
    const data = await (await fetch(BASE + '/api/fleet')).json();
    const el = document.getElementById('fleet');
    const nodes = data.nodes || [];
    el.innerHTML = nodes.map(n => {
      const dotClass = n.status === 'online' ? 'green' : n.status === 'degraded' ? 'yellow' : 'red';
      const svcs = (n.services || []).join(', ');
      return \`
        <div class="node">
          <div class="node-header">
            <span class="dot \${dotClass}"></span>
            <span class="name">\${n.name}</span>
          </div>
          <div class="ip">\${n.ip} &middot; \${n.type}</div>
          <div class="role">\${n.role}</div>
          \${svcs ? '<div class="services">' + svcs + '</div>' : ''}
        </div>\`;
    }).join('');
  } catch(e) { console.error('Fleet:', e); }
}

// ---------------------------------------------------------------------------
// KPIs
// ---------------------------------------------------------------------------
async function loadKPIs() {
  try {
    const data = await (await fetch(BASE + '/api/kpis')).json();
    const el = document.getElementById('kpis');
    const items = [
      ['commits', 'Commits'], ['repos', 'Repos'], ['loc', 'LOC'],
      ['fleet', 'Fleet'], ['models', 'Models'], ['agents', 'Agents'],
      ['skills', 'Skills'], ['tops', 'TOPS']
    ];
    el.innerHTML = items.map(([k, l]) => \`
      <div class="kpi"><div class="value">\${data[k] || '—'}</div><div class="label">\${l}</div></div>
    \`).join('');
  } catch(e) { console.error('KPIs:', e); }
}

// ---------------------------------------------------------------------------
// Agents
// ---------------------------------------------------------------------------
async function loadAgents() {
  try {
    const data = await (await fetch(BASE + '/api/agents')).json();
    const el = document.getElementById('agents');
    const agents = data.agents || [];
    el.innerHTML = agents.map(a => {
      const dotClass = a.status === 'active' ? 'green' : a.status === 'idle' ? 'yellow' : 'red';
      return \`
        <div class="agent-card">
          <div class="agent-header">
            <span class="dot \${dotClass}"></span>
            <span class="agent-name">\${a.name}</span>
          </div>
          <div class="agent-role">\${a.role}</div>
          <div class="agent-node">\${a.node}</div>
          <div class="agent-desc">\${a.description}</div>
        </div>\`;
    }).join('');
  } catch(e) { console.error('Agents:', e); }
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------
async function loadTasks() {
  try {
    const data = await (await fetch(BASE + '/api/tasks')).json();
    const el = document.getElementById('tasks');
    if (!data.length) {
      el.innerHTML = '<li style="color:var(--muted)">No open tasks</li>';
      return;
    }
    el.innerHTML = data.slice(0, 15).map(t => {
      const prio = t.labels.find(l => ['urgent','high','medium','low'].includes(l.name));
      const tag = prio ? '<span class="tag ' + prio.name + '">' + prio.name + '</span>' : '';
      return '<li>' + tag + ' <a href="' + t.url + '" target="_blank">#' + t.number + ' ' + t.title + '</a></li>';
    }).join('');
  } catch(e) { console.error('Tasks:', e); }
}

// ---------------------------------------------------------------------------
// Memory
// ---------------------------------------------------------------------------
async function loadMemory() {
  try {
    const data = await (await fetch(BASE + '/api/memory')).json();
    const el = document.getElementById('memory');
    const items = [
      { val: fmt(data.fts5?.entries), label: 'FTS5 Entries' },
      { val: fmt(data.searchIndex?.entries), label: 'Search Index' },
      { val: data.fts5?.databases || '—', label: 'Databases' },
      { val: data.codex?.solutions || '—', label: 'Solutions' },
      { val: data.codex?.patterns || '—', label: 'Patterns' },
      { val: data.til?.broadcasts || '—', label: 'TIL' },
    ];
    el.innerHTML = '<div class="mem-grid">' + items.map(i => \`
      <div class="mem-item">
        <div class="mem-val">\${i.val}</div>
        <div class="mem-label">\${i.label}</div>
      </div>\`).join('') + '</div>';
  } catch(e) { console.error('Memory:', e); }
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
async function loadEvents() {
  try {
    const data = await (await fetch(BASE + '/api/events')).json();
    const el = document.getElementById('events');
    if (!data.length) {
      el.innerHTML = '<li style="color:var(--muted)">No events — connect webhook to /api/webhook</li>';
      return;
    }
    el.innerHTML = data.slice(0, 20).map(e => \`
      <li>
        <span class="type">\${e.type}</span>
        \${e.title || e.action || ''}
        <span class="time">\${e.timestamp?.slice(0, 16) || ''}</span>
      </li>\`).join('');
  } catch(e) { console.error('Events:', e); }
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
async function loadAuth() {
  try {
    const data = await (await fetch(BASE + '/api/auth')).json();
    const el = document.getElementById('auth-stats');
    el.innerHTML = \`
      <div class="stat-row"><span class="stat-label">Users</span><span class="stat-value">\${data.users || '—'}</span></div>
      <div class="stat-row"><span class="stat-label">Sessions</span><span class="stat-value">\${data.sessions || '—'}</span></div>
      <div class="stat-row"><span class="stat-label">Provider</span><span class="stat-value">\${data.provider || 'JWT + D1'}</span></div>
      <div class="stat-row"><span class="stat-label">Endpoint</span><span class="stat-value">\${data.endpoint || 'auth.blackroad.io'}</span></div>
    \`;
  } catch(e) { console.error('Auth:', e); }
}

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------
async function loadBilling() {
  try {
    const data = await (await fetch(BASE + '/api/billing')).json();
    const el = document.getElementById('billing-stats');
    el.innerHTML = \`
      <div class="stat-row"><span class="stat-label">Plans</span><span class="stat-value">\${data.plans || '—'}</span></div>
      <div class="stat-row"><span class="stat-label">Add-ons</span><span class="stat-value">\${data.addons || '—'}</span></div>
      <div class="stat-row"><span class="stat-label">Provider</span><span class="stat-value">\${data.provider || 'RoadPay'}</span></div>
      <div class="stat-row"><span class="stat-label">Database</span><span class="stat-value">\${data.database || 'D1'}</span></div>
      <div class="stat-row"><span class="stat-label">Endpoint</span><span class="stat-value">\${data.endpoint || 'pay.blackroad.io'}</span></div>
    \`;
  } catch(e) { console.error('Billing:', e); }
}

// ---------------------------------------------------------------------------
// Mesh
// ---------------------------------------------------------------------------
async function loadMesh() {
  try {
    const data = await (await fetch(BASE + '/api/mesh')).json();
    const el = document.getElementById('mesh-stats');
    el.innerHTML = \`
      <div class="stat-row"><span class="stat-label">Protocol</span><span class="stat-value">\${data.protocol || 'NATS'}</span></div>
      <div class="stat-row">
        <span class="stat-label">Nodes</span>
        <span class="stat-value" style="display:flex;align-items:center;gap:6px;">
          <span class="dot \${data.nodesConnected >= data.nodesTotal ? 'green' : 'yellow'}"></span>
          \${data.nodesConnected || '—'}/\${data.nodesTotal || '—'}
        </span>
      </div>
      <div class="stat-row"><span class="stat-label">WireGuard</span><span class="stat-value">\${data.wireguard?.hub || '—'} (\${data.wireguard?.subnet || '—'})</span></div>
      <div class="stat-row"><span class="stat-label">Pub/Sub</span><span class="stat-value">\${data.pubsubAgents ? 'Active' : 'Inactive'}</span></div>
    \`;
  } catch(e) { console.error('Mesh:', e); }
}

// ---------------------------------------------------------------------------
// Repos
// ---------------------------------------------------------------------------
async function loadRepos() {
  try {
    const data = await (await fetch(BASE + '/api/repos')).json();
    const el = document.getElementById('repos');
    const repos = data.recent || [];
    if (!repos.length) {
      el.innerHTML = '<li style="color:var(--muted)">No repos loaded</li>';
      return;
    }
    el.innerHTML = repos.map(r => \`
      <li>\${r.name} <span style="color:var(--muted)">\${r.language || ''}</span></li>
    \`).join('');
  } catch(e) { console.error('Repos:', e); }
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------
async function loadHealth() {
  try {
    const data = await (await fetch(BASE + '/api/health')).json();
    const dot = document.getElementById('health-dot');
    const text = document.getElementById('health-text');
    const cls = data.status === 'operational' ? 'green' : data.status === 'degraded' ? 'yellow' : 'red';
    dot.className = 'dot ' + cls;
    text.textContent = data.status.toUpperCase() + ' — ' + data.nodes_online + '/' + data.nodes_total + ' nodes';
  } catch(e) { console.error('Health:', e); }
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------
async function doSearch() {
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const q = input.value.trim();
  if (!q) { results.innerHTML = ''; return; }

  results.innerHTML = '<span class="loading">Searching...</span>';
  try {
    const data = await (await fetch(BASE + '/api/search?q=' + encodeURIComponent(q))).json();
    if (data.error) {
      results.innerHTML = '<div class="sr-item" style="color:var(--dot-red)">' + data.error + '</div>';
      return;
    }
    const items = data.results || data.hits || [];
    if (!items.length) {
      results.innerHTML = '<div class="sr-item">No results for "' + q + '"</div>';
      return;
    }
    results.innerHTML = items.slice(0, 10).map(r => \`
      <div class="sr-item">
        <strong style="color:var(--text)">\${r.title || r.name || r.path || '—'}</strong>
        <span style="color:var(--muted);margin-left:8px">\${r.snippet || r.description || r.type || ''}</span>
      </div>\`).join('');
  } catch(e) {
    results.innerHTML = '<div class="sr-item" style="color:var(--dot-red)">Search failed: ' + e.message + '</div>';
  }
}

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------
function fmt(n) {
  if (n == null || n === undefined) return '—';
  if (typeof n === 'string') return n;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

// ---------------------------------------------------------------------------
// Refresh all panels
// ---------------------------------------------------------------------------
async function refresh() {
  updateClock();
  await Promise.all([
    loadFleet(), loadKPIs(), loadAgents(), loadTasks(),
    loadMemory(), loadEvents(), loadAuth(), loadBilling(),
    loadMesh(), loadRepos(), loadHealth()
  ]);
}

// Init
refresh();
refreshTimer = setInterval(refresh, 30000);
setInterval(updateClock, 1000);
</script>
</body>
</html>`;
}
