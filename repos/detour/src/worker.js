// Detour v1.0.0 — BlackRoad Feature Flags & Experiments
// detour.blackroad.io
// From v4 Plan: "GreenLight — Approvals & CI gates" + competitive intel: "A/B testing"
// Detour lets you toggle features, run experiments, and roll out gradually.

const VERSION = '1.0.0';
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' };
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS } }); }

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    const db = env?.DB;

    async function ensureTables() {
      if (!db) return;
      await db.prepare(`CREATE TABLE IF NOT EXISTS flags (
        key TEXT PRIMARY KEY, name TEXT, description TEXT, enabled INTEGER DEFAULT 0,
        rollout_pct INTEGER DEFAULT 100, environment TEXT DEFAULT 'production',
        created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
      )`).run();
      await db.prepare(`CREATE TABLE IF NOT EXISTS experiments (
        id TEXT PRIMARY KEY, name TEXT, description TEXT, status TEXT DEFAULT 'draft',
        variants TEXT DEFAULT '[]', traffic_pct INTEGER DEFAULT 50,
        created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
      )`).run();
    }

    if (path === '/api/health') return json({ status: 'alive', service: 'detour', version: VERSION, description: 'Feature flags & experiments — toggle, roll out, experiment' });

    // ── Feature Flags ──────────────────────────────────────────

    // List flags
    if (path === '/api/flags' && request.method === 'GET') {
      if (!db) return json({ flags: [] });
      await ensureTables();
      const env_filter = url.searchParams.get('env') || '';
      const q = env_filter
        ? db.prepare('SELECT * FROM flags WHERE environment = ? ORDER BY updated_at DESC').bind(env_filter)
        : db.prepare('SELECT * FROM flags ORDER BY updated_at DESC');
      const r = await q.all();
      return json({ flags: r.results || [] });
    }

    // Create flag
    if (path === '/api/flags' && request.method === 'POST') {
      const body = await request.json();
      const { key, name, description, enabled, rollout_pct, environment } = body;
      if (!key) return json({ error: 'key required' }, 400);
      if (!db) return json({ error: 'no database' }, 500);
      await ensureTables();
      await db.prepare("INSERT OR REPLACE INTO flags (key, name, description, enabled, rollout_pct, environment, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))")
        .bind(key, name || key, description || '', enabled ? 1 : 0, rollout_pct || 100, environment || 'production').run();
      // Notify Signal
      try { await fetch('https://signal.blackroad.io/api/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ channel: 'flags', event: 'flag.created', data: { key, enabled }, source: 'detour' }), signal: AbortSignal.timeout(3000) }); } catch {}
      return json({ ok: true, flag: { key, name: name || key, enabled: !!enabled } });
    }

    // Evaluate flag (client SDK calls this)
    if (path === '/api/evaluate') {
      const key = url.searchParams.get('key');
      const userId = url.searchParams.get('user_id') || '';
      if (!key) return json({ error: 'key param required' }, 400);
      if (!db) return json({ key, enabled: false, reason: 'no database' });
      await ensureTables();
      const flag = await db.prepare('SELECT * FROM flags WHERE key = ?').bind(key).first();
      if (!flag) return json({ key, enabled: false, reason: 'flag not found' });
      if (!flag.enabled) return json({ key, enabled: false, reason: 'disabled' });
      // Rollout percentage — hash user ID to get consistent bucket
      if (flag.rollout_pct < 100 && userId) {
        let hash = 0;
        for (let i = 0; i < userId.length; i++) hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
        const bucket = Math.abs(hash) % 100;
        if (bucket >= flag.rollout_pct) return json({ key, enabled: false, reason: `rollout ${flag.rollout_pct}%`, bucket });
      }
      return json({ key, enabled: true, rollout_pct: flag.rollout_pct });
    }

    // Toggle flag
    if (path.match(/^\/api\/flags\/[^/]+\/toggle$/) && request.method === 'POST') {
      const key = path.split('/')[3];
      if (!db) return json({ error: 'no database' }, 500);
      await ensureTables();
      const flag = await db.prepare('SELECT enabled FROM flags WHERE key = ?').bind(key).first();
      if (!flag) return json({ error: 'flag not found' }, 404);
      const newState = flag.enabled ? 0 : 1;
      await db.prepare("UPDATE flags SET enabled = ?, updated_at = datetime('now') WHERE key = ?").bind(newState, key).run();
      return json({ ok: true, key, enabled: !!newState });
    }

    // Delete flag
    if (path.match(/^\/api\/flags\/[^/]+$/) && request.method === 'DELETE') {
      const key = path.split('/')[3];
      if (!db) return json({ error: 'no database' }, 500);
      await ensureTables();
      await db.prepare('DELETE FROM flags WHERE key = ?').bind(key).run();
      return json({ ok: true, deleted: key });
    }

    // ── Experiments ─────────────────────────────────────────────

    if (path === '/api/experiments' && request.method === 'GET') {
      if (!db) return json({ experiments: [] });
      await ensureTables();
      const r = await db.prepare('SELECT * FROM experiments ORDER BY updated_at DESC').all();
      return json({ experiments: (r.results || []).map(e => ({ ...e, variants: JSON.parse(e.variants || '[]') })) });
    }

    if (path === '/api/experiments' && request.method === 'POST') {
      const body = await request.json();
      const { name, description, variants, traffic_pct } = body;
      if (!name) return json({ error: 'name required' }, 400);
      if (!db) return json({ error: 'no database' }, 500);
      await ensureTables();
      const id = crypto.randomUUID().slice(0, 8);
      await db.prepare("INSERT INTO experiments (id, name, description, variants, traffic_pct, status, updated_at) VALUES (?, ?, ?, ?, ?, 'active', datetime('now'))")
        .bind(id, name, description || '', JSON.stringify(variants || ['control', 'variant_a']), traffic_pct || 50).run();
      return json({ ok: true, experiment: { id, name, variants: variants || ['control', 'variant_a'] } });
    }

    // Assign user to experiment variant
    if (path === '/api/experiments/assign') {
      const expId = url.searchParams.get('id');
      const userId = url.searchParams.get('user_id') || crypto.randomUUID();
      if (!expId || !db) return json({ error: 'id param required' }, 400);
      await ensureTables();
      const exp = await db.prepare('SELECT * FROM experiments WHERE id = ? AND status = ?').bind(expId, 'active').first();
      if (!exp) return json({ error: 'experiment not found or inactive' }, 404);
      const variants = JSON.parse(exp.variants || '[]');
      // Hash user to variant
      let hash = 0;
      for (let i = 0; i < userId.length; i++) hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
      const variant = variants[Math.abs(hash) % variants.length];
      return json({ experiment: expId, user_id: userId, variant, variants });
    }

    return json({ service: 'Detour — Feature Flags & Experiments', version: VERSION, tagline: 'Toggle. Roll out. Experiment.', endpoints: {
      'GET /api/flags': 'List flags', 'POST /api/flags': 'Create flag {key, name, enabled, rollout_pct}',
      'GET /api/evaluate?key=&user_id=': 'Evaluate flag for user', 'POST /api/flags/:key/toggle': 'Toggle flag',
      'GET /api/experiments': 'List experiments', 'POST /api/experiments': 'Create experiment {name, variants}',
      'GET /api/experiments/assign?id=&user_id=': 'Assign variant to user',
    } });
  }
};
