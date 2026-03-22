const express = require('express');
const { RoadCodeClient } = require('@roadcode/sdk');
const { createLogger } = require('@roadcode/logger');

const log = createLogger('prism');
const client = new RoadCodeClient(process.env.REGISTRY_URL || 'http://localhost:3101');
const PORT = process.env.PRISM_PORT || 8787;

const app = express();

const CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; background: #0a0a0a; color: #e0e0e0; }
a { color: #2979ff; text-decoration: none; }
a:hover { text-decoration: underline; }
nav { background: #111; padding: 0.75rem 2rem; display: flex; gap: 2rem; align-items: center; border-bottom: 1px solid #222; }
nav .brand { color: #ff1d6c; font-weight: bold; font-size: 1.1rem; }
nav a { color: #888; font-size: 0.85rem; }
nav a:hover { color: #fff; }
main { padding: 2rem; max-width: 1200px; margin: 0 auto; }
h1 { color: #ff1d6c; font-size: 1.4rem; margin-bottom: 0.5rem; }
h2 { color: #f5a623; font-size: 1.1rem; margin: 1.5rem 0 0.5rem; }
h3 { color: #9c27b0; font-size: 0.95rem; margin: 1rem 0 0.3rem; }
.subtitle { color: #666; font-size: 0.85rem; margin-bottom: 1.5rem; }
.stats { display: flex; gap: 1rem; flex-wrap: wrap; margin: 1rem 0; }
.stat { background: #1a1a2e; padding: 0.8rem 1.2rem; border-radius: 6px; border-left: 3px solid #ff1d6c; min-width: 120px; }
.stat .num { font-size: 1.8rem; color: #ff1d6c; font-weight: bold; }
.stat .label { color: #666; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; }
table { width: 100%; border-collapse: collapse; margin: 0.5rem 0; }
th { text-align: left; color: #666; font-size: 0.7rem; text-transform: uppercase; padding: 0.5rem 0.75rem; border-bottom: 1px solid #222; letter-spacing: 0.05em; }
td { padding: 0.4rem 0.75rem; border-bottom: 1px solid #111; font-size: 0.8rem; }
tr:hover { background: #111; }
.tier-0 { color: #ff1d6c; font-weight: bold; }
.tier-1 { color: #f5a623; font-weight: bold; }
.tier-2 { color: #2979ff; }
.online, .live, .active, .running { color: #4caf50; }
.offline, .down, .error { color: #f44336; }
.archived, .deprecated { color: #666; }
.badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 3px; font-size: 0.7rem; text-transform: uppercase; }
.badge-0 { background: #ff1d6c22; color: #ff1d6c; border: 1px solid #ff1d6c44; }
.badge-1 { background: #f5a62322; color: #f5a623; border: 1px solid #f5a62344; }
.badge-2 { background: #2979ff22; color: #2979ff; border: 1px solid #2979ff44; }
.search-box { background: #111; border: 1px solid #333; color: #e0e0e0; padding: 0.6rem 1rem; font-size: 0.9rem; width: 100%; max-width: 500px; border-radius: 4px; font-family: inherit; margin: 1rem 0; }
.search-box:focus { outline: none; border-color: #ff1d6c; }
.card { background: #111; border: 1px solid #222; border-radius: 6px; padding: 1rem; margin: 0.5rem 0; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.75rem; }
footer { margin-top: 3rem; padding: 1rem 0; border-top: 1px solid #111; color: #333; font-size: 0.7rem; text-align: center; }
`;

function nav(active) {
  const links = [
    ['/', 'Dashboard'],
    ['/orgs', 'Orgs'],
    ['/repos', 'Repos'],
    ['/domains', 'Domains'],
    ['/nodes', 'Nodes'],
    ['/graph', 'Graph'],
    ['/search', 'Search'],
    ['/api', 'API'],
  ];
  return `<nav>
    <span class="brand">Prism</span>
    ${links.map(([href, label]) => `<a href="${href}" style="${active === label ? 'color:#fff' : ''}">${label}</a>`).join('')}
  </nav>`;
}

function page(title, active, body) {
  return `<!DOCTYPE html><html lang="en"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${title} — Prism</title><style>${CSS}</style>
  </head><body>${nav(active)}<main>${body}</main>
  <footer>RoadCode Platform v0.1.0 — BlackRoad OS — Pave Tomorrow.</footer>
  </body></html>`;
}

// --- Dashboard ---
app.get('/', async (req, res) => {
  try {
    const stats = await client._fetch('/road/v1/stats');
    const orgs = await client.orgs();
    const nodes = await client.nodes();
    res.send(page('Dashboard', 'Dashboard', `
      <h1>BlackRoad Universe</h1>
      <p class="subtitle">RoadCode Control Plane — Everything that exists, where it lives, who owns it.</p>
      <div class="stats">
        <div class="stat"><div class="num">${stats.orgs}</div><div class="label">Organizations</div></div>
        <div class="stat"><div class="num">${stats.repos}</div><div class="label">Repositories</div></div>
        <div class="stat"><div class="num">${stats.domains}</div><div class="label">Domains</div></div>
        <div class="stat"><div class="num">${stats.agents}</div><div class="label">Agents</div></div>
        <div class="stat"><div class="num">${stats.nodes}</div><div class="label">Nodes</div></div>
        <div class="stat"><div class="num">${stats.services}</div><div class="label">Services</div></div>
      </div>
      <h2>Repos by Org</h2>
      <table><tr><th>Organization</th><th>Repos</th><th>Bar</th></tr>
      ${(stats.reposByOrg || []).map(r => `<tr><td><a href="/orgs/${r.org}">${r.org}</a></td><td>${r.count}</td><td><div style="background:#ff1d6c;height:8px;width:${Math.min(r.count * 2, 200)}px;border-radius:4px"></div></td></tr>`).join('')}
      </table>
      <h2>Nodes</h2>
      <div class="grid">
        ${nodes.map(n => `<div class="card">
          <a href="/nodes/${n.hostname}" style="color:#f5a623;font-weight:bold">${n.hostname}</a>
          <span class="${n.status}" style="float:right">${n.status}</span>
          <div style="color:#666;font-size:0.75rem;margin-top:0.3rem">${n.ip} · ${n.role}</div>
          <div style="font-size:0.7rem;margin-top:0.3rem;color:#444">${(n.services || []).join(', ')}</div>
        </div>`).join('')}
      </div>
    `));
  } catch (err) {
    res.status(500).send(page('Error', 'Dashboard', `<h1>Error</h1><p>${err.message}</p><p>Is the registry service running on :3101?</p>`));
  }
});

// --- Org List ---
app.get('/orgs', async (req, res) => {
  const orgs = await client.orgs();
  res.send(page('Organizations', 'Orgs', `
    <h1>Organizations</h1>
    <p class="subtitle">${orgs.length} orgs across 3 tiers</p>
    <table><tr><th>Org</th><th>Tier</th><th>Purpose</th><th>Domains</th></tr>
    ${orgs.map(o => `<tr>
      <td><a href="/orgs/${o.name}" class="tier-${o.tier}">${o.name}</a></td>
      <td><span class="badge badge-${o.tier}">Tier ${o.tier}</span></td>
      <td style="max-width:400px">${o.purpose}</td>
      <td>${(o.domains || []).map(d => `<a href="https://${d}">${d}</a>`).join(', ')}</td>
    </tr>`).join('')}
    </table>
  `));
});

// --- Org Detail ---
app.get('/orgs/:name', async (req, res) => {
  try {
    const org = await client._fetch(`/road/v1/orgs/${req.params.name}`);
    res.send(page(org.name, 'Orgs', `
      <h1 class="tier-${org.tier}">${org.name}</h1>
      <p class="subtitle"><span class="badge badge-${org.tier}">Tier ${org.tier}</span> ${org.purpose}</p>

      <h2>Repositories (${org.repos.length})</h2>
      <table><tr><th>Name</th><th>Purpose</th><th>Status</th><th>GitHub</th></tr>
      ${org.repos.map(r => `<tr>
        <td><a href="/repos/${org.name}/${r.name}">${r.name}</a></td>
        <td style="max-width:400px;color:#888">${r.purpose || '—'}</td>
        <td class="${r.status}">${r.status}</td>
        <td>${r.github_url ? `<a href="${r.github_url}">↗</a>` : '—'}</td>
      </tr>`).join('')}
      </table>

      <h2>Domains (${org.domainRecords.length})</h2>
      ${org.domainRecords.length ? `<table><tr><th>Domain</th><th>Purpose</th><th>Infra</th><th>Status</th></tr>
      ${org.domainRecords.map(d => `<tr>
        <td><a href="https://${d.domain}">${d.domain}</a></td>
        <td>${d.purpose}</td>
        <td>${d.infra}</td>
        <td class="${d.status}">${d.status}</td>
      </tr>`).join('')}
      </table>` : '<p style="color:#444">No domains assigned.</p>'}

      ${org.agents.length ? `<h2>Agents (${org.agents.length})</h2>
      <table><tr><th>Agent</th><th>Node</th><th>Capabilities</th><th>Status</th></tr>
      ${org.agents.map(a => `<tr><td>${a.name}</td><td>${a.node}</td><td style="color:#666">${a.capabilities.join(', ')}</td><td class="${a.status}">${a.status}</td></tr>`).join('')}
      </table>` : ''}

      ${org.services.length ? `<h2>Services (${org.services.length})</h2>
      <table><tr><th>Service</th><th>Node</th><th>Port</th><th>Protocol</th><th>Status</th></tr>
      ${org.services.map(s => `<tr><td>${s.name}</td><td>${s.node}</td><td>${s.port || '—'}</td><td>${s.protocol}</td><td class="${s.status}">${s.status}</td></tr>`).join('')}
      </table>` : ''}
    `));
  } catch (err) {
    res.status(404).send(page('Not Found', 'Orgs', `<h1>Org not found</h1><p>${req.params.name}</p>`));
  }
});

// --- Repo List ---
app.get('/repos', async (req, res) => {
  const repos = await client.repos(req.query.org);
  const orgFilter = req.query.org ? ` in ${req.query.org}` : '';
  res.send(page('Repositories', 'Repos', `
    <h1>Repositories${orgFilter}</h1>
    <p class="subtitle">${repos.length} repos</p>
    <table><tr><th>Org</th><th>Name</th><th>Purpose</th><th>Status</th></tr>
    ${repos.map(r => `<tr>
      <td><a href="/orgs/${r.org}">${r.org}</a></td>
      <td><a href="/repos/${r.org}/${r.name}">${r.name}</a></td>
      <td style="max-width:350px;color:#888">${r.purpose || '—'}</td>
      <td class="${r.status}">${r.status}</td>
    </tr>`).join('')}
    </table>
  `));
});

// --- Repo Detail ---
app.get('/repos/:org/:name', async (req, res) => {
  try {
    const repo = await client._fetch(`/road/v1/repos/${req.params.org}/${req.params.name}`);
    res.send(page(`${repo.org}/${repo.name}`, 'Repos', `
      <h1>${repo.name}</h1>
      <p class="subtitle"><a href="/orgs/${repo.org}">${repo.org}</a> · <span class="${repo.status}">${repo.status}</span></p>
      <div class="card">
        <p><strong>Purpose:</strong> ${repo.purpose || 'No description'}</p>
        ${repo.github_url ? `<p><strong>GitHub:</strong> <a href="${repo.github_url}">${repo.github_url}</a></p>` : ''}
      </div>
    `));
  } catch (err) {
    res.status(404).send(page('Not Found', 'Repos', `<h1>Repo not found</h1>`));
  }
});

// --- Domain List ---
app.get('/domains', async (req, res) => {
  const domains = await client.domains();
  res.send(page('Domains', 'Domains', `
    <h1>Domain Map</h1>
    <p class="subtitle">${domains.length} domains across the BlackRoad universe</p>
    <div class="grid">
      ${domains.map(d => `<div class="card">
        <a href="https://${d.domain}" style="color:#ff1d6c;font-weight:bold">${d.domain}</a>
        <span class="${d.status}" style="float:right;font-size:0.7rem">${d.status}</span>
        <div style="margin-top:0.3rem;font-size:0.75rem">
          <a href="/orgs/${d.org}">${d.org}</a> · ${d.infra}
        </div>
        <div style="color:#666;font-size:0.75rem;margin-top:0.2rem">${d.purpose}</div>
      </div>`).join('')}
    </div>
  `));
});

// --- Node List ---
app.get('/nodes', async (req, res) => {
  const nodes = await client.nodes();
  res.send(page('Nodes', 'Nodes', `
    <h1>Infrastructure Nodes</h1>
    <p class="subtitle">${nodes.length} nodes in the BlackRoad fleet</p>
    <div class="grid">
      ${nodes.map(n => `<div class="card">
        <a href="/nodes/${n.hostname}" style="color:#f5a623;font-weight:bold;font-size:1.1rem">${n.hostname}</a>
        <span class="${n.status}" style="float:right">${n.status}</span>
        <div style="color:#666;font-size:0.8rem;margin-top:0.3rem">${n.ip} · ${n.role}</div>
        <div style="font-size:0.75rem;margin-top:0.3rem;color:#555">${(n.services || []).join(' · ')}</div>
      </div>`).join('')}
    </div>
  `));
});

// --- Node Detail ---
app.get('/nodes/:hostname', async (req, res) => {
  try {
    const node = await client._fetch(`/road/v1/nodes/${req.params.hostname}`);
    res.send(page(node.hostname, 'Nodes', `
      <h1 style="color:#f5a623">${node.hostname}</h1>
      <p class="subtitle">${node.ip} · ${node.role} · <span class="${node.status}">${node.status}</span></p>

      ${node.serviceDetails && node.serviceDetails.length ? `<h2>Services (${node.serviceDetails.length})</h2>
      <table><tr><th>Service</th><th>Port</th><th>Org</th><th>Protocol</th><th>Status</th></tr>
      ${node.serviceDetails.map(s => `<tr><td>${s.name}</td><td>${s.port || '—'}</td><td><a href="/orgs/${s.org}">${s.org}</a></td><td>${s.protocol}</td><td class="${s.status}">${s.status}</td></tr>`).join('')}
      </table>` : ''}

      ${node.agents && node.agents.length ? `<h2>Agents (${node.agents.length})</h2>
      <table><tr><th>Agent</th><th>Org</th><th>Capabilities</th><th>Status</th></tr>
      ${node.agents.map(a => `<tr><td>${a.name}</td><td><a href="/orgs/${a.org}">${a.org}</a></td><td style="color:#666">${a.capabilities.join(', ')}</td><td class="${a.status}">${a.status}</td></tr>`).join('')}
      </table>` : ''}
    `));
  } catch (err) {
    res.status(404).send(page('Not Found', 'Nodes', `<h1>Node not found</h1>`));
  }
});

// --- Search ---
app.get('/search', async (req, res) => {
  const { q } = req.query;
  let resultsHtml = '';

  if (q) {
    const data = await client.search(q);
    const r = data.results;
    resultsHtml = `
      <p style="color:#888;margin:1rem 0">${data.total} results for "<strong>${q}</strong>"</p>
      ${r.orgs.length ? `<h3>Organizations (${r.orgs.length})</h3>
        <table><tr><th>Org</th><th>Tier</th><th>Purpose</th></tr>
        ${r.orgs.map(o => `<tr><td><a href="/orgs/${o.name}">${o.name}</a></td><td>${o.tier}</td><td>${o.purpose}</td></tr>`).join('')}</table>` : ''}
      ${r.repos.length ? `<h3>Repositories (${r.repos.length})</h3>
        <table><tr><th>Org</th><th>Name</th><th>Purpose</th></tr>
        ${r.repos.map(r => `<tr><td><a href="/orgs/${r.org}">${r.org}</a></td><td><a href="/repos/${r.org}/${r.name}">${r.name}</a></td><td style="color:#888">${r.purpose || '—'}</td></tr>`).join('')}</table>` : ''}
      ${r.domains.length ? `<h3>Domains (${r.domains.length})</h3>
        <table><tr><th>Domain</th><th>Org</th><th>Purpose</th></tr>
        ${r.domains.map(d => `<tr><td><a href="https://${d.domain}">${d.domain}</a></td><td>${d.org}</td><td>${d.purpose}</td></tr>`).join('')}</table>` : ''}
      ${r.nodes.length ? `<h3>Nodes (${r.nodes.length})</h3>
        <table><tr><th>Host</th><th>IP</th><th>Role</th></tr>
        ${r.nodes.map(n => `<tr><td><a href="/nodes/${n.hostname}">${n.hostname}</a></td><td>${n.ip}</td><td>${n.role}</td></tr>`).join('')}</table>` : ''}
      ${r.agents.length ? `<h3>Agents (${r.agents.length})</h3>
        <table><tr><th>Agent</th><th>Org</th><th>Node</th></tr>
        ${r.agents.map(a => `<tr><td>${a.name}</td><td><a href="/orgs/${a.org}">${a.org}</a></td><td>${a.node}</td></tr>`).join('')}</table>` : ''}
    `;
  }

  res.send(page('Search', 'Search', `
    <h1>Search the Universe</h1>
    <form action="/search" method="get">
      <input class="search-box" type="text" name="q" value="${q || ''}" placeholder="Search orgs, repos, domains, nodes, agents..." autofocus>
    </form>
    ${resultsHtml}
  `));
});

// --- Graph View ---
app.get('/graph', async (req, res) => {
  try {
    const graph = await client._fetch('/road/v1/graph');
    const orgs = await client.orgs();
    const domains = await client.domains();
    const nodes = await client.nodes();
    const agents = await client.agents();

    // Build visual nodes
    const tierColors = { 0: '#ff1d6c', 1: '#f5a623', 2: '#2979ff' };
    const orgMap = {};
    orgs.forEach(o => { orgMap[o.name] = o; });

    res.send(page('Graph', 'Graph', `
      <h1>Universe Graph</h1>
      <p class="subtitle">Relationships between ${orgs.length} orgs, ${domains.length} domains, ${nodes.length} nodes, ${agents.length} agents</p>

      <h2>Tier 0 — Registry</h2>
      ${orgs.filter(o => o.tier === 0).map(o => `
        <div class="card" style="border-left:3px solid #ff1d6c">
          <a href="/orgs/${o.name}" class="tier-0" style="font-size:1.1rem">${o.name}</a>
          <div style="color:#666;font-size:0.75rem;margin:0.3rem 0">${o.purpose}</div>
          <div style="font-size:0.75rem">
            ${(o.domains||[]).map(d => `<a href="https://${d}" style="color:#ff1d6c">${d}</a>`).join(' · ')}
          </div>
        </div>`).join('')}

      <h2>Tier 1 — Platform</h2>
      ${orgs.filter(o => o.tier === 1).map(o => `
        <div class="card" style="border-left:3px solid #f5a623">
          <a href="/orgs/${o.name}" class="tier-1" style="font-size:1.1rem">${o.name}</a>
          <div style="color:#666;font-size:0.75rem;margin:0.3rem 0">${o.purpose}</div>
          <div style="font-size:0.75rem">
            ${(o.domains||[]).map(d => `<a href="https://${d}" style="color:#f5a623">${d}</a>`).join(' · ')}
          </div>
        </div>`).join('')}

      <h2>Tier 2 — Execution (${orgs.filter(o => o.tier === 2).length} orgs)</h2>
      <div class="grid">
        ${orgs.filter(o => o.tier === 2).map(o => {
          const orgDomains = domains.filter(d => d.org === o.name);
          const orgAgents = agents.filter(a => a.org === o.name);
          return `<div class="card" style="border-left:3px solid #2979ff">
            <a href="/orgs/${o.name}" class="tier-2">${o.name}</a>
            ${orgDomains.length ? `<div style="font-size:0.7rem;margin-top:0.3rem">${orgDomains.map(d => `<a href="https://${d.domain}" style="color:#9c27b0">${d.domain}</a>`).join(' · ')}</div>` : ''}
            ${orgAgents.length ? `<div style="font-size:0.7rem;margin-top:0.2rem;color:#4caf50">${orgAgents.map(a => a.name).join(', ')}</div>` : ''}
            <div style="color:#444;font-size:0.65rem;margin-top:0.2rem">${o.purpose}</div>
          </div>`;
        }).join('')}
      </div>

      <h2>Infrastructure Nodes</h2>
      <div class="grid">
        ${nodes.map(n => `<div class="card" style="border-left:3px solid ${n.status === 'online' ? '#4caf50' : '#f44336'}">
          <a href="/nodes/${n.hostname}" style="color:#f5a623">${n.hostname}</a>
          <span class="${n.status}" style="float:right;font-size:0.7rem">${n.status}</span>
          <div style="color:#666;font-size:0.7rem">${n.ip} · ${n.role}</div>
        </div>`).join('')}
      </div>

      <h2>Edge Counts</h2>
      <div class="stats">
        <div class="stat"><div class="num">${graph.edges.filter(e => e.type === 'domain-to-org').length}</div><div class="label">Domain → Org</div></div>
        <div class="stat"><div class="num">${graph.edges.filter(e => e.type === 'agent-to-org').length}</div><div class="label">Agent → Org</div></div>
        <div class="stat"><div class="num">${graph.edges.filter(e => e.type === 'service-to-node').length}</div><div class="label">Service → Node</div></div>
      </div>
    `));
  } catch (err) {
    res.status(500).send(page('Error', 'Graph', `<h1>Error</h1><p>${err.message}</p>`));
  }
});

// --- API Docs ---
app.get('/api', (req, res) => {
  res.send(page('API', 'API', `
    <h1>RoadCode API</h1>
    <p class="subtitle">Registry API at <code>:3101/road/v1/*</code></p>

    <h2>Endpoints</h2>
    <table>
      <tr><th>Method</th><th>Path</th><th>Purpose</th></tr>
      <tr><td>GET</td><td><code>/road/v1/health</code></td><td>Health check</td></tr>
      <tr><td>GET</td><td><code>/road/v1/stats</code></td><td>Enterprise statistics</td></tr>
      <tr><td>GET</td><td><code>/road/v1/orgs</code></td><td>List all organizations</td></tr>
      <tr><td>GET</td><td><code>/road/v1/orgs/:name</code></td><td>Org detail + repos + domains + agents + services</td></tr>
      <tr><td>GET</td><td><code>/road/v1/repos</code></td><td>List repos (?org= ?status=)</td></tr>
      <tr><td>GET</td><td><code>/road/v1/repos/:org/:name</code></td><td>Repo detail</td></tr>
      <tr><td>GET</td><td><code>/road/v1/domains</code></td><td>List domains (?org=)</td></tr>
      <tr><td>GET</td><td><code>/road/v1/domains/:domain</code></td><td>Domain detail + org info</td></tr>
      <tr><td>GET</td><td><code>/road/v1/agents</code></td><td>List agents (?org=)</td></tr>
      <tr><td>GET</td><td><code>/road/v1/nodes</code></td><td>List nodes</td></tr>
      <tr><td>GET</td><td><code>/road/v1/nodes/:hostname</code></td><td>Node + services + agents</td></tr>
      <tr><td>GET</td><td><code>/road/v1/services</code></td><td>List services (?node= ?org=)</td></tr>
      <tr><td>GET</td><td><code>/road/v1/search?q=</code></td><td>Cross-entity search</td></tr>
      <tr><td>GET</td><td><code>/road/v1/graph</code></td><td>Relationship graph</td></tr>
      <tr><td>POST</td><td><code>/road/v1/audit/events</code></td><td>Record audit event</td></tr>
      <tr><td>GET</td><td><code>/road/v1/audit/events</code></td><td>Query audit log</td></tr>
      <tr><td>GET</td><td><code>/road/v1/audit/stats</code></td><td>Audit statistics</td></tr>
    </table>

    <h2>Example: Get Org Detail</h2>
    <pre style="background:#111;padding:1rem;border-radius:4px;overflow-x:auto;font-size:0.75rem;color:#4caf50">
curl http://localhost:3101/road/v1/orgs/BlackRoad-AI | python3 -m json.tool</pre>

    <h2>Example: Search</h2>
    <pre style="background:#111;padding:1rem;border-radius:4px;overflow-x:auto;font-size:0.75rem;color:#4caf50">
curl "http://localhost:3101/road/v1/search?q=quantum"</pre>

    <h2>Example: Record Audit Event</h2>
    <pre style="background:#111;padding:1rem;border-radius:4px;overflow-x:auto;font-size:0.75rem;color:#4caf50">
curl -X POST http://localhost:3103/road/v1/audit/events \\
  -H 'Content-Type: application/json' \\
  -d '{"actor":"claude","action":"deploy","entity_type":"repo","entity_id":"BlackRoad-OS/RoadCode"}'</pre>

    <h2>OpenAPI Spec</h2>
    <p>Full spec at <code>docs/api/openapi.yaml</code></p>
  `));
});

app.listen(PORT, () => {
  log.info(`Prism listening on :${PORT}`);
});
