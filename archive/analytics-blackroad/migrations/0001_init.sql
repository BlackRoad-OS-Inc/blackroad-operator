-- BlackRoad Analytics — Edge-native event capture
-- Consent-first: no cookies, no fingerprinting, no PII

CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL,
  referrer TEXT DEFAULT '',
  session_id TEXT NOT NULL,
  screen_w INTEGER,
  screen_h INTEGER,
  lang TEXT DEFAULT '',
  country TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  path TEXT DEFAULT '',
  session_id TEXT NOT NULL,
  props TEXT DEFAULT '{}',
  country TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  first_path TEXT NOT NULL,
  pages INTEGER DEFAULT 1,
  duration_ms INTEGER DEFAULT 0,
  country TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  last_seen TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_pv_path ON page_views(path);
CREATE INDEX idx_pv_created ON page_views(created_at);
CREATE INDEX idx_ev_name ON events(name);
CREATE INDEX idx_ev_created ON events(created_at);
CREATE INDEX idx_sess_created ON sessions(created_at);
