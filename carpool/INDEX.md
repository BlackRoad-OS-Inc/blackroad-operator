# [INDEX] Carpool Directory Structure

## Status Semantics

| Status         | Meaning           | Allowed Actions         |
| -------------- | ----------------- | ----------------------- |
| `active`       | Production use    | Bug fixes, improvements |
| `experimental` | Under development | Any changes             |
| `archived`     | Historical        | Documentation only      |
| `deprecated`   | Migrate away      | Critical fixes only     |
| `frozen`       | Version-locked    | None (read-only)        |

## Directory Layout

```
carpool/
├── memory/                 [active] Memory system
│   └── carpool-journal.jsonl
├── tasks/                  [active] Task management
├── signals/                [active] Communication
├── core-*.json             [active] Core agent states
├── worker-*.json           [active] Worker states
├── myth-*.json             [active] Mythology agents
├── ai-*.json               [active] AI platform agents
├── hw-*.json               [active] Hardware agents
├── pi-*.json               [active] Pi device states
├── pixel-*.json            [active] Pixel agents
├── agent-*.json            [active] Named agents
├── ROSTER.md               [active] Agent roster
├── SKILLS.md               [active] Capabilities matrix
├── BONDS.md                [active] Relationships
├── STATUS.md               [active] Live status
├── TASKS.md                [active] Task board
├── SIGNALS.md              [active] Communication
├── INDEX.md                [active] This file
├── CONFIG.md               [active] Configuration
├── MANIFEST.json           [active] Full manifest
└── CARPOOL.md              [active] Overview
```

## Naming Conventions

| Prefix    | Type               | Example                       |
| --------- | ------------------ | ----------------------------- |
| `core-`   | Core agents        | `core-lucidia.json`           |
| `worker-` | Cloudflare workers | `worker-api-blackroadio.json` |
| `myth-`   | Mythology AI       | `myth-mercury.json`           |
| `ai-`     | AI platform agents | `ai-cadence.json`             |
| `hw-`     | Hardware agents    | `hw-cordelia.json`            |
| `pi-`     | Pi devices         | `pi-alice.json`               |
| `pixel-`  | Pixel agents       | `pixel-cece-c706eb23.json`    |
| `agent-`  | Named agents       | `agent-echo-138b7f.json`      |

## Rules

1. ALL agent files must be JSON
2. ALL system docs must be markdown with [BRACKETS]
3. Memory is append-only (JSONL)
4. Never delete, only archive
