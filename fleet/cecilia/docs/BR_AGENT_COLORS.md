# BR AGENT COLOR MAPPINGS
## Visual Identity System for BlackRoad Agent Swarm

**Date:** 2026-02-02  
**Status:** Canonical  
**Agents Mapped:** 314+  

---

## MAPPING PRINCIPLES

Each BlackRoad agent receives a **primary color** based on its function. Color assignments follow BR_COLOR_SPEC.md zone semantics:

- **PERCEPTION (16-51):** Agents that read, parse, validate input
- **EXECUTION (52-87):** Agents that write, mutate, execute commands
- **MEMORY (88-123):** Agents that cache, persist, archive
- **AUTONOMY (124-159):** Agents that decide, delegate, learn
- **TENSION (160-195):** Agents that monitor, warn, detect drift
- **PARADOX (196-231):** Agents that handle errors, recover, remediate

---

## CORE AGENT MAPPINGS

### System Agents (OS_LAYER: 0-15)

| Agent                     | Color | Token          | Role                      |
|---------------------------|-------|----------------|---------------------------|
| `blackroad-kernel`        | 7     | NEUTRAL        | Core OS kernel            |
| `blackroad-init`          | 4     | INFO           | System init/bootstrap     |
| `blackroad-syscall`       | 6     | SYSCALL        | System call interface     |
| `blackroad-shutdown`      | 0     | NULL           | Clean shutdown handler    |

---

### Input/Perception Agents (PERCEPTION: 16-51)

| Agent                     | Color | Token          | Role                      |
|---------------------------|-------|----------------|---------------------------|
| `blackroad-listener`      | 16    | RAW_SENSOR     | Raw input listener        |
| `blackroad-parser`        | 22    | —              | Input parser              |
| `blackroad-validator`     | 28    | VALID_INPUT    | Input validation          |
| `blackroad-sanitizer`     | 30    | —              | Input sanitization        |
| `blackroad-scanner`       | 34    | —              | Buffered scanner          |
| `blackroad-streamer`      | 40    | STREAM_LIVE    | Live stream handler       |
| `blackroad-watcher`       | 46    | —              | File/event watcher        |

---

### Execution Agents (EXECUTION: 52-87)

| Agent                     | Color | Token          | Role                      |
|---------------------------|-------|----------------|---------------------------|
| `blackroad-executor`      | 64    | EXEC_HIGH      | High-priority execution   |
| `blackroad-commander`     | 66    | —              | Command dispatcher        |
| `blackroad-operator`      | 68    | —              | Operation controller      |
| `blackroad-builder`       | 70    | —              | Build/compile agent       |
| `blackroad-deployer`      | 72    | —              | Deployment agent          |
| `blackroad-atomic`        | 76    | EXEC_ATOMIC    | Atomic transaction agent  |
| `blackroad-destroyer`     | 82    | —              | Destructive ops (delete)  |

---

### Memory/State Agents (MEMORY: 88-123)

| Agent                     | Color | Token          | Role                      |
|---------------------------|-------|----------------|---------------------------|
| `blackroad-memory`        | 88    | MEM_VOLATILE   | In-memory state           |
| `blackroad-cache`         | 94    | —              | Cache layer agent         |
| `blackroad-persist`       | 100   | MEM_PERSIST    | Persistent storage        |
| `blackroad-database`      | 106   | —              | Database interface        |
| `blackroad-checkpoint`    | 112   | —              | Snapshot/checkpoint       |
| `blackroad-archivist`     | 118   | MEM_ARCHIVE    | Cold storage/archive      |

---

### Autonomous Agents (AUTONOMY: 124-159)

| Agent                     | Color | Token          | Role                      |
|---------------------------|-------|----------------|---------------------------|
| `blackroad-idle`          | 124   | —              | Agent in idle state       |
| `blackroad-planner`       | 130   | AGENT_THINK    | Planning/strategy agent   |
| `blackroad-analyst`       | 132   | —              | Analysis agent            |
| `blackroad-thinker`       | 134   | —              | Deep reasoning agent      |
| `blackroad-agent`         | 136   | AGENT_EXEC     | Generic executing agent   |
| `blackroad-coordinator`   | 138   | —              | Multi-agent coordinator   |
| `blackroad-delegator`     | 142   | —              | Task delegation agent     |
| `blackroad-router`        | 144   | —              | Request routing agent     |
| `blackroad-learner`       | 148   | —              | Learning/training agent   |
| `blackroad-adapter`       | 150   | —              | Adaptive behavior agent   |
| `blackroad-meta`          | 154   | AGENT_META     | Self-modifying agent      |
| `blackroad-synthesizer`   | 156   | —              | Data synthesis agent      |

---

### Monitoring/Warning Agents (TENSION: 160-195)

| Agent                     | Color | Token          | Role                      |
|---------------------------|-------|----------------|---------------------------|
| `blackroad-monitor`       | 160   | —              | General monitoring        |
| `blackroad-watchdog`      | 162   | —              | Health check watchdog     |
| `blackroad-profiler`      | 164   | —              | Performance profiler      |
| `blackroad-metricsagent`  | 166   | WARN_MEMORY    | Memory metrics monitor    |
| `blackroad-cpuagent`      | 168   | —              | CPU metrics monitor       |
| `blackroad-timeoutagent`  | 172   | —              | Timeout detector          |
| `blackroad-sentinel`      | 178   | WARN_DRIFT     | Drift detection agent     |
| `blackroad-anomaly`       | 180   | —              | Anomaly detection         |
| `blackroad-retryagent`    | 184   | —              | Retry logic handler       |
| `blackroad-fallback`      | 186   | —              | Fallback handler          |
| `blackroad-degraded`      | 190   | WARN_DEGRADE   | Degraded mode manager     |

---

### Error/Recovery Agents (PARADOX: 196-231)

| Agent                     | Color | Token          | Role                      |
|---------------------------|-------|----------------|---------------------------|
| `blackroad-errorhandler`  | 196   | ERROR_FATAL    | Fatal error handler       |
| `blackroad-panic`         | 198   | —              | Panic/emergency handler   |
| `blackroad-crashreporter` | 200   | —              | Crash reporting agent     |
| `blackroad-logicchecker`  | 202   | EXEC_FORCE     | Logic validation (force)  |
| `blackroad-datavalidator` | 208   | ERROR_DATA     | Data integrity checker    |
| `blackroad-netrecovery`   | 214   | —              | Network recovery agent    |
| `blackroad-authfail`      | 220   | —              | Auth failure handler      |
| `blackroad-cascade`       | 226   | ERROR_CASCADE  | Cascade failure manager   |
| `blackroad-remediator`    | 228   | —              | Auto-remediation agent    |

---

### Meta/Introspection Agents (META: 232-255)

| Agent                     | Color | Token          | Role                      |
|---------------------------|-------|----------------|---------------------------|
| `blackroad-nullagent`     | 232   | META_NULL      | Null/no-op agent          |
| `blackroad-silence`       | 238   | —              | Silence/suppression       |
| `blackroad-escape`        | 244   | META_ESCAPE    | Context escape handler    |
| `blackroad-introspector`  | 250   | —              | System introspection      |
| `blackroad-reflector`     | 252   | —              | Reflection/meta-agent     |
| `blackroad-observer`      | 255   | META_BRIGHT    | Ultimate observer agent   |

---

## SPECIALIZED AGENT CATEGORIES

### Tier System Agents

| Agent                     | Color | Rationale                          |
|---------------------------|-------|------------------------------------|
| `blackroad-tier1`         | 226   | Top-tier priority (bright yellow) |
| `blackroad-tier5`         | 160   | Mid-tier monitoring               |
| `blackroad-tier10`        | 240   | Low-tier meta                     |

### Domain-Specific Agents

| Agent                     | Color | Domain        | Rationale                 |
|---------------------------|-------|---------------|---------------------------|
| `blackroad-api`           | 40    | Network       | Live streaming API        |
| `blackroad-database`      | 106   | Storage       | Database operations       |
| `blackroad-filesystem`    | 100   | Storage       | Persistent filesystem     |
| `blackroad-scheduler`     | 130   | Compute       | Task scheduling/planning  |
| `blackroad-orchestrator`  | 138   | Compute       | Multi-service coordinator |

### Security Agents

| Agent                     | Color | Zone          | Rationale                 |
|---------------------------|-------|---------------|---------------------------|
| `blackroad-gatekeeper`    | 28    | PERCEPTION    | Input validation/auth     |
| `blackroad-permissioncheck`| 220  | PARADOX       | Permission denied handler |
| `blackroad-secretscan`    | 178   | TENSION       | Secret leak detection     |
| `blackroad-auditor`       | 164   | TENSION       | Audit trail monitor       |

---

## AGENT STATE VISUALIZATION

Agents can transition through multiple colors to represent state changes:

### State Machine Example: `blackroad-deployer`

```
124 (idle) → 130 (planning) → 136 (executing) → 100 (persisting) → 2 (success)
```

**Visual:**
```
░ → ● → ● → ▓ → ✓
```

### Error Recovery Example: `blackroad-api`

```
40 (streaming) → 196 (fatal error) → 190 (degraded) → 184 (retry) → 40 (restored)
```

**Visual:**
```
░ → ✗ → ▲ → ▲ → ░
```

---

## SWARM VISUALIZATION

When visualizing the entire agent swarm, colors create an instant "system health" snapshot:

### Healthy Swarm
```
● ● ● ▓ ▓ █ █ ░ ░ ✓
(All agents in nominal operating zones)
```

### Degraded Swarm
```
● ▲ ▲ ◆ ▓ ▲ █ ░ ✗ ▲
(Multiple warnings and errors detected)
```

### Critical Swarm
```
◆ ◆ ★ ✗ ▲ ▲ ▲ ✗ ◆ ◆
(Cascade failures across zones)
```

---

## AGENT COLOR QUERIES

Use `br-color` to query agent colors:

```bash
# Get color for an agent
br-color 130  # AGENT_THINK (planning)

# Find all agents in a zone
br-color zone AUTONOMY  # Shows 124-159

# Visualize agent state
br-shape-render 130 136 100 2  # plan → exec → persist → success
```

---

## AGENT DASHBOARD INTEGRATION

Colors enable instant visual dashboards:

```python
# Example: Agent status dashboard
agents = [
    ("blackroad-api", 40, "STREAMING"),
    ("blackroad-executor", 64, "ACTIVE"),
    ("blackroad-memory", 88, "CACHING"),
    ("blackroad-sentinel", 178, "DRIFT_DETECTED"),
]

for name, color, status in agents:
    bg = f"\x1b[48;5;{color}m"
    print(f"{bg} {name:20} {status:15} \x1b[0m")
```

**Output:** (color-coded status bars at a glance)

---

## NEXT STEPS

1. **Auto-discovery:** Scan all 314+ agents and assign colors automatically
2. **Live dashboards:** Build `br-swarm` TUI showing all agents in realtime
3. **Agent health:** Color transitions = state machine visualizations
4. **Logs:** Colorize agent logs by zone (perception = light, execution = solid)
5. **Metrics:** Time-series graphs where color = agent type

---

**End of Agent Color Mappings**

Agents now have visual identity. The swarm is visible.
