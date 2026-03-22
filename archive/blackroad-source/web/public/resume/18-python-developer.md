# Alexa Amundson

**Python Developer**

amundsonalexa@gmail.com | [github.com/blackboxprogramming](https://github.com/blackboxprogramming)

---

## Summary

470 Python repos. FastAPI services handling AI inference, fleet probes, and data pipelines. Python isn't just a language in this stack — it's the glue that holds 7 nodes, 27 models, and 283 databases together.

---

## Experience

### BlackRoad OS | Founder & Python Developer | 2025–Present

**The Services: Python in Production**
- CECE API (FastAPI) — custom LLM personality engine with text-to-speech. Runs on Pi 5, serves inference over HTTP
- Lucidia API (FastAPI) — application platform backend. CarPool (Next.js + Clerk) frontend, Python API layer
- Fleet probes — Python scripts piped over SSH stdin to remote nodes. No installation needed. Collects CPU, RAM, disk, Docker, Ollama, systemd stats
- KPI aggregation pipeline — 10 collectors output JSON, Python merges into daily summary with 80+ keys, pushes to KV

**The Tools: Python Solving Real Problems**
- FTS5 search engine — Python + SQLite full-text search across 156K memory entries. Sub-millisecond lookups
- RoadC interpreter — custom language with Python-style indentation. Lexer, parser, and tree-walking evaluator, all in Python
- AI image generation hub — Python orchestrating 4 backend agents (DALL-E, Flux, SDXL, FAL), automatic model selection
- Automated reporting — terminal dashboards, Slack notifications, markdown reports, resume generation. All Python

---

## Technical Skills

Python, FastAPI, SQLite, PostgreSQL, Ollama, asyncio, subprocess, json, data pipelines

---

## Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Lines of Code | *live* | loc.sh — cloc + fleet SSH |
| Total Repos | *live* | github-all-orgs.sh — gh api repos (17 owners) |
| PostgreSQL DBs | *live* | services.sh — psql -l via SSH |
| SQLite DBs | *live* | local.sh — find ~/.blackroad -name *.db |
| AI Models | *live* | services.sh — ollama list via SSH |
| Systems Registered | *live* | local.sh — sqlite3 systems count |
