-- FILE: /srv/blackroad-api/db/migrations/202601160000_marketplace.sql
-- Marketplace Feature: Asset listings, orders, reviews, seller profiles, analytics

PRAGMA foreign_keys = ON;

-- ============================================================================
-- SELLER PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS seller_profiles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'trusted')),
  total_sales INTEGER NOT NULL DEFAULT 0,
  total_earnings_cents INTEGER NOT NULL DEFAULT 0,
  rating_avg REAL DEFAULT 0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
  rating_count INTEGER NOT NULL DEFAULT 0,
  is_suspended INTEGER NOT NULL DEFAULT 0,
  suspension_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_seller_profiles_user ON seller_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_verification ON seller_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_suspended ON seller_profiles(is_suspended);

-- ============================================================================
-- MARKETPLACE LISTINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  seller_id TEXT NOT NULL,
  project_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('3d-model', 'scene', 'building', 'character', 'vehicle', 'nature', 'prop', 'material', 'template', 'other')),
  tags TEXT, -- JSON array of tags
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  thumbnail_url TEXT,
  preview_images TEXT, -- JSON array of image URLs
  preview_3d_url TEXT, -- Reality Engine scene export URL
  file_url TEXT, -- Downloadable asset URL
  file_size_bytes INTEGER,
  is_public INTEGER NOT NULL DEFAULT 1,
  is_featured INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  purchase_count INTEGER NOT NULL DEFAULT 0,
  rating_avg REAL DEFAULT 0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
  rating_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'suspended')),
  rejection_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  published_at TEXT,
  FOREIGN KEY (seller_id) REFERENCES seller_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category ON marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_created ON marketplace_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_featured ON marketplace_listings(is_featured);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_public ON marketplace_listings(is_public);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_rating ON marketplace_listings(rating_avg DESC);

CREATE TRIGGER IF NOT EXISTS marketplace_listings_updated BEFORE UPDATE ON marketplace_listings
BEGIN
  UPDATE marketplace_listings SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================================================
-- MARKETPLACE ORDERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS marketplace_orders (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  buyer_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  platform_fee_cents INTEGER NOT NULL DEFAULT 0,
  seller_payout_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
  payment_id TEXT,
  stripe_payment_intent_id TEXT,
  license_type TEXT NOT NULL DEFAULT 'personal' CHECK (license_type IN ('personal', 'commercial', 'extended')),
  license_key TEXT UNIQUE,
  license_expires_at TEXT,
  download_count INTEGER NOT NULL DEFAULT 0,
  max_downloads INTEGER DEFAULT -1, -- -1 = unlimited
  refund_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  refunded_at TEXT,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES seller_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_marketplace_orders_buyer ON marketplace_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_seller ON marketplace_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_listing ON marketplace_orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_status ON marketplace_orders(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_created ON marketplace_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_license_key ON marketplace_orders(license_key);

CREATE TRIGGER IF NOT EXISTS marketplace_orders_updated BEFORE UPDATE ON marketplace_orders
BEGIN
  UPDATE marketplace_orders SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================================================
-- MARKETPLACE REVIEWS
-- ============================================================================
CREATE TABLE IF NOT EXISTS marketplace_reviews (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  order_id TEXT NOT NULL UNIQUE, -- One review per order
  reviewer_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  is_verified_purchase INTEGER NOT NULL DEFAULT 1,
  is_flagged INTEGER NOT NULL DEFAULT 0,
  flag_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (order_id) REFERENCES marketplace_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES seller_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_listing ON marketplace_reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_seller ON marketplace_reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_reviewer ON marketplace_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_rating ON marketplace_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_created ON marketplace_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_flagged ON marketplace_reviews(is_flagged);

CREATE TRIGGER IF NOT EXISTS marketplace_reviews_updated BEFORE UPDATE ON marketplace_reviews
BEGIN
  UPDATE marketplace_reviews SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================================================
-- MARKETPLACE ANALYTICS
-- ============================================================================
CREATE TABLE IF NOT EXISTS marketplace_analytics (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  listing_id TEXT,
  seller_id TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'download', 'purchase', 'favorite', 'share')),
  user_id TEXT,
  session_id TEXT,
  referrer TEXT,
  metadata TEXT, -- JSON for additional data
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (listing_id) REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES seller_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_marketplace_analytics_listing ON marketplace_analytics(listing_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_analytics_seller ON marketplace_analytics(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_analytics_event ON marketplace_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_marketplace_analytics_user ON marketplace_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_analytics_created ON marketplace_analytics(created_at DESC);

-- ============================================================================
-- MARKETPLACE FAVORITES (Wishlist)
-- ============================================================================
CREATE TABLE IF NOT EXISTS marketplace_favorites (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  UNIQUE(user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_favorites_user ON marketplace_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_favorites_listing ON marketplace_favorites(listing_id);

-- ============================================================================
-- MARKETPLACE SELLER EARNINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS marketplace_earnings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  seller_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL,
  net_amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'processing', 'paid', 'held')),
  payout_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  available_at TEXT,
  paid_at TEXT,
  FOREIGN KEY (seller_id) REFERENCES seller_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES marketplace_orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_marketplace_earnings_seller ON marketplace_earnings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_earnings_status ON marketplace_earnings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_earnings_order ON marketplace_earnings(order_id);

-- ============================================================================
-- MARKETPLACE PAYOUTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS marketplace_payouts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  seller_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  stripe_transfer_id TEXT,
  payment_method TEXT, -- 'stripe', 'paypal', 'bank_transfer', etc.
  payment_details TEXT, -- JSON with masked account info
  failure_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  FOREIGN KEY (seller_id) REFERENCES seller_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_marketplace_payouts_seller ON marketplace_payouts(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_payouts_status ON marketplace_payouts(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_payouts_created ON marketplace_payouts(created_at DESC);

-- ============================================================================
-- VIEWS FOR ANALYTICS & REPORTING
-- ============================================================================

-- Seller Dashboard Summary
DROP VIEW IF EXISTS marketplace_seller_summary;
CREATE VIEW marketplace_seller_summary AS
SELECT
  sp.id AS seller_id,
  sp.user_id,
  sp.display_name,
  sp.verification_status,
  sp.total_sales,
  sp.total_earnings_cents,
  sp.rating_avg,
  sp.rating_count,
  COUNT(DISTINCT ml.id) AS listing_count,
  COUNT(DISTINCT CASE WHEN ml.status = 'approved' THEN ml.id END) AS active_listing_count,
  COALESCE(SUM(CASE WHEN me.status = 'available' THEN me.net_amount_cents ELSE 0 END), 0) AS available_balance_cents,
  COALESCE(SUM(CASE WHEN me.status = 'pending' THEN me.net_amount_cents ELSE 0 END), 0) AS pending_balance_cents
FROM seller_profiles sp
LEFT JOIN marketplace_listings ml ON ml.seller_id = sp.id
LEFT JOIN marketplace_earnings me ON me.seller_id = sp.id
GROUP BY sp.id, sp.user_id, sp.display_name, sp.verification_status, sp.total_sales, sp.total_earnings_cents, sp.rating_avg, sp.rating_count;

-- Trending Listings (last 7 days)
DROP VIEW IF EXISTS marketplace_trending_listings;
CREATE VIEW marketplace_trending_listings AS
SELECT
  ml.id,
  ml.title,
  ml.category,
  ml.price_cents,
  ml.rating_avg,
  ml.thumbnail_url,
  ml.seller_id,
  COUNT(DISTINCT ma.id) FILTER (WHERE ma.event_type = 'view' AND ma.created_at > datetime('now', '-7 days')) AS recent_views,
  COUNT(DISTINCT ma.id) FILTER (WHERE ma.event_type = 'purchase' AND ma.created_at > datetime('now', '-7 days')) AS recent_purchases
FROM marketplace_listings ml
LEFT JOIN marketplace_analytics ma ON ma.listing_id = ml.id
WHERE ml.status = 'approved' AND ml.is_public = 1
GROUP BY ml.id, ml.title, ml.category, ml.price_cents, ml.rating_avg, ml.thumbnail_url, ml.seller_id
HAVING recent_views > 0 OR recent_purchases > 0
ORDER BY (recent_purchases * 10 + recent_views) DESC;

-- Top Sellers
DROP VIEW IF EXISTS marketplace_top_sellers;
CREATE VIEW marketplace_top_sellers AS
SELECT
  sp.id,
  sp.display_name,
  sp.avatar_url,
  sp.verification_status,
  sp.total_sales,
  sp.total_earnings_cents,
  sp.rating_avg,
  sp.rating_count,
  COUNT(DISTINCT ml.id) AS listing_count
FROM seller_profiles sp
LEFT JOIN marketplace_listings ml ON ml.seller_id = sp.id AND ml.status = 'approved'
WHERE sp.is_suspended = 0
GROUP BY sp.id, sp.display_name, sp.avatar_url, sp.verification_status, sp.total_sales, sp.total_earnings_cents, sp.rating_avg, sp.rating_count
ORDER BY sp.total_sales DESC, sp.rating_avg DESC;
