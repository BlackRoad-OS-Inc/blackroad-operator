-- BlackBoard v2 — Sovereign Analytics Schema (Enhanced)
-- D1 database: blackboard
-- (c) 2026 BlackRoad OS, Inc.
-- "If it hits us, it's known."

-- ═══════════════════════════════════════════════════════════
-- EVENTS — All pageviews, clicks, custom events, email opens
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL DEFAULT 'pageview',
  url TEXT DEFAULT '',
  path TEXT DEFAULT '',
  title TEXT DEFAULT '',
  referrer TEXT DEFAULT '',
  -- Visitor identity
  vid TEXT DEFAULT '',
  sid TEXT DEFAULT '',
  fid TEXT DEFAULT '',       -- fingerprint ID (cross-session)
  -- Geo (from Cloudflare headers)
  country TEXT DEFAULT '',
  region TEXT DEFAULT '',
  city TEXT DEFAULT '',
  postal TEXT DEFAULT '',
  latitude REAL DEFAULT 0,
  longitude REAL DEFAULT 0,
  timezone TEXT DEFAULT '',
  asn INTEGER DEFAULT 0,
  as_org TEXT DEFAULT '',
  -- Network
  colo TEXT DEFAULT '',      -- CF datacenter colo code
  tls_version TEXT DEFAULT '',
  http_protocol TEXT DEFAULT '',
  -- Device
  browser TEXT DEFAULT '',
  browser_version TEXT DEFAULT '',
  os TEXT DEFAULT '',
  os_version TEXT DEFAULT '',
  device_type TEXT DEFAULT '',
  screen TEXT DEFAULT '',
  viewport TEXT DEFAULT '',
  pixel_ratio REAL DEFAULT 1,
  color_depth INTEGER DEFAULT 24,
  -- Hardware
  cpu_cores INTEGER DEFAULT 0,
  memory_gb REAL DEFAULT 0,
  gpu TEXT DEFAULT '',
  gpu_vendor TEXT DEFAULT '',
  max_touch_points INTEGER DEFAULT 0,
  -- Connection
  connection_type TEXT DEFAULT '',  -- 4g, 3g, wifi, etc
  downlink REAL DEFAULT 0,
  rtt INTEGER DEFAULT 0,
  save_data INTEGER DEFAULT 0,
  -- Language/Locale
  language TEXT DEFAULT '',
  languages TEXT DEFAULT '',
  -- UTM / Attribution
  utm_source TEXT DEFAULT '',
  utm_medium TEXT DEFAULT '',
  utm_campaign TEXT DEFAULT '',
  utm_term TEXT DEFAULT '',
  utm_content TEXT DEFAULT '',
  ref_code TEXT DEFAULT '',
  gclid TEXT DEFAULT '',
  fbclid TEXT DEFAULT '',
  msclkid TEXT DEFAULT '',
  ttclid TEXT DEFAULT '',     -- TikTok click ID
  li_fat_id TEXT DEFAULT '',  -- LinkedIn click ID
  -- Detection flags
  is_bot INTEGER DEFAULT 0,
  bot_score REAL DEFAULT 0,   -- 0 = human, 1 = definitely bot
  has_adblock INTEGER DEFAULT 0,
  has_dnt INTEGER DEFAULT 0,
  is_incognito INTEGER DEFAULT 0,
  -- Engagement
  scroll_depth INTEGER DEFAULT 0,
  time_on_page INTEGER DEFAULT 0,
  engagement_time INTEGER DEFAULT 0,  -- actual visible time
  -- Custom event properties
  props TEXT DEFAULT '{}',
  -- Site
  site TEXT DEFAULT '',
  -- Timing
  ts INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts);
CREATE INDEX IF NOT EXISTS idx_events_type_ts ON events(type, ts);
CREATE INDEX IF NOT EXISTS idx_events_site_ts ON events(site, ts);
CREATE INDEX IF NOT EXISTS idx_events_vid ON events(vid);
CREATE INDEX IF NOT EXISTS idx_events_fid ON events(fid);
CREATE INDEX IF NOT EXISTS idx_events_sid ON events(sid);
CREATE INDEX IF NOT EXISTS idx_events_path ON events(path);
CREATE INDEX IF NOT EXISTS idx_events_utm ON events(utm_source, utm_medium, utm_campaign);
CREATE INDEX IF NOT EXISTS idx_events_country ON events(country);
CREATE INDEX IF NOT EXISTS idx_events_bot ON events(is_bot, ts);
CREATE INDEX IF NOT EXISTS idx_events_site_path ON events(site, path, ts);

-- ═══════════════════════════════════════════════════════════
-- SESSIONS — Full session lifecycle tracking
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sid TEXT UNIQUE NOT NULL,
  vid TEXT NOT NULL,
  fid TEXT DEFAULT '',
  -- Entry
  entry_url TEXT DEFAULT '',
  entry_path TEXT DEFAULT '',
  entry_referrer TEXT DEFAULT '',
  -- Attribution (first-touch for session)
  utm_source TEXT DEFAULT '',
  utm_medium TEXT DEFAULT '',
  utm_campaign TEXT DEFAULT '',
  -- Exit
  exit_url TEXT DEFAULT '',
  exit_path TEXT DEFAULT '',
  -- Metrics
  pageviews INTEGER DEFAULT 1,
  events INTEGER DEFAULT 0,
  max_scroll_depth INTEGER DEFAULT 0,
  engagement_time INTEGER DEFAULT 0,   -- ms of actual engagement
  total_time INTEGER DEFAULT 0,        -- ms from start to last event
  -- Flags
  is_bounce INTEGER DEFAULT 1,         -- 1 if only 1 pageview
  converted INTEGER DEFAULT 0,
  -- Geo
  country TEXT DEFAULT '',
  city TEXT DEFAULT '',
  -- Device
  device_type TEXT DEFAULT '',
  browser TEXT DEFAULT '',
  os TEXT DEFAULT '',
  -- Engagement scoring
  engagement_score INTEGER DEFAULT 0,
  interaction_count INTEGER DEFAULT 0,
  -- Site
  site TEXT DEFAULT '',
  -- Timing
  started_at INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  ended_at INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sessions_sid ON sessions(sid);
CREATE INDEX IF NOT EXISTS idx_sessions_vid ON sessions(vid);
CREATE INDEX IF NOT EXISTS idx_sessions_started ON sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_site ON sessions(site, started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_bounce ON sessions(is_bounce, started_at);

-- ═══════════════════════════════════════════════════════════
-- FINGERPRINTS — Cross-session device identification
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS fingerprints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fid TEXT UNIQUE NOT NULL,
  -- Components
  canvas_hash TEXT DEFAULT '',
  webgl_hash TEXT DEFAULT '',
  audio_hash TEXT DEFAULT '',
  font_hash TEXT DEFAULT '',
  -- Hardware signature
  screen TEXT DEFAULT '',
  color_depth INTEGER DEFAULT 0,
  pixel_ratio REAL DEFAULT 0,
  cpu_cores INTEGER DEFAULT 0,
  memory_gb REAL DEFAULT 0,
  max_touch INTEGER DEFAULT 0,
  gpu TEXT DEFAULT '',
  gpu_vendor TEXT DEFAULT '',
  -- Software signature
  platform TEXT DEFAULT '',
  language TEXT DEFAULT '',
  timezone TEXT DEFAULT '',
  timezone_offset INTEGER DEFAULT 0,
  -- Browser features
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
  -- Math quirks (browser engine detection)
  math_tan TEXT DEFAULT '',
  math_sinh TEXT DEFAULT '',
  -- Plugin/MIME data
  plugin_count INTEGER DEFAULT 0,
  mime_count INTEGER DEFAULT 0,
  -- Storage
  has_localstorage INTEGER DEFAULT 0,
  has_sessionstorage INTEGER DEFAULT 0,
  has_indexeddb INTEGER DEFAULT 0,
  has_cookies INTEGER DEFAULT 0,
  -- Media
  media_devices_count INTEGER DEFAULT 0,
  -- Entropy score (uniqueness 0-100)
  entropy REAL DEFAULT 0,
  -- First and last seen
  first_seen INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  visit_count INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_fp_fid ON fingerprints(fid);
CREATE INDEX IF NOT EXISTS idx_fp_canvas ON fingerprints(canvas_hash);
CREATE INDEX IF NOT EXISTS idx_fp_entropy ON fingerprints(entropy);

-- ═══════════════════════════════════════════════════════════
-- PERFORMANCE — Core Web Vitals & page load metrics
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS performance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vid TEXT NOT NULL,
  sid TEXT DEFAULT '',
  url TEXT DEFAULT '',
  path TEXT DEFAULT '',
  site TEXT DEFAULT '',
  -- Navigation timing
  dns_time REAL DEFAULT 0,        -- ms
  tcp_time REAL DEFAULT 0,
  tls_time REAL DEFAULT 0,
  ttfb REAL DEFAULT 0,            -- Time to First Byte
  response_time REAL DEFAULT 0,
  dom_interactive REAL DEFAULT 0,
  dom_complete REAL DEFAULT 0,
  load_time REAL DEFAULT 0,
  -- Core Web Vitals
  fcp REAL DEFAULT 0,             -- First Contentful Paint
  lcp REAL DEFAULT 0,             -- Largest Contentful Paint
  fid REAL DEFAULT 0,             -- First Input Delay
  inp REAL DEFAULT 0,             -- Interaction to Next Paint
  cls REAL DEFAULT 0,             -- Cumulative Layout Shift
  ttfb_vital REAL DEFAULT 0,     -- TTFB (web vital version)
  -- Paint timing
  fp REAL DEFAULT 0,              -- First Paint
  -- Resource counts
  resource_count INTEGER DEFAULT 0,
  transfer_size INTEGER DEFAULT 0,     -- total bytes transferred
  decoded_size INTEGER DEFAULT 0,      -- total decoded size
  -- JS heap
  js_heap_used INTEGER DEFAULT 0,
  js_heap_total INTEGER DEFAULT 0,
  -- Connection
  connection_type TEXT DEFAULT '',
  effective_type TEXT DEFAULT '',
  downlink REAL DEFAULT 0,
  rtt INTEGER DEFAULT 0,
  -- Device context
  device_type TEXT DEFAULT '',
  country TEXT DEFAULT '',
  -- Timestamp
  ts INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_perf_path ON performance(path, ts);
CREATE INDEX IF NOT EXISTS idx_perf_site ON performance(site, ts);
CREATE INDEX IF NOT EXISTS idx_perf_lcp ON performance(lcp);
CREATE INDEX IF NOT EXISTS idx_perf_cls ON performance(cls);

-- ═══════════════════════════════════════════════════════════
-- ERRORS — JavaScript errors, resource failures, CSP violations
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS errors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vid TEXT DEFAULT '',
  sid TEXT DEFAULT '',
  site TEXT DEFAULT '',
  url TEXT DEFAULT '',
  path TEXT DEFAULT '',
  -- Error details
  error_type TEXT NOT NULL,       -- js_error, resource_error, unhandled_rejection, csp_violation
  message TEXT DEFAULT '',
  source TEXT DEFAULT '',         -- file URL
  lineno INTEGER DEFAULT 0,
  colno INTEGER DEFAULT 0,
  stack TEXT DEFAULT '',
  -- Context
  browser TEXT DEFAULT '',
  os TEXT DEFAULT '',
  device_type TEXT DEFAULT '',
  country TEXT DEFAULT '',
  -- Frequency
  count INTEGER DEFAULT 1,
  -- Timestamp
  ts INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_errors_type ON errors(error_type, ts);
CREATE INDEX IF NOT EXISTS idx_errors_site ON errors(site, ts);
CREATE INDEX IF NOT EXISTS idx_errors_message ON errors(message);

-- ═══════════════════════════════════════════════════════════
-- INTERACTIONS — Clicks, scrolls, forms, rage clicks, dead clicks
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS interactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vid TEXT DEFAULT '',
  sid TEXT DEFAULT '',
  site TEXT DEFAULT '',
  url TEXT DEFAULT '',
  path TEXT DEFAULT '',
  -- Interaction type
  type TEXT NOT NULL,              -- click, rage_click, dead_click, scroll, form_start, form_submit, form_abandon, copy, paste, print, select_text, exit_intent, tab_hidden, tab_visible, resize
  -- Click data
  target_tag TEXT DEFAULT '',      -- element tag
  target_id TEXT DEFAULT '',       -- element id
  target_class TEXT DEFAULT '',    -- element classes
  target_text TEXT DEFAULT '',     -- first 100 chars of visible text
  target_href TEXT DEFAULT '',     -- link destination
  x INTEGER DEFAULT 0,
  y INTEGER DEFAULT 0,
  viewport_x INTEGER DEFAULT 0,
  viewport_y INTEGER DEFAULT 0,
  -- Scroll data
  scroll_depth INTEGER DEFAULT 0,
  scroll_direction TEXT DEFAULT '',  -- up, down
  -- Form data (not values! just field names and timing)
  form_id TEXT DEFAULT '',
  form_action TEXT DEFAULT '',
  field_name TEXT DEFAULT '',
  field_type TEXT DEFAULT '',
  time_in_field INTEGER DEFAULT 0,
  -- Selection
  selected_length INTEGER DEFAULT 0,
  -- Metadata
  props TEXT DEFAULT '{}',
  -- Timestamp
  ts INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions(type, ts);
CREATE INDEX IF NOT EXISTS idx_interactions_site ON interactions(site, path, ts);
CREATE INDEX IF NOT EXISTS idx_interactions_vid ON interactions(vid, ts);

-- ═══════════════════════════════════════════════════════════
-- HEATMAP — Click coordinate data for visual overlays
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS heatmap (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site TEXT NOT NULL,
  path TEXT NOT NULL,
  -- Normalized coordinates (0-10000 scale for viewport-independent)
  x INTEGER NOT NULL,        -- 0-10000
  y INTEGER NOT NULL,        -- 0-10000
  -- Actual coordinates
  page_x INTEGER DEFAULT 0,
  page_y INTEGER DEFAULT 0,
  -- Viewport at time of click
  viewport_w INTEGER DEFAULT 0,
  viewport_h INTEGER DEFAULT 0,
  page_h INTEGER DEFAULT 0,
  -- Metadata
  device_type TEXT DEFAULT '',
  target_tag TEXT DEFAULT '',
  -- Timestamp
  ts INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_heatmap_path ON heatmap(site, path, ts);
CREATE INDEX IF NOT EXISTS idx_heatmap_device ON heatmap(device_type, site, path);

-- ═══════════════════════════════════════════════════════════
-- THREATS — Bot detection, abuse, anomalies
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS threats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vid TEXT DEFAULT '',
  ip_hash TEXT DEFAULT '',
  -- Classification
  threat_type TEXT NOT NULL,     -- bot, scraper, spam, brute_force, anomaly, headless, automated
  confidence REAL DEFAULT 0,    -- 0-1
  -- Evidence
  signals TEXT DEFAULT '{}',    -- JSON of detection signals
  -- Request info
  url TEXT DEFAULT '',
  path TEXT DEFAULT '',
  site TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  -- Geo
  country TEXT DEFAULT '',
  asn INTEGER DEFAULT 0,
  as_org TEXT DEFAULT '',
  -- Action taken
  action TEXT DEFAULT 'log',    -- log, challenge, block
  -- Timestamp
  ts INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_threats_type ON threats(threat_type, ts);
CREATE INDEX IF NOT EXISTS idx_threats_ip ON threats(ip_hash, ts);
CREATE INDEX IF NOT EXISTS idx_threats_site ON threats(site, ts);
CREATE INDEX IF NOT EXISTS idx_threats_confidence ON threats(confidence);

-- ═══════════════════════════════════════════════════════════
-- RESOURCE TIMING — Individual resource load performance
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vid TEXT DEFAULT '',
  sid TEXT DEFAULT '',
  site TEXT DEFAULT '',
  page_path TEXT DEFAULT '',
  -- Resource info
  name TEXT NOT NULL,            -- URL
  initiator_type TEXT DEFAULT '',  -- script, css, img, fetch, xmlhttprequest
  -- Timing
  duration REAL DEFAULT 0,
  transfer_size INTEGER DEFAULT 0,
  encoded_size INTEGER DEFAULT 0,
  decoded_size INTEGER DEFAULT 0,
  -- Status
  status INTEGER DEFAULT 200,
  failed INTEGER DEFAULT 0,
  -- Timestamp
  ts INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_resources_site ON resources(site, page_path, ts);
CREATE INDEX IF NOT EXISTS idx_resources_failed ON resources(failed, ts);
CREATE INDEX IF NOT EXISTS idx_resources_duration ON resources(duration);

-- ═══════════════════════════════════════════════════════════
-- CONVERSIONS (unchanged from v1)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS conversions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vid TEXT NOT NULL,
  fid TEXT DEFAULT '',
  event TEXT NOT NULL,
  value REAL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  utm_source TEXT DEFAULT '',
  utm_medium TEXT DEFAULT '',
  utm_campaign TEXT DEFAULT '',
  -- Multi-touch attribution
  first_touch_source TEXT DEFAULT '',
  last_touch_source TEXT DEFAULT '',
  session_count INTEGER DEFAULT 1,
  days_to_convert INTEGER DEFAULT 0,
  -- Site
  site TEXT DEFAULT '',
  ts INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_conversions_ts ON conversions(ts);
CREATE INDEX IF NOT EXISTS idx_conversions_utm ON conversions(utm_source, utm_campaign);
CREATE INDEX IF NOT EXISTS idx_conversions_event ON conversions(event);
CREATE INDEX IF NOT EXISTS idx_conversions_fid ON conversions(fid);

-- ═══════════════════════════════════════════════════════════
-- CONTACTS — CRM (enhanced from v1)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vid TEXT DEFAULT '',
  fid TEXT DEFAULT '',
  email TEXT UNIQUE NOT NULL,
  name TEXT DEFAULT '',
  company TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  source TEXT DEFAULT 'direct',
  utm_source TEXT DEFAULT '',
  utm_medium TEXT DEFAULT '',
  utm_campaign TEXT DEFAULT '',
  country TEXT DEFAULT '',
  city TEXT DEFAULT '',
  -- Enhanced engagement
  page_views INTEGER DEFAULT 1,
  sessions INTEGER DEFAULT 1,
  total_time INTEGER DEFAULT 0,
  last_page TEXT DEFAULT '',
  -- Scoring
  score INTEGER DEFAULT 0,
  stage TEXT DEFAULT 'lead',
  -- Device profile
  primary_device TEXT DEFAULT '',
  primary_browser TEXT DEFAULT '',
  primary_os TEXT DEFAULT '',
  -- Props
  props TEXT DEFAULT '{}',
  tags TEXT DEFAULT '',
  -- Timestamps
  first_seen INTEGER NOT NULL,
  last_seen INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_fid ON contacts(fid);
CREATE INDEX IF NOT EXISTS idx_contacts_source ON contacts(source);
CREATE INDEX IF NOT EXISTS idx_contacts_stage ON contacts(stage);
CREATE INDEX IF NOT EXISTS idx_contacts_last_seen ON contacts(last_seen);
CREATE INDEX IF NOT EXISTS idx_contacts_score ON contacts(score);

-- ═══════════════════════════════════════════════════════════
-- CAMPAIGNS (unchanged from v1)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'email',
  utm_source TEXT DEFAULT '',
  utm_medium TEXT DEFAULT '',
  utm_campaign TEXT DEFAULT '',
  budget REAL DEFAULT 0,
  spent REAL DEFAULT 0,
  status TEXT DEFAULT 'draft',
  subject TEXT DEFAULT '',
  body TEXT DEFAULT '',
  created_at INTEGER NOT NULL,
  started_at INTEGER DEFAULT 0,
  ended_at INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_utm ON campaigns(utm_campaign);

-- ═══════════════════════════════════════════════════════════
-- NAVIGATION PATHS — Session journey reconstruction
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS paths (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sid TEXT NOT NULL,
  vid TEXT NOT NULL,
  site TEXT DEFAULT '',
  step INTEGER NOT NULL,       -- 1, 2, 3...
  path TEXT NOT NULL,
  title TEXT DEFAULT '',
  referrer TEXT DEFAULT '',
  time_on_page INTEGER DEFAULT 0,
  scroll_depth INTEGER DEFAULT 0,
  interactions INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  ts INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_paths_sid ON paths(sid, step);
CREATE INDEX IF NOT EXISTS idx_paths_site_path ON paths(site, path);

-- ═══════════════════════════════════════════════════════════
-- DAILY AGGREGATES — Pre-computed for fast dashboard queries
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS daily_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day TEXT NOT NULL,           -- YYYY-MM-DD
  site TEXT NOT NULL,
  -- Counts
  pageviews INTEGER DEFAULT 0,
  visitors INTEGER DEFAULT 0,
  sessions INTEGER DEFAULT 0,
  new_visitors INTEGER DEFAULT 0,
  returning_visitors INTEGER DEFAULT 0,
  bounces INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue REAL DEFAULT 0,
  -- Engagement
  avg_session_duration REAL DEFAULT 0,
  avg_pages_per_session REAL DEFAULT 0,
  avg_scroll_depth REAL DEFAULT 0,
  avg_engagement_time REAL DEFAULT 0,
  -- Performance
  avg_lcp REAL DEFAULT 0,
  avg_fcp REAL DEFAULT 0,
  avg_cls REAL DEFAULT 0,
  avg_inp REAL DEFAULT 0,
  avg_ttfb REAL DEFAULT 0,
  -- Errors
  js_errors INTEGER DEFAULT 0,
  resource_errors INTEGER DEFAULT 0,
  -- Threats
  bot_hits INTEGER DEFAULT 0,
  blocked_threats INTEGER DEFAULT 0,
  -- Timestamp
  updated_at INTEGER NOT NULL,
  UNIQUE(day, site)
);

CREATE INDEX IF NOT EXISTS idx_daily_day ON daily_stats(day);
CREATE INDEX IF NOT EXISTS idx_daily_site ON daily_stats(site, day);
