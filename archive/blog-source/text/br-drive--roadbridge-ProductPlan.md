# roadbridge ProductPlan

**Source:** br-drive

---

roadbridge

The BlackRoad-Native GitHub ↔ Drive Sync Engine

Product Planning Document  |  v1.0  |  Q1 2026

BlackRoad OS, Inc.  |  BlackRoad-Cloud Organization  |  Confidential

1. Executive Summary

GitHub and Google Drive exist on opposite ends of the data management spectrum — one a deterministic DAG of cryptographic snapshots, the other a continuous cloud sync engine optimized for availability and eventual consistency. Every integration that tries to force them together naively ends in .git corruption, ghost OAuth sessions, or iPaaS vendor lock-in at $69/month for capabilities that should be free infrastructure.

roadbridge is BlackRoad's answer: a self-hosted, roadchain-witnessed sync engine that treats GitHub as the source of truth for code and Drive as the authority for unstructured assets — and bridges them through an intelligent, event-driven middleware layer that runs entirely on BlackRoad's own infrastructure. No Zapier. No Make. No static Service Account keys sitting in CI secrets. No ghost logins.

Product owner: Alexa Amundson, BlackRoad OS, Inc.

Home organization: BlackRoad-Cloud

Target ship: Q2 2026 (v1.0 GA)

Primary runtime: Cloudflare Workers + Pi cluster (olympia LiteLLM proxy)

Classification: Internal — Confidential

2. Problem Statement

2.1 The Anti-Pattern Landscape

The research corpus is blunt: every naive approach to syncing GitHub and Google Drive is a documented failure mode. Storing a .git working directory inside a Google Drive sync folder triggers IPC lock conflicts within milliseconds, corrupts the HEAD pointer across machines, and leads to fatal repository errors that are often unrecoverable. This is the #1 anti-pattern in distributed developer tooling — and it happens constantly.

The "safe" alternatives all carry significant trade-offs:

Bare repositories in Drive are safe but manual, drop GitHub collaboration features, and introduce filesystem latency on every lstat call.

GitHub Actions with a Service Account JSON key exported as Base64 are functional but require a static, long-lived credential sitting in a CI secret — a direct credential leakage vector in multi-tenant cloud environments.

iPaaS platforms (Zapier, Make, Pipedream) are powerful but expensive ($19–$103/month), enforce multi-tenant credential storage, and create 'ghost login' OAuth persistence that survives password resets — a threat model BlackRoad explicitly does not accept.

2.2 BlackRoad-Specific Pain Points

BlackRoad's 15 GitHub organizations generate artifacts (builds, agent logs, roadchain entries, design assets) that need to land in Drive — today this is all manual.

Lucidia's memory system writes append-only journals that should be automatically committed to GitHub for versioning AND persisted to Drive for long-term retrieval — this two-way sync doesn't exist.

Agent outputs (Sprint reports, compliance docs, investor materials) are generated programmatically but have no automated delivery path from Workers/Pi to Drive.

roadchain witnessing has no Drive sink — audit entries exist in the ledger but aren't surfaced as human-readable documents in the project Drive.

Every iPaaS evaluation (Zapier MCP, Pipedream GitHub sync) requires surrendering OAuth tokens to a third-party cloud — not acceptable for BlackRoad-Security compliance posture.

3. Product Vision

roadbridge is a BlackRoad-native event-driven middleware that listens to GitHub webhooks and Google Drive push notifications, classifies the event with local inference, routes the payload through a clean transformation pipeline, and delivers it to the target platform — fully witnessed by roadchain, fully self-hosted, zero third-party credential exposure.

It is not a sync tool. It is not a backup tool. It is an intelligent bridge that understands the semantic difference between a compiled artifact, a Lucidia memory journal, a roadchain audit log, and a design asset — and treats each one appropriately.

roadbridge turns BlackRoad's distributed infrastructure into a coherent, observable data fabric connecting code history and unstructured knowledge.

4. Core Architecture

4.1 The Three-Layer Model

roadbridge is built on three clean layers, each independently deployable and testable:

4.2 Event Ingestion (Layer 1)

A single Cloudflare Worker deployed to roadbridge.blackroad.io intercepts all inbound events. GitHub webhooks are validated via HMAC-SHA256 against a secret stored in Cloudflare KV — no static JSON keys, no Base64 gymnastics. Drive push notifications are validated via channel token. All validated events are published to the NATS event bus with topic routing: github.push, github.release, github.pr.merged, drive.file.created, drive.file.modified.

4.3 Classifier & Router (Layer 2)

Olympia (Pi 4B) runs a LiteLLM proxy that classifies each inbound payload. Classification determines: what type of artifact this is, where it should go, and what transformation (if any) is needed before delivery. Classification runs locally — no external LLM calls for routing decisions. The output is a structured route object that Layer 3 executes.

4.4 Executor & Witness (Layer 3)

Layer 3 executes the route using scoped, short-lived credentials. For GitHub writes, roadbridge uses a dedicated GitHub App installation token (1-hour TTL, auto-refreshed) — never a PAT. For Drive writes, roadbridge uses Workload Identity Federation from the Pi cluster, eliminating static Service Account JSON keys entirely. Every successful transfer, every failure, and every retry is appended to roadchain with the event type, payload hash, source, destination, and timestamp.

5. Security Architecture

5.1 Eliminating the Anti-Patterns

The research is clear about the top three security risks in GitHub-Drive integration: static Service Account JSON keys in CI secrets, OAuth ghost logins via iPaaS platforms, and multi-tenant credential storage. roadbridge eliminates all three by design:

5.2 Credential Lifecycle

GitHub App installation tokens are fetched on-demand with a 1-hour TTL and never persisted to disk. Drive API tokens use short-lived credentials via Workload Identity Federation tied to the Pi cluster's node identity. The roadchain ledger records every credential negotiation event (issuance timestamp, scope, expiry) — not the token itself, but proof that a valid credential was obtained and used.

6. Competitive Positioning

6.1 Why Not Pipedream / Zapier / Make?

The research docs lay out exactly why the iPaaS tier falls short for BlackRoad's use case:

6.2 roadbridge's Unique Advantages

Zero third-party credential exposure — the entire pipeline runs on BlackRoad infrastructure.

Semantic routing via local inference — not all files are equal; roadbridge knows the difference between a memory journal and a compiled binary.

roadchain witnessing — every transfer is an immutable, auditable ledger entry. No other tool in this space has a witnessing layer.

@BlackRoadBot integration — any roadbridge route can be triggered via a GitHub comment, making it a first-class citizen of the deca-scaffold.

Two-way awareness — roadbridge doesn't just push from GitHub to Drive; it can respond to Drive events and open GitHub PRs for human review.

Fully free at BlackRoad's scale — no per-task billing, no tiered plans, no vendor lock-in.

7. Feature Specification

7.1 v1.0 Core Features

7.2 .roadbridge Config Format

Each GitHub repository can contain a .roadbridge.yml config at root. This file governs which files are synced, to which Drive folder, and under what conditions. Absence of the config means the repository inherits org-level defaults.

8. Lucidia Memory ↔ Drive Integration

The most architecturally interesting use of roadbridge is the Lucidia memory pipeline. Lucidia's append-only journals live in GitHub (version-controlled, PS-SHA∞ hashed) but need to be human-readable and searchable in Drive. roadbridge provides this bridge automatically.

This pipeline creates a closed loop: Lucidia's memory evolves in GitHub, surfaces in Drive for human collaboration, and edits in Drive flow back into GitHub as reviewed PRs — all witnessed end-to-end.

9. RAG Pipeline Integration

As the research notes, unstructured data in Google Drive is increasingly the input to RAG pipelines. roadbridge is positioned to be the synchronization layer that feeds BlackRoad's internal RAG system — ensuring that the vector database always reflects the current state of both the GitHub code corpus and the Drive knowledge corpus.

roadbridge emits a structured metadata envelope alongside every synced file that the RAG ingestion pipeline can consume directly — eliminating the need for manual document tagging or post-hoc metadata reconciliation.

10. Milestones & Timeline

11. Success Metrics

12. Risks & Mitigations

13. Open Questions

Should roadbridge expose a public API at roadbridge.io for enterprise customers to connect their own GitHub orgs and Drive workspaces — or remain BlackRoad-internal infrastructure only?

Does the Drive → GitHub PR flow require human approval on every conversion, or should high-confidence conversions (README updates, agent reports) be auto-merged?

Should the local classifier on olympia use a fine-tuned model trained on BlackRoad artifact types, or is a prompt-engineered general model sufficient for v1.0?

What is the governance model for the .roadbridge.yml config — who can modify sync rules for a given repo, and does that change require a roadchain-witnessed approval?

Should roadbridge integrate with Salesforce Data Cloud as a fourth data vertex (GitHub → Drive → roadchain → Salesforce), completing the BlackRoad enterprise data fabric?

14. Appendix: Drive Folder Schema

roadbridge writes to a structured folder hierarchy in the BlackRoad Google Drive workspace. All folder IDs are stored in Cloudflare KV under the roadbridge: namespace.

— End of Document —
