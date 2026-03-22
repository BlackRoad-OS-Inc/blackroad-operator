# BlackRoad Enterprise & Organization Constitution
> Source of truth for the multi-organization architecture under BlackRoad.
> Last updated: 2026-03-21

## Enterprise Hierarchy

```
BlackRoad (Enterprise)
├── BlackRoad-OS-Inc          ← TIER 0: REGISTRY / CONTROL DATA
├── BlackRoad-OS              ← TIER 1: PLATFORM / RUNTIME COORDINATION
├── BlackRoad-AI              ← TIER 2: AI models, agents, inference
├── BlackRoad-Cloud           ← TIER 2: Infrastructure, hosting, edge
├── BlackRoad-Security        ← TIER 2: Security tooling, audit, compliance
├── BlackRoad-Labs            ← TIER 2: R&D, experiments, prototypes
├── BlackRoad-Studio          ← TIER 2: Creative, design, brand assets
├── BlackRoad-Media           ← TIER 2: Content, publishing, marketing
├── BlackRoad-Interactive     ← TIER 2: Games, metaverse, VR/AR
├── BlackRoad-Hardware        ← TIER 2: Pi fleet, devices, IoT, Hailo
├── BlackRoad-Education       ← TIER 2: Learning, curriculum, Amundson math
├── BlackRoad-Foundation      ← TIER 2: Open knowledge, community, grants
├── BlackRoad-Gov             ← TIER 2: Compliance, legal, policy, governance
├── BlackRoad-Ventures        ← TIER 2: Products, revenue, SaaS verticals
├── BlackRoad-Archive         ← TIER 2: Historical, deprecated, reference
└── Blackbox-Enterprises      ← TIER 2: BlackBox Protocol, mesh, sovereignty
```

## Tier Definitions

- **Tier 0 — Registry**: What exists, where it lives, who owns it. The DNS of the enterprise.
- **Tier 1 — Platform**: How things run. Shared tooling, deployment, memory, coordination.
- **Tier 2 — Execution**: Domain-specific work. Each org owns its vertical.

## Organization Roles

| Org | Role | Tier |
|-----|------|------|
| **BlackRoad-OS-Inc** | Canonical registry of all organizations, repos, domains, agents, and corporate metadata — the single source of truth. | 0 |
| **BlackRoad-OS** | Shared platform layer: CLI tools, deployment scripts, memory system, agent runtime, and cross-org coordination. | 1 |
| **BlackRoad-AI** | AI models, training pipelines, inference endpoints, agent skills, and the sovereign AI stack. | 2 |
| **BlackRoad-Cloud** | Infrastructure automation, edge routing, DNS, TLS, WireGuard mesh, and hosting orchestration. | 2 |
| **BlackRoad-Security** | Security tooling, vulnerability scanning, audit frameworks, key management, and compliance checks. | 2 |
| **BlackRoad-Labs** | Experimental projects, research prototypes, and pre-production explorations. | 2 |
| **BlackRoad-Studio** | Design system, brand assets, templates, UI components, and visual identity. | 2 |
| **BlackRoad-Media** | Content publishing, marketing sites, blog, social media tooling, and PR. | 2 |
| **BlackRoad-Interactive** | Games, Pixel HQ metaverse, VR/AR experiences, and interactive web apps. | 2 |
| **BlackRoad-Hardware** | Pi fleet management, Hailo ML accelerators, IoT firmware, and device provisioning. | 2 |
| **BlackRoad-Education** | Learning platforms, curriculum, Amundson Framework publications, and educational content. | 2 |
| **BlackRoad-Foundation** | Open knowledge initiatives, community programs, grants, and public-good projects. | 2 |
| **BlackRoad-Gov** | Corporate governance, legal compliance, policy documents, regulatory filings, and board materials. | 2 |
| **BlackRoad-Ventures** | Revenue-generating products, SaaS verticals, Stripe integration, and customer-facing apps. | 2 |
| **BlackRoad-Archive** | Deprecated code, historical snapshots, sunset projects, and reference implementations. | 2 |
| **Blackbox-Enterprises** | BlackBox Protocol, multi-network mesh (Tor/IPFS/WebRTC/BitTorrent), sovereign networking. | 2 |

## OS-Inc vs OS: The Critical Distinction

| | BlackRoad-OS-Inc (Tier 0) | BlackRoad-OS (Tier 1) |
|---|---|---|
| **Contains** | Registry manifests, org definitions, domain maps, agent roster, corporate docs | CLI tools, deployment scripts, memory system, agent runtime, shared libraries |
| **Analogy** | The DNS of the enterprise — what exists and where | The kernel of the enterprise — how things run |
| **Changes** | Rarely. Deliberate. Constitutional. | Frequently. Operational. Iterative. |
| **Who reads** | Humans, agents, automation looking up "what is X" | Developers and agents building/deploying |
| **Who writes** | CEO / architect decisions only | Any contributor following standards |

**Rule: "Does X exist and where?" → OS-Inc. "How do I build/deploy/run X?" → OS.**

## The RoadCode Contract

Every org contains exactly one repo named `RoadCode`. It is the entry point, map, contract, and registry.

### Standard Structure

```
RoadCode/
├── README.md          # Org overview + navigation
├── ORG.md             # Constitution: purpose, scope, boundaries
├── REPOS.md           # Registry of all repos in this org
├── DOMAINS.md         # Domains mapped to this org
├── AGENTS.md          # Agents operating in this org
├── SERVICES.md        # Live services owned by this org
├── LICENSE            # BlackRoad OS proprietary
├── CLAUDE.md          # Agent instructions for this org
└── .github/
    ├── ISSUE_TEMPLATE/
    │   └── bug_report.md
    ├── PULL_REQUEST_TEMPLATE.md
    └── workflows/
        └── roadcode-validate.yml
```

### What Belongs in RoadCode

- Org purpose and scope definition
- Complete repo registry for the org
- Domain ownership declarations
- Agent assignments
- Service inventory
- Org-specific agent instructions
- Issue and PR templates

### What MUST NOT Be in RoadCode

- Application code
- Deployment scripts (those go in BlackRoad-OS)
- Build artifacts or dependencies
- Credentials or secrets
- Duplicated information from other RoadCode repos
- General-purpose tools (those go in BlackRoad-OS)

## Domain-to-Org Mapping

| Domain | Org | Purpose |
|--------|-----|---------|
| **blackroad.io** | BlackRoad-OS-Inc | Master index — the front door to everything |
| **blackroadinc.us** | BlackRoad-OS-Inc | Corporate/legal landing (US entity) |
| **blackroad.company** | BlackRoad-Gov | Corporate governance, investor-facing |
| **blackroad.me** | BlackRoad-Studio | Personal brand / portfolio / about Alexa |
| **blackroad.network** | BlackRoad-Cloud | Infrastructure status, network dashboard |
| **blackroad.systems** | BlackRoad-OS | Platform documentation, system architecture |
| **blackroadai.com** | BlackRoad-AI | AI products, model catalog, agent demos |
| **blackroadqi.com** | BlackRoad-AI | Quantum intelligence / advanced AI |
| **blackroadquantum.com** | BlackRoad-Labs | Quantum research, Amundson Framework |
| **blackroadquantum.info** | BlackRoad-Education | Educational docs, learning resources |
| **blackroadquantum.net** | Blackbox-Enterprises | BlackBox Protocol, mesh network |
| **blackroadquantum.shop** | BlackRoad-Ventures | Product store, SaaS checkout |
| **blackroadquantum.store** | BlackRoad-Ventures | Product store (alternate) |
| **blackboxprogramming.io** | Blackbox-Enterprises | BlackBox/sovereign tech landing |
| **lucidia.earth** | BlackRoad-Foundation | Open knowledge, community |
| **lucidia.studio** | BlackRoad-Studio | Creative tools, design platform |
| **lucidiaqi.com** | BlackRoad-AI | Lucidia AI agent interface |
| **roadchain.io** | Blackbox-Enterprises | Blockchain/chain infrastructure |
| **roadcoin.io** | BlackRoad-Ventures | Token/payment infrastructure |

**Rule: blackroad.io is the ONLY domain that links to ALL others. Every other domain serves its org's vertical.**

## Anti-Duplication Rules

1. **One canonical location per concept.** If a repo could live in two orgs, pick one. The other org links to it.
2. **Registry vs runtime.** Metadata → OS-Inc. Running code → domain org. Shared tools → OS.
3. **No forking between orgs.** Depend on it, don't copy it.
4. **Domains are 1:1 with orgs.** A domain belongs to exactly one org.
5. **Agents registered in OS-Inc, deployed in domain orgs.** Roster in OS-Inc. Code in domain org.
6. **Archive is for dead things only.** Active → domain org. Deprecated → Archive.

## Repo Naming Conventions

| Pattern | Meaning | Example |
|---------|---------|---------|
| `RoadCode` | Org entrypoint (one per org) | `BlackRoad-AI/RoadCode` |
| `road-*` | Shared platform tools | `road-deploy`, `road-cli` |
| `Road*` | Forked open-source (Road Fleet) | `RoadCode`, `TollBooth` |
| `blackroad-*` | BlackRoad-branded product/service | `blackroad-chat`, `blackroad-hq` |
| `br-*` | Internal CLI tools/scripts | `br-search`, `br-sync` |
| `*-blackroad` | Domain-specific app | `api-blackroad`, `auth-blackroad` |

**Rule: Lowercase with hyphens. No underscores. No camelCase.**

## Overlap Risk Resolution

| Risk | Resolution |
|------|------------|
| AI agents vs AI infrastructure | AI owns models/skills. Cloud owns compute/networking. |
| Security scanning vs compliance docs | Security owns tools. Gov owns policy/legal. |
| Product store vs revenue products | Ventures owns checkout/payment. Media owns marketing. |
| Experimental AI vs production AI | Labs owns pre-alpha. AI owns anything with users. |
| Brand assets vs media content | Studio owns design/templates. Media owns published content. |
| Mesh protocol vs cloud infra | Blackbox owns protocol/Tor/IPFS. Cloud owns traditional infra. |
| Education vs foundation | Education owns curriculum. Foundation owns community/grants. |

## blackroad.io as Master Index

blackroad.io serves as the **front door** for the entire enterprise. It must:

1. Link to every other domain with clear descriptions
2. Show the org hierarchy visually
3. Provide quick navigation to every vertical
4. Display live status of key services
5. Serve as the canonical "what is BlackRoad" page

Structure:
- Hero: BlackRoad OS identity + tagline
- Navigation grid: 19 domains organized by org tier
- Live stats: repos, agents, domains, services
- Quick links: products (Ventures), AI (BlackRoad-AI), docs (Education)
- Footer: corporate info, legal, contact
