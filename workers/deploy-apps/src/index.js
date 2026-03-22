export default {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === '/api/apps') return json(APPS);
    return new Response(HTML, { headers: { 'Content-Type': 'text/html;charset=utf-8' } });
  }
};
function json(d) { return new Response(JSON.stringify(d), { headers: { 'Content-Type': 'application/json' } }); }

const APPS = [
  { name: 'RoadChat', desc: 'AI chat — local Ollama, zero cost, unlimited', url: 'https://chat.blackroad.io', icon: '💬', category: 'AI' },
  { name: 'RoadSearch', desc: 'Search everything — FTS5 across the ecosystem', url: 'https://search.blackroad.io', icon: '🔍', category: 'Tools' },
  { name: 'RoadPay', desc: 'Billing & subscriptions — own your payments', url: 'https://pay.blackroad.io', icon: '💰', category: 'Business' },
  { name: 'PRISM', desc: 'Operations console — fleet, KPIs, agents', url: 'https://prism.blackroad.io', icon: '🔮', category: 'Ops' },
  { name: 'BlackRoad AI', desc: '52 TOPS inference — 11 models, Hailo-8 NPU', url: 'https://ai.blackroad.io', icon: '🧠', category: 'AI' },
  { name: 'RoadC IDE', desc: 'Write RoadC in the browser — English is code', url: 'https://ide.blackroad.io', icon: '⌨️', category: 'Dev' },
  { name: 'Mesh Network', desc: 'WebRTC peer mesh — every link is a node', url: 'https://mesh.blackroad.io', icon: '🕸️', category: 'Network' },
  { name: 'BlackRoad HQ', desc: '14 floors, 50 agents — the pixel tower', url: 'https://hq.blackroad.io', icon: '🏢', category: 'World' },
  { name: 'Studio', desc: 'Video, images, motion — AI-powered creative', url: 'https://studio.blackroad.io', icon: '🎬', category: 'Creative' },
  { name: 'Images', desc: 'Brand assets, pixel art, logos — R2 CDN', url: 'https://images.blackroad.io', icon: '🖼️', category: 'Creative' },
  { name: 'Auth', desc: 'Identity & access — JWT, 42 users', url: 'https://auth.blackroad.io', icon: '🔐', category: 'Platform' },
  { name: 'Analytics', desc: 'Page views, events — D1 powered', url: 'https://analytics.blackroad.io', icon: '📊', category: 'Business' },
  { name: 'AI Chain', desc: 'Distributed LLM inference across Pi fleet', url: 'https://chain.blackroad.io', icon: '⛓️', category: 'AI' },
  { name: 'Compliance', desc: 'Governance, policies, audit log', url: 'https://compliance.blackroad.io', icon: '📜', category: 'Business' },
  { name: 'Control', desc: 'Fleet ops — deploy, orchestrate, manage', url: 'https://control.blackroad.io', icon: '🎛️', category: 'Ops' },
  { name: 'Engineering', desc: '275 repos, CI/CD, architecture', url: 'https://engineering.blackroad.io', icon: '⚙️', category: 'Dev' },
  { name: 'Data', desc: '228 SQLite DBs, 8 D1, 40 KV, 10 R2', url: 'https://data.blackroad.io', icon: '💾', category: 'Platform' },
  { name: 'CDN', desc: 'Edge delivery — 300+ Cloudflare PoPs', url: 'https://cdn.blackroad.io', icon: '🌐', category: 'Network' },
  { name: 'Events', desc: 'Activity feed, deploys, broadcasts', url: 'https://events.blackroad.io', icon: '📡', category: 'Platform' },
  { name: 'Lucidia', desc: 'AI learning platform — 10 domain experts', url: 'https://lucidia.studio', icon: '💡', category: 'AI' },
];

const CATEGORIES = [...new Set(APPS.map(a => a.category))];

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>BlackRoad Apps — Everything We Built</title>
<link rel="icon" href="https://images.blackroad.io/brand/favicon.png">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000;color:#fff;font-family:'Inter',system-ui,sans-serif;min-height:100vh}
nav{display:flex;align-items:center;gap:2rem;padding:1rem 2rem;border-bottom:1px solid #111;position:sticky;top:0;background:rgba(0,0,0,.95);backdrop-filter:blur(20px);z-index:100}
.logo{font-family:'Space Grotesk',sans-serif;font-weight:800;font-size:1.1rem;background:linear-gradient(135deg,#F5A623,#FF1D6C,#9C27B0,#2979FF);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
nav a{color:#888;text-decoration:none;font-size:.85rem}nav a:hover{color:#fff}
.hero{text-align:center;padding:4rem 2rem 2rem}
h1{font-family:'Space Grotesk',sans-serif;font-size:clamp(2.5rem,6vw,4.5rem);font-weight:800;background:linear-gradient(135deg,#F5A623 0%,#FF1D6C 38.2%,#9C27B0 61.8%,#2979FF 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:.75rem}
.sub{color:#888;font-size:1.1rem;max-width:500px;margin:0 auto 2rem;line-height:1.6}
.count{font-family:'JetBrains Mono',monospace;color:#4ade80;font-size:.85rem;margin-bottom:2rem}
.filters{display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;margin-bottom:2.5rem;padding:0 1rem}
.filter{background:#111;border:1px solid #222;color:#888;padding:.4rem 1rem;border-radius:20px;font-size:.8rem;cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif}
.filter:hover,.filter.active{background:#1a1a1a;color:#fff;border-color:#4ade80}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.25rem;max-width:1100px;margin:0 auto;padding:0 2rem 4rem}
.app{background:#0a0a0a;border:1px solid #1a1a1a;border-radius:16px;padding:1.75rem;cursor:pointer;transition:all .25s;text-decoration:none;color:#fff;display:block}
.app:hover{border-color:#333;transform:translateY(-3px);box-shadow:0 8px 30px rgba(0,0,0,.5)}
.app .icon{font-size:2.5rem;margin-bottom:1rem;display:block}
.app h3{font-family:'Space Grotesk',sans-serif;font-size:1.15rem;font-weight:700;margin-bottom:.5rem}
.app p{color:#888;font-size:.85rem;line-height:1.5}
.app .cat{display:inline-block;background:#111;color:#4ade80;font-family:'JetBrains Mono',monospace;font-size:.65rem;padding:.2rem .5rem;border-radius:6px;margin-top:.75rem;text-transform:uppercase;letter-spacing:.05em}
.app .url{color:#555;font-size:.7rem;font-family:'JetBrains Mono',monospace;margin-top:.5rem;display:block}
footer{text-align:center;padding:3rem 2rem;color:#333;font-size:.8rem;border-top:1px solid #111}
footer a{color:#555;text-decoration:none;margin:0 .75rem}footer a:hover{color:#fff}
.tl{font-family:'Space Grotesk',sans-serif;color:#555;font-size:.85rem;margin-top:.75rem}
.manifest{max-width:700px;margin:0 auto 3rem;padding:0 2rem;text-align:center}
.manifest p{color:#666;font-size:.9rem;line-height:1.7}
.manifest strong{color:#fff}
</style>
</head>
<body>
<nav>
  <div class="logo">BlackRoad Apps</div>
  <a href="https://blackroad.io">Home</a>
  <a href="https://ai.blackroad.io">AI</a>
  <a href="https://search.blackroad.io">Search</a>
  <a href="https://github.com/BlackRoad-OS-Inc">GitHub</a>
</nav>

<div class="hero">
  <h1>BlackRoad Apps</h1>
  <p class="sub">Everything we built. Everything we own. No external dependencies, no API limits, no permission walls.</p>
  <div class="count">20 apps &bull; 28 live sites &bull; 110 Workers &bull; zero external deps</div>
</div>

<div class="manifest">
  <p>We don't use apps we didn't build. <strong>iMessage doesn't have limits and neither do we.</strong> Every app runs on our fleet — 5 Raspberry Pis, 2 Hailo-8 NPUs, 52 TOPS, 11 Ollama models. Local-first. Sovereign. If you can't do it from BlackRoad, it doesn't get done.</p>
</div>

<div class="filters">
  <span class="filter active" onclick="filterApps('all')">All</span>
  <span class="filter" onclick="filterApps('AI')">AI</span>
  <span class="filter" onclick="filterApps('Tools')">Tools</span>
  <span class="filter" onclick="filterApps('Business')">Business</span>
  <span class="filter" onclick="filterApps('Dev')">Dev</span>
  <span class="filter" onclick="filterApps('Ops')">Ops</span>
  <span class="filter" onclick="filterApps('Platform')">Platform</span>
  <span class="filter" onclick="filterApps('Network')">Network</span>
  <span class="filter" onclick="filterApps('Creative')">Creative</span>
  <span class="filter" onclick="filterApps('World')">World</span>
</div>

<div class="grid" id="apps">
${APPS.map(a => `
  <a class="app" href="${a.url}" data-cat="${a.category}">
    <span class="icon">${a.icon}</span>
    <h3>${a.name}</h3>
    <p>${a.desc}</p>
    <span class="cat">${a.category}</span>
    <span class="url">${a.url.replace('https://','')}</span>
  </a>
`).join('')}
</div>

<footer>
  <a href="https://blackroad.io">Home</a>
  <a href="https://ai.blackroad.io">AI</a>
  <a href="https://mesh.blackroad.io">Network</a>
  <a href="https://search.blackroad.io">Search</a>
  <a href="https://pay.blackroad.io">Pricing</a>
  <a href="https://github.com/BlackRoad-OS-Inc">GitHub</a>
  <div class="tl">BlackRoad OS — Pave Tomorrow.</div>
</footer>

<script>
function filterApps(cat) {
  document.querySelectorAll('.filter').forEach(f => f.classList.remove('active'));
  event.target.classList.add('active');
  document.querySelectorAll('.app').forEach(a => {
    a.style.display = (cat === 'all' || a.dataset.cat === cat) ? '' : 'none';
  });
}
</script>
<script src="https://bb.blackroad.io/bb.js" defer></script>
</body>
</html>`;
