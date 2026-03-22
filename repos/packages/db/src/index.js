const Database = require('better-sqlite3');
const path = require('path');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS road_orgs (
  name TEXT PRIMARY KEY,
  tier INTEGER NOT NULL,
  purpose TEXT NOT NULL,
  owner TEXT DEFAULT 'alexa',
  domains TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS road_repos (
  org TEXT NOT NULL,
  name TEXT NOT NULL,
  purpose TEXT,
  status TEXT DEFAULT 'active',
  gitea_url TEXT,
  github_url TEXT,
  PRIMARY KEY (org, name)
);

CREATE TABLE IF NOT EXISTS road_domains (
  domain TEXT PRIMARY KEY,
  org TEXT NOT NULL,
  purpose TEXT,
  infra TEXT,
  status TEXT DEFAULT 'live'
);

CREATE TABLE IF NOT EXISTS road_agents (
  name TEXT PRIMARY KEY,
  org TEXT NOT NULL,
  node TEXT,
  capabilities TEXT,
  status TEXT DEFAULT 'active',
  last_seen TEXT
);

CREATE TABLE IF NOT EXISTS road_nodes (
  hostname TEXT PRIMARY KEY,
  ip TEXT NOT NULL,
  role TEXT NOT NULL,
  services TEXT,
  status TEXT DEFAULT 'online',
  last_ping TEXT
);

CREATE TABLE IF NOT EXISTS road_services (
  name TEXT NOT NULL,
  node TEXT NOT NULL,
  port INTEGER,
  org TEXT,
  protocol TEXT DEFAULT 'http',
  status TEXT DEFAULT 'running',
  PRIMARY KEY (name, node)
);

CREATE TABLE IF NOT EXISTS road_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT DEFAULT (datetime('now')),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details TEXT,
  hash TEXT
);

CREATE TABLE IF NOT EXISTS road_deploys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT DEFAULT (datetime('now')),
  repo TEXT NOT NULL,
  commit_sha TEXT NOT NULL,
  node TEXT NOT NULL,
  domain TEXT,
  status TEXT DEFAULT 'success',
  details TEXT
);

CREATE TABLE IF NOT EXISTS road_mirrors (
  org TEXT NOT NULL,
  repo TEXT NOT NULL,
  gitea_sha TEXT,
  github_sha TEXT,
  last_sync TEXT,
  direction TEXT,
  status TEXT DEFAULT 'synced',
  PRIMARY KEY (org, repo)
);
`;

function createDb(dbPath) {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);
  return db;
}

module.exports = { createDb, SCHEMA };
