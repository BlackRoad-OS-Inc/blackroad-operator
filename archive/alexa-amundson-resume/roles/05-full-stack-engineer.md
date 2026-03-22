# Alexa Amundson

**Full-Stack Engineer**

amundsonalexa@gmail.com | [github.com/blackboxprogramming](https://github.com/blackboxprogramming)

---

## Summary

Designed, built, and shipped end-to-end: 7.2M lines of code, 20 languages, 99 deployed sites, FastAPI backends, 283 databases, and a brand system powering 75 templates — because "full-stack" means owning the entire vertical.

---

## Experience

### BlackRoad OS | Founder & Full-Stack Engineer | 2025–Present

**The Frontend: 99 Live Sites, One Design System**
- 75 design templates with brand-locked system — gradient spectrum, golden ratio spacing, Space Grotesk + JetBrains Mono typography
- 99 Cloudflare Pages projects deployed across 48+ custom domains — every site is live, every domain has SSL
- 15 page types covering the full SaaS surface: landing, pricing, blog, docs, dashboard, auth, portfolio, settings, status, changelog

**The Backend: APIs That Power Everything**
- CECE API (FastAPI) for custom LLM interaction and TTS. Lucidia API for application platform. Fleet health APIs for monitoring
- AI image generation API with 4 backend agents — single endpoint, automatic model routing between DALL-E, Flux, SDXL
- 48 Nginx reverse proxy sites routing traffic to the right backend across the fleet — zero-trust via Cloudflare tunnels

**The Data Layer: 283 Databases, 5 Engines**
- 11 PostgreSQL for relational data, 230 SQLite (1.4 GB) for app state, 23 D1 for serverless, 47 KV for edge config, Qdrant for vectors
- FTS5 full-text search across 156K entries — sub-millisecond lookups across the entire knowledge base

---

## Technical Skills

React, Next.js, FastAPI, Node.js, PostgreSQL, SQLite, Cloudflare D1/KV/R2, Docker, Nginx

---

## Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Lines of Code | *live* | loc.sh — cloc + fleet SSH |
| Total Repos | *live* | github-all-orgs.sh — gh api repos (17 owners) |
| CF Pages | *live* | cloudflare.sh — wrangler pages list |
| PostgreSQL DBs | *live* | services.sh — psql -l via SSH |
| SQLite DBs | *live* | local.sh — find ~/.blackroad -name *.db |
| Nginx Sites | *live* | services.sh — /etc/nginx/sites-enabled via SSH |
| Docker Containers | *live* | services.sh — docker ps via SSH |
