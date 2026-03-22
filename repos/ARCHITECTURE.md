# BlackRoad OS — Technical Architecture

> Distributed Multi-Agent Orchestration and Autonomous Infrastructure

## Overview

BlackRoad OS integrates a multi-layered CLI, the **Lucidia** decentralized memory core, and the **roadchain** witnessing ledger. Two autonomous routing matrices — **@BlackRoadBot** and **@blackroad-agents** — distribute high-level intent across cloud platforms, local hardware clusters, and fifteen specialized GitHub organizations.

## GitHub Enterprise Organizational Matrix

The enterprise is hosted at <https://github.com/enterprises/blackroad-os>. Fifteen organizations enforce the principle of least privilege — agents in one domain (e.g. BlackRoad-Security) are isolated from assets in another (e.g. BlackRoad-Ventures). Cross-organization access uses GitHub Apps rather than Personal Access Tokens (PATs) for short-lived, granular permissions.

See **[organizations.json](organizations.json)** for the full registry.

| Organization | Responsibility |
|---|---|
| Blackbox-Enterprises | Corporate and Enterprise Integrations |
| BlackRoad-AI | Core LLM and Reasoning Engine Development |
| BlackRoad-Archive | Long-term Data Persistence and Documentation |
| BlackRoad-Cloud | Infrastructure as Code and Orchestration |
| BlackRoad-Education | Onboarding and Documentation Frameworks |
| BlackRoad-Foundation | Governance and Protocol Standards |
| BlackRoad-Gov | Regulatory Compliance and Policy Enforcement |
| BlackRoad-Hardware | SBC and IoT Device Management |
| BlackRoad-Interactive | User Interface and Frontend Systems |
| BlackRoad-Labs | Experimental R&D and Prototyping |
| BlackRoad-Media | Content Delivery and Public Relations |
| BlackRoad-OS | Core System Kernel and CLI Development |
| BlackRoad-Security | Auditing, Cryptography, and Security |
| BlackRoad-Studio | Production Assets and Creative Tooling |
| BlackRoad-Ventures | Strategic Growth and Ecosystem Funding |

## Domain Registry

All domains are orchestrated via Cloudflare. Cloudflare Tunnels securely expose local Raspberry Pi nodes to the public internet for local inference without exposing internal ports.

See **[domains.json](domains.json)** for the full registry.

| Domain | Use Case | Organization |
|---|---|---|
| blackboxprogramming.io | Developer Education and APIs | Blackbox-Enterprises |
| blackroad.io | Core Project Landing Page | BlackRoad-OS |
| blackroad.company | Corporate and HR Operations | BlackRoad-Ventures |
| blackroad.me | Personal Agent Identity Nodes | BlackRoad-AI |
| blackroad.network | Distributed Network Interface | BlackRoad-Cloud |
| blackroad.systems | Infrastructure and System Ops | BlackRoad-Cloud |
| blackroadai.com | AI Research and API Hosting | BlackRoad-AI |
| blackroadinc.us | US-based Governance and Legal | BlackRoad-Gov |
| blackroadqi.com | Quantum Intelligence Research | BlackRoad-Labs |
| blackroadquantum.com | Primary Quantum Lab Interface | BlackRoad-Labs |
| lucidia.earth | Memory Layer and Personal AI | BlackRoad-AI |
| lucidia.studio | Creative and Asset Management | BlackRoad-Studio |
| roadchain.io | Blockchain and Witnessing Ledger | BlackRoad-Security |
| roadcoin.io | Tokenomics and Financial Interface | BlackRoad-Ventures |

## @blackroad-agents Deca-Layered Scaffold

Every task triggered by `@blackroad-agents` follows a ten-step scaffold. See **[scaffold.json](scaffold.json)** for the machine-readable definition.

| Step | Name | Description |
|---|---|---|
| 1 | Initial Reviewer | Lucidia Core (Layer 6) reviews intent, security, and resources |
| 2 | Task → Organization | Route to one of the fifteen BlackRoad organizations |
| 3 | Task → Team | Distribute within the org; pause for HITL on high-risk ops |
| 4 | Task → Project | Record in GitHub Project board; sync metadata with Salesforce |
| 5 | Task → Agent | Assign a specialized agent (Planner-Executor-Reflector pattern) |
| 6 | Task → Repository | Create a branch in the target repo (GitHub Flow) |
| 7 | Task → Device | Route to physical hardware (Pi firmware, Droplet rebuild) |
| 8 | Task → Drive | Distribute artifacts to Google Drive via GSA |
| 9 | Task → Cloudflare | Execute DNS / Tunnel configuration changes |
| 10 | Task → Website Editor | Update presentation layer via headless CMS or AI editor |

## BlackRoad CLI v3 — Layered Architecture

| Layer | Name | Function |
|---|---|---|
| 3 | Agents / System | Autonomous agent lifecycle management |
| 4 | Deploy / Orchestration | Infrastructure provisioning (cloud + local) |
| 5 | Branches / Environments | Ephemeral environments and git branching for agent tests |
| 6 | Lucidia Core / Memory | Long-term context, state transitions, simulation data |
| 7 | Orchestration | High-level task distribution (@blackroad-agents scaffold) |
| 8 | Network / API | REST and GraphQL endpoints for @BlackRoadBot |

A failure in Layer 8 (Network) does not affect state persistence in Layer 6 (Memory).

## Infrastructure — Local Inference via Raspberry Pi 5 Clusters

Copilot requests are offloaded to local Pi clusters to bypass external rate limits and keep proprietary context on the local network. See **[infrastructure.json](infrastructure.json)** for specs and mitigation strategies.

| Component | Specification | Role |
|---|---|---|
| Compute Node | Raspberry Pi 5 (8 GB LPDDR4X) | General Purpose Inference |
| Inference Accelerator | Raspberry Pi AI Hat 2 (40 TOPS) | INT8 LLM Processing |
| Network | Gigabit Ethernet with PoE+ HAT | Synchronized Communication |
| Storage | NVMe SSD (M.2, 256 GB+) | Model Weights and Agent Memory |
| Software | LiteLLM Proxy / Ollama / llama.cpp | API Hosting and Load Balancing |

**Proxy configuration:**

```sh
export GH_COPILOT_OVERRIDE_PROXY_URL="http://raspberrypi.local:4000"
```

The LiteLLM proxy translates requests into OpenAI-compatible format and distributes them across the cluster using round-robin load balancing.

## @BlackRoadBot Routing Matrix

When `@BlackRoadBot` is mentioned on an issue or PR, it identifies target platforms from natural language intent:

- **Salesforce** — Apex middleware creates Cases/Tasks; Data Cloud ingests GitHub telemetry via webhooks.
- **Hugging Face** — Dedicated inference endpoints for high-compute tasks exceeding local Pi capacity.
- **Ollama** — Routine tasks via Cloudflare Tunnel-exposed local models (e.g. Llama-3.2-3B-Instruct-GGUF).
- **DigitalOcean** — Droplet lifecycle management via `doctl` in GitHub Actions.
- **Railway** — Ephemeral test environments for feature branches.

## Rate-Limit Mitigation

| Provider | Limit | Mitigation |
|---|---|---|
| GitHub Copilot | RPM / Token Exhaustion | Redirect to local Raspberry Pi LiteLLM proxy |
| Hugging Face Hub | IP-based Rate Limit | Rotate HF_TOKEN or use authenticated SSH keys |
| Google Drive | Individual User Quota | Use Shared Drives with GSA Content Manager role |
| DigitalOcean API | Concurrent Build Limits | Queue tasks via Layer 7 Orchestration |
| Salesforce API | Daily API Request Cap | Batch updates via Data Cloud Streaming Transforms |

## roadchain — Witnessing Architecture

Every state transition (agent commits, bot routing, task updates) is hashed with SHA-256 and appended to a non-terminating ledger. roadchain records **what happened** rather than proving **what is true**, creating an immutable audit trail across the entire BlackRoad ecosystem.

## Future Scaling

The `blackroad-30k-agents` project targets 30,000 autonomous agents using Kubernetes auto-scaling and self-healing, transitioning from Pi clusters to larger ARM-based data centers while preserving the decentralized witnessing model.

---

*© BlackRoad OS, Inc. All rights reserved.*
