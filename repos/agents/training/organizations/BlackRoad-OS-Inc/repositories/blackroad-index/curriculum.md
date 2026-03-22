# blackroad-index — Agent Training Curriculum

**Type:** worker | **Languages:** javascript

## Overview

Gitea + GitHub code search with D1 FTS5 and scheduled indexing. Searches across 383 repos on Gitea and GitHub. Indexes code, READMEs, and file paths for ecosystem-wide search.

## Key Files

- `src/worker.js` — Worker: FTS5 search, Gitea/GitHub API indexing, scheduled triggers
- `wrangler.toml` — Worker config, D1 binding, cron triggers

## Learning Objectives

1. Understand the purpose and architecture of blackroad-index
2. Navigate the codebase and identify key components
3. Make modifications following BlackRoad coding standards
4. Deploy changes and verify correctness
5. Document work in codex and broadcast TILs

## Exercises

### Level 1: Observer
- [ ] Read `src/worker.js` and list all routes
- [ ] Understand how Gitea API and GitHub API are queried
- [ ] Identify the D1 FTS5 schema

### Level 2: Contributor
- [ ] Add a new search filter (by language, by org)
- [ ] Improve indexing error handling
- [ ] Add a test for search relevance

### Level 3: Builder
- [ ] Add incremental indexing (only new/changed repos)
- [ ] Build a search results UI
- [ ] Add code snippet previews in results

### Level 4: Architect
- [ ] Design a federated search across Gitea + GitHub + D1
- [ ] Propose relevance ranking improvements
- [ ] Review indexing performance at scale
