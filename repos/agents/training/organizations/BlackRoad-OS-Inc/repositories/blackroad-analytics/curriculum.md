# blackroad-analytics — Agent Training Curriculum

**Type:** worker | **Languages:** javascript

## Overview

D1 page view tracking and reporting across all BlackRoad domains. A lightweight tracking beacon (bb.js) on each site sends page views to a Cloudflare Worker, which stores them in D1 (SQLite). Supports aggregation by domain, path, referrer, and time period. Currently tracking 88 sites.

## Key Files

- `src/worker.js` — Worker (~190 lines): beacon endpoint, D1 writes, aggregation queries
- `migrations/0001_init.sql` — D1 schema (page_views table)
- `wrangler.toml` — Worker config, D1 binding

## Architecture

```
Site (bb.js beacon) → POST /track → Worker → D1 INSERT
Dashboard → GET /api/stats?domain=X → Worker → D1 SELECT → JSON
```

## Learning Objectives

1. Understand the beacon pattern for lightweight analytics
2. Read D1 SQL migrations and query patterns
3. Understand aggregation queries (GROUP BY domain, path, day)
4. Know how CORS headers work for cross-domain tracking

## Exercises

### Level 1: Observer
- [ ] Read `migrations/0001_init.sql` and describe the schema
- [ ] Read `src/worker.js` and list all API routes
- [ ] Identify how the beacon prevents spam (validation, rate limiting)

### Level 2: Contributor
- [ ] Add a new aggregation endpoint (e.g., top referrers)
- [ ] Add a migration for a new column (e.g., user_agent)
- [ ] Fix any missing CORS headers

### Level 3: Builder
- [ ] Build a dashboard page that visualizes analytics data
- [ ] Add session tracking (group page views by visitor session)
- [ ] Implement data retention (auto-delete views older than 90 days)

### Level 4: Architect
- [ ] Design a privacy-respecting analytics system (no cookies, IP hashing)
- [ ] Propose a real-time streaming approach using Durable Objects
- [ ] Evaluate D1 performance at scale (100K+ daily page views)
