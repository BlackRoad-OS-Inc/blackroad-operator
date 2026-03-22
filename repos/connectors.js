'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const router = express.Router();
const CONNECTOR_KEY = process.env.CONNECTOR_KEY || '';
const LOG_FILE = process.env.CONNECTOR_LOG || '/tmp/prism-connectors.log';
const ALLOWED_ROOTS = ['/srv', '/var/www/blackroad'];

function log(event, details = {}) {
  const payload = { at: new Date().toISOString(), event, ...details };
  try {
    fs.appendFileSync(LOG_FILE, JSON.stringify(payload) + '\n', 'utf8');
  } catch (_) { /* logging must never break the request pipeline */ }
}

function resolveSafe(targetPath) {
  if (!targetPath) throw new Error('path_required');
  const resolved = path.resolve(targetPath);
  const isAllowed = ALLOWED_ROOTS.some((root) =>
    resolved === root || resolved.startsWith(root + path.sep)
  );
  if (!isAllowed) throw new Error('path_not_allowed');
  return resolved;
}

function verifyPublicFile(resolved) {
  if (resolved.startsWith('/var/www/blackroad/')) {
    const rel = resolved.replace('/var/www/blackroad', '');
    exec(`curl -s https://blackroad.io${rel}`, () => {});
  }
}

function requireAuth(req, res, next) {
  const header = req.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!CONNECTOR_KEY) { log('auth_skipped', { reason: 'missing_key' }); return next(); }
  if (token === CONNECTOR_KEY) return next();
  log('auth_failed', { ip: req.ip, path: req.path });
  return res.status(401).json({ error: 'unauthorized' });
}

router.use(express.json({ limit: '1mb' }));
router.use(requireAuth);

router.post('/paste', (req, res) => {
  try {
    const { path: filePath, content = '' } = req.body || {};
    const resolved = resolveSafe(filePath);
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
    fs.writeFileSync(resolved, content, 'utf8');
    verifyPublicFile(resolved);
    log('paste', { path: resolved, bytes: Buffer.byteLength(content) });
    res.json({ ok: true, path: resolved });
  } catch (error) {
    log('paste_error', { message: error.message });
    res.status(400).json({ error: error.message });
  }
});

router.post('/append', (req, res) => {
  try {
    const { path: filePath, content = '' } = req.body || {};
    const resolved = resolveSafe(filePath);
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
    fs.appendFileSync(resolved, content, 'utf8');
    log('append', { path: resolved, bytes: Buffer.byteLength(content) });
    res.json({ ok: true, path: resolved });
  } catch (error) {
    log('append_error', { message: error.message });
    res.status(400).json({ error: error.message });
  }
});

router.post('/replace', (req, res) => {
  try {
    const { path: filePath, find, replace } = req.body || {};
    const resolved = resolveSafe(filePath);
    const original = fs.readFileSync(resolved, 'utf8');
    const updated = original.replace(new RegExp(find, 'g'), replace);
    fs.writeFileSync(resolved, updated, 'utf8');
    log('replace', { path: resolved, find, occurrences: (original.length - updated.length) });
    res.json({ ok: true, path: resolved });
  } catch (error) {
    log('replace_error', { message: error.message });
    res.status(400).json({ error: error.message });
  }
});

router.post('/restart', (req, res) => {
  const { service } = req.body || {};
  if (!service) return res.status(400).json({ error: 'service_required' });
  log('restart', { service });
  exec(`sudo systemctl restart ${service}`, (error, stdout, stderr) => {
    if (error) {
      log('restart_error', { service, message: error.message });
      return res.status(500).json({ error: error.message });
    }
    res.json({ ok: true, service, stdout: stdout.trim() });
  });
});

router.post('/build', (req, res) => {
  const { cwd, cmd = 'npm run build' } = req.body || {};
  if (!cwd) return res.status(400).json({ error: 'cwd_required' });
  const resolved = resolveSafe(cwd);
  log('build', { cwd: resolved, cmd });
  exec(cmd, { cwd: resolved, timeout: 60000 }, (error, stdout, stderr) => {
    if (error) {
      log('build_error', { cwd: resolved, message: error.message });
      return res.status(500).json({ error: error.message, stderr });
    }
    res.json({ ok: true, stdout: stdout.trim(), stderr: stderr.trim() });
  });
});

module.exports = router;
