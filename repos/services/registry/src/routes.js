function createRoutes(app, db, log) {
  // --- Orgs ---
  app.get('/road/v1/orgs', (req, res) => {
    const rows = db.prepare('SELECT * FROM road_orgs ORDER BY tier, name').all();
    rows.forEach(r => { r.domains = JSON.parse(r.domains || '[]'); });
    res.json(rows);
  });

  app.get('/road/v1/orgs/:name', (req, res) => {
    const row = db.prepare('SELECT * FROM road_orgs WHERE name = ?').get(req.params.name);
    if (!row) return res.status(404).json({ error: 'org not found' });
    row.domains = JSON.parse(row.domains || '[]');
    // Attach related entities
    row.repos = db.prepare('SELECT name, purpose, status, github_url FROM road_repos WHERE org = ? ORDER BY name').all(req.params.name);
    row.domainRecords = db.prepare('SELECT domain, purpose, infra, status FROM road_domains WHERE org = ? ORDER BY domain').all(req.params.name);
    row.agents = db.prepare('SELECT name, node, capabilities, status FROM road_agents WHERE org = ?').all(req.params.name);
    row.agents.forEach(a => { a.capabilities = JSON.parse(a.capabilities || '[]'); });
    row.services = db.prepare('SELECT name, node, port, protocol, status FROM road_services WHERE org = ?').all(req.params.name);
    res.json(row);
  });

  // --- Repos ---
  app.get('/road/v1/repos', (req, res) => {
    const { org, status } = req.query;
    let sql = 'SELECT * FROM road_repos WHERE 1=1';
    const params = [];
    if (org) { sql += ' AND org = ?'; params.push(org); }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    sql += ' ORDER BY org, name';
    res.json(db.prepare(sql).all(...params));
  });

  app.get('/road/v1/repos/:org/:name', (req, res) => {
    const row = db.prepare('SELECT * FROM road_repos WHERE org = ? AND name = ?').get(req.params.org, req.params.name);
    if (!row) return res.status(404).json({ error: 'repo not found' });
    res.json(row);
  });

  // --- Domains ---
  app.get('/road/v1/domains', (req, res) => {
    const { org } = req.query;
    const rows = org
      ? db.prepare('SELECT * FROM road_domains WHERE org = ? ORDER BY domain').all(org)
      : db.prepare('SELECT * FROM road_domains ORDER BY org, domain').all();
    res.json(rows);
  });

  app.get('/road/v1/domains/:domain', (req, res) => {
    const row = db.prepare('SELECT * FROM road_domains WHERE domain = ?').get(req.params.domain);
    if (!row) return res.status(404).json({ error: 'domain not found' });
    // Attach the org
    row.orgDetail = db.prepare('SELECT name, tier, purpose FROM road_orgs WHERE name = ?').get(row.org);
    res.json(row);
  });

  // --- Agents ---
  app.get('/road/v1/agents', (req, res) => {
    const { org } = req.query;
    const rows = org
      ? db.prepare('SELECT * FROM road_agents WHERE org = ? ORDER BY name').all(org)
      : db.prepare('SELECT * FROM road_agents ORDER BY org, name').all();
    rows.forEach(r => { r.capabilities = JSON.parse(r.capabilities || '[]'); });
    res.json(rows);
  });

  // --- Nodes ---
  app.get('/road/v1/nodes', (req, res) => {
    const rows = db.prepare('SELECT * FROM road_nodes ORDER BY hostname').all();
    rows.forEach(r => { r.services = JSON.parse(r.services || '[]'); });
    res.json(rows);
  });

  app.get('/road/v1/nodes/:hostname', (req, res) => {
    const row = db.prepare('SELECT * FROM road_nodes WHERE hostname = ?').get(req.params.hostname);
    if (!row) return res.status(404).json({ error: 'node not found' });
    row.services = JSON.parse(row.services || '[]');
    row.serviceDetails = db.prepare('SELECT name, port, org, protocol, status FROM road_services WHERE node = ?').all(req.params.hostname);
    row.agents = db.prepare('SELECT name, org, capabilities, status FROM road_agents WHERE node = ?').all(req.params.hostname);
    row.agents.forEach(a => { a.capabilities = JSON.parse(a.capabilities || '[]'); });
    res.json(row);
  });

  // --- Services ---
  app.get('/road/v1/services', (req, res) => {
    const { node, org } = req.query;
    let sql = 'SELECT * FROM road_services WHERE 1=1';
    const params = [];
    if (node) { sql += ' AND node = ?'; params.push(node); }
    if (org) { sql += ' AND org = ?'; params.push(org); }
    sql += ' ORDER BY node, name';
    res.json(db.prepare(sql).all(...params));
  });

  // --- Search ---
  app.get('/road/v1/search', (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'missing q parameter' });
    const pattern = `%${q}%`;
    const orgs = db.prepare('SELECT name, tier, purpose FROM road_orgs WHERE name LIKE ? OR purpose LIKE ?').all(pattern, pattern);
    const repos = db.prepare('SELECT org, name, purpose, status FROM road_repos WHERE name LIKE ? OR purpose LIKE ? LIMIT 50').all(pattern, pattern);
    const domains = db.prepare('SELECT domain, org, purpose FROM road_domains WHERE domain LIKE ? OR purpose LIKE ?').all(pattern, pattern);
    const nodes = db.prepare('SELECT hostname, ip, role, status FROM road_nodes WHERE hostname LIKE ? OR role LIKE ?').all(pattern, pattern);
    const agents = db.prepare('SELECT name, org, node, status FROM road_agents WHERE name LIKE ? OR org LIKE ?').all(pattern, pattern);
    const total = orgs.length + repos.length + domains.length + nodes.length + agents.length;
    res.json({ q, total, results: { orgs, repos, domains, nodes, agents } });
  });

  // --- Stats ---
  app.get('/road/v1/stats', (req, res) => {
    const orgs = db.prepare('SELECT COUNT(*) as count FROM road_orgs').get().count;
    const repos = db.prepare('SELECT COUNT(*) as count FROM road_repos').get().count;
    const domains = db.prepare('SELECT COUNT(*) as count FROM road_domains').get().count;
    const agents = db.prepare('SELECT COUNT(*) as count FROM road_agents').get().count;
    const nodes = db.prepare('SELECT COUNT(*) as count FROM road_nodes').get().count;
    const services = db.prepare('SELECT COUNT(*) as count FROM road_services').get().count;
    const reposByOrg = db.prepare('SELECT org, COUNT(*) as count FROM road_repos GROUP BY org ORDER BY count DESC').all();
    const tierCounts = db.prepare('SELECT tier, COUNT(*) as count FROM road_orgs GROUP BY tier').all();
    res.json({ orgs, repos, domains, agents, nodes, services, reposByOrg, tierCounts });
  });

  // --- Graph (relationships) ---
  app.get('/road/v1/graph', (req, res) => {
    const orgs = db.prepare('SELECT name, tier FROM road_orgs ORDER BY tier, name').all();
    const domainEdges = db.prepare('SELECT domain as source, org as target FROM road_domains').all();
    const agentEdges = db.prepare('SELECT name as source, org as target, node FROM road_agents').all();
    const serviceEdges = db.prepare('SELECT name as source, node as target, org FROM road_services').all();
    res.json({
      nodes: orgs.map(o => ({ id: o.name, type: 'org', tier: o.tier })),
      edges: [
        ...domainEdges.map(e => ({ from: e.source, to: e.target, type: 'domain-to-org' })),
        ...agentEdges.map(e => ({ from: e.source, to: e.target, type: 'agent-to-org' })),
        ...serviceEdges.map(e => ({ from: e.source, to: e.target, type: 'service-to-node' })),
      ],
    });
  });
}

module.exports = { createRoutes };
