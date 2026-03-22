# squad-webhook — Agent Training Curriculum

**Type:** worker | **Languages:** javascript

## Overview

8 AI agents respond to @blackboxprogramming mentions on GitHub PRs and issues across 69 repos. A Cloudflare Worker receives GitHub webhooks, identifies the right agent from context, generates a response via Ollama, and posts it as a comment. Agents: Lucidia (reasoning), Alice (devops), Octavia (architecture), Aria (frontend), Shellfish (security), Cecilia (meta-cognitive), Caddy (CI/CD), Alexa (CEO review).

## Key Files

- `src/worker.js` — Complete Worker (~397 lines): webhook handler, agent router, Ollama integration, GitHub API comment posting
- `wrangler.toml` — Worker config, secrets (GitHub token, webhook secret)
- `package.json` — Dependencies

## Architecture

```
GitHub webhook → Worker → Agent router (picks agent by context)
                             ↓
                   Ollama (generate response) → GitHub comment
```

## Learning Objectives

1. Understand GitHub webhook event structure (issue_comment, pull_request_review)
2. Trace the agent routing logic — how context maps to agent personality
3. Understand Ollama API integration for generating comments
4. Know the GitHub API for posting comments on PRs/issues

## Exercises

### Level 1: Observer
- [ ] Read `src/worker.js` and list all 8 agents with their triggers
- [ ] Identify the webhook verification logic (HMAC signature)
- [ ] Trace a mention through: webhook → agent selection → Ollama → comment

### Level 2: Contributor
- [ ] Add a new command (e.g., `/explain` to explain a code change)
- [ ] Improve an agent's system prompt for better responses
- [ ] Add error handling for Ollama timeout

### Level 3: Builder
- [ ] Add a new agent with a distinct personality and specialty
- [ ] Implement conversation threading (agent remembers prior comments)
- [ ] Add support for reacting to PR reviews, not just comments

### Level 4: Architect
- [ ] Design a feedback loop where agents learn from thumbs-up/down on comments
- [ ] Propose multi-agent collaboration (two agents discuss a PR)
- [ ] Review webhook security and rate limiting
