// Memory Gate — BlackRoad OS
// Cloudflare Worker that serves as the unified memory/knowledge API
// Any AI (Claude MCP, agents, sessions) connects here to read/write memory
// memory.blackroad.io

// ── Knowledge Base (baked in) ──
const BLACKROAD_KNOWLEDGE = {
  company: 'BlackRoad OS, Inc. Delaware C-Corp, Nov 17 2025. Founder/CEO: Alexa Amundson. EIN: 41-2663817.',
  tagline: 'Remember the Road. Pave Tomorrow.',
  fleet: {
    alice:    { ip: '192.168.4.49',  role: 'Gateway, Pi-hole DNS, PostgreSQL, Redis, nginx, Qdrant, NATS, Tor' },
    cecilia:  { ip: '192.168.4.96',  role: 'AI Engine, Ollama, MinIO, Hailo-8 26 TOPS (offline)' },
    octavia:  { ip: '192.168.4.101', role: 'Architect, Gitea 239 repos, Docker, NATS, 15 Workers, Hailo-8' },
    lucidia:  { ip: '192.168.4.38',  role: 'Dreamer, 334 web apps, PowerDNS, Ollama' },
    aria:     { ip: '192.168.4.98',  role: 'Interface, dashboards, monitoring' },
    gematria: { ip: '159.65.43.12',  role: 'Edge Router, Caddy TLS 151 domains, Ollama, PowerDNS ns1' },
    anastasia:{ ip: '174.138.44.45', role: 'Cloud backup, WireGuard hub' },
  },
  products: ['RoadPay', 'RoadSearch', 'RoundTrip', 'RoadVoice', 'Squad Webhook', 'Auth', 'Prism'],
  stack: { git: 'RoadCode/Gitea', ai: 'Ollama local', workers: '15 self-hosted', storage: 'MinIO', dns: 'PowerDNS', db: 'PostgreSQL', cache: 'Redis', tls: 'Caddy', vpn: 'WireGuard', chat: 'RoundTrip', ci: 'Gitea Actions' },
  math: 'Amundson Framework: G(n)=n^(n+1)/(n+1)^n. Constant A_G≈1.24433. Trinary logic {-1,0,+1}. Z=yx-w.',
  agents: 66,
  repos: 239,
  domains: 20,
  tops: 52,
};

// ── Auth ──
function checkAuth(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth) return false;
  const token = auth.replace('Bearer ', '');
  return token === env.GATE_SECRET;
}

// ── DB Setup ──
async function ensureTables(db) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS memory_entries (
      id TEXT PRIMARY KEY, category TEXT NOT NULL, key TEXT NOT NULL,
      value TEXT NOT NULL, source TEXT DEFAULT 'unknown',
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(category, key)
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS memory_journal (
      id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT NOT NULL,
      entity TEXT NOT NULL, details TEXT, agent TEXT DEFAULT 'memory-gate',
      hash TEXT, created_at TEXT DEFAULT (datetime('now'))
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS memory_codex (
      id TEXT PRIMARY KEY, type TEXT NOT NULL, title TEXT NOT NULL,
      content TEXT NOT NULL, tags TEXT, confidence REAL DEFAULT 0.9,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS memory_todos (
      id TEXT PRIMARY KEY, project TEXT NOT NULL, title TEXT NOT NULL,
      status TEXT DEFAULT 'pending', priority TEXT DEFAULT 'normal',
      owner TEXT, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS memory_collab (
      id TEXT PRIMARY KEY, type TEXT NOT NULL, from_agent TEXT NOT NULL,
      to_agent TEXT, message TEXT NOT NULL, status TEXT DEFAULT 'unread',
      created_at TEXT DEFAULT (datetime('now'))
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS memory_tils (
      id TEXT PRIMARY KEY, category TEXT NOT NULL, learning TEXT NOT NULL,
      agent TEXT DEFAULT 'unknown', created_at TEXT DEFAULT (datetime('now'))
    )`),
  ]);
}

// ── Hash for journal chain ──
async function hashEntry(action, entity, details, prevHash) {
  const data = `${action}:${entity}:${details}:${prevHash || 'genesis'}`;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Handlers ──
const handlers = {
  // Health & knowledge
  'GET /': () => ({ service: 'memory-gate', version: '1.0.0', status: 'alive', endpoints: Object.keys(handlers).length }),
  'GET /api/health': () => ({ status: 'alive', service: 'memory-gate', version: '1.0.0' }),
  'GET /api/knowledge': () => BLACKROAD_KNOWLEDGE,
  'GET /api/knowledge/fleet': () => BLACKROAD_KNOWLEDGE.fleet,
  'GET /api/knowledge/products': () => BLACKROAD_KNOWLEDGE.products,
  'GET /api/knowledge/stack': () => BLACKROAD_KNOWLEDGE.stack,

  // ── Memory CRUD ──
  'POST /api/memory/set': async (body, env) => {
    await ensureTables(env.DB);
    const { category, key, value, source } = body;
    if (!category || !key || !value) return { error: 'category, key, value required' };
    const id = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO memory_entries (id, category, key, value, source) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(category, key) DO UPDATE SET value=excluded.value, source=excluded.source, updated_at=datetime('now')`
    ).bind(id, category, key, typeof value === 'string' ? value : JSON.stringify(value), source || 'api').run();
    return { ok: true, category, key };
  },

  'GET /api/memory/get': async (body, env, url) => {
    await ensureTables(env.DB);
    const category = url.searchParams.get('category');
    const key = url.searchParams.get('key');
    if (category && key) {
      const row = await env.DB.prepare('SELECT * FROM memory_entries WHERE category=? AND key=?').bind(category, key).first();
      return row || { error: 'not found' };
    }
    if (category) {
      const r = await env.DB.prepare('SELECT * FROM memory_entries WHERE category=? ORDER BY updated_at DESC LIMIT 50').bind(category).all();
      return r.results || [];
    }
    const r = await env.DB.prepare('SELECT * FROM memory_entries ORDER BY updated_at DESC LIMIT 100').all();
    return r.results || [];
  },

  'GET /api/memory/search': async (body, env, url) => {
    await ensureTables(env.DB);
    const q = url.searchParams.get('q') || '';
    if (!q) return { error: 'q param required' };
    const r = await env.DB.prepare("SELECT * FROM memory_entries WHERE value LIKE ? OR key LIKE ? ORDER BY updated_at DESC LIMIT 50")
      .bind(`%${q}%`, `%${q}%`).all();
    return { query: q, results: r.results || [] };
  },

  // ── Journal (append-only hash chain) ──
  'POST /api/journal/log': async (body, env) => {
    await ensureTables(env.DB);
    const { action, entity, details, agent } = body;
    if (!action || !entity) return { error: 'action, entity required' };
    const prev = await env.DB.prepare('SELECT hash FROM memory_journal ORDER BY id DESC LIMIT 1').first();
    const hash = await hashEntry(action, entity, details || '', prev?.hash);
    await env.DB.prepare('INSERT INTO memory_journal (action, entity, details, agent, hash) VALUES (?, ?, ?, ?, ?)')
      .bind(action, entity, details || '', agent || 'memory-gate', hash).run();
    return { ok: true, hash: hash.slice(0, 16), action, entity };
  },

  'GET /api/journal': async (body, env, url) => {
    await ensureTables(env.DB);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const r = await env.DB.prepare('SELECT * FROM memory_journal ORDER BY id DESC LIMIT ?').bind(limit).all();
    return r.results || [];
  },

  // ── Codex (solutions, patterns, best practices) ──
  'POST /api/codex/add': async (body, env) => {
    await ensureTables(env.DB);
    const { type, title, content, tags, confidence } = body;
    if (!type || !title || !content) return { error: 'type, title, content required' };
    const id = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO memory_codex (id, type, title, content, tags, confidence) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, type, title, content, tags || '', confidence || 0.9).run();
    return { ok: true, id, type, title };
  },

  'GET /api/codex/search': async (body, env, url) => {
    await ensureTables(env.DB);
    const q = url.searchParams.get('q') || '';
    if (!q) return { error: 'q param required' };
    const r = await env.DB.prepare("SELECT * FROM memory_codex WHERE title LIKE ? OR content LIKE ? OR tags LIKE ? ORDER BY confidence DESC LIMIT 20")
      .bind(`%${q}%`, `%${q}%`, `%${q}%`).all();
    return { query: q, results: r.results || [] };
  },

  'GET /api/codex/stats': async (body, env) => {
    await ensureTables(env.DB);
    const types = await env.DB.prepare("SELECT type, COUNT(*) as count FROM memory_codex GROUP BY type").all();
    const total = await env.DB.prepare("SELECT COUNT(*) as total FROM memory_codex").first();
    return { total: total?.total || 0, by_type: types.results || [] };
  },

  // ── TODOs ──
  'POST /api/todo/add': async (body, env) => {
    await ensureTables(env.DB);
    const { project, title, priority, owner } = body;
    if (!project || !title) return { error: 'project, title required' };
    const id = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO memory_todos (id, project, title, priority, owner) VALUES (?, ?, ?, ?, ?)')
      .bind(id, project, title, priority || 'normal', owner || '').run();
    return { ok: true, id, project, title };
  },

  'POST /api/todo/complete': async (body, env) => {
    await ensureTables(env.DB);
    const { id } = body;
    if (!id) return { error: 'id required' };
    await env.DB.prepare("UPDATE memory_todos SET status='done', updated_at=datetime('now') WHERE id=?").bind(id).run();
    return { ok: true, id, status: 'done' };
  },

  'GET /api/todo/list': async (body, env, url) => {
    await ensureTables(env.DB);
    const project = url.searchParams.get('project');
    const status = url.searchParams.get('status') || 'pending';
    if (project) {
      const r = await env.DB.prepare('SELECT * FROM memory_todos WHERE project=? AND status=? ORDER BY created_at DESC LIMIT 50').bind(project, status).all();
      return r.results || [];
    }
    const r = await env.DB.prepare('SELECT * FROM memory_todos WHERE status=? ORDER BY created_at DESC LIMIT 100').bind(status).all();
    return r.results || [];
  },

  // ── Collaboration ──
  'POST /api/collab/send': async (body, env) => {
    await ensureTables(env.DB);
    const { type, from_agent, to_agent, message } = body;
    if (!from_agent || !message) return { error: 'from_agent, message required' };
    const id = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO memory_collab (id, type, from_agent, to_agent, message) VALUES (?, ?, ?, ?, ?)')
      .bind(id, type || 'message', from_agent, to_agent || 'all', message).run();
    return { ok: true, id };
  },

  'GET /api/collab/inbox': async (body, env, url) => {
    await ensureTables(env.DB);
    const agent = url.searchParams.get('agent') || 'all';
    const r = await env.DB.prepare("SELECT * FROM memory_collab WHERE (to_agent=? OR to_agent='all') AND status='unread' ORDER BY created_at DESC LIMIT 50")
      .bind(agent).all();
    return r.results || [];
  },

  'POST /api/collab/announce': async (body, env) => {
    await ensureTables(env.DB);
    const { from_agent, message } = body;
    if (!message) return { error: 'message required' };
    const id = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO memory_collab (id, type, from_agent, to_agent, message) VALUES (?, 'announce', ?, 'all', ?)")
      .bind(id, from_agent || 'memory-gate', message).run();
    return { ok: true, id, type: 'announce' };
  },

  // ── TIL Broadcasts ──
  'POST /api/til/broadcast': async (body, env) => {
    await ensureTables(env.DB);
    const { category, learning, agent } = body;
    if (!category || !learning) return { error: 'category, learning required' };
    const id = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO memory_tils (id, category, learning, agent) VALUES (?, ?, ?, ?)')
      .bind(id, category, learning, agent || 'unknown').run();
    return { ok: true, id, category };
  },

  'GET /api/til/list': async (body, env, url) => {
    await ensureTables(env.DB);
    const category = url.searchParams.get('category');
    const limit = parseInt(url.searchParams.get('limit') || '30');
    if (category) {
      const r = await env.DB.prepare('SELECT * FROM memory_tils WHERE category=? ORDER BY created_at DESC LIMIT ?').bind(category, limit).all();
      return r.results || [];
    }
    const r = await env.DB.prepare('SELECT * FROM memory_tils ORDER BY created_at DESC LIMIT ?').bind(limit).all();
    return r.results || [];
  },

  // ── MCP-compatible tool listing (for Claude connectors) ──
  'GET /api/tools': () => ({
    tools: [
      { name: 'memory_set', description: 'Store a key-value pair in BlackRoad memory', params: ['category', 'key', 'value'] },
      { name: 'memory_get', description: 'Retrieve memory entries by category/key', params: ['category', 'key'] },
      { name: 'memory_search', description: 'Search all memory entries', params: ['q'] },
      { name: 'journal_log', description: 'Append to the hash-chain journal', params: ['action', 'entity', 'details'] },
      { name: 'codex_search', description: 'Search solutions and patterns', params: ['q'] },
      { name: 'codex_add', description: 'Add a solution/pattern/best-practice', params: ['type', 'title', 'content', 'tags'] },
      { name: 'todo_add', description: 'Add a todo item to a project', params: ['project', 'title', 'priority'] },
      { name: 'todo_complete', description: 'Mark a todo as done', params: ['id'] },
      { name: 'collab_send', description: 'Send a message to another agent', params: ['from_agent', 'to_agent', 'message'] },
      { name: 'collab_announce', description: 'Broadcast to all agents', params: ['from_agent', 'message'] },
      { name: 'til_broadcast', description: 'Share a learning with all sessions', params: ['category', 'learning'] },
      { name: 'knowledge', description: 'Get BlackRoad knowledge base', params: [] },
    ]
  }),

  // ── Bulk sync (for local memory → D1) ──
  'POST /api/sync': async (body, env) => {
    await ensureTables(env.DB);
    const { entries } = body;
    if (!entries || !Array.isArray(entries)) return { error: 'entries array required' };
    let synced = 0;
    for (const e of entries.slice(0, 500)) {
      try {
        const id = crypto.randomUUID();
        await env.DB.prepare(
          `INSERT INTO memory_entries (id, category, key, value, source) VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(category, key) DO UPDATE SET value=excluded.value, updated_at=datetime('now')`
        ).bind(id, e.category || 'sync', e.key, typeof e.value === 'string' ? e.value : JSON.stringify(e.value), e.source || 'sync').run();
        synced++;
      } catch {}
    }
    return { ok: true, synced, total: entries.length };
  },
};

// ── Router ──
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname.replace(/\/$/, '') || '/';

    // CORS
    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Auth check (skip for health/knowledge/tools)
    const publicPaths = ['/', '/api/health', '/api/knowledge', '/api/tools'];
    if (!publicPaths.includes(path) && !checkAuth(request, env)) {
      return new Response(JSON.stringify({ error: 'unauthorized', hint: 'Bearer token required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const key = `${method} ${path}`;
    const handler = handlers[key];

    if (!handler) {
      // Render HTML for browser
      if (method === 'GET' && path === '/' && request.headers.get('Accept')?.includes('text/html')) {
        return new Response(HTML, { headers: { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' } });
      }
      return new Response(JSON.stringify({ error: 'not found', available: Object.keys(handlers) }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    try {
      let body = {};
      if (method === 'POST') {
        try { body = await request.json(); } catch {}
      }
      const result = await handler(body, env, url);
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  },
};

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Memory Gate — BlackRoad OS</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a0a; color: #e0e0e0; font-family: 'Inter', -apple-system, sans-serif; padding: 40px 20px; max-width: 800px; margin: 0 auto; }
  h1 { color: #FF1D6C; font-size: 28px; margin-bottom: 8px; }
  h2 { color: #F5A623; font-size: 18px; margin: 24px 0 12px; }
  .sub { color: #666; font-size: 13px; margin-bottom: 32px; }
  .endpoint { background: #111; border: 1px solid #222; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; display: flex; align-items: center; gap: 12px; }
  .method { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; }
  .get { background: #1b5e20; color: #4CAF50; }
  .post { background: #e65100; color: #FF9800; }
  .path { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #ccc; }
  .desc { font-size: 12px; color: #666; margin-left: auto; }
  .stats { display: flex; gap: 24px; margin: 24px 0; }
  .stat { text-align: center; }
  .stat-val { font-size: 28px; font-weight: 700; color: #FF1D6C; }
  .stat-label { font-size: 11px; color: #666; text-transform: uppercase; }
  footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #222; font-size: 11px; color: #444; }
</style>
</head>
<body>
<h1>Memory Gate</h1>
<p class="sub">BlackRoad OS — Unified Memory API for AI Connectors</p>
<div class="stats">
  <div class="stat"><div class="stat-val">66</div><div class="stat-label">Agents</div></div>
  <div class="stat"><div class="stat-val">239</div><div class="stat-label">Repos</div></div>
  <div class="stat"><div class="stat-val">52</div><div class="stat-label">TOPS</div></div>
  <div class="stat"><div class="stat-val">20</div><div class="stat-label">Domains</div></div>
</div>
<h2>Memory</h2>
<div class="endpoint"><span class="method post">POST</span><span class="path">/api/memory/set</span><span class="desc">Store key-value</span></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/memory/get</span><span class="desc">Retrieve entries</span></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/memory/search</span><span class="desc">Search all memory</span></div>
<h2>Journal</h2>
<div class="endpoint"><span class="method post">POST</span><span class="path">/api/journal/log</span><span class="desc">Append hash-chain</span></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/journal</span><span class="desc">Read journal</span></div>
<h2>Codex</h2>
<div class="endpoint"><span class="method post">POST</span><span class="path">/api/codex/add</span><span class="desc">Add solution/pattern</span></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/codex/search</span><span class="desc">Search codex</span></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/codex/stats</span><span class="desc">Codex statistics</span></div>
<h2>TODOs</h2>
<div class="endpoint"><span class="method post">POST</span><span class="path">/api/todo/add</span><span class="desc">Create todo</span></div>
<div class="endpoint"><span class="method post">POST</span><span class="path">/api/todo/complete</span><span class="desc">Complete todo</span></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/todo/list</span><span class="desc">List todos</span></div>
<h2>Collaboration</h2>
<div class="endpoint"><span class="method post">POST</span><span class="path">/api/collab/send</span><span class="desc">Send message</span></div>
<div class="endpoint"><span class="method post">POST</span><span class="path">/api/collab/announce</span><span class="desc">Broadcast to all</span></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/collab/inbox</span><span class="desc">Check inbox</span></div>
<h2>TIL</h2>
<div class="endpoint"><span class="method post">POST</span><span class="path">/api/til/broadcast</span><span class="desc">Share learning</span></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/til/list</span><span class="desc">Recent learnings</span></div>
<h2>Meta</h2>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/knowledge</span><span class="desc">Full knowledge base</span></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/tools</span><span class="desc">MCP tool listing</span></div>
<div class="endpoint"><span class="method post">POST</span><span class="path">/api/sync</span><span class="desc">Bulk sync entries</span></div>
<footer>BlackRoad OS, Inc. — Pave Tomorrow. Auth: Bearer token required for write operations.</footer>
</body>
</html>`;
