// BlackRoad Agents API - serves agent data from D1
// Designed to work alongside continuity-api on same D1 database

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-BR-API-KEY',
  'Content-Type': 'application/json'
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    try {
      // Health check
      if (path === '/' || path === '/health') {
        const count = await env.DB.prepare('SELECT COUNT(*) as total FROM agents').first();
        return json({
          service: 'BlackRoad Agents API',
          version: '1.0.0',
          status: 'online',
          agents_count: count?.total || 0,
          endpoints: ['/agents', '/agents/:id', '/agents/type/:type', '/agents/random', '/agents/search?q=']
        });
      }

      // List all agents (paginated)
      if (path === '/agents' && request.method === 'GET') {
        const limit = parseInt(url.searchParams.get('limit')) || 50;
        const offset = parseInt(url.searchParams.get('offset')) || 0;
        const results = await env.DB.prepare(
          'SELECT * FROM agents WHERE status = ? ORDER BY name LIMIT ? OFFSET ?'
        ).bind('active', limit, offset).all();
        return json({ agents: results.results, count: results.results.length, limit, offset });
      }

      // Get agent by ID
      const idMatch = path.match(/^\/agents\/(agent-\d{4})$/);
      if (idMatch && request.method === 'GET') {
        const agent = await env.DB.prepare('SELECT * FROM agents WHERE id = ?').bind(idMatch[1]).first();
        if (!agent) return json({ error: 'Agent not found' }, 404);
        return json(agent);
      }

      // Get agents by type
      const typeMatch = path.match(/^\/agents\/type\/(\w+)$/);
      if (typeMatch && request.method === 'GET') {
        const results = await env.DB.prepare(
          'SELECT * FROM agents WHERE type = ? AND status = ? ORDER BY name'
        ).bind(typeMatch[1], 'active').all();
        return json({ type: typeMatch[1], agents: results.results, count: results.results.length });
      }

      // Random agent
      if (path === '/agents/random' && request.method === 'GET') {
        const agent = await env.DB.prepare(
          'SELECT * FROM agents WHERE status = ? ORDER BY RANDOM() LIMIT 1'
        ).bind('active').first();
        return json(agent || { error: 'No agents found' });
      }

      // Search agents
      if (path === '/agents/search' && request.method === 'GET') {
        const q = url.searchParams.get('q') || '';
        const results = await env.DB.prepare(
          'SELECT * FROM agents WHERE (name LIKE ? OR type LIKE ? OR capabilities LIKE ?) AND status = ? LIMIT 20'
        ).bind(`%${q}%`, `%${q}%`, `%${q}%`, 'active').all();
        return json({ query: q, agents: results.results, count: results.results.length });
      }

      // Stats
      if (path === '/agents/stats') {
        const total = await env.DB.prepare('SELECT COUNT(*) as c FROM agents').first();
        const byType = await env.DB.prepare(
          'SELECT type, COUNT(*) as count FROM agents GROUP BY type ORDER BY count DESC'
        ).all();
        return json({ total: total?.c, by_type: byType.results });
      }

      return json({ error: 'Not found', path }, 404);
    } catch (e) {
      return json({ error: e.message }, 500);
    }
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: CORS });
}
