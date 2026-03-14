# BlackRoad OS — Organization Structure

## Hierarchy

```
BlackRoad-OS-Inc (SOURCE OF TRUTH — 22 repos)
├── blackroad-operator     ← THE monorepo, everything flows from here
├── blackroad              ← CLI, agents, CarPool, tools
├── blackroad-web          ← Frontend
├── blackroad-infra        ← IaC, CI/CD
├── blackroad-agents       ← Agent definitions
├── blackroad-docs         ← Architecture docs
├── blackroad-gateway      ← Tokenless AI gateway (CF Worker)
├── blackroad-sdk          ← @blackroad/sdk
├── blackroad-hardware     ← Fleet registry
├── blackroad-math         ← Mathematical foundations
├── blackroad-chat         ← AI chat interface
├── blackroad-brand-kit    ← Design system
├── blackroad-sf           ← Salesforce
├── blackroad-api          ← REST API
├── blackroad-workerd-edge ← Self-hosted Workers
└── local                  ← Mac backup sync
    │
    ▼ DOWNSTREAM (synced from operator)
    │
    ├── BlackRoad-OS (300 repos — main product org)
    │   ├── Core: blackroad-os-web, blackroad-os-core, blackroad-os-api
    │   ├── Packs: pack-finance, pack-education, pack-creator-studio, pack-legal
    │   ├── Lucidia: lucidia-core, lucidia-earth-website, lucidia-math
    │   └── Tools: road-*, blackroad-os-*
    │
    ├── BlackRoad-AI (16 repos — AI/models)
    │   ├── ai-api-gateway, ai-ollama, ai-deepseek, ai-qwen
    │   ├── ai-cluster, ai-memory-bridge, vllm-mvp
    │   └── lucidia-ai-models, lucidia-platform
    │
    ├── BlackRoad-Studio (7 repos — creator tools)
    │   ├── canvas-studio, video-studio, writing-studio
    │   └── studio-core, templates
    │
    ├── BlackRoad-Hardware (14 repos — edge devices)
    │   ├── device-registry, fleet-tracker, iot-gateway
    │   └── firmware, hardware-specs, sensor-dashboard
    │
    ├── BlackRoad-Security (16 repos — auth/security)
    │   ├── penetration-testing, security-audits
    │   └── (most archived — consolidate into operator)
    │
    ├── BlackRoad-Education (7 repos — learning)
    │   ├── roadwork-platform, courses, tutorials
    │   └── (aligns with Lucidia Platform)
    │
    ├── BlackRoad-Cloud (10 repos — cloud infra)
    │   ├── cloud-gateway, k8s-operators, terraform-modules
    │   └── (most archived)
    │
    ├── BlackRoad-Labs (10 repos — research)
    │   ├── research, experiments
    │   └── (most archived)
    │
    ├── BlackRoad-Media (13 repos — content)
    │   ├── content, backroad-social, brand-kit
    │   └── (most archived)
    │
    ├── BlackRoad-Gov (9 repos — governance)
    │   ├── roadcoin-token, compliance-framework, audit-tools
    │   └── (most archived)
    │
    ├── BlackRoad-Foundation (13 repos — public good)
    │   ├── governance, community
    │   └── (most archived)
    │
    ├── BlackRoad-Interactive (12 repos — gaming)
    │   ├── interactive-core
    │   └── (most archived)
    │
    ├── BlackRoad-Archive (11 repos — legacy)
    │   ├── document-archive, backup-manager, web-archiver
    │   └── (preservation only)
    │
    ├── BlackRoad-Ventures (8 repos — business)
    │   ├── partnerships, portfolio
    │   └── (most archived)
    │
    ├── Blackbox-Enterprises (8 repos — enterprise forks)
    │   ├── airbyte, n8n, temporal, huginn, prefect, activepieces
    │   └── (enterprise tool forks — valuable)
    │
    └── blackboxprogramming (161 repos — Alexa's personal)
        ├── Active projects: BlackRoad-Operating-System, lucidia, quantum-math-lab
        ├── Forks: pi-mono, openclaw, BitNet, etc.
        └── (personal dev brand, not part of downstream sync)
```

## Sync Rules

1. **BlackRoad-OS-Inc/blackroad-operator** is the canonical source
2. Changes flow DOWN: Inc → OS → downstream orgs
3. Each downstream org owns its VERTICAL (AI, Hardware, Education, etc.)
4. Archived repos stay archived — don't delete, they're IP proof
5. blackboxprogramming stays independent (Alexa's personal brand)
6. Blackbox-Enterprises stays independent (enterprise forks)

## Cleanup Priority

1. Archive remaining placeholder repos in downstream orgs
2. Consolidate duplicate repos (api-sdks, domains, hardware, web)
3. Ensure all active repos have accurate descriptions
4. Set up GitHub Actions to sync from operator → downstream
