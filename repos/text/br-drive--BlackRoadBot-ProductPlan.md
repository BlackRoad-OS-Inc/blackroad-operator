# BlackRoadBot ProductPlan

**Source:** br-drive

---

@BlackRoadBot

Autonomous GitHub Routing Matrix

Product Planning Document  |  v1.0  |  Q1 2026

BlackRoad OS, Inc.  |  Confidential

1. Executive Summary

@BlackRoadBot is the intelligent routing matrix at the center of BlackRoad OS — a GitHub-native bot that accepts natural language commands in issues and pull requests, then autonomously dispatches work across BlackRoad's 15 GitHub organizations, hardware clusters, cloud providers, and external platforms.

Today this capability exists in documentation and architectural intent. This planning document defines the path to a shipped, production-grade v1.0 — one that developers, agents, and operators can depend on.

Product owner: Alexa Amundson, BlackRoad OS, Inc.

Target ship: Q2 2026 (v1.0 GA)

Classification: Internal — Confidential

2. Problem Statement

2.1 The Core Friction

BlackRoad's infrastructure spans 15 GitHub organizations, 19 domains, 85+ Cloudflare Workers, a Pi cluster, two DigitalOcean droplets, and integrations with Salesforce, Hugging Face, Railway, and Google Drive. Coordinating work across this surface today requires manually context-switching between platforms, writing custom scripts per task, and holding routing logic in the architect's head.

This does not scale to 1,000 agents — let alone 30,000.

2.2 Secondary Frictions

No single entry point for triggering cross-platform automation from GitHub

Rate limits on centralized LLM providers (GitHub Copilot, HF Inference) block agentic workflows

Artifact routing to Drive, Cloudflare DNS, and the website layer requires manual intervention

No audit trail connecting a GitHub comment to its downstream effect in Salesforce, Cloudflare, or deployed code

3. Product Vision

A developer or an agent types @BlackRoadBot [natural language intent] into any GitHub issue or PR. Within seconds, the intent is parsed, classified, routed to the right organization and platform, executed, and confirmed — with every state transition witnessed by roadchain and surfaced back in the original thread.

@BlackRoadBot is the single control plane for the BlackRoad ecosystem.

4. Target Users

5. Core Feature: The 10-Layer Scaffold

Every @BlackRoadBot invocation passes through a deterministic 10-layer execution scaffold. Each layer is independently testable and observable.

6. Routing Matrix

6.1 Organization Mapping

The bot uses intent classification to determine the target organization. Classification runs locally via the Ollama proxy before any external API calls are made.

6.2 Platform Integration Map

7. Rate Limit Mitigation Strategy

Centralized LLM providers impose rate limits that are incompatible with autonomous agent workflows. @BlackRoadBot mitigates this through a tiered local-first inference architecture.

7.1 Local Inference Stack

7.2 Fallback Chain

8. roadchain: Witnessing Every Action

Every state transition triggered by @BlackRoadBot is hashed and appended to the roadchain non-terminating ledger. This creates an immutable, auditable record of cause and effect across the entire ecosystem — not just code commits, but DNS changes, agent instantiations, Salesforce syncs, and device deployments.

8.1 What Gets Witnessed

GitHub comment that triggered the invocation (hash of comment_id + body + actor)

Intent classification result and confidence score

Organization and team routing decision with rationale

Agent ID assigned to the task, model used, and inference node

Branch created, files changed, PR opened

External platform API calls (Cloudflare, DigitalOcean, HF) with response codes

Final task status: success, partial, failed, escalated to HITL

8.2 Witnessing Format

Each entry is stored as: SHA-256(previous_hash || timestamp || event_type || payload_json). The genesis block is 64 zeros — the Trivial Zero from which all BlackRoad system state diverges and ultimately resolves.

9. Milestones & Timeline

10. Success Metrics

11. Risks & Mitigations

12. Open Questions

Should @BlackRoadBot be installable by external GitHub users (public-facing product) or remain internal infrastructure?

Which Salesforce objects best map to BlackRoad tasks — Cases, Custom Objects, or Data Cloud streams?

Does Layer 10 (website editor) belong in @BlackRoadBot v1.x or as a separate product (@BlackRoadSite)?

What is the governance model for HITL approvers as the team scales — single approver (Alexa) vs. org-level approval roles?

Should roadchain be exposed as a public API (roadchain.io) for enterprise audit compliance, or remain internal only?

13. Appendix: Organization Quick Reference

— End of Document —
