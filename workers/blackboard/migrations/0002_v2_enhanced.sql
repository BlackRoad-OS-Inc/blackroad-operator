-- BlackBoard v2 Migration — Enhanced Analytics
-- Run: wrangler d1 execute blackboard --file=migrations/0002_v2_enhanced.sql

-- Add new columns to events table
ALTER TABLE events ADD COLUMN fid TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN postal TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN latitude REAL DEFAULT 0;
ALTER TABLE events ADD COLUMN longitude REAL DEFAULT 0;
ALTER TABLE events ADD COLUMN timezone TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN asn INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN as_org TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN colo TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN tls_version TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN http_protocol TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN browser_version TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN os_version TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN viewport TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN pixel_ratio REAL DEFAULT 1;
ALTER TABLE events ADD COLUMN color_depth INTEGER DEFAULT 24;
ALTER TABLE events ADD COLUMN cpu_cores INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN memory_gb REAL DEFAULT 0;
ALTER TABLE events ADD COLUMN gpu TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN gpu_vendor TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN max_touch_points INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN connection_type TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN downlink REAL DEFAULT 0;
ALTER TABLE events ADD COLUMN rtt INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN save_data INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN language TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN languages TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN msclkid TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN ttclid TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN li_fat_id TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN is_bot INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN bot_score REAL DEFAULT 0;
ALTER TABLE events ADD COLUMN has_adblock INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN has_dnt INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN is_incognito INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN scroll_depth INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN time_on_page INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN engagement_time INTEGER DEFAULT 0;

-- New indexes
CREATE INDEX IF NOT EXISTS idx_events_fid ON events(fid);
CREATE INDEX IF NOT EXISTS idx_events_sid ON events(sid);
CREATE INDEX IF NOT EXISTS idx_events_bot ON events(is_bot, ts);
CREATE INDEX IF NOT EXISTS idx_events_site_path ON events(site, path, ts);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sid TEXT UNIQUE NOT NULL,
  vid TEXT NOT NULL,
  fid TEXT DEFAULT '',
  entry_url TEXT DEFAULT '',
  entry_path TEXT DEFAULT '',
  entry_referrer TEXT DEFAULT '',
  utm_source TEXT DEFAULT '',
  utm_medium TEXT DEFAULT '',
  utm_campaign TEXT DEFAULT '',
  exit_url TEXT DEFAULT '',
  exit_path TEXT DEFAULT '',
  pageviews INTEGER DEFAULT 1,
  events INTEGER DEFAULT 0,
  max_scroll_depth INTEGER DEFAULT 0,
  engagement_time INTEGER DEFAULT 0,
  total_time INTEGER DEFAULT 0,
  is_bounce INTEGER DEFAULT 1,
  converted INTEGER DEFAULT 0,
  country TEXT DEFAULT '',
  city TEXT DEFAULT '',
  device_type TEXT DEFAULT '',
  browser TEXT DEFAULT '',
  os TEXT DEFAULT '',
  site TEXT DEFAULT '',
  started_at INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  ended_at INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_sessions_sid ON sessions(sid);
CREATE INDEX IF NOT EXISTS idx_sessions_vid ON sessions(vid);
CREATE INDEX IF NOT EXISTS idx_sessions_started ON sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_site ON sessions(site, started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_bounce ON sessions(is_bounce, started_at);

-- Fingerprints table
CREATE TABLE IF NOT EXISTS fingerprints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fid TEXT UNIQUE NOT NULL,
  canvas_hash TEXT DEFAULT '',
  webgl_hash TEXT DEFAULT '',
  audio_hash TEXT DEFAULT '',
  font_hash TEXT DEFAULT '',
  screen TEXT DEFAULT '',
  color_depth INTEGER DEFAULT 0,
  pixel_ratio REAL DEFAULT 0,
  cpu_cores INTEGER DEFAULT 0,
  memory_gb REAL DEFAULT 0,
  max_touch INTEGER DEFAULT 0,
  gpu TEXT DEFAULT '',
  gpu_vendor TEXT DEFAULT '',
  platform TEXT DEFAULT '',
  language TEXT DEFAULT '',
  timezone TEXT DEFAULT '',
  timezone_offset INTEGER DEFAULT 0,
  has_webgl INTEGER DEFAULT 0,
  has_webgl2 INTEGER DEFAULT 0,
  has_webrtc INTEGER DEFAULT 0,
  has_websocket INTEGER DEFAULT 0,
  has_service_worker INTEGER DEFAULT 0,
  has_webgpu INTEGER DEFAULT 0,
  has_wasm INTEGER DEFAULT 0,
  has_midi INTEGER DEFAULT 0,
  has_bluetooth INTEGER DEFAULT 0,
  has_usb INTEGER DEFAULT 0,
  has_serial INTEGER DEFAULT 0,
  has_hid INTEGER DEFAULT 0,
  has_gamepad INTEGER DEFAULT 0,
  has_speech INTEGER DEFAULT 0,
  has_payment INTEGER DEFAULT 0,
  has_credential INTEGER DEFAULT 0,
  math_tan TEXT DEFAULT '',
  math_sinh TEXT DEFAULT '',
  plugin_count INTEGER DEFAULT 0,
  mime_count INTEGER DEFAULT 0,
  has_localstorage INTEGER DEFAULT 0,
  has_sessionstorage INTEGER DEFAULT 0,
  has_indexeddb INTEGER DEFAULT 0,
  has_cookies INTEGER DEFAULT 0,
  media_devices_count INTEGER DEFAULT 0,
  entropy REAL DEFAULT 0,
  first_seen INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  visit_count INTEGER DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_fp_fid ON fingerprints(fid);
CREATE INDEX IF NOT EXISTS idx_fp_entropy ON fingerprints(entropy);

-- Performance table
CREATE TABLE IF NOT EXISTS performance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vid TEXT NOT NULL,
  sid TEXT DEFAULT '',
  url TEXT DEFAULT '',
  path TEXT DEFAULT '',
  site TEXT DEFAULT '',
  dns_time REAL DEFAULT 0,
  tcp_time REAL DEFAULT 0,
  tls_time REAL DEFAULT 0,
  ttfb REAL DEFAULT 0,
  response_time REAL DEFAULT 0,
  dom_interactive REAL DEFAULT 0,
  dom_complete REAL DEFAULT 0,
  load_time REAL DEFAULT 0,
  fcp REAL DEFAULT 0,
  lcp REAL DEFAULT 0,
  fid REAL DEFAULT 0,
  inp REAL DEFAULT 0,
  cls REAL DEFAULT 0,
  ttfb_vital REAL DEFAULT 0,
  fp REAL DEFAULT 0,
  resource_count INTEGER DEFAULT 0,
  transfer_size INTEGER DEFAULT 0,
  decoded_size INTEGER DEFAULT 0,
  js_heap_used INTEGER DEFAULT 0,
  js_heap_total INTEGER DEFAULT 0,
  connection_type TEXT DEFAULT '',
  effective_type TEXT DEFAULT '',
  downlink REAL DEFAULT 0,
  rtt INTEGER DEFAULT 0,
  device_type TEXT DEFAULT '',
  country TEXT DEFAULT '',
  ts INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_perf_path ON performance(path, ts);
CREATE INDEX IF NOT EXISTS idx_perf_site ON performance(site, ts);

-- Errors table
CREATE TABLE IF NOT EXISTS errors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vid TEXT DEFAULT '',
  sid TEXT DEFAULT '',
  site TEXT DEFAULT '',
  url TEXT DEFAULT '',
  path TEXT DEFAULT '',
  error_type TEXT NOT NULL,
  message TEXT DEFAULT '',
  source TEXT DEFAULT '',
  lineno INTEGER DEFAULT 0,
  colno INTEGER DEFAULT 0,
  stack TEXT DEFAULT '',
  browser TEXT DEFAULT '',
  os TEXT DEFAULT '',
  device_type TEXT DEFAULT '',
  country TEXT DEFAULT '',
  count INTEGER DEFAULT 1,
  ts INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_errors_type ON errors(error_type, ts);
CREATE INDEX IF NOT EXISTS idx_errors_site ON errors(site, ts);

-- Interactions table
CREATE TABLE IF NOT EXISTS interactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vid TEXT DEFAULT '',
  sid TEXT DEFAULT '',
  site TEXT DEFAULT '',
  url TEXT DEFAULT '',
  path TEXT DEFAULT '',
  type TEXT NOT NULL,
  target_tag TEXT DEFAULT '',
  target_id TEXT DEFAULT '',
  target_class TEXT DEFAULT '',
  target_text TEXT DEFAULT '',
  target_href TEXT DEFAULT '',
  x INTEGER DEFAULT 0,
  y INTEGER DEFAULT 0,
  viewport_x INTEGER DEFAULT 0,
  viewport_y INTEGER DEFAULT 0,
  scroll_depth INTEGER DEFAULT 0,
  scroll_direction TEXT DEFAULT '',
  form_id TEXT DEFAULT '',
  form_action TEXT DEFAULT '',
  field_name TEXT DEFAULT '',
  field_type TEXT DEFAULT '',
  time_in_field INTEGER DEFAULT 0,
  selected_length INTEGER DEFAULT 0,
  props TEXT DEFAULT '{}',
  ts INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions(type, ts);
CREATE INDEX IF NOT EXISTS idx_interactions_site ON interactions(site, path, ts);
CREATE INDEX IF NOT EXISTS idx_interactions_vid ON interactions(vid, ts);

-- Heatmap table
CREATE TABLE IF NOT EXISTS heatmap (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site TEXT NOT NULL,
  path TEXT NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  page_x INTEGER DEFAULT 0,
  page_y INTEGER DEFAULT 0,
  viewport_w INTEGER DEFAULT 0,
  viewport_h INTEGER DEFAULT 0,
  page_h INTEGER DEFAULT 0,
  device_type TEXT DEFAULT '',
  target_tag TEXT DEFAULT '',
  ts INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_heatmap_path ON heatmap(site, path, ts);

-- Threats table
CREATE TABLE IF NOT EXISTS threats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vid TEXT DEFAULT '',
  ip_hash TEXT DEFAULT '',
  threat_type TEXT NOT NULL,
  confidence REAL DEFAULT 0,
  signals TEXT DEFAULT '{}',
  url TEXT DEFAULT '',
  path TEXT DEFAULT '',
  site TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  country TEXT DEFAULT '',
  asn INTEGER DEFAULT 0,
  as_org TEXT DEFAULT '',
  action TEXT DEFAULT 'log',
  ts INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_threats_type ON threats(threat_type, ts);
CREATE INDEX IF NOT EXISTS idx_threats_site ON threats(site, ts);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vid TEXT DEFAULT '',
  sid TEXT DEFAULT '',
  site TEXT DEFAULT '',
  page_path TEXT DEFAULT '',
  name TEXT NOT NULL,
  initiator_type TEXT DEFAULT '',
  duration REAL DEFAULT 0,
  transfer_size INTEGER DEFAULT 0,
  encoded_size INTEGER DEFAULT 0,
  decoded_size INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0,
  ts INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_resources_site ON resources(site, page_path, ts);
CREATE INDEX IF NOT EXISTS idx_resources_failed ON resources(failed, ts);

-- Navigation paths table
CREATE TABLE IF NOT EXISTS paths (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sid TEXT NOT NULL,
  vid TEXT NOT NULL,
  site TEXT DEFAULT '',
  step INTEGER NOT NULL,
  path TEXT NOT NULL,
  title TEXT DEFAULT '',
  referrer TEXT DEFAULT '',
  time_on_page INTEGER DEFAULT 0,
  scroll_depth INTEGER DEFAULT 0,
  interactions INTEGER DEFAULT 0,
  ts INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_paths_sid ON paths(sid, step);
CREATE INDEX IF NOT EXISTS idx_paths_site_path ON paths(site, path);

-- Daily aggregates table
CREATE TABLE IF NOT EXISTS daily_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day TEXT NOT NULL,
  site TEXT NOT NULL,
  pageviews INTEGER DEFAULT 0,
  visitors INTEGER DEFAULT 0,
  sessions INTEGER DEFAULT 0,
  new_visitors INTEGER DEFAULT 0,
  returning_visitors INTEGER DEFAULT 0,
  bounces INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue REAL DEFAULT 0,
  avg_session_duration REAL DEFAULT 0,
  avg_pages_per_session REAL DEFAULT 0,
  avg_scroll_depth REAL DEFAULT 0,
  avg_engagement_time REAL DEFAULT 0,
  avg_lcp REAL DEFAULT 0,
  avg_fcp REAL DEFAULT 0,
  avg_cls REAL DEFAULT 0,
  avg_inp REAL DEFAULT 0,
  avg_ttfb REAL DEFAULT 0,
  js_errors INTEGER DEFAULT 0,
  resource_errors INTEGER DEFAULT 0,
  bot_hits INTEGER DEFAULT 0,
  blocked_threats INTEGER DEFAULT 0,
  updated_at INTEGER NOT NULL,
  UNIQUE(day, site)
);
CREATE INDEX IF NOT EXISTS idx_daily_day ON daily_stats(day);
CREATE INDEX IF NOT EXISTS idx_daily_site ON daily_stats(site, day);

-- Add new columns to conversions
ALTER TABLE conversions ADD COLUMN fid TEXT DEFAULT '';
ALTER TABLE conversions ADD COLUMN first_touch_source TEXT DEFAULT '';
ALTER TABLE conversions ADD COLUMN last_touch_source TEXT DEFAULT '';
ALTER TABLE conversions ADD COLUMN session_count INTEGER DEFAULT 1;
ALTER TABLE conversions ADD COLUMN days_to_convert INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_conversions_fid ON conversions(fid);

-- Add new columns to contacts
ALTER TABLE contacts ADD COLUMN fid TEXT DEFAULT '';
ALTER TABLE contacts ADD COLUMN sessions INTEGER DEFAULT 1;
ALTER TABLE contacts ADD COLUMN total_time INTEGER DEFAULT 0;
ALTER TABLE contacts ADD COLUMN last_page TEXT DEFAULT '';
ALTER TABLE contacts ADD COLUMN primary_device TEXT DEFAULT '';
ALTER TABLE contacts ADD COLUMN primary_browser TEXT DEFAULT '';
ALTER TABLE contacts ADD COLUMN primary_os TEXT DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_contacts_fid ON contacts(fid);
CREATE INDEX IF NOT EXISTS idx_contacts_score ON contacts(score);
