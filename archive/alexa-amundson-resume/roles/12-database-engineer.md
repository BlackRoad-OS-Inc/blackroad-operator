# Alexa Amundson

**Database Engineer**

amundsonalexa@gmail.com | [github.com/blackboxprogramming](https://github.com/blackboxprogramming)

---

## Summary

Different data needs different storage. Designed and operate 283 databases across 5 engines — PostgreSQL for transactions, SQLite for embedded state, D1 for serverless, KV for edge config, Qdrant for vectors. Each one chosen for a reason.

---

## Experience

### BlackRoad OS | Founder & Database Engineer | 2025–Present

**The Decision: Why 5 Engines, Not 1**
- PostgreSQL (11 DBs) for relational data that needs ACID guarantees — user state, application data, fleet metadata
- SQLite (230 DBs, 1.4 GB) for embedded, zero-config storage — agent memory, metrics history, local state. No server process, instant access
- Cloudflare D1 (23 DBs) for serverless apps at the edge — data lives next to the Workers that query it. Millisecond reads globally
- KV (47 namespaces) for configuration and caching — edge-distributed, eventually consistent, perfect for feature flags and session data

**The Search: Finding Anything Instantly**
- FTS5 full-text search across 156,675 memory entries — the entire knowledge base searchable in under a millisecond
- Code search engine indexing 354 repos — find any function, any file, any pattern across the whole codebase
- 111 registered systems tracked in a systems database — every device, service, and endpoint has a record

---

## Technical Skills

PostgreSQL, SQLite/FTS5, Cloudflare D1, KV stores, Qdrant, SQL, Python, database design

---

## Metrics

| Metric | Value | Source |
|--------|-------|--------|
| PostgreSQL DBs | *live* | services.sh — psql -l via SSH |
| SQLite DBs | *live* | local.sh — find ~/.blackroad -name *.db |
| Total DB Rows | *live* | local.sh — sqlite3 row count across 230 DBs |
| D1 Databases | *live* | cloudflare.sh — wrangler d1 list --json |
| KV Namespaces | *live* | cloudflare.sh — wrangler kv list |
| FTS5 Entries | *live* | local.sh — sqlite3 FTS5 count |
