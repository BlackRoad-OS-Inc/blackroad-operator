# fleet-heartbeat — Agent Training Curriculum

**Type:** app | **Languages:** python

## Overview

Real-time fleet health monitoring dashboard. SSH-based checks on all 5 Pi nodes, SQLite history for trending, auto-healing (restart services), and web UI. FastAPI backend showing CPU, memory, disk, temperature, services across the fleet.

## Key Files

- `server.py` — FastAPI: SSH health checks, SQLite history, auto-healing, web dashboard
- `tests/test_server.py` — Integration tests
- `deploy.sh` — Deployment script

## Learning Objectives

1. Understand the purpose and architecture of fleet-heartbeat
2. Navigate the codebase and identify key components
3. Make modifications following BlackRoad coding standards
4. Deploy changes and verify correctness
5. Document work in codex and broadcast TILs

## Exercises

### Level 1: Observer
- [ ] Read `server.py` and list all health metrics collected
- [ ] Identify the auto-healing logic — what triggers a restart?
- [ ] Trace the SSH connection pattern for fleet checks

### Level 2: Contributor
- [ ] Add a new health metric (e.g., network latency)
- [ ] Improve the web dashboard UI
- [ ] Add a test for the auto-healing path

### Level 3: Builder
- [ ] Add alerting (Slack/email on health degradation)
- [ ] Implement health history trends (graphs over time)
- [ ] Add fleet comparison view

### Level 4: Architect
- [ ] Design push-based health reporting (nodes push to central)
- [ ] Propose a health scoring system (0-100 per node)
- [ ] Review SSH key management for security
