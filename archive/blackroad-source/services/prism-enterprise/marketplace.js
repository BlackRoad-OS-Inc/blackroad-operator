'use strict';

const express = require('express');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../auth');
const crypto = require('crypto');
const upload = require('../utils/upload');

const router = express.Router();

// =============================================================================
// UTILITIES
// =============================================================================

function generateId() {
  return crypto.randomBytes(16).toString('hex');
}

function generateLicenseKey() {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    segments.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return segments.join('-');
}

function calculatePlatformFee(amountCents, userRole = 'user') {
  // Platform fee varies by subscription tier
  const feeRates = {
    basic: 0.30,      // 30% for free users
    premium: 0.20,    // 20% for premium
    pro: 0.10,        // 10% for pro
    admin: 0.05,      // 5% for admins (special rate)
  };
  const rate = feeRates[userRole] || feeRates.basic;
  return Math.floor(amountCents * rate);
}

function trackAnalytics(listingId, sellerId, eventType, userId = null) {
  try {
    db.prepare(`
      INSERT INTO marketplace_analytics (id, listing_id, seller_id, event_type, user_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(generateId(), listingId, sellerId, eventType, userId);
  } catch (err) {
    console.error('Analytics tracking error:', err);
  }
}

// =============================================================================
// SELLER PROFILE ENDPOINTS
// =============================================================================

// Become a seller (create seller profile)
router.post('/seller/register', requireAuth, (req, res) => {
  const { displayName, bio } = req.body || {};

  // Check if already a seller
  const existing = db.prepare('SELECT id FROM seller_profiles WHERE user_id = ?').get(req.user.id);
  if (existing) {
    return res.status(409).json({ ok: false, error: 'already_seller' });
  }

  const sellerId = generateId();
  db.prepare(`
    INSERT INTO seller_profiles (id, user_id, display_name, bio)
    VALUES (?, ?, ?, ?)
  `).run(sellerId, req.user.id, displayName || null, bio || null);

  const profile = db.prepare('SELECT * FROM seller_profiles WHERE id = ?').get(sellerId);
  res.json({ ok: true, seller: profile });
});

// Get seller profile
router.get('/sellers/:sellerId', (req, res) => {
  const seller = db.prepare('SELECT * FROM seller_profiles WHERE id = ?').get(req.params.sellerId);
  if (!seller) {
    return res.status(404).json({ ok: false, error: 'seller_not_found' });
  }

  // Get seller stats
  const listingCount = db.prepare(
    'SELECT COUNT(*) as count FROM marketplace_listings WHERE seller_id = ? AND status = ?'
  ).get(seller.id, 'approved').count;

  res.json({
    ok: true,
    seller: {
      ...seller,
      listing_count: listingCount
    }
  });
});

// Update seller profile
router.put('/seller/profile', requireAuth, (req, res) => {
  const { displayName, bio, avatarUrl, bannerUrl } = req.body || {};

  const seller = db.prepare('SELECT * FROM seller_profiles WHERE user_id = ?').get(req.user.id);
  if (!seller) {
    return res.status(404).json({ ok: false, error: 'not_seller' });
  }

  db.prepare(`
    UPDATE seller_profiles
    SET display_name = COALESCE(?, display_name),
        bio = COALESCE(?, bio),
        avatar_url = COALESCE(?, avatar_url),
        banner_url = COALESCE(?, banner_url),
        updated_at = datetime('now')
    WHERE id = ?
  `).run(displayName || null, bio || null, avatarUrl || null, bannerUrl || null, seller.id);

  const updated = db.prepare('SELECT * FROM seller_profiles WHERE id = ?').get(seller.id);
  res.json({ ok: true, seller: updated });
});

// Get seller analytics
router.get('/seller/analytics', requireAuth, (req, res) => {
  const seller = db.prepare('SELECT * FROM seller_profiles WHERE user_id = ?').get(req.user.id);
  if (!seller) {
    return res.status(404).json({ ok: false, error: 'not_seller' });
  }

  // Get summary from view
  const summary = db.prepare('SELECT * FROM marketplace_seller_summary WHERE seller_id = ?').get(seller.id);

  // Get recent sales
  const recentSales = db.prepare(`
    SELECT mo.*, ml.title as listing_title
    FROM marketplace_orders mo
    JOIN marketplace_listings ml ON ml.id = mo.listing_id
    WHERE mo.seller_id = ? AND mo.status = 'completed'
    ORDER BY mo.created_at DESC
    LIMIT 10
  `).all(seller.id);

  // Get earnings breakdown
  const earnings = db.prepare(`
    SELECT status, SUM(net_amount_cents) as total_cents, COUNT(*) as count
    FROM marketplace_earnings
    WHERE seller_id = ?
    GROUP BY status
  `).all(seller.id);

  res.json({
    ok: true,
    analytics: {
      summary,
      recent_sales: recentSales,
      earnings_breakdown: earnings
    }
  });
});

// =============================================================================
// MARKETPLACE LISTINGS ENDPOINTS
// =============================================================================

// Create new listing
router.post('/listings', requireAuth, (req, res) => {
  const { title, description, category, tags, priceCents, projectId } = req.body || {};

  // Validate required fields
  if (!title || !title.trim()) {
    return res.status(400).json({ ok: false, error: 'missing_title' });
  }
  if (!category) {
    return res.status(400).json({ ok: false, error: 'missing_category' });
  }
  if (priceCents === undefined || priceCents < 0) {
    return res.status(400).json({ ok: false, error: 'invalid_price' });
  }

  // Get seller profile
  const seller = db.prepare('SELECT id FROM seller_profiles WHERE user_id = ?').get(req.user.id);
  if (!seller) {
    return res.status(403).json({ ok: false, error: 'seller_profile_required' });
  }

  const listingId = generateId();
  db.prepare(`
    INSERT INTO marketplace_listings
    (id, seller_id, project_id, title, description, category, tags, price_cents, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft')
  `).run(
    listingId,
    seller.id,
    projectId || null,
    title.trim(),
    description || null,
    category,
    tags ? JSON.stringify(tags) : null,
    priceCents
  );

  const listing = db.prepare('SELECT * FROM marketplace_listings WHERE id = ?').get(listingId);
  res.json({ ok: true, listing });
});

// Get user's listings (seller view)
router.get('/listings', requireAuth, (req, res) => {
  const seller = db.prepare('SELECT id FROM seller_profiles WHERE user_id = ?').get(req.user.id);
  if (!seller) {
    return res.status(403).json({ ok: false, error: 'not_seller' });
  }

  const listings = db.prepare(`
    SELECT * FROM marketplace_listings
    WHERE seller_id = ?
    ORDER BY created_at DESC
  `).all(seller.id);

  res.json({ ok: true, listings });
});

// Get single listing details
router.get('/listings/:id', (req, res) => {
  const listing = db.prepare('SELECT * FROM marketplace_listings WHERE id = ?').get(req.params.id);
  if (!listing) {
    return res.status(404).json({ ok: false, error: 'listing_not_found' });
  }

  // Public listings are visible to all, draft/pending only to owner/admin
  if (listing.status !== 'approved' && listing.is_public !== 1) {
    if (!req.user || (listing.seller_id !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }
  }

  // Get seller info
  const seller = db.prepare('SELECT * FROM seller_profiles WHERE id = ?').get(listing.seller_id);

  // Track view analytics (if authenticated)
  if (req.user) {
    trackAnalytics(listing.id, listing.seller_id, 'view', req.user.id);
  }

  // Increment view count
  db.prepare('UPDATE marketplace_listings SET view_count = view_count + 1 WHERE id = ?').run(listing.id);

  res.json({
    ok: true,
    listing: {
      ...listing,
      tags: listing.tags ? JSON.parse(listing.tags) : [],
      preview_images: listing.preview_images ? JSON.parse(listing.preview_images) : []
    },
    seller
  });
});

// Update listing
router.put('/listings/:id', requireAuth, (req, res) => {
  const { title, description, category, tags, priceCents, thumbnailUrl, preview3dUrl, fileUrl } = req.body || {};

  const listing = db.prepare('SELECT * FROM marketplace_listings WHERE id = ?').get(req.params.id);
  if (!listing) {
    return res.status(404).json({ ok: false, error: 'listing_not_found' });
  }

  // Check ownership
  const seller = db.prepare('SELECT id FROM seller_profiles WHERE user_id = ?').get(req.user.id);
  if (!seller || listing.seller_id !== seller.id) {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }
  }

  db.prepare(`
    UPDATE marketplace_listings
    SET title = COALESCE(?, title),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        tags = COALESCE(?, tags),
        price_cents = COALESCE(?, price_cents),
        thumbnail_url = COALESCE(?, thumbnail_url),
        preview_3d_url = COALESCE(?, preview_3d_url),
        file_url = COALESCE(?, file_url)
    WHERE id = ?
  `).run(
    title || null,
    description || null,
    category || null,
    tags ? JSON.stringify(tags) : null,
    priceCents !== undefined ? priceCents : null,
    thumbnailUrl || null,
    preview3dUrl || null,
    fileUrl || null,
    listing.id
  );

  const updated = db.prepare('SELECT * FROM marketplace_listings WHERE id = ?').get(listing.id);
  res.json({ ok: true, listing: updated });
});

// Delete listing
router.delete('/listings/:id', requireAuth, (req, res) => {
  const listing = db.prepare('SELECT * FROM marketplace_listings WHERE id = ?').get(req.params.id);
  if (!listing) {
    return res.status(404).json({ ok: false, error: 'listing_not_found' });
  }

  const seller = db.prepare('SELECT id FROM seller_profiles WHERE user_id = ?').get(req.user.id);
  if (!seller || listing.seller_id !== seller.id) {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }
  }

  db.prepare('DELETE FROM marketplace_listings WHERE id = ?').run(listing.id);
  res.json({ ok: true });
});

// Publish listing (submit for approval)
router.post('/listings/:id/publish', requireAuth, (req, res) => {
  const listing = db.prepare('SELECT * FROM marketplace_listings WHERE id = ?').get(req.params.id);
  if (!listing) {
    return res.status(404).json({ ok: false, error: 'listing_not_found' });
  }

  const seller = db.prepare('SELECT id FROM seller_profiles WHERE user_id = ?').get(req.user.id);
  if (!seller || listing.seller_id !== seller.id) {
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }

  // Validate listing is ready
  if (!listing.thumbnail_url || !listing.file_url) {
    return res.status(400).json({ ok: false, error: 'incomplete_listing' });
  }

  // Auto-approve for verified sellers, otherwise pending
  const newStatus = seller.verification_status === 'verified' ? 'approved' : 'pending';

  db.prepare(`
    UPDATE marketplace_listings
    SET status = ?, published_at = datetime('now')
    WHERE id = ?
  `).run(newStatus, listing.id);

  const updated = db.prepare('SELECT * FROM marketplace_listings WHERE id = ?').get(listing.id);
  res.json({ ok: true, listing: updated });
});

// =============================================================================
// BROWSE & SEARCH ENDPOINTS
// =============================================================================

// Browse marketplace
router.get('/browse', (req, res) => {
  const { category, minPrice, maxPrice, sortBy, limit = 20, offset = 0 } = req.query;

  let query = 'SELECT * FROM marketplace_listings WHERE status = ? AND is_public = 1';
  const params = ['approved'];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (minPrice) {
    query += ' AND price_cents >= ?';
    params.push(parseInt(minPrice));
  }
  if (maxPrice) {
    query += ' AND price_cents <= ?';
    params.push(parseInt(maxPrice));
  }

  // Sorting
  if (sortBy === 'price_low') {
    query += ' ORDER BY price_cents ASC';
  } else if (sortBy === 'price_high') {
    query += ' ORDER BY price_cents DESC';
  } else if (sortBy === 'rating') {
    query += ' ORDER BY rating_avg DESC';
  } else if (sortBy === 'popular') {
    query += ' ORDER BY purchase_count DESC';
  } else {
    query += ' ORDER BY created_at DESC';
  }

  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const listings = db.prepare(query).all(...params);

  // Get total count for pagination
  let countQuery = 'SELECT COUNT(*) as total FROM marketplace_listings WHERE status = ? AND is_public = 1';
  const countParams = ['approved'];
  if (category) {
    countQuery += ' AND category = ?';
    countParams.push(category);
  }
  const { total } = db.prepare(countQuery).get(...countParams);

  res.json({
    ok: true,
    listings: listings.map(l => ({
      ...l,
      tags: l.tags ? JSON.parse(l.tags) : []
    })),
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: parseInt(offset) + parseInt(limit) < total
    }
  });
});

// Search marketplace
router.get('/search', (req, res) => {
  const { q, category, limit = 20 } = req.query;

  if (!q || !q.trim()) {
    return res.status(400).json({ ok: false, error: 'missing_query' });
  }

  const searchTerm = `%${q.trim()}%`;
  let query = `
    SELECT * FROM marketplace_listings
    WHERE status = 'approved' AND is_public = 1
    AND (title LIKE ? OR description LIKE ?)
  `;
  const params = [searchTerm, searchTerm];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY rating_avg DESC, purchase_count DESC LIMIT ?';
  params.push(parseInt(limit));

  const listings = db.prepare(query).all(...params);
  res.json({ ok: true, listings });
});

// Get categories
router.get('/categories', (req, res) => {
  const categories = [
    { id: '3d-model', name: '3D Models', icon: '🎨' },
    { id: 'scene', name: 'Complete Scenes', icon: '🌆' },
    { id: 'building', name: 'Buildings', icon: '🏢' },
    { id: 'character', name: 'Characters', icon: '🧑' },
    { id: 'vehicle', name: 'Vehicles', icon: '🚗' },
    { id: 'nature', name: 'Nature', icon: '🌳' },
    { id: 'prop', name: 'Props', icon: '📦' },
    { id: 'material', name: 'Materials', icon: '✨' },
    { id: 'template', name: 'Templates', icon: '📋' },
    { id: 'other', name: 'Other', icon: '🔮' }
  ];

  // Get listing counts per category
  const counts = db.prepare(`
    SELECT category, COUNT(*) as count
    FROM marketplace_listings
    WHERE status = 'approved' AND is_public = 1
    GROUP BY category
  `).all();

  const countsMap = {};
  counts.forEach(c => countsMap[c.category] = c.count);

  res.json({
    ok: true,
    categories: categories.map(cat => ({
      ...cat,
      count: countsMap[cat.id] || 0
    }))
  });
});

// Get trending listings
router.get('/trending', (req, res) => {
  const { limit = 10 } = req.query;

  const trending = db.prepare(`
    SELECT * FROM marketplace_trending_listings
    LIMIT ?
  `).all(parseInt(limit));

  res.json({ ok: true, listings: trending });
});

// Get featured listings
router.get('/featured', (req, res) => {
  const { limit = 6 } = req.query;

  const featured = db.prepare(`
    SELECT * FROM marketplace_listings
    WHERE status = 'approved' AND is_public = 1 AND is_featured = 1
    ORDER BY rating_avg DESC
    LIMIT ?
  `).all(parseInt(limit));

  res.json({ ok: true, listings: featured });
});

// =============================================================================
// ORDERS & PURCHASING ENDPOINTS
// =============================================================================

// Create order (initiate purchase)
router.post('/orders', requireAuth, (req, res) => {
  const { listingId, licenseType = 'personal' } = req.body || {};

  if (!listingId) {
    return res.status(400).json({ ok: false, error: 'missing_listing_id' });
  }

  const listing = db.prepare('SELECT * FROM marketplace_listings WHERE id = ?').get(listingId);
  if (!listing) {
    return res.status(404).json({ ok: false, error: 'listing_not_found' });
  }
  if (listing.status !== 'approved') {
    return res.status(400).json({ ok: false, error: 'listing_not_available' });
  }

  // Can't buy your own listing
  const seller = db.prepare('SELECT id FROM seller_profiles WHERE user_id = ?').get(req.user.id);
  if (seller && listing.seller_id === seller.id) {
    return res.status(400).json({ ok: false, error: 'cannot_buy_own_listing' });
  }

  // Check if already purchased
  const existingOrder = db.prepare(`
    SELECT id FROM marketplace_orders
    WHERE buyer_id = ? AND listing_id = ? AND status IN ('completed', 'processing')
  `).get(req.user.id, listingId);

  if (existingOrder) {
    return res.status(409).json({ ok: false, error: 'already_purchased' });
  }

  // Calculate fees
  const amountCents = listing.price_cents;
  const platformFeeCents = calculatePlatformFee(amountCents, req.user.role);
  const sellerPayoutCents = amountCents - platformFeeCents;

  // Create order
  const orderId = generateId();
  const licenseKey = generateLicenseKey();

  db.prepare(`
    INSERT INTO marketplace_orders
    (id, buyer_id, listing_id, seller_id, amount_cents, platform_fee_cents,
     seller_payout_cents, license_type, license_key, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(
    orderId,
    req.user.id,
    listingId,
    listing.seller_id,
    amountCents,
    platformFeeCents,
    sellerPayoutCents,
    licenseType,
    licenseKey
  );

  const order = db.prepare('SELECT * FROM marketplace_orders WHERE id = ?').get(orderId);

  // Track analytics
  trackAnalytics(listingId, listing.seller_id, 'purchase', req.user.id);

  res.json({ ok: true, order });
});

// Get order details
router.get('/orders/:id', requireAuth, (req, res) => {
  const order = db.prepare('SELECT * FROM marketplace_orders WHERE id = ?').get(req.params.id);
  if (!order) {
    return res.status(404).json({ ok: false, error: 'order_not_found' });
  }

  // Check ownership (buyer or seller or admin)
  const seller = db.prepare('SELECT id FROM seller_profiles WHERE user_id = ?').get(req.user.id);
  const isBuyer = order.buyer_id === req.user.id;
  const isSeller = seller && order.seller_id === seller.id;
  const isAdmin = req.user.role === 'admin';

  if (!isBuyer && !isSeller && !isAdmin) {
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }

  // Get listing info
  const listing = db.prepare('SELECT * FROM marketplace_listings WHERE id = ?').get(order.listing_id);

  res.json({ ok: true, order, listing });
});

// Get user's orders
router.get('/orders', requireAuth, (req, res) => {
  const { type = 'purchases' } = req.query;

  let orders;
  if (type === 'sales') {
    // Get sales (seller view)
    const seller = db.prepare('SELECT id FROM seller_profiles WHERE user_id = ?').get(req.user.id);
    if (!seller) {
      return res.json({ ok: true, orders: [] });
    }

    orders = db.prepare(`
      SELECT mo.*, ml.title as listing_title, ml.thumbnail_url,
             u.name as buyer_name, u.email as buyer_email
      FROM marketplace_orders mo
      JOIN marketplace_listings ml ON ml.id = mo.listing_id
      JOIN users u ON u.id = mo.buyer_id
      WHERE mo.seller_id = ?
      ORDER BY mo.created_at DESC
    `).all(seller.id);
  } else {
    // Get purchases (buyer view)
    orders = db.prepare(`
      SELECT mo.*, ml.title as listing_title, ml.thumbnail_url
      FROM marketplace_orders mo
      JOIN marketplace_listings ml ON ml.id = mo.listing_id
      WHERE mo.buyer_id = ?
      ORDER BY mo.created_at DESC
    `).all(req.user.id);
  }

  res.json({ ok: true, orders });
});

// Confirm order after payment
router.post('/orders/:id/confirm', requireAuth, (req, res) => {
  const { paymentIntentId } = req.body || {};

  const order = db.prepare('SELECT * FROM marketplace_orders WHERE id = ?').get(req.params.id);
  if (!order) {
    return res.status(404).json({ ok: false, error: 'order_not_found' });
  }
  if (order.buyer_id !== req.user.id) {
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }
  if (order.status !== 'pending') {
    return res.status(400).json({ ok: false, error: 'order_already_processed' });
  }

  // Update order status
  db.prepare(`
    UPDATE marketplace_orders
    SET status = 'completed',
        stripe_payment_intent_id = ?,
        completed_at = datetime('now')
    WHERE id = ?
  `).run(paymentIntentId || null, order.id);

  // Update listing stats
  db.prepare(`
    UPDATE marketplace_listings
    SET purchase_count = purchase_count + 1,
        download_count = download_count + 1
    WHERE id = ?
  `).run(order.listing_id);

  // Update seller stats
  db.prepare(`
    UPDATE seller_profiles
    SET total_sales = total_sales + 1,
        total_earnings_cents = total_earnings_cents + ?
    WHERE id = ?
  `).run(order.seller_payout_cents, order.seller_id);

  // Create earnings record
  const earningId = generateId();
  db.prepare(`
    INSERT INTO marketplace_earnings
    (id, seller_id, order_id, amount_cents, platform_fee_cents, net_amount_cents, status, available_at)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now', '+7 days'))
  `).run(
    earningId,
    order.seller_id,
    order.id,
    order.amount_cents,
    order.platform_fee_cents,
    order.seller_payout_cents
  );

  const updated = db.prepare('SELECT * FROM marketplace_orders WHERE id = ?').get(order.id);
  res.json({ ok: true, order: updated });
});

// Download purchased asset
router.get('/orders/:id/download', requireAuth, (req, res) => {
  const order = db.prepare('SELECT * FROM marketplace_orders WHERE id = ?').get(req.params.id);
  if (!order) {
    return res.status(404).json({ ok: false, error: 'order_not_found' });
  }
  if (order.buyer_id !== req.user.id) {
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }
  if (order.status !== 'completed') {
    return res.status(400).json({ ok: false, error: 'order_not_completed' });
  }

  // Check download limits
  if (order.max_downloads !== -1 && order.download_count >= order.max_downloads) {
    return res.status(403).json({ ok: false, error: 'download_limit_reached' });
  }

  // Get listing file URL
  const listing = db.prepare('SELECT file_url FROM marketplace_listings WHERE id = ?').get(order.listing_id);
  if (!listing || !listing.file_url) {
    return res.status(404).json({ ok: false, error: 'file_not_found' });
  }

  // Increment download count
  db.prepare('UPDATE marketplace_orders SET download_count = download_count + 1 WHERE id = ?').run(order.id);

  // Track analytics
  trackAnalytics(order.listing_id, order.seller_id, 'download', req.user.id);

  res.json({
    ok: true,
    download_url: listing.file_url,
    license_key: order.license_key,
    downloads_remaining: order.max_downloads === -1 ? -1 : order.max_downloads - order.download_count - 1
  });
});

// =============================================================================
// REVIEWS & RATINGS ENDPOINTS
// =============================================================================

// Post review
router.post('/reviews', requireAuth, (req, res) => {
  const { orderId, rating, title, comment } = req.body || {};

  if (!orderId) {
    return res.status(400).json({ ok: false, error: 'missing_order_id' });
  }
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ ok: false, error: 'invalid_rating' });
  }

  // Get order
  const order = db.prepare('SELECT * FROM marketplace_orders WHERE id = ?').get(orderId);
  if (!order) {
    return res.status(404).json({ ok: false, error: 'order_not_found' });
  }
  if (order.buyer_id !== req.user.id) {
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }
  if (order.status !== 'completed') {
    return res.status(400).json({ ok: false, error: 'order_not_completed' });
  }

  // Check if already reviewed
  const existing = db.prepare('SELECT id FROM marketplace_reviews WHERE order_id = ?').get(orderId);
  if (existing) {
    return res.status(409).json({ ok: false, error: 'already_reviewed' });
  }

  // Create review
  const reviewId = generateId();
  db.prepare(`
    INSERT INTO marketplace_reviews
    (id, order_id, reviewer_id, listing_id, seller_id, rating, title, comment)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(reviewId, orderId, req.user.id, order.listing_id, order.seller_id, rating, title || null, comment || null);

  // Update listing rating
  const ratingStats = db.prepare(`
    SELECT AVG(rating) as avg, COUNT(*) as count
    FROM marketplace_reviews
    WHERE listing_id = ?
  `).get(order.listing_id);

  db.prepare(`
    UPDATE marketplace_listings
    SET rating_avg = ?, rating_count = ?
    WHERE id = ?
  `).run(ratingStats.avg, ratingStats.count, order.listing_id);

  // Update seller rating
  const sellerRatingStats = db.prepare(`
    SELECT AVG(rating) as avg, COUNT(*) as count
    FROM marketplace_reviews
    WHERE seller_id = ?
  `).get(order.seller_id);

  db.prepare(`
    UPDATE seller_profiles
    SET rating_avg = ?, rating_count = ?
    WHERE id = ?
  `).run(sellerRatingStats.avg, sellerRatingStats.count, order.seller_id);

  const review = db.prepare('SELECT * FROM marketplace_reviews WHERE id = ?').get(reviewId);
  res.json({ ok: true, review });
});

// Get listing reviews
router.get('/listings/:id/reviews', (req, res) => {
  const { limit = 10, offset = 0 } = req.query;

  const reviews = db.prepare(`
    SELECT mr.*, u.name as reviewer_name
    FROM marketplace_reviews mr
    JOIN users u ON u.id = mr.reviewer_id
    WHERE mr.listing_id = ? AND mr.is_flagged = 0
    ORDER BY mr.created_at DESC
    LIMIT ? OFFSET ?
  `).all(req.params.id, parseInt(limit), parseInt(offset));

  const { total } = db.prepare('SELECT COUNT(*) as total FROM marketplace_reviews WHERE listing_id = ?').get(req.params.id);

  res.json({
    ok: true,
    reviews,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    }
  });
});

// =============================================================================
// FILE UPLOAD ENDPOINTS
// =============================================================================

// Upload thumbnail
router.post('/listings/:id/upload/thumbnail', requireAuth, express.json({ limit: '10mb' }), (req, res) => {
  const { base64Data, filename } = req.body || {};

  if (!base64Data || !filename) {
    return res.status(400).json({ ok: false, error: 'missing_file_data' });
  }

  const listing = db.prepare('SELECT * FROM marketplace_listings WHERE id = ?').get(req.params.id);
  if (!listing) {
    return res.status(404).json({ ok: false, error: 'listing_not_found' });
  }

  const seller = db.prepare('SELECT id FROM seller_profiles WHERE user_id = ?').get(req.user.id);
  if (!seller || listing.seller_id !== seller.id) {
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }

  // Validate file type
  if (!upload.isValidFileType(filename, upload.ALLOWED_EXTENSIONS.image)) {
    return res.status(400).json({ ok: false, error: 'invalid_file_type' });
  }

  try {
    const fileUrl = upload.saveBase64File(base64Data, listing.id, filename);

    // Update listing
    db.prepare('UPDATE marketplace_listings SET thumbnail_url = ? WHERE id = ?').run(fileUrl, listing.id);

    res.json({ ok: true, url: fileUrl });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ ok: false, error: 'upload_failed' });
  }
});

// Upload asset file (downloadable)
router.post('/listings/:id/upload/asset', requireAuth, express.json({ limit: '100mb' }), (req, res) => {
  const { base64Data, filename, fileSize } = req.body || {};

  if (!base64Data || !filename) {
    return res.status(400).json({ ok: false, error: 'missing_file_data' });
  }

  const listing = db.prepare('SELECT * FROM marketplace_listings WHERE id = ?').get(req.params.id);
  if (!listing) {
    return res.status(404).json({ ok: false, error: 'listing_not_found' });
  }

  const seller = db.prepare('SELECT id FROM seller_profiles WHERE user_id = ?').get(req.user.id);
  if (!seller || listing.seller_id !== seller.id) {
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }

  // Validate file type (model or archive)
  const validTypes = [...upload.ALLOWED_EXTENSIONS.model, ...upload.ALLOWED_EXTENSIONS.archive];
  if (!upload.isValidFileType(filename, validTypes)) {
    return res.status(400).json({ ok: false, error: 'invalid_file_type' });
  }

  try {
    const fileUrl = upload.saveBase64File(base64Data, listing.id, filename);

    // Update listing
    db.prepare('UPDATE marketplace_listings SET file_url = ?, file_size_bytes = ? WHERE id = ?')
      .run(fileUrl, fileSize || null, listing.id);

    res.json({ ok: true, url: fileUrl });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ ok: false, error: 'upload_failed' });
  }
});

// Upload preview 3D scene
router.post('/listings/:id/upload/preview3d', requireAuth, express.json({ limit: '50mb' }), (req, res) => {
  const { sceneData, filename } = req.body || {};

  if (!sceneData || !filename) {
    return res.status(400).json({ ok: false, error: 'missing_scene_data' });
  }

  const listing = db.prepare('SELECT * FROM marketplace_listings WHERE id = ?').get(req.params.id);
  if (!listing) {
    return res.status(404).json({ ok: false, error: 'listing_not_found' });
  }

  const seller = db.prepare('SELECT id FROM seller_profiles WHERE user_id = ?').get(req.user.id);
  if (!seller || listing.seller_id !== seller.id) {
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }

  try {
    // Save as JSON (Reality Engine scene format)
    const base64Scene = Buffer.from(JSON.stringify(sceneData)).toString('base64');
    const fileUrl = upload.saveBase64File(base64Scene, listing.id, filename);

    // Update listing
    db.prepare('UPDATE marketplace_listings SET preview_3d_url = ? WHERE id = ?').run(fileUrl, listing.id);

    res.json({ ok: true, url: fileUrl });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ ok: false, error: 'upload_failed' });
  }
});

// Upload seller avatar
router.post('/seller/upload/avatar', requireAuth, express.json({ limit: '5mb' }), (req, res) => {
  const { base64Data, filename } = req.body || {};

  if (!base64Data || !filename) {
    return res.status(400).json({ ok: false, error: 'missing_file_data' });
  }

  const seller = db.prepare('SELECT * FROM seller_profiles WHERE user_id = ?').get(req.user.id);
  if (!seller) {
    return res.status(404).json({ ok: false, error: 'not_seller' });
  }

  if (!upload.isValidFileType(filename, upload.ALLOWED_EXTENSIONS.image)) {
    return res.status(400).json({ ok: false, error: 'invalid_file_type' });
  }

  try {
    const fileUrl = upload.saveBase64File(base64Data, seller.id, filename, 'seller');

    // Update seller profile
    db.prepare('UPDATE seller_profiles SET avatar_url = ? WHERE id = ?').run(fileUrl, seller.id);

    res.json({ ok: true, url: fileUrl });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ ok: false, error: 'upload_failed' });
  }
});

// =============================================================================
// FAVORITES/WISHLIST ENDPOINTS
// =============================================================================

// Add to favorites
router.post('/favorites', requireAuth, (req, res) => {
  const { listingId } = req.body || {};

  if (!listingId) {
    return res.status(400).json({ ok: false, error: 'missing_listing_id' });
  }

  // Check if already favorited
  const existing = db.prepare('SELECT id FROM marketplace_favorites WHERE user_id = ? AND listing_id = ?')
    .get(req.user.id, listingId);

  if (existing) {
    return res.status(409).json({ ok: false, error: 'already_favorited' });
  }

  const favoriteId = generateId();
  db.prepare(`
    INSERT INTO marketplace_favorites (id, user_id, listing_id)
    VALUES (?, ?, ?)
  `).run(favoriteId, req.user.id, listingId);

  res.json({ ok: true, favorite_id: favoriteId });
});

// Remove from favorites
router.delete('/favorites/:listingId', requireAuth, (req, res) => {
  db.prepare('DELETE FROM marketplace_favorites WHERE user_id = ? AND listing_id = ?')
    .run(req.user.id, req.params.listingId);

  res.json({ ok: true });
});

// Get user's favorites
router.get('/favorites', requireAuth, (req, res) => {
  const favorites = db.prepare(`
    SELECT ml.*, mf.created_at as favorited_at
    FROM marketplace_favorites mf
    JOIN marketplace_listings ml ON ml.id = mf.listing_id
    WHERE mf.user_id = ?
    ORDER BY mf.created_at DESC
  `).all(req.user.id);

  res.json({ ok: true, favorites });
});

// =============================================================================
// ADMIN ENDPOINTS
// =============================================================================

// Get pending listings
router.get('/admin/pending', requireAdmin, (req, res) => {
  const pending = db.prepare(`
    SELECT ml.*, sp.display_name as seller_name
    FROM marketplace_listings ml
    JOIN seller_profiles sp ON sp.id = ml.seller_id
    WHERE ml.status = 'pending'
    ORDER BY ml.created_at ASC
  `).all();

  res.json({ ok: true, listings: pending });
});

// Approve listing
router.post('/admin/approve/:id', requireAdmin, (req, res) => {
  const listing = db.prepare('SELECT * FROM marketplace_listings WHERE id = ?').get(req.params.id);
  if (!listing) {
    return res.status(404).json({ ok: false, error: 'listing_not_found' });
  }

  db.prepare(`
    UPDATE marketplace_listings
    SET status = 'approved', published_at = datetime('now')
    WHERE id = ?
  `).run(listing.id);

  const updated = db.prepare('SELECT * FROM marketplace_listings WHERE id = ?').get(listing.id);
  res.json({ ok: true, listing: updated });
});

// Reject listing
router.post('/admin/reject/:id', requireAdmin, (req, res) => {
  const { reason } = req.body || {};

  const listing = db.prepare('SELECT * FROM marketplace_listings WHERE id = ?').get(req.params.id);
  if (!listing) {
    return res.status(404).json({ ok: false, error: 'listing_not_found' });
  }

  db.prepare(`
    UPDATE marketplace_listings
    SET status = 'rejected', rejection_reason = ?
    WHERE id = ?
  `).run(reason || null, listing.id);

  const updated = db.prepare('SELECT * FROM marketplace_listings WHERE id = ?').get(listing.id);
  res.json({ ok: true, listing: updated });
});

// Toggle featured status
router.post('/admin/featured/:id', requireAdmin, (req, res) => {
  const { featured } = req.body || {};

  db.prepare('UPDATE marketplace_listings SET is_featured = ? WHERE id = ?')
    .run(featured ? 1 : 0, req.params.id);

  const listing = db.prepare('SELECT * FROM marketplace_listings WHERE id = ?').get(req.params.id);
  res.json({ ok: true, listing });
});

module.exports = router;
