-- BlackRoad Signup — User accounts
-- Runs in the same D1 as BlackBoard (blackboard)

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT DEFAULT '',
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  -- Plan
  plan TEXT DEFAULT 'operator',  -- operator, pro, sovereign, enterprise
  free_month INTEGER DEFAULT 0,  -- 1 if free month granted
  free_month_expires INTEGER DEFAULT 0,  -- timestamp when free month ends
  device_promo INTEGER DEFAULT 0,  -- 1 if 6-month device promo
  device_promo_expires INTEGER DEFAULT 0,
  -- Node
  node_id TEXT DEFAULT '',  -- assigned hosted node ID
  node_status TEXT DEFAULT 'pending',  -- pending, provisioning, active, suspended
  -- Referral
  referral TEXT DEFAULT '',
  utm_source TEXT DEFAULT '',
  utm_medium TEXT DEFAULT '',
  utm_campaign TEXT DEFAULT '',
  -- Status
  status TEXT DEFAULT 'active',  -- active, suspended, churned
  email_verified INTEGER DEFAULT 0,
  -- Timestamps
  created_at INTEGER NOT NULL,
  last_login INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at);
