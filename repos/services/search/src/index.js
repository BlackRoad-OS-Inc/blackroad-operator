const express = require('express');
const Database = require('better-sqlite3');
const { loadConfig } = require('@roadcode/config');
const { createLogger } = require('@roadcode/logger');

const log = createLogger('search');
const config = loadConfig();
const db = new Database(config.search.dbPath);

db.pragma('journal_mode = WAL');
db.exec(`
  CREATE VIRTUAL TABLE IF NOT EXISTS road_search USING fts5(
    entity_type,
    entity_id,
    org,
    content,
    tokenize='porter'
  );
`);

const app = express();

app.get('/road/v1/health', (req, res) => {
  res.json({ service: 'search', status: 'ok', ts: new Date().toISOString() });
});

app.get('/road/v1/search', (req, res) => {
  const { q, type } = req.query;
  if (!q) return res.status(400).json({ error: 'missing q parameter' });

  let sql = `SELECT entity_type, entity_id, org, snippet(road_search, 3, '<b>', '</b>', '...', 32) as snippet, rank
             FROM road_search WHERE road_search MATCH ?`;
  const params = [q];

  if (type) {
    sql += ' AND entity_type = ?';
    params.push(type);
  }

  sql += ' ORDER BY rank LIMIT 50';

  const rows = db.prepare(sql).all(...params);
  res.json({ q, count: rows.length, results: rows });
});

// Rebuild index from registry
app.post('/road/v1/search/rebuild', async (req, res) => {
  try {
    const registryUrl = config.search.registryUrl;
    const types = ['orgs', 'domains', 'agents', 'nodes', 'services'];

    db.exec('DELETE FROM road_search');
    const insert = db.prepare('INSERT INTO road_search (entity_type, entity_id, org, content) VALUES (?, ?, ?, ?)');

    for (const type of types) {
      const resp = await fetch(`${registryUrl}/road/v1/${type}`);
      const data = await resp.json();
      const tx = db.transaction(() => {
        for (const item of data) {
          const id = item.name || item.domain || item.hostname || `${item.name}-${item.node}`;
          const org = item.org || '';
          const content = JSON.stringify(item);
          insert.run(type, id, org, content);
        }
      });
      tx();
      log.info(`Indexed ${data.length} ${type}`);
    }

    res.json({ status: 'rebuilt', ts: new Date().toISOString() });
  } catch (err) {
    log.error('Rebuild failed', { error: err.message });
    res.status(500).json({ error: err.message });
  }
});

app.listen(config.search.port, () => {
  log.info(`Search listening on :${config.search.port}`);
});
