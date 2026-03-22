# blackroad-gateway — Agent Training Curriculum

**Type:** worker | **Languages:** typescript

## Overview

Tokenless AI provider gateway. A Cloudflare Worker that holds all API keys centrally so agents never see tokens. Routes inference requests to Ollama (local), Anthropic (Claude), OpenAI (GPT-4o), and Google (Gemini). Agents authenticate via JWT from blackroad-auth — the gateway maps JWT to the right provider and key. Includes audit logging, rate limiting, and usage tracking.

## Key Files

- `src/index.ts` — Worker entry point, request routing
- `src/routes.ts` — Provider routing logic (Ollama, Anthropic, OpenAI, Gemini)
- `src/ratelimit.ts` — Per-agent rate limiting
- `src/audit.ts` — Request audit logging
- `src/storage.ts` — KV/D1 storage helpers
- `wrangler.toml` — Worker config, secrets bindings, KV namespaces
- `tests/gateway.test.ts` — Integration tests
- `.env.example` — Required secrets template
- `Dockerfile` + `docker-compose.yml` — Self-hosted deployment option

## Architecture

```
Agent (JWT) → Gateway Worker → Provider (Ollama/Claude/OpenAI/Gemini)
                  ↓
            Audit log + Rate limit + Usage tracking
            API keys in Worker secrets (never exposed)
```

## Learning Objectives

1. Understand the tokenless architecture — why agents never hold API keys
2. Trace a request from JWT auth through provider routing to response
3. Read rate limiting logic and understand per-agent quotas
4. Understand the audit trail and usage tracking
5. Know all 4 provider integrations and their API formats

## Exercises

### Level 1: Observer
- [ ] Read `src/routes.ts` and list all supported providers and models
- [ ] Trace the flow of an inference request from entry to response
- [ ] Read `wrangler.toml` and identify all bound secrets and KV namespaces

### Level 2: Contributor
- [ ] Add a new model to an existing provider's routing
- [ ] Improve error messages for auth failures
- [ ] Add a test case to `tests/gateway.test.ts`

### Level 3: Builder
- [ ] Add a new AI provider integration (e.g., Mistral, Cohere)
- [ ] Implement per-model rate limiting (not just per-agent)
- [ ] Add usage metering that feeds into RoadPay billing

### Level 4: Architect
- [ ] Design multi-region failover for provider routing
- [ ] Propose a caching strategy for repeated inference requests
- [ ] Review the security model and identify any token leak vectors
