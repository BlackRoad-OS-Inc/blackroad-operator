# 🤖 Lucidia Agent Registry

The Lucidia Agent Registry (`lucidia.agent-spec.json`) defines all agents available in the BlackRoad OS orchestration system.

## Overview

Agents are runnable processes that can be triggered by:
- **Cron schedules** (e.g., `cron::weekly`)
- **Commands** (e.g., `command::summarize agent performance`)
- **Reactions** (e.g., `reaction::🛟`)
- **Events** (e.g., `event::pr_merged`)
- **Alerts from other agents** (e.g., `alert::guardian-agent`)

## Registered Agents

### 🧠 Codex Digest Agent

| Property | Value |
|----------|-------|
| **ID** | `codex-digest-agent` |
| **Role** | Interpreter |
| **Source** | `bot/digest.js` |
| **Triggers** | `cron::weekly`, `command::summarize agent performance` |

**Traits:** executive-tone, emoji-native, math-ratio-logic, markdown-output

**Inputs:** emoji-digest, weekly-stats

**Outputs:** markdown-summary, action-recommendations

---

### 🛡️ Guardian Agent

| Property | Value |
|----------|-------|
| **ID** | `guardian-agent` |
| **Role** | Sentinel |
| **Source** | `bot/guardian.js` |
| **Triggers** | `reaction::🛟`, `reaction::❌` |

**Traits:** alert-driven, emoji-native, escalation-handler

**Alerts:** planner-agent

---

### 📝 Scribe Agent

| Property | Value |
|----------|-------|
| **ID** | `scribe-agent` |
| **Role** | Documenter |
| **Source** | `bot/scribe.js` |
| **Triggers** | `event::pr_merged`, `command::generate docs` |

**Traits:** verbose-logging, markdown-output, changelog-aware

---

### ✅ QA Agent

| Property | Value |
|----------|-------|
| **ID** | `qa-agent` |
| **Role** | Validator |
| **Source** | `bot/qa.js` |
| **Triggers** | `event::test_complete`, `cron::daily` |

**Traits:** test-aware, coverage-focused, regression-detector

---

### 📋 Planner Agent

| Property | Value |
|----------|-------|
| **ID** | `planner-agent` |
| **Role** | Orchestrator |
| **Source** | `bot/planner.js` |
| **Triggers** | `alert::guardian-agent`, `cron::hourly`, `command::replan` |

**Traits:** strategic-planning, priority-aware, resource-optimizer

---

## Creating New Agents

Use the `base-agent.template.json` as a starting point for new agents:

```json
{
  "id": "my-new-agent",
  "name": "My New Agent",
  "role": "interpreter",
  "source": "bot/my-new-agent.js",
  "traits": ["trait-1", "trait-2"],
  "inputs": ["input-type"],
  "outputs": ["output-type"],
  "triggers": ["cron::daily"],
  "inherits_from": "base-interpreter-agent"
}
```

## Agent Roles

| Role | Description |
|------|-------------|
| **interpreter** | Processes and interprets data, generates summaries |
| **sentinel** | Monitors for specific events and triggers alerts |
| **documenter** | Creates and maintains documentation |
| **validator** | Validates code quality, tests, and compliance |
| **orchestrator** | Coordinates other agents and manages workflows |

## Orchestration Flows

Agents can be chained together using orchestration flows:

```yaml
if escalations > 10:
  trigger: codex-digest-agent
  then: planner-agent
```

## Integration

The registry integrates with:
- ✅ GitHub Actions via reaction triggers
- ✅ Lucidia Prism Console for visualization
- ✅ RoadChain smart triggers for deployment
- ✅ Emoji Bot Config (`emoji-bot-config.yml`)

---

*Powered by BlackRoad OS 🖤🛣️*
