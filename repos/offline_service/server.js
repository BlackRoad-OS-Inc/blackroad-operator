#!/usr/bin/env node
import http from 'node:http';
import { URL, fileURLToPath } from 'node:url';
import * as fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = path.join(__dirname);
const AUDIT_PATH = path.join(DATA_DIR, 'audit.ndjson');

const bannedPhrases = [
  { pattern: /guaranteed/gi, replacement: 'positioned', token: 'guaranteed' },
  { pattern: /best/gi, replacement: 'competitive', token: 'best' },
  { pattern: /no\s*risk/gi, replacement: 'managed risk', token: 'no risk' }
];

const riskyProducts = new Map(
  Object.entries({
    annuity: 'Disclosure: Annuities may include surrender charges and market exposure. Review the contract carefully before investing.',
    derivative: 'Disclosure: Derivative products can amplify losses as well as gains. Ensure suitability for your objectives.',
    'structured note': 'Disclosure: Structured notes are complex and may lose value. Assess issuer creditworthiness and liquidity.',
    crypto: 'Disclosure: Digital assets are volatile and may lose significant value. Only invest what you can afford to lose.'
  })
);

const metrics = {
  policy: { pass: 0, warn: 0, fail: 0 },
  ruleOutcomes: { pass: 0, warn: 0, fail: 0 },
  errors: { input: 0, engine: 0, attest: 0 },
  attest: { ok: 0, fail: 0 },
  remediation: { total: 0 },
  lastLatencyMs: { total: 0, engine: 0 },
  lastBundle: null,
  version: 'unknown',
  ruleCount: 0,
  startedAt: Date.now(),
  lastUpdated: new Date().toISOString()
};

let lastAuditHash = null;
initializeAuditHash();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/ops.html' || url.pathname === '/ops')) {
      return serveOps(res);
    }
    if (req.method === 'GET' && url.pathname === '/health') {
      return respondJson(res, 200, { ok: true, uptime_seconds: Math.round((Date.now() - metrics.startedAt) / 1000) });
    }
    if (req.method === 'GET' && url.pathname === '/api/policy/metrics') {
      return handleMetrics(res);
    }
    if (req.method === 'POST' && url.pathname === '/api/policy/evaluate') {
      const body = await readJson(req, res);
      if (body === undefined) {
        return; // response handled in readJson
      }
      return handleEvaluate(res, body);
    }
    if (req.method === 'POST' && url.pathname === '/api/policy/bundle') {
      const body = await readJson(req, res);
      if (body === undefined) {
        return;
      }
      return handleBundle(res, body);
    }
    if (req.method === 'POST' && url.pathname === '/api/policy/remediate') {
      const body = await readJson(req, res);
      if (body === undefined) {
        return;
      }
      return handleRemediate(res, body);
    }
    if (req.method === 'POST' && url.pathname === '/api/attest/bundle') {
      const body = await readJson(req, res);
      if (body === undefined) {
        return;
      }
      return handleAttest(res, body);
    }
    respondJson(res, 404, { error: 'not_found' });
  } catch (err) {
    console.error('Unhandled error', err);
    respondJson(res, 500, { error: 'server_error' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`offline policy service listening on http://${HOST}:${PORT}`);
});

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function serveOps(res) {
  const opsPath = path.join(__dirname, 'ops.html');
  if (!fs.existsSync(opsPath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('ops dashboard missing');
  }
  const html = fs.readFileSync(opsPath);
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

function handleMetrics(res) {
  const uptimeSeconds = Math.max(0, Math.round((Date.now() - metrics.startedAt) / 1000));
  metrics.lastUpdated = new Date().toISOString();
  respondJson(res, 200, {
    now: metrics.lastUpdated,
    version: metrics.version,
    ruleCount: metrics.ruleCount,
    policy: { ...metrics.policy },
    ruleOutcomes: { ...metrics.ruleOutcomes },
    errors: { ...metrics.errors },
    attest: { ...metrics.attest },
    remediation: { ...metrics.remediation },
    latency_ms: { ...metrics.lastLatencyMs },
    uptime_seconds: uptimeSeconds,
    lastBundle: metrics.lastBundle
  });
}

function normalizeOutcome(outcome) {
  if (outcome === 'warn' || outcome === 'fail') {
    return outcome;
  }
  return 'pass';
}

function normalizePqc(value) {
  if (value === 'on' || value === 'off') {
    return value;
  }
  return 'unavailable';
}

function handleEvaluate(res, body) {
  const caseId = typeof body?.caseId === 'string' ? body.caseId.trim() : '';
  if (!caseId) {
    metrics.errors.input += 1;
    return respondJson(res, 400, { error: 'caseId_required' });
  }
  const pqc = normalizePqc(body?.pqc);
  const rules = Array.isArray(body?.rules) ? body.rules : [];
  const normalized = [];
  const engineStart = process.hrtime.bigint();
  for (const rule of rules) {
    normalized.push(normalizeOutcome(rule?.outcome));
  }
  const counts = { pass: 0, warn: 0, fail: 0 };
  for (const outcome of normalized) {
    counts[outcome] += 1;
  }
  const result = counts.fail > 0 ? 'fail' : counts.warn > 0 ? 'warn' : 'pass';
  const engineSeconds = Number(process.hrtime.bigint() - engineStart) / 1_000_000_000;
  const totalSeconds = engineSeconds; // engine work dominates in this simple service
  metrics.ruleOutcomes.pass += counts.pass;
  metrics.ruleOutcomes.warn += counts.warn;
  metrics.ruleOutcomes.fail += counts.fail;
  metrics.policy[result] += 1;
  metrics.lastLatencyMs.total = Math.round(totalSeconds * 1000);
  metrics.lastLatencyMs.engine = Math.round(engineSeconds * 1000);
  appendAudit('policy.evaluate', {
    caseId,
    result,
    counts,
    pqc,
    ruleCount: normalized.length
  });
  respondJson(res, 200, {
    caseId,
    result,
    counts,
    pqc,
    latency_ms: metrics.lastLatencyMs
  });
}

function handleBundle(res, body) {
  const version = typeof body?.version === 'string' ? body.version.trim() : 'unknown';
  const ruleCount = Number.isFinite(body?.ruleCount) ? Math.max(0, Math.trunc(body.ruleCount)) : 0;
  const bundleHash = typeof body?.hash === 'string' ? body.hash.trim() : '';
  const signature = typeof body?.signature === 'string' ? body.signature.trim() : '';
  const publicKey = typeof body?.publicKey === 'string' ? body.publicKey.trim() : '';
  if (!bundleHash || !signature || !publicKey) {
    metrics.errors.input += 1;
    return respondJson(res, 400, { error: 'bundle_payload_invalid' });
  }
  const ok = verifySignature(bundleHash, signature, publicKey);
  const status = ok ? 'ok' : 'fail';
  metrics.attest[status] += 1;
  metrics.version = version || 'unknown';
  metrics.ruleCount = ruleCount;
  metrics.lastBundle = { hash: bundleHash, status, version, ruleCount };
  appendAudit('policy.bundle.verify', {
    version: metrics.version,
    ruleCount,
    hash: bundleHash,
    status
  });
  if (!ok) {
    metrics.errors.attest += 1;
    return respondJson(res, 422, { ok: false, status: 'fail', version: metrics.version });
  }
  respondJson(res, 200, { ok: true, status: 'ok', version: metrics.version });
}

function handleAttest(res, body) {
  const status = body?.status === 'fail' ? 'fail' : 'ok';
  const pqc = normalizePqc(body?.pqc);
  metrics.attest[status] += 1;
  if (status === 'fail') {
    metrics.errors.attest += 1;
  }
  appendAudit('attest.bundle.report', { status, pqc, reason: body?.reason });
  if (status === 'fail') {
    return respondJson(res, 502, { ok: false, status, pqc, reason: body?.reason ?? 'no details' });
  }
  respondJson(res, 200, { ok: true, status, pqc });
}

function handleRemediate(res, body) {
  const marketing = typeof body?.marketing === 'string' ? body.marketing : '';
  const productClass = typeof body?.productClass === 'string' ? body.productClass.toLowerCase().trim() : '';
  if (!marketing) {
    metrics.errors.input += 1;
    return respondJson(res, 400, { error: 'marketing_required' });
  }
  let remediated = marketing;
  const touched = [];
  for (const { pattern, replacement, token } of bannedPhrases) {
    pattern.lastIndex = 0;
    if (pattern.test(remediated)) {
      remediated = remediated.replace(pattern, replacement);
      touched.push(token);
    }
  }
  const disclosure = riskyProducts.get(productClass);
  let disclosureAdded = false;
  if (disclosure) {
    disclosureAdded = true;
    remediated = ensureSentence(remediated);
  }
  metrics.remediation.total += 1;
  appendAudit('policy.remediate', {
    marketing,
    remediated,
    productClass,
    disclosureAdded
  });
  respondJson(res, 200, {
    marketing,
    remediated: disclosure ? `${remediated} ${disclosure}` : remediated,
    disclosureAdded,
    disclosure: disclosure ?? null,
    replacements: touched
  });
}

function ensureSentence(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return 'Updated copy forthcoming.';
  }
  if (/[.!?]$/.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed}.`;
}

function verifySignature(hashValue, signatureB64, publicKey) {
  try {
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(hashValue, 'utf8');
    verifier.end();
    return verifier.verify(publicKey, Buffer.from(signatureB64, 'base64'));
  } catch (err) {
    console.error('verifySignature error', err);
    return false;
  }
}

function readJson(req, res) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'payload_too_large' }));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        const data = raw ? JSON.parse(raw) : {};
        resolve(data);
      } catch (err) {
        metrics.errors.input += 1;
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'invalid_json' }));
        resolve(undefined);
      }
    });
    req.on('error', (err) => {
      console.error('readJson error', err);
      metrics.errors.engine += 1;
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'stream_error' }));
      resolve(undefined);
    });
  });
}

function respondJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function initializeAuditHash() {
  if (!fs.existsSync(AUDIT_PATH)) {
    lastAuditHash = null;
    return;
  }
  const lines = fs.readFileSync(AUDIT_PATH, 'utf8').trim().split('\n');
  for (const line of lines) {
    if (!line) continue;
    try {
      const parsed = JSON.parse(line);
      if (parsed && typeof parsed.hash === 'string') {
        lastAuditHash = parsed.hash;
      }
    } catch (err) {
      console.warn('unable to parse audit line', err);
    }
  }
}

function appendAudit(event, payload) {
  const base = {
    ts: new Date().toISOString(),
    event,
    payload,
    prevHash: lastAuditHash
  };
  const hash = crypto.createHash('sha256').update(JSON.stringify(base)).digest('hex');
  const entry = { ...base, hash };
  fs.appendFileSync(AUDIT_PATH, `${JSON.stringify(entry)}\n`);
  lastAuditHash = hash;
}

