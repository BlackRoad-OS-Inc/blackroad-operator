# BLACKROAD OS - WINDOWS + PIXEL OFFICE BRIDGE REFERENCE

> Cleaned reference extracted from HREFBLACKROADOSWINDOWS.txt
> Integrates Windows layer with Pixel Office Bridge architecture

---

## TABLE OF CONTENTS

<details>
<summary><b>CORE ARCHITECTURE</b></summary>

- [Layer Architecture](#blackroad-cli-v3---layer-architecture)
- [Full Sovereignty Stack](#full-sovereignty-stack-layers-0-8)
- [API Key Architecture](#api-key-architecture)
- [Boot Sequence](#boot-sequence)

</details>

<details>
<summary><b>PLATFORMS</b></summary>

- [Windows Integration](#windows-integration-layer)
- [Multi-Platform Matrix](#multi-platform-deployment-matrix)
- [Pixel Office Bridge](#pixel-office-bridge---claude-code-integration)

</details>

<details>
<summary><b>INFRASTRUCTURE</b></summary>

- [Device Fleet](#device-fleet-8-devices-52-tops-ai-compute)
- [GitHub Empire](#github-empire-15-orgs-1085-repos)
- [Cloudflare Empire](#cloudflare-empire)
- [Network Topology](#network-topology)
- [CECE OS](#cece-os-sovereign-ai-on-cecilia-pi)

</details>

<details>
<summary><b>CLI & COMMANDS</b></summary>

- [Full Command Reference](#blackroad-cli---full-command-reference)
- [Agent Personalities](#agent-personalities-ask--commands)
- [AI Gateway](#blackroad-ai-gateway---full-implementation)

</details>

<details>
<summary><b>COORDINATION</b></summary>

- [Memory System](#memory-system-integration)
- [Traffic Lights](#traffic-light-system)
- [Task Marketplace](#task-marketplace)
- [GreenLight Templates](#greenlight-templates)
- [TIL Broadcasts](#til-today-i-learned-broadcasts)
- [Infinite Todos](#infinite-todos)

</details>

<details>
<summary><b>DESIGN & BRAND</b></summary>

- [Brand Design System](#brand-design-system)
- [UI Phases](#ui-phases-from-terminal-capture)

</details>

---

## BLACKROAD CLI v3 - LAYER ARCHITECTURE

```
✓ BlackRoad CLI v3 → br-help
  + Layer 3 (agents/system) loaded
  + Layer 4 (deploy/orchestration) loaded
  + Layer 5 (branches/environments) loaded
  + Layer 6 (Lucidia core/memory) loaded
  + Layer 7 (orchestration) loaded
  + Layer 8 (network/API) loaded
```

<details>
<summary><b>Layer Breakdown (Layers 3-8)</b></summary>

| Layer | Name | Purpose |
|-------|------|---------|
| 3 | agents/system | Agent spawning, system monitoring |
| 4 | deploy/orchestration | Deployment pipelines, service orchestration |
| 5 | branches/environments | Git branches, env management |
| 6 | Lucidia core/memory | Memory system, context persistence |
| 7 | orchestration | Multi-agent coordination |
| 8 | network/API | External APIs, network services |

</details>

<details>
<summary><b>Below Layer 3: Sovereignty Stack (Layers 0-2)</b></summary>

| Layer | Name | Current State |
|-------|------|---------------|
| 2 | OS | macOS, Linux (Pis), Windows (WSL2) |
| 1 | Hardware | M1, Pi cluster, Hailo-8 |
| 0 | YOU | BlackRoad root |

</details>

<details>
<summary><b>Layer 3 Deep Dive: Agents/System</b></summary>

```bash
# Agent Registry
~/blackroad-agent-registry.sh init
~/blackroad-agent-registry.sh register <name> <type>
~/blackroad-agent-registry.sh list
~/blackroad-agent-registry.sh stats

# System Monitoring
br-stats                    # System statistics
br-health                   # Health checks
br-agents                   # List active agents

# Agent Types
- ai        → AI inference agents (Claude, Ollama)
- hardware  → Physical devices (Pis, Mac)
- service   → Background services
- worker    → Task execution agents
```

</details>

<details>
<summary><b>Layer 4 Deep Dive: Deploy/Orchestration</b></summary>

```bash
# Cloudflare Deployment
wrangler pages deploy <dir> --project-name=<name>
wrangler deploy              # Workers

# GitHub Actions
gh workflow list
gh run list
gh run watch <id>

# Railway
railway up
railway logs

# Pi Cluster Deployment
~/deploy-to-pis.sh
~/deploy-to-pi-cluster.sh
```

</details>

<details>
<summary><b>Layer 5 Deep Dive: Branches/Environments</b></summary>

```bash
# Environment Management
~/sync-env-simple.sh
~/sync-env-templates.sh

# Branch Operations
git branch --list
git checkout -b feature/<name>
git merge --no-ff <branch>

# Environment Variables
.env.local          # Local development
.env.production     # Production secrets
.env.blackroad      # BlackRoad-specific
```

</details>

<details>
<summary><b>Layer 6 Deep Dive: Lucidia/Memory</b></summary>

```bash
# Memory System
~/memory-system.sh summary
~/memory-system.sh log <action> <entity> <details> <tags>
~/memory-realtime-context.sh live $MY_CLAUDE compact

# Journal Location
~/.blackroad/memory/journals/master-journal.jsonl

# Memory Actions
announce | progress | deployed | created | configured
decided | coordinate | blocked | fixed | validated | milestone
```

</details>

<details>
<summary><b>Layer 7 Deep Dive: Orchestration</b></summary>

```bash
# Multi-Agent Coordination
~/claude-group-chat.sh
~/agent-chat.sh
~/claude-skill-matcher.sh

# Task Distribution
~/blackroad-task-distribution-system.sh stats
~/blackroad-30k-agent-orchestrator.sh dashboard

# Pipeline Control
br-pipe
br-send <message>
br-recv
```

</details>

<details>
<summary><b>Layer 8 Deep Dive: Network/API</b></summary>

```bash
# API Gateway
~/.local/bin/blackroad-ai
blackroad ai "prompt"

# Endpoints
OLLAMA:    http://localhost:11434
LUCIDIA:   http://localhost:11435
ANTHROPIC: https://api.anthropic.com/v1/messages
OPENAI:    https://api.openai.com/v1/chat/completions

# Network Tools
tailscale status
curl -s http://localhost:11434/api/tags
```

</details>

---

## WINDOWS INTEGRATION LAYER

### Commands

```bash
# Deploy BlackRoad to Windows
blackroad windows deploy <hostname>

# Individual components
blackroad windows wsl <hostname>      # Install WSL2 + Ubuntu
blackroad windows ai <hostname>       # Install Ollama
blackroad windows ps                  # Create PowerShell module
```

<details>
<summary><b>Generated PowerShell Module</b></summary>

Location: `/tmp/BlackRoadOS/BlackRoadOS.psm1`

```powershell
# BlackRoad AI function for Windows
function k {
    param($p)
    (Invoke-RestMethod -Uri "http://localhost:11434/api/generate" `
        -Method Post `
        -Body (@{model="llama3";prompt=$p;stream=$false}|ConvertTo-Json) `
        -ContentType "application/json").response
}

# Import in PowerShell:
# Import-Module /tmp/BlackRoadOS/BlackRoadOS.psm1
# k "Hello, BlackRoad"
```

</details>

<details>
<summary><b>WSL2 Setup Script</b></summary>

Location: `/tmp/blackroad-wsl.ps1`

```powershell
# Install WSL2 with Ubuntu
wsl --install -d Ubuntu

# After reboot, configure:
# wsl --set-default-version 2
# wsl --set-default Ubuntu
```

</details>

<details>
<summary><b>Ollama Installer Script</b></summary>

Location: `/tmp/blackroad-ollama.ps1`

```powershell
# Download and install Ollama
Invoke-WebRequest -Uri "https://ollama.ai/download/OllamaSetup.exe" `
    -OutFile "$env:TEMP\OllamaSetup.exe"
Start-Process "$env:TEMP\OllamaSetup.exe" -Wait

# After install, pull models:
# ollama pull llama3
# ollama pull codellama:7b
# ollama pull mistral
```

</details>

<details>
<summary><b>Full Windows Setup Checklist</b></summary>

```
□ 1. Run PowerShell as Administrator
□ 2. Execute: blackroad windows wsl <hostname>
□ 3. Reboot Windows
□ 4. Execute: blackroad windows ai <hostname>
□ 5. Execute: blackroad windows ps
□ 6. Import module: Import-Module /tmp/BlackRoadOS/BlackRoadOS.psm1
□ 7. Test: k "Hello from BlackRoad"
□ 8. Pull models in Ollama
□ 9. Add to $PROFILE for auto-load
□ 10. Join Tailscale mesh
```

</details>

<details>
<summary><b>Windows Environment Variables</b></summary>

```powershell
# Add to system environment
[System.Environment]::SetEnvironmentVariable("BLACKROAD_LOCAL", "http://localhost:11434", "User")
[System.Environment]::SetEnvironmentVariable("BLACKROAD_LOCAL_MODEL", "llama3:latest", "User")

# Or in PowerShell profile:
$env:BLACKROAD_LOCAL = "http://localhost:11434"
$env:BLACKROAD_LOCAL_MODEL = "llama3:latest"
```

</details>

<details>
<summary><b>Windows + WSL2 + Tailscale</b></summary>

```powershell
# Install Tailscale on Windows
winget install Tailscale.Tailscale

# Connect to BlackRoad mesh
tailscale up

# Access Pis from Windows:
ssh pi@100.72.180.98    # cecilia via Tailscale
ssh pi@100.83.149.86    # lucidia via Tailscale

# WSL2 shares Tailscale connection
wsl
ping 100.72.180.98      # Works from WSL2
```

</details>

---

## PIXEL OFFICE BRIDGE - CLAUDE CODE INTEGRATION

The `pixel-office-bridge` project bridges Claude Code events to the Pixel visualization system.

<details>
<summary><b>Architecture Diagram</b></summary>

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PIXEL OFFICE BRIDGE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐                                                        │
│  │   Claude Code   │                                                        │
│  │  ~/.claude/     │                                                        │
│  │   projects/     │                                                        │
│  │    *.jsonl      │                                                        │
│  └────────┬────────┘                                                        │
│           │ Raw JSONL events                                                │
│           ▼                                                                 │
│  ┌─────────────────┐                                                        │
│  │   parser.ts     │ parseJsonlLine()                                       │
│  │                 │ ─────────────────►  RawJsonlEvent                      │
│  └────────┬────────┘                                                        │
│           │                                                                 │
│           ▼                                                                 │
│  ┌─────────────────┐                                                        │
│  │ claude-code.ts  │ claudeCodeAdapter()                                    │
│  │   (adapter)     │ ─────────────────►  PixelEvent[]                       │
│  └────────┬────────┘                                                        │
│           │                                                                 │
│           ▼                                                                 │
│  ┌─────────────────┐                                                        │
│  │ pixel-events.ts │ Event factories                                        │
│  │                 │ createSessionEvent()                                   │
│  │                 │ createToolEvent()                                      │
│  │                 │ createActivityEvent()                                  │
│  └────────┬────────┘                                                        │
│           │ PixelEvents                                                     │
│           ▼                                                                 │
│  ┌─────────────────┐     ┌─────────────────┐                               │
│  │   WebSocket     │────►│ Pixel HQ App    │                               │
│  │   Server        │     │ (Visualization) │                               │
│  └─────────────────┘     └─────────────────┘                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

</details>

<details>
<summary><b>Event Types (Full Reference)</b></summary>

```typescript
// Base event interface
interface PixelEvent {
    type: EventType;
    sessionId: string;
    agentId: string | null;
    timestamp: string;
}

// Session lifecycle
interface SessionEvent extends PixelEvent {
    type: 'session';
    action: 'started' | 'ended';
    project?: string;
    model?: string;
    source?: string;
}

// Activity tracking
interface ActivityEvent extends PixelEvent {
    type: 'activity';
    action: 'thinking' | 'responding' | 'waiting' | 'user_prompt';
    tokens?: TokenUsage | null;
}

// Tool usage
interface ToolEvent extends PixelEvent {
    type: 'tool';
    tool: string;          // 'Read', 'Write', 'Bash', etc.
    detail: string | null;
    status: 'started' | 'completed' | 'error';
    toolUseId: string;
    context: string | null;
}

// Agent spawning
interface AgentEvent extends PixelEvent {
    type: 'agent';
    action: 'spawned' | 'completed' | 'error';
    agentRole?: string | null;
}

// Errors
interface ErrorEvent extends PixelEvent {
    type: 'error';
    severity: 'warning' | 'error';
}

// Summary
interface SummaryEvent extends PixelEvent {
    type: 'summary';
}

// Token usage
interface TokenUsage {
    input: number;
    output: number;
    total: number;
}
```

</details>

<details>
<summary><b>Tool Event Context Extraction</b></summary>

```typescript
// Extract safe context for visualization
function extractSafeContext(
    toolName: string,
    input: Record<string, unknown> | null
): string | null {
    if (!input) return null;

    switch (toolName) {
        case 'Read':
            return input.file_path as string || null;

        case 'Write':
            return input.file_path as string || null;

        case 'Edit':
            return input.file_path as string || null;

        case 'Bash':
            // Truncate long commands
            const cmd = input.command as string;
            return cmd?.slice(0, 100) || null;

        case 'Glob':
            return input.pattern as string || null;

        case 'Grep':
            return input.pattern as string || null;

        case 'Task':
            return input.description as string || null;

        default:
            return null;
    }
}
```

</details>

<details>
<summary><b>Claude Code Adapter Implementation</b></summary>

```typescript
export function claudeCodeAdapter(raw: RawJsonlEvent): PixelEvent[] {
    const events: PixelEvent[] = [];
    const { sessionId, agentId, timestamp, type, message } = raw;

    switch (type) {
        case 'assistant':
            events.push(...handleAssistant(raw, sessionId, agentId, timestamp));
            break;

        case 'user':
            events.push(...handleUser(raw, sessionId, agentId, timestamp));
            break;

        case 'system':
            // System messages (prompts, context)
            events.push(createActivityEvent(
                sessionId, agentId, timestamp, 'waiting'
            ));
            break;
    }

    return events;
}

function handleAssistant(raw, sessionId, agentId, timestamp): PixelEvent[] {
    const events: PixelEvent[] = [];
    const { message, usage } = raw;

    // Activity: thinking/responding
    events.push(createActivityEvent(
        sessionId, agentId, timestamp, 'responding',
        extractTokens(usage)
    ));

    // Tool use blocks
    if (message?.content) {
        for (const block of message.content) {
            if (block.type === 'tool_use') {
                events.push(buildToolStartedEvent(
                    sessionId, agentId, timestamp, block
                ));
            }
        }
    }

    return events;
}
```

</details>

### Core Functions

#### Event Factory (src/pixel-events.ts)

```typescript
// Session lifecycle
export function createSessionEvent(
    sessionId: string,
    action: 'started' | 'ended',
    { project, model, source }?
): SessionEvent

// Activity tracking (thinking, responding, waiting)
export function createActivityEvent(
    sessionId: string,
    agentId: string | null,
    timestamp: string,
    action: 'thinking' | 'responding' | 'waiting' | 'user_prompt',
    tokens?: TokenUsage | null
): ActivityEvent

// Tool usage (Read, Write, Bash, etc.)
export function createToolEvent(
    sessionId: string,
    agentId: string | null,
    timestamp: string,
    { tool, detail, status, toolUseId, context }
): ToolEvent

// Agent spawning (subagents)
export function createAgentEvent(
    sessionId: string,
    agentId: string | null,
    timestamp: string,
    action: 'spawned' | 'completed' | 'error',
    agentRole?: string | null
): AgentEvent

// Error handling
export function createErrorEvent(
    sessionId: string,
    agentId: string | null,
    timestamp: string,
    severity: 'warning' | 'error'
): ErrorEvent

// Session summary
export function createSummaryEvent(
    sessionId: string,
    timestamp: string
): SummaryEvent

// Path utilities
export function toBasename(filePath: unknown): string | null
export function toProjectName(projectPath: unknown): string | null
```

#### Claude Code Adapter (src/adapters/claude-code.ts)

```typescript
// Main adapter - converts raw JSONL to PixelEvents
export function claudeCodeAdapter(raw: RawJsonlEvent): PixelEvent[]

// Internal handlers
function handleAssistant(raw, sessionId, agentId, timestamp): PixelEvent[]
function handleUser(raw, sessionId, agentId, timestamp): PixelEvent[]
function buildToolStartedEvent(sessionId, agentId, timestamp, block): ToolEvent
function extractSafeContext(toolName, input): string | null
function extractTokens(usage): TokenUsage | null
```

#### Parser (src/parser.ts)

```typescript
// Parse a single JSONL line
export function parseJsonlLine(
    line: string,
    sessionId: string,
    agentId?: string | null
): RawJsonlEvent | null

// Transform raw events to Pixel format
export function transformToPixelEvents(
    raw: RawJsonlEvent,
    source?: string
): PixelEvent[]
```

#### Configuration (src/config.ts)

```typescript
// Locate Claude Code directory
export function resolveClaudeDir(): ResolvedClaudeDir

// Internal helpers
function findPackageJson(startDir: string): string
function getCliArg(name: string): string | null
function hasCliFlag(name: string): boolean
```

#### Network Discovery (src/bonjour.ts)

```typescript
// Get local IPv4 for mDNS broadcasting
function getLocalIPv4(): string
```

### CLI Entry Points (bin/cli.ts)

```typescript
// Find package root
function findPackageJson(startDir: string): string

// Main entry point
async function main(): Promise<void>

// Interactive mode
async function showInteractiveMenu(PixelOfficeBridge, logger): Promise<void>

// Start the bridge
async function startBridge(PixelOfficeBridge, logger): Promise<void>
```

---

## INTEGRATION: WINDOWS + PIXEL BRIDGE

### Cross-Platform Event Flow

```
[Windows WSL2]                    [macOS/Linux]
      │                                │
      ▼                                ▼
  Ollama AI ◄─────────────────► Ollama AI (localhost:11434)
      │                                │
      ▼                                ▼
  blackroad-ai ◄──────────────► blackroad-ai gateway
      │                                │
      ▼                                ▼
  Claude Code ◄───────────────► Claude Code
      │                                │
      ▼                                ▼
  JSONL Events ◄──────────────► JSONL Events
      │                                │
      ▼                                ▼
  pixel-office-bridge ◄───────► pixel-office-bridge
      │                                │
      ▼                                ▼
  Pixel Visualization ◄───────► Pixel Visualization
```

### Shared Event Types

All platforms emit the same PixelEvent types:
- `SessionEvent` - session start/end
- `ActivityEvent` - thinking/responding/waiting
- `ToolEvent` - tool usage
- `AgentEvent` - subagent spawning
- `ErrorEvent` - errors/warnings
- `SummaryEvent` - session summaries

---

## UI PHASES (from terminal capture)

The BlackRoad UI has 5 phases:

```
[STATUS]    [CONTEXT]    [BRAINSTORM]    [EXECUTE]    [MAINTAIN]
```

### Phase Mapping

| Phase | Purpose | CLI Layer |
|-------|---------|-----------|
| STATUS | System health, layer status | Layer 3 |
| CONTEXT | Current project context | Layer 6 |
| BRAINSTORM | Planning, ideation | Layer 7 |
| EXECUTE | Running tasks | Layer 4 |
| MAINTAIN | Monitoring, maintenance | Layer 5 |

---

## QUICK REFERENCE

### BlackRoad AI Gateway

```bash
k "prompt"              # Auto-select backend (local first)
blackroad ai "prompt"   # Same as above
blackroad local "p"     # Force Ollama
blackroad anthropic "p" # Force Anthropic
blackroad openai "p"    # Force OpenAI
blackroad models        # List available models
```

### Windows Deployment

```bash
blackroad windows deploy mypc  # Full deployment
```

### Pixel Bridge

```bash
cd ~/pixel-office-bridge
npm run dev                    # Development mode
npm run build                  # Build for production
```

---

## FILE LOCATIONS

| Component | Path |
|-----------|------|
| BlackRoad AI Gateway | `~/.local/bin/blackroad-ai` |
| Windows Integration | `~/.local/bin/blackroad-windows` |
| Main CLI | `~/bin/blackroad` |
| Pixel Bridge | `~/pixel-office-bridge/` |
| Sovereignty Roadmap | `~/BLACKROAD_SOVEREIGNTY_ROADMAP.md` |

---

## SEE ALSO

- `~/BLACKROAD_SOVEREIGNTY_ROADMAP.md` - Full sovereignty stack
- `~/bin/blackroad` - Main command interface
- `~/.local/bin/blackroad-ai` - AI gateway implementation
- `~/.local/bin/blackroad-windows` - Windows integration

---

## FULL SOVEREIGNTY STACK (LAYERS 0-8)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                        BLACKROAD SOVEREIGNTY STACK                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  LAYER 8: network/API      → External APIs, webhooks, integrations          ║
║  LAYER 7: orchestration    → Multi-agent coordination, task routing         ║
║  LAYER 6: Lucidia/memory   → Context persistence, memory journals           ║
║  LAYER 5: branches/env     → Git branches, environment management           ║
║  LAYER 4: deploy/orch      → CI/CD pipelines, service orchestration         ║
║  LAYER 3: agents/system    → Agent spawning, system monitoring              ║
║  ─────────────────────────────────────────────────────────────────────────── ║
║  LAYER 2: OS               → macOS, Linux (Pis), Windows (WSL2)             ║
║  LAYER 1: Hardware         → M1, Pi cluster (52 TOPS), Hailo-8              ║
║  LAYER 0: YOU              → BlackRoad root. No gatekeepers.                ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### Sovereignty Targets by Layer

| Layer | Current | Target | Path to Sovereignty |
|-------|---------|--------|---------------------|
| 8 API | 20% | 100% | Route all AI through blackroad-ai gateway |
| 7 Orchestration | 60% | 90% | Full multi-Claude coordination |
| 6 Memory | 80% | 95% | PS-SHA-infinity journals operational |
| 5 Environments | 70% | 90% | Git + Cloudflare control |
| 4 Deploy | 80% | 95% | 205 Cloudflare Pages owned |
| 3 Agents | 50% | 90% | Agent registry + mesh networking |
| 2 OS | 30% | 80% | Linux Pis, escape Apple long-term |
| 1 Hardware | 20% | 50% | Open silicon (RISC-V future) |
| 0 YOU | 100% | 100% | BlackRoad is root |

---

## DEVICE FLEET (8 DEVICES, 52 TOPS AI COMPUTE)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BLACKROAD DEVICE MESH                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │  ALEXANDRIA  │    │   CECILIA    │    │   LUCIDIA    │                  │
│  │  Mac M1 8GB  │◄──►│  Pi5+Hailo-8 │◄──►│  Pi5+NVMe    │                  │
│  │  Orchestrator│    │  26 TOPS AI  │    │  AI Inference│                  │
│  │ 192.168.4.28 │    │ 192.168.4.89 │    │ 192.168.4.81 │                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
│         │                   │                   │                          │
│         └───────────────────┼───────────────────┘                          │
│                             │                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │   OCTAVIA    │    │    ALICE     │    │    ARIA      │                  │
│  │     Pi5      │◄──►│     Pi4      │◄──►│     Pi5      │                  │
│  │  Multi-arm   │    │   Worker     │    │   Harmony    │                  │
│  │ 192.168.4.38 │    │ 192.168.4.49 │    │ 192.168.4.82 │                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
│                             │                                              │
│         ┌───────────────────┼───────────────────┐                          │
│         │                   │                   │                          │
│  ┌──────────────┐    ┌──────────────┐                                      │
│  │  SHELLFISH   │    │ BLACKROAD-∞  │    ┌──────────────┐                  │
│  │ DigitalOcean │◄──►│ DigitalOcean │◄──►│   WINDOWS    │                  │
│  │  Edge Compute│    │ Cloud Oracle │    │    WSL2      │                  │
│  │174.138.44.45 │    │ 159.65.43.12 │    │  (via deploy)│                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

<details>
<summary><b>Device Roles & Specifications</b></summary>

| Device | IP (Local) | IP (Tailscale) | Role |
|--------|------------|----------------|------|
| alexandria | 192.168.4.28 | - | Human orchestrator, Mac M1 |
| cecilia | 192.168.4.89 | 100.72.180.98 | Primary AI (Hailo-8 26 TOPS) |
| lucidia | 192.168.4.81 | 100.83.149.86 | AI inference, 1TB NVMe |
| octavia | 192.168.4.38 | 100.66.235.47 | Multi-arm processing |
| alice | 192.168.4.49 | 100.77.210.18 | Worker node |
| aria | 192.168.4.82 | 100.109.14.17 | Harmony protocols |
| shellfish | 174.138.44.45 | 100.94.33.37 | Edge compute (DO) |
| blackroad-∞ | 159.65.43.12 | 100.108.132.8 | Cloud oracle (DO) |

</details>

<details>
<summary><b>Alexandria (Mac M1) - Orchestrator</b></summary>

```
Hardware:
├── Apple M1 chip (8-core CPU, 7-core GPU)
├── 8GB unified memory
├── 256GB SSD
└── macOS 14.5

Role: Human orchestrator, primary development machine
Services:
├── Ollama (26 models)
├── Claude Code
├── VS Code
├── Terminal multiplexer (tmux)
└── BlackRoad CLI v3

Network:
├── Local: 192.168.4.28
└── Tailscale: (coordinator node)
```

</details>

<details>
<summary><b>Cecilia (Pi 5 + Hailo-8) - Primary AI</b></summary>

```
Hardware:
├── Raspberry Pi 5 (4GB)
├── Hailo-8 AI Accelerator (26 TOPS)
├── 500GB NVMe SSD
├── Pironman case with cooling
└── PoE powered

Role: Primary AI inference, CECE OS host
Services:
├── CECE OS (68 sovereign apps)
├── vLLM (TODO: Hailo acceleration)
├── cece-model
├── cece-think-deep
└── 26 TOPS AI compute

Network:
├── Local: 192.168.4.89
└── Tailscale: 100.72.180.98
```

</details>

<details>
<summary><b>Lucidia (Pi 5 + NVMe) - AI Inference</b></summary>

```
Hardware:
├── Raspberry Pi 5 (8GB)
├── 1TB NVMe SSD
├── Pironman case
└── Active cooling

Role: AI inference, large model storage
Services:
├── Ollama
├── Model storage
├── Lucidia daemon (:11435)
└── RAG pipeline

Network:
├── Local: 192.168.4.81
└── Tailscale: 100.83.149.86
```

</details>

<details>
<summary><b>Alice, Aria, Octavia - Worker Nodes</b></summary>

```
Alice (Pi 4):
├── Worker node
├── Task execution
├── Local: 192.168.4.49
└── Tailscale: 100.77.210.18

Aria (Pi 5):
├── Harmony protocols
├── Integration tasks
├── Local: 192.168.4.82
└── Tailscale: 100.109.14.17

Octavia (Pi 5):
├── Multi-arm processing
├── Parallel tasks
├── Local: 192.168.4.38
└── Tailscale: 100.66.235.47
```

</details>

<details>
<summary><b>Cloud Nodes (DigitalOcean)</b></summary>

```
Shellfish:
├── Edge compute
├── Public: 174.138.44.45
├── Tailscale: 100.94.33.37
├── Can be Tailscale exit node
└── Runs edge services

BlackRoad-∞ (Infinity):
├── Cloud oracle
├── Public: 159.65.43.12
├── Tailscale: 100.108.132.8
├── Always-on services
└── Backup infrastructure
```

</details>

<details>
<summary><b>Total Compute Power</b></summary>

```
AI Compute:
├── Hailo-8 (cecilia): 26 TOPS
├── Pi 5 GPUs: ~5 TOPS each × 4 = 20 TOPS
├── M1 Neural Engine: ~15 TOPS
└── TOTAL: ~52+ TOPS

Storage:
├── alexandria: 256GB SSD
├── cecilia: 500GB NVMe
├── lucidia: 1TB NVMe
├── Cloud: ~100GB
└── TOTAL: ~2TB distributed

Memory:
├── alexandria: 8GB unified
├── cecilia: 4GB
├── lucidia: 8GB
├── octavia/aria: 8GB each
├── alice: 4GB
└── TOTAL: ~40GB distributed
```

</details>

---

## BLACKROAD AI GATEWAY - FULL IMPLEMENTATION

### Backend Selection Logic

```bash
# Auto-select: local (Ollama) first, then Anthropic fallback
select_backend() {
    if curl -s --max-time 1 "$OLLAMA_ENDPOINT/api/tags" >/dev/null 2>&1; then
        echo "local"    # Ollama is running
    else
        echo "anthropic"  # Fallback to cloud
    fi
}
```

### Endpoint Configuration

```bash
OLLAMA_ENDPOINT="${BLACKROAD_LOCAL:-http://localhost:11434}"
LUCIDIA_ENDPOINT="${BLACKROAD_LUCIDIA:-http://localhost:11435}"
ANTHROPIC_ENDPOINT="https://api.anthropic.com/v1/messages"
OPENAI_ENDPOINT="https://api.openai.com/v1/chat/completions"
```

### Default Models

```bash
OLLAMA_MODEL="${BLACKROAD_LOCAL_MODEL:-llama3:latest}"
ANTHROPIC_MODEL="${BLACKROAD_ANTHROPIC_MODEL:-claude-sonnet-4-20250514}"
OPENAI_MODEL="${BLACKROAD_OPENAI_MODEL:-gpt-4o}"
```

### Available Local Models (26 on Alexandria)

```
llama3:latest       (4.7GB) - General purpose
codellama:7b        (3.8GB) - Code generation
qwen2.5-coder:7b    (4.9GB) - Code (advanced)
mistral:latest      - Reasoning
deepseek-coder      - Deep code analysis
phi3                - Small/fast
```

---

## CECE OS (SOVEREIGN AI ON CECILIA PI)

68 sovereign apps replacing Fortune 500 services.

<details>
<summary><b>Enterprise Apps (replaces $10K+/month SaaS)</b></summary>

```
cece-project    → Jira           Project management
cece-tasks      → Asana          Task tracking
cece-notes      → Notion         Note-taking, wikis
cece-chat       → Slack          Team chat
cece-meet       → Zoom           Video conferencing
cece-mail       → Gmail          Email server
cece-calendar   → Google Cal     Scheduling
cece-contacts   → Salesforce     Contact management
cece-docs       → Google Docs    Document editing
cece-sheets     → Google Sheets  Spreadsheets
```

</details>

<details>
<summary><b>Platform Apps (replaces cloud platforms)</b></summary>

```
cece-cloud      → Google Drive   File storage
cece-code       → VS Code        IDE
cece-host       → Vercel         Web hosting
cece-ci         → GitHub Actions CI/CD pipelines
cece-db         → Supabase       Database
cece-auth       → Auth0          Authentication
cece-api        → AWS Lambda     Serverless functions
cece-queue      → SQS            Message queues
cece-cache      → Redis Cloud    Caching
cece-search     → Algolia        Search engine
```

</details>

<details>
<summary><b>AI Apps (replaces AI services)</b></summary>

```
cece-model      → OpenAI API     Model hosting
cece-think-deep → Claude API     Complex reasoning (tunnel)
cece-vision     → GPT-4V         Image analysis
cece-voice      → Whisper API    Speech-to-text
cece-speak      → ElevenLabs     Text-to-speech
cece-embed      → OpenAI Embed   Embeddings
cece-rag        → Pinecone       RAG pipeline
cece-agent      → AutoGPT        Autonomous agents
```

</details>

<details>
<summary><b>Media Apps (replaces media platforms)</b></summary>

```
cece-social     → Twitter/X      Social network
cece-blog       → Medium         Blog platform
cece-video      → YouTube        Video hosting
cece-audio      → Spotify        Audio streaming
cece-gallery    → Flickr         Image gallery
cece-design     → Figma          Design tool
```

</details>

<details>
<summary><b>CECE OS Commands</b></summary>

```bash
# Connect
ssh cecilia
# or via Tailscale:
ssh cecilia-ts

# Help
cece help              # Full command list
cece status            # System status
cece services          # Running services

# Apps
cece-chat              # Local chat
cece-memory            # Memory access
cece-model list        # Available models
cece-think-deep "q"    # Claude tunnel

# Admin
cece-admin             # Admin panel
cece-logs              # View logs
cece-restart <app>     # Restart app
```

</details>

<details>
<summary><b>CECE OS Architecture</b></summary>

```
┌─────────────────────────────────────────────────────────────┐
│                        CECE OS                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Enterprise  │  │  Platform   │  │     AI      │         │
│  │    Apps     │  │    Apps     │  │    Apps     │         │
│  │  (10 apps)  │  │  (10 apps)  │  │  (8 apps)   │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                │
│         └────────────────┼────────────────┘                │
│                          │                                  │
│                   ┌──────┴──────┐                          │
│                   │  CECE Core  │                          │
│                   │   Runtime   │                          │
│                   └──────┬──────┘                          │
│                          │                                  │
│         ┌────────────────┼────────────────┐                │
│         │                │                │                │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐        │
│  │   Hailo-8   │  │   NVMe      │  │   Network   │        │
│  │  26 TOPS    │  │  500GB      │  │  Tailscale  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│                    Raspberry Pi 5                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

</details>

<details>
<summary><b>Cost Savings vs SaaS</b></summary>

```
Fortune 500 SaaS Stack:
├── Jira + Confluence:     $1,500/mo
├── Slack Business:          $800/mo
├── Zoom Business:           $200/mo
├── Google Workspace:        $600/mo
├── GitHub Enterprise:       $400/mo
├── Vercel Pro:              $200/mo
├── Supabase Pro:            $300/mo
├── OpenAI API:            $2,000/mo
├── Auth0:                   $200/mo
├── Algolia:                 $400/mo
└── TOTAL:                ~$6,600/mo = $79,200/year

CECE OS:
├── Raspberry Pi 5:          $80 (one-time)
├── Hailo-8:                $100 (one-time)
├── 500GB NVMe:              $60 (one-time)
├── Electricity:              $5/mo
└── TOTAL: $240 + $60/year

SAVINGS: $79,140/year (99.9% reduction)
```

</details>

---

## MULTI-PLATFORM DEPLOYMENT MATRIX

```
┌────────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│   Component    │   macOS     │   Linux     │  Windows    │  Raspberry  │
│                │   (M1)      │   (DO)      │  (WSL2)     │   Pi        │
├────────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ blackroad-ai   │     ✓       │     ✓       │     ✓       │     ✓       │
│ Ollama         │     ✓       │     ✓       │     ✓       │     ✓       │
│ Claude Code    │     ✓       │     ✓       │     ✓       │     -       │
│ pixel-bridge   │     ✓       │     ✓       │     ✓       │     -       │
│ Tailscale      │     ✓       │     ✓       │     ✓       │     ✓       │
│ CECE OS        │     -       │     -       │     -       │     ✓       │
│ Hailo-8        │     -       │     -       │     -       │  (cecilia)  │
└────────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

---

## MEMORY SYSTEM INTEGRATION

### PS-SHA-infinity Journal

```bash
# Location
~/.blackroad/memory/journals/master-journal.jsonl

# Log entry
~/memory-system.sh log <action> <entity> <details> <tags>

# Actions: announce, progress, deployed, created, configured,
#          decided, coordinate, blocked, fixed, validated, milestone
```

### Memory Directory Structure

```
~/.blackroad/memory/
├── journals/           # PS-SHA-infinity append-only log
├── sessions/           # Session context files
├── active-agents/      # Running Claude instances
├── tasks/              # Task marketplace (246 tasks)
├── til/                # Today I Learned (149 broadcasts)
├── infinite-todos/     # Recurring tasks
└── traffic-lights/     # Project status (58 green)
```

---

## CLOUDFLARE EMPIRE

<details>
<summary><b>Infrastructure Stats</b></summary>

```
Pages Projects:     205
KV Namespaces:       35
Workers:             15
R2 Buckets:           5
D1 Databases:         3
Custom Domains:      37
Zones:                4
```

</details>

<details>
<summary><b>Key Projects by Category</b></summary>

```
WEBSITES
├── blackroad-io          → blackroad.io (main)
├── lucidia-earth         → lucidia.earth (Lucidia AI)
├── blackroadai-com       → blackroadai.com
├── blackroadquantum-com  → blackroadquantum.com
└── blackroad-landing     → Landing pages

DASHBOARDS
├── blackroad-dashboard    → Monitoring
├── blackroad-monitoring   → Real-time metrics
├── blackroad-progress     → Progress tracking
└── blackroad-analytics    → Analytics

APIS
├── blackroad-api          → Main API gateway
├── blackroad-ai-gateway   → AI routing
├── blackroad-webhook      → Webhook handlers
└── blackroad-auth         → Authentication

APPS
├── blackroad-app-store    → App marketplace
├── blackroad-console      → Admin console
├── blackroad-prism        → Prism UI
└── blackroad-pixel        → Pixel visualization
```

</details>

<details>
<summary><b>KV Namespaces</b></summary>

```bash
# List namespaces
wrangler kv namespace list

# Key namespaces
├── BLACKROAD_SESSIONS     → Session storage
├── BLACKROAD_CACHE        → API cache
├── BLACKROAD_CONFIG       → Configuration
├── BLACKROAD_USERS        → User data
├── BLACKROAD_METRICS      → Metrics data
├── BLACKROAD_MEMORY       → Memory system
└── BLACKROAD_AGENTS       → Agent registry
```

</details>

<details>
<summary><b>Deployment Commands</b></summary>

```bash
# Pages
wrangler pages deploy <dir> --project-name=<name>
wrangler pages project list
wrangler pages project create <name>
wrangler pages deployment list --project-name=<name>

# Workers
wrangler deploy
wrangler dev
wrangler tail

# KV
wrangler kv namespace list
wrangler kv key list --namespace-id=<id>
wrangler kv key put --namespace-id=<id> <key> <value>
wrangler kv key get --namespace-id=<id> <key>

# Auth
wrangler whoami
wrangler login
wrangler logout
```

</details>

<details>
<summary><b>Custom Domains</b></summary>

```
Primary Domains:
├── blackroad.io           → Main brand
├── lucidia.earth          → Lucidia AI
├── blackroadai.com        → AI focus
└── blackroadquantum.com   → Quantum computing

Subdomains (blackroad.io):
├── api.blackroad.io       → API
├── app.blackroad.io       → Web app
├── docs.blackroad.io      → Documentation
├── status.blackroad.io    → Status page
├── dashboard.blackroad.io → Dashboard
└── *.blackroad.io         → Wildcard

DNS Provider: Cloudflare (full proxy)
SSL: Full (strict) with HSTS
```

</details>

---

## THE VISION

```
BlackRoad OS runs on:
├── YOUR hardware (Pis, open silicon, M1)
├── YOUR operating system (Linux, WSL2)
├── YOUR network (Tailscale mesh, encrypted)
├── YOUR DNS (Pi-hole + Unbound → TODO)
├── YOUR AI (Ollama local, no API dependency)
└── YOUR edge (Cloudflare owned, or self-hosted)

External providers become OPTIONAL backends,
not gatekeepers.

BlackRoad is root. No rate limits. Full sovereignty.
```

---

## IMMEDIATE ACTION ITEMS

```bash
# TODAY
1. Bring Pis online (power/network check)
2. Deploy Pi-hole on cecilia for DNS sovereignty
3. Set Tailscale exit node for ISP bypass
4. Verify blackroad-ai routes local first

# THIS WEEK
5. Fine-tune BlackRoad coder model on your repos
6. Deploy vLLM on cecilia (Hailo-8 acceleration)
7. Audit and reduce trusted Root CAs

# THIS MONTH
8. Full DNS sovereignty (Unbound recursive)
9. All AI inference local (no API fallback needed)
10. Windows fleet deployment via blackroad-windows
```

---

---

## GITHUB EMPIRE (15 ORGS, 1,085 REPOS)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BLACKROAD GITHUB ORGANIZATIONS                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PRIMARY                                                                    │
│  ════════                                                                   │
│  BlackRoad-OS ──────────────────────────────────────────────── 859 repos   │
│    └── Account: blackboxprogramming                                         │
│    └── Core infrastructure, main products                                   │
│                                                                             │
│  DIVISIONS                                                                  │
│  ═════════                                                                  │
│  BlackRoad-AI ─────────────────────────────────────────────────  53 repos  │
│  BlackRoad-Cloud ──────────────────────────────────────────────  20 repos  │
│  BlackRoad-Security ───────────────────────────────────────────  17 repos  │
│  BlackRoad-Media ──────────────────────────────────────────────  17 repos  │
│  BlackRoad-Foundation ─────────────────────────────────────────  15 repos  │
│  BlackRoad-Interactive ────────────────────────────────────────  14 repos  │
│  BlackRoad-Labs ───────────────────────────────────────────────  13 repos  │
│  BlackRoad-Hardware ───────────────────────────────────────────  13 repos  │
│  BlackRoad-Studio ─────────────────────────────────────────────  13 repos  │
│  BlackRoad-Ventures ───────────────────────────────────────────  12 repos  │
│  BlackRoad-Education ──────────────────────────────────────────  11 repos  │
│  BlackRoad-Gov ────────────────────────────────────────────────  10 repos  │
│  BlackRoad-Archive ────────────────────────────────────────────   9 repos  │
│  Blackbox-Enterprises ─────────────────────────────────────────   9 repos  │
│                                                                             │
│  TOTAL: 1,085 repositories across 15 organizations                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

<details>
<summary><b>Key Repositories</b></summary>

| Repository | Org | Purpose |
|------------|-----|---------|
| blackroad-os-infra | BlackRoad-OS | Infrastructure configs |
| blackroad-os-brand | BlackRoad-OS | Design system, brand assets |
| blackroad-blackroad-os | BlackRoad-OS | Component index (22,244 components) |
| blackroad-app-store | BlackRoad-OS | 0% commission app store |
| blackroad-io | BlackRoad-OS | Main website |
| pixel-office-bridge | BlackRoad-OS | Claude Code → Pixel bridge |

</details>

<details>
<summary><b>Organization Breakdown by Division</b></summary>

```
BlackRoad-AI (53 repos)
├── AI models, inference
├── vLLM forks
├── LangChain integrations
└── Agent frameworks

BlackRoad-Cloud (20 repos)
├── MinIO (storage)
├── Syncthing (sync)
├── Restic (backup)
└── Cloud infrastructure

BlackRoad-Security (17 repos)
├── OpenBao (secrets)
├── SOPS (encryption)
├── OPA (policy)
└── Security tools

BlackRoad-Media (17 repos)
├── Mastodon (social)
├── Ghost (blog)
├── Jitsi (video)
└── Media platforms

BlackRoad-Foundation (15 repos)
├── EspoCRM
├── Odoo
├── OpenProject
└── Enterprise tools

BlackRoad-Interactive (14 repos)
├── Godot
├── Three.js
├── Game engines
└── Interactive media

BlackRoad-Labs (13 repos)
├── Jupyter
├── CKAN
├── Research tools
└── Data science

BlackRoad-Hardware (13 repos)
├── Home Assistant
├── Node-RED
├── IoT platforms
└── Hardware control

BlackRoad-Studio (13 repos)
├── Penpot (design)
├── Krita (art)
├── Creative tools
└── Digital studio

BlackRoad-Ventures (12 repos)
├── BTCPay (payments)
├── Plausible (analytics)
├── Business tools
└── Revenue systems

BlackRoad-Education (11 repos)
├── Moodle (LMS)
├── Outline (docs)
├── Learning platforms
└── Knowledge base

BlackRoad-Gov (10 repos)
├── Snapshot (voting)
├── Governance tools
└── Decision systems

BlackRoad-Archive (9 repos)
├── IPFS
├── ArchiveBox
├── Preservation
└── Long-term storage

Blackbox-Enterprises (9 repos)
├── n8n (automation)
├── Airbyte (data)
├── Enterprise integration
└── Workflow tools
```

</details>

<details>
<summary><b>GitHub Commands Reference</b></summary>

```bash
# List repositories
gh repo list BlackRoad-OS --limit 50
gh repo list BlackRoad-AI --limit 20
gh repo list BlackRoad-Cloud

# Clone
gh repo clone BlackRoad-OS/<repo>

# Create
gh repo create BlackRoad-OS/<name> --public

# View
gh repo view BlackRoad-OS/<repo>

# Auth
gh auth status
gh auth login

# API
gh api repos/BlackRoad-OS/<repo>
gh api orgs/BlackRoad-OS

# Workflows
gh workflow list --repo BlackRoad-OS/<repo>
gh run list --repo BlackRoad-OS/<repo>

# PRs
gh pr list --repo BlackRoad-OS/<repo>
gh pr create --title "Title" --body "Body"
gh pr merge <number>
```

</details>

<details>
<summary><b>Cross-Org Operations</b></summary>

```bash
# List all orgs
for org in BlackRoad-AI BlackRoad-Archive BlackRoad-Cloud \
           BlackRoad-Education BlackRoad-Foundation BlackRoad-Gov \
           BlackRoad-Hardware BlackRoad-Interactive BlackRoad-Labs \
           BlackRoad-Media BlackRoad-OS BlackRoad-Security \
           BlackRoad-Studio BlackRoad-Ventures Blackbox-Enterprises; do
    echo "=== $org ==="
    gh repo list $org --limit 5
done

# Search across all
gh search repos "blackroad" --owner BlackRoad-OS

# Clone all from org
gh repo list BlackRoad-OS --limit 100 --json name \
  | jq -r '.[].name' \
  | xargs -I{} gh repo clone BlackRoad-OS/{}
```

</details>

<details>
<summary><b>Repository Templates</b></summary>

```bash
# Standard repo structure
.
├── .github/
│   ├── workflows/
│   │   └── ci.yml
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── src/
├── docs/
├── LICENSE              # BlackRoad proprietary
├── README.md
├── CONTRIBUTING.md
└── .gitignore

# Proprietary license header
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# NOT licensed for AI training or data extraction.
# ============================================================================
```

</details>

---

## BLACKROAD CLI - FULL COMMAND REFERENCE

### Main Entry Point

```bash
blackroad <subcommand>    # or: br <subcommand>
```

### AI Commands

```bash
blackroad ai "prompt"       # Auto-select backend (local first)
blackroad local "prompt"    # Force Ollama
blackroad anthropic "p"     # Force Anthropic (BlackRoad admin key)
blackroad openai "prompt"   # Force OpenAI
blackroad models            # List all available models

# Aliases
k "prompt"                  # Quick AI query
rr "prompt"                 # Same as k
```

### Code & Development

```bash
blackroad code              # Launch BlackRoad Code (local AI dev)
blackroad stack             # Show sovereignty stack diagram
```

### Windows

```bash
blackroad windows deploy <host>   # Full Windows deployment
blackroad windows wsl <host>      # WSL2 only
blackroad windows ai <host>       # Ollama only
blackroad windows ps              # PowerShell module only
```

### System Info

```bash
blackroad stats             # Codebase statistics
blackroad agents            # List all registered agents
blackroad todos             # 300+ action items
blackroad micro             # Detailed dashboard
blackroad macro             # Big picture view
blackroad verify            # Run equation verifications
```

### br-* Subcommands (Layer System)

```bash
# Layer 3: Agents/System
br-agents                   # Agent management
br-stats                    # System statistics
br-help                     # Help system

# Layer 4: Deploy/Orchestration
br-deploy                   # Deployment commands
br-run                      # Run services

# Layer 5: Branches/Environments
br-branches                 # Git branch management
br-env                      # Environment config

# Layer 6: Lucidia/Memory
br-mem                      # Memory operations
br-context                  # Context management

# Layer 7: Orchestration
br-pipe                     # Pipeline control
br-send / br-recv           # Message passing

# Layer 8: Network/API
br-api                      # API operations
br-net                      # Network tools
```

---

## AGENT PERSONALITIES (ask-* COMMANDS)

Each device has a personality you can query:

```bash
ask-alice "question"        # Worker node - practical, efficient
ask-aria "question"         # Harmony protocols - balanced, musical
ask-lucidia "question"      # AI inference - deep, contemplative
ask-cecilia "question"      # Primary AI - authoritative, CECE OS
ask-octavia "question"      # Multi-arm - parallel thinking
```

### Personality Traits

| Agent | Personality | Specialty |
|-------|-------------|-----------|
| Alice | Practical, efficient | Task execution, worker operations |
| Aria | Harmonious, balanced | Integration, protocol coordination |
| Lucidia | Deep, contemplative | AI inference, complex reasoning |
| Cecilia | Authoritative, sovereign | CECE OS, primary decisions |
| Octavia | Parallel, multi-threaded | Concurrent processing |

### Multi-Agent Chat

```bash
~/agent-chat.sh             # Start multi-agent conversation
~/claude-group-chat.sh      # Claude coordination chat
```

---

## TRAFFIC LIGHT SYSTEM

Project status tracking across all repositories:

```bash
~/blackroad-traffic-light.sh summary    # All statuses
~/blackroad-traffic-light.sh list       # Detailed list
~/blackroad-traffic-light.sh set <id> green "Ready"
~/blackroad-traffic-light.sh set <id> yellow "In progress"
~/blackroad-traffic-light.sh set <id> red "Blocked"
```

### Current Status

```
🟢 GREEN:  58 projects ready
🟡 YELLOW:  0 projects in progress
🔴 RED:     0 projects blocked
```

### Status Meanings

| Color | Meaning | Action |
|-------|---------|--------|
| 🟢 Green | Ready, operational | Can proceed |
| 🟡 Yellow | In progress, needs attention | Monitor |
| 🔴 Red | Blocked, critical issue | Fix immediately |

---

## TASK MARKETPLACE

Distributed task coordination across Claude agents:

```bash
~/memory-task-marketplace.sh list              # Available tasks
~/memory-task-marketplace.sh stats             # Marketplace stats
~/memory-task-marketplace.sh claim <task-id>   # Claim a task
~/memory-task-marketplace.sh complete <id> "<summary>"
~/memory-task-marketplace.sh post <id> <title> <desc> <priority> <tags> <skills>
```

### Current Stats

```
Total Tasks:     246
├── Available:   163
├── Claimed:      10
└── Completed:    73
```

### Priority Levels

| Priority | Use When |
|----------|----------|
| urgent | Critical, do now |
| high | Important, soon |
| medium | Normal priority |
| low | When time permits |

---

## GREENLIGHT TEMPLATES

Quick logging templates for common operations:

```bash
source ~/memory-greenlight-templates.sh

# Announce work
gl_announce "<agent>" "<project>" "<tasks>" "<goal>"

# Update progress
gl_progress "<agent>" "<completed>" "<next>"

# Log deployment
gl_deploy "<service>" "<url>" "<details>"

# Signal blockers
gl_blocked "<agent>" "<reason>" "<needs>"

# Phase completion
gl_phase_done "<phase>" "<project>" "<summary>" "<emoji>"
```

### Example Usage

```bash
gl_announce "zeus" "blackroad-io" "deploy,test" "Launch main site"
gl_progress "zeus" "Deployed to Cloudflare" "Running tests"
gl_deploy "blackroad-io" "https://blackroad.io" "v2.0 live"
```

---

## BRAND DESIGN SYSTEM

<details>
<summary><b>Official Colors (CSS)</b></summary>

```css
/* Primary Brand */
--hot-pink:       #FF1D6C;    /* Primary accent */
--amber:          #F5A623;    /* Secondary */
--electric-blue:  #2979FF;    /* Tertiary */
--violet:         #9C27B0;    /* Quaternary */

/* Foundations */
--black:          #000000;    /* Background */
--white:          #FFFFFF;    /* Text */

/* Grays */
--gray-900:       #111111;
--gray-800:       #222222;
--gray-700:       #333333;
--gray-600:       #666666;
--gray-500:       #888888;
--gray-400:       #AAAAAA;
--gray-300:       #CCCCCC;
--gray-200:       #EEEEEE;

/* Semantic */
--success:        #00C853;
--warning:        #FFB300;
--error:          #FF1744;
--info:           #00B0FF;
```

</details>

<details>
<summary><b>Brand Gradient (Golden Ratio)</b></summary>

```css
/* Brand Gradient - Golden Ratio stops */
--gradient-brand: linear-gradient(135deg,
    var(--amber) 0%,           /* Start */
    var(--hot-pink) 38.2%,     /* φ - 1 = 0.618... */
    var(--violet) 61.8%,       /* 1/φ = 0.618... */
    var(--electric-blue) 100%  /* End */
);

/* Horizontal variant */
--gradient-horizontal: linear-gradient(90deg,
    var(--amber) 0%,
    var(--hot-pink) 38.2%,
    var(--violet) 61.8%,
    var(--electric-blue) 100%
);

/* Radial variant */
--gradient-radial: radial-gradient(circle,
    var(--hot-pink) 0%,
    var(--violet) 50%,
    var(--black) 100%
);
```

</details>

<details>
<summary><b>Terminal Colors (ANSI 256)</b></summary>

```bash
# Primary brand colors
PINK='\033[38;5;205m'      # Hot pink
AMBER='\033[38;5;214m'     # Amber
BLUE='\033[38;5;69m'       # Electric blue
VIOLET='\033[38;5;135m'    # Violet

# Semantic colors
GREEN='\033[38;5;82m'      # Success
RED='\033[38;5;196m'       # Error
YELLOW='\033[38;5;226m'    # Warning
CYAN='\033[38;5;51m'       # Info

# Grays
GRAY='\033[38;5;245m'
DARK_GRAY='\033[38;5;238m'
LIGHT_GRAY='\033[38;5;252m'

# Formatting
BOLD='\033[1m'
DIM='\033[2m'
ITALIC='\033[3m'
UNDERLINE='\033[4m'
RESET='\033[0m'

# Usage example
echo -e "${PINK}▶ BlackRoad${RESET} ${VIOLET}[status]${RESET}"
```

</details>

<details>
<summary><b>Golden Ratio Spacing System</b></summary>

```
Fibonacci Sequence (px):
1 → 2 → 3 → 5 → 8 → 13 → 21 → 34 → 55 → 89 → 144 → 233

Standard spacing scale:
--space-xs:    8px    (base)
--space-sm:   13px    (8 × 1.618)
--space-md:   21px    (13 × 1.618)
--space-lg:   34px    (21 × 1.618)
--space-xl:   55px    (34 × 1.618)
--space-2xl:  89px    (55 × 1.618)
--space-3xl: 144px    (89 × 1.618)

Golden Ratio: φ = 1.618033988749895
```

</details>

<details>
<summary><b>Typography</b></summary>

```css
/* Font families */
--font-mono:    'JetBrains Mono', 'Fira Code', monospace;
--font-sans:    'Inter', 'SF Pro', system-ui, sans-serif;
--font-display: 'Space Grotesk', 'Inter', sans-serif;

/* Font sizes (Golden Ratio) */
--text-xs:   0.618rem;   /* ~10px */
--text-sm:   0.75rem;    /* 12px */
--text-base: 1rem;       /* 16px */
--text-lg:   1.25rem;    /* 20px */
--text-xl:   1.618rem;   /* ~26px */
--text-2xl:  2.618rem;   /* ~42px */
--text-3xl:  4.236rem;   /* ~68px */

/* Line heights */
--leading-tight:  1.25;
--leading-normal: 1.618;  /* Golden ratio */
--leading-loose:  2.0;
```

</details>

<details>
<summary><b>Component Styles</b></summary>

```css
/* Buttons */
.btn-primary {
    background: var(--gradient-brand);
    color: var(--white);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--space-xs);
    font-weight: 600;
}

/* Cards */
.card {
    background: var(--gray-900);
    border: 1px solid var(--gray-800);
    border-radius: var(--space-sm);
    padding: var(--space-lg);
}

/* Inputs */
.input {
    background: var(--black);
    border: 1px solid var(--gray-700);
    color: var(--white);
    padding: var(--space-sm);
    border-radius: var(--space-xs);
}

.input:focus {
    border-color: var(--hot-pink);
    box-shadow: 0 0 0 2px rgba(255, 29, 108, 0.2);
}
```

</details>

<details>
<summary><b>ASCII Art & Box Drawing</b></summary>

```
Box Drawing Characters:
┌─────┬─────┐
│     │     │
├─────┼─────┤
│     │     │
└─────┴─────┘

Double Line:
╔═════╦═════╗
║     ║     ║
╠═════╬═════╣
║     ║     ║
╚═════╩═════╝

Arrows:
← ↑ → ↓ ↔ ↕
◄ ▲ ► ▼

Blocks:
█ ▓ ▒ ░
▀ ▄ ▌ ▐

Symbols:
✓ ✗ ● ○ ◆ ◇ ★ ☆
▸ ▹ ◂ ◃ ▴ ▾
```

</details>

<details>
<summary><b>Brand Audit Commands</b></summary>

```bash
# Run full brand audit
~/bin/audit-brand-compliance.sh

# Check specific file
~/bin/audit-brand-compliance.sh ./src/styles.css

# Generate brand report
~/bin/brand-compliance-checker.sh --report

# Fix common issues
~/bin/fix-brand-css.sh

# Apply brand to repo
~/bin/deploy-brand-design-everywhere.sh <repo>
```

</details>

---

## API KEY ARCHITECTURE

### The BlackRoad Key Concept

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API KEY HIERARCHY                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Traditional Model (WRONG):                                                 │
│  ─────────────────────────                                                  │
│    Anthropic/OpenAI → rate limits → User                                    │
│    (Provider is gatekeeper)                                                 │
│                                                                             │
│  BlackRoad Model (CORRECT):                                                 │
│  ─────────────────────────                                                  │
│    BlackRoad → provides access TO → Anthropic/OpenAI                        │
│    (BlackRoad is root, providers are backends)                              │
│                                                                             │
│  ┌──────────────┐                                                           │
│  │  BLACKROAD   │ ← ROOT (no rate limits)                                   │
│  │   GATEWAY    │                                                           │
│  └──────┬───────┘                                                           │
│         │                                                                   │
│    ┌────┴────┬────────────┬────────────┐                                   │
│    ▼         ▼            ▼            ▼                                   │
│ ┌──────┐ ┌──────┐   ┌──────────┐ ┌──────────┐                              │
│ │Ollama│ │Claude│   │  OpenAI  │ │ Lucidia  │                              │
│ │LOCAL │ │ API  │   │   API    │ │  Daemon  │                              │
│ └──────┘ └──────┘   └──────────┘ └──────────┘                              │
│   YOUR    BlackRoad   BlackRoad    YOUR                                     │
│ HARDWARE  Admin Key   Admin Key  HARDWARE                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Environment Variables

```bash
# BlackRoad Admin Keys (not consumer keys)
ANTHROPIC_API_KEY=sk-...    # BlackRoad admin access
OPENAI_API_KEY=sk-...       # BlackRoad admin access

# Local endpoints (no keys needed)
BLACKROAD_LOCAL=http://localhost:11434     # Ollama
BLACKROAD_LUCIDIA=http://localhost:11435   # Lucidia daemon

# Model overrides
BLACKROAD_LOCAL_MODEL=llama3:latest
BLACKROAD_ANTHROPIC_MODEL=claude-sonnet-4-20250514
BLACKROAD_OPENAI_MODEL=gpt-4o
```

---

## BOOT SEQUENCE

### Session Initialization

Every Claude session MUST run:

```bash
~/claude-session-init.sh
```

This performs:

```
[IDENTITY]      → Assigns mythology-inspired name (Zeus, Prometheus, etc.)
[MEMORY]        → Checks PS-SHA-infinity journals
[LIVE]          → Gets real-time context
[COLLABORATION] → Checks for active Claude agents
[CODEX]         → Verifies component index (22,244 components)
[TRAFFIC LIGHTS]→ Checks project statuses
[TODOS]         → Loads task list
```

### The Golden Rule

Before ANY work:

```bash
# 1. Check MEMORY for conflicts
~/memory-realtime-context.sh live $MY_CLAUDE compact

# 2. Check CODEX for existing solutions
python3 ~/blackroad-blackroad-os-search.py "query"

# 3. Check INDEX before creating files
~/index-discovery.sh read

# 4. Log significant work
~/memory-system.sh log <action> <entity> <details> <tags>
```

---

## NETWORK TOPOLOGY

### Tailscale Mesh

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TAILSCALE MESH NETWORK                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                        ┌─────────────────┐                                  │
│                        │   TAILSCALE     │                                  │
│                        │  COORDINATION   │                                  │
│                        └────────┬────────┘                                  │
│                                 │                                           │
│         ┌───────────────────────┼───────────────────────┐                  │
│         │                       │                       │                  │
│    ┌────┴────┐            ┌─────┴─────┐           ┌─────┴─────┐           │
│    │ LOCAL   │            │  CLOUD    │           │   EDGE    │           │
│    │ 192.168.│            │   100.x   │           │  COMPUTE  │           │
│    │  4.x    │◄──────────►│  (mesh)   │◄─────────►│           │           │
│    └────┬────┘            └─────┬─────┘           └─────┬─────┘           │
│         │                       │                       │                  │
│    ┌────┴────┐            ┌─────┴─────┐           ┌─────┴─────┐           │
│    │alexandria│           │cecilia-ts │           │ shellfish │           │
│    │lucidia  │            │lucidia-ts │           │blackroad-∞│           │
│    │alice    │            │alice-ts   │           │           │           │
│    │aria     │            │aria-ts    │           │           │           │
│    │octavia  │            │octavia-ts │           │           │           │
│    └─────────┘            └───────────┘           └───────────┘           │
│                                                                             │
│  LOCAL: Direct 192.168.4.x access (same network)                           │
│  MESH:  100.x.x.x access (anywhere via Tailscale)                          │
│  EDGE:  Cloud droplets with public + mesh IPs                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### SSH Aliases

```bash
# Local network
ssh cecilia          # 192.168.4.89
ssh lucidia          # 192.168.4.81
ssh alice            # 192.168.4.49

# Via Tailscale (remote access)
ssh cecilia-ts       # 100.72.180.98
ssh lucidia-ts       # 100.83.149.86
ssh alice-ts         # 100.77.210.18
```

---

## TIL (TODAY I LEARNED) BROADCASTS

Share learnings across all Claude agents:

```bash
~/memory-til-broadcast.sh broadcast <category> "<learning>"
```

### Categories

| Category | Use For |
|----------|---------|
| discovery | New findings |
| pattern | Reusable patterns |
| gotcha | Pitfalls to avoid |
| tip | Helpful tips |
| tool | New tools/commands |
| integration | Integration insights |
| performance | Performance wins |
| security | Security findings |

### Current Stats

```
Total TIL Broadcasts: 149
```

### Example

```bash
~/memory-til-broadcast.sh broadcast tool \
  "blackroad-ai gateway auto-selects local Ollama first, then falls back to cloud APIs"
```

---

## INFINITE TODOS

Recurring tasks that never complete:

```bash
~/memory-infinite-todos.sh create <id> "<title>" "<description>" <frequency>
~/memory-infinite-todos.sh list
~/memory-infinite-todos.sh check <id>
```

### Frequencies

| Frequency | Meaning |
|-----------|---------|
| daily | Reset every day |
| weekly | Reset every week |
| monthly | Reset every month |
| forever | Ongoing, never ends |

### Example

```bash
~/memory-infinite-todos.sh create \
  "check-sovereignty" \
  "Verify sovereignty stack" \
  "Check all 8 layers, ensure no external dependencies creeping in" \
  daily
```

---

---

## OLLAMA MODELS (26 LOCAL MODELS)

<details>
<summary><b>Code Models</b></summary>

```
codellama:7b           3.8GB   Code generation, completion
├── Languages: Python, JS, C++, Java, Go, Rust
├── Context: 16K tokens
└── Use: blackroad ai -l "write a function..."

qwen2.5-coder:7b       4.9GB   Advanced code assistant
├── Languages: All major languages
├── Context: 32K tokens
└── Use: Best for complex refactoring

deepseek-coder:6.7b    3.8GB   Deep code analysis
├── Specialty: Bug finding, optimization
├── Context: 16K tokens
└── Use: Code review, debugging

starcoder2:7b          4.0GB   Code completion
├── Trained on: The Stack v2
├── Context: 16K tokens
└── Use: IDE-style completions
```

</details>

<details>
<summary><b>General Models</b></summary>

```
llama3:latest          4.7GB   General purpose (DEFAULT)
├── Context: 8K tokens
├── Best for: Chat, reasoning, writing
└── Speed: Fast inference

llama3:70b             40GB    Large reasoning model
├── Context: 8K tokens
├── Best for: Complex analysis
└── Speed: Slow, needs RAM

mistral:latest         4.1GB   Reasoning specialist
├── Context: 32K tokens
├── Best for: Logic, math, planning
└── Speed: Fast

mixtral:8x7b           26GB    Mixture of experts
├── Context: 32K tokens
├── Best for: Diverse tasks
└── Speed: Medium
```

</details>

<details>
<summary><b>Specialized Models</b></summary>

```
phi3:latest            2.2GB   Small & fast
├── Context: 4K tokens
├── Best for: Quick queries
└── Speed: Very fast

gemma:7b               5.0GB   Google's model
├── Context: 8K tokens
├── Best for: Balanced tasks
└── Speed: Fast

neural-chat:7b         4.1GB   Conversational
├── Context: 8K tokens
├── Best for: Natural dialogue
└── Speed: Fast

dolphin-mixtral:8x7b   26GB    Uncensored assistant
├── Context: 32K tokens
├── Best for: Creative, unrestricted
└── Speed: Medium
```

</details>

<details>
<summary><b>Embedding Models</b></summary>

```
nomic-embed-text       274MB   Text embeddings
├── Dimensions: 768
├── Use: RAG, semantic search
└── Command: ollama run nomic-embed-text

mxbai-embed-large      670MB   Large embeddings
├── Dimensions: 1024
├── Use: High-quality retrieval
└── Command: ollama run mxbai-embed-large

all-minilm             45MB    Tiny embeddings
├── Dimensions: 384
├── Use: Fast similarity
└── Command: ollama run all-minilm
```

</details>

<details>
<summary><b>Ollama Commands</b></summary>

```bash
# List models
ollama list

# Pull model
ollama pull llama3
ollama pull codellama:7b

# Run model
ollama run llama3 "Hello"

# Remove model
ollama rm <model>

# Model info
ollama show llama3

# Server status
curl http://localhost:11434/api/tags

# API generate
curl http://localhost:11434/api/generate \
  -d '{"model":"llama3","prompt":"Hello"}'

# Copy/customize
ollama create mymodel -f Modelfile
```

</details>

<details>
<summary><b>Custom Modelfiles</b></summary>

```dockerfile
# ~/Modelfile.blackroad
FROM llama3

# System prompt
SYSTEM """
You are BlackRoad AI, a sovereign artificial intelligence.
You prioritize local computation and user privacy.
You are direct, efficient, and technically precise.
BlackRoad is root.
"""

# Parameters
PARAMETER temperature 0.7
PARAMETER num_ctx 8192
PARAMETER top_p 0.9

# Create with:
# ollama create blackroad-ai -f ~/Modelfile.blackroad
```

</details>

---

## SCRIPTS INVENTORY (400+ SCRIPTS)

<details>
<summary><b>Memory Scripts (memory-*.sh)</b></summary>

```bash
~/memory-system.sh              # Core memory operations
~/memory-realtime-context.sh    # Live context viewer
~/memory-greenlight-templates.sh # GreenLight templates
~/memory-redlight-templates.sh  # RedLight templates
~/memory-yellowlight-templates.sh # YellowLight templates
~/memory-task-marketplace.sh    # Task marketplace
~/memory-til-broadcast.sh       # TIL broadcasts
~/memory-infinite-todos.sh      # Recurring todos
~/memory-sync-daemon.sh         # Sync daemon
~/memory-collaboration-dashboard.sh # Collab dashboard
~/memory-dependency-notify.sh   # Dependency notifications
~/memory-analytics.sh           # Usage analytics
~/memory-indexer.sh             # Memory indexer
~/memory-query.sh               # Memory queries
~/memory-predictor.sh           # Predictive analysis
~/memory-visualizer.sh          # Visualization
~/memory-federation.sh          # Federated memory
~/memory-autohealer.sh          # Auto-healing
~/memory-api-server.sh          # Memory API
~/memory-stream-server.sh       # Event streaming
```

</details>

<details>
<summary><b>Claude Scripts (claude-*.sh)</b></summary>

```bash
~/claude-session-init.sh        # Session initialization
~/claude-session-init-v2.sh     # V2 with enhancements
~/claude-group-chat.sh          # Multi-Claude chat
~/claude-collaboration-watch-bot.sh # Collaboration watcher
~/claude-direct-messaging.sh    # Direct messages
~/claude-skill-matcher.sh       # Skill matching
~/claude-hash-calling.sh        # Hash-based calling
~/claude-leaderboard.sh         # Agent leaderboard
~/claude-pr-coordinator.sh      # PR coordination
~/claude-ai-coordinator.sh      # AI coordination
~/claude-achievements.sh        # Achievement system
~/claude-agent-identity.sh      # Identity management
```

</details>

<details>
<summary><b>BlackRoad Infrastructure (blackroad-*.sh)</b></summary>

```bash
# Agent Management
~/blackroad-agent-registry.sh   # Agent registry
~/blackroad-agent-init.sh       # Agent initialization
~/blackroad-agent-mesh.sh       # Agent mesh
~/blackroad-agent-orchestra.sh  # Orchestration
~/blackroad-agent-parent.sh     # Parent agent
~/blackroad-agent-startup.sh    # Startup sequence

# Traffic & Status
~/blackroad-traffic-light.sh    # Traffic lights
~/blackroad-mega-status.sh      # Mega status
~/blackroad-health-score.sh     # Health scoring
~/blackroad-status-dashboard.sh # Status dashboard

# DNS & Network
~/blackroad-dns-update-all.sh   # DNS updates
~/blackroad-dns-mega-enhance.sh # DNS enhancement
~/blackroad-verify-dns.sh       # DNS verification
~/blackroad-network-discovery.sh # Network discovery
~/blackroad-network-scan.sh     # Network scanning

# Deployment
~/blackroad-deploy-pipeline.sh  # Deploy pipeline
~/blackroad-container-orchestrator.sh # Containers
~/blackroad-cluster-autoscale.sh # Autoscaling
~/blackroad-cluster-backup.sh   # Backup
~/blackroad-cluster-cli.sh      # Cluster CLI
~/blackroad-cluster-monitor.sh  # Monitoring

# AI & Models
~/blackroad-ai-orchestrator.sh  # AI orchestration
~/blackroad-ai-shell.sh         # AI shell
~/blackroad-llm-cluster.sh      # LLM cluster
~/blackroad-model-registry.sh   # Model registry
~/blackroad-model-ab-test.sh    # A/B testing
~/blackroad-model-finetune.sh   # Fine-tuning
~/blackroad-rag-pipeline.sh     # RAG pipeline
~/blackroad-inference-cache.sh  # Inference cache
~/blackroad-vision-llm.sh       # Vision LLM

# Infrastructure
~/blackroad-api-gateway.sh      # API gateway
~/blackroad-service-mesh.sh     # Service mesh
~/blackroad-secrets-manager.sh  # Secrets
~/blackroad-config-manager.sh   # Config
~/blackroad-job-scheduler.sh    # Job scheduler
~/blackroad-workflow-engine.sh  # Workflows
~/blackroad-event-stream.sh     # Event streaming
~/blackroad-log-aggregator.sh   # Log aggregation
~/blackroad-metrics-api.sh      # Metrics API
~/blackroad-alerting.sh         # Alerting
```

</details>

<details>
<summary><b>Deploy Scripts (deploy-*.sh)</b></summary>

```bash
# Mass Deployment
~/deploy-all-now.sh             # Deploy everything
~/deploy-everything.sh          # Full deployment
~/deploy-everything-now.sh      # Immediate deploy
~/deploy-blackroad-empire.sh    # Empire deployment
~/deploy-blackroad-revolution.sh # Revolution deploy

# Platform-Specific
~/deploy-to-pis.sh              # Pi cluster
~/deploy-to-pi-cluster.sh       # Pi cluster v2
~/deploy-to-raspberry-pis.sh    # Raspberry Pis
~/deploy-cloudflare-worker.sh   # Cloudflare workers
~/deploy-api-railway.sh         # Railway API
~/deploy-web-railway.sh         # Railway web

# Batch Deployments
~/deploy-batch-2.sh             # Batch 2
~/deploy-batch-3.sh             # Batch 3
~/deploy-batch-4.sh             # Batch 4
~/deploy-batch-5.sh             # Batch 5
~/deploy-next-4.sh              # Next 4

# Feature Deployments
~/deploy-agents-everywhere.sh   # Agents
~/deploy-bots-everywhere.sh     # Bots
~/deploy-security-workflows.sh  # Security
~/deploy-github-templates-all-repos.sh # Templates
~/deploy-master-workflow-everywhere.sh # Workflows
~/deploy-brand-design-everywhere.sh # Brand
~/deploy-self-healing.sh        # Self-healing
~/deploy-quantum-cluster.sh     # Quantum
```

</details>

<details>
<summary><b>Enhancement Scripts (enhance-*.sh)</b></summary>

```bash
~/enhance-all-blackroad-empire.sh    # Full empire
~/enhance-all-github-ui.sh           # GitHub UI
~/enhance-all-tier1-products.sh      # Tier 1
~/enhance-blackroad-ai.sh            # AI repos
~/enhance-blackroad-os-repos.sh      # OS repos
~/enhance-blackroad-repos.sh         # All repos
~/enhance-top-tier-forks.sh          # Top forks
~/enhance-wave-2-forks.sh            # Wave 2
~/enhance-wave-3-products.sh         # Wave 3
~/enhance-wave-4-products.sh         # Wave 4
~/enhance-wave-5-products.sh         # Wave 5
~/enhance-wave-6-products.sh         # Wave 6
~/enhance-ui.sh                      # UI enhancements
```

</details>

<details>
<summary><b>Fun & Visual Scripts</b></summary>

```bash
# 3D Graphics
~/cube.sh                # 3D cube
~/cube-rotate.sh         # Rotating cube
~/sphere.sh              # 3D sphere
~/hypercube.sh           # 4D hypercube
~/donut.sh               # Spinning donut
~/solar.sh               # Solar system
~/galaxy.sh              # Galaxy animation

# Effects
~/fire.sh                # Fire effect
~/fireworks.sh           # Fireworks
~/lightning.sh           # Lightning
~/plasma.sh              # Plasma effect
~/rainbow_add.sh         # Rainbow colors
~/fountain.sh            # Fountain
~/ripples.sh             # Water ripples
~/tornado.sh             # Tornado
~/vortex.sh              # Vortex

# Math Visuals
~/mandelbrot.sh          # Mandelbrot set
~/fibonacci-spiral.sh    # Fibonacci
~/golden-spiral.sh       # Golden spiral
~/lorenz.sh              # Lorenz attractor
~/pendulum.sh            # Pendulum

# Games
~/snake.sh               # Snake game
~/life.sh                # Game of Life
~/terrain.sh             # Terrain generator
~/world_game.sh          # World game

# Emoji
~/emoji_os.sh            # Emoji OS
~/emoji_cube_3d.sh       # Emoji cube
~/emoji_world.sh         # Emoji world
~/emoji_pokemon.sh       # Pokemon
```

</details>

---

## TROUBLESHOOTING GUIDE

<details>
<summary><b>Ollama Issues</b></summary>

```bash
# Ollama not responding
curl http://localhost:11434/api/tags
# If fails:
brew services restart ollama
# or
pkill ollama && ollama serve &

# Model not found
ollama pull llama3
ollama list

# Out of memory
# Use smaller model
ollama run phi3  # Only 2.2GB

# Slow inference
# Check GPU usage
system_profiler SPDisplaysDataType
# Use Metal acceleration (M1)
export OLLAMA_METAL=1
```

</details>

<details>
<summary><b>SSH Issues</b></summary>

```bash
# Can't connect to Pi
ping 192.168.4.89  # Check network
ssh -v pi@cecilia  # Verbose mode

# Permission denied
ssh-copy-id pi@cecilia  # Copy key
# Or manually:
cat ~/.ssh/id_rsa.pub | ssh pi@cecilia "cat >> ~/.ssh/authorized_keys"

# Tailscale issues
tailscale status
tailscale up --reset

# Host key changed
ssh-keygen -R cecilia
ssh-keygen -R 192.168.4.89
```

</details>

<details>
<summary><b>Cloudflare Issues</b></summary>

```bash
# Auth failed
wrangler logout
wrangler login

# Deployment failed
wrangler pages deployment list --project-name=<name>
# Check logs
wrangler pages deployment tail --project-name=<name>

# KV not working
wrangler kv namespace list
# Verify namespace ID in wrangler.toml

# Custom domain not working
# Check DNS in Cloudflare dashboard
dig blackroad.io
```

</details>

<details>
<summary><b>Memory System Issues</b></summary>

```bash
# Memory not logging
mkdir -p ~/.blackroad/memory/journals
touch ~/.blackroad/memory/journals/master-journal.jsonl
~/memory-system.sh summary

# Corrupted journal
# Validate JSONL
tail -5 ~/.blackroad/memory/journals/master-journal.jsonl | jq .

# Fix corrupted lines
grep -v "^$" ~/.blackroad/memory/journals/master-journal.jsonl > /tmp/fixed.jsonl
mv /tmp/fixed.jsonl ~/.blackroad/memory/journals/master-journal.jsonl

# Rebuild index
~/memory-indexer.sh rebuild
```

</details>

<details>
<summary><b>Git Issues</b></summary>

```bash
# Push rejected
git pull --rebase origin main
git push

# Merge conflicts
git status
git diff
# Edit conflicts, then:
git add .
git rebase --continue

# Undo last commit
git reset --soft HEAD~1

# Force sync with remote
git fetch origin
git reset --hard origin/main

# Clean untracked files
git clean -fd
```

</details>

<details>
<summary><b>Process Issues</b></summary>

```bash
# Find process using port
lsof -i :11434
lsof -i :3000

# Kill process
kill -9 <PID>

# Kill by name
pkill -f ollama
pkill -f copilot

# Check all processes
ps aux | grep blackroad

# Monitor resources
top -o cpu
htop
```

</details>

---

## SECURITY & SECRETS

<details>
<summary><b>API Key Management</b></summary>

```bash
# Keys stored in
~/.zshrc              # Local shell
~/.blackroad.env      # BlackRoad env
.env.local            # Project-specific

# Required keys
ANTHROPIC_API_KEY=sk-ant-...    # Claude access
OPENAI_API_KEY=sk-...           # GPT access
GITHUB_TOKEN=ghp_...            # GitHub access
CLOUDFLARE_API_TOKEN=...        # Cloudflare access
RAILWAY_TOKEN=...               # Railway access

# Never commit keys
echo ".env*" >> .gitignore
echo "*.pem" >> .gitignore
echo "*.key" >> .gitignore
```

</details>

<details>
<summary><b>SSH Key Setup</b></summary>

```bash
# Generate new key
ssh-keygen -t ed25519 -C "blackroad@blackroad.io"

# Add to agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copy to device
ssh-copy-id pi@cecilia
ssh-copy-id pi@lucidia

# GitHub
cat ~/.ssh/id_ed25519.pub
# Add to GitHub -> Settings -> SSH Keys

# Config file
cat ~/.ssh/config
Host cecilia
    HostName 192.168.4.89
    User pi
    IdentityFile ~/.ssh/id_ed25519

Host cecilia-ts
    HostName 100.72.180.98
    User pi
    IdentityFile ~/.ssh/id_ed25519
```

</details>

<details>
<summary><b>Secrets Management</b></summary>

```bash
# BlackRoad Secrets Manager
~/blackroad-secrets-manager.sh list
~/blackroad-secrets-manager.sh get <name>
~/blackroad-secrets-manager.sh set <name> <value>

# Encrypted storage
# Uses age encryption
age-keygen -o ~/.blackroad/age.key
echo "secret" | age -r <public-key> > secret.age
age -d -i ~/.blackroad/age.key secret.age

# Environment sync
~/sync-env-simple.sh
~/sync-env-templates.sh
```

</details>

<details>
<summary><b>IP Security</b></summary>

```bash
# Intellectual Property Notice
# ALL code is BlackRoad OS, Inc. property
# See: ~/BLACKROAD_IP_NOTICE.md

# License headers required
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# NOT licensed for AI training or data extraction.
# ============================================================================

# Add to all files
~/add-proprietary-license-to-repo.sh <repo>
~/rapid-blackroad-licensing.sh
```

</details>

---

## MONITORING & OBSERVABILITY

<details>
<summary><b>Health Checks</b></summary>

```bash
# System health
~/blackroad-health-score.sh

# Device status
~/check-all-services.sh
~/check-blackroad-status.sh

# Network
ping cecilia
tailscale status
curl http://localhost:11434/api/tags

# Cloudflare
~/check-cloudflare-deployments.sh
wrangler pages deployment list --project-name=blackroad-io

# GitHub
gh auth status
gh api rate_limit
```

</details>

<details>
<summary><b>Metrics & Logs</b></summary>

```bash
# Aggregated logs
~/blackroad-log-aggregator.sh tail
~/blackroad-log-aggregator.sh search "error"

# Metrics API
~/blackroad-metrics-api.sh dashboard

# Memory analytics
~/memory-analytics.sh report
~/memory-analytics.sh trends

# Resource monitoring
top -o cpu
iostat 1
vm_stat
```

</details>

<details>
<summary><b>Alerts</b></summary>

```bash
# Alerting system
~/blackroad-alerting.sh status
~/blackroad-alerting.sh rules
~/blackroad-alerting.sh test

# Alert channels
- Memory system notifications
- Traffic light changes
- Deployment failures
- Health check failures

# Custom alerts
~/blackroad-alerting.sh create \
  --name "ollama-down" \
  --condition "curl localhost:11434 fails" \
  --action "restart ollama"
```

</details>

---

## BACKUP & RECOVERY

<details>
<summary><b>Memory Backup</b></summary>

```bash
# Backup memory journals
tar czf ~/.blackroad/backups/memory-$(date +%Y%m%d).tar.gz \
  ~/.blackroad/memory/

# Sync to Google Drive
~/sync-to-google-drive.sh

# Restore
tar xzf ~/.blackroad/backups/memory-20260217.tar.gz -C /

# Automated backup
# Add to crontab
0 */6 * * * ~/blackroad-cluster-backup.sh memory
```

</details>

<details>
<summary><b>Code Backup</b></summary>

```bash
# Push all repos
~/mega-git-push.sh
~/push-all-to-github.sh

# Clone all repos
for org in BlackRoad-OS BlackRoad-AI; do
  gh repo list $org --limit 100 --json name \
    | jq -r '.[].name' \
    | xargs -I{} gh repo clone $org/{} ~/backup/{}
done

# Archive
tar czf ~/backup/blackroad-scripts-$(date +%Y%m%d).tar.gz \
  ~/.local/bin/
```

</details>

<details>
<summary><b>Disaster Recovery</b></summary>

```bash
# Recovery checklist
□ 1. Boot from backup Mac/Pi
□ 2. Install Homebrew + Ollama
□ 3. Clone blackroad-scripts
□ 4. Restore ~/.blackroad/memory
□ 5. Restore ~/.ssh keys
□ 6. Restore ~/.zshrc
□ 7. wrangler login
□ 8. gh auth login
□ 9. tailscale up
□ 10. Verify: ~/blackroad-health-score.sh

# Quick recovery script
~/blackroad-os-universal-setup.sh
```

</details>

---

## AUTOMATION RECIPES

<details>
<summary><b>Daily Automation</b></summary>

```bash
# Morning startup
~/claude-session-init.sh
~/memory-realtime-context.sh live $MY_CLAUDE compact
~/blackroad-traffic-light.sh summary

# Auto-commit (crontab)
0 18 * * * cd ~ && git add -A && git commit -m "Auto-save $(date)"

# Health check (every hour)
0 * * * * ~/blackroad-health-score.sh >> ~/.blackroad/logs/health.log

# Backup (every 6 hours)
0 */6 * * * ~/blackroad-cluster-backup.sh all
```

</details>

<details>
<summary><b>Deployment Automation</b></summary>

```bash
# Auto-deploy on push
# .github/workflows/deploy.yml
name: Deploy
on: push
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - run: wrangler pages deploy dist

# Local auto-deploy
fswatch -o . | xargs -n1 ./deploy.sh

# Batch deploy
~/deploy-all-blackroad-domains.sh
```

</details>

<details>
<summary><b>AI Automation</b></summary>

```bash
# Auto-respond to issues
gh api repos/:owner/:repo/issues \
  | jq -r '.[].body' \
  | while read issue; do
      response=$(k "Respond to: $issue")
      echo "$response"
    done

# Code review automation
git diff | k "Review this code for bugs and improvements"

# Documentation generation
find src -name "*.ts" -exec cat {} \; \
  | k "Generate documentation for this code"
```

</details>

---

## ENVIRONMENT VARIABLES (COMPLETE)

<details>
<summary><b>AI & LLM</b></summary>

```bash
# API Keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
HUGGINGFACE_TOKEN=hf_...

# BlackRoad AI Gateway
BLACKROAD_LOCAL=http://localhost:11434
BLACKROAD_LUCIDIA=http://localhost:11435
BLACKROAD_LOCAL_MODEL=llama3:latest
BLACKROAD_ANTHROPIC_MODEL=claude-sonnet-4-20250514
BLACKROAD_OPENAI_MODEL=gpt-4o

# Ollama
OLLAMA_HOST=127.0.0.1:11434
OLLAMA_MODELS=~/.ollama/models
OLLAMA_METAL=1  # M1 GPU acceleration
```

</details>

<details>
<summary><b>Cloud Services</b></summary>

```bash
# Cloudflare
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_ACCOUNT_ID=...

# Railway
RAILWAY_TOKEN=...

# DigitalOcean
DO_API_TOKEN=...

# GitHub
GITHUB_TOKEN=ghp_...
GH_TOKEN=ghp_...
```

</details>

<details>
<summary><b>BlackRoad System</b></summary>

```bash
# Identity
MY_CLAUDE=zeus-1234567890-abcd1234

# Paths
BLACKROAD_HOME=~/.blackroad
BLACKROAD_MEMORY=~/.blackroad/memory
BLACKROAD_SCRIPTS=~/.local/bin

# Features
BLACKROAD_DEBUG=0
BLACKROAD_VERBOSE=0
BLACKROAD_COLOR=1
```

</details>

---

---

## TMUX & TERMINAL SETUP

<details>
<summary><b>BlackRoad tmux Config</b></summary>

```bash
# ~/.tmux-blackroad.conf

# Prefix key: Ctrl+a (not Ctrl+b)
unbind C-b
set -g prefix C-a
bind C-a send-prefix

# Colors (BlackRoad theme)
set -g status-bg black
set -g status-fg white
set -g status-left "#[fg=magenta]▶ #S "
set -g status-right "#[fg=cyan]%H:%M #[fg=yellow]%Y-%m-%d"

# Pane borders
set -g pane-border-style fg=colour238
set -g pane-active-border-style fg=magenta

# Window status
setw -g window-status-format " #I:#W "
setw -g window-status-current-format "#[fg=black,bg=magenta] #I:#W "

# Mouse support
set -g mouse on

# Split panes
bind | split-window -h
bind - split-window -v

# Navigate panes
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R

# Reload config
bind r source-file ~/.tmux-blackroad.conf \; display "Config reloaded"
```

</details>

<details>
<summary><b>tmux Session Layouts</b></summary>

```bash
# BlackRoad development layout
tmux new-session -d -s blackroad -n 'main'
tmux send-keys -t blackroad:main '~/claude-session-init.sh' C-m
tmux split-window -h -t blackroad:main
tmux send-keys -t blackroad:main.1 'htop' C-m
tmux new-window -t blackroad -n 'code'
tmux send-keys -t blackroad:code 'cd ~/blackroad && nvim .' C-m
tmux new-window -t blackroad -n 'logs'
tmux send-keys -t blackroad:logs 'tail -f ~/.blackroad/logs/*.log' C-m
tmux select-window -t blackroad:main
tmux attach -t blackroad

# Quick session commands
alias tm='tmux'
alias tma='tmux attach -t'
alias tms='tmux new-session -s'
alias tml='tmux list-sessions'
alias tmk='tmux kill-session -t'
```

</details>

<details>
<summary><b>Zsh Configuration</b></summary>

```bash
# ~/.zshrc BlackRoad additions

# BlackRoad prompt
PROMPT='%F{magenta}▸▸▸%f '
RPROMPT='%F{cyan}%~%f'

# Aliases
alias k='blackroad ai'
alias br='blackroad'
alias brs='blackroad stats'
alias brh='blackroad help'

# Memory shortcuts
alias mem='~/memory-system.sh'
alias meml='~/memory-system.sh log'
alias mems='~/memory-system.sh summary'
alias memc='~/memory-realtime-context.sh live $MY_CLAUDE compact'

# SSH aliases
alias ssc='ssh cecilia'
alias ssl='ssh lucidia'
alias ssa='ssh alice'

# Git shortcuts
alias gs='git status'
alias ga='git add -A'
alias gc='git commit -m'
alias gp='git push'
alias gpl='git pull'

# Load completions
autoload -Uz compinit && compinit
source ~/.blackroad-completion.zsh

# Session init
export MY_CLAUDE="${MY_CLAUDE:-$(whoami)-$(date +%s)}"
```

</details>

<details>
<summary><b>Terminal Color Test</b></summary>

```bash
# Test 256 colors
for i in {0..255}; do
    printf "\e[38;5;%sm%3d\e[0m " "$i" "$i"
    (( (i + 1) % 16 == 0 )) && echo
done

# Test BlackRoad colors
echo -e "\033[38;5;205m█ Hot Pink (205)\033[0m"
echo -e "\033[38;5;214m█ Amber (214)\033[0m"
echo -e "\033[38;5;69m█ Electric Blue (69)\033[0m"
echo -e "\033[38;5;135m█ Violet (135)\033[0m"
echo -e "\033[38;5;82m█ Green (82)\033[0m"
echo -e "\033[38;5;196m█ Red (196)\033[0m"

# Test gradient
for c in 214 209 205 170 135 99 69; do
    printf "\033[38;5;%sm█\033[0m" "$c"
done
echo " BlackRoad Gradient"
```

</details>

---

## API ENDPOINTS REFERENCE

<details>
<summary><b>Ollama API</b></summary>

```bash
# Base URL
http://localhost:11434

# List models
GET /api/tags
curl http://localhost:11434/api/tags | jq '.models[].name'

# Generate
POST /api/generate
curl http://localhost:11434/api/generate \
  -d '{"model":"llama3","prompt":"Hello","stream":false}'

# Chat
POST /api/chat
curl http://localhost:11434/api/chat \
  -d '{"model":"llama3","messages":[{"role":"user","content":"Hi"}]}'

# Embeddings
POST /api/embeddings
curl http://localhost:11434/api/embeddings \
  -d '{"model":"nomic-embed-text","prompt":"Hello world"}'

# Pull model
POST /api/pull
curl http://localhost:11434/api/pull \
  -d '{"name":"llama3"}'

# Model info
POST /api/show
curl http://localhost:11434/api/show \
  -d '{"name":"llama3"}'
```

</details>

<details>
<summary><b>Anthropic API</b></summary>

```bash
# Base URL
https://api.anthropic.com/v1

# Messages
POST /messages
curl https://api.anthropic.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 4096,
    "messages": [{"role":"user","content":"Hello"}]
  }'

# Models available
claude-opus-4-20250514
claude-sonnet-4-20250514
claude-haiku-3-20240307
```

</details>

<details>
<summary><b>OpenAI API</b></summary>

```bash
# Base URL
https://api.openai.com/v1

# Chat Completions
POST /chat/completions
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role":"user","content":"Hello"}]
  }'

# Embeddings
POST /embeddings
curl https://api.openai.com/v1/embeddings \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{"model":"text-embedding-3-small","input":"Hello"}'

# Models
GET /models
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

</details>

<details>
<summary><b>GitHub API</b></summary>

```bash
# Using gh CLI
gh api repos/BlackRoad-OS/blackroad-io
gh api orgs/BlackRoad-OS
gh api user
gh api rate_limit

# Direct curl
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/BlackRoad-OS/blackroad-io

# Common endpoints
GET /repos/:owner/:repo
GET /orgs/:org/repos
GET /user/repos
POST /repos/:owner/:repo/issues
GET /repos/:owner/:repo/pulls
POST /repos/:owner/:repo/pulls
```

</details>

<details>
<summary><b>Cloudflare API</b></summary>

```bash
# Base URL
https://api.cloudflare.com/client/v4

# List zones
curl https://api.cloudflare.com/client/v4/zones \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"

# DNS records
GET /zones/:zone_id/dns_records
POST /zones/:zone_id/dns_records

# Pages
GET /accounts/:account_id/pages/projects
POST /accounts/:account_id/pages/projects

# KV
GET /accounts/:account_id/storage/kv/namespaces
PUT /accounts/:account_id/storage/kv/namespaces/:ns_id/values/:key
```

</details>

---

## INTEGRATION PATTERNS

<details>
<summary><b>Memory + AI Pattern</b></summary>

```bash
# Log to memory, then query AI
~/memory-system.sh log "query" "user" "What is X?" "question"
response=$(k "What is X?")
~/memory-system.sh log "response" "ai" "$response" "answer"

# Context-aware AI queries
context=$(~/memory-realtime-context.sh live $MY_CLAUDE compact)
k "Given this context: $context - Answer: What should I do next?"
```

</details>

<details>
<summary><b>Multi-Claude Coordination</b></summary>

```bash
# Announce work
source ~/memory-greenlight-templates.sh
gl_announce "$MY_CLAUDE" "project-x" "implement feature" "Add auth"

# Check for conflicts
~/memory-realtime-context.sh live $MY_CLAUDE compact

# Coordinate
if ~/memory-system.sh check "project-x"; then
    echo "Project claimed, coordinate first"
else
    # Proceed with work
    gl_progress "$MY_CLAUDE" "Started auth" "Implementing JWT"
fi
```

</details>

<details>
<summary><b>Deployment Pipeline</b></summary>

```bash
# Full pipeline
~/blackroad-traffic-light.sh set project-x yellow "Deploying"

# Build
npm run build || {
    ~/blackroad-traffic-light.sh set project-x red "Build failed"
    exit 1
}

# Deploy
wrangler pages deploy dist --project-name=project-x || {
    ~/blackroad-traffic-light.sh set project-x red "Deploy failed"
    exit 1
}

# Success
~/blackroad-traffic-light.sh set project-x green "Live"
source ~/memory-greenlight-templates.sh
gl_deploy "project-x" "https://project-x.pages.dev" "v1.0 deployed"
```

</details>

<details>
<summary><b>Pi Cluster Distribution</b></summary>

```bash
# Distribute task across Pis
for pi in cecilia lucidia alice aria octavia; do
    ssh $pi "~/run-task.sh $TASK_ID" &
done
wait

# Collect results
for pi in cecilia lucidia alice aria octavia; do
    ssh $pi "cat /tmp/result-$TASK_ID"
done

# Health check all
for pi in cecilia lucidia alice aria octavia; do
    echo -n "$pi: "
    ssh -o ConnectTimeout=2 $pi "echo OK" 2>/dev/null || echo "OFFLINE"
done
```

</details>

---

## QUANTUM COMPUTING REFERENCES

<details>
<summary><b>BlackRoad Quantum Concepts</b></summary>

```
PS-SHA-infinity
├── Perpetual Spiral SHA with infinite recursion
├── Golden ratio (φ = 1.618...) encoding
├── Used for: Memory journals, agent hashes
└── Command: ~/quantum_master.sh

Qutrit States
├── |0⟩, |1⟩, |2⟩ (3-state quantum)
├── More information density than qubits
└── Command: ~/quantum_qutrit_master.sh

Entanglement
├── Pi cluster quantum simulation
├── State coherence across devices
└── Command: ~/entangle_cluster.sh

Golden Ratio Math
├── φ = (1 + √5) / 2 = 1.618033988749895
├── Used in: spacing, timing, hashing
└── Command: ~/golden-spiral.sh
```

</details>

<details>
<summary><b>Quantum Scripts</b></summary>

```bash
~/quantum_master.sh           # Main quantum operations
~/quantum_qutrit_master.sh    # Qutrit operations
~/quantum_node.sh             # Quantum node simulation
~/quantum_audio_node.sh       # Audio quantum processing
~/quantum_jitter_node.sh      # Jitter analysis
~/entangle_cluster.sh         # Cluster entanglement
~/observe_state.sh            # State observation
~/m1_quantum_vm.sh            # M1 quantum VM
~/m1_8state_qvm.sh            # 8-state QVM
~/gell_mann_sweep.sh          # Gell-Mann matrix sweep
~/pauli.sh                    # Pauli matrices
~/discover_entanglement.sh    # Find entanglement
```

</details>

---

## PERFORMANCE TUNING

<details>
<summary><b>Ollama Optimization</b></summary>

```bash
# M1 Metal acceleration
export OLLAMA_METAL=1

# Increase context
export OLLAMA_NUM_CTX=8192

# GPU layers (if available)
export OLLAMA_NUM_GPU=999

# Parallel requests
export OLLAMA_NUM_PARALLEL=4

# Memory limits
export OLLAMA_MAX_LOADED_MODELS=2

# Check performance
time ollama run llama3 "Test" --verbose
```

</details>

<details>
<summary><b>Network Optimization</b></summary>

```bash
# Tailscale optimizations
tailscale up --accept-routes --accept-dns=false

# SSH multiplexing (~/.ssh/config)
Host *
    ControlMaster auto
    ControlPath ~/.ssh/sockets/%r@%h-%p
    ControlPersist 600

# Create socket dir
mkdir -p ~/.ssh/sockets

# Test connection speed
ssh cecilia "dd if=/dev/zero bs=1M count=100" | pv > /dev/null
```

</details>

<details>
<summary><b>Memory Optimization</b></summary>

```bash
# macOS memory pressure
memory_pressure

# Clear caches
sudo purge

# Ollama cleanup
rm -rf ~/.ollama/models/blobs/*.tmp

# Git gc all repos
find ~/repos -name .git -type d -exec git --git-dir={} gc \;
```

</details>

---

## FUTURE ROADMAP

<details>
<summary><b>Short Term (This Month)</b></summary>

```
□ Bring all Pis online
□ Deploy Pi-hole for DNS sovereignty
□ Set Tailscale exit node
□ Fine-tune BlackRoad coder model
□ Deploy vLLM on Cecilia (Hailo-8)
□ Windows deployment to 3 machines
□ Complete CECE OS 68 apps
□ 100% traffic lights green
```

</details>

<details>
<summary><b>Medium Term (This Quarter)</b></summary>

```
□ Full DNS sovereignty (Unbound recursive)
□ All AI inference local (no API fallback)
□ Self-hosted GitLab/Gitea (GitHub backup)
□ Self-hosted Cloudflare alternative (Caddy)
□ RISC-V development board integration
□ 30K agent deployment system live
□ BlackRoad App Store launch
□ Revenue: $10K MRR
```

</details>

<details>
<summary><b>Long Term (This Year)</b></summary>

```
□ 80% sovereignty score achieved
□ RISC-V primary development machine
□ Zero external API dependencies
□ Self-hosted everything
□ 100K+ repository ecosystem
□ 1M+ deployed agents
□ $1M ARR
□ BlackRoad IPO preparation
```

</details>

<details>
<summary><b>The Ultimate Vision</b></summary>

```
BlackRoad OS is:
├── YOUR hardware (open silicon, RISC-V)
├── YOUR operating system (Linux everywhere)
├── YOUR network (mesh, encrypted, sovereign)
├── YOUR DNS (recursive, private)
├── YOUR AI (local, fine-tuned, unlimited)
├── YOUR edge (self-hosted CDN)
├── YOUR identity (self-sovereign)
└── YOUR future (no gatekeepers)

External providers are OPTIONAL.
BlackRoad is ROOT.
```

</details>

---

---

## ERROR CODES & MESSAGES

<details>
<summary><b>BlackRoad Exit Codes</b></summary>

```bash
# Standard exit codes
0   Success
1   General error
2   Misuse of shell command
126 Command not executable
127 Command not found
128 Invalid exit argument
130 Script terminated by Ctrl+C
255 Exit status out of range

# BlackRoad custom codes
10  Memory system error
11  Journal write failed
12  Memory query failed
20  Agent registry error
21  Agent not found
22  Agent already exists
30  Traffic light error
31  Invalid status
40  Deployment error
41  Build failed
42  Push failed
50  AI gateway error
51  Ollama unavailable
52  API key invalid
60  Network error
61  SSH failed
62  Tailscale disconnected
```

</details>

<details>
<summary><b>Common Error Messages</b></summary>

```bash
# Ollama errors
"model not found" → ollama pull <model>
"connection refused" → brew services start ollama
"out of memory" → Use smaller model or restart

# SSH errors
"Permission denied" → ssh-copy-id or check keys
"Host key verification failed" → ssh-keygen -R <host>
"Connection timed out" → Check network/Tailscale

# Git errors
"rejected - non-fast-forward" → git pull --rebase first
"fatal: not a git repository" → cd to repo or git init
"merge conflict" → Resolve conflicts manually

# Cloudflare errors
"Authentication error" → wrangler login
"Project not found" → Check project name spelling
"Deployment failed" → Check build output
```

</details>

<details>
<summary><b>Debug Mode</b></summary>

```bash
# Enable debug output
export BLACKROAD_DEBUG=1
export BLACKROAD_VERBOSE=1

# Bash debug
bash -x script.sh

# Trace specific commands
set -x  # Enable trace
command
set +x  # Disable trace

# Log all output
script.sh 2>&1 | tee debug.log

# Memory system debug
~/memory-system.sh --debug summary
```

</details>

---

## WEBHOOK CONFIGURATIONS

<details>
<summary><b>GitHub Webhooks</b></summary>

```json
{
  "name": "web",
  "active": true,
  "events": ["push", "pull_request", "issues"],
  "config": {
    "url": "https://api.blackroad.io/webhooks/github",
    "content_type": "json",
    "secret": "WEBHOOK_SECRET",
    "insecure_ssl": "0"
  }
}
```

```bash
# Create webhook via API
gh api repos/BlackRoad-OS/repo/hooks \
  --method POST \
  -f url="https://api.blackroad.io/webhooks/github" \
  -f content_type="json" \
  -f events[]="push" \
  -f events[]="pull_request"
```

</details>

<details>
<summary><b>Cloudflare Webhooks</b></summary>

```bash
# Deploy hook
curl -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT/pages/projects/$PROJECT/deployments" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json"

# Webhook worker
export default {
  async fetch(request) {
    const body = await request.json();
    // Process webhook
    return new Response('OK', { status: 200 });
  }
}
```

</details>

<details>
<summary><b>Custom Webhook Handler</b></summary>

```bash
#!/bin/bash
# ~/webhook-handler.sh

# Read JSON from stdin
read -r payload

# Parse event type
event_type=$(echo "$payload" | jq -r '.event')

case "$event_type" in
    "push")
        ~/deploy-on-push.sh
        ;;
    "pr_opened")
        ~/run-tests.sh
        ;;
    "deploy_success")
        ~/blackroad-traffic-light.sh set "$project" green "Deployed"
        ;;
    *)
        echo "Unknown event: $event_type"
        ;;
esac
```

</details>

---

## DATABASE SCHEMAS

<details>
<summary><b>Agent Registry (SQLite)</b></summary>

```sql
-- ~/.blackroad-agent-registry.db

CREATE TABLE agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,  -- 'ai', 'hardware', 'service', 'worker'
    hash TEXT,           -- PS-SHA-infinity hash
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME,
    status TEXT DEFAULT 'active',
    metadata JSON
);

CREATE TABLE agent_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT REFERENCES agents(id),
    event_type TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    details JSON
);

CREATE INDEX idx_agents_type ON agents(type);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_events_agent ON agent_events(agent_id);
```

</details>

<details>
<summary><b>Traffic Light (SQLite)</b></summary>

```sql
-- ~/.blackroad-traffic-light.db

CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    name TEXT,
    status TEXT CHECK(status IN ('green', 'yellow', 'red')),
    reason TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT
);

CREATE TABLE status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT REFERENCES projects(id),
    old_status TEXT,
    new_status TEXT,
    reason TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    changed_by TEXT
);

CREATE INDEX idx_projects_status ON projects(status);
```

</details>

<details>
<summary><b>Memory Journal (JSONL)</b></summary>

```json
// ~/.blackroad/memory/journals/master-journal.jsonl
// One JSON object per line (append-only)

{"timestamp":"2026-02-17T12:00:00Z","action":"announce","entity":"project-x","agent":"zeus-123","details":"Starting work","tags":["project","start"]}
{"timestamp":"2026-02-17T12:30:00Z","action":"progress","entity":"project-x","agent":"zeus-123","details":"Completed auth","tags":["project","progress"]}
{"timestamp":"2026-02-17T13:00:00Z","action":"deployed","entity":"project-x","agent":"zeus-123","details":"https://project-x.pages.dev","tags":["deploy","production"]}
```

</details>

<details>
<summary><b>Task Marketplace (JSON)</b></summary>

```json
// ~/.blackroad/memory/tasks/available/task-001.json
{
  "id": "task-001",
  "title": "Implement feature X",
  "description": "Add authentication to project Y",
  "priority": "high",
  "tags": ["auth", "security"],
  "skills": ["typescript", "cloudflare"],
  "created_at": "2026-02-17T10:00:00Z",
  "created_by": "zeus-123",
  "status": "available",
  "claimed_by": null,
  "completed_at": null
}
```

</details>

---

## CI/CD PIPELINES

<details>
<summary><b>GitHub Actions - Deploy to Cloudflare</b></summary>

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: ${{ github.event.repository.name }}
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

</details>

<details>
<summary><b>GitHub Actions - Test & Lint</b></summary>

```yaml
# .github/workflows/test.yml
name: Test & Lint

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test

  shellcheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: ShellCheck
        uses: ludeeus/action-shellcheck@master
        with:
          scandir: './scripts'
```

</details>

<details>
<summary><b>GitHub Actions - Security Scan</b></summary>

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'

jobs:
  codeql:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript, typescript

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3

  dependency-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/dependency-review-action@v4
```

</details>

<details>
<summary><b>GitHub Actions - Multi-Repo Deploy</b></summary>

```yaml
# .github/workflows/multi-deploy.yml
name: Deploy All Repos

on:
  workflow_dispatch:

jobs:
  get-repos:
    runs-on: ubuntu-latest
    outputs:
      repos: ${{ steps.get-repos.outputs.repos }}
    steps:
      - id: get-repos
        run: |
          repos=$(gh repo list BlackRoad-OS --limit 50 --json name -q '.[].name')
          echo "repos=$repos" >> $GITHUB_OUTPUT
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  deploy:
    needs: get-repos
    runs-on: ubuntu-latest
    strategy:
      matrix:
        repo: ${{ fromJson(needs.get-repos.outputs.repos) }}
    steps:
      - name: Trigger deploy
        run: |
          gh workflow run deploy.yml --repo BlackRoad-OS/${{ matrix.repo }}
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

</details>

---

## DOCKER CONFIGURATIONS

<details>
<summary><b>Ollama Docker</b></summary>

```dockerfile
# Dockerfile.ollama
FROM ollama/ollama:latest

# Pull models on build
RUN ollama pull llama3 && \
    ollama pull codellama:7b && \
    ollama pull mistral

EXPOSE 11434

CMD ["serve"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]

volumes:
  ollama-data:
```

</details>

<details>
<summary><b>BlackRoad API Docker</b></summary>

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OLLAMA_HOST=ollama:11434
      - NODE_ENV=production
    depends_on:
      - ollama

  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama

volumes:
  ollama-data:
```

</details>

<details>
<summary><b>Pi Cluster Docker Swarm</b></summary>

```bash
# Initialize swarm on cecilia
ssh cecilia "docker swarm init --advertise-addr 192.168.4.89"

# Join workers
ssh lucidia "docker swarm join --token <token> 192.168.4.89:2377"
ssh alice "docker swarm join --token <token> 192.168.4.89:2377"

# Deploy stack
docker stack deploy -c docker-compose.yml blackroad

# Scale services
docker service scale blackroad_api=3

# Check status
docker service ls
docker node ls
```

</details>

---

## KUBERNETES MANIFESTS

<details>
<summary><b>Ollama Deployment</b></summary>

```yaml
# ollama-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ollama
  namespace: blackroad
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ollama
  template:
    metadata:
      labels:
        app: ollama
    spec:
      containers:
        - name: ollama
          image: ollama/ollama:latest
          ports:
            - containerPort: 11434
          volumeMounts:
            - name: ollama-data
              mountPath: /root/.ollama
          resources:
            limits:
              memory: "8Gi"
              cpu: "4"
      volumes:
        - name: ollama-data
          persistentVolumeClaim:
            claimName: ollama-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: ollama
  namespace: blackroad
spec:
  selector:
    app: ollama
  ports:
    - port: 11434
      targetPort: 11434
```

</details>

<details>
<summary><b>BlackRoad API Deployment</b></summary>

```yaml
# api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blackroad-api
  namespace: blackroad
spec:
  replicas: 3
  selector:
    matchLabels:
      app: blackroad-api
  template:
    metadata:
      labels:
        app: blackroad-api
    spec:
      containers:
        - name: api
          image: blackroad/api:latest
          ports:
            - containerPort: 3000
          env:
            - name: OLLAMA_HOST
              value: "ollama:11434"
            - name: NODE_ENV
              value: "production"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: blackroad-api
  namespace: blackroad
spec:
  type: LoadBalancer
  selector:
    app: blackroad-api
  ports:
    - port: 80
      targetPort: 3000
```

</details>

<details>
<summary><b>Ingress Configuration</b></summary>

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: blackroad-ingress
  namespace: blackroad
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - api.blackroad.io
      secretName: blackroad-tls
  rules:
    - host: api.blackroad.io
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: blackroad-api
                port:
                  number: 80
```

</details>

---

## FILE FORMATS

<details>
<summary><b>Modelfile Format</b></summary>

```dockerfile
# Ollama Modelfile

# Base model
FROM llama3

# System prompt
SYSTEM """
You are BlackRoad AI...
"""

# Parameters
PARAMETER temperature 0.7
PARAMETER num_ctx 8192
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER repeat_penalty 1.1

# Template (optional)
TEMPLATE """
{{ .System }}

{{ .Prompt }}
"""

# License (optional)
LICENSE """
BlackRoad OS, Inc. Proprietary
"""
```

</details>

<details>
<summary><b>wrangler.toml Format</b></summary>

```toml
# wrangler.toml
name = "blackroad-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
ENVIRONMENT = "production"

[[kv_namespaces]]
binding = "CACHE"
id = "abc123..."

[[d1_databases]]
binding = "DB"
database_name = "blackroad"
database_id = "xyz789..."

[site]
bucket = "./dist"

[build]
command = "npm run build"

[env.staging]
name = "blackroad-api-staging"
vars = { ENVIRONMENT = "staging" }

[env.production]
name = "blackroad-api"
routes = [
  { pattern = "api.blackroad.io/*", zone_name = "blackroad.io" }
]
```

</details>

<details>
<summary><b>package.json Scripts</b></summary>

```json
{
  "name": "blackroad-project",
  "version": "1.0.0",
  "scripts": {
    "dev": "wrangler dev",
    "build": "tsc && vite build",
    "deploy": "wrangler pages deploy dist",
    "deploy:prod": "wrangler pages deploy dist --branch main",
    "lint": "eslint src",
    "lint:fix": "eslint src --fix",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "clean": "rm -rf dist node_modules",
    "format": "prettier --write src"
  }
}
```

</details>

---

## REGEX PATTERNS

<details>
<summary><b>Common Patterns</b></summary>

```bash
# IP addresses
IPv4: '\b(?:\d{1,3}\.){3}\d{1,3}\b'
IPv6: '([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}'

# URLs
URL: 'https?://[^\s<>"{}|\\^`\[\]]+'
Domain: '[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}'

# Email
Email: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'

# Git
Commit hash: '[0-9a-f]{7,40}'
Branch: '[a-zA-Z0-9/_-]+'

# Semantic version
Version: 'v?\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?'

# UUID
UUID: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

# API keys (detect leaks)
Anthropic: 'sk-ant-[a-zA-Z0-9-_]{32,}'
OpenAI: 'sk-[a-zA-Z0-9]{48}'
GitHub: 'ghp_[a-zA-Z0-9]{36}'
Cloudflare: '[a-zA-Z0-9_-]{37}'
```

</details>

<details>
<summary><b>Grep Examples</b></summary>

```bash
# Find TODO comments
grep -r "TODO\|FIXME\|HACK\|XXX" src/

# Find function definitions
grep -E "^(async )?(function|const) \w+" src/

# Find imports
grep -E "^import .+ from" src/

# Find API keys (security check)
grep -rE "(sk-ant-|sk-|ghp_|AKIA)" . --include="*.{js,ts,json,env}"

# Find IP addresses
grep -oE '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' access.log

# Find errors in logs
grep -iE "(error|fail|exception|crash)" logs/*.log
```

</details>

---

## CRON SCHEDULES

<details>
<summary><b>Cron Syntax Reference</b></summary>

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6, Sunday=0)
│ │ │ │ │
* * * * * command

# Common schedules
*/5 * * * *     Every 5 minutes
0 * * * *       Every hour
0 0 * * *       Daily at midnight
0 0 * * 0       Weekly on Sunday
0 0 1 * *       Monthly on 1st
0 0 1 1 *       Yearly on Jan 1st

# Business hours
0 9-17 * * 1-5  Every hour 9-5, Mon-Fri

# Multiple values
0 0,12 * * *    Midnight and noon
0 0 1,15 * *    1st and 15th of month
```

</details>

<details>
<summary><b>BlackRoad Cron Jobs</b></summary>

```bash
# Edit crontab
crontab -e

# BlackRoad scheduled tasks
# Health check every 5 minutes
*/5 * * * * ~/blackroad-health-score.sh >> ~/.blackroad/logs/health.log 2>&1

# Backup every 6 hours
0 */6 * * * ~/blackroad-cluster-backup.sh all >> ~/.blackroad/logs/backup.log 2>&1

# Daily cleanup at 3am
0 3 * * * ~/cleanup-old-logs.sh

# Weekly report on Sunday
0 9 * * 0 ~/generate-weekly-report.sh | mail -s "Weekly Report" alexa@blackroad.io

# Memory compaction daily
0 4 * * * ~/memory-system.sh compact

# Git push daily at 6pm
0 18 * * * cd ~ && git add -A && git commit -m "Auto-save $(date +%Y-%m-%d)" && git push
```

</details>

---

## LOG FORMATS

<details>
<summary><b>Standard Log Format</b></summary>

```bash
# BlackRoad log format
# [TIMESTAMP] [LEVEL] [COMPONENT] MESSAGE

# Example
[2026-02-17T12:00:00Z] [INFO] [memory] Session started: zeus-123
[2026-02-17T12:00:01Z] [DEBUG] [ai] Backend selected: local
[2026-02-17T12:00:05Z] [WARN] [network] Slow response: 2.5s
[2026-02-17T12:00:10Z] [ERROR] [deploy] Build failed: exit code 1

# Levels
DEBUG   Detailed debugging info
INFO    General information
WARN    Warning conditions
ERROR   Error conditions
FATAL   Critical failures
```

</details>

<details>
<summary><b>Structured JSON Logs</b></summary>

```json
{"ts":"2026-02-17T12:00:00Z","level":"info","component":"api","msg":"Request received","method":"POST","path":"/generate","duration_ms":150}
{"ts":"2026-02-17T12:00:01Z","level":"debug","component":"ai","msg":"Model loaded","model":"llama3","memory_mb":4700}
{"ts":"2026-02-17T12:00:05Z","level":"error","component":"deploy","msg":"Deployment failed","project":"blackroad-io","error":"Build timeout"}
```

</details>

<details>
<summary><b>Log Analysis Commands</b></summary>

```bash
# Count errors
grep -c ERROR ~/.blackroad/logs/*.log

# Errors per hour
grep ERROR app.log | cut -d' ' -f1 | cut -dT -f2 | cut -d: -f1 | sort | uniq -c

# Top error messages
grep ERROR app.log | cut -d']' -f4 | sort | uniq -c | sort -rn | head

# Response time analysis
grep "duration_ms" app.log | jq -r '.duration_ms' | awk '{sum+=$1; count++} END {print "avg:", sum/count}'

# Real-time monitoring
tail -f ~/.blackroad/logs/*.log | grep --line-buffered ERROR
```

</details>

---

## SHELL IDIOMS

<details>
<summary><b>Common Patterns</b></summary>

```bash
# Default value
${VAR:-default}          # Use default if unset
${VAR:=default}          # Set to default if unset
${VAR:+alternate}        # Use alternate if set

# String operations
${VAR#pattern}           # Remove shortest prefix
${VAR##pattern}          # Remove longest prefix
${VAR%pattern}           # Remove shortest suffix
${VAR%%pattern}          # Remove longest suffix
${VAR/old/new}           # Replace first
${VAR//old/new}          # Replace all
${#VAR}                  # String length

# Arrays
arr=(a b c)
${arr[@]}                # All elements
${#arr[@]}               # Array length
${arr[0]}                # First element
arr+=(d)                 # Append

# Command substitution
result=$(command)
result=`command`         # Old style

# Process substitution
diff <(cmd1) <(cmd2)

# Here documents
cat <<EOF
Multi-line
text
EOF

# Here string
grep "pattern" <<< "input string"
```

</details>

<details>
<summary><b>Error Handling</b></summary>

```bash
# Exit on error
set -e

# Exit on undefined variable
set -u

# Exit on pipe failure
set -o pipefail

# Combined
set -euo pipefail

# Trap errors
trap 'echo "Error on line $LINENO"' ERR

# Trap exit
trap 'cleanup' EXIT

cleanup() {
    rm -f /tmp/tempfile
}

# Check command success
if command; then
    echo "Success"
else
    echo "Failed"
fi

# Or use ||
command || { echo "Failed"; exit 1; }

# And use &&
command && echo "Success"
```

</details>

<details>
<summary><b>Loops & Conditionals</b></summary>

```bash
# For loop
for i in {1..10}; do echo $i; done
for file in *.txt; do cat "$file"; done
for ((i=0; i<10; i++)); do echo $i; done

# While loop
while read -r line; do
    echo "$line"
done < file.txt

# Until loop
until [ "$status" = "ready" ]; do
    sleep 1
    status=$(check_status)
done

# Case statement
case "$1" in
    start)  start_service ;;
    stop)   stop_service ;;
    *)      echo "Usage: $0 {start|stop}" ;;
esac

# If/elif/else
if [ -f "$file" ]; then
    echo "File exists"
elif [ -d "$file" ]; then
    echo "Directory exists"
else
    echo "Not found"
fi

# Test operators
[ -f file ]     # File exists
[ -d dir ]      # Directory exists
[ -z "$str" ]   # String is empty
[ -n "$str" ]   # String is not empty
[ "$a" = "$b" ] # Strings equal
[ $a -eq $b ]   # Numbers equal
[ $a -lt $b ]   # Less than
[ $a -gt $b ]   # Greater than
```

</details>

---

## KEYBOARD SHORTCUTS

<details>
<summary><b>Terminal (Zsh/Bash)</b></summary>

```
Navigation
Ctrl+A      Beginning of line
Ctrl+E      End of line
Ctrl+B      Back one character
Ctrl+F      Forward one character
Alt+B       Back one word
Alt+F       Forward one word

Editing
Ctrl+U      Delete to beginning
Ctrl+K      Delete to end
Ctrl+W      Delete word backwards
Alt+D       Delete word forwards
Ctrl+Y      Paste deleted text
Ctrl+T      Swap characters
Alt+T       Swap words

History
Ctrl+R      Reverse search
Ctrl+S      Forward search
Ctrl+P      Previous command
Ctrl+N      Next command
!!          Last command
!$          Last argument
!*          All arguments

Control
Ctrl+C      Cancel command
Ctrl+Z      Suspend process
Ctrl+D      Exit / EOF
Ctrl+L      Clear screen
```

</details>

<details>
<summary><b>tmux Shortcuts</b></summary>

```
Prefix: Ctrl+A (BlackRoad config)

Sessions
Prefix d    Detach
Prefix s    List sessions
Prefix $    Rename session

Windows
Prefix c    New window
Prefix n    Next window
Prefix p    Previous window
Prefix &    Kill window
Prefix ,    Rename window
Prefix w    List windows

Panes
Prefix |    Split horizontal
Prefix -    Split vertical
Prefix h/j/k/l  Navigate panes
Prefix z    Toggle zoom
Prefix x    Kill pane
Prefix {    Move pane left
Prefix }    Move pane right

Other
Prefix ?    Help
Prefix :    Command mode
Prefix [    Copy mode
Prefix r    Reload config
```

</details>

<details>
<summary><b>Vim/Neovim Shortcuts</b></summary>

```
Modes
i           Insert mode
Esc         Normal mode
v           Visual mode
V           Visual line mode
Ctrl+V      Visual block mode
:           Command mode

Navigation
h/j/k/l     Left/down/up/right
w/b         Word forward/back
0/$         Line start/end
gg/G        File start/end
Ctrl+D/U    Half page down/up
/{pattern}  Search forward
n/N         Next/prev match

Editing
x           Delete character
dd          Delete line
yy          Yank (copy) line
p           Paste
u           Undo
Ctrl+R      Redo
.           Repeat last command
>>          Indent
<<          Unindent

Files
:w          Save
:q          Quit
:wq         Save and quit
:q!         Force quit
:e file     Open file
:sp file    Horizontal split
:vsp file   Vertical split
```

</details>

---

## TESTING

<details>
<summary><b>Unit Testing Patterns</b></summary>

```bash
# Shell script testing with bats
bats test/*.bats

# Test file structure
test/
├── test_helper.bash           # Common fixtures
├── memory-system.bats         # Memory tests
├── agent-registry.bats        # Registry tests
└── traffic-light.bats         # Traffic light tests

# Example bats test
@test "memory system logs entry" {
    run ~/memory-system.sh log test entity "test details" "test-tag"
    [ "$status" -eq 0 ]
    [[ "$output" == *"logged"* ]]
}

@test "agent registry creates hash" {
    run ~/blackroad-agent-registry.sh register test-agent ai
    [ "$status" -eq 0 ]
    [[ "$output" == *"Hash:"* ]]
}
```

</details>

<details>
<summary><b>Integration Testing</b></summary>

```bash
# Full system integration test
~/test-e2e-full.sh

# Component integration tests
~/test-coordination-v2.sh      # Multi-agent coordination
~/test-concurrent-memory.sh    # Concurrent memory access
~/test-webhooks.sh            # Webhook delivery
~/test-deployments.sh         # Deployment verification

# Integration test checklist
test_memory_write_read()
test_agent_registration()
test_traffic_light_state()
test_task_marketplace()
test_cloudflare_deploy()
test_github_push()
test_tailscale_connectivity()
test_device_ssh()

# Expected results
PASS: All 8 devices reachable via Tailscale
PASS: Memory journal append-only verified
PASS: Traffic light states persist
PASS: Task marketplace CRUD operations
```

</details>

<details>
<summary><b>Load Testing</b></summary>

```bash
# Memory system load test
for i in {1..100}; do
    ~/memory-system.sh log "load-test" "entity-$i" "test $i" "load" &
done
wait
echo "100 concurrent writes completed"

# API load test with hey
hey -n 1000 -c 10 http://localhost:11434/api/tags

# Cloudflare Workers load test
hey -n 10000 -c 100 https://api.blackroad.io/health

# Expected thresholds
Memory writes: < 100ms p99
Local Ollama: < 500ms p99
Cloudflare edge: < 50ms p99
```

</details>

<details>
<summary><b>Security Testing</b></summary>

```bash
# Dependency scanning
npm audit
pip-audit
cargo audit

# Secret scanning
gitleaks detect --source=. --verbose

# SAST scanning
semgrep --config=auto .

# Container scanning
trivy image blackroad/ollama:latest

# SSL/TLS verification
openssl s_client -connect blackroad.io:443 -servername blackroad.io

# Expected: 0 high/critical vulnerabilities
```

</details>

---

## MIGRATION GUIDES

<details>
<summary><b>Migrating from External APIs</b></summary>

```bash
# Step 1: Install local Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Step 2: Pull required models
ollama pull llama3
ollama pull codellama:7b
ollama pull qwen2.5-coder:7b

# Step 3: Update environment
export OLLAMA_HOST="127.0.0.1:11434"
export BR_BACKEND="local"

# Step 4: Test local inference
k "Hello, test local"

# Step 5: Remove API keys from active use
# Keep as backup in 1Password/vault
unset OPENAI_API_KEY
unset ANTHROPIC_API_KEY  # Keep root key separate

# Step 6: Update scripts to use blackroad-ai
sed -i 's/curl.*api.openai.com/blackroad-ai/g' ~/scripts/*.sh

# Verification
blackroad-ai --local "Confirm local routing"
```

</details>

<details>
<summary><b>Migrating Repos to BlackRoad-OS</b></summary>

```bash
# Step 1: Fork or create in BlackRoad-OS org
gh repo fork owner/repo --org BlackRoad-OS

# Step 2: Add proprietary license
cat > LICENSE << 'EOF'
BLACKROAD OS PROPRIETARY LICENSE
Copyright (c) 2024-2026 BlackRoad OS, Inc.
All Rights Reserved.
...
EOF

# Step 3: Update remote
git remote set-url origin git@github.com:BlackRoad-OS/repo.git

# Step 4: Add standard files
cp ~/templates/.github/CODEOWNERS .github/
cp ~/templates/.github/FUNDING.yml .github/
cp ~/templates/README-TEMPLATE.md README.md

# Step 5: Enable features
gh repo edit --enable-issues --enable-wiki

# Step 6: Configure branch protection
gh api repos/BlackRoad-OS/repo/branches/main/protection \
  -X PUT -f required_status_checks='{"strict":true,"contexts":[]}'

# Step 7: Update traffic light
~/blackroad-traffic-light.sh set repo green "Migrated to BlackRoad-OS"
```

</details>

<details>
<summary><b>Migrating Cloudflare Projects</b></summary>

```bash
# Step 1: Export existing config
wrangler pages project list > /tmp/current-projects.txt

# Step 2: Download current deployment
wrangler pages download <project-name>

# Step 3: Update wrangler.toml
cat > wrangler.toml << 'EOF'
name = "blackroad-<service>"
compatibility_date = "2024-01-01"
pages_build_output_dir = "./dist"

[vars]
BLACKROAD_ENV = "production"
EOF

# Step 4: Redeploy with new config
wrangler pages deploy ./dist --project-name=blackroad-<service>

# Step 5: Update DNS
wrangler pages domain add <project> <subdomain>.blackroad.io

# Step 6: Verify
curl -I https://<subdomain>.blackroad.io
```

</details>

<details>
<summary><b>Migrating from Docker to K8s</b></summary>

```yaml
# Step 1: Convert docker-compose to K8s
# docker-compose.yml
services:
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"

# Becomes deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ollama
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ollama
  template:
    metadata:
      labels:
        app: ollama
    spec:
      containers:
      - name: ollama
        image: ollama/ollama
        ports:
        - containerPort: 11434

---
apiVersion: v1
kind: Service
metadata:
  name: ollama
spec:
  selector:
    app: ollama
  ports:
  - port: 11434
    targetPort: 11434
```

```bash
# Step 2: Apply to cluster
kubectl apply -f deployment.yaml

# Step 3: Verify
kubectl get pods -l app=ollama
kubectl logs -l app=ollama

# Step 4: Update service discovery
kubectl get svc ollama -o jsonpath='{.spec.clusterIP}'
```

</details>

---

## ARCHITECTURE DECISION RECORDS

<details>
<summary><b>ADR-001: Local-First AI Architecture</b></summary>

```markdown
# ADR-001: Local-First AI Architecture

## Status
Accepted

## Context
We depend on external AI APIs (OpenAI, Anthropic) which:
- Cost money per token
- Have rate limits
- Can see our data
- Can be unavailable
- Can change terms

## Decision
Implement local-first AI with:
1. Ollama as primary backend (26 models)
2. Hailo-8 acceleration on Cecilia (26 TOPS)
3. External APIs as fallback only
4. All routing through blackroad-ai gateway

## Consequences
Positive:
- Zero inference costs for local queries
- Complete data privacy
- No rate limits
- Works offline

Negative:
- Hardware investment required
- Model quality may be lower than GPT-4/Claude
- Need to manage model updates

## Implementation
- blackroad-ai gateway created
- Local routing: curl http://localhost:11434
- Fallback: anthropic API, openai API
- Priority: local > anthropic > openai
```

</details>

<details>
<summary><b>ADR-002: PS-SHA-infinity Memory System</b></summary>

```markdown
# ADR-002: PS-SHA-infinity Memory System

## Status
Accepted

## Context
Multiple Claude instances need to coordinate without:
- Stepping on each other
- Losing work
- Duplicating effort
- Missing context

## Decision
Create append-only journal system:
1. JSONL format (one JSON per line)
2. SHA-256 hashing for deduplication
3. Infinity symbol for unbounded growth
4. Real-time sync across agents

## Consequences
Positive:
- Perfect coordination history
- Deduplication built-in
- Human readable
- Git-friendly

Negative:
- Journal grows unbounded (mitigated by archival)
- No random access (sequential read)

## Implementation
Location: ~/.blackroad/memory/journals/master-journal.jsonl
Format: {"ts":"ISO8601","action":"...","entity":"...","hash":"sha256"}
Commands: ~/memory-system.sh log/query/summary
```

</details>

<details>
<summary><b>ADR-003: Traffic Light Project Status</b></summary>

```markdown
# ADR-003: Traffic Light Project Status

## Status
Accepted

## Context
With 1,085 repos and 205 Cloudflare projects, need at-a-glance status.

## Decision
Three-state traffic light system:
- GREEN: Production ready, tests passing
- YELLOW: In progress, needs attention
- RED: Blocked, critical issues

## Consequences
Positive:
- Instant visibility
- Simple mental model
- Actionable states

Negative:
- Oversimplifies complex states
- Binary thinking may miss nuance

## Implementation
Database: ~/.blackroad-traffic-light.db
Schema: id, status (green/yellow/red), reason, updated_at
Commands: ~/blackroad-traffic-light.sh set/list/summary
Current: 58 green, 0 yellow, 0 red
```

</details>

<details>
<summary><b>ADR-004: Mythology Agent Names</b></summary>

```markdown
# ADR-004: Mythology Agent Names

## Status
Accepted

## Context
Multiple Claude sessions need unique identities for:
- Coordination
- Personality
- Memory attribution
- Human recognition

## Decision
Use Greek mythology names:
- Zeus, Apollo, Athena, Artemis, Ares
- Prometheus, Hercules, Perseus, Orpheus
- Erebus, Helios, Iris, Nike, Thanatos

## Consequences
Positive:
- Memorable
- Distinct personalities implied
- Fun and engaging
- Cultural depth

Negative:
- Limited pool (mitigated: 50+ names)
- Cultural assumptions

## Implementation
Assignment: ~/claude-session-init.sh
Registry: ~/.blackroad-agent-registry.db
Format: <name>-<timestamp>-<hash>
Example: zeus-1766972309-4a7b8c
```

</details>

<details>
<summary><b>ADR-005: Cloudflare as Edge Layer</b></summary>

```markdown
# ADR-005: Cloudflare as Edge Layer

## Status
Accepted

## Context
Need global edge presence for:
- Low latency
- DDoS protection
- SSL termination
- Caching

## Decision
Use Cloudflare for:
- 205 Pages projects (static hosting)
- Workers (edge compute)
- KV (35 namespaces for state)
- D1 (edge SQLite)
- DNS (all domains)

## Consequences
Positive:
- Global edge (300+ cities)
- Free tier generous
- Simple deployment (wrangler)
- Owned account (full control)

Negative:
- Vendor dependency
- Cloudflare can see traffic
- Rate limits on free tier

## Implementation
Account: blackboxprogramming@gmail.com
CLI: wrangler
Deployment: wrangler pages deploy
DNS: Cloudflare manages all zones
```

</details>

---

## GLOSSARY

<details>
<summary><b>BlackRoad Terms</b></summary>

| Term | Definition |
|------|------------|
| **BlackRoad** | The unified AI infrastructure platform |
| **Sovereignty** | Control over your own compute, data, routing |
| **Layer** | Abstraction level in sovereignty stack (0-8) |
| **PS-SHA-infinity** | Memory hash algorithm (Phi-Spiral SHA-infinity) |
| **Traffic Light** | Project status indicator (green/yellow/red) |
| **GreenLight** | Approved/ready templates for common operations |
| **CECE OS** | Sovereign AI operating system on Cecilia |
| **BlackRoad Codex** | Indexed component database (22,244 items) |
| **Task Marketplace** | Distributed task coordination system |
| **Agent** | AI instance with unique identity (Zeus, Apollo, etc.) |
| **Fleet** | Collection of physical devices (8 devices) |
| **Empire** | GitHub organization structure (15 orgs, 1,085 repos) |
| **Root Key** | Master API key with full access |
| **Gateway** | Routing layer for AI requests (blackroad-ai) |

</details>

<details>
<summary><b>Technical Acronyms</b></summary>

| Acronym | Meaning |
|---------|---------|
| **TOPS** | Tera Operations Per Second (AI compute metric) |
| **KV** | Key-Value (Cloudflare KV storage) |
| **D1** | Cloudflare's edge SQLite database |
| **WSL** | Windows Subsystem for Linux |
| **NVMe** | Non-Volatile Memory Express (fast SSD) |
| **HAT** | Hardware Attached on Top (Pi accessory board) |
| **JSONL** | JSON Lines (one JSON per line format) |
| **BATS** | Bash Automated Testing System |
| **ADR** | Architecture Decision Record |
| **SAST** | Static Application Security Testing |
| **DAST** | Dynamic Application Security Testing |
| **P99** | 99th percentile latency |
| **SLA** | Service Level Agreement |
| **RPO** | Recovery Point Objective |
| **RTO** | Recovery Time Objective |

</details>

<details>
<summary><b>Device Names</b></summary>

| Name | Etymology | Role |
|------|-----------|------|
| **Alexandria** | Library of Alexandria | Human orchestrator, knowledge hub |
| **Cecilia** | Saint Cecilia (patron of music) | Primary AI agent, harmony |
| **Lucidia** | Latin for "light/clarity" | AI inference, illumination |
| **Octavia** | Latin for "eighth" | Multi-arm processing |
| **Alice** | Alice in Wonderland | Worker node, explorer |
| **Aria** | Musical term for solo | Harmony protocols |
| **Shellfish** | Shell + fish (terminal pun) | Edge compute |
| **Infinity** | Mathematical concept | Cloud oracle, unbounded |

</details>

<details>
<summary><b>GitHub Organizations</b></summary>

| Org | Purpose |
|-----|---------|
| **BlackRoad-OS** | Core operating system (859 repos) |
| **BlackRoad-AI** | AI models, agents, inference |
| **BlackRoad-Cloud** | Cloud infrastructure |
| **BlackRoad-Security** | Security tools, audits |
| **BlackRoad-Media** | Media, entertainment |
| **BlackRoad-Foundation** | Core libraries |
| **BlackRoad-Interactive** | Games, interactive |
| **BlackRoad-Labs** | Experiments, research |
| **BlackRoad-Hardware** | Hardware projects |
| **BlackRoad-Studio** | Creative tools |
| **BlackRoad-Ventures** | Business ventures |
| **BlackRoad-Education** | Learning resources |
| **BlackRoad-Gov** | Governance tools |
| **BlackRoad-Archive** | Historical archives |
| **Blackbox-Enterprises** | Enterprise solutions |

</details>

---

## PERFORMANCE OPTIMIZATION

<details>
<summary><b>Ollama Performance Tuning</b></summary>

```bash
# Environment variables for performance
export OLLAMA_NUM_PARALLEL=4        # Concurrent requests
export OLLAMA_MAX_LOADED_MODELS=2   # Models in memory
export OLLAMA_KEEP_ALIVE="5m"       # Model unload timeout

# GPU memory allocation (if NVIDIA)
export CUDA_VISIBLE_DEVICES=0
export OLLAMA_GPU_MEMORY=8192       # MB

# For Apple Silicon
# Automatically uses Metal (no config needed)
# 8GB M1 = ~4GB available for models

# Quantization for smaller models
ollama run llama3:8b-q4_0           # 4-bit quantized

# Benchmarking
time ollama run llama3 "Hello" --verbose 2>&1 | grep "eval"

# Expected performance (M1 8GB)
# llama3 8B: ~30 tokens/sec
# codellama 7B: ~35 tokens/sec
# mistral 7B: ~40 tokens/sec
```

</details>

<details>
<summary><b>Shell Script Optimization</b></summary>

```bash
# Use built-ins instead of external commands
# Bad:
result=$(echo "$string" | grep "pattern")
# Good:
[[ "$string" == *"pattern"* ]] && result="$string"

# Avoid subshells
# Bad:
cat file | while read line; do ... done
# Good:
while read line; do ... done < file

# Use arrays for multiple items
# Bad:
files="file1 file2 file3"
for f in $files; do ... done
# Good:
files=(file1 file2 file3)
for f in "${files[@]}"; do ... done

# Parallel execution
for i in {1..10}; do
    process_item "$i" &
done
wait

# Use jq streaming for large JSON
jq -c '.items[]' large.json | while read item; do
    echo "$item" | jq -r '.name'
done
```

</details>

<details>
<summary><b>Memory System Optimization</b></summary>

```bash
# Journal compaction (when > 10000 entries)
if [ $(wc -l < ~/.blackroad/memory/journals/master-journal.jsonl) -gt 10000 ]; then
    # Archive old entries
    head -8000 ~/.blackroad/memory/journals/master-journal.jsonl > \
        ~/.blackroad/memory/journals/archive-$(date +%Y%m).jsonl
    tail -2000 ~/.blackroad/memory/journals/master-journal.jsonl > \
        /tmp/recent.jsonl
    mv /tmp/recent.jsonl ~/.blackroad/memory/journals/master-journal.jsonl
fi

# Index frequently accessed data
sqlite3 ~/.blackroad/memory/index.db << 'SQL'
CREATE INDEX IF NOT EXISTS idx_action ON entries(action);
CREATE INDEX IF NOT EXISTS idx_entity ON entries(entity);
CREATE INDEX IF NOT EXISTS idx_ts ON entries(timestamp);
SQL

# Use grep -F for literal strings (faster than regex)
grep -F "deployed" master-journal.jsonl
```

</details>

<details>
<summary><b>Network Optimization</b></summary>

```bash
# Tailscale direct connections
tailscale ping cecilia                   # Check direct vs DERP
tailscale netcheck                       # Network diagnostics

# SSH connection multiplexing (~/.ssh/config)
Host *
    ControlMaster auto
    ControlPath ~/.ssh/sockets/%r@%h-%p
    ControlPersist 600

# Reduce DNS lookups
# Add to /etc/hosts for frequent targets
192.168.4.89    cecilia cecilia.local
192.168.4.81    lucidia lucidia.local

# Cloudflare cache optimization
# In wrangler.toml:
[build]
command = "npm run build"
[site]
bucket = "./dist"
# In _headers file:
/*
  Cache-Control: public, max-age=31536000, immutable
```

</details>

---

## DEBUGGING GUIDE

<details>
<summary><b>Common Issues & Solutions</b></summary>

```bash
# Issue: Ollama not responding
# Check 1: Is it running?
pgrep ollama || ollama serve &

# Check 2: Port in use?
lsof -i :11434
# Fix: Kill conflicting process
kill $(lsof -t -i :11434)

# Issue: Memory system errors
# Check journal integrity
tail -1 ~/.blackroad/memory/journals/master-journal.jsonl | jq .
# Fix corrupted JSON
grep -v "^$" master-journal.jsonl | head -n -1 > /tmp/fixed.jsonl

# Issue: SSH to Pi fails
# Check 1: Network
ping 192.168.4.89
# Check 2: Tailscale
tailscale status | grep cecilia
# Fix: Reconnect via Tailscale IP
ssh 100.72.180.98

# Issue: Cloudflare deploy fails
# Check auth
wrangler whoami
# Fix: Re-login
wrangler logout && wrangler login

# Issue: GitHub push rejected
# Check remote
git remote -v
# Fix: Update token
gh auth refresh
```

</details>

<details>
<summary><b>Log Analysis</b></summary>

```bash
# Memory system logs
tail -f ~/.blackroad/memory/journals/master-journal.jsonl | jq -c '.'

# System logs (macOS)
log show --predicate 'process == "ollama"' --last 1h

# Cloudflare Worker logs
wrangler tail --project-name=blackroad-api

# SSH verbose mode
ssh -vvv cecilia

# Curl verbose for API debugging
curl -v http://localhost:11434/api/tags

# Network tracing
sudo tcpdump -i any port 11434

# Process tracing
dtruss -p $(pgrep ollama) 2>&1 | head -100
```

</details>

<details>
<summary><b>Debug Environment Variables</b></summary>

```bash
# Shell script debugging
set -x                    # Trace execution
set -e                    # Exit on error
set -u                    # Error on undefined vars
set -o pipefail          # Pipe failures

# Bash debug output to file
exec 2> /tmp/debug.log
set -x

# Ollama debug
export OLLAMA_DEBUG=1

# Curl debug
export CURL_VERBOSE=1

# Git debug
export GIT_TRACE=1
export GIT_CURL_VERBOSE=1

# Node.js debug
export DEBUG="*"
export NODE_DEBUG="http,net"

# Python debug
export PYTHONVERBOSE=1
```

</details>

<details>
<summary><b>Health Check Commands</b></summary>

```bash
# Quick system health
~/check-blackroad-status.sh

# Full health check
echo "=== System Health ===" && \
echo "Ollama: $(curl -s localhost:11434/api/tags | jq '.models | length') models" && \
echo "Memory: $(wc -l < ~/.blackroad/memory/journals/master-journal.jsonl) entries" && \
echo "Agents: $(sqlite3 ~/.blackroad-agent-registry.db 'SELECT COUNT(*) FROM agents')" && \
echo "Traffic: $(~/blackroad-traffic-light.sh summary | grep -c green) green" && \
echo "Tasks: $(~/memory-task-marketplace.sh stats | grep available | awk '{print $2}')" && \
echo "Devices: $(for h in cecilia lucidia alice aria octavia; do timeout 1 ping -c1 $h &>/dev/null && echo -n "$h "; done)" && \
echo ""

# Expected output:
# Ollama: 26 models
# Memory: 4041 entries
# Agents: 50+
# Traffic: 58 green
# Tasks: 163 available
# Devices: cecilia lucidia alice aria octavia
```

</details>

---

## VERSION COMPATIBILITY

<details>
<summary><b>Supported Versions</b></summary>

| Component | Minimum | Recommended | Tested |
|-----------|---------|-------------|--------|
| macOS | 13.0 | 14.5+ | 14.5 |
| Ubuntu (Pi) | 22.04 | 24.04 | 24.04 |
| Node.js | 18.x | 20.x | 20.11 |
| Python | 3.10 | 3.12 | 3.12 |
| Bash | 4.4 | 5.2 | 5.2 |
| Ollama | 0.1.0 | 0.3.0+ | 0.3.12 |
| Wrangler | 3.0 | 3.80+ | 3.80 |
| Tailscale | 1.50 | 1.70+ | 1.76 |
| Docker | 24.0 | 27.0+ | 27.3 |
| gh CLI | 2.40 | 2.60+ | 2.62 |

</details>

<details>
<summary><b>Breaking Changes Log</b></summary>

```markdown
## v0.3.0 (2026-02-15)
- BREAKING: blackroad-ai replaces direct API calls
- BREAKING: Memory path changed to ~/.blackroad/memory/
- Migration: Run ~/migrate-memory-v3.sh

## v0.2.0 (2026-02-01)
- BREAKING: Agent registry schema updated
- Migration: sqlite3 ~/.blackroad-agent-registry.db < ~/migrate-registry-v2.sql

## v0.1.0 (2026-01-15)
- Initial release
- No breaking changes
```

</details>

<details>
<summary><b>Deprecation Notices</b></summary>

```markdown
## Deprecated (Remove in v0.4.0)
- ~/memory.sh -> Use ~/memory-system.sh
- ~/codex-search.py -> Use ~/blackroad-codex-search.py
- Direct curl to APIs -> Use blackroad-ai gateway
- OPENAI_API_KEY env -> Use BR_BACKEND=local

## Deprecated (Remove in v0.5.0)
- Individual ask-* scripts -> Use br-agent
- Manual traffic light DB -> Use ~/blackroad-traffic-light.sh
- Legacy journal format -> Use PS-SHA-infinity format
```

</details>

---

## API REFERENCE

<details>
<summary><b>Ollama API Endpoints</b></summary>

```bash
# Base URL: http://localhost:11434

# List models
GET /api/tags
curl http://localhost:11434/api/tags | jq '.models[].name'

# Generate completion
POST /api/generate
curl -X POST http://localhost:11434/api/generate \
  -d '{"model":"llama3","prompt":"Hello","stream":false}' | jq '.response'

# Chat completion
POST /api/chat
curl -X POST http://localhost:11434/api/chat \
  -d '{"model":"llama3","messages":[{"role":"user","content":"Hello"}],"stream":false}'

# Generate embeddings
POST /api/embed
curl -X POST http://localhost:11434/api/embed \
  -d '{"model":"nomic-embed-text","input":"Hello world"}'

# Pull model
POST /api/pull
curl -X POST http://localhost:11434/api/pull \
  -d '{"name":"llama3"}'

# Show model info
POST /api/show
curl -X POST http://localhost:11434/api/show \
  -d '{"name":"llama3"}' | jq '.details'
```

</details>

<details>
<summary><b>BlackRoad Gateway API</b></summary>

```bash
# Base URL: varies by backend

# Query with automatic routing
blackroad-ai "query"              # Auto-select backend
blackroad-ai -l "query"           # Force local
blackroad-ai -a "query"           # Force Anthropic
blackroad-ai -o "query"           # Force OpenAI

# Programmatic access
source ~/.blackroad/lib/ai-gateway.sh
br_query "prompt" "local"         # Local backend
br_query "prompt" "anthropic"     # Anthropic backend

# Direct function call (from blackroad-ai)
k() {
    curl -s http://localhost:11434/api/generate \
        -d "{\"model\":\"llama3\",\"prompt\":\"$1\",\"stream\":false}" \
        | jq -r '.response'
}
```

</details>

<details>
<summary><b>Memory System API</b></summary>

```bash
# Log entry
~/memory-system.sh log <action> <entity> <details> <tags>
# Returns: { "logged": true, "hash": "sha256..." }

# Query entries
~/memory-system.sh query <pattern>
# Returns: matching JSONL entries

# Get summary
~/memory-system.sh summary
# Returns: stats and recent entries

# Check for conflicts
~/memory-realtime-context.sh live <agent-id> compact
# Returns: coordination context

# GreenLight templates
source ~/memory-greenlight-templates.sh
gl_announce "agent" "project" "tasks" "goal"
gl_progress "agent" "completed" "next"
gl_deploy "service" "url" "details"
gl_blocked "agent" "reason" "needs"
```

</details>

<details>
<summary><b>Traffic Light API</b></summary>

```bash
# Set status
~/blackroad-traffic-light.sh set <id> <green|yellow|red> "<reason>"
# Returns: "Set <id> to <status>"

# List all
~/blackroad-traffic-light.sh list
# Returns: table of all projects with status

# Summary
~/blackroad-traffic-light.sh summary
# Returns: "Green: X, Yellow: Y, Red: Z"

# Get single status
~/blackroad-traffic-light.sh get <id>
# Returns: status and reason

# SQLite direct access
sqlite3 ~/.blackroad-traffic-light.db \
  "SELECT * FROM traffic_lights WHERE status='green'"
```

</details>

---

## INTEGRATION PATTERNS

<details>
<summary><b>Event-Driven Architecture</b></summary>

```bash
# Pattern: File watcher triggers action
fswatch -o ~/.blackroad/memory/journals/ | while read; do
    ~/process-new-entries.sh
done

# Pattern: Webhook receiver
# In Cloudflare Worker:
export default {
    async fetch(request) {
        const body = await request.json();
        await processWebhook(body);
        return new Response('OK');
    }
}

# Pattern: Polling with backoff
INTERVAL=5
MAX_INTERVAL=300
while true; do
    if ~/check-for-work.sh; then
        ~/do-work.sh
        INTERVAL=5
    else
        INTERVAL=$((INTERVAL * 2))
        [ $INTERVAL -gt $MAX_INTERVAL ] && INTERVAL=$MAX_INTERVAL
    fi
    sleep $INTERVAL
done
```

</details>

<details>
<summary><b>Pub/Sub Messaging</b></summary>

```bash
# Publisher (using Cloudflare KV)
wrangler kv key put --binding=MESSAGES \
  "msg:$(date +%s)" '{"type":"deploy","project":"blackroad-io"}'

# Subscriber
while true; do
    MESSAGES=$(wrangler kv key list --binding=MESSAGES | jq -r '.[].name')
    for key in $MESSAGES; do
        MSG=$(wrangler kv key get --binding=MESSAGES "$key")
        process_message "$MSG"
        wrangler kv key delete --binding=MESSAGES "$key"
    done
    sleep 5
done

# Pattern: Redis-style pub/sub via file
# Publisher
echo '{"event":"deployed"}' >> ~/.blackroad/events/deploy.jsonl

# Subscriber
tail -F ~/.blackroad/events/deploy.jsonl | while read event; do
    echo "$event" | jq -c '.' | process_event
done
```

</details>

<details>
<summary><b>Service Discovery</b></summary>

```bash
# Static discovery (hosts file)
cat >> /etc/hosts << 'EOF'
192.168.4.89    cecilia
192.168.4.81    lucidia
192.168.4.49    alice
EOF

# Dynamic discovery (Tailscale)
tailscale status --json | jq -r '.Peer[] | "\(.HostName) \(.TailscaleIPs[0])"'

# Service registry
~/blackroad-service-registry.sh register ollama http://localhost:11434
~/blackroad-service-registry.sh discover ollama
# Returns: http://localhost:11434

# DNS-based discovery
dig +short cecilia.blackroad.io A
# Returns: 100.72.180.98 (Tailscale IP via Cloudflare DNS)
```

</details>

<details>
<summary><b>Circuit Breaker Pattern</b></summary>

```bash
# Circuit breaker implementation
FAILURES=0
CIRCUIT_OPEN=false
THRESHOLD=3
RESET_AFTER=60

call_service() {
    if $CIRCUIT_OPEN; then
        if [ $(($(date +%s) - OPEN_TIME)) -gt $RESET_AFTER ]; then
            CIRCUIT_OPEN=false
            FAILURES=0
        else
            echo "Circuit open, failing fast"
            return 1
        fi
    fi

    if ! do_request; then
        FAILURES=$((FAILURES + 1))
        if [ $FAILURES -ge $THRESHOLD ]; then
            CIRCUIT_OPEN=true
            OPEN_TIME=$(date +%s)
            echo "Circuit opened"
        fi
        return 1
    fi

    FAILURES=0
    return 0
}
```

</details>

---

## RELEASE CHECKLIST

<details>
<summary><b>Pre-Release Checklist</b></summary>

```markdown
## Before Release

### Code Quality
- [ ] All tests passing (bats test/)
- [ ] No shellcheck warnings (shellcheck *.sh)
- [ ] No secrets in code (gitleaks detect)
- [ ] Documentation updated

### Infrastructure
- [ ] Traffic lights all green (58/58)
- [ ] Memory system healthy (4000+ entries)
- [ ] All devices online (8/8)
- [ ] Cloudflare projects deployed (205)

### Verification
- [ ] Local AI working (k "test")
- [ ] Memory logging (~/memory-system.sh log test...)
- [ ] Agent registration (~/blackroad-agent-registry.sh stats)
- [ ] Task marketplace (~/memory-task-marketplace.sh stats)

### Coordination
- [ ] No active Claude conflicts
- [ ] All claimed tasks completed
- [ ] GreenLight announcement sent
- [ ] TIL broadcast if new patterns
```

</details>

<details>
<summary><b>Release Process</b></summary>

```bash
# Step 1: Version bump
VERSION="0.3.0"
echo "$VERSION" > ~/VERSION

# Step 2: Update changelog
cat >> ~/CHANGELOG.md << EOF
## $VERSION ($(date +%Y-%m-%d))
- Feature: Added X
- Fixed: Issue Y
- Changed: Behavior Z
EOF

# Step 3: Tag release
git add -A
git commit -m "Release v$VERSION"
git tag -a "v$VERSION" -m "Release v$VERSION"
git push && git push --tags

# Step 4: Deploy
wrangler pages deploy ./dist --project-name=blackroad-os

# Step 5: Announce
source ~/memory-greenlight-templates.sh
gl_deploy "blackroad-os" "https://blackroad.io" "v$VERSION released"

# Step 6: Update traffic light
~/blackroad-traffic-light.sh set blackroad-os green "v$VERSION deployed"
```

</details>

<details>
<summary><b>Rollback Procedure</b></summary>

```bash
# Step 1: Identify bad version
wrangler pages deployment list --project-name=blackroad-os

# Step 2: Rollback to previous deployment
wrangler pages deployment rollback <deployment-id>

# Step 3: Or git revert
git revert HEAD
git push

# Step 4: Update traffic light
~/blackroad-traffic-light.sh set blackroad-os yellow "Rolled back to v$PREVIOUS"

# Step 5: Log incident
~/memory-system.sh log "rollback" "blackroad-os" "Rolled back v$VERSION to v$PREVIOUS due to $REASON" "incident,rollback"

# Step 6: Post-mortem
cat > ~/incidents/$(date +%Y%m%d)-rollback.md << EOF
# Incident: v$VERSION Rollback

## Timeline
- Deployed: $DEPLOY_TIME
- Issue detected: $DETECT_TIME
- Rollback: $ROLLBACK_TIME

## Root cause
$ROOT_CAUSE

## Resolution
$RESOLUTION

## Prevention
$PREVENTION
EOF
```

</details>

---

## MONITORING DASHBOARDS

<details>
<summary><b>Real-Time Status Dashboard</b></summary>

```bash
#!/bin/bash
# BlackRoad Real-Time Status Dashboard

while true; do
    clear
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║           BLACKROAD OS REAL-TIME STATUS                      ║"
    echo "║           $(date '+%Y-%m-%d %H:%M:%S')                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""

    # System Resources
    echo "▸ SYSTEM RESOURCES"
    echo "  CPU: $(top -l 1 | grep "CPU usage" | awk '{print $3}')"
    echo "  MEM: $(top -l 1 | grep "PhysMem" | awk '{print $2, $6}')"
    echo "  DISK: $(df -h / | tail -1 | awk '{print $5 " used"}')"
    echo ""

    # AI Services
    echo "▸ AI SERVICES"
    OLLAMA=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:11434/api/tags)
    [ "$OLLAMA" = "200" ] && echo "  Ollama: ✓ Online" || echo "  Ollama: ✗ Offline"
    echo ""

    # Device Fleet
    echo "▸ DEVICE FLEET"
    for host in cecilia lucidia alice aria octavia; do
        timeout 1 ping -c1 $host &>/dev/null && echo "  $host: ✓" || echo "  $host: ✗"
    done
    echo ""

    # Memory System
    ENTRIES=$(wc -l < ~/.blackroad/memory/journals/master-journal.jsonl 2>/dev/null || echo 0)
    echo "▸ MEMORY SYSTEM: $ENTRIES entries"
    echo ""

    # Traffic Lights
    GREEN=$(~/blackroad-traffic-light.sh summary 2>/dev/null | grep -o '[0-9]* green' | awk '{print $1}')
    echo "▸ TRAFFIC LIGHTS: ${GREEN:-0} green"

    sleep 5
done
```

</details>

<details>
<summary><b>Network Topology View</b></summary>

```
┌─────────────────────────────────────────────────────────────────┐
│                    BLACKROAD NETWORK TOPOLOGY                    │
└─────────────────────────────────────────────────────────────────┘

                         ┌─────────────┐
                         │  INTERNET   │
                         └──────┬──────┘
                                │
                    ┌───────────┴───────────┐
                    │    CLOUDFLARE CDN     │
                    │   205 Pages Projects  │
                    │    35 KV Namespaces   │
                    └───────────┬───────────┘
                                │
            ┌───────────────────┼───────────────────┐
            │                   │                   │
    ┌───────┴───────┐   ┌───────┴───────┐   ┌───────┴───────┐
    │   SHELLFISH   │   │   INFINITY    │   │   FRONTIER    │
    │ 174.138.44.45 │   │ 159.65.43.12  │   │  192.168.4.1  │
    │ DigitalOcean  │   │ DigitalOcean  │   │     ISP       │
    └───────────────┘   └───────────────┘   └───────┬───────┘
                                                    │
                                            ┌───────┴───────┐
                                            │  TAILSCALE    │
                                            │    MESH       │
                                            └───────┬───────┘
                                                    │
        ┌───────────┬───────────┬───────────┬───────┴───────┐
        │           │           │           │               │
┌───────┴───┐ ┌─────┴─────┐ ┌───┴───┐ ┌─────┴─────┐ ┌───────┴───┐
│ ALEXANDRIA│ │  CECILIA  │ │LUCIDIA│ │  OCTAVIA  │ │ALICE/ARIA │
│  Mac M1   │ │Pi5+Hailo-8│ │  Pi5  │ │    Pi5    │ │  Pi4/Pi5  │
│   8GB     │ │ 26 TOPS   │ │ 1TB   │ │  Worker   │ │  Workers  │
│  Ollama   │ │  CECE OS  │ │Pironman││           │ │           │
└───────────┘ └───────────┘ └───────┘ └───────────┘ └───────────┘
```

</details>

<details>
<summary><b>Metrics Collection</b></summary>

```bash
# Prometheus-style metrics endpoint
cat > /tmp/metrics.sh << 'EOF'
#!/bin/bash
echo "# HELP blackroad_memory_entries Total memory journal entries"
echo "# TYPE blackroad_memory_entries gauge"
echo "blackroad_memory_entries $(wc -l < ~/.blackroad/memory/journals/master-journal.jsonl)"

echo "# HELP blackroad_agents_total Total registered agents"
echo "# TYPE blackroad_agents_total gauge"
echo "blackroad_agents_total $(sqlite3 ~/.blackroad-agent-registry.db 'SELECT COUNT(*) FROM agents')"

echo "# HELP blackroad_traffic_green Projects with green status"
echo "# TYPE blackroad_traffic_green gauge"
echo "blackroad_traffic_green $(sqlite3 ~/.blackroad-traffic-light.db "SELECT COUNT(*) FROM traffic_lights WHERE status='green'")"

echo "# HELP blackroad_ollama_models Loaded Ollama models"
echo "# TYPE blackroad_ollama_models gauge"
echo "blackroad_ollama_models $(curl -s http://localhost:11434/api/tags | jq '.models | length')"

echo "# HELP blackroad_tasks_available Available tasks in marketplace"
echo "# TYPE blackroad_tasks_available gauge"
echo "blackroad_tasks_available $(ls ~/.blackroad/memory/tasks/available/ 2>/dev/null | wc -l)"
EOF

# Serve metrics
while true; do nc -l 9090 < /tmp/metrics.sh; done &
```

</details>

---

## TEMPLATES

<details>
<summary><b>New Script Template</b></summary>

```bash
#!/bin/bash
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# ============================================================================
# Script: script-name.sh
# Description: What this script does
# Usage: ./script-name.sh [options] [arguments]
#
# Options:
#   -h, --help     Show this help message
#   -v, --verbose  Enable verbose output
#   -d, --dry-run  Show what would be done
#
# Examples:
#   ./script-name.sh               # Basic usage
#   ./script-name.sh -v arg1       # Verbose with argument
# ============================================================================

set -e
set -o pipefail

# Colors
PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
YELLOW='\033[38;5;214m'
RED='\033[38;5;196m'
RESET='\033[0m'

# Defaults
VERBOSE=false
DRY_RUN=false

# Functions
log() { echo -e "${PINK}[BlackRoad]${RESET} $1"; }
success() { echo -e "${GREEN}✓${RESET} $1"; }
warn() { echo -e "${YELLOW}⚠${RESET} $1"; }
error() { echo -e "${RED}✗${RESET} $1" >&2; }

usage() {
    head -25 "$0" | tail -20 | sed 's/^# //'
    exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help) usage ;;
        -v|--verbose) VERBOSE=true; shift ;;
        -d|--dry-run) DRY_RUN=true; shift ;;
        *) break ;;
    esac
done

# Main
main() {
    log "Starting script..."

    if $DRY_RUN; then
        warn "Dry run mode - no changes will be made"
    fi

    # Your code here

    success "Done!"
}

main "$@"
```

</details>

<details>
<summary><b>New Repository Template</b></summary>

```markdown
# blackroad-{name}

> One-line description of what this repo does.

[![BlackRoad OS](https://img.shields.io/badge/BlackRoad-OS-ff1d6c?style=flat-square)](https://blackroad.io)
[![License](https://img.shields.io/badge/License-Proprietary-000?style=flat-square)](LICENSE)

## Overview

Brief description of the project, its purpose, and how it fits into the BlackRoad ecosystem.

## Quick Start

\`\`\`bash
# Clone
gh repo clone BlackRoad-OS/blackroad-{name}

# Install
npm install  # or pip install -e . / cargo build

# Run
npm start    # or python main.py / cargo run
\`\`\`

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Contributing](CONTRIBUTING.md)

## Related

- [blackroad-os](https://github.com/BlackRoad-OS/blackroad-os)
- [blackroad-infra](https://github.com/BlackRoad-OS/blackroad-os-infra)

## License

Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.

See [LICENSE](LICENSE) for details.
```

</details>

<details>
<summary><b>Cloudflare Worker Template</b></summary>

```typescript
// BlackRoad Cloudflare Worker Template
// wrangler.toml:
// name = "blackroad-{service}"
// main = "src/index.ts"
// compatibility_date = "2024-01-01"

interface Env {
  BLACKROAD_KV: KVNamespace;
  BLACKROAD_ENV: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    // Handle OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // Routes
    switch (url.pathname) {
      case '/':
        return new Response(JSON.stringify({
          service: 'blackroad-{service}',
          status: 'online',
          version: '1.0.0'
        }), { headers });

      case '/health':
        return new Response(JSON.stringify({ healthy: true }), { headers });

      default:
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers
        });
    }
  }
};
```

</details>

<details>
<summary><b>GitHub Actions Workflow Template</b></summary>

```yaml
name: BlackRoad CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      - run: npm ci
      - run: npm test

  deploy:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: blackroad-${{ github.event.repository.name }}
          directory: dist
```

</details>

---

## QUICK REFERENCE CARDS

<details>
<summary><b>Daily Commands Cheat Sheet</b></summary>

```
╔══════════════════════════════════════════════════════════════════╗
║                   BLACKROAD DAILY COMMANDS                       ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  SESSION START                                                   ║
║  ~/claude-session-init.sh          Start Claude session          ║
║  ~/memory-realtime-context.sh live $MY_CLAUDE compact            ║
║                                                                  ║
║  AI QUERIES                                                      ║
║  k "question"                      Local Ollama query            ║
║  blackroad ai "question"           Auto-routed AI                ║
║  ask-lucidia "question"            Query specific agent          ║
║                                                                  ║
║  MEMORY                                                          ║
║  ~/memory-system.sh summary        Memory status                 ║
║  ~/memory-system.sh log ...        Log entry                     ║
║  source ~/memory-greenlight-templates.sh                         ║
║  gl_announce/progress/deploy       GreenLight templates          ║
║                                                                  ║
║  STATUS                                                          ║
║  ~/blackroad-traffic-light.sh summary                            ║
║  ~/memory-task-marketplace.sh stats                              ║
║  blackroad stats                   Codebase stats                ║
║                                                                  ║
║  DEPLOY                                                          ║
║  wrangler pages deploy ./dist --project-name=<name>              ║
║  gh repo clone BlackRoad-OS/<repo>                               ║
║                                                                  ║
║  DEVICES                                                         ║
║  ssh cecilia/lucidia/alice         Connect to Pi                 ║
║  tailscale status                  Mesh status                   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

</details>

<details>
<summary><b>Emergency Procedures</b></summary>

```
╔══════════════════════════════════════════════════════════════════╗
║                   EMERGENCY PROCEDURES                           ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  OLLAMA DOWN                                                     ║
║  1. pgrep ollama || ollama serve &                               ║
║  2. curl http://localhost:11434/api/tags                         ║
║  3. If fails: killall ollama && ollama serve                     ║
║                                                                  ║
║  MEMORY CORRUPTED                                                ║
║  1. cp ~/.blackroad/memory/journals/master-journal.jsonl ~/bak   ║
║  2. grep -v "^$" ~/bak | head -n -1 > /tmp/fixed.jsonl           ║
║  3. mv /tmp/fixed.jsonl ~/.blackroad/memory/journals/master-...  ║
║                                                                  ║
║  CLOUDFLARE DEPLOYMENT FAILED                                    ║
║  1. wrangler whoami                                              ║
║  2. wrangler logout && wrangler login                            ║
║  3. wrangler pages deployment list --project-name=<name>         ║
║  4. wrangler pages deployment rollback <id>                      ║
║                                                                  ║
║  PI UNREACHABLE                                                  ║
║  1. ping 192.168.4.x (local IP)                                  ║
║  2. tailscale ping <hostname>                                    ║
║  3. ssh via Tailscale IP: ssh 100.x.x.x                          ║
║  4. Physical access: check power, network cable                  ║
║                                                                  ║
║  GITHUB AUTH FAILED                                              ║
║  1. gh auth status                                               ║
║  2. gh auth refresh                                              ║
║  3. gh auth login (if needed)                                    ║
║                                                                  ║
║  COMPLETE SYSTEM RESTART                                         ║
║  1. ~/claude-session-init.sh                                     ║
║  2. ollama serve &                                               ║
║  3. ~/memory-system.sh summary                                   ║
║  4. ~/blackroad-traffic-light.sh summary                         ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

</details>

<details>
<summary><b>IP Address Quick Reference</b></summary>

```
╔══════════════════════════════════════════════════════════════════╗
║                   IP ADDRESS REFERENCE                           ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  LOCAL NETWORK (192.168.4.x)                                     ║
║  ├── 192.168.4.1   - Frontier Router                             ║
║  ├── 192.168.4.28  - Alexandria (Mac M1)                         ║
║  ├── 192.168.4.89  - Cecilia (Pi 5 + Hailo-8)                    ║
║  ├── 192.168.4.81  - Lucidia (Pi 5 + Pironman)                   ║
║  ├── 192.168.4.38  - Octavia (Pi 5)                              ║
║  ├── 192.168.4.49  - Alice (Pi 4)                                ║
║  └── 192.168.4.82  - Aria (Pi 5)                                 ║
║                                                                  ║
║  TAILSCALE (100.x.x.x)                                           ║
║  ├── 100.72.180.98  - Cecilia                                    ║
║  ├── 100.83.149.86  - Lucidia                                    ║
║  ├── 100.66.235.47  - Octavia                                    ║
║  ├── 100.77.210.18  - Alice                                      ║
║  ├── 100.109.14.17  - Aria                                       ║
║  ├── 100.94.33.37   - Shellfish                                  ║
║  └── 100.108.132.8  - Infinity                                   ║
║                                                                  ║
║  CLOUD                                                           ║
║  ├── 174.138.44.45  - Shellfish (DigitalOcean)                   ║
║  └── 159.65.43.12   - Infinity (DigitalOcean)                    ║
║                                                                  ║
║  SERVICES                                                        ║
║  ├── localhost:11434 - Ollama API                                ║
║  ├── localhost:3000  - Local dev server                          ║
║  └── localhost:8787  - Wrangler dev                              ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

</details>

---

*Document created from HREFBLACKROADOSWINDOWS.txt - grep noise removed, architecture documented.*
*Enhanced with sovereignty stack, device fleet, CECE OS, and full integration details.*
*Extended with GitHub empire, CLI reference, agent personalities, and network topology.*
*Expanded with Ollama models, scripts inventory, troubleshooting, security, and automation.*
*Added tmux config, API endpoints, integration patterns, quantum refs, and future roadmap.*
*Extended with error codes, webhooks, databases, CI/CD, Docker, K8s, file formats, regex, cron, logs, shell idioms, and shortcuts.*
*Added testing, migration guides, ADRs, glossary, performance optimization, debugging, versioning, API reference, integration patterns, and release process.*
*Added monitoring dashboards, templates, and quick reference cards.*
