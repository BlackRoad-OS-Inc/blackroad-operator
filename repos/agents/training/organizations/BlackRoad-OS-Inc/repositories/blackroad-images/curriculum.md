# blackroad-images — Agent Training Curriculum

**Type:** worker | **Languages:** javascript, bash

## Overview

AI image generation and CDN serving at images.blackroad.io. A Cloudflare Worker that serves brand assets from R2 (logos, pixel art, sprites) and generates new images via Workers AI (SDXL, FLUX). Includes D1 for image metadata, bash scripts for bulk upload and generation, and routes for brand, pixel art, worlds, and HQ assets. ~972 lines of Worker code.

## Key Files

- `src/worker.js` — Worker (~972 lines): R2 serving, AI generation, metadata, routing
- `migrations/0001_init.sql` — D1 schema for image metadata
- `upload.sh` — Bulk upload script to R2
- `generate.sh` — AI image generation script
- `wrangler.toml` — Worker config, R2 + D1 bindings
- `package.json` — Dependencies

## Asset Routes

| Route | Serves |
|-------|--------|
| `/brand/*` | Brand logos and assets |
| `/pixel-art/*` | 50+ pixel art sprites |
| `/worlds/*` | World/metaverse backgrounds |
| `/hq/*` | HQ floor backgrounds |

## Learning Objectives

1. Understand R2 object storage and how Workers serve from it
2. Know the Workers AI image generation pipeline (SDXL, FLUX)
3. Understand the CDN routing pattern (path → R2 key)
4. Know how D1 tracks image metadata

## Exercises

### Level 1: Observer
- [ ] Read `src/worker.js` and list all routes
- [ ] Read `migrations/0001_init.sql` and describe the metadata schema
- [ ] List all asset categories served by the CDN

### Level 2: Contributor
- [ ] Add a new route category (e.g., `/icons/*`)
- [ ] Improve cache headers for better CDN performance
- [ ] Add input validation to the generation endpoint

### Level 3: Builder
- [ ] Add image transformation (resize, crop) on-the-fly
- [ ] Implement a generation queue with rate limiting
- [ ] Add a gallery endpoint that lists all assets with metadata

### Level 4: Architect
- [ ] Design a CDN invalidation strategy for updated assets
- [ ] Propose cost optimization for R2 storage and AI generation
- [ ] Review the image pipeline for security (prevent prompt injection in generation)
