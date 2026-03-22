# BlackRoad Code Manifest
# Generated 2026-03-09
# Total: 509 repos (276 active) across 17 GitHub orgs + extensive local code
# Total GitHub code: ~790 MB across 229 repos with real code

---

## 1. CORE OS -- CLI, SDK, Core Libraries, Config

### Primary Repos

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-OS-Inc/blackroad | TS, Py, HTML, Go | 274.8 MB | Monorepo -- main BlackRoad platform (operator, dashboards, CLI, workers, carpool) |
| BlackRoad-OS-Inc/blackroad-operator | TS, Py, HTML, Go | 240.4 MB | DUPLICATE of above -- operator subsystem extracted |
| BlackRoad-OS/BlackRoad-Private | Py, HTML, TS, C++ | 164.7 MB | Proprietary core -- agent orchestration, PS-SHA-infinity identity, RoadChain |
| BlackRoad-OS-Inc/blackroad-core | Shell, Py, JS, TS | 1.4 MB | Core libraries and shared utilities |
| BlackRoad-OS-Inc/blackroad-cli | HTML, Py, JS, Shell | 1.9 MB | CLI package for `br` command |
| BlackRoad-OS/blackroad-cli-npm | JS | 15 KB | NPM-published CLI wrapper |
| BlackRoad-OS-Inc/blackroad-sdk | Py, TS, Rust, Go | 238 KB | Multi-language SDK for BlackRoad APIs |
| BlackRoad-OS/blackroad-api-sdks | Go, Py, TS | 15 KB | API SDK stubs for Go, Python, TypeScript |
| BlackRoad-OS-Inc/blackroad-gateway | TS, Go, Py | 88 KB | API gateway service |
| BlackRoad-OS/blackroad-keys | TS | 19 KB | Key management and auth tokens |
| BlackRoad-OS/blackroad-flags | TS | 16 KB | Feature flag system |

### Local: Core CLI (~/blackroad/src/)

| Path | Language | Description |
|------|----------|-------------|
| ~/blackroad/src/bin/br.ts | TypeScript | Main CLI entry point (`br` command) |
| ~/blackroad/src/cli/commands/agents.ts | TypeScript | Agent management commands |
| ~/blackroad/src/cli/commands/config.ts | TypeScript | Config read/write commands |
| ~/blackroad/src/cli/commands/deploy.ts | TypeScript | Deployment commands |
| ~/blackroad/src/cli/commands/gateway.ts | TypeScript | Gateway management |
| ~/blackroad/src/cli/commands/init.ts | TypeScript | Project initialization |
| ~/blackroad/src/cli/commands/invoke.ts | TypeScript | Function invocation |
| ~/blackroad/src/cli/commands/logs.ts | TypeScript | Log streaming |
| ~/blackroad/src/cli/commands/status.ts | TypeScript | System status |
| ~/blackroad/src/core/client.ts | TypeScript | API client |
| ~/blackroad/src/core/config.ts | TypeScript | Config loader |
| ~/blackroad/src/core/logger.ts | TypeScript | Structured logging |
| ~/blackroad/src/core/spinner.ts | TypeScript | Terminal spinner animations |
| ~/blackroad/src/formatters/brand.ts | TypeScript | Brand-compliant output formatting |
| ~/blackroad/src/formatters/json.ts | TypeScript | JSON output formatter |
| ~/blackroad/src/formatters/table.ts | TypeScript | Table output formatter |
| ~/blackroad/src/workers/base-worker.js | JavaScript | Cloudflare Worker base class |

### Local: MCP Bridge (~/blackroad/mcp-bridge/)

| Path | Language | Description |
|------|----------|-------------|
| ~/blackroad/mcp-bridge/ | Python | Model Context Protocol bridge -- 774 code files, connects LLMs to BlackRoad tools |

### Local: Prism Console (~/blackroad/orgs/blackroad-os/blackroad-prism-console/)

| Path | Language | Description |
|------|----------|-------------|
| ~/blackroad/orgs/blackroad-os/blackroad-prism-console/ | TypeScript | Full Prism console app -- 4,973 code files, Airtable + PostgreSQL integration |

---

## 2. AI & MODELS -- Lucidia, Ollama, Inference, Agents, Memory

### Lucidia (Primary AI Entity)

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-OS/lucidia-core | HTML, Py, Shell | 1.8 MB | Core Lucidia AI runtime and personality engine |
| BlackRoad-OS/blackroad-os-lucidia | Py, HTML, Shell, JS | 227 KB | Lucidia OS integration layer |
| BlackRoad-OS/lucidia-earth-website | HTML, TS, Shell, JS | 1.8 MB | Lucidia public website (lucidia.earth) |
| BlackRoad-OS/lucidia-agents | TS, JS | 100 KB | Lucidia autonomous agent framework |
| BlackRoad-OS/lucidia-command-center | HTML, Shell | 24 KB | Terminal-based Lucidia control panel |
| BlackRoad-OS/lucidia-studio | TS, HTML | 15 KB | Lucidia creative studio interface |
| BlackRoad-OS/lucidia-math | HTML, Py, Shell | 1.6 MB | Mathematical reasoning module for Lucidia |
| BlackRoad-AI/lucidia-ai-models | HTML, Py | 70 KB | Lucidia model definitions and configs |
| BlackRoad-AI/lucidia-ai-models-enhanced | HTML, Py | 79 KB | Enhanced model configs with fine-tuning |
| BlackRoad-AI/lucidia-3d-wilderness | HTML | 43 KB | 3D wilderness environment for Lucidia |
| blackboxprogramming/lucidia-cli | Py, Shell | 221 KB | DUPLICATE -- Lucidia CLI tool (also local) |

### Local: Lucidia CLI (~/lucidia-cli/)

| Path | Language | Description |
|------|----------|-------------|
| ~/lucidia-cli/agents.py | Python | Agent orchestration for Lucidia |
| ~/lucidia-cli/br_splash.py | Python | Brand splash screen |
| ~/lucidia-cli/index_github.py | Python | GitHub repository indexer |
| ~/lucidia-cli/setup.py | Python | Package installer |
| ~/lucidia-cli/commands/chat.py | Python | Interactive chat interface |
| ~/lucidia-cli/components/web_engine.py | Python | Web browsing engine |
| ~/lucidia-cli/components/virtual_fs.py | Python | Virtual filesystem |
| ~/lucidia-cli/components/apps.py | Python | Application launcher |
| ~/lucidia-cli/components/process_mgr.py | Python | Process management |
| ~/lucidia-cli/components/editor.py | Python | Built-in text editor |
| ~/lucidia-cli/components/shell.py | Python | Shell emulation |
| ~/lucidia-cli/components/docker.py | Python | Docker management |
| ~/lucidia-cli/components/git.py | Python | Git operations |
| ~/lucidia-cli/components/api.py | Python | API client |
| ~/lucidia-cli/components/dashboard.py | Python | System dashboard |
| ~/lucidia-cli/components/kanban.py | Python | Kanban board |
| ~/lucidia-cli/components/calendar.py | Python | Calendar |
| ~/lucidia-cli/components/sql.py | Python | SQL query runner |
| ~/lucidia-cli/components/chat.py | Python | Chat interface |
| ~/lucidia-cli/components/notes.py | Python | Notes manager |
| ~/lucidia-cli/components/games.py | Python | Built-in games |
| ~/lucidia-cli/components/media.py | Python | Media player |
| ~/lucidia-cli/components/devtools.py | Python | Developer tools |
| ~/lucidia-cli/components/productivity.py | Python | Productivity suite |
| ~/lucidia-cli/components/system.py | Python | System info |
| ~/lucidia-cli/components/config.py | Python | Config manager |
| ~/lucidia-cli/components/notifications.py | Python | Notification system |
| ~/lucidia-cli/components/web.py | Python | Web server |
| ~/lucidia-cli/components/files.py | Python | File manager |
| ~/lucidia-cli/components/extras.py | Python | Miscellaneous extras |

### AI Agents & Orchestration

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-OS/blackroad-agents | HTML, Py, Shell | 1.6 MB | Multi-agent framework and agent definitions |
| BlackRoad-OS-Inc/blackroad-agents | Shell, Py, TS | 1.6 MB | DUPLICATE -- agent orchestration (Inc org) |
| BlackRoad-OS/blackroad-agent-os | HTML, Py, Shell, JS | 1.5 MB | Agent operating system runtime |
| BlackRoad-OS/blackroad-30k-agents | Py, Shell | 41 KB | 30K agent deployment system |
| BlackRoad-OS/apollo-30k-deployment | TS, Shell | 95 KB | Apollo-scale agent deployment tooling |
| BlackRoad-OS/agent-registry | Py | 5 KB | Central agent registry service |
| BlackRoad-OS/blackroad-multi-ai-system | HTML, Shell | 1.2 MB | Multi-AI coordination system |

### AI Models & Inference

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-OS/blackroad-models | HTML, Shell, Py | 1.5 MB | Model management and serving |
| BlackRoad-OS/ai | Py | 133 KB | Core AI utilities and inference wrappers |
| BlackRoad-OS/whisper.cpp | C++, C, CUDA, Metal | 12.0 MB | Speech-to-text (fork of whisper.cpp) |
| BlackRoad-AI/blackroad-vllm-mvp | JS, HTML, Py | 76 KB | vLLM inference MVP |
| BlackRoad-AI/blackroad-ai-cluster | Py, HTML, Shell | 58 KB | Multi-node AI cluster management |
| BlackRoad-AI/blackroad-ai-qwen | HTML, Py, Shell | 47 KB | Qwen model integration |
| BlackRoad-AI/blackroad-ai-ollama | HTML, Py, Shell | 43 KB | Ollama model management |
| BlackRoad-AI/blackroad-ai-deepseek | HTML, Py | 29 KB | DeepSeek model integration |
| BlackRoad-AI/blackroad-ai-api-gateway | JS, Py | 22 KB | AI API routing gateway |
| BlackRoad-OS/blackroad-ai-inference-accelerator | Shell | 5 KB | Hailo-8 accelerator configuration |
| BlackRoad-OS/blackroad-localai | HTML, Py, JS | 27 KB | LocalAI integration |
| BlackRoad-OS/blackroad-langchain-studio | HTML, Py, JS | 28 KB | LangChain experiment workspace |

### Memory & Knowledge

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-AI/blackroad-ai-memory-bridge | Py, HTML | 75 KB | AI memory persistence bridge |
| BlackRoad-OS/blackroad-memory-system | HTML | 5 KB | Memory storage and retrieval system |
| BlackRoad-OS/remember | Py | 12 KB | Memory recall and context system |
| blackboxprogramming/remember | Py | 15 KB | DUPLICATE -- memory system |
| BlackRoad-OS/claude-collaboration-system | Shell, HTML | 114 KB | Claude AI collaboration framework |
| BlackRoad-OS/blackroad-os-codex | HTML, Py, Shell | 1.4 MB | Knowledge codex and documentation system |
| BlackRoad-OS/blackroad-os-codex-infinity | Shell, Py | 9 KB | Infinite codex expansion engine |

### Local: AI Tools (~/blackroad/tools/)

| Path | Language | Description |
|------|----------|-------------|
| ~/blackroad/tools/ai-hub/br-ai.sh | Shell | AI model hub -- query, manage, switch models |
| ~/blackroad/tools/ai/br-ai.sh | Shell | AI inference CLI wrapper |
| ~/blackroad/tools/llm/br-llm.sh | Shell | LLM direct interaction tool |
| ~/blackroad/tools/model/br-model.sh | Shell | Model download/manage/serve |
| ~/blackroad/tools/memory-api/br-memory-api.sh | Shell | Memory API server launcher |
| ~/blackroad/tools/memory-api/server.py | Python | Memory API FastAPI server |
| ~/blackroad/tools/coding-assistant/br-code.py | Python | AI coding assistant |
| ~/blackroad/tools/coding-assistant/br-code.sh | Shell | AI coding assistant launcher |
| ~/blackroad/tools/coding-assistant/BlackRoad.Modelfile | Ollama | Custom Ollama model definition |

### Local: CarPool Agent System (~/blackroad/carpool/)

| Path | Language | Description |
|------|----------|-------------|
| ~/blackroad/carpool/ | JSON, Python | Agent orchestration system -- 25+ agent definitions, treasury, events |
| ~/blackroad/carpool/treasury/roadchain/ | Python | RoadChain -- cli.py, compliance.py, exchange.py, miner.py, mint.py, payments.py |
| ~/blackroad/carpool/treasury/bitcoin_miner.py | Python | Bitcoin mining script |
| ~/blackroad/carpool/treasury/quantum_framework.py | Python | Quantum computing framework for treasury |

### Local: CLI Scripts (~/blackroad/scripts/cli/)

| Path | Language | Description |
|------|----------|-------------|
| ~/blackroad/scripts/cli/ask-alice | Shell | Query Alice Pi node |
| ~/blackroad/scripts/cli/ask-lucidia | Shell | Query Lucidia AI |
| ~/blackroad/scripts/cli/ask-octavia | Shell | Query Octavia node |
| ~/blackroad/scripts/cli/ask-aria | Shell | Query Aria node |
| ~/blackroad/scripts/cli/ask-anastasia | Shell | Query Anastasia droplet |
| ~/blackroad/scripts/cli/ask-gematria | Shell | Query Gematria droplet |
| ~/blackroad/scripts/cli/ask-cadence | Shell | Query Cadence AI entity |
| ~/blackroad/scripts/cli/ask-silas | Shell | Query Silas AI entity |
| ~/blackroad/scripts/cli/blackroad-ai | Shell | AI model interaction |
| ~/blackroad/scripts/cli/agent-collab | Shell | Multi-agent collaboration |
| ~/blackroad/scripts/cli/agent-swarm | Shell | Agent swarm orchestration |
| ~/blackroad/scripts/cli/agent-worker | Shell | Agent worker process |

---

## 3. INFRASTRUCTURE -- Pi Fleet, Networking, Docker, Terraform, Monitoring

### Fleet Management

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-OS/blackroad-pi-ops | HTML, Py, Shell | 1.5 MB | Pi fleet operations -- deploy, monitor, configure all 5 Pis |
| BlackRoad-OS/blackroad-cluster | JS, HTML, Shell | 1.3 MB | Cluster management for distributed compute |
| BlackRoad-OS/blackroad-os-mesh | HTML, Shell, TS | 1.3 MB | Mesh networking between nodes |
| BlackRoad-OS-Inc/blackroad-infra | Shell, Py, TS, JS | 1.8 MB | Infrastructure-as-code and provisioning |
| BlackRoad-OS-Inc/blackroad-hardware | Py, Shell | 107 KB | Hardware inventory and management scripts |
| BlackRoad-Hardware/firmware | Py, Shell | 95 KB | Pi firmware management |
| BlackRoad-Hardware/hardware-specs | Py, HTML, Shell | 53 KB | Hardware specifications database |
| BlackRoad-Hardware/blackroad-iot-gateway | Py | 32 KB | IoT device gateway |
| BlackRoad-Hardware/blackroad-fleet-tracker | Py | 23 KB | Fleet GPS/status tracker |
| BlackRoad-Hardware/blackroad-device-registry | Py | 19 KB | Device registry service |
| BlackRoad-Hardware/blackroad-sensor-dashboard | Py | 21 KB | Sensor data visualization |
| BlackRoad-OS/blackroad-os-iot-cluster | C++, C, Py | 457 KB | IoT device cluster firmware |
| BlackRoad-OS/blackroad-os-iot-devices | C++, C, Py | 436 KB | Individual IoT device firmware |

### Networking & DNS

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-OS/blackroad-network | HTML | 11 KB | Network topology visualization |
| BlackRoad-Cloud/cloud-gateway | Py, TS, HCL | 28 KB | Cloud gateway with Terraform |
| BlackRoad-Cloud/blackroad-terraform-modules | Py | 70 KB | Terraform modules for infrastructure |
| BlackRoad-Cloud/k8s-operators | Py | 38 KB | Kubernetes operators |
| blackboxprogramming/aria-infrastructure-queen | Shell, HTML | 50 KB | Aria Pi infrastructure automation |

### Docker & Containers

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-OS/containers-template | HTML, Shell, TS, Go | 1.3 MB | Container template system |
| blackboxprogramming/blackroad-dashboards | Shell, Dockerfile | 2.2 MB | Dashboard container definitions |

### Monitoring & Security

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-OS/roadlog-monitoring | HTML, JS | 21 KB | Log monitoring dashboard |
| BlackRoad-OS/blackroad-progress-dashboard | HTML, JS, Shell, Py | 136 KB | Progress tracking dashboard |
| BlackRoad-Security/penetration-testing | Py, Shell | 34 KB | Penetration testing tools |
| BlackRoad-Security/security-audits | Shell, Py | 28 KB | Security audit scripts |
| BlackRoad-Gov/audit-tools | Py, Shell | 75 KB | Government compliance audit tools |

### Disaster Recovery

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-OS/blackroad-os-disaster-recovery | Py, C | 13 KB | Disaster recovery procedures |
| blackboxprogramming/blackroad-disaster-recovery | Py, C | 12 KB | DUPLICATE -- DR scripts |
| BlackRoad-Archive/blackroad-backup-manager | Py | 55 KB | Automated backup manager |

### Local: RoadNet Carrier Network (~/roadnet/)

| Path | Language | Description |
|------|----------|-------------|
| ~/roadnet/roadnet-deploy.sh | Shell | Deploy RoadNet AP to all 5 Pis |
| ~/roadnet/roadnet-node-setup.sh | Shell | Per-node AP + DHCP + NAT setup |
| ~/roadnet/roadnet-boot.sh | Shell | Boot-time network initialization |
| ~/roadnet/roadnet-status.sh | Shell | Fleet-wide AP status check |
| ~/roadnet/roadnet-uninstall.sh | Shell | Clean uninstall from all nodes |
| ~/roadnet/roadnet-ap.service | systemd | Systemd service unit for AP persistence |
| ~/roadnet/power-optimize.sh | Shell | Fleet power optimization (governor, swap, GPU) |
| ~/roadnet/power-monitor.sh | Shell | Power monitoring cron script (deployed to all nodes) |
| ~/roadnet/WIRE-MAP.md | Markdown | Master physical + logical topology (USB, PCIe, I2C, GPIO, serial, BT) |
| ~/roadnet/DEVICE-REGISTRY.md | Markdown | Master device registry -- 125+ devices, IDs 1-255 |
| ~/roadnet/PORT-MAP.md | Markdown | Every TCP/UDP port on every node, 198 sockets fleet-wide |

### Local: Infrastructure Tools (~/blackroad/tools/)

| Path | Language | Description |
|------|----------|-------------|
| ~/blackroad/tools/fleet/br-fleet.sh | Shell | Fleet management -- SSH to all Pis, run commands |
| ~/blackroad/tools/nodes/br-nodes.sh | Shell | Node status and health checks |
| ~/blackroad/tools/docker-manager/br-docker.sh | Shell | Docker container management across fleet |
| ~/blackroad/tools/cloudflare/br-cloudflare.sh | Shell | Cloudflare API management |
| ~/blackroad/tools/cloudflare/br-wrangler-pi.sh | Shell | Wrangler deployment from Pi nodes |
| ~/blackroad/tools/health-check/br-health.sh | Shell | Fleet health checks |
| ~/blackroad/tools/health-check/br-health-check.sh | Shell | Detailed health diagnostics |
| ~/blackroad/tools/health-cron/br-health-cron.sh | Shell | Cron-based health monitoring |
| ~/blackroad/tools/load-test/br-load-test.sh | Shell | Load testing tool |
| ~/blackroad/tools/env-manager/br-env.sh | Shell | Environment variable manager |
| ~/blackroad/tools/env-check/br-env-check.sh | Shell | Environment validation |
| ~/blackroad/tools/env-diff/br-env-diff.sh | Shell | Environment diff between nodes |

### Local: Infrastructure Scripts (~/blackroad/scripts/)

| Path | Language | Description |
|------|----------|-------------|
| ~/blackroad/scripts/backup-all.sh | Shell | Full fleet backup |
| ~/blackroad/scripts/backup/sync-to-do.sh | Shell | Sync backups to DigitalOcean |
| ~/blackroad/scripts/backup/sync-to-r2.sh | Shell | Sync backups to Cloudflare R2 |
| ~/blackroad/scripts/blackroad-server.py | Python | BlackRoad API server |

### Local: Hardware Repo (~/blackroad/orgs/core/blackroad-hardware/)

| Path | Language | Description |
|------|----------|-------------|
| ~/blackroad/orgs/core/blackroad-hardware/scripts/discover.sh | Shell | Network device discovery |
| ~/blackroad/orgs/core/blackroad-hardware/network.json | JSON | Network topology data |
| ~/blackroad/orgs/core/blackroad-hardware/registry.json | JSON | Hardware device registry |

---

## 4. WEB & APPS -- Websites, Dashboards, Mobile, Desktop, Extensions

### Primary Web Properties

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-OS/blackroad-io-app | HTML, JS, TS, RouterOS | 3.0 MB | Main blackroad.io application |
| BlackRoad-OS-Inc/blackroad-web | TS, CSS, JS | 848 KB | BlackRoad web platform |
| BlackRoad-OS/blackroad.io | JS, HTML, Py | 93 KB | blackroad.io landing page |
| blackboxprogramming/blackroad.io | HTML, Py, JS, Shell | 367 KB | DUPLICATE -- blackroad.io |
| BlackRoad-OS/blackroad-io | HTML, Py, JS | 76 KB | DUPLICATE -- blackroad.io |
| BlackRoad-AI/BlackRoad.io | HTML, Shell, TS | 1.3 MB | AI-focused BlackRoad.io variant |
| BlackRoad-OS/app-blackroad-io | HTML, Shell | 1.4 MB | App subdomain for blackroad.io |
| BlackRoad-OS/blackroadinc-us | HTML | 18 KB | Corporate site (blackroadinc.us) |
| BlackRoad-OS/blackroad-company | HTML | 11 KB | Company info page |
| BlackRoad-OS/blackroad-me | HTML | 11 KB | Personal landing (blackroad.me) |
| BlackRoad-OS-Inc/blackroad-os-inc.github.io | HTML, JS | 24 KB | GitHub Pages for BlackRoad-OS-Inc |
| BlackRoad-OS/blackroad-os.github.io | HTML, Shell | 11 KB | GitHub Pages for BlackRoad-OS |
| blackboxprogramming/blackboxprogramming.github.io | HTML | 8 KB | Personal GitHub Pages |
| Blackbox-Enterprises/blackbox-enterprises.github.io | HTML | 22 KB | Blackbox Enterprises site |
| BlackRoad-OS/training-blackroad-io | HTML | 6 KB | Training portal |

### Dashboards

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| blackboxprogramming/blackroad-dashboards | Shell, Dockerfile | 2.2 MB | Dashboard container suite |
| blackboxprogramming/blackroad-dashboard | HTML | 54 KB | Single-page dashboard |
| blackboxprogramming/blackroad-ai-dashboard | TS, CSS | 10 KB | AI metrics dashboard |
| BlackRoad-OS/blackroad-progress-dashboard | HTML, JS, Shell, Py | 136 KB | Progress tracking dashboard |

### Local: 100+ Operator Dashboards (~/blackroad/blackroad-operator/dashboards/)

| Path | Language | Description |
|------|----------|-------------|
| ~/blackroad/blackroad-operator/dashboards/ | Shell (100+ scripts) | Terminal dashboards -- system metrics, AI insights, network topology, Docker fleet, quantum simulator, database monitor, security, and 90+ more |

### Desktop & Mobile

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-OS/blackroad-desktop-app | HTML, JS | 12 KB | Electron desktop application |
| blackboxprogramming/blackroad-desktop-app | HTML, JS | 12 KB | DUPLICATE -- desktop app |

### Browser Extensions

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-OS/blackroad-chrome-extension | JS, HTML, CSS | 29 KB | Chrome browser extension |
| blackboxprogramming/blackroad-chrome-extension | HTML, CSS, JS | 15 KB | DUPLICATE -- Chrome extension |
| BlackRoad-OS/blackroad-vscode-extension | TS | 38 KB | VS Code extension |
| BlackRoad-OS/blackroad-figma-plugin | HTML, JS | 21 KB | Figma design plugin |
| blackboxprogramming/blackroad-figma-plugin | HTML, JS | 21 KB | DUPLICATE -- Figma plugin |

### APIs & Integrations

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-OS-Inc/blackroad-api | Py, TS, Makefile | 136 KB | Primary API service |
| BlackRoad-OS/blackroad-api-cloudflare | TS, Shell | 13 KB | Cloudflare Workers API |
| BlackRoad-OS/blackroad-webhooks | TS | 25 KB | Webhook handler service |
| BlackRoad-OS/blackroad-email | TS | 32 KB | Email sending service |
| BlackRoad-OS/blackroad-cron | TS | 18 KB | Scheduled job runner |
| BlackRoad-OS/blackroad-audit | TS | 16 KB | Audit log service |
| BlackRoad-OS/blackroad-ratelimit | TS | 16 KB | Rate limiting middleware |
| BlackRoad-OS/blackroad-analytics | TS | 13 KB | Analytics tracking service |
| BlackRoad-OS/blackroad-dev-portal | TS | 13 KB | Developer portal |
| BlackRoad-OS/blackroad-slack-bot | JS | 8 KB | Slack bot integration |
| blackboxprogramming/blackroad-slack-bot | JS | 8 KB | DUPLICATE -- Slack bot |
| BlackRoad-OS/blackroad-zapier-app | JS | 29 KB | Zapier integration app |
| BlackRoad-OS/blackroad-zapier | JS | 6 KB | Zapier connector |
| BlackRoad-OS/blackroad-notion | TS | 4 KB | Notion integration |
| blackboxprogramming/blackroad-notion | TS | 4 KB | DUPLICATE -- Notion |
| BlackRoad-OS/blackroad-linear | TS | 4 KB | Linear integration |
| blackboxprogramming/blackroad-linear | TS | 4 KB | DUPLICATE -- Linear |
| BlackRoad-OS/blackroad-keycloak | HTML, JS, Shell | 16 KB | Keycloak auth integration |
| BlackRoad-OS/blackroad-minio | HTML, Py, JS | 36 KB | MinIO object storage integration |
| BlackRoad-OS/chanfana-openapi-template | HTML, Shell, TS | 1.4 MB | OpenAPI template with Chanfana |

### Local: Cloudflare Workers (~/blackroad/workers/)

| Path | Language | Description |
|------|----------|-------------|
| ~/blackroad/workers/smart-router/src/index.ts | TypeScript | Intelligent request router for blackroad.io subdomains |
| ~/blackroad/workers/auth/ | Config | Auth worker |
| ~/blackroad/workers/blackroad-agents/ | Config | Agent API worker |
| ~/blackroad/workers/blackroad-alice/ | Config | Alice node proxy worker |
| ~/blackroad/workers/blackroad-aria/ | Config | Aria node proxy worker |
| ~/blackroad/workers/blackroad-lucidia/ | Config | Lucidia proxy worker |
| ~/blackroad/workers/blackroad-octavia/ | Config | Octavia proxy worker |
| ~/blackroad/workers/blackroad-gematria/ | Config | Gematria proxy worker |
| ~/blackroad/workers/email/ | Config | Email routing worker |
| ~/blackroad/workers/dns-setup/ | Config | DNS configuration worker |
| ~/blackroad/workers/drive/ | Config | File storage worker |
| ~/blackroad/workers/copilot-cli/ | Config | CLI copilot worker |
| ~/blackroad/workers/status/ | Config | Status page worker |
| ~/blackroad/workers/domains/ | Config | 50+ subdomain workers (about, admin, ai, algorithms, analytics, asia, blockchain, blocks, blog, cdn, chain, circuits, cli, compliance, compute, control, data, demo, design, docs, console, dev, dashboard, agents) |

### Platforms & Portals

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-OS/blackroad-ai-platform | HTML, TS, JS, Shell | 763 KB | AI platform web app |
| BlackRoad-OS/blackroad-os-home | HTML, Shell, TS, MDX | 1.3 MB | OS landing page and documentation |
| BlackRoad-OS/blackroad-os-docs | HTML, Shell, MDX, JS | 1.4 MB | Documentation site |
| BlackRoad-OS-Inc/blackroad-docs | CSS, JS | 8 KB | Docs site (Inc org) |
| BlackRoad-OS/blackroad-tools | HTML, Py, Shell, JS | 1.9 MB | Tools portal |
| BlackRoad-OS/blackroad-os-operator | HTML, Py, TS, Shell | 5.8 MB | Web-based operator console |
| BlackRoad-OS/operator | JS, Py, HTML, Shell | 372 KB | Operator utilities |
| BlackRoad-OS/backroad-social-platform | HTML | 22 KB | Social platform (BackRoad) |
| BlackRoad-Media/backroad-social | Py, HTML | 39 KB | Social media backend |
| BlackRoad-OS/road-control | HTML, CSS, JS | 22 KB | Remote control panel |
| BlackRoad-OS/roadcommand-enhanced | JS | 23 KB | Enhanced command center |
| blackboxprogramming/context-bridge | JS, Shell, CSS, HTML | 245 KB | Context bridge between services |
| blackboxprogramming/codex-agent-runner | HTML, JS | 24 KB | Agent runner web interface |
| blackboxprogramming/gitea-ai-platform | TS | 23 KB | Gitea-integrated AI platform |

### E-Commerce

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-OS/blackroadquantum-shop | TS, JS | 13 KB | Quantum shop frontend |
| BlackRoad-OS/blackroadquantum-store | TS, JS | 7 KB | Quantum store backend |
| BlackRoad-OS/roadmarket | HTML, JS | 16 KB | Marketplace |

---

## 5. MATH & RESEARCH -- Quantum Math, Simulation Theory, Proofs

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| blackboxprogramming/quantum-math-lab | Python | 24 KB | Quantum mathematics laboratory -- proofs and computations |
| blackboxprogramming/simulation-theory | Py, HTML | 13 KB | Simulation theory exploration and proofs |
| BlackRoad-OS-Inc/blackroad-math | Py, TS | 205 KB | Mathematical framework and computation engine |
| BlackRoad-OS/lucidia-math | HTML, Py, Shell | 1.6 MB | Math reasoning engine for Lucidia |
| BlackRoad-OS/blackroad-os-pack-research-lab | HTML, Shell, Py, Jupyter | 1.3 MB | Research lab notebooks and experiments |
| BlackRoad-Labs/experiments | Py, HTML, Jupyter | 193 KB | Experimental research projects |
| BlackRoad-Labs/research | Py, HTML, Jupyter | 77 KB | Published research papers and code |
| blackboxprogramming/native-ai-quantum-energy | Py, Shell | 36 KB | Quantum energy computation |
| blackboxprogramming/universal-computer | Py | 5 KB | Universal computation model |
| BlackRoad-OS/blackroad-os-pack-education | HTML, Shell, JS, TS | 1.4 MB | Educational content pack |
| BlackRoad-Education/roadwork-platform | Py, HTML | 54 KB | Learning platform |
| BlackRoad-Education/tutorials | Py | 41 KB | Tutorial content |
| BlackRoad-Education/courses | Py | 38 KB | Course content |

---

## 6. TOOLS & OPS -- Shell Scripts, Deployment, CI/CD, Cron, Backups

### CI/CD & Deployment

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-OS/blackroad-os-deploy | TS, Shell, JS, Py | 111 KB | Deployment pipeline |
| BlackRoad-OS/blackroad-cicd-pipeline | Py | 64 KB | CI/CD pipeline definitions |
| BlackRoad-OS/road-deploy | JS | 8 KB | Quick deploy utility |
| BlackRoad-OS/blackroad-app-factory | Shell, HTML | 18 KB | App scaffolding and deployment factory |
| BlackRoad-OS-Inc/blackroad-workerd-edge | JS, Shell, Cap'n Proto | 23 KB | Workerd edge runtime deployment |

### Analysis & Tooling

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| blackboxprogramming/blackroad-scripts | Shell, Py, TS, JS | 6.1 MB | 400+ shell scripts and CLI tools (this repo -- the home directory) |
| blackboxprogramming/blackroad-analysis | Shell, Awk | 1.8 MB | System analysis and reporting scripts |
| BlackRoad-OS/blackroad-priority-stack | Shell | 36 KB | Priority-based task execution |
| blackboxprogramming/blackroad-priority-stack | Shell | 36 KB | DUPLICATE -- priority stack |
| blackboxprogramming/blackroad-dotfiles | Py | 17 KB | Dotfile management |
| BlackRoad-Archive/blackroad-web-archiver | Py | 48 KB | Web page archiver |
| BlackRoad-Archive/blackroad-document-archive | Py | 41 KB | Document archival system |
| BlackRoad-Archive/blackroad-ipfs-tracker | Py | 33 KB | IPFS content tracker |

### Workflow & Data

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| Blackbox-Enterprises/blackbox-prefect | Py, TS, Vue, HTML | 22.8 MB | Prefect workflow orchestration |
| Blackbox-Enterprises/blackbox-temporal | TS, JS | 21 KB | Temporal workflow engine |
| Blackbox-Enterprises/blackbox-airbyte | JS | 3 KB | Airbyte data connector |

### Local: 90+ br-* CLI Tools (~/blackroad/tools/)

| Path | Language | Description |
|------|----------|-------------|
| ~/blackroad/tools/agent-gateway/br-gateway.sh | Shell | Agent gateway proxy |
| ~/blackroad/tools/agent-identity/br-agent-identity.sh | Shell | Agent identity management |
| ~/blackroad/tools/agent-nats/br-agent-nats.sh | Shell | NATS messaging for agents |
| ~/blackroad/tools/agent-runtime/br-agent-boot.sh | Shell | Agent boot sequence |
| ~/blackroad/tools/agent-runtime/br-runtime.sh | Shell | Agent runtime manager |
| ~/blackroad/tools/agent-tasks/br-tasks.sh | Shell | Agent task queue |
| ~/blackroad/tools/agents-live/br-agents.sh | Shell | Live agent status |
| ~/blackroad/tools/alias/br-alias.sh | Shell | Shell alias manager |
| ~/blackroad/tools/analytics/br-analytics.sh | Shell | Analytics data collection |
| ~/blackroad/tools/api-tester/br-api.sh | Shell | API testing tool (with SQLite history) |
| ~/blackroad/tools/audit-log/br-audit-log.sh | Shell | Audit log viewer |
| ~/blackroad/tools/audit/br-audit.sh | Shell | System audit runner |
| ~/blackroad/tools/auth/br-auth.sh | Shell | Authentication manager |
| ~/blackroad/tools/backup-manager/br-backup.sh | Shell | Backup orchestrator |
| ~/blackroad/tools/bench/br-bench.sh | Shell | Benchmark runner |
| ~/blackroad/tools/brand/br-brand.sh | Shell | Brand compliance checker |
| ~/blackroad/tools/broadcast/br-broadcast.sh | Shell | Fleet broadcast messaging |
| ~/blackroad/tools/cache/br-cache.sh | Shell | Cache management |
| ~/blackroad/tools/cece-identity/br-cece.sh | Shell | CECE AI identity bootstrap |
| ~/blackroad/tools/chain/br-chain.sh | Shell | Blockchain operations |
| ~/blackroad/tools/ci-pipeline/br-ci.sh | Shell | CI pipeline runner |
| ~/blackroad/tools/code-quality/br-quality.sh | Shell | Code quality checks |
| ~/blackroad/tools/collab/br-collab.sh | Shell | Collaboration tools |
| ~/blackroad/tools/compliance-scanner/br-comply.sh | Shell | Compliance scanner |
| ~/blackroad/tools/context-radar/br-context-radar.sh | Shell | Context radar -- monitors environment for relevant signals |
| ~/blackroad/tools/context/br-context.sh | Shell | Context management |
| ~/blackroad/tools/cost/br-cost.sh | Shell | Cost tracking |
| ~/blackroad/tools/cron/br-cron.sh | Shell | Cron job manager |
| ~/blackroad/tools/dashboard/br-dashboard.sh | Shell | Dashboard launcher |
| ~/blackroad/tools/db-browser/br-db-browser.sh | Shell | Database browser |
| ~/blackroad/tools/db-client/br-db.sh | Shell | Database client |
| ~/blackroad/tools/db-migrate/br-db-migrate.sh | Shell | Database migration runner |
| ~/blackroad/tools/dependency-helper/br-deps.sh | Shell | Dependency manager |
| ~/blackroad/tools/deploy-manager/br-deploy.sh | Shell | Deploy manager (with SQLite tracking) |
| ~/blackroad/tools/deps-graph/br-deps-graph.sh | Shell | Dependency graph visualizer |
| ~/blackroad/tools/diff/br-diff.sh | Shell | Smart diff tool |
| ~/blackroad/tools/docs/br-docs.sh | Shell | Documentation generator |
| ~/blackroad/tools/domains/br-domains.sh | Shell | Domain management |
| ~/blackroad/tools/edu/br-edu.sh | Shell | Education content manager |
| ~/blackroad/tools/email/br-email.sh | Shell | Email sender |
| ~/blackroad/tools/feat/br-feat.sh | Shell | Feature flag manager |
| ~/blackroad/tools/file-finder/br-find.sh | Shell | Smart file finder |
| ~/blackroad/tools/flow/br-flow.sh | Shell | Workflow runner |
| ~/blackroad/tools/format/br-format.sh | Shell | Code formatter |
| ~/blackroad/tools/gateway/br-gateway.sh | Shell | Gateway manager |
| ~/blackroad/tools/geb/br-geb.sh | Shell | GEB (Godel-Escher-Bach) exploration tool |
| ~/blackroad/tools/gen/br-gen.sh | Shell | Code generator |
| ~/blackroad/tools/git-ai/br-git-ai.sh | Shell | AI-powered git operations |
| ~/blackroad/tools/git-graph/br-git-graph.sh | Shell | Git commit graph visualizer |
| ~/blackroad/tools/git-integration/br-git.sh | Shell | Git workflow integration |
| ~/blackroad/tools/git-smart/br-git-smart.sh | Shell | Smart git operations |
| ~/blackroad/tools/gov-api/br-gov-api.sh | Shell | Government API client |
| ~/blackroad/tools/hook/br-hook.sh | Shell | Git hook manager |
| ~/blackroad/tools/journal/br-journal.sh | Shell | Daily journal |
| ~/blackroad/tools/kv/br-kv.sh | Shell | Cloudflare KV manager |
| ~/blackroad/tools/lint/br-lint.sh | Shell | Linter runner |
| ~/blackroad/tools/log-parser/br-logs.sh | Shell | Log parser and analyzer |
| ~/blackroad/tools/log-tail/br-log-tail.sh | Shell | Real-time log tailer |
| ~/blackroad/tools/logs-cf/br-logs-cf.sh | Shell | Cloudflare log viewer |
| ~/blackroad/tools/mail/br-mail.sh | Shell | Mail client |
| ~/blackroad/tools/metrics-dashboard/br-metrics.sh | Shell | Metrics dashboard |
| ~/blackroad/tools/mock-server/br-mock-server.sh | Shell | Mock API server |
| ~/blackroad/tools/mock/br-mock.sh | Shell | Mock data generator |

### Local: Operational Scripts (~/blackroad/scripts/)

| Path | Language | Description |
|------|----------|-------------|
| ~/blackroad/scripts/apple-finetune-270m.py | Python | Apple ML 270M model fine-tuning |
| ~/blackroad/scripts/apple-ml-cecilia-setup.sh | Shell | Apple ML setup on Cecilia Pi |
| ~/blackroad/scripts/apple-ml-inference-test.sh | Shell | Apple ML inference benchmarks |
| ~/blackroad/scripts/blackroad-agent-hub.sh | Shell | Agent hub launcher |
| ~/blackroad/scripts/blackroad-agent-orchestrator.sh | Shell | Agent orchestration engine |
| ~/blackroad/scripts/blackroad-agent-mesh.sh | Shell | Agent mesh networking |
| ~/blackroad/scripts/boot-splash.sh | Shell | Boot splash screen |
| ~/blackroad/scripts/brand-overhaul.sh | Shell | Brand compliance overhaul |
| ~/blackroad/scripts/brand-tools/audit-brand-compliance.sh | Shell | Brand audit tool |
| ~/blackroad/scripts/build-docs-site.sh | Shell | Documentation site builder |
| ~/blackroad/scripts/cli-tools/blackroad-os.sh | Shell | BlackRoad OS launcher |
| ~/blackroad/scripts/cli-tools/br-help.sh | Shell | Help system |
| ~/blackroad/scripts/cli-tools/br-model.sh | Shell | Model management |
| ~/blackroad/scripts/cli-tools/lucidia-code.sh | Shell | Lucidia code assistant |
| ~/blackroad/scripts/cli-tools/pixel-world.sh | Shell | Pixel world game |
| ~/blackroad/scripts/cli-tools/roadchain.sh | Shell | RoadChain CLI |

---

## 7. CREATIVE -- Metaverse, Music, 3D, Brand, Design

### Metaverse & 3D

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-OS/blackroad-os-metaverse | JS, HTML, Shell | 710 KB | Metaverse world engine |
| BlackRoad-OS/blackroad-metaverse | HTML | 58 KB | Metaverse portal |
| blackboxprogramming/blackroad-roadworld | JS, CSS, HTML, Shell | 196 KB | RoadWorld 3D environment |
| BlackRoad-OS/blackroad-earth | HTML | 53 KB | Earth visualization |
| blackboxprogramming/new_world | Py | 19 KB | New World simulation engine |
| BlackRoad-OS/new_world | Py | 12 KB | DUPLICATE -- New World |
| BlackRoad-OS/genesis-road | HTML, JS | 32 KB | Genesis world creation tool |
| BlackRoad-Interactive/interactive-core | TS, HTML | 48 KB | Interactive experience engine |

### Music & Studio

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-OS/blackroad-os-music | HTML, Shell | 23 KB | Music player and studio |
| BlackRoad-Studio/video-studio | Py, HTML | 64 KB | Video editing studio |
| BlackRoad-Studio/writing-studio | Py, HTML | 54 KB | Writing workspace |
| BlackRoad-Studio/canvas-studio | Py, HTML | 48 KB | Canvas art studio |
| BlackRoad-OS/canvas-studio | HTML | 22 KB | DUPLICATE -- canvas studio |
| BlackRoad-Studio/studio-core | Py, Shell, TS | 20 KB | Studio platform core |
| BlackRoad-Studio/templates | Py, Shell | 49 KB | Studio templates |
| BlackRoad-OS/roadstudio | HTML, JS | 16 KB | RoadStudio creative tools |
| blackboxprogramming/BlackStream | JS, CSS | 3 KB | Streaming platform |

### Brand & Design

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| blackboxprogramming/BLACKROAD-OS-BRAND-LOCK | HTML, JS | 1.2 MB | Brand design system -- 15 templates, gradient specs, font rules |
| BlackRoad-OS-Inc/blackroad-brand-kit | HTML, Shell, JS, CSS | 664 KB | Brand kit with assets and guidelines |
| BlackRoad-OS/blackroad-os-brand | HTML, Shell | 9 KB | Brand identity assets |
| BlackRoad-OS-Inc/blackroad-design | TS, CSS, JS | 10 KB | Design system components |
| BlackRoad-OS/blackroad-templates | HTML, CSS, Shell | 906 KB | Web templates |
| blackboxprogramming/blackroad-templates | HTML | 400 KB | DUPLICATE -- templates |
| BlackRoad-Media/brand-kit | CSS | 2 KB | Media brand kit |
| BlackRoad-Media/content | Py, TS | 42 KB | Content management |

---

## 8. BUSINESS -- Salesforce, Compliance, Resume, Docs

### Salesforce & Enterprise

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-OS-Inc/blackroad-sf | JS, Apex, HTML | 35 KB | Salesforce integration |
| BlackRoad-OS-Inc/blackroad-chat | HTML, JS, TS | 42 KB | Business chat platform |

### Compliance & Governance

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-OS/blackroad-os-compliance-financial-regulation | Shell, HTML, JS | 150 KB | Financial compliance framework |
| BlackRoad-Gov/compliance-framework | Py | 43 KB | Government compliance framework |
| BlackRoad-Gov/roadcoin-token | HTML | 17 KB | RoadCoin token compliance |
| BlackRoad-Foundation/governance | Py | 32 KB | Foundation governance rules |

### Finance & Crypto

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-OS/blackroad-os-roadcoin | HTML, JS | 55 KB | RoadCoin cryptocurrency |
| BlackRoad-OS/blackroad-roadcoin | HTML | 16 KB | RoadCoin wallet interface |
| BlackRoad-OS/blackroad-os-roadchain | JS | 15 KB | RoadChain blockchain |

### Portfolio & Resume

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| blackboxprogramming/alexa-amundson-portfolio | HTML, Shell | 149 KB | Personal portfolio site |
| BlackRoad-OS/alexa-amundson-portfolio | HTML, Shell | 101 KB | DUPLICATE -- portfolio |
| BlackRoad-Ventures/portfolio | Py, HTML | 112 KB | Ventures portfolio |
| BlackRoad-Ventures/partnerships | Py | 48 KB | Partnership management |

### Advertising & Marketing

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| blackboxprogramming/blackroad-advertising-playbook | HTML | 69 KB | Advertising strategy playbook |
| blackboxprogramming/blackroad-pitstop | HTML, Shell | 92 KB | PitStop marketing page |
| BlackRoad-OS/blackroad-os-pitstop | HTML, Shell | 51 KB | DUPLICATE -- PitStop |
| blackboxprogramming/blackroad-app-store | HTML, Shell, JS | 89 KB | App store listing |

### Plans & Documentation

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-AI/blackroad-plans | HTML, Shell | 1.3 MB | Strategic plans and roadmaps |
| BlackRoad-AI/urban-goggles | HTML, Shell | 1.3 MB | Urban analytics platform |

### Domains & Hosting

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| blackboxprogramming/blackroad-domains | HTML, Shell, Py | 270 KB | Domain management dashboard |
| blackboxprogramming/blackroad-apps | HTML, Shell, TS, JS | 331 KB | App catalog and launcher |
| blackboxprogramming/blackroad-simple-launch | HTML, Py | 222 KB | Simple app launch pages |
| BlackRoad-OS/blackroad-os-simple-launch | HTML, Py | 319 KB | DUPLICATE -- simple launch |

### CarPool (Next.js + Clerk)

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-OS/blackroad-os-carpool | HTML, Py, Shell, TS | 1.3 MB | CarPool ride-sharing app (deployed on Lucidia) |

### Transparency

| Location | Languages | Size | Description |
|----------|-----------|------|-------------|
| BlackRoad-OS/epstein-files-transparency | HTML | 16 KB | Epstein files transparency project |
| blackboxprogramming/epstein-files-transparency | HTML | 17 KB | DUPLICATE -- transparency project |

---

## 9. LANGUAGES -- RoadC Compiler

### Local: RoadC (~/roadc/)

| Path | Language | Description |
|------|----------|-------------|
| ~/roadc/lexer.py | Python | Lexer -- tokenizes RoadC source (Python-style indentation, colon blocks) |
| ~/roadc/parser.py | Python | Parser -- builds AST from token stream |
| ~/roadc/ast_nodes.py | Python | AST node definitions (FunDef, LetDecl, MatchExpr, SpawnExpr, etc.) |
| ~/roadc/interpreter.py | Python | Tree-walking interpreter (functions, recursion, if/elif/else, while, for) |
| ~/roadc/roadc.py | Python | Main entry point -- runs .road files through lexer-parser-interpreter |
| ~/roadc/roadc.c | C | Native C compiler backend (alternative to interpreter) |
| ~/roadc/build.sh | Shell | Build script for C compiler |
| ~/roadc/deploy-to-pi.sh | Shell | Deploy RoadC runtime to Pi fleet |
| ~/roadc/test.road | RoadC | Test program |
| ~/roadc/examples/demo.road | RoadC | Demo program |
| ~/roadc/examples/hello_3d.road | RoadC | 3D hello world using `space` keyword |
| ~/roadc/examples/space_shooter.road | RoadC | Space shooter game in RoadC |
| ~/roadc/examples/quantum_hello.road | RoadC | Quantum computing hello world |

**Language features:** `fun` keyword, `let`/`var`/`const`, `match`, `spawn` (concurrency), `space` (3D), supports integers, floats, strings, recursion.

---

## DUPLICATE TRACKER

The following repos exist in multiple orgs (typically blackboxprogramming + BlackRoad-OS):

| Item | Locations |
|------|-----------|
| blackroad-agents | BlackRoad-OS, BlackRoad-OS-Inc |
| blackroad.io | BlackRoad-OS, blackboxprogramming, BlackRoad-AI |
| remember | BlackRoad-OS, blackboxprogramming |
| blackroad-desktop-app | BlackRoad-OS, blackboxprogramming |
| blackroad-chrome-extension | BlackRoad-OS, blackboxprogramming |
| blackroad-figma-plugin | BlackRoad-OS, blackboxprogramming |
| blackroad-slack-bot | BlackRoad-OS, blackboxprogramming |
| blackroad-notion | BlackRoad-OS, blackboxprogramming |
| blackroad-linear | BlackRoad-OS, blackboxprogramming |
| blackroad-templates | BlackRoad-OS, blackboxprogramming |
| blackroad-priority-stack | BlackRoad-OS, blackboxprogramming |
| blackroad-disaster-recovery | BlackRoad-OS, blackboxprogramming |
| blackroad-simple-launch | BlackRoad-OS, blackboxprogramming |
| blackroad-pitstop | BlackRoad-OS, blackboxprogramming |
| alexa-amundson-portfolio | BlackRoad-OS, blackboxprogramming |
| epstein-files-transparency | BlackRoad-OS, blackboxprogramming |
| canvas-studio | BlackRoad-OS, BlackRoad-Studio |
| new_world | BlackRoad-OS, blackboxprogramming |
| lucidia-cli | blackboxprogramming (GitHub), ~/lucidia-cli (local) |
| blackroad/blackroad-operator | BlackRoad-OS-Inc (both are 240+ MB monorepos) |

---

## STATISTICS

### By Domain

| Domain | GitHub Repos | Local Dirs | Estimated Total Code |
|--------|-------------|------------|---------------------|
| Core OS | 12 | 4 | ~520 MB |
| AI & Models | 25 | 3 | ~20 MB |
| Infrastructure | 18 | 2 | ~15 MB |
| Web & Apps | 55 | 2 | ~30 MB |
| Math & Research | 10 | 0 | ~5 MB |
| Tools & Ops | 15 | 2 | ~12 MB |
| Creative | 15 | 0 | ~3 MB |
| Business | 18 | 0 | ~3 MB |
| Languages | 0 | 1 | <1 MB |

### By Language (GitHub total)

| Language | Size |
|----------|------|
| Python | 193.3 MB |
| TypeScript | 186.6 MB |
| HTML | 150.2 MB |
| Shell | 43.2 MB |
| Go | 42.9 MB |
| C++ | 23.9 MB |
| JavaScript | 22.1 MB |
| C | 3.0 MB |
| CUDA | 1.4 MB |
| Metal | 417 KB |
| GLSL | 282 KB |
| CSS | 186 KB |
| RouterOS Script | 178 KB |
| Vue | 123 KB |
| MDX | 84 KB |
| Rust | 29 KB |
| HCL | 24 KB |
| Apex | ~15 KB |

### GitHub Orgs (17 total)

| Org | Active Repos | Disk |
|-----|-------------|------|
| BlackRoad-OS | 129 | 850 MB |
| blackboxprogramming | 57 | 2650 MB |
| BlackRoad-OS-Inc | 21 | 1185 MB |
| BlackRoad-AI | 14 | 3.4 MB |
| BlackRoad-Security | 3 | 1.4 MB |
| BlackRoad-Hardware | 7 | 1.6 MB |
| BlackRoad-Foundation | 2 | 1.2 MB |
| BlackRoad-Media | 4 | 1.3 MB |
| BlackRoad-Interactive | 2 | 1.0 MB |
| BlackRoad-Archive | 5 | 1.3 MB |
| BlackRoad-Labs | 3 | 1.3 MB |
| BlackRoad-Cloud | 4 | 1.4 MB |
| BlackRoad-Gov | 4 | 1.0 MB |
| Blackbox-Enterprises | 8 | 83 MB |
| BlackRoad-Ventures | 3 | 1.0 MB |
| BlackRoad-Education | 4 | 1.0 MB |
| BlackRoad-Studio | 6 | 1.1 MB |

### Local Code Not on GitHub

| Location | Description |
|----------|-------------|
| ~/blackroad/src/ (23 files) | Core CLI -- br.ts, commands, formatters |
| ~/blackroad/mcp-bridge/ (774 files) | MCP bridge for LLM tool integration |
| ~/blackroad/orgs/blackroad-os/blackroad-prism-console/ (4,973 files) | Prism console (largest local project) |
| ~/blackroad/workers/ (50+ workers) | Cloudflare Workers for all subdomains |
| ~/blackroad/tools/ (90+ tools) | br-* CLI tool collection |
| ~/blackroad/scripts/ (224 files) | Operational scripts |
| ~/blackroad/carpool/ (80+ files) | Agent orchestration + treasury/RoadChain |
| ~/blackroad/blackroad-operator/dashboards/ (100+ files) | Terminal dashboard suite |
| ~/roadc/ (5 Python + 1 C + examples) | RoadC language implementation |
| ~/roadnet/ (8 scripts + 3 docs) | Carrier network management |
| ~/lucidia-cli/ (30+ Python files) | Lucidia CLI with 25+ components |
| ~/*.sh, ~/*.py (~90 files) | Home directory scripts |

### 228 SQLite Databases

Located in `~/.blackroad/` -- 156,675 memory entries in FTS5 index (~184 MB).

---

*Generated 2026-03-09 by scanning 509 GitHub repos across 17 orgs + local filesystem.*
