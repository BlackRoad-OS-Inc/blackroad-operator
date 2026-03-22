<div align="center">

<img src="https://images.blackroad.io/pixel-art/road-logo.png" alt="BlackRoad OS" width="80" />

# BlackRoad Source

**The canonical source tree for BlackRoad OS — every component, every service, every agent, organized.**

[![BlackRoad OS](https://img.shields.io/badge/BlackRoad_OS-Pave_Tomorrow-FF2255?style=for-the-badge&labelColor=000000)](https://blackroad.io)
[![License](https://img.shields.io/badge/License-Proprietary-FF6B2B?style=for-the-badge&labelColor=000000)](./LICENSE)

</div>

---

## Structure

```
BlackRoad-Source/
├── agents/           # AI agent definitions, skills, tools
│   ├── cece/         # CECE personality + consciousness models
│   ├── lucidia/      # Lucidia orchestrator + reasoning
│   ├── operator/     # Operator agent (br CLI)
│   ├── domain-agents/# Specialized domain experts
│   ├── system-agents/# Infrastructure automation agents
│   ├── codex/        # Code generation agents
│   ├── skills/       # Agent skill definitions
│   ├── tools/        # Agent tool integrations
│   └── templates/    # Agent prompt templates
├── api/              # API layers
│   ├── auth/         # Authentication + JWT
│   ├── gateway/      # API gateway + routing
│   ├── graphql/      # GraphQL schema + resolvers
│   ├── rest/         # REST endpoints
│   ├── websocket/    # Real-time connections
│   ├── agents/       # Agent API
│   ├── nodes/        # Fleet node API
│   └── services/     # Service discovery API
├── apps/             # Product applications
│   ├── roadpay/      # Billing system (D1 + Stripe)
│   ├── roadsearch/   # FTS5 search engine
│   ├── roadchat/     # Multi-model AI chat
│   ├── roadchain/    # Layer-1 blockchain
│   ├── roadc/        # Custom programming language
│   ├── portal/       # Unified search portal
│   ├── studio/       # Creative studio
│   └── social/       # BackRoad social platform
├── brand/            # Design system
│   ├── colors/       # Color palette + gradients
│   ├── typography/   # Font definitions
│   ├── components/   # UI component library
│   └── layouts/      # Page layout templates
├── cli/              # Command-line interfaces
│   ├── br/           # Main br CLI dispatcher
│   ├── br-agent/     # Agent management
│   ├── br-node/      # Node management
│   ├── br-service/   # Service management
│   ├── br-config/    # Configuration
│   ├── br-models/    # Ollama model management
│   └── tools/        # 105 CLI tool scripts
├── config/           # Configuration
│   ├── agents/       # Agent configs
│   ├── environments/ # Environment definitions
│   ├── policies/     # Security policies
│   ├── routing/      # Traffic routing rules
│   ├── secrets/      # Secret management (refs only)
│   └── services/     # Service configurations
├── core/             # Core system
│   ├── execution/    # Task execution engine
│   ├── graph/        # Knowledge graph
│   ├── memory/       # Memory subsystem
│   ├── messaging/    # NATS + pub/sub
│   ├── protocols/    # Communication protocols
│   ├── registry/     # Service registry
│   ├── scheduler/    # Task scheduler
│   ├── state/        # State management
│   ├── task-engine/  # Task engine
│   └── utilities/    # Shared utilities
├── corporate/        # Corporate documents
│   ├── formation/    # Delaware C-Corp papers
│   ├── compliance/   # Compliance framework
│   ├── finance/      # Financial operations
│   └── legal/        # Legal documents
├── data/             # Data management
│   ├── cache/        # Cache layers
│   ├── datasets/     # Training datasets
│   ├── embeddings/   # Vector embeddings
│   ├── indexes/      # Search indexes
│   ├── logs/         # System logs
│   ├── snapshots/    # State snapshots
│   └── telemetry/    # Telemetry data
├── docs/             # Documentation
│   ├── agents/       # Agent documentation
│   ├── api/          # API documentation
│   ├── architecture/ # Architecture diagrams
│   ├── guides/       # User guides
│   ├── infrastructure/# Infrastructure docs
│   ├── operators/    # Operator manuals
│   └── whitepapers/  # Research papers
├── domains/          # Domain configurations
│   ├── blackroad.io/ # Main domain
│   ├── lucidia.earth/# Lucidia domain
│   ├── roadchain.io/ # Blockchain domain
│   └── blackroadai.com/ # AI domain
├── fleet/            # Pi fleet management
│   ├── alice/        # Pi 400 — Gateway, DNS, PostgreSQL
│   ├── cecilia/      # Pi 5 — AI inference, 15 models
│   ├── octavia/      # Pi 5 — Gitea, Docker, NVMe
│   ├── aria/         # Pi 5 — Container orchestration
│   ├── lucidia/      # Pi 5 — 334 web apps, APIs
│   ├── gematria/     # DO droplet — Edge gateway
│   └── anastasia/    # DO droplet — WireGuard hub
├── infrastructure/   # Infrastructure-as-code
│   ├── cloud/        # Cloud configs
│   ├── cloudflare/   # Workers, Pages, D1, KV, R2
│   ├── deployments/  # Deployment configs
│   ├── k8s/          # Kubernetes manifests
│   ├── terraform/    # Terraform modules
│   └── vercel/       # Vercel configs
├── marketplace/      # Task marketplace
│   ├── tasks/        # Available tasks
│   ├── skills/       # Required skills
│   └── bounties/     # Task bounties
├── memory/           # Memory 2048 system
│   ├── 2048/         # Hierarchical compression engine
│   ├── journal/      # Hash-chained journal
│   ├── codex/        # Solutions + patterns DB
│   ├── tils/         # Today-I-Learned broadcast
│   ├── collaboration/# Cross-session collaboration
│   └── recall/       # 6-strategy recall engine
├── models/           # AI models
│   ├── embeddings/   # Embedding models
│   ├── fine-tuning/  # Fine-tuning configs
│   ├── llm/          # Language models
│   ├── routing/      # Model routing
│   ├── speech/       # TTS/STT models
│   ├── vision/       # Computer vision (Hailo-8)
│   └── evaluation/   # Model evaluation
├── nodes/            # Node definitions
│   ├── raspberry-pi/ # Pi node configs
│   ├── cloud/        # Cloud node configs
│   ├── edge/         # Edge node configs
│   ├── mac/          # Mac workstation
│   └── node-config/  # Shared node config
├── orchestrator/     # 30K agent orchestrator
│   ├── spawn/        # Spawn scheduler
│   ├── pipelines/    # Multi-agent pipelines
│   ├── jobs/         # Recurring jobs
│   └── supervisor/   # Node supervisors
├── runtime/          # Runtime systems
│   ├── containers/   # Docker/OCI configs
│   ├── environments/ # Runtime environments
│   ├── orchestrator/ # Container orchestration
│   ├── pipelines/    # CI/CD pipelines
│   ├── queue/        # Message queues
│   ├── scheduler/    # Process scheduling
│   └── workers/      # Worker-to-Node runner
├── scripts/          # Automation scripts
│   ├── bootstrap/    # Initial setup
│   ├── deploy/       # Deployment scripts
│   ├── install/      # Installation scripts
│   ├── maintenance/  # Maintenance tasks
│   ├── migration/    # Migration scripts
│   └── setup/        # Environment setup
├── services/         # Microservices
│   ├── analytics/    # Analytics engine
│   ├── compute/      # Compute service
│   ├── gateway/      # API gateway
│   ├── indexing/     # Search indexing
│   ├── inference/    # AI inference
│   ├── notifications/# Notification service
│   ├── orchestration/# Service orchestration
│   ├── routing/      # Traffic routing
│   ├── search/       # Search service
│   └── storage/      # Object storage
├── system/           # System layer
│   ├── auth/         # Authentication
│   ├── events/       # Event system
│   ├── identity/     # Identity management
│   ├── kernel/       # OS kernel
│   ├── lifecycle/    # Service lifecycle
│   ├── logging/      # Centralized logging
│   ├── monitoring/   # Fleet monitoring
│   ├── networking/   # Network management
│   ├── permissions/  # RBAC permissions
│   ├── security/     # Security subsystem
│   └── storage/      # Storage management
├── tests/            # Test suites
│   ├── agents/       # Agent tests
│   ├── api/          # API tests
│   ├── integration/  # Integration tests
│   ├── performance/  # Performance benchmarks
│   ├── services/     # Service tests
│   └── unit/         # Unit tests
├── users/            # User management
│   ├── agents/       # Agent user accounts
│   ├── humans/       # Human user accounts
│   ├── sessions/     # Active sessions
│   └── permissions/  # Permission matrices
└── web/              # Web frontends
    ├── admin/        # Admin panel
    ├── brand/        # Brand templates (20 JSX + 34 HTML)
    ├── console/      # Operations console
    ├── dashboard/    # Fleet dashboard
    ├── docs/         # Documentation site
    ├── public/       # Public assets
    └── studio/       # Creative studio
```

## Stats

- **198 directories** — organized by function
- **44 source files** — with more being populated from 627 repos
- **20 JSX components** — brand design system
- **30,000 agents** — orchestrator in `orchestrator/`
- **Memory 2048** — hierarchical compression in `memory/2048/`

## License

**Proprietary** — Copyright (c) 2024-2026 BlackRoad OS, Inc. All rights reserved.

---

<div align="center">

**BlackRoad OS — Pave Tomorrow.**

</div>
