-- BlackRoad AI Gateway - D1 Schema
-- Database: blackboard (bcc78f33-b052-4cb2-bcfb-db5cd3c08472)

CREATE TABLE IF NOT EXISTS api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free',
  user_id TEXT,
  created_at TEXT NOT NULL,
  revoked_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_tier ON api_keys(tier);

CREATE TABLE IF NOT EXISTS request_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id TEXT NOT NULL,
  key_name TEXT,
  tier TEXT,
  model TEXT,
  provider TEXT,
  latency_ms INTEGER,
  status INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_request_log_key ON request_log(key_name);
CREATE INDEX IF NOT EXISTS idx_request_log_created ON request_log(created_at);
CREATE INDEX IF NOT EXISTS idx_request_log_provider ON request_log(provider);
