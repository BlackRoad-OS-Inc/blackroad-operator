// ── Security ──
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-site',
};

const ALLOWED_ORIGINS = new Set([
  'https://blackroad.io', 'https://blackroadai.com', 'https://lucidia.earth',
  'https://db.blackroad.io', 'https://bb.blackroad.io', 'https://stats.blackroad.io',
  'https://chat.blackroad.io', 'https://index.blackroad.io', 'https://mesh.blackroad.io',
]);

const VALID_TYPES = new Set(['repos', 'agents', 'domains', 'models', 'workers', 'scripts', 'all']);
const MAX_BODY_SIZE = 256 * 1024; // 256KB
const RATE_LIMIT = 120; // requests per minute
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > 60000) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    // Cleanup old entries every 100 requests
    if (rateLimitMap.size > 5000) {
      for (const [k, v] of rateLimitMap) {
        if (now - v.start > 60000) rateLimitMap.delete(k);
      }
    }
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

function sanitizeStr(s, maxLen = 500) {
  if (typeof s !== 'string') return '';
  return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').slice(0, maxLen);
}

async function safeParseJSON(request) {
  const len = parseInt(request.headers.get('content-length') || '0', 10);
  if (len > MAX_BODY_SIZE) throw new Error('Request body too large');
  const text = await request.text();
  if (text.length > MAX_BODY_SIZE) throw new Error('Request body too large');
  const parsed = JSON.parse(text);
  if (typeof parsed !== 'object' || parsed === null) throw new Error('Invalid JSON body');
  return parsed;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS — validate origin
    const origin = request.headers.get('Origin') || '';
    const corsOrigin = (env.CORS_ORIGIN === '*' || ALLOWED_ORIGINS.has(origin)) ? (origin || '*') : 'https://blackroad.io';
    const corsHeaders = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { ...corsHeaders, ...SECURITY_HEADERS } });
    }

    // Rate limiting
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!checkRateLimit(ip)) {
      return json({ error: 'Too many requests' }, 429, { ...corsHeaders, ...SECURITY_HEADERS, 'Content-Type': 'application/json', 'Retry-After': '60' });
    }

    const headers = { ...corsHeaders, ...SECURITY_HEADERS, 'Content-Type': 'application/json' };

    try {
      // API routes
      if (path.startsWith('/api/')) {
        // Only allow GET, HEAD, and POST
        if (request.method !== 'GET' && request.method !== 'POST' && request.method !== 'HEAD') {
          return json({ error: 'Method not allowed' }, 405, headers);
        }
        if (path === '/api/search' && request.method === 'GET') {
          return await handleSearch(url, env, headers);
        }
        if (path === '/api/browse' && request.method === 'GET') {
          return await handleBrowse(url, env, headers);
        }
        if (path === '/api/stats' && request.method === 'GET') {
          return await handleStats(env, headers);
        }
        if (path.startsWith('/api/item/') && request.method === 'GET') {
          return await handleItem(path, env, headers);
        }
        if (path === '/api/index' && request.method === 'POST') {
          return await handleIndex(request, env, headers);
        }
        return json({ error: 'Not found' }, 404, headers);
      }

      // Let assets binding handle static files (index.html, etc.)
      return env.ASSETS.fetch(request);
    } catch (err) {
      return json({ error: 'Internal server error' }, 500, headers);
    }
  },
};

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers });
}

async function handleSearch(url, env, headers) {
  const q = sanitizeStr((url.searchParams.get('q') || '').trim(), 200);
  const type = url.searchParams.get('type') || 'all';
  if (!VALID_TYPES.has(type)) return json({ error: 'Invalid type' }, 400, headers);
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 1), 100);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);

  if (!q) {
    return json({ results: [], total: 0, query: '' }, 200, headers);
  }

  // Sanitize FTS5 query: escape double quotes, wrap terms
  const ftsQuery = q.replace(/"/g, '""').split(/\s+/).map(t => `"${t}"*`).join(' ');

  let sql, params;
  if (type && type !== 'all') {
    sql = `SELECT i.id, i.type, i.name, i.description, i.url, i.tags, i.metadata, i.icon, i.updated_at
           FROM items_fts f JOIN items i ON f.rowid = i.id
           WHERE items_fts MATCH ?1 AND i.type = ?2
           ORDER BY rank LIMIT ?3 OFFSET ?4`;
    params = [ftsQuery, type, limit, offset];
  } else {
    sql = `SELECT i.id, i.type, i.name, i.description, i.url, i.tags, i.metadata, i.icon, i.updated_at
           FROM items_fts f JOIN items i ON f.rowid = i.id
           WHERE items_fts MATCH ?1
           ORDER BY rank LIMIT ?2 OFFSET ?3`;
    params = [ftsQuery, limit, offset];
  }

  const { results } = await env.DB.prepare(sql).bind(...params).all();

  // Get total count
  let countSql, countParams;
  if (type && type !== 'all') {
    countSql = `SELECT count(*) as total FROM items_fts f JOIN items i ON f.rowid = i.id WHERE items_fts MATCH ?1 AND i.type = ?2`;
    countParams = [ftsQuery, type];
  } else {
    countSql = `SELECT count(*) as total FROM items_fts f JOIN items i ON f.rowid = i.id WHERE items_fts MATCH ?1`;
    countParams = [ftsQuery];
  }
  const countResult = await env.DB.prepare(countSql).bind(...countParams).first();

  return json({
    results: results.map(parseItem),
    total: countResult?.total || 0,
    query: q,
  }, 200, headers);
}

async function handleBrowse(url, env, headers) {
  const type = url.searchParams.get('type') || 'repos';
  if (!VALID_TYPES.has(type) || type === 'all') return json({ error: 'Invalid type' }, 400, headers);
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 1), 100);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);

  const { results } = await env.DB.prepare(
    `SELECT * FROM items WHERE type = ?1 ORDER BY updated_at DESC LIMIT ?2 OFFSET ?3`
  ).bind(type, limit, offset).all();

  const countResult = await env.DB.prepare(
    `SELECT count(*) as total FROM items WHERE type = ?1`
  ).bind(type).first();

  return json({
    results: results.map(parseItem),
    total: countResult?.total || 0,
    type,
  }, 200, headers);
}

async function handleStats(env, headers) {
  const { results } = await env.DB.prepare(
    `SELECT type, count(*) as count FROM items GROUP BY type ORDER BY count DESC`
  ).all();

  const totalResult = await env.DB.prepare(`SELECT count(*) as total FROM items`).first();
  const lastUpdated = await env.DB.prepare(
    `SELECT max(updated_at) as last FROM items`
  ).first();

  const recent = await env.DB.prepare(
    `SELECT id, type, name, description, url, icon, updated_at FROM items ORDER BY updated_at DESC LIMIT 10`
  ).all();

  return json({
    categories: results,
    total: totalResult?.total || 0,
    lastIndexed: lastUpdated?.last || null,
    recent: (recent.results || []).map(parseItem),
  }, 200, headers);
}

async function handleItem(path, env, headers) {
  // /api/item/:type/:id
  const parts = path.replace('/api/item/', '').split('/');
  if (parts.length < 2) return json({ error: 'Invalid path' }, 400, headers);

  const [type, rawId] = parts;
  if (!VALID_TYPES.has(type) || type === 'all') return json({ error: 'Invalid type' }, 400, headers);
  const id = parseInt(rawId, 10);
  if (isNaN(id) || id < 1 || id > 100000) return json({ error: 'Invalid id' }, 400, headers);
  const item = await env.DB.prepare(
    `SELECT * FROM items WHERE type = ?1 AND id = ?2`
  ).bind(type, id).first();

  if (!item) return json({ error: 'Not found' }, 404, headers);
  return json({ item: parseItem(item) }, 200, headers);
}

async function handleIndex(request, env, headers) {
  const auth = request.headers.get('Authorization');
  if (!env.ADMIN_TOKEN || auth !== `Bearer ${env.ADMIN_TOKEN}`) {
    return json({ error: 'Unauthorized' }, 401, headers);
  }

  const body = await safeParseJSON(request);
  const items = Array.isArray(body) ? body : [body];
  if (items.length > 500) return json({ error: 'Too many items (max 500)' }, 400, headers);
  let inserted = 0;
  let updated = 0;

  for (const item of items) {
    if (!item.type || !item.name) continue;
    if (!VALID_TYPES.has(item.type) || item.type === 'all') continue;
    item.name = sanitizeStr(item.name, 200);
    item.description = sanitizeStr(item.description || '', 2000);
    item.url = sanitizeStr(item.url || '', 500);
    item.tags = sanitizeStr(item.tags || '', 500);
    item.icon = sanitizeStr(item.icon || '', 10);
    const now = Math.floor(Date.now() / 1000);

    // Upsert: check if item exists by type+name
    const existing = await env.DB.prepare(
      `SELECT id FROM items WHERE type = ?1 AND name = ?2`
    ).bind(item.type, item.name).first();

    if (existing) {
      await env.DB.prepare(
        `UPDATE items SET description=?1, url=?2, tags=?3, metadata=?4, icon=?5, updated_at=?6 WHERE id=?7`
      ).bind(
        item.description || '',
        item.url || '',
        item.tags || '',
        JSON.stringify(item.metadata || {}),
        item.icon || '',
        now,
        existing.id,
      ).run();
      updated++;
    } else {
      await env.DB.prepare(
        `INSERT INTO items (type, name, description, url, tags, metadata, icon, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`
      ).bind(
        item.type,
        item.name,
        item.description || '',
        item.url || '',
        item.tags || '',
        JSON.stringify(item.metadata || {}),
        item.icon || '',
        now,
      ).run();
      inserted++;
    }
  }

  return json({ ok: true, inserted, updated }, 200, headers);
}

function parseItem(row) {
  let metadata = row.metadata || '{}';
  try {
    if (typeof metadata === 'string') metadata = JSON.parse(metadata);
  } catch { metadata = {}; }
  return { ...row, metadata };
}
