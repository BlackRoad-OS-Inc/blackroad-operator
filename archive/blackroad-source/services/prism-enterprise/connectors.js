'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const router = express.Router();
const LOG_FILE = '/var/log/blackroad-connectors.log';
const ROOTS = ['/srv', '/var/www/blackroad'];
const CONNECTOR_KEY = process.env.CONNECTOR_KEY;

function log(action, details) {
  const line = `${new Date().toISOString()} ${action} ${JSON.stringify(details)}\n`;
  try {
    fs.appendFileSync(LOG_FILE, line);
  } catch (_) {
    // ignore logging errors
  }
}

function validatePath(p) {
  const resolved = path.resolve(p || '');
  if (!ROOTS.some((root) => resolved === root || resolved.startsWith(root + path.sep))) {

const CONNECTOR_KEY = process.env.CONNECTOR_KEY || '';
const LOG_FILE = process.env.CONNECTOR_LOG || '/tmp/prism-connectors.log';
const ALLOWED_ROOTS = ['/srv', '/var/www/blackroad'];

function log(event, details = {}) {
  const payload = {
    at: new Date().toISOString(),
    event,
    ...details,
  };
  try {
    fs.appendFileSync(LOG_FILE, JSON.stringify(payload) + '\n', 'utf8');
  } catch (_error) {
    // logging must never break the request pipeline
  }
}

function resolveSafe(targetPath) {
  if (!targetPath) {
    throw new Error('path_required');
  }
  const resolved = path.resolve(targetPath);
  const isAllowed = ALLOWED_ROOTS.some((root) =>
    resolved === root || resolved.startsWith(root + path.sep)
  );
  if (!isAllowed) {
    throw new Error('path_not_allowed');
  }
  return resolved;
}

function verifyPublicFile(resolved) {
  if (resolved.startsWith('/var/www/blackroad/')) {
    const rel = resolved.replace('/var/www/blackroad', '');
    exec(`curl -s https://blackroad.io${rel}`, () => {});
  }
}

router.use((req, res, next) => {
  const auth = req.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!CONNECTOR_KEY || !token || token !== CONNECTOR_KEY) {
    log('unauthorized', { path: req.path, ip: req.ip });
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
});

router.post('/paste', (req, res) => {
  try {
    const { path: filePath, content = '' } = req.body || {};
    const resolved = validatePath(filePath);
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
    fs.writeFileSync(resolved, content, 'utf8');
    verifyPublicFile(resolved);
    log('paste', { path: resolved });
    res.json({ ok: true, path: resolved });
  } catch (err) {
    log('error', { action: 'paste', message: err.message });
    res.status(400).json({ error: err.message });
function requireAuth(req, res, next) {
  const header = req.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!CONNECTOR_KEY) {
    log('auth_skipped', { reason: 'missing_key' });
    return next();
  }
  if (token === CONNECTOR_KEY) {
    return next();
  }
  log('auth_failed', { ip: req.ip, path: req.path });
  return res.status(401).json({ error: 'unauthorized' });
}

router.use(express.json({ limit: '1mb' }));
router.use(requireAuth);

router.post('/paste', (req, res) => {
  try {
    const resolved = resolveSafe(req.body?.path);
    const content = req.body?.content ?? '';
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
    fs.writeFileSync(resolved, content, 'utf8');
    log('paste', { path: resolved, bytes: Buffer.byteLength(content) });
    return res.json({ ok: true, path: resolved });
  } catch (error) {
    log('paste_error', { message: error.message });
    return res.status(400).json({ error: error.message });
  }
});

router.post('/append', (req, res) => {
  try {
    const { path: filePath, content = '' } = req.body || {};
    const resolved = validatePath(filePath);
    fs.appendFileSync(resolved, content, 'utf8');
    verifyPublicFile(resolved);
    log('append', { path: resolved });
    res.json({ ok: true, path: resolved });
  } catch (err) {
    log('error', { action: 'append', message: err.message });
    res.status(400).json({ error: err.message });
    const resolved = resolveSafe(req.body?.path);
    const content = req.body?.content ?? '';
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
    fs.appendFileSync(resolved, content, 'utf8');
    log('append', { path: resolved, bytes: Buffer.byteLength(content) });
    return res.json({ ok: true, path: resolved });
  } catch (error) {
    log('append_error', { message: error.message });
    return res.status(400).json({ error: error.message });
  }
});

router.post('/replace', (req, res) => {
  try {
    const { path: filePath, pattern, replacement } = req.body || {};
    if (!filePath || pattern === undefined || replacement === undefined) {
      return res.status(400).json({ error: 'invalid_body' });
    }
    const resolved = validatePath(filePath);
    const regex = new RegExp(pattern, 'g');
    const text = fs.readFileSync(resolved, 'utf8').replace(regex, replacement);
    fs.writeFileSync(resolved, text, 'utf8');
    verifyPublicFile(resolved);
    log('replace', { path: resolved, pattern });
    res.json({ ok: true, path: resolved });
  } catch (err) {
    log('error', { action: 'replace', message: err.message });
    res.status(400).json({ error: err.message });
  const body = req.body || {};
  if (!body.path || typeof body.pattern !== 'string' || body.replacement === undefined) {
    return res.status(400).json({ error: 'invalid_body' });
  }
  try {
    const resolved = resolveSafe(body.path);
    const input = fs.readFileSync(resolved, 'utf8');
    const regex = new RegExp(body.pattern, 'g');
    const output = input.replace(regex, body.replacement);
    fs.writeFileSync(resolved, output, 'utf8');
    log('replace', { path: resolved, pattern: body.pattern });
    return res.json({ ok: true, path: resolved });
  } catch (error) {
    log('replace_error', { message: error.message });
    return res.status(400).json({ error: error.message });
  }
});

router.post('/restart', (req, res) => {
  const { service } = req.body || {};
  if (!service) return res.status(400).json({ error: 'service_required' });
  exec(`systemctl restart ${service}`, (err) => {
    if (err) {
      log('error', { action: 'restart', message: err.message });
      return res.status(500).json({ error: err.message });
  const service = req.body?.service;
  if (!service) {
    return res.status(400).json({ error: 'service_required' });
  }
  exec(`systemctl restart ${service}`, (error) => {
    if (error) {
      log('restart_error', { service, message: error.message });
      return res.status(500).json({ error: error.message });
    }
    log('restart', { service });
    return res.json({ ok: true, service });
  });
});

router.post('/build', (req, res) => {
  const { target } = req.body || {};
  let cmd = '';
  if (target === 'frontend') cmd = 'cd /srv/blackroad-frontend && npm run build';
  else if (target === 'api') cmd = 'cd /srv/blackroad-api && npm install';
  else if (target === 'llm') cmd = 'cd /srv/lucidia-llm && pip install -r requirements.txt';
  else if (target === 'math') cmd = 'cd /srv/lucidia-math && pip install -r requirements.txt';
  else return res.status(400).json({ error: 'unknown_target' });

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      log('error', { action: 'build', message: err.message });
      return res.status(500).json({ error: err.message, stderr });
  const target = req.body?.target;
  if (!target) {
    return res.status(400).json({ error: 'target_required' });
  }

  const commands = {
    frontend: 'cd /srv/blackroad-frontend && npm run build',
    api: 'cd /srv/blackroad-api && npm install',
    llm: 'cd /srv/lucidia-llm && pip install -r requirements.txt',
    math: 'cd /srv/lucidia-math && pip install -r requirements.txt',
  };

  const command = commands[target];
  if (!command) {
    return res.status(400).json({ error: 'unknown_target' });
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      log('build_error', { target, message: error.message });
      return res.status(500).json({ error: error.message, stderr });
    }
    log('build', { target });
    return res.json({ ok: true, target, stdout, stderr });
  });
});

module.exports = router;
