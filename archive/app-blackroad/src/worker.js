// app.blackroad.io — The Front Door
// A: Landing + Login  B: Auth gate  C: Dashboard  D: Agents  E: Chat
// BlackRoad OS, Inc. All rights reserved.

const AUTH_URL = 'http://192.168.4.101:9003';
const ROUNDTRIP_URL = 'http://192.168.4.101:9016';
const CHAT_URL = 'http://192.168.4.101:9009';
const SEARCH_URL = 'http://192.168.4.101:9002';
const FLEET_URL = 'https://prism.blackroad.io';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    // Auth callback
    if (path === '/auth/callback' && request.method === 'POST') {
      const body = await request.json();
      // Proxy to auth worker
      try {
        const res = await fetch(AUTH_URL + '/api/login', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        return Response.json(data, { headers: cors });
      } catch (e) {
        return Response.json({ error: e.message }, { status: 502, headers: cors });
      }
    }

    // Proxy to roundtrip agents
    if (path.startsWith('/agents/')) {
      const agentPath = path.replace('/agents', '');
      try {
        const res = await fetch(ROUNDTRIP_URL + agentPath, {
          method: request.method,
          headers: { 'Content-Type': 'application/json' },
          body: request.method !== 'GET' ? await request.text() : undefined,
        });
        return new Response(await res.text(), { headers: { ...cors, 'Content-Type': 'application/json' } });
      } catch (e) {
        return Response.json({ error: e.message }, { status: 502, headers: cors });
      }
    }

    // Health
    if (path === '/api/health') {
      return Response.json({ status: 'up', service: 'app.blackroad.io', version: '1.0.0' }, { headers: cors });
    }

    // Serve the app
    return new Response(renderApp(), { headers: { 'Content-Type': 'text/html;charset=utf-8', ...cors } });
  }
};

function renderApp() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BlackRoad OS</title>
<meta name="description" content="Your device. Your data. Your agents. Pick up your agent. Ride the BlackRoad together.">
<link rel="icon" href="https://images.blackroad.io/pixel-art/road-logo.png">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--g135:linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--bg:#000;--card:#0a0a0a;--elevated:#111;--border:#1a1a1a;--white:#fff;--black:#000;--sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace;--inter:'Inter',sans-serif}
body{background:var(--bg);color:var(--white);font-family:var(--sg);min-height:100vh;overflow-x:hidden}
.grad-bar{height:4px;background:var(--g);position:fixed;top:0;left:0;right:0;z-index:999}

/* ═══ LOGIN VIEW ═══ */
.login-view{min-height:100vh;display:flex;flex-direction:column}
.auth-layout{flex:1;display:grid;grid-template-columns:1fr 1fr}
.auth-form-side{display:flex;align-items:center;justify-content:center;padding:48px}
.auth-form-wrap{width:100%;max-width:380px}
.auth-logo{font-weight:700;font-size:22px;display:flex;align-items:center;gap:10px;margin-bottom:48px}
.auth-logo-mark{width:28px;height:4px;border-radius:2px;background:var(--g)}
.auth-form-wrap h1{font-size:28px;font-weight:700;margin-bottom:8px}
.auth-form-wrap .subtitle{font-size:14px;opacity:.4;margin-bottom:36px}
.form-group{margin-bottom:20px}
.form-label{display:block;font-size:12px;font-weight:600;opacity:.6;margin-bottom:6px}
.form-input{width:100%;padding:12px 16px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--white);font-size:14px;font-family:var(--sg);outline:none;transition:border-color .2s}
.form-input:focus{border-color:#333}
.form-input::placeholder{opacity:.2}
.btn-auth{width:100%;padding:12px;border:none;border-radius:6px;background:var(--white);color:var(--black);font-size:14px;font-weight:600;cursor:pointer;font-family:var(--sg);margin-top:8px}
.btn-auth:hover{opacity:.9}
.auth-footer{text-align:center;margin-top:32px;font-size:13px;opacity:.4}
.auth-visual-side{border-left:1px solid var(--border);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
.auth-orb{position:absolute;border-radius:50%;filter:blur(100px);opacity:.12}
.auth-orb-1{width:500px;height:500px;background:#FF2255;top:-100px;left:-100px}
.auth-orb-2{width:400px;height:400px;background:#4488FF;bottom:-50px;right:-50px}
.auth-orb-3{width:300px;height:300px;background:#8844FF;top:30%;left:30%}
.auth-visual-content{position:relative;text-align:center;padding:48px;max-width:400px}
.auth-visual-content h2{font-size:28px;font-weight:700;margin-bottom:16px}
.auth-visual-content p{font-size:14px;opacity:.5;line-height:1.7}

/* ═══ DASHBOARD VIEW ═══ */
.dashboard-view{display:none;height:100vh;display:none;grid-template-columns:220px 1fr 320px;grid-template-rows:52px 1fr}
.dashboard-view.active{display:grid}
.login-view.hidden{display:none}

/* Topbar */
.topbar{grid-column:1/-1;background:var(--card);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 20px;gap:16px}
.topbar-logo{font-weight:700;font-size:16px;display:flex;align-items:center;gap:8px}
.topbar-mark{width:20px;height:3px;border-radius:2px;background:var(--g)}
.topbar-search{flex:1;max-width:400px;margin:0 auto}
.topbar-search input{width:100%;padding:8px 14px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--white);font-size:13px;font-family:var(--sg);outline:none}
.topbar-search input:focus{border-color:#333}
.topbar-user{font-size:13px;opacity:.5;display:flex;align-items:center;gap:8px}
.topbar-dot{width:8px;height:8px;border-radius:50%;background:#4ade80}

/* Sidebar */
.sidebar{background:var(--card);border-right:1px solid var(--border);padding:12px 0;overflow-y:auto}
.side-section{padding:4px 12px;margin-bottom:8px}
.side-label{font-size:10px;text-transform:uppercase;letter-spacing:1px;opacity:.3;padding:8px 0 4px;font-weight:600}
.side-item{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:13px;opacity:.6;transition:all .15s}
.side-item:hover{background:var(--elevated);opacity:.9}
.side-item.active{background:var(--elevated);opacity:1}
.side-icon{width:16px;text-align:center;font-size:14px}

/* Main content */
.main{overflow-y:auto;padding:24px}
.main h2{font-size:20px;font-weight:700;margin-bottom:16px}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
.stat-card{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:16px}
.stat-label{font-size:11px;opacity:.4;text-transform:uppercase;letter-spacing:.5px}
.stat-value{font-size:24px;font-weight:700;margin-top:4px;font-family:var(--jb)}
.stat-sub{font-size:11px;opacity:.3;margin-top:2px}

/* Agent grid */
.agent-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin-top:12px}
.agent-card{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:10px;cursor:pointer;transition:border-color .15s;text-align:center}
.agent-card:hover{border-color:#333}
.agent-emoji{font-size:20px}
.agent-name{font-size:12px;font-weight:600;margin-top:4px}
.agent-role{font-size:10px;opacity:.3}

/* Fleet strip */
.fleet-strip{display:flex;gap:12px;flex-wrap:wrap;margin-top:12px}
.fleet-node{display:flex;align-items:center;gap:6px;padding:6px 12px;background:var(--card);border:1px solid var(--border);border-radius:6px;font-size:12px}
.fleet-dot{width:6px;height:6px;border-radius:50%}

/* Right panel — Chat */
.chat-panel{background:var(--card);border-left:1px solid var(--border);display:flex;flex-direction:column}
.chat-header{padding:12px 16px;border-bottom:1px solid var(--border);font-size:13px;font-weight:600}
.chat-frame{flex:1;border:none;width:100%}
.chat-input-area{padding:10px;border-top:1px solid var(--border);display:flex;gap:6px}
.chat-input-area input{flex:1;padding:8px 12px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--white);font-size:13px;font-family:var(--sg);outline:none}
.chat-input-area button{background:var(--white);color:var(--black);border:none;padding:8px 14px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer}

/* Responsive */
@media(max-width:768px){
  .auth-layout{grid-template-columns:1fr}
  .auth-visual-side{display:none}
  .auth-form-side{padding:32px 20px}
  .dashboard-view.active{grid-template-columns:1fr;grid-template-rows:52px 1fr}
  .sidebar,.chat-panel{display:none}
}
</style>
</head>
<body>
<div class="grad-bar"></div>

<!-- ═══ A: LOGIN ═══ -->
<div class="login-view" id="loginView">
<div class="auth-layout">
  <div class="auth-form-side">
    <div class="auth-form-wrap">
      <div class="auth-logo"><div class="auth-logo-mark"></div>BlackRoad</div>
      <h1>Sign in</h1>
      <p class="subtitle">Your device. Your data. Your agents.</p>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-input" type="email" id="loginEmail" placeholder="you@example.com">
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <input class="form-input" type="password" id="loginPass" placeholder="Enter password">
      </div>
      <button class="btn-auth" onclick="doLogin()">Sign in</button>
      <p class="auth-footer">Pick up your agent. Ride the BlackRoad together.</p>
    </div>
  </div>
  <div class="auth-visual-side">
    <div class="auth-orb auth-orb-1"></div>
    <div class="auth-orb auth-orb-2"></div>
    <div class="auth-orb auth-orb-3"></div>
    <div class="auth-visual-content">
      <h2>Pave Tomorrow.</h2>
      <p>62 agents. 5 nodes. 52 TOPS. Your entire AI fleet, in one place. Runs on anything you own.</p>
    </div>
  </div>
</div>
</div>

<!-- ═══ C: DASHBOARD ═══ -->
<div class="dashboard-view" id="dashView">
  <!-- Topbar -->
  <div class="topbar">
    <div class="topbar-logo"><div class="topbar-mark"></div>BlackRoad</div>
    <div class="topbar-search"><input placeholder="Search everything..." id="searchInput" onkeydown="if(event.key==='Enter')doSearch()"></div>
    <div class="topbar-user"><div class="topbar-dot"></div><span id="userName">Alexa</span></div>
  </div>

  <!-- Sidebar -->
  <div class="sidebar">
    <div class="side-section">
      <div class="side-label">Workspace</div>
      <div class="side-item active" onclick="showPanel('overview')"><span class="side-icon">~</span> Overview</div>
      <div class="side-item" onclick="showPanel('agents')"><span class="side-icon">></span> Agents</div>
      <div class="side-item" onclick="showPanel('fleet')"><span class="side-icon">#</span> Fleet</div>
      <div class="side-item" onclick="showPanel('code')"><span class="side-icon">/</span> Code</div>
    </div>
    <div class="side-section">
      <div class="side-label">Tools</div>
      <div class="side-item" onclick="showPanel('search')"><span class="side-icon">?</span> Search</div>
      <div class="side-item" onclick="showPanel('vision')"><span class="side-icon">@</span> Vision</div>
      <div class="side-item" onclick="showPanel('billing')"><span class="side-icon">$</span> Billing</div>
    </div>
    <div class="side-section">
      <div class="side-label">Fleet Nodes</div>
      <div id="sideFleet"></div>
    </div>
  </div>

  <!-- Main -->
  <div class="main" id="mainContent">
    <!-- D: Overview with agents -->
    <div id="panel-overview">
      <h2>Welcome back</h2>
      <div class="grid-3">
        <div class="stat-card"><div class="stat-label">Agents</div><div class="stat-value" id="statAgents">62</div><div class="stat-sub">across 10 groups</div></div>
        <div class="stat-card"><div class="stat-label">Nodes</div><div class="stat-value" id="statNodes">6</div><div class="stat-sub">online right now</div></div>
        <div class="stat-card"><div class="stat-label">Vision</div><div class="stat-value">52</div><div class="stat-sub">TOPS (Hailo-8 x2)</div></div>
      </div>
      <h2>Fleet</h2>
      <div class="fleet-strip" id="fleetStrip"></div>
      <h2 style="margin-top:24px">Agents</h2>
      <div class="agent-grid" id="agentGrid"></div>
    </div>

    <div id="panel-agents" style="display:none">
      <h2>All Agents</h2>
      <div class="agent-grid" id="agentGridFull"></div>
    </div>

    <div id="panel-fleet" style="display:none">
      <h2>Fleet Status</h2>
      <div id="fleetDetail"></div>
    </div>

    <div id="panel-search" style="display:none">
      <h2>Search</h2>
      <input class="form-input" style="max-width:500px;margin-bottom:16px" placeholder="Search all BlackRoad content..." id="searchBox" onkeydown="if(event.key==='Enter')doSearch()">
      <div id="searchResults"></div>
    </div>

    <div id="panel-vision" style="display:none">
      <h2>Hailo-8 Vision</h2>
      <p style="opacity:.4;font-size:14px;margin-bottom:16px">52 TOPS object detection across Cecilia + Octavia</p>
      <div class="grid-3" id="hailoModels"></div>
    </div>

    <div id="panel-code" style="display:none"><h2>Code</h2><p style="opacity:.4">239 repos on RoadCode (Gitea)</p><iframe src="https://git.blackroad.io" style="width:100%;height:600px;border:1px solid var(--border);border-radius:10px;margin-top:12px"></iframe></div>
    <div id="panel-billing" style="display:none"><h2>Billing</h2><p style="opacity:.4">RoadPay — 4 plans</p></div>
  </div>

  <!-- E: Chat panel -->
  <div class="chat-panel">
    <div class="chat-header">Chat with Agents</div>
    <iframe class="chat-frame" src="https://roundtrip.blackroad.io" id="chatFrame"></iframe>
  </div>
</div>

<script>
// ═══ B: AUTH ═══
function doLogin() {
  const email = document.getElementById('loginEmail').value;
  const pass = document.getElementById('loginPass').value;
  if (!email) return;
  // Store session
  localStorage.setItem('br_user', JSON.stringify({ email, name: email.split('@')[0], logged_in: Date.now() }));
  enterDashboard();
}

function enterDashboard() {
  document.getElementById('loginView').classList.add('hidden');
  document.getElementById('dashView').classList.add('active');
  const user = JSON.parse(localStorage.getItem('br_user') || '{}');
  document.getElementById('userName').textContent = user.name || 'User';
  loadAgents();
  loadFleet();
  loadHailo();
}

// Auto-login if session exists
if (localStorage.getItem('br_user')) enterDashboard();

// ═══ D: AGENTS ═══
async function loadAgents() {
  try {
    const res = await fetch('/agents/api/agents');
    const agents = await res.json();
    const grid = document.getElementById('agentGrid');
    const gridFull = document.getElementById('agentGridFull');
    const html = agents.slice(0, 24).map(a =>
      '<div class="agent-card" onclick="chatAgent(\\'' + a.id + '\\')">' +
      '<div class="agent-emoji">' + a.emoji + '</div>' +
      '<div class="agent-name">' + a.name + '</div>' +
      '<div class="agent-role">' + a.role + '</div></div>'
    ).join('');
    const htmlFull = agents.map(a =>
      '<div class="agent-card" onclick="chatAgent(\\'' + a.id + '\\')">' +
      '<div class="agent-emoji">' + a.emoji + '</div>' +
      '<div class="agent-name">' + a.name + '</div>' +
      '<div class="agent-role">' + a.role + '</div></div>'
    ).join('');
    grid.innerHTML = html;
    gridFull.innerHTML = htmlFull;
    document.getElementById('statAgents').textContent = agents.length;
  } catch {}
}

function chatAgent(id) {
  document.getElementById('chatFrame').src = 'https://roundtrip.blackroad.io#agent=' + id;
}

// ═══ F: FLEET ═══
async function loadFleet() {
  const nodes = [
    { name: 'Alice', ip: '192.168.4.49', role: 'Gateway' },
    { name: 'Cecilia', ip: '192.168.4.96', role: 'AI Engine' },
    { name: 'Octavia', ip: '192.168.4.101', role: 'Architect' },
    { name: 'Lucidia', ip: '192.168.4.38', role: 'Dreamer' },
    { name: 'Gematria', ip: '159.65.43.12', role: 'Edge' },
    { name: 'Anastasia', ip: '174.138.44.45', role: 'Cloud' },
  ];
  const strip = document.getElementById('fleetStrip');
  const side = document.getElementById('sideFleet');
  strip.innerHTML = nodes.map(n =>
    '<div class="fleet-node"><div class="fleet-dot" style="background:#4ade80"></div>' + n.name + ' <span style="opacity:.3;font-size:10px">' + n.role + '</span></div>'
  ).join('');
  side.innerHTML = nodes.map(n =>
    '<div class="side-item"><span class="side-icon" style="color:#4ade80;font-size:8px">*</span> ' + n.name + '</div>'
  ).join('');
  document.getElementById('statNodes').textContent = nodes.length;
}

// ═══ G: HAILO ═══
async function loadHailo() {
  try {
    const res = await fetch('/agents/api/hailo/models');
    const data = await res.json();
    const el = document.getElementById('hailoModels');
    el.innerHTML = Object.entries(data.models || {}).map(([name, info]) =>
      '<div class="stat-card"><div class="stat-label">' + name + '</div><div class="stat-value" style="font-size:16px">' + info.desc + '</div><div class="stat-sub">' + (info.available ? 'Ready' : 'Offline') + '</div></div>'
    ).join('');
  } catch {}
}

// Panel switching
function showPanel(name) {
  document.querySelectorAll('[id^="panel-"]').forEach(el => el.style.display = 'none');
  const panel = document.getElementById('panel-' + name);
  if (panel) panel.style.display = '';
  document.querySelectorAll('.side-item').forEach(el => el.classList.remove('active'));
  event?.target?.closest?.('.side-item')?.classList.add('active');
}

function doSearch() {
  const q = document.getElementById('searchBox')?.value || document.getElementById('searchInput')?.value;
  if (!q) return;
  showPanel('search');
  document.getElementById('searchBox').value = q;
  document.getElementById('searchResults').innerHTML = '<p style="opacity:.4">Searching...</p>';
  fetch('/agents/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ agent: 'roadsearch', message: q, channel: 'search' }) })
    .then(r => r.json())
    .then(d => { document.getElementById('searchResults').innerHTML = '<div class="stat-card"><div class="stat-label">Result</div><p style="margin-top:8px;font-size:14px;line-height:1.6">' + (d.reply || 'No results') + '</p></div>'; })
    .catch(() => { document.getElementById('searchResults').innerHTML = '<p style="opacity:.4">Search unavailable</p>'; });
}
</script>
</body>
</html>`;
}
