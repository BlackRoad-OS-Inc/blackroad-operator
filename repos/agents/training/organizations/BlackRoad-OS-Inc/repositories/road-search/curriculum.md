# road-search — Agent Training Curriculum

**Type:** worker | **Languages:** javascript

## Overview

FTS5 search engine with AI answers across the BlackRoad ecosystem. A Cloudflare Worker backed by D1 (SQLite FTS5) indexing 43+ pages across all BlackRoad domains. Features: full-text search, autocomplete/suggestions, "I'm Feeling Lucky" redirect, AI-powered answer generation via Ollama, and admin endpoints for indexing new pages. ~999 lines of Worker code.

## Key Files

- `src/worker.js` — Complete Worker (~999 lines): search, suggest, lucky, AI answers, index management
- `wrangler.toml` — Worker config, D1 binding
- `package.json` — Dependencies

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/search?q=X&limit=N` | Full-text search |
| `/api/suggest?q=X` | Autocomplete suggestions |
| `/lucky?q=X` | I'm Feeling Lucky redirect |
| `/api/stats` | Index statistics |
| `/api/index` | Add page to index (auth required) |

## Learning Objectives

1. Understand FTS5 (SQLite full-text search) and how it's used in D1
2. Trace a search query from input through FTS5 to ranked results
3. Understand how AI answers are generated (search results → Ollama prompt)
4. Know how pages are indexed and the crawl/index pipeline

## Exercises

### Level 1: Observer
- [ ] Read `src/worker.js` and list all routes
- [ ] Explain how FTS5 ranking works (bm25 or rank function)
- [ ] Call `/api/stats` and describe the index contents

### Level 2: Contributor
- [ ] Improve search result snippet generation
- [ ] Add a new filter parameter (e.g., by domain)
- [ ] Fix autocomplete for edge cases (empty query, special chars)

### Level 3: Builder
- [ ] Add search analytics (log popular queries)
- [ ] Implement faceted search (filter by domain, type)
- [ ] Build a sitemap generator from the search index

### Level 4: Architect
- [ ] Design a crawler that auto-indexes all BlackRoad sites
- [ ] Propose search relevance improvements (boosting, synonyms)
- [ ] Evaluate embedding-based semantic search vs FTS5 keyword search
