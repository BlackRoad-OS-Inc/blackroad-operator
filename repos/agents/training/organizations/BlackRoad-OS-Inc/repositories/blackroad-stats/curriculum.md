# blackroad-stats — Agent Training Curriculum

**Type:** worker | **Languages:** javascript, bash

## Overview

Live fleet metrics API. A Cloudflare Worker + KV store serving real-time telemetry from all 5 Raspberry Pi nodes. A bash collector script (`collect.sh`) runs on cron, SSHes into each node, gathers metrics (CPU, memory, disk, temperature, Ollama models, Docker containers, TCP ports), and pushes them to KV. The Worker serves this data via REST API.

## Key Files

- `src/worker.js` — Worker (~188 lines): KV reads, fleet endpoint, per-node data
- `collect.sh` — Bash collector: SSH into each node, gather metrics, PUT to KV
- `wrangler.toml` — Worker config, KV namespace binding

## Architecture

```
Cron (Mac) → collect.sh → SSH to 5 Pis → Gather metrics → PUT to KV
                                                              ↓
Browser/Agent → Worker /fleet → KV GET → JSON response
```

## Learning Objectives

1. Understand the collector pattern (cron → SSH → KV)
2. Read the KV data structure for fleet telemetry
3. Know what metrics are collected from each Pi node
4. Understand how the Worker serves aggregated fleet data

## Exercises

### Level 1: Observer
- [ ] Read `collect.sh` and list every metric collected per node
- [ ] Read `src/worker.js` and map all API routes
- [ ] Call `/fleet` and describe the response schema

### Level 2: Contributor
- [ ] Add a new metric to the collector (e.g., network bandwidth)
- [ ] Add a summary endpoint that returns fleet-wide totals
- [ ] Add error handling for nodes that are offline

### Level 3: Builder
- [ ] Add historical metric storage (KV with timestamped keys)
- [ ] Build an alerting system (CPU > 90% → notification)
- [ ] Add a `/node/:name` endpoint for per-node detail

### Level 4: Architect
- [ ] Design a push-based collector (nodes push to Worker) vs pull-based
- [ ] Propose metric retention and aggregation strategy
- [ ] Review collector security (SSH key management)
