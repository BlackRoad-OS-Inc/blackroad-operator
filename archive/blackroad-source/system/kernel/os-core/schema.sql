-- BlackRoad Payment Gateway - D1 Schema
-- Database: blackroad_revenue

-- Revenue tracking table (existing)
CREATE TABLE IF NOT EXISTS revenue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  tier_id TEXT,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'usd',
  created_at TEXT NOT NULL,
  metadata TEXT
);

CREATE INDEX IF NOT EXISTS idx_revenue_user ON revenue(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_created ON revenue(created_at);

-- Subscription tracking table
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  tier_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TEXT,
  cancel_at_period_end INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sub_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_sub_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_sub_status ON subscriptions(status);

-- Webhook event idempotency table
CREATE TABLE IF NOT EXISTS webhook_events (
  stripe_event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TEXT NOT NULL,
  success INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_webhook_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_processed ON webhook_events(processed_at);
