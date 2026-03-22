const fs = require('fs');
const path = require('path');

function seedFromJson(db, registriesPath, log) {
  const files = {
    orgs: 'orgs.json',
    repos: 'repos.json',
    domains: 'domains.json',
    nodes: 'nodes.json',
    agents: 'agents.json',
    services: 'services.json',
  };

  for (const [type, file] of Object.entries(files)) {
    const filePath = path.join(registriesPath, file);
    if (!fs.existsSync(filePath)) {
      log.warn(`Registry file not found: ${filePath}`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    log.info(`Seeding ${type}: ${data.length} entries from ${file}`);

    const tx = db.transaction(() => {
      switch (type) {
        case 'orgs':
          const upsertOrg = db.prepare(`INSERT OR REPLACE INTO road_orgs (name, tier, purpose, owner, domains, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'))`);
          for (const o of data) {
            upsertOrg.run(o.name, o.tier, o.purpose, o.owner, JSON.stringify(o.domains));
          }
          break;

        case 'repos':
          const upsertRepo = db.prepare('INSERT OR REPLACE INTO road_repos (org, name, purpose, status, github_url) VALUES (?, ?, ?, ?, ?)');
          for (const r of data) {
            upsertRepo.run(r.org, r.name, r.purpose || '', r.status || 'active', r.github_url || '');
          }
          break;

        case 'domains':
          const upsertDomain = db.prepare('INSERT OR REPLACE INTO road_domains (domain, org, purpose, infra, status) VALUES (?, ?, ?, ?, ?)');
          for (const d of data) {
            upsertDomain.run(d.domain, d.org, d.purpose, d.infra, d.status);
          }
          break;

        case 'nodes':
          const upsertNode = db.prepare('INSERT OR REPLACE INTO road_nodes (hostname, ip, role, services, status) VALUES (?, ?, ?, ?, ?)');
          for (const n of data) {
            upsertNode.run(n.hostname, n.ip, n.role, JSON.stringify(n.services), n.status);
          }
          break;

        case 'agents':
          const upsertAgent = db.prepare('INSERT OR REPLACE INTO road_agents (name, org, node, capabilities, status) VALUES (?, ?, ?, ?, ?)');
          for (const a of data) {
            upsertAgent.run(a.name, a.org, a.node, JSON.stringify(a.capabilities), a.status);
          }
          break;

        case 'services':
          const upsertService = db.prepare('INSERT OR REPLACE INTO road_services (name, node, port, org, protocol, status) VALUES (?, ?, ?, ?, ?, ?)');
          for (const s of data) {
            upsertService.run(s.name, s.node, s.port, s.org, s.protocol, s.status);
          }
          break;
      }
    });

    tx();
  }
}

module.exports = { seedFromJson };
