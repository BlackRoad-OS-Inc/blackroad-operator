// Fleet Dashboard — BlackRoad OS status at a glance
// Cloudflare Worker — client-side health checks for accurate results

const WORKERS = [
  { name: 'roadcode-squad', url: 'https://roadcode-squad.amundsonalexa.workers.dev/health' },
  { name: 'squad-webhook', url: 'https://squad-webhook.amundsonalexa.workers.dev/health' },
  { name: 'stats-blackroad', url: 'https://stats-blackroad.amundsonalexa.workers.dev/health' },
  { name: 'analytics-blackroad', url: 'https://analytics-blackroad.amundsonalexa.workers.dev/health' },
  { name: 'fleet-dashboard', url: 'https://fleet-dashboard.amundsonalexa.workers.dev/health' },
  { name: 'roadpay', url: 'https://roadpay.amundsonalexa.workers.dev/health' },
  { name: 'road-search', url: 'https://road-search.amundsonalexa.workers.dev/health' },
  { name: 'blackroad-stripe', url: 'https://blackroad-stripe.amundsonalexa.workers.dev/health' },
];

const NODES = [
  { name: 'Alice', ip: '192.168.4.49', role: 'Gateway & DNS' },
  { name: 'Cecilia', ip: '192.168.4.96', role: 'Edge AI (26 TOPS)' },
  { name: 'Octavia', ip: '192.168.4.101', role: 'Gitea & Docker Swarm' },
  { name: 'Aria', ip: '192.168.4.98', role: 'Orchestration' },
  { name: 'Lucidia', ip: '192.168.4.38', role: 'Memory & Cognition' },
];

function renderHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BlackRoad Fleet Dashboard</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a0a; color: #fff; font-family: 'JetBrains Mono', 'SF Mono', monospace; padding: 2rem; max-width: 900px; margin: 0 auto; }
  h1 { font-size: 1.5rem; margin-bottom: 0.25rem; background: linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .tagline { color: #666; font-size: 0.8rem; margin-bottom: 2rem; }
  .overall { font-size: 1rem; margin-bottom: 2rem; padding: 0.75rem 1rem; border-radius: 8px; transition: border-color 0.3s; border: 1px solid #333; }
  .overall.ok { border-color: #22c55e; }
  .overall.warn { border-color: #ef4444; }
  .section { margin-bottom: 2rem; }
  .section h2 { font-size: 0.9rem; color: #888; margin-bottom: 0.75rem; border-bottom: 1px solid #222; padding-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.5rem; }
  .card { padding: 0.6rem 0.75rem; border: 1px solid #222; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; transition: border-color 0.3s; }
  .card.up { border-color: #22c55e44; }
  .card.down { border-color: #ef444444; }
  .card.checking { border-color: #f59e0b44; }
  .name { font-weight: bold; font-size: 0.85rem; }
  .role { color: #666; font-size: 0.7rem; margin-top: 2px; }
  .badge { font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
  .badge.up { color: #22c55e; }
  .badge.down { color: #ef4444; }
  .badge.checking { color: #f59e0b; }
  .meta { color: #444; font-size: 0.65rem; margin-top: 2px; }
  .footer { margin-top: 3rem; color: #444; font-size: 0.7rem; text-align: center; }
  .footer a { color: #4488ff; text-decoration: none; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
  .checking .badge { animation: pulse 1s infinite; }
</style>
</head>
<body>
<h1>BlackRoad Fleet Dashboard</h1>
<p class="tagline">Pave Tomorrow.</p>

<div class="overall" id="overall">Checking workers...</div>

<div class="section">
  <h2>Cloudflare Workers</h2>
  <div class="grid" id="workers"></div>
</div>

<div class="section">
  <h2>Fleet Nodes</h2>
  <div class="grid" id="nodes"></div>
</div>

<p class="footer">BlackRoad OS &mdash; <a href="javascript:location.reload()">Refresh</a> &mdash; <span id="ts"></span></p>

<script>
const workers = ${JSON.stringify(WORKERS)};
const nodes = ${JSON.stringify(NODES)};

function card(name, sub, status, extra) {
  return '<div class="card ' + status + '"><div><div class="name">' + name + '</div>' +
    (sub ? '<div class="role">' + sub + '</div>' : '') +
    (extra ? '<div class="meta">' + extra + '</div>' : '') +
    '</div><span class="badge ' + status + '">' +
    (status === 'up' ? 'ONLINE' : status === 'down' ? 'OFFLINE' : 'CHECKING') +
    '</span></div>';
}

// Render nodes (static — can't ping LAN from browser)
document.getElementById('nodes').innerHTML = nodes.map(n => card(n.name, n.role + ' · ' + n.ip, 'up')).join('');

// Check workers from the browser
const grid = document.getElementById('workers');
grid.innerHTML = workers.map(w => card(w.name, '', 'checking')).join('');

let up = 0, done = 0;
workers.forEach((w, i) => {
  fetch(w.url, { signal: AbortSignal.timeout(8000) })
    .then(r => r.ok ? r.json().then(d => ({ ok: true, version: d.version })) : ({ ok: false }))
    .catch(() => ({ ok: false }))
    .then(result => {
      done++;
      if (result.ok) up++;
      const cards = grid.querySelectorAll('.card');
      cards[i].className = 'card ' + (result.ok ? 'up' : 'down');
      cards[i].querySelector('.badge').className = 'badge ' + (result.ok ? 'up' : 'down');
      cards[i].querySelector('.badge').textContent = result.ok ? 'ONLINE' : 'OFFLINE';
      if (result.version) {
        cards[i].querySelector('.name').insertAdjacentHTML('afterend', '<div class="meta">v' + result.version + '</div>');
      }
      if (done === workers.length) {
        const el = document.getElementById('overall');
        el.className = 'overall ' + (up === workers.length ? 'ok' : 'warn');
        el.innerHTML = (up === workers.length ? '&#x2705;' : '&#x26A0;&#xFE0F;') +
          ' <strong>' + up + '/' + workers.length + ' workers online</strong>';
      }
    });
});

document.getElementById('ts').textContent = new Date().toLocaleString();
</script>
</body>
</html>`;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', service: 'fleet-dashboard', version: '1.1.0' });
    }

    if (url.pathname === '/api') {
      return Response.json({ workers: WORKERS, nodes: NODES, timestamp: new Date().toISOString() });
    }

    return new Response(renderHTML(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' },
    });
  },
};
