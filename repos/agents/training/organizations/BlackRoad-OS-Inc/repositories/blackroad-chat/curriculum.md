# blackroad-chat — Agent Training Curriculum

**Type:** worker | **Languages:** javascript, typescript

## Overview

Ollama-powered chat interface at chat.blackroad.io. Cloudflare Worker with a web UI for free AI chat. Connects to local Ollama models via Cloudflare tunnel. Includes Playwright end-to-end tests.

## Key Files

- `worker.js` — Cloudflare Worker: chat endpoint, Ollama proxy, streaming responses
- `wrangler.toml` — Worker config, tunnel binding
- `test/chat.spec.ts` — Playwright E2E tests
- `playwright.config.ts` — Test configuration

## Learning Objectives

1. Understand the purpose and architecture of blackroad-chat
2. Navigate the codebase and identify key components
3. Make modifications following BlackRoad coding standards
4. Deploy changes and verify correctness
5. Document work in codex and broadcast TILs

## Exercises

### Level 1: Observer
- [ ] Read `worker.js` and trace the chat request flow
- [ ] Identify how Ollama is connected (tunnel vs direct)
- [ ] Run the Playwright tests locally

### Level 2: Contributor
- [ ] Add input sanitization to chat messages
- [ ] Add a loading indicator to the UI
- [ ] Add a test for streaming responses

### Level 3: Builder
- [ ] Add model selection in the UI (pick which Ollama model)
- [ ] Implement conversation history persistence
- [ ] Add markdown rendering in responses

### Level 4: Architect
- [ ] Design a multi-model chat (route different questions to different models)
- [ ] Propose a chat-based search integration with RoadSearch
- [ ] Review the Ollama tunnel for security
