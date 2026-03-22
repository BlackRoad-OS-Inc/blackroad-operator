'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ── Config ────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '4010', 10);
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const MODEL_FILE = path.join(__dirname, '.model');
const PERSONA_FILE = path.join(__dirname, '.persona');
const ORIGIN_KEY_PATH = '/srv/secrets/origin.key';
const LOG_DIR = '/var/log/blackroad';
const LOG_FILE = path.join(LOG_DIR, 'ollama-bridge.log');
const PERSONA_LOG = path.join(LOG_DIR, 'persona.log');
const DEFAULT_PERSONA =
  process.env.DEFAULT_PERSONA ||
  'You are a local BlackRoad assistant powered by Ollama. Always ask 1 short follow-up. Be truthful and concise.';
const MSG_SUFFIX = 'blackboxprogramming|copilot';
// When LUCIDIA_SEED is unset, dailyCode() returns '' and daily-code auth is disabled;
// only origin-key auth (ORIGIN_KEY_PATH) will be accepted for non-loopback requests.
const DEFAULT_SEED = process.env.LUCIDIA_SEED || '';

function readTimeoutEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const HEALTH_TIMEOUT_MS = readTimeoutEnv('HEALTH_TIMEOUT_MS', 5000);
const READY_TIMEOUT_MS = readTimeoutEnv('READY_TIMEOUT_MS', 5000);

// ── Logging ───────────────────────────────────────────────────────────────────
fs.mkdirSync(LOG_DIR, { recursive: true, mode: 0o750 });
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
const personaStream = fs.createWriteStream(PERSONA_LOG, { flags: 'a' });

function logLine(obj) {
  logStream.write(JSON.stringify(obj) + '\n');
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function toBase32(buf) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }
  return output;
}

function dailyCode(d = new Date()) {
  if (!DEFAULT_SEED) return '';
  const date = d.toISOString().slice(0, 10);
  const msg = `${date}|${MSG_SUFFIX}`;
  const digest = crypto.createHmac('sha256', DEFAULT_SEED).update(msg).digest();
  const code = toBase32(digest).slice(0, 16);
  return `LUCIDIA-AWAKEN-${date.replace(/-/g, '')}-${code}`;
}

function isLoopback(ip) {
  return ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(ip);
}

function resolveModel() {
  try {
    return process.env.MODEL || fs.readFileSync(MODEL_FILE, 'utf8').trim();
  } catch {
    return process.env.MODEL || '';
  }
}

// ── Persona baseline ──────────────────────────────────────────────────────────
let personaMode = process.env.PERSONA_GUARD === 'enforce' ? 'enforce' : 'warn';
let personaHash;
try {
  personaHash = fs.readFileSync(PERSONA_FILE, 'utf8').trim();
  if (!personaHash) throw new Error('empty');
} catch {
  personaHash = sha256(DEFAULT_PERSONA);
  fs.writeFileSync(PERSONA_FILE, personaHash, { mode: 0o600 });
  personaMode = 'warn';
}
const personaAllow = process.env.PERSONA_ALLOW_HASH || '';

function personaCheck(system, req) {
  const current = sha256(system || DEFAULT_PERSONA);
  if (current !== personaHash) {
    const event = {
      ts: new Date().toISOString(),
      level: 'warn',
      kind: 'persona_diff',
      req_id: req.reqId,
      hash: current,
      baseline: personaHash,
    };
    if (personaMode === 'enforce' && current !== personaAllow) {
      logLine({ ...event, level: 'error' });
      personaStream.write(`${event.ts} enforce ${event.baseline}->${event.hash}\n`);
      return { ok: false };
    }
    logLine(event);
    personaStream.write(`${event.ts} warn ${event.baseline}->${event.hash}\n`);
    if (personaMode === 'enforce' && current === personaAllow) {
      personaHash = current;
      fs.writeFileSync(PERSONA_FILE, personaHash, { mode: 0o600 });
    }
  }
  return { ok: true };
}

// ── Auth / CSRF ───────────────────────────────────────────────────────────────
let originKey = '';
try {
  originKey = fs.readFileSync(ORIGIN_KEY_PATH, 'utf8').trim();
} catch {
  // no origin key file — loopback-only auth is still enforced
}

function logAccess(ip, urlPath, status) {
  const line = `${new Date().toISOString()} ${ip} ${urlPath} ${status}\n`;
  logStream.write(line);
}

function authMiddleware(req, res, next) {
  const ip = (req.ip || '').replace('::ffff:', '');
  res.on('finish', () => logAccess(ip, req.originalUrl, res.statusCode));
  if (req.method !== 'POST') return next();
  if (isLoopback(ip)) return next();
  const key = req.get('X-BlackRoad-Key');
  if (!key) return res.status(401).json({ error: 'unauthorized' });
  const code = dailyCode();
  if ((originKey && key === originKey) || (code && key === code)) return next();
  return res.status(401).json({ error: 'unauthorized' });
}

const TRUSTED_CSRF_HOSTS = new Set(['blackroad.io', 'www.blackroad.io']);

function csrfMiddleware(req, res, next) {
  const ip = (req.ip || '').replace('::ffff:', '');
  if (req.method !== 'POST') return next();
  if (isLoopback(ip)) return next();
  const origin = req.get('Origin') || req.get('Referer') || '';
  try {
    const u = new URL(origin);
    if (!TRUSTED_CSRF_HOSTS.has(u.hostname)) {
      return res.status(403).json({ error: 'forbidden' });
    }
  } catch {
    return res.status(403).json({ error: 'forbidden' });
  }
  if (req.get('X-Requested-With') !== 'XMLHttpRequest') {
    return res.status(403).json({ error: 'forbidden' });
  }
  return next();
}

// ── Metrics ───────────────────────────────────────────────────────────────────
const buckets = [5, 10, 25, 50, 100, 250, 500, 1000, 2500];

class Histogram {
  constructor() {
    this.counts = Array(buckets.length).fill(0);
    this.sum = 0;
    this.count = 0;
  }
  observe(v) {
    this.count++;
    this.sum += v;
    for (let i = 0; i < buckets.length; i++) {
      if (v <= buckets[i]) this.counts[i]++;
    }
  }
  lines(name, labels) {
    const out = [];
    for (let i = 0; i < buckets.length; i++) {
      out.push(`${name}_bucket{${labels},le="${buckets[i]}"} ${this.counts[i]}`);
    }
    out.push(`${name}_bucket{${labels},le="+Inf"} ${this.count}`);
    out.push(`${name}_sum{${labels}} ${this.sum}`);
    out.push(`${name}_count{${labels}} ${this.count}`);
    return out;
  }
}

class MetricsStore {
  constructor() {
    this.reqTotals = {};
    this.reqHists = {};
    this.upHists = {};
    this.sseClients = 0;
    this.authDenied = 0;
    this.rateLimited = 0;
  }
  record(urlPath, method, code, dur, up) {
    const key = `${urlPath}|${method}|${code}`;
    this.reqTotals[key] = (this.reqTotals[key] || 0) + 1;
    if (!this.reqHists[key]) this.reqHists[key] = new Histogram();
    this.reqHists[key].observe(dur);
    if (up !== undefined) {
      if (!this.upHists[key]) this.upHists[key] = new Histogram();
      this.upHists[key].observe(up);
    }
  }
  incSSE(delta) { this.sseClients += delta; }
  incAuthDenied() { this.authDenied++; }
  incRateLimited() { this.rateLimited++; }
  render() {
    let out = '# HELP http_requests_total Count of HTTP requests\n';
    out += '# TYPE http_requests_total counter\n';
    for (const key of Object.keys(this.reqTotals)) {
      const [p, m, c] = key.split('|');
      out += `http_requests_total{path="${p}",method="${m}",code="${c}"} ${this.reqTotals[key]}\n`;
    }
    out += '# HELP http_request_duration_ms Duration of HTTP requests\n';
    out += '# TYPE http_request_duration_ms histogram\n';
    for (const key of Object.keys(this.reqHists)) {
      const [p, m, c] = key.split('|');
      out +=
        this.reqHists[key]
          .lines('http_request_duration_ms', `path="${p}",method="${m}",code="${c}"`)
          .join('\n') + '\n';
    }
    out += '# HELP sse_clients_gauge Number of connected SSE clients\n';
    out += '# TYPE sse_clients_gauge gauge\n';
    out += `sse_clients_gauge ${this.sseClients}\n`;
    out += '# HELP auth_denied_total Auth denied count\n';
    out += '# TYPE auth_denied_total counter\n';
    out += `auth_denied_total ${this.authDenied}\n`;
    out += '# HELP rate_limited_total Rate limited count\n';
    out += '# TYPE rate_limited_total counter\n';
    out += `rate_limited_total ${this.rateLimited}\n`;
    return out;
  }
}

const metrics = new MetricsStore();

// ── Express app ───────────────────────────────────────────────────────────────
const app = express();
app.use(express.json({ limit: '2mb' }));

// Request logger + metrics
app.use((req, res, next) => {
  const reqId = crypto.randomUUID();
  req.reqId = reqId;
  const t0 = process.hrtime.bigint();
  res.setHeader('X-Request-ID', reqId);
  res.on('finish', () => {
    const dur = Number(process.hrtime.bigint() - t0) / 1e6;
    metrics.record(req.path, req.method, res.statusCode, dur, res.locals.up_ms);
    logLine({
      ts: new Date().toISOString(),
      req_id: reqId,
      ip: req.ip,
      method: req.method,
      path: req.path,
      code: res.statusCode,
      dur_ms: Number(dur.toFixed(1)),
      up_ms: res.locals.up_ms ? Number(res.locals.up_ms.toFixed(1)) : undefined,
      model: res.locals.model,
    });
  });
  next();
});

app.use('/api/llm', csrfMiddleware, authMiddleware);

// ── Upstream fetch helper ─────────────────────────────────────────────────────
let lastHealth = 0;

async function fetchJSON(url, opts = {}, timeout) {
  const controller = new AbortController();
  const id = timeout ? setTimeout(() => controller.abort(), timeout) : null;
  const t = process.hrtime.bigint();
  try {
    const r = await fetch(url, { ...opts, signal: timeout ? controller.signal : undefined });
    const up = Number(process.hrtime.bigint() - t) / 1e6;
    return { r, up };
  } finally {
    if (id) clearTimeout(id);
  }
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/api/llm/health', async (_req, res) => {
  try {
    const { r, up } = await fetchJSON(`${OLLAMA_URL}/api/version`, {}, HEALTH_TIMEOUT_MS);
    res.locals.up_ms = up;
    if (!r.ok) throw new Error('upstream');
    const data = await r.json();
    lastHealth = Date.now();
    res.json({ ok: true, version: data.version });
  } catch {
    res.status(502).json({ ok: false });
  }
});

app.post('/api/llm/chat', async (req, res) => {
  const system = (req.body && req.body.system) || DEFAULT_PERSONA;
  const check = personaCheck(system, req);
  if (!check.ok) return res.status(409).json({ error: 'persona changed' });
  const body = { ...req.body, system, model: (req.body && req.body.model) || resolveModel() };
  res.locals.model = body.model;
  try {
    const { r, up } = await fetchJSON(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    res.locals.up_ms = up;
    const txt = await r.text();
    res.status(r.status).type(r.headers.get('content-type') || 'text/plain').send(txt);
  } catch {
    res.status(502).json({ error: 'upstream_error' });
  }
});

app.post('/api/llm/stream', async (req, res) => {
  const system = (req.body && req.body.system) || DEFAULT_PERSONA;
  const check = personaCheck(system, req);
  if (!check.ok) return res.status(409).json({ error: 'persona changed' });
  const body = { ...req.body, system, model: (req.body && req.body.model) || resolveModel() };
  res.locals.model = body.model;
  metrics.incSSE(1);
  res.on('close', () => metrics.incSSE(-1));
  try {
    const { r, up } = await fetchJSON(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, stream: true }),
    });
    res.locals.up_ms = up;
    if (!r.body) {
      const txt = await r.text();
      return res.status(r.status).type('text/plain').send(txt);
    }
    res.status(r.status);
    for await (const chunk of r.body) {
      res.write(chunk);
    }
    res.end();
  } catch {
    res.status(502).json({ error: 'upstream_error' });
  }
});

app.get('/api/llm/models', async (_req, res) => {
  try {
    const { r, up } = await fetchJSON(`${OLLAMA_URL}/api/tags`);
    res.locals.up_ms = up;
    const data = await r.json();
    const models = (data.models || [])
      .map((m) => ({ name: m.name, size: m.size }))
      .sort((a, b) => (a.size || 0) - (b.size || 0))
      .map((m) => ({ name: m.name }));
    res.json(models);
  } catch {
    res.status(502).json({ error: 'upstream_error' });
  }
});

app.get('/api/llm/default', (_req, res) => {
  res.json({ model: resolveModel() });
});

app.post('/api/llm/default', async (req, res) => {
  const model = (req.body && req.body.model) || '';
  if (!model) return res.status(400).json({ error: 'model_required' });
  try {
    fs.writeFileSync(MODEL_FILE, model, { mode: 0o600 });
  } catch {
    // non-fatal — keep in-process value
  }
  // warm model
  try {
    await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt: 'ok', stream: false }),
    });
  } catch {
    // ignore warm-up failures
  }
  res.json({ ok: true, model });
});

app.get('/api/llm/metrics', (_req, res) => {
  res.type('text/plain; version=0.0.4').send(metrics.render());
});

app.get('/api/llm/persona', (_req, res) => {
  res.json({ hash: personaHash, mode: personaMode });
});

app.post('/api/llm/persona', (req, res) => {
  const { hash, mode } = req.body || {};
  if (hash) {
    personaHash = hash;
    try {
      fs.writeFileSync(PERSONA_FILE, personaHash, { mode: 0o600 });
    } catch {
      // non-fatal — persona hash kept in-process even if file write fails
    }
  }
  if (mode) personaMode = mode === 'enforce' ? 'enforce' : 'warn';
  res.json({ hash: personaHash, mode: personaMode });
});

async function readyCheck() {
  const reasons = [];
  try {
    const { r } = await fetchJSON(`${OLLAMA_URL}/api/version`, {}, READY_TIMEOUT_MS);
    if (!r.ok) reasons.push('ollama_unreachable');
  } catch {
    reasons.push('ollama_unreachable');
  }
  const model = resolveModel();
  if (model) {
    try {
      const { r } = await fetchJSON(`${OLLAMA_URL}/api/tags`, {}, READY_TIMEOUT_MS);
      const data = await r.json();
      if (!data.models || !data.models.some((m) => m.name === model)) {
        reasons.push('model_missing');
      }
    } catch {
      reasons.push('model_missing');
    }
  } else {
    reasons.push('model_missing');
  }
  try {
    const testPath = path.join(LOG_DIR, '.ready');
    fs.writeFileSync(testPath, Date.now().toString());
    fs.unlinkSync(testPath);
  } catch {
    reasons.push('log_dir_unwritable');
  }
  if (Date.now() - lastHealth > 30000) {
    try {
      const { r } = await fetchJSON(`${OLLAMA_URL}/api/version`, {}, READY_TIMEOUT_MS);
      if (r.ok) lastHealth = Date.now();
      else reasons.push('health_stale');
    } catch {
      reasons.push('health_stale');
    }
  }
  return reasons;
}

app.get('/api/llm/ready', async (_req, res) => {
  const reasons = await readyCheck();
  if (reasons.length === 0) return res.json({ ok: true });
  res.status(503).json({ ok: false, reasons });
});

app.get('/api/backups/last', (_req, res) => {
  try {
    const t = fs.readFileSync('/srv/blackroad-backups/.last_snapshot', 'utf8').trim();
    res.json({ time: t });
  } catch {
    res.json({ time: null });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ollama-bridge listening on ${PORT}`);
});

module.exports = app;
