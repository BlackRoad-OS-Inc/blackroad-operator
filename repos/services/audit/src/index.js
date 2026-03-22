const crypto = require('crypto');
const fs = require('fs');
const express = require('express');
const { createDb } = require('@roadcode/db');
const { loadConfig } = require('@roadcode/config');
const { createLogger } = require('@roadcode/logger');

const log = createLogger('audit');
const config = loadConfig();
const db = createDb(config.audit.dbPath);

let lastHash = '';

function chainHash(data) {
  const input = lastHash + JSON.stringify(data);
  lastHash = crypto.createHash('sha256').update(input).digest('hex');
  return lastHash;
}

const app = express();
app.use(express.json());

app.get('/road/v1/health', (req, res) => {
  res.json({ service: 'audit', status: 'ok', ts: new Date().toISOString() });
});

// Record audit event
app.post('/road/v1/audit/events', (req, res) => {
  const { actor, action, entity_type, entity_id, details } = req.body;
  if (!actor || !action || !entity_type || !entity_id) {
    return res.status(400).json({ error: 'missing required fields: actor, action, entity_type, entity_id' });
  }

  const hash = chainHash({ actor, action, entity_type, entity_id, details });
  const stmt = db.prepare(`INSERT INTO road_audit (actor, action, entity_type, entity_id, details, hash) VALUES (?, ?, ?, ?, ?, ?)`);
  const result = stmt.run(actor, action, entity_type, entity_id, JSON.stringify(details || {}), hash);

  // Append to chain file
  const chainEntry = `${new Date().toISOString()} ${hash} ${actor} ${action} ${entity_type}:${entity_id}\n`;
  fs.appendFileSync(config.audit.chainPath, chainEntry);

  log.info('Audit event recorded', { actor, action, entity_type, entity_id });
  res.status(201).json({ id: result.lastInsertRowid, hash });
});

// Query audit events
app.get('/road/v1/audit/events', (req, res) => {
  const { actor, action, entity_type, limit } = req.query;
  let sql = 'SELECT * FROM road_audit WHERE 1=1';
  const params = [];

  if (actor) { sql += ' AND actor = ?'; params.push(actor); }
  if (action) { sql += ' AND action = ?'; params.push(action); }
  if (entity_type) { sql += ' AND entity_type = ?'; params.push(entity_type); }

  sql += ` ORDER BY id DESC LIMIT ?`;
  params.push(parseInt(limit) || 100);

  const rows = db.prepare(sql).all(...params);
  rows.forEach(r => { r.details = JSON.parse(r.details || '{}'); });
  res.json(rows);
});

// Audit stats
app.get('/road/v1/audit/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM road_audit').get().count;
  const byAction = db.prepare('SELECT action, COUNT(*) as count FROM road_audit GROUP BY action ORDER BY count DESC').all();
  const byType = db.prepare('SELECT entity_type, COUNT(*) as count FROM road_audit GROUP BY entity_type ORDER BY count DESC').all();
  const latest = db.prepare('SELECT * FROM road_audit ORDER BY id DESC LIMIT 1').get();
  res.json({ total, byAction, byType, latest });
});

app.listen(config.audit.port, () => {
  log.info(`Audit listening on :${config.audit.port}`);
});
