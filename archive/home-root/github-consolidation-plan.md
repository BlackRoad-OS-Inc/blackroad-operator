# GitHub Org Consolidation Plan
# Generated 2026-03-09

## Current State: 17 accounts, 509 repos
## Target State: 3 orgs + personal (cleaned)

---

## Target Org Structure

### 1. BlackRoad-OS (main org) — real projects only
Everything that IS BlackRoad: core OS, Lucidia, infrastructure, tools, AI, websites.
Currently at 200 repos (GitHub limit). Must delete/archive ~150 to make room.

### 2. BlackRoad-OS-Inc (company) — keep as-is
21 repos, well-organized monorepo structure. This is the cleanest org. Keep it.

### 3. Blackbox-Enterprises (forks) — keep as-is
8 enterprise forks (n8n, temporal, prefect, etc.). Legitimate fork org.

### 4. blackboxprogramming (personal) — clean dupes
57 active repos, 23 are exact duplicates of org repos. Archive the dupes.

---

## Phase 1: Kill Ghost Orgs (12 orgs → 0)

These orgs are 80%+ archived scaffolds. Transfer any real repos to BlackRoad-OS, then delete the orgs.

### BlackRoad-Ventures (3 active, 5 archived)
Transfer to BlackRoad-OS (then archive org):
  - DELETE: .github (org profile/pages)
  - TRANSFER: partnerships → BlackRoad-OS
  - TRANSFER: portfolio → BlackRoad-OS
  - DELETE 5 archived repos (all scaffolds)

### BlackRoad-Foundation (2 active, 11 archived)
Transfer to BlackRoad-OS (then archive org):
  - TRANSFER: governance → BlackRoad-OS
  - DELETE: .github (org profile/pages)
  - DELETE 11 archived repos (all scaffolds)

### BlackRoad-Gov (4 active, 5 archived)
Transfer to BlackRoad-OS (then archive org):
  - TRANSFER: roadcoin-token → BlackRoad-OS
  - TRANSFER: compliance-framework → BlackRoad-OS
  - TRANSFER: audit-tools → BlackRoad-OS
  - DELETE: .github (org profile/pages)
  - DELETE 5 archived repos (all scaffolds)

### BlackRoad-Interactive (2 active, 10 archived)
Transfer to BlackRoad-OS (then archive org):
  - TRANSFER: interactive-core → BlackRoad-OS
  - DELETE: .github (org profile/pages)
  - DELETE 10 archived repos (all scaffolds)

### BlackRoad-Labs (3 active, 7 archived)
Transfer to BlackRoad-OS (then archive org):
  - TRANSFER: research → BlackRoad-OS
  - TRANSFER: experiments → BlackRoad-OS
  - DELETE: .github (org profile/pages)
  - DELETE 7 archived repos (all scaffolds)

### BlackRoad-Cloud (4 active, 6 archived)
Transfer to BlackRoad-OS (then archive org):
  - DELETE: .github (org profile/pages)
  - TRANSFER: cloud-gateway → BlackRoad-OS
  - TRANSFER: k8s-operators → BlackRoad-OS
  - TRANSFER: blackroad-terraform-modules → BlackRoad-OS
  - DELETE 6 archived repos (all scaffolds)

### BlackRoad-Security (3 active, 13 archived)
Transfer to BlackRoad-OS (then archive org):
  - TRANSFER: penetration-testing → BlackRoad-OS
  - TRANSFER: security-audits → BlackRoad-OS
  - DELETE: .github (org profile/pages)
  - DELETE 13 archived repos (all scaffolds)

### BlackRoad-Media (4 active, 9 archived)
Transfer to BlackRoad-OS (then archive org):
  - DELETE: .github (org profile/pages)
  - TRANSFER: content → BlackRoad-OS
  - TRANSFER: backroad-social → BlackRoad-OS
  - TRANSFER: brand-kit → BlackRoad-OS
  - DELETE 9 archived repos (all scaffolds)

### BlackRoad-Hardware (7 active, 7 archived)
Transfer to BlackRoad-OS (then archive org):
  - TRANSFER: blackroad-sensor-dashboard → BlackRoad-OS
  - TRANSFER: blackroad-device-registry → BlackRoad-OS
  - TRANSFER: blackroad-iot-gateway → BlackRoad-OS
  - TRANSFER: blackroad-fleet-tracker → BlackRoad-OS
  - TRANSFER: firmware → BlackRoad-OS
  - TRANSFER: hardware-specs → BlackRoad-OS
  - DELETE: .github (org profile/pages)
  - DELETE 7 archived repos (all scaffolds)

### BlackRoad-Education (4 active, 3 archived)
Transfer to BlackRoad-OS (then archive org):
  - TRANSFER: roadwork-platform → BlackRoad-OS
  - TRANSFER: courses → BlackRoad-OS
  - TRANSFER: tutorials → BlackRoad-OS
  - DELETE: .github (org profile/pages)
  - DELETE 3 archived repos (all scaffolds)

### BlackRoad-Studio (6 active, 1 archived)
Transfer to BlackRoad-OS (then archive org):
  - TRANSFER: canvas-studio → BlackRoad-OS
  - TRANSFER: video-studio → BlackRoad-OS
  - TRANSFER: writing-studio → BlackRoad-OS
  - TRANSFER: studio-core → BlackRoad-OS
  - TRANSFER: templates → BlackRoad-OS
  - DELETE: .github (org profile/pages)
  - DELETE 1 archived repos (all scaffolds)

### BlackRoad-Archive (5 active, 6 archived)
Transfer to BlackRoad-OS (then archive org):
  - TRANSFER: blackroad-document-archive → BlackRoad-OS
  - TRANSFER: blackroad-ipfs-tracker → BlackRoad-OS
  - TRANSFER: blackroad-backup-manager → BlackRoad-OS
  - TRANSFER: blackroad-web-archiver → BlackRoad-OS
  - DELETE: .github (org profile/pages)
  - DELETE 6 archived repos (all scaffolds)

## Phase 2: Clean BlackRoad-OS (200 → ~60 repos)

### Delete 28 archived subdomain repos (*-blackroad-io)
  - DELETE: compliance-blackroad-io
  - DELETE: contact-blackroad-io
  - DELETE: customers-blackroad-io
  - DELETE: dashboard-blackroad-io
  - DELETE: developers-blackroad-io
  - DELETE: docs-blackroad-io
  - DELETE: embeddings-blackroad-io
  - DELETE: enterprise-blackroad-io
  - DELETE: forkie-blackroad-io
  - DELETE: learn-blackroad-io
  - DELETE: legal-blackroad-io
  - DELETE: models-blackroad-io
  - DELETE: partners-blackroad-io
  - DELETE: playground-blackroad-io
  - DELETE: press-blackroad-io
  - DELETE: pricing-blackroad-io
  - DELETE: quantum-blackroad-io
  - DELETE: security-blackroad-io
  - DELETE: signup-blackroad-io
  - DELETE: simulator-blackroad-io
  - DELETE: solutions-blackroad-io
  - DELETE: status-blackroad-io
  - DELETE: store-blackroad-io
  - DELETE: support-blackroad-io
  - DELETE: trial-blackroad-io
  - DELETE: workshops-blackroad-io
  - DELETE: vision-blackroad-io
  - DELETE: auth-blackroad-io

### Delete 43 other archived repos
  - DELETE: templates
  - DELETE: youtube
  - DELETE: stripe-automation-docs
  - DELETE: sites
  - DELETE: blackroad-brand-official
  - DELETE: alexa
  - DELETE: blackroad-zone-manager
  - DELETE: blackroad-terraform-modules
  - DELETE: blackroad-agent-directory
  - DELETE: blackroad-30k-agent-monitoring
  - DELETE: blackroad-30k-agents-visualization
  - DELETE: blackroad-widget-factory
  - DELETE: blackroad-workflow-builder
  - DELETE: blackroad-config-manager
  - DELETE: blackroad-payroll-system
  - DELETE: blackroad-ab-testing
  - DELETE: blackroad-websocket-manager
  - DELETE: blackroad-xml-parser
  - DELETE: blackroad-os-plane
  - DELETE: blackroad-tax-calculator
  - DELETE: blackroad-incident-manager
  - DELETE: blackroad-event-sourcing
  - DELETE: blackroad-os-data-reports
  - DELETE: blackroad-dashboard-api
  - DELETE: aliceqi-com
  - DELETE: blackroadquantum-com
  - DELETE: roadcoin-io
  - DELETE: adaptive-edge-ai-optimizer
  - DELETE: blackroadquantum-info
  - DELETE: blackroad-admin-portal
  - DELETE: blackroad-os-lucidia-lab
  - DELETE: blackroad-deployment-package
  - DELETE: blackroadquantum-net
  - DELETE: lucidiaqi-com
  - DELETE: roadchain-io
  - DELETE: blackroadqi-com
  - DELETE: blackroadai-com
  - DELETE: blackroad-agent-cli
  - DELETE: BlackRoad-Anthropic
  - DELETE: BlackRoad-Communication
  - DELETE: BlackRoad-Google
  - DELETE: BlackRoad-Internal
  - DELETE: BlackRoad-OpenAI

### Archive/delete junk active repos
  - ARCHIVE: containers-template (580KB)
  - ARCHIVE: whisper.cpp (31989KB)
  - ARCHIVE: universal-computer (0KB)
  - ARCHIVE: remember (12KB)
  - ARCHIVE: quantum-math-lab (0KB)
  - ARCHIVE: new_world (16KB)
  - ARCHIVE: my-awesome-app (5KB)
  - ARCHIVE: BlackRoad-Personal (53KB)
  - ARCHIVE: blackroad-30k-agents (113KB)
  - ARCHIVE: blackroad-os-secrets (3137KB)
  - ARCHIVE: training-blackroad-io (107KB)
  - ARCHIVE: untitled-folder (5027KB)
  - ARCHIVE: blackroadinc-us (445KB)
  - ARCHIVE: chanfana-openapi-template (919KB)
  - ARCHIVE: apollo-30k-deployment (129KB)
  - ARCHIVE: claude-collaboration-system (149KB)
  - ARCHIVE: blackroad-hello (684KB)

### Archive repos that duplicate BlackRoad-OS-Inc
  - ARCHIVE: BlackRoad-OS/blackroad-os-docs (exists in BlackRoad-OS-Inc)
  - ARCHIVE: BlackRoad-OS/blackroad-hardware (exists in BlackRoad-OS-Inc)
  - ARCHIVE: BlackRoad-OS/blackroad-agents (exists in BlackRoad-OS-Inc)
  - ARCHIVE: BlackRoad-OS/blackroad-os-operator (exists in BlackRoad-OS-Inc)

## Phase 3: Clean Personal Account (57 → ~35 active)

### Archive 23 duplicates of org repos
  - ARCHIVE: alexa-amundson-portfolio
  - ARCHIVE: alexa-amundson-resume
  - ARCHIVE: blackroad-alfred
  - ARCHIVE: blackroad-chrome-extension
  - ARCHIVE: blackroad-desktop-app
  - ARCHIVE: blackroad-figma-plugin
  - ARCHIVE: blackroad-github-actions
  - ARCHIVE: blackroad-linear
  - ARCHIVE: blackroad-mobile-app
  - ARCHIVE: blackroad-notion
  - ARCHIVE: blackroad-postman
  - ARCHIVE: blackroad-priority-stack
  - ARCHIVE: blackroad-raycast
  - ARCHIVE: blackroad-slack-bot
  - ARCHIVE: blackroad-templates
  - ARCHIVE: blackroad-vscode-extension
  - ARCHIVE: blackroad.io
  - ARCHIVE: epstein-files-transparency
  - ARCHIVE: new_world
  - ARCHIVE: quantum-math-lab
  - ARCHIVE: remember
  - ARCHIVE: simulation-theory
  - ARCHIVE: universal-computer

## Phase 4: Merge BlackRoad-AI → BlackRoad-OS

14 active repos, all are BlackRoad AI stuff that belongs in the main org.
  - TRANSFER: blackroad-ai-deepseek → BlackRoad-OS
  - TRANSFER: lucidia-3d-wilderness → BlackRoad-OS
  - TRANSFER: lucidia-ai-models-enhanced → BlackRoad-OS
  - TRANSFER: blackroad-plans → BlackRoad-OS
  - TRANSFER: blackroad-ai-cluster → BlackRoad-OS
  - TRANSFER: blackroad-vllm-mvp → BlackRoad-OS
  - TRANSFER: blackroad-ai-qwen → BlackRoad-OS
  - TRANSFER: urban-goggles → BlackRoad-OS
  - TRANSFER: blackroad-ai-ollama → BlackRoad-OS
  - TRANSFER: blackroad-ai-memory-bridge → BlackRoad-OS
  - TRANSFER: lucidia-ai-models → BlackRoad-OS
  - TRANSFER: BlackRoad.io → BlackRoad-OS
  - TRANSFER: blackroad-ai-api-gateway → BlackRoad-OS
  - DELETE: .github

## Summary

| Action | Count |
|--------|-------|
| Orgs deleted | 12 (ghost orgs) + BlackRoad-AI |
| Repos deleted (archived junk) | ~151 |
| Repos archived | ~40 |
| Repos transferred | ~30 (from ghost orgs + AI) |
| Final org count | 3 + personal |
| Estimated final repo count | ~150 (down from 509) |