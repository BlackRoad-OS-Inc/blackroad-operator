// Local memory index/search with WebDAV primary storage, SQLite cache, and flat-file fallback
// DB: /srv/blackroad-api/memory.db  Tables: docs(id TEXT PK, text, meta JSON, ts INT)
//      fts(content uses content=docs, content_rowid=rowid)
const fs = require('fs');
const path = require('path');

let Database;
let databaseLoadError;
const readline = require('readline');

let Database;
let databaseLoadError = null;
try {
  Database = require('better-sqlite3');
} catch (error) {
  databaseLoadError = error;
// Local memory index/search using SQLite + FTS5 + Ollama embeddings.
// Falls back to an in-memory stub when better-sqlite3 is unavailable.
const fs = require('fs');
const path = require('path');

const disableDbFlag = String(
  process.env.BR_TEST_DISABLE_DB || process.env.BRC_DISABLE_NATIVE_DB || ''
).toLowerCase();
const SHOULD_DISABLE_DB = disableDbFlag === '1' || disableDbFlag === 'true';

let Database;
if (!SHOULD_DISABLE_DB) {
  try {
    Database = require('better-sqlite3');
  } catch (err) {
    console.warn(
      '[memory] better-sqlite3 unavailable, using in-memory stub:',
      err
    );
  }
} else {
  console.warn(
    '[memory] native database disabled via env flag; using in-memory stub'
  );
}

function attachStub({ app }) {
  const docs = new Map();
  app.post('/api/memory/index', async (req, res) => {
    let raw = '';
    req.on('data', (d) => {
      raw += d;
    });
    await new Promise((resolve) => req.on('end', resolve));
    let body = {};
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      return res.status(400).json({ error: 'invalid json' });
    }
    const id =
      body.id || `doc:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    const text = String(body.text || '').slice(0, 200000);
    if (!text) return res.status(400).json({ error: 'missing text' });
    const meta = { source: body.source || null, tags: body.tags || [] };
    docs.set(id, { text, meta, ts: Date.now() });
    return res.json({ ok: true, id });
  });

  app.post('/api/memory/search', async (req, res) => {
    let raw = '';
    req.on('data', (d) => {
      raw += d;
    });
    await new Promise((resolve) => req.on('end', resolve));
    let body = {};
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      return res.status(400).json({ error: 'invalid json' });
    }
    const q = String(body.q || '').trim();
    const k = Math.max(1, Math.min(20, body.top_k || 5));
    if (!q) return res.status(400).json({ error: 'empty query' });
    const lc = q.toLowerCase();
    const results = [];
    for (const [id, entry] of docs.entries()) {
      if (!entry?.text) continue;
      if (entry.text.toLowerCase().includes(lc)) {
        results.push({
          id,
          score: 1,
          text: entry.text.slice(0, 2000),
          meta: entry.meta,
        });
      }
    }
    return res.json({ results: results.slice(0, k) });
  });

  console.log('[memory] in-memory stub online');
}

module.exports = function attachMemory({ app }) {
  if (!app) return;

  if (!Database) {
    attachStub({ app });
    return;
  }

  const DBP = process.env.MEMORY_DB || '/srv/blackroad-api/memory.db';
  const FALLBACK_FILE = process.env.MEMORY_FALLBACK_FILE || '/home/agents/cecilia/logs/memory.txt';

  let db;
  let fallbackMode = false;

  if (Database) {
    try {
      fs.mkdirSync(path.dirname(DBP), { recursive: true });
      db = new Database(DBP);
      db.exec(`CREATE TABLE IF NOT EXISTS docs (id TEXT PRIMARY KEY, text TEXT, meta TEXT, ts INTEGER);
const { createDatabase } = require('../lib/sqlite');
const Database = require('better-sqlite3');

const rawWebDAVBaseUrl = (process.env.WEBDAV_BASE_URL || '').trim();
const WEB_DAV_BASE_URL = rawWebDAVBaseUrl ? `${rawWebDAVBaseUrl.replace(/\/+$/, '')}/` : '';
const WEB_DAV_USER = process.env.WEBDAV_USER || '';
const WEB_DAV_PASS = process.env.WEBDAV_PASS || '';
const WEB_DAV_TIMEOUT_MS = Number(process.env.WEBDAV_TIMEOUT_MS || 7000);
const FALLBACK_FILE = process.env.MEMORY_FALLBACK_FILE || '/srv/blackroad-api/memory_fallback.jsonl';
const MAX_WEBDAV_DOCS_TO_SCAN = 200;

module.exports = function attachMemory({ app }) {
  const DBP = process.env.MEMORY_DB || '/srv/blackroad-api/memory.db';
  const FALLBACK_FILE =
    process.env.MEMORY_FALLBACK_FILE || '/home/agents/cecilia/logs/memory.txt';

  fs.mkdirSync(path.dirname(DBP), { recursive: true });
  const db = createDatabase(DBP);
  db.exec(`CREATE TABLE IF NOT EXISTS docs (id TEXT PRIMARY KEY, text TEXT, meta TEXT, ts INTEGER);

  let db;
  let fallbackMode = false;

  try {
    if (!Database) {
      throw databaseLoadError || new Error('better-sqlite3 unavailable');
    }
    db = new Database(DBP);
    db.exec(`CREATE TABLE IF NOT EXISTS docs (id TEXT PRIMARY KEY, text TEXT, meta TEXT, ts INTEGER);
}

module.exports = function attachMemory({ app }) {
  const DBP = process.env.MEMORY_DB || '/srv/blackroad-api/memory.db';
  const FALLBACK_FILE = process.env.MEMORY_FALLBACK_FILE || '/home/agents/cecilia/logs/memory.txt';

  let db = null;
  let fallbackMode = false;

  if (Database) {
    try {
      fs.mkdirSync(path.dirname(DBP), { recursive: true });
      db = new Database(DBP);
      db.exec(`CREATE TABLE IF NOT EXISTS docs (id TEXT PRIMARY KEY, text TEXT, meta TEXT, ts INTEGER);
CREATE VIRTUAL TABLE IF NOT EXISTS fts USING fts5(text, content='docs', content_rowid='rowid');
CREATE TRIGGER IF NOT EXISTS docs_ai AFTER INSERT ON docs BEGIN INSERT INTO fts(rowid,text) VALUES (new.rowid, new.text); END;
CREATE TRIGGER IF NOT EXISTS docs_ad AFTER DELETE ON docs BEGIN INSERT INTO fts(fts, rowid, text) VALUES('delete', old.rowid, old.text); END;
CREATE TRIGGER IF NOT EXISTS docs_au AFTER UPDATE ON docs BEGIN INSERT INTO fts(fts, rowid, text) VALUES('delete', old.rowid, old.text); INSERT INTO fts(rowid,text) VALUES (new.rowid, new.text); END;
CREATE TABLE IF NOT EXISTS vecs (id TEXT PRIMARY KEY, v TEXT);`);
    } catch (error) {
      fallbackMode = true;
      db = undefined;
      console.warn(`[memory] SQLite unavailable; using fallback file ${FALLBACK_FILE}`);
      console.warn('[memory] sqlite error:', error);
      console.warn(`[memory] SQLite unavailable; using fallback file ${FALLBACK_FILE}`);
      console.warn(error);
    }
  } else {
    fallbackMode = true;
    const msg = databaseLoadError ? databaseLoadError.message : 'module load failed';
    console.warn(`[memory] better-sqlite3 unavailable (${msg}); using fallback`);
    console.warn(`[memory] better-sqlite3 unavailable (${msg}); using fallback file ${FALLBACK_FILE}`);
  }

  if (fallbackMode) {
    try {
      fs.mkdirSync(path.dirname(FALLBACK_FILE), { recursive: true });
      if (!fs.existsSync(FALLBACK_FILE)) fs.writeFileSync(FALLBACK_FILE, '', 'utf8');
    } catch (error) {
      console.error('[memory] unable to initialize fallback file', error);
    }
  }

  async function embed(text) {
  } catch (error) {
    fallbackMode = true;
    const dir = path.dirname(FALLBACK_FILE);
    fs.mkdirSync(dir, { recursive: true });
    console.warn(
      `[memory] SQLite unavailable (${error.message}); using fallback file ${FALLBACK_FILE}`
    );
  }

  async function embed(text) {
    if (fallbackMode) return [];
    // Call local Ollama embeddings endpoint (pull nomic-embed-text first)
    const r = await fetch('http://127.0.0.1:11434/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.EMBED_MODEL || 'nomic-embed-text',
        prompt: text,
      }),
      body: JSON.stringify({ model: process.env.EMBED_MODEL || 'nomic-embed-text', prompt: text })
    });
    const j = await r.json();
    return j.embedding || j.data?.[0]?.embedding || [];
  const webdavEnabled = Boolean(WEB_DAV_BASE_URL);
  let webdavReadyPromise = null;

  function authHeaders() {
    if (!WEB_DAV_USER && !WEB_DAV_PASS) return {};
    return { Authorization: `Basic ${Buffer.from(`${WEB_DAV_USER}:${WEB_DAV_PASS}`).toString('base64')}` };
  }

  function withTimeout(url, options = {}) {
    if (!WEB_DAV_TIMEOUT_MS || Number.isNaN(WEB_DAV_TIMEOUT_MS)) {
      return fetch(url, options);
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), WEB_DAV_TIMEOUT_MS);
    return fetch(url, { ...options, signal: controller.signal })
      .finally(() => clearTimeout(timer));
  }

  async function ensureWebDAVReady() {
    if (!webdavEnabled) return false;
    if (webdavReadyPromise) return webdavReadyPromise;
    webdavReadyPromise = (async () => {
      const base = new URL(WEB_DAV_BASE_URL);
      const segments = base.pathname.split('/').filter(Boolean);
      let partial = '';
      for (const seg of segments) {
        partial += `${seg}/`;
        const target = new URL(partial, `${base.origin}/`);
        const res = await withTimeout(target, { method: 'MKCOL', headers: authHeaders() });
        if (res.status === 201 || res.status === 200) continue;
        if (res.status === 405 || res.status === 409) continue; // already exists or parent missing (will be created next iteration)
        if (!res.ok) {
          throw new Error(`MKCOL failed for ${target.pathname} (${res.status})`);
        }
      }
      return true;
    })().catch((err) => {
      console.warn('[memory] WebDAV init failed:', err.message);
      webdavReadyPromise = null;
      throw err;
    });
    return webdavReadyPromise;
  }

  async function webdavFetch(method, resource = '', { body, headers = {} } = {}) {
    if (!webdavEnabled) throw new Error('WebDAV disabled');
    const url = new URL(resource, WEB_DAV_BASE_URL);
    const mergedHeaders = { ...authHeaders(), ...headers };
    const res = await withTimeout(url, { method, headers: mergedHeaders, body });
    if (!res.ok && res.status !== 207) {
      throw new Error(`WebDAV ${method} ${url.pathname} failed (${res.status})`);
    }
    return res;
  }

  async function embed(text) {
    try {
      const r = await fetch('http://127.0.0.1:11434/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: process.env.EMBED_MODEL || 'nomic-embed-text', prompt: text })
      });
      const j = await r.json();
      return j.embedding || j.data?.[0]?.embedding || [];
    } catch (err) {
      console.warn('[memory] embedding failed:', err.message);
      return [];
    }
  }

  function run(sql, p = []) {
    return Promise.resolve(db.prepare(sql).run(p));
  }
  function all(sql, p = []) {
    return Promise.resolve(db.prepare(sql).all(p));
  }
  function get(sql, p = []) {
    return Promise.resolve(db.prepare(sql).get(p));
  }

  function cosine(a, b) {
    let dot = 0,
      na = 0,
      nb = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
  function run(sql, p = []) {
    return Promise.resolve(db.prepare(sql).run(p));
  }
  function all(sql, p = []) {
    return Promise.resolve(db.prepare(sql).all(p));
  }
  function get(sql, p = []) {
    return Promise.resolve(db.prepare(sql).get(p));
  let run = async () => { throw new Error('SQLite unavailable'); };
  let all = async () => { throw new Error('SQLite unavailable'); };
  let get = async () => { throw new Error('SQLite unavailable'); };

  if (db) {
    run = (sql, p = []) => Promise.resolve(db.prepare(sql).run(p));
    all = (sql, p = []) => Promise.resolve(db.prepare(sql).all(p));
    get = (sql, p = []) => Promise.resolve(db.prepare(sql).get(p));
  }

  function cosine(a, b) {
    let dot = 0;
    let na = 0;
    let nb = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
      dot += a[i] * b[i];
      na += a[i] * a[i];
      nb += b[i] * b[i];
    }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
  }

  app.post('/api/memory/index', async (req,res)=>{
    let raw=''; req.on('data',d=>raw+=d); await new Promise(r=>req.on('end',r));
    const body = raw?JSON.parse(raw):{};
    const id = body.id || `doc:${Date.now()}:${Math.random().toString(36).slice(2,8)}`;
    const text = String(body.text||'').slice(0, 200000);
    const metaObj = { source: body.source || null, tags: Array.isArray(body.tags)?body.tags:[] };
    const meta = JSON.stringify(metaObj);
    if (!text) return res.status(400).json({error:'missing text'});
    const metaObj = {source:body.source||null,tags:body.tags||[]};
    if (!text) return res.status(400).json({error:'missing text'});

    if (fallbackMode || !db) {
      const entry = { id, text, meta: metaObj, ts: Date.now() };
      try {
        fs.appendFileSync(FALLBACK_FILE, `${JSON.stringify(entry)}\n`, 'utf8');
      } catch (error) {
        console.error('[memory] fallback write failed', error);
        return res.status(500).json({
          error: 'fallback write failed',
          details: String(error.message||error)
        });
      }
      return res.json({ok:true,id,fallback:true});
    }
        return res.status(500).json({ error: 'fallback write failed', details: String(error.message||error) });
      }
      return res.json({ok:true,id,fallback:true});
    }

    const meta = JSON.stringify(metaObj);
    await run(`INSERT OR REPLACE INTO docs(id,text,meta,ts) VALUES(?,?,?,?)`, [id,text,meta,Date.now()]);
  app.post('/api/memory/index', async (req, res) => {
    let raw = '';
    req.on('data', (d) => (raw += d));
    await new Promise((r) => req.on('end', r));
  app.post('/api/memory/index', async (req, res) => {
    let raw = '';
    req.on('data', (d) => {
      raw += d;
    });
    await new Promise((resolve) => req.on('end', resolve));
    const body = raw ? JSON.parse(raw) : {};
    const id =
      body.id || `doc:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    const text = String(body.text || '').slice(0, 200000);
    const meta = JSON.stringify({
      source: body.source || null,
      tags: body.tags || [],
    });
    if (!text) return res.status(400).json({ error: 'missing text' });
    await run(`INSERT OR REPLACE INTO docs(id,text,meta,ts) VALUES(?,?,?,?)`, [
      id,
      text,
      meta,
      Date.now(),
    ]);
    // embed a few chunks ~1k chars
    const chunks = [];
    for (let i = 0; i < text.length; i += 1000)
      chunks.push(text.slice(i, i + 1000));
  let run;
  let all;
  let get;
  if (!fallbackMode) {
    run = function(sql, p = []) {
      return Promise.resolve(db.prepare(sql).run(p));
    };
    all = function(sql, p = []) {
      return Promise.resolve(db.prepare(sql).all(p));
    };
    get = function(sql, p = []) {
      return Promise.resolve(db.prepare(sql).get(p));
    };
  } else {
    const notAvailable = () =>
      Promise.reject(new Error('Database unavailable: fallback mode active'));
    run = notAvailable;
    all = notAvailable;
    get = notAvailable;
  }

  function cosine(a, b) {
    let dot = 0,
      na = 0,
      nb = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      dot += a[i] * b[i];
      na += a[i] * a[i];
      nb += b[i] * b[i];
    }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
  }

  app.post('/api/memory/index', async (req, res) => {
    let raw = '';
    req.on('data', d => (raw += d));
    await new Promise(r => req.on('end', r));
    const body = raw ? JSON.parse(raw) : {};
    const id = body.id || `doc:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    const text = String(body.text || '').slice(0, 200000);
    const meta = { source: body.source || null, tags: body.tags || [] };
    if (!text) return res.status(400).json({ error: 'missing text' });

    if (fallbackMode) {
      const entry = {
        id,
        text,
        meta,
        ts: Date.now()
      };
      await fs.promises.appendFile(
        FALLBACK_FILE,
        `${JSON.stringify(entry)}\n`,
        'utf8'
      );
      return res.json({ ok: true, id, fallback: true });
    }

    await run(`INSERT OR REPLACE INTO docs(id,text,meta,ts) VALUES(?,?,?,?)`, [
      id,
      text,
      JSON.stringify(meta),
      Date.now()
    ]);
    // embed a few chunks ~1k chars
    const chunks = [];
    for (let i = 0; i < text.length; i += 1000) chunks.push(text.slice(i, i + 1000));
    const embs = [];
    for (const c of chunks) {
      embs.push(await embed(c));
    const chunks = [];
    for (let i = 0; i < text.length; i += 1000)
      chunks.push(text.slice(i, i + 1000));
    const embs = [];
    for (const chunk of chunks) {
      embs.push(await embed(chunk));
    }
    await run(`INSERT OR REPLACE INTO vecs(id,v) VALUES(?,?)`, [
      id,
      JSON.stringify(embs.flat().slice(0, 1536)),
      JSON.stringify(embs.flat().slice(0, 1536))
    ]);
    res.json({ ok: true, id });
  });

  app.post('/api/memory/search', async (req,res)=>{
    let raw=''; req.on('data',d=>raw+=d); await new Promise(r=>req.on('end',r));
    const body = raw?JSON.parse(raw):{};
    const q = String(body.q||'').trim(); const k = Math.max(1, Math.min(20, body.top_k||5));
    if (!q) return res.status(400).json({error:'empty query'});
    if (fallbackMode || !db) {
      let data = '';
      try {
        data = fs.readFileSync(FALLBACK_FILE, 'utf8');
      } catch (error) {
        if (error.code === 'ENOENT') {
          return res.json({ results: [], fallback: true });
        }
        console.error('[memory] fallback read failed', error);
        return res.status(500).json({
          error: 'fallback read failed',
          details: String(error.message||error)
        });
      }
      const query = q.toLowerCase();
      const matches = [];
      const lines = data.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const entry = JSON.parse(line);
          if (!entry?.text) continue;
          if (String(entry.text).toLowerCase().includes(query)) {
            matches.push({
              id: entry.id,
              score: 1,
              text: String(entry.text||'').slice(0,2000),
              meta: entry.meta || {},
              ts: entry.ts || 0,
            });
          }
        } catch (error) {
          console.warn('[memory] failed to parse fallback entry', error);
        }
      }
      matches.sort((a,b)=> (b.ts||0) - (a.ts||0));
      return res.json({ results: matches.slice(0,k), fallback: true });
    }
  app.post('/api/memory/search', async (req, res) => {
    let raw = '';
    req.on('data', (d) => (raw += d));
  function filenameFor(ts, id) {
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, '0');
    const sanitized = String(id).replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 48) || 'entry';
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}-${sanitized}.jsonl`;
  }

  function occurrencesScore(text, query) {
    const q = query.toLowerCase();
    if (!q) return 0;
    const tokens = q.split(/\s+/).filter(Boolean);
    if (!tokens.length) return 0;
    const lower = text.toLowerCase();
    let score = 0;
    for (const token of tokens) {
      let idx = lower.indexOf(token);
      while (idx !== -1) {
        score += 1;
        idx = lower.indexOf(token, idx + token.length);
      }
    }
    return score;
  }

  async function listWebDAVDocuments() {
    try {
      await ensureWebDAVReady();
      const res = await webdavFetch('PROPFIND', '', { headers: { Depth: '1' } });
      const xml = await res.text();
      const matches = [...xml.matchAll(/<d:href>([^<]+)<\/d:href>/gi)];
      const base = new URL(WEB_DAV_BASE_URL);
      return matches
        .map((m) => decodeURIComponent(m[1]))
        .filter((href) => href && !href.endsWith('/') && href.startsWith(base.pathname))
        .map((href) => href.slice(base.pathname.length))
        .filter((name) => name && name.endsWith('.jsonl'));
    } catch (err) {
      console.warn('[memory] WebDAV list failed:', err.message);
      return [];
    }
  }

  async function readWebDAVDocument(name) {
    try {
      const res = await webdavFetch('GET', name);
      return await res.text();
    } catch (err) {
      console.warn('[memory] WebDAV read failed for', name, err.message);
      return '';
    }
  }

  async function searchWebDAV(q, k) {
    if (!webdavEnabled) return [];
    const names = await listWebDAVDocuments();
    if (!names.length) return [];
    const results = [];
    for (const name of names.slice(0, MAX_WEBDAV_DOCS_TO_SCAN)) {
      const raw = await readWebDAVDocument(name);
      if (!raw) continue;
      for (const line of raw.split('\n')) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          const score = occurrencesScore(parsed.text || '', q);
          if (score > 0) {
            results.push({
              id: parsed.id || name,
              score,
              text: String(parsed.text || '').slice(0, 2000),
              meta: typeof parsed.meta === 'string' ? JSON.parse(parsed.meta || '{}') : parsed.meta || {},
              ts: parsed.ts || null
            });
          }
        } catch (err) {
          console.warn('[memory] failed to parse WebDAV memory line', err.message);
        }
      }
    }
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, k);
  }

  function searchFallbackFile(q, k) {
    if (!fs.existsSync(FALLBACK_FILE)) return [];
    try {
      const lines = fs.readFileSync(FALLBACK_FILE, 'utf8').split('\n');
      const matches = [];
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          const score = occurrencesScore(parsed.text || '', q);
          if (score > 0) {
            matches.push({
              id: parsed.id,
              score,
              text: String(parsed.text || '').slice(0, 2000),
              meta: typeof parsed.meta === 'string' ? JSON.parse(parsed.meta || '{}') : parsed.meta || {},
              ts: parsed.ts || null
            });
          }
        } catch (err) {
          console.warn('[memory] failed to parse fallback memory line', err.message);
        }
      }
      matches.sort((a, b) => b.score - a.score);
      return matches.slice(0, k);
    } catch (err) {
      console.warn('[memory] fallback read failed:', err.message);
      return [];
    }
  }

  async function cacheToSQLite(id, text, meta, ts) {
    try {
      await run(`INSERT OR REPLACE INTO docs(id,text,meta,ts) VALUES(?,?,?,?)`, [id, text, meta, ts]);
    } catch (err) {
      console.warn('[memory] sqlite insert failed:', err.message);
      return;
    }
    const chunks = [];
    for (let i = 0; i < text.length; i += 1000) {
      chunks.push(text.slice(i, i + 1000));
    }
    const embs = await Promise.all(chunks.map((c) => embed(c)));
    const flat = embs.flat().slice(0, 1536);
    try {
      await run(`INSERT OR REPLACE INTO vecs(id,v) VALUES(?,?)`, [id, JSON.stringify(flat)]);
    } catch (err) {
      console.warn('[memory] sqlite vector cache failed:', err.message);
    }
  }

  async function storeToWebDAV(record) {
    if (!webdavEnabled) return false;
    try {
      await ensureWebDAVReady();
      const name = filenameFor(record.ts, record.id);
      const payload = `${JSON.stringify(record)}\n`;
      const res = await webdavFetch('PUT', name, {
        body: payload,
        headers: { 'Content-Type': 'application/json' }
      });
      return res.ok;
    } catch (err) {
      console.warn('[memory] WebDAV write failed:', err.message);
      return false;
    }
  }

  function appendFallback(record) {
    try {
      fs.mkdirSync(path.dirname(FALLBACK_FILE), { recursive: true });
      fs.appendFileSync(FALLBACK_FILE, `${JSON.stringify(record)}\n`);
    } catch (err) {
      console.warn('[memory] fallback write failed:', err.message);
    }
  }

  async function searchSQLite(q, k) {
    try {
      const rows = await all(
        `SELECT id, text, meta FROM docs WHERE rowid IN (SELECT rowid FROM fts WHERE fts MATCH ? LIMIT 50)`,
        [q.split(/\s+/).join(' ')]
      );
      if (!rows.length) return [];
      const qv = await embed(q);
      const scored = [];
      for (const r of rows) {
        const vrow = await get(`SELECT v FROM vecs WHERE id=?`, [r.id]);
        const v = vrow ? JSON.parse(vrow.v) : [];
        scored.push({ id: r.id, score: cosine(qv, v), text: r.text.slice(0, 2000), meta: JSON.parse(r.meta || '{}') });
      }
      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, k);
    } catch (err) {
      console.warn('[memory] sqlite search failed:', err.message);
      return [];
    }
  }

  app.post('/api/memory/index', async (req, res) => {
    let raw = '';
    req.on('data', (d) => {
      raw += d;
    });
    await new Promise((r) => req.on('end', r));
    const body = raw ? JSON.parse(raw) : {};
    const id = body.id || `doc:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    const text = String(body.text || '').slice(0, 200000);
    const metaObj = { source: body.source || null, tags: body.tags || [] };
    if (!text) return res.status(400).json({ error: 'missing text' });
    const ts = Date.now();
    const record = { id, text, meta: metaObj, ts };

    const webdavOk = await storeToWebDAV(record);
    await cacheToSQLite(id, text, JSON.stringify(metaObj), ts);
    if (!webdavOk) {
      appendFallback(record);
    }
    return res.json({ ok: true, id, webdav: webdavOk });
  });

    ]);
    return res.json({ ok: true, id });
  });

  app.post('/api/memory/search', async (req, res) => {
    let raw = '';
    req.on('data', (d) => {
      raw += d;
    });
    await new Promise((r) => req.on('end', r));
    const body = raw ? JSON.parse(raw) : {};
    const q = String(body.q || '').trim();
    const k = Math.max(1, Math.min(20, body.top_k || 5));
    if (!q) return res.status(400).json({ error: 'empty query' });
  app.post('/api/memory/search', async (req, res) => {
    let raw = '';
    req.on('data', d => (raw += d));
    await new Promise(r => req.on('end', r));
    await new Promise((resolve) => req.on('end', resolve));
    const body = raw ? JSON.parse(raw) : {};
    const q = String(body.q || '').trim();
    const k = Math.max(1, Math.min(20, body.top_k || 5));
    if (!q) return res.status(400).json({ error: 'empty query' });

    if (fallbackMode) {
      try {
        await fs.promises.access(FALLBACK_FILE, fs.constants.F_OK);
      } catch (accessError) {
        return res.json({ results: [], fallback: true });
      }

      const matches = [];
      const query = q.toLowerCase();
      let stream;
      let rl;
      try {
        stream = fs.createReadStream(FALLBACK_FILE, { encoding: 'utf8' });
        rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
        for await (const line of rl) {
          if (!line.trim()) continue;
          try {
            const entry = JSON.parse(line);
            if ((entry.text || '').toLowerCase().includes(query)) {
              matches.push({
                id: entry.id,
                score: 1,
                text: (entry.text || '').slice(0, 2000),
                meta: entry.meta || {},
                ts: entry.ts
              });
            }
          } catch (err) {
            // ignore malformed lines
          }
        }
      } catch (error) {
        return res
          .status(500)
          .json({ error: 'fallback read failed', detail: error.message });
      } finally {
        if (rl) rl.close();
        if (stream && typeof stream.close === 'function') stream.close();
      }

      matches.sort((a, b) => (b.ts || 0) - (a.ts || 0));
      const query = q.toLowerCase();
      const matches = [];
      const windowSize = Math.max(k, 50);
      let fileMissing = false;

      try {
        await new Promise((resolve, reject) => {
          const stream = fs.createReadStream(FALLBACK_FILE, { encoding: 'utf8' });
          let rl;
          stream.on('error', (error) => {
            if (rl) rl.close();
            stream.destroy();
            if (error.code === 'ENOENT') {
              fileMissing = true;
              resolve();
              return;
            }
            reject(error);
          });

          rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
          rl.on('line', (line) => {
            if (!line.trim()) return;
            try {
              const entry = JSON.parse(line);
              if (!entry?.text) return;
              if (entry.text.toLowerCase().includes(query)) {
                matches.push({
                  id: entry.id,
                  score: 1,
                  text: String(entry.text || '').slice(0, 2000),
                  meta: entry.meta || {},
                  ts: entry.ts || 0,
                });
                matches.sort((a, b) => (b.ts || 0) - (a.ts || 0));
                if (matches.length > windowSize) {
                  matches.length = windowSize;
                }
              }
            } catch (error) {
              console.warn('[memory] failed to parse fallback entry', error);
            }
          });

          rl.on('close', resolve);
        });
      } catch (error) {
        console.error('[memory] fallback read failed', error);
        return res.status(500).json({ error: 'fallback read failed', details: String(error.message||error) });
      }

      if (fileMissing) {
        return res.json({ results: [], fallback: true });
      }

      return res.json({ results: matches.slice(0, k), fallback: true });
    }

    // coarse FTS
    const rows = await all(
      `SELECT id, text, meta FROM docs WHERE rowid IN (SELECT rowid FROM fts WHERE fts MATCH ? LIMIT 50)`,
      [q.split(/\s+/).join(' ')]
    );
    // embeddings rerank
    const qv = await (async () => await embed(q))();
    const qv = await embed(q);
    const scored = [];
    for (const r of rows) {
      const vrow = await get(`SELECT v FROM vecs WHERE id=?`, [r.id]);
      const v = vrow ? JSON.parse(vrow.v) : [];
      scored.push({
        id: r.id,
        score: cosine(qv, v),
        text: r.text.slice(0, 2000),
        meta: JSON.parse(r.meta || '{}'),
      });
    }
    scored.sort((a, b) => b.score - a.score);
    res.json({ results: scored.slice(0, k) });
  });

  if (fallbackMode || !db) {
    console.log('[memory] fallback mode active:', FALLBACK_FILE);
  } else {
    console.log('[memory] online:', DBP);
  }

    let results = await searchSQLite(q, k);
    if (!results.length) {
      results = await searchWebDAV(q, k);
    }
    if (!results.length) {
      results = searchFallbackFile(q, k);
    }

    return res.json({ results });
  });

  console.log('[memory] online:', DBP, 'webdav:', webdavEnabled ? WEB_DAV_BASE_URL : 'disabled');
      scored.push({ id: r.id, score: cosine(qv, v), text: r.text.slice(0, 2000), meta: JSON.parse(r.meta || '{}') });
    }
    scored.sort((a, b) => b.score - a.score);
    res.json({ results: scored.slice(0, k) });
    }
    scored.sort((a, b) => b.score - a.score);
    return res.json({ results: scored.slice(0, k) });
  });

  if (fallbackMode) {
    console.log('[memory] fallback mode active:', FALLBACK_FILE);
  } else {
    console.log('[memory] online:', DBP);
  }
};
