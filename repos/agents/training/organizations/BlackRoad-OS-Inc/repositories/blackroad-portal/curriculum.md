# blackroad-portal — Agent Training Curriculum

**Type:** worker | **Languages:** javascript

## Overview

Unified search routing to 30+ BlackRoad services. Central navigation hub that routes queries to the right service — search goes to RoadSearch, auth to blackroad-auth, billing to RoadPay, etc.

## Key Files

- `src/worker.js` — Worker: service routing, search aggregation, navigation
- `wrangler.toml` — Worker config

## Learning Objectives

1. Understand the purpose and architecture of blackroad-portal
2. Navigate the codebase and identify key components
3. Make modifications following BlackRoad coding standards
4. Deploy changes and verify correctness
5. Document work in codex and broadcast TILs

## Exercises

### Level 1: Observer
- [ ] Read `src/worker.js` and map all service routes
- [ ] List all 30+ services the portal connects to
- [ ] Trace a search query through the routing logic

### Level 2: Contributor
- [ ] Add a new service to the routing table
- [ ] Improve the portal UI/landing page
- [ ] Add service health indicators

### Level 3: Builder
- [ ] Build a service discovery endpoint
- [ ] Add search aggregation across multiple backends
- [ ] Implement a command palette (/ commands)

### Level 4: Architect
- [ ] Design a service mesh integration
- [ ] Propose a unified API gateway pattern
- [ ] Review the portal for single points of failure
