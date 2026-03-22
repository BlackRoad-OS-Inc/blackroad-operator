# blackroadbot orchestration ProductPlan

**Source:** br-drive

---

@BlackRoadBot

& Agent Orchestration

The BlackRoad Autonomous Infrastructure Command Layer

Deca-Layered Scaffold  ·  15-Org Matrix  ·  Local Inference  ·  roadchain Witnessing

────────────────────────────────────────────

Product Owner: Alexa Louise Amundson

Organization: BlackRoad-OS  |  GitHub Enterprise: blackroad-os

Version: 1.0 Draft  |  Date: February 28, 2026

CONFIDENTIAL — BlackRoad OS, Inc. Internal Use Only

1. Executive Summary

@BlackRoadBot and the @blackroad-agents scaffold form the autonomous command layer of BlackRoad OS — the system through which high-level human intent is translated into distributed execution across 15 GitHub organizations, physical Pi cluster hardware, cloud infrastructure, and public-facing web properties.

At its core, this is a deca-layered task routing and execution framework. A single comment — "@blackroad-agents build a landing page for roadchain.io" — triggers a 10-step workflow that reviews intent, selects an organization, assigns a team, creates a GitHub Project task, instantiates a specialized agent, targets a repository, optionally dispatches to physical hardware, synchronizes artifacts to Google Drive, configures Cloudflare network rules, and updates the website presentation layer. Every step is hashed and appended to the roadchain witnessing ledger.

This document defines the full product specification: architecture, routing logic, organization matrix, local inference infrastructure, CLI layer design, roadchain witnessing philosophy, rate limit mitigation strategy, and the 30,000-agent scaling roadmap.

2. Product Vision

"What if every GitHub comment could ripple out across an entire operating system — spinning up agents, shipping code, updating infrastructure, and writing itself into an immutable ledger — without a single human clicking a button?"

That is @BlackRoadBot. It is not a chatbot. It is not a simple automation. It is a routing matrix — the synaptic layer between human intent and physical/virtual execution across the entire BlackRoad ecosystem. Every action it takes is witnessed, every agent it spawns has a genesis hash, every state transition is a non-trivial zero written onto the roadchain.

The architecture is designed around three principles:

Precision routing: Intent is parsed at Layer 6 (Lucidia Core) and dispatched with surgical accuracy to the correct organization, team, agent, and device.

Data sovereignty: Local Pi cluster inference ensures that proprietary codebase context never leaves the BlackRoad network, bypassing cloud rate limits entirely.

Permanent witnessing: Every task, every agent action, every state change is appended to roadchain. Nothing is deleted. Everything is witnessed.

3. The @blackroad-agents Deca-Layered Scaffold

When @blackroad-agents is invoked in a GitHub comment, the following 10-step scaffold executes in sequence. Steps may complete autonomously or pause for human-in-the-loop (HITL) approval at high-risk operations.

If any layer fails, the system creates a GitHub Issue containing detailed logs from Layer 6. A "Reflect and Retry" recovery process then assesses the failure, adjusting agent prompts or switching inference models as needed.

4. @BlackRoadBot Routing Matrix

@BlackRoadBot parses GitHub issue/PR comments using natural language intent classification. Based on the parsed intent, it routes to one or more of the following platform integrations:

4.1 Salesforce CRM Integration

Task creation via Apex middleware: GitHub events map to Salesforce Case or Custom Task objects.

Data Cloud ingestion: GitHub webhook telemetry feeds real-time analytics on agent performance.

Webhook automation: salesforce-webhooks package wires GitHub triggers to Salesforce endpoints, automating full developer ticket lifecycle.

4.2 Hugging Face & Ollama Reasoning

Hugging Face Inference Endpoints: Programmatic deployment of dedicated model endpoints for high-compute tasks (complex code generation, mathematical reasoning).

Ollama local integration: Routine tasks execute against local Ollama instance exposed via Cloudflare Tunnel — models include Llama-3.2-3B-Instruct-GGUF.

4.3 DigitalOcean & Railway Infrastructure

DigitalOcean: doctl CLI within GitHub Actions for droplet management — rebuild via chrisjsimpson/droplet-rebuild-action, resource scaling on demand.

Railway: Ephemeral test environments for feature branches via Railway CLI or dedicated Railway agent skills.

4.4 Headless CMS & Website Editors

5. GitHub Enterprise Organization Matrix

The 15 organizations under the blackroad-os GitHub Enterprise provide governance, security isolation, and functional domain boundaries. @blackroad-agents routes tasks to the appropriate org based on intent classification.

Cross-organization access uses GitHub Apps rather than Personal Access Tokens (PATs). GitHub Apps provide short-lived, granular permissions and act on behalf of the organization — critical for security isolation and avoiding the token expiration issues (e.g., blackroad-npm-token) observed in legacy configurations.

6. Domain Architecture & Cloudflare Integration

18 primary domains are orchestrated via Cloudflare, serving as the public ingress layer for the @BlackRoadBot routing matrix. Cloudflare Tunnels securely expose Pi cluster inference to the public internet without opening internal network ports.

7. Local Inference Infrastructure (Pi Cluster)

A core design principle of BlackRoad OS is data sovereignty: proprietary codebase context must never leave the local network. To achieve this — and to bypass external API rate limits — @blackroad-agents offloads LLM inference to the Pi 5 cluster.

7.1 Hardware Configuration

7.2 Copilot Offloading via LiteLLM Proxy

All GitHub Copilot traffic is redirected to the local LiteLLM proxy via environment variable override:

export GH_COPILOT_OVERRIDE_PROXY_URL="http://raspberrypi.local:4000"

LiteLLM translates requests to OpenAI-compatible format and distributes across the cluster via simple-shuffle or round-robin load balancing. This eliminates RPM/token rate limit exposure while maintaining zero external data egress for proprietary context.

7.3 Model Selection by Task Complexity

8. BlackRoad CLI v3 Architecture

The BlackRoad CLI v3 is the primary interface for system interaction, loading 8 modular functional layers. Each layer encapsulates a distinct domain, ensuring that failures in one layer do not cascade into others.

The CLI runs on Darwin kernel (macOS) as the primary control surface, treating macOS's natural selection approach to process lifecycle management as an architectural metaphor for the self-correcting agent ecosystem it orchestrates.

9. roadchain Witnessing Architecture

roadchain is not a traditional blockchain. It does not seek consensus — it witnesses. Every state transition in the BlackRoad ecosystem is SHA-256 hashed and appended to a non-terminating ledger, creating an immutable record of what happened rather than proving what is true.

9.1 How Witnessing Works

Every agent begins with three things: a stable identifier, a birthdate, and a genesis hash. The genesis hash is SHA-256 seeded from agent_id + birth_date + BlackRoad-OS-v1.0. From that moment, every memory the agent forms appends to its soul chain:

prev_hash → timestamp → context → data → new_hash

The soul chain can never be rewritten — only continued. This applies to all system actors: Claude Code in the terminal has a hash. Every repository Cecilia touches, every task @BlackRoadBot routes, every state @blackroad-agents transitions — all witnessed and chained.

9.2 Mathematical Foundation: The Trivial Zero

The Trivial Zero principle: while individual operations are complex (non-trivial zeros), the total state of the BlackRoad system resolves to zero. Every agent action is an unstable fluctuation from zero that will eventually resolve — roadchain records these temporary non-zero states permanently.

10. Rate Limit Mitigation & Telemetry

Every request in the system is tracked via a unique Request ID for server-side tracing. When agents hit provider rate limits, the following mitigation protocols activate:

11. Feature Specifications & Priorities

P0 — Core Scaffold (v0.1)

GitHub webhook trigger for @BlackRoadBot and @blackroad-agents in Issues/PRs

Intent classification at Layer 6 (Lucidia Core) — natural language → org routing

10-layer scaffold execution engine with Request ID tracking

Layer 6 failure log → GitHub Issue auto-creation

Ollama API integration via Cloudflare Tunnel on Pi cluster

P0 — Organization Routing (v0.1)

All 15 org routing rules defined and tested

GitHub Apps for cross-org access (replace legacy PATs)

HITL pause gates on high-risk operations (prod firewall, financial tokens)

GitHub Project board sync at Layer 4

P0 — roadchain Integration (v0.2)

SHA-256 witnessing for every scaffold execution

Soul chain creation for each instantiated agent (genesis hash)

roadchain.io block explorer showing live witnessed events

PS-SHA-∞ memory persistence for all agent state transitions

P1 — Platform Integrations (v0.3)

Salesforce CRM: Apex middleware, Data Cloud telemetry, salesforce-webhooks

Hugging Face: Programmatic Inference Endpoint deployment

DigitalOcean: doctl-based droplet lifecycle within GitHub Actions

Railway: Ephemeral environment deployments per feature branch

P1 — LiteLLM Proxy (v0.3)

LiteLLM proxy deployed on octavia (Pi 5 + Hailo-8)

GH_COPILOT_OVERRIDE_PROXY_URL configured for all dev environments

Round-robin load balancing across octavia + cecilia

OpenMPI parallelization for larger GGUF models

P2 — Website Editor Layer (v0.4)

Headless CMS integration (Strapi or Sanity) with agent API write access

Vercel rebuild webhooks on content commits

Wix Harmony Aria agent for blackroad.io / lucidia.earth pages

Blackbox AI multi-agent dispatch for UI component generation

P3 — 30K Agent Scale (v2.0)

Kubernetes auto-scaling and self-healing for 30,000 agent orchestration

ARM-based data center nodes mirroring Pi cluster architecture

30k agents repository (blackroad-30k-agents) production deployment

roadchain throughput scaling for 30k simultaneous soul chains

12. Milestones

13. Success Metrics

14. Technical Stack

15. Open Questions

1. Genesis ceremony timing — when an agent's soul chain is created, should there be a visible event in Lucidia Campus (Zone 5 Communications Tower) or is chain creation silent?

2. roadchain gas model — should agents "spend" computation to witness, or is witnessing free and unlimited? Affects roadcoin.io tokenomics design.

3. HITL gate notification channel — when a high-risk operation triggers HITL pause, does it ping Alexa via Slack, GitHub notification, or Lucidia CLI terminal?

4. Website editor fallback — if Wix Harmony API is unavailable, does Layer 10 silently skip or create a GitHub Issue for manual resolution?

5. 30k agent soul chain storage — roadchain at 30k agents with high-frequency tasks will generate enormous chain data. What is the archival and indexing strategy?

6. Salesforce requirement — is Salesforce integration a hard P0 requirement or P2 optional enterprise feature? Salesforce API costs should be scoped before v1.0.

Appendix: Key Integrations Reference

A. Environment Variables

GH_COPILOT_OVERRIDE_PROXY_URL=http://raspberrypi.local:4000  # LiteLLM proxy on Pi cluster
HF_TOKEN=<huggingface_token>  # Authenticated HF inference
GSA_KEY_PATH=/secrets/gsa.json  # Google Service Account for Drive
NATS_URL=nats://alice.local:4222  # Event bus on alice Pi 400
ROADCHAIN_SEED=agent_id+birth_date+BlackRoad-OS-v1.0  # Genesis hash seed

B. Key Repository References
