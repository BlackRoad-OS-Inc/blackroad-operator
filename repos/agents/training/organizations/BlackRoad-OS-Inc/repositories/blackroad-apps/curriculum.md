# blackroad-apps — Agent Training Curriculum

**Type:** collection | **Languages:** javascript, rust

## Overview

50 Progressive Web Apps — offline-first, installable, service workers, responsive design. Includes Roadmap (Next.js project tracker), Roadside (Node.js service), RoadChain (Rust blockchain), and a `generate-50-apps.sh` scaffold script. Each app is a standalone PWA with its own manifest and service worker.

## Key Files

- `roadmap/` — Next.js project management app
- `roadside/server.js` — Node.js service app
- `roadchain/Cargo.toml` — Rust blockchain app
- `generate-50-apps.sh` — App scaffolding script

## Learning Objectives

1. Understand the purpose and architecture of blackroad-apps
2. Navigate the codebase and identify key components
3. Make modifications following BlackRoad coding standards
4. Deploy changes and verify correctness
5. Document work in codex and broadcast TILs

## Exercises

### Level 1: Observer
- [ ] List all 50 apps and categorize by type
- [ ] Read `roadmap/` and identify the Next.js structure
- [ ] Run `generate-50-apps.sh` and understand the scaffold pattern

### Level 2: Contributor
- [ ] Fix a bug in one of the PWA service workers
- [ ] Add offline support to an app that lacks it
- [ ] Improve an app's manifest.json

### Level 3: Builder
- [ ] Build a new PWA from scratch following the pattern
- [ ] Add push notifications to an existing app
- [ ] Create an app store index page

### Level 4: Architect
- [ ] Design a unified PWA framework for all 50 apps
- [ ] Propose a shared component library
- [ ] Review service worker strategies across apps
