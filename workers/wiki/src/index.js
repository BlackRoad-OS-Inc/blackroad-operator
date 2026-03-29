// BlackRoad Wiki v2.0.0 — Knowledge Base with Hash Chains
// Search, create, skills, connections, graph, markdown, templates

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' };
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS } }); }

async function hashBlock(content, prevHash, timestamp) {
  const raw = `${content}|${prevHash || 'genesis'}|${timestamp}`;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function renderMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n/g, '<br>');
}

function addRendered(blocks) {
  return (blocks || []).map(b => ({ ...b, rendered: renderMarkdown(b.content) }));
}

async function ensureTables(db) {
  if (!db) return;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS pages (id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT DEFAULT 'general', created_at TEXT DEFAULT (datetime('now')), updated_at TEXT)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS page_skills (page_id TEXT, skill TEXT, is_primary INTEGER DEFAULT 0, endorsements INTEGER DEFAULT 0, PRIMARY KEY (page_id, skill))`),
    db.prepare(`CREATE TABLE IF NOT EXISTS page_connections (from_id TEXT, to_id TEXT, strength REAL DEFAULT 1.0, PRIMARY KEY (from_id, to_id))`),
    db.prepare(`CREATE TABLE IF NOT EXISTS page_blocks (id INTEGER PRIMARY KEY AUTOINCREMENT, page_id TEXT NOT NULL, prev_hash TEXT, hash TEXT NOT NULL, block_type TEXT NOT NULL, author TEXT NOT NULL, content TEXT NOT NULL, ref_block_id INTEGER, created_at TEXT)`),
  ]);
}

const TEMPLATES = [
  { id: 'agent', name: 'Agent Profile', type: 'agent', skills: ['inference', 'chat'], blocks: [{ type: 'note', content: '## About\n\nDescribe the agent purpose.\n\n## Capabilities\n\n- Capability 1\n- Capability 2\n\n## Configuration\n\nModel, temperature, system prompt.' }] },
  { id: 'project', name: 'Project', type: 'project', skills: ['planning', 'execution'], blocks: [{ type: 'note', content: '## Goal\n\nWhat this project achieves.\n\n## Status\n\nCurrent state.\n\n## Tasks\n\n- [ ] Task 1\n- [ ] Task 2' }] },
  { id: 'howto', name: 'How-To Guide', type: 'guide', skills: ['documentation'], blocks: [{ type: 'note', content: '## Prerequisites\n\nWhat you need.\n\n## Steps\n\n1. Step one\n2. Step two\n3. Step three\n\n## Troubleshooting\n\nCommon issues.' }] },
  { id: 'decision', name: 'Decision Record', type: 'decision', skills: ['architecture'], blocks: [{ type: 'note', content: '## Context\n\nWhat is the issue.\n\n## Decision\n\nWhat we chose.\n\n## Consequences\n\nWhat happens next.' }] },
  { id: 'meeting', name: 'Meeting Notes', type: 'meeting', skills: ['collaboration'], blocks: [{ type: 'note', content: '## Attendees\n\nWho was there.\n\n## Agenda\n\n1. Topic\n\n## Decisions\n\n- Decision 1\n\n## Action Items\n\n- [ ] Action 1' }] },
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    await ensureTables(env.DB);

    // Create page
    if (request.method === 'POST' && path === '/pages') {
      const body = await request.json();
      if (!body.name) return json({ error: 'name required' }, 400);
      const id = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const existing = await env.DB.prepare('SELECT id FROM pages WHERE id = ?').bind(id).first();
      if (existing) return json({ error: 'Page already exists' }, 409);
      const now = new Date().toISOString();
      await env.DB.prepare('INSERT INTO pages (id, name, type, updated_at) VALUES (?, ?, ?, ?)').bind(id, body.name, body.type || 'general', now).run();
      if (body.content) {
        const h = await hashBlock(body.content, null, now);
        await env.DB.prepare('INSERT INTO page_blocks (page_id, prev_hash, hash, block_type, author, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(id, null, h, 'note', body.author || 'system', body.content, now).run();
      }
      return json({ ok: true, id, name: body.name }, 201);
    }

    // Search
    if (request.method === 'GET' && path === '/search') {
      const q = url.searchParams.get('q');
      if (!q) return json({ error: 'q param required' }, 400);
      const term = `%${q}%`;
      const pages = await env.DB.prepare('SELECT * FROM pages WHERE name LIKE ? OR id LIKE ? LIMIT 20').bind(term, term).all();
      const blocks = await env.DB.prepare('SELECT page_id, content, block_type, created_at FROM page_blocks WHERE content LIKE ? LIMIT 20').bind(term).all();
      const skills = await env.DB.prepare('SELECT page_id, skill FROM page_skills WHERE skill LIKE ? LIMIT 20').bind(term).all();
      return json({ query: q, pages: pages.results || [], blocks: (blocks.results || []).map(b => ({ ...b, snippet: b.content?.slice(0, 200) })), skills: skills.results || [] });
    }

    // Templates
    if (path === '/templates') return json({ templates: TEMPLATES });

    // Recent changes
    if (path === '/recent') {
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const { results } = await env.DB.prepare('SELECT b.*, p.name as page_name FROM page_blocks b JOIN pages p ON b.page_id = p.id ORDER BY b.created_at DESC LIMIT ?').bind(limit).all();
      return json({ changes: addRendered(results || []) });
    }

    // Knowledge graph
    if (path === '/graph') {
      const pages = await env.DB.prepare('SELECT id, name, type FROM pages').all();
      const connections = await env.DB.prepare('SELECT from_id, to_id, strength FROM page_connections').all();
      return json({ nodes: pages.results || [], edges: connections.results || [] });
    }

    // List pages
    if (request.method === 'GET' && path === '/pages') {
      const type = url.searchParams.get('type');
      let q = 'SELECT * FROM pages';
      const params = [];
      if (type) { q += ' WHERE type = ?'; params.push(type); }
      q += ' ORDER BY name';
      const { results } = await env.DB.prepare(q).bind(...params).all();
      return json({ pages: results || [] });
    }

    // Page blocks
    const blocksMatch = path.match(/^\/pages\/(.+?)\/blocks$/);
    if (blocksMatch && request.method === 'GET') {
      const id = decodeURIComponent(blocksMatch[1]);
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const { results } = await env.DB.prepare('SELECT * FROM page_blocks WHERE page_id = ? ORDER BY created_at DESC LIMIT ?').bind(id, limit).all();
      return json({ blocks: addRendered(results || []) });
    }

    // Append block
    if (blocksMatch && request.method === 'POST') {
      const id = decodeURIComponent(blocksMatch[1]);
      const body = await request.json();
      if (!body.block_type || !body.author || !body.content) return json({ error: 'block_type, author, content required' }, 400);
      const lastBlock = await env.DB.prepare('SELECT hash FROM page_blocks WHERE page_id = ? ORDER BY id DESC LIMIT 1').bind(id).first();
      const prevHash = lastBlock?.hash || null;
      const timestamp = new Date().toISOString();
      const hash = await hashBlock(body.content, prevHash, timestamp);
      await env.DB.prepare('INSERT INTO page_blocks (page_id, prev_hash, hash, block_type, author, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(id, prevHash, hash, body.block_type, body.author, body.content, timestamp).run();
      await env.DB.prepare('UPDATE pages SET updated_at = ? WHERE id = ?').bind(timestamp, id).run();
      return json({ ok: true, hash, prev_hash: prevHash }, 201);
    }

    // Edit block (append-only — creates edit block referencing original)
    const editBlockMatch = path.match(/^\/pages\/(.+?)\/blocks\/(\d+)$/);
    if (editBlockMatch && request.method === 'PUT') {
      const pageId = decodeURIComponent(editBlockMatch[1]);
      const blockId = editBlockMatch[2];
      const body = await request.json();
      if (!body.content || !body.author) return json({ error: 'content and author required' }, 400);
      const lastBlock = await env.DB.prepare('SELECT hash FROM page_blocks WHERE page_id = ? ORDER BY id DESC LIMIT 1').bind(pageId).first();
      const timestamp = new Date().toISOString();
      const hash = await hashBlock(body.content, lastBlock?.hash, timestamp);
      await env.DB.prepare('INSERT INTO page_blocks (page_id, prev_hash, hash, block_type, author, content, ref_block_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(pageId, lastBlock?.hash, hash, 'edit', body.author, body.content, parseInt(blockId), timestamp).run();
      await env.DB.prepare('UPDATE pages SET updated_at = ? WHERE id = ?').bind(timestamp, pageId).run();
      return json({ ok: true, hash, edited_block: blockId });
    }

    // Page history with chain verification
    const historyMatch = path.match(/^\/pages\/(.+?)\/history$/);
    if (historyMatch && request.method === 'GET') {
      const id = decodeURIComponent(historyMatch[1]);
      const { results } = await env.DB.prepare('SELECT * FROM page_blocks WHERE page_id = ? ORDER BY id ASC').bind(id).all();
      let chainValid = true;
      for (let i = 1; i < (results || []).length; i++) {
        if (results[i].prev_hash !== results[i - 1].hash) { chainValid = false; break; }
      }
      return json({ page_id: id, blocks: addRendered(results || []), chain_valid: chainValid, block_count: (results || []).length });
    }

    // Skills
    const skillsMatch = path.match(/^\/pages\/(.+?)\/skills$/);
    if (skillsMatch && request.method === 'POST') {
      const id = decodeURIComponent(skillsMatch[1]);
      const body = await request.json();
      if (!body.skill) return json({ error: 'skill required' }, 400);
      await env.DB.prepare('INSERT OR IGNORE INTO page_skills (page_id, skill, is_primary) VALUES (?, ?, ?)').bind(id, body.skill, body.is_primary ? 1 : 0).run();
      return json({ ok: true });
    }
    const skillDeleteMatch = path.match(/^\/pages\/(.+?)\/skills\/(.+)$/);
    if (skillDeleteMatch && request.method === 'DELETE') {
      await env.DB.prepare('DELETE FROM page_skills WHERE page_id = ? AND skill = ?').bind(decodeURIComponent(skillDeleteMatch[1]), decodeURIComponent(skillDeleteMatch[2])).run();
      return json({ ok: true });
    }
    const endorseMatch = path.match(/^\/pages\/(.+?)\/skills\/(.+?)\/endorse$/);
    if (endorseMatch && request.method === 'POST') {
      await env.DB.prepare('UPDATE page_skills SET endorsements = endorsements + 1 WHERE page_id = ? AND skill = ?').bind(decodeURIComponent(endorseMatch[1]), decodeURIComponent(endorseMatch[2])).run();
      return json({ ok: true });
    }

    // Connections
    const connectionsMatch = path.match(/^\/pages\/(.+?)\/connections$/);
    if (connectionsMatch && request.method === 'POST') {
      const id = decodeURIComponent(connectionsMatch[1]);
      const body = await request.json();
      if (!body.to_id) return json({ error: 'to_id required' }, 400);
      await env.DB.prepare('INSERT OR REPLACE INTO page_connections (from_id, to_id, strength) VALUES (?, ?, ?)').bind(id, body.to_id, body.strength || 1.0).run();
      return json({ ok: true });
    }
    const connDeleteMatch = path.match(/^\/pages\/(.+?)\/connections\/(.+)$/);
    if (connDeleteMatch && request.method === 'DELETE') {
      await env.DB.prepare('DELETE FROM page_connections WHERE from_id = ? AND to_id = ?').bind(decodeURIComponent(connDeleteMatch[1]), decodeURIComponent(connDeleteMatch[2])).run();
      return json({ ok: true });
    }

    // Single page with skills + connections + blocks
    const pageMatch = path.match(/^\/pages\/(.+?)$/);
    if (request.method === 'GET' && pageMatch && !path.includes('/blocks') && !path.includes('/skills') && !path.includes('/connections') && !path.includes('/history')) {
      const id = decodeURIComponent(pageMatch[1]);
      const page = await env.DB.prepare('SELECT * FROM pages WHERE id = ?').bind(id).first();
      if (!page) return json({ error: 'Page not found' }, 404);
      const skills = (await env.DB.prepare('SELECT skill, is_primary, endorsements FROM page_skills WHERE page_id = ? ORDER BY is_primary DESC, skill').bind(id).all()).results || [];
      const connections = (await env.DB.prepare('SELECT to_id, strength FROM page_connections WHERE from_id = ? ORDER BY strength DESC').bind(id).all()).results || [];
      const blocks = (await env.DB.prepare('SELECT * FROM page_blocks WHERE page_id = ? ORDER BY created_at DESC LIMIT 20').bind(id).all()).results || [];
      return json({ page, skills, connections, blocks: addRendered(blocks) });
    }

    // Health
    if (path === '/health' || path === '/api/health') return json({ status: 'ok', service: 'blackroad-wiki', version: '2.0.0' });

    // Landing
    if (path === '/' || path === '') {
      return json({ service: 'BlackRoad Wiki', version: '2.0.0', endpoints: [
        'POST /pages', 'GET /pages', 'GET /pages/:id', 'GET /search?q=', 'GET /recent',
        'GET/POST /pages/:id/blocks', 'PUT /pages/:id/blocks/:blockId', 'GET /pages/:id/history',
        'POST/DELETE /pages/:id/skills', 'POST /pages/:id/skills/:skill/endorse',
        'POST/DELETE /pages/:id/connections', 'GET /graph', 'GET /templates',
      ] });
    }

    return json({ error: 'Not found' }, 404);
  },
};
