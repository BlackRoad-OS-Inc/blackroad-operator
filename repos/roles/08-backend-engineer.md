# Alexa Amundson

**Backend Engineer**

amundsonalexa@gmail.com | [github.com/blackboxprogramming](https://github.com/blackboxprogramming)

---

## Summary

Every feature needs an API. Built 6+ production services, unified 283 databases across 5 engines, and designed data architectures that run on $80 hardware — because the backend doesn't care how much you spent on it.

---

## Experience

### BlackRoad OS | Founder & Backend Engineer | 2025–Present

**The APIs: Each One Solving a Real Problem**
- CECE API (FastAPI) — needed custom LLM interaction with personality. Built TTS generation endpoint. Runs on Pi 5 at the edge
- AI image generation API — 4 backend agents (DALL-E, Flux, SDXL, FAL) behind a single endpoint. Automatic model routing based on prompt type
- Code search engine — needed to find anything across 354 repos instantly. Built FTS5 index, sub-millisecond lookups across entire codebase
- Fleet health APIs — SSH-based probes collect metrics from every node. Powers the KPI dashboard and automated alerting

**The Data: Right Database for the Right Job**
- 11 PostgreSQL for transactional data. 230 SQLite (1.4 GB) for agent memory and local state — embedded, zero-config, fast
- 23 Cloudflare D1 for serverless applications. 47 KV namespaces for edge configuration and caching. Qdrant for vector search
- FTS5 full-text search across 156K entries — the entire knowledge base is searchable in under a millisecond

---

## Technical Skills

Python/FastAPI, Node.js, PostgreSQL, SQLite/FTS5, D1, KV, Docker, Nginx, Redis

---

## Metrics

| Metric | Value | Source |
|--------|-------|--------|
| PostgreSQL DBs | *live* | services.sh — psql -l via SSH |
| SQLite DBs | *live* | local.sh — find ~/.blackroad -name *.db |
| D1 Databases | *live* | cloudflare.sh — wrangler d1 list --json |
| KV Namespaces | *live* | cloudflare.sh — wrangler kv list |
| Docker Containers | *live* | services.sh — docker ps via SSH |
| Lines of Code | *live* | loc.sh — cloc + fleet SSH |
