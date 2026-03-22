// BlackRoad Command Center v2.0 — Live Fleet Data

const PRISM = 'https://prism.blackroad.io/api';

// Open URL in new tab
function openUrl(url) {
  chrome.tabs.create({ url });
}

// Search
document.getElementById('search').addEventListener('input', function(e) {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('.service, .link-card, .org').forEach(el => {
    const text = el.textContent.toLowerCase();
    el.style.opacity = (!q || text.includes(q)) ? '1' : '0.3';
  });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  if (e.key === '/' || (e.key.length === 1 && !e.ctrlKey && !e.metaKey)) {
    document.getElementById('search').focus();
  }
  if (e.metaKey || e.ctrlKey) {
    switch(e.key) {
      case 'g': e.preventDefault(); openUrl('https://github.com/BlackRoad-OS-Inc'); break;
      case 'p': e.preventDefault(); openUrl('https://prism.blackroad.io'); break;
      case 's': e.preventDefault(); openUrl('https://search.blackroad.io'); break;
      case 'f': e.preventDefault(); openUrl('https://prism.blackroad.io/api/fleet'); break;
    }
  }
});

// Live fleet data from Prism
async function loadFleet() {
  try {
    const [fleetRes, kpiRes] = await Promise.all([
      fetch(PRISM + '/fleet'),
      fetch(PRISM + '/kpis'),
    ]);
    const fleet = await fleetRes.json();
    const kpis = await kpiRes.json();
    const nodes = fleet.nodes || [];
    const online = nodes.filter(n => n.status === 'online').length;

    // Update stats
    const statsEl = document.getElementById('fleet-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="stat"><span class="stat-value green">${online}/${nodes.length}</span><span class="stat-label">Nodes</span></div>
        <div class="stat"><span class="stat-value">${kpis.models || 0}</span><span class="stat-label">Models</span></div>
        <div class="stat"><span class="stat-value">${kpis.repos || 0}</span><span class="stat-label">Repos</span></div>
        <div class="stat"><span class="stat-value">${kpis.containers || 0}</span><span class="stat-label">Docker</span></div>
      `;
    }

    // Update node list
    const nodesEl = document.getElementById('node-list');
    if (nodesEl) {
      nodesEl.innerHTML = nodes.map(n => `
        <div class="node ${n.status}">
          <span class="node-dot ${n.status === 'online' ? 'green' : 'red'}"></span>
          <span class="node-name">${n.name}</span>
          <span class="node-info">${n.cpu_temp || '?'}°C · ${n.ollama_models || 0} models · ${n.disk_pct || '?'}%</span>
        </div>
      `).join('');
    }

    // Update status indicator
    const statusEl = document.getElementById('status-dot');
    if (statusEl) {
      statusEl.className = online >= 3 ? 'status-dot green' : online >= 1 ? 'status-dot yellow' : 'status-dot red';
    }
  } catch (e) {
    console.warn('Fleet data unavailable:', e.message);
  }
}

// Load immediately and refresh every 30s
loadFleet();
setInterval(loadFleet, 30000);

console.log('BlackRoad Command Center v2.0 loaded');
