# BlackRoad Models

**Model Sovereignty System for BlackRoad OS**

This repository manages BlackRoad's model intellectual property:
- **Forkies** - Version-pinned upstream open-source models
- **Research Models** - Active experiments and fine-tuning
- **Internal Models** - Production-ready, internal use only
- **Production Models** - Customer-facing with SLAs

---

## Quick Start

### Fork a Model
```bash
python3 tools/fork.py meta-llama/Llama-3.1-8B-Instruct --version v1.0.0
```

### List Models
```bash
python3 tools/registry.py list --stage internal
```

### Check Access
```bash
python3 tools/registry.py check-access internal/my-model service-id
```

---

## Repository Structure

```
blackroad-models/
├── forkies/          # Upstream snapshots (read-only)
├── research/         # Experiments (90-day lifecycle)
├── internal/         # Validated internal models
├── production/       # Customer-facing models
├── deprecated/       # Archived models (2-year retention)
├── serving/          # Serving configs (vLLM, Ollama, Railway)
├── evals/            # Evaluation harnesses
├── tools/            # CLI tools
├── registry/         # Model metadata (YAML)
└── logs/             # Audit logs
```

---

## Core Principles

1. **Models are IP, not infrastructure**
2. **Fork with purpose** - Every model has clear ownership
3. **Lifecycle discipline** - Research → Internal → Production
4. **Access control** - Explicit allow lists, audit logging
5. **Lineage tracking** - Complete derivation graphs

---

## CLI Tools

| Tool | Purpose |
|------|---------|
| `fork.py` | Create Forkie from upstream |
| `create.py` | Start research experiment |
| `eval.py` | Run evaluation suite |
| `promote.py` | Promote to next stage |
| `serve.py` | Start model server |
| `registry.py` | Query model registry |

---

## Lifecycle

```
┌──────────┐
│  Forkie  │ (Upstream snapshot, read-only)
└────┬─────┘
     │ fork + experiment
     ▼
┌──────────┐
│ Research │ (90 days, single owner)
└────┬─────┘
     │ eval + validate
     ▼
┌──────────┐
│ Internal │ (Production-ready, internal use)
└────┬─────┘
     │ customer-facing decision
     ▼
┌────────────┐
│ Production │ (Customer-facing, SLA)
└────────────┘
```

---

## Documentation

- **[MODELS.md](MODELS.md)** - Complete architecture
- **[WORKFLOW.md](WORKFLOW.md)** - End-to-end guide
- **[30-DAY PLAN](MODEL_SOVEREIGNTY_30DAY_PLAN.md)** - Implementation plan

---

## Current Inventory

**Forkies:** 0
**Research:** 0
**Internal:** 0
**Production:** 0

(Day 1 - just getting started! 🚀)

---

## Contact

**Owner:** BlackRoad Platform Architecture
**Email:** blackroad.systems@gmail.com
**GitHub:** https://github.com/BlackRoad-OS/blackroad-models

---

**Status:** 🚧 Day 1 - Foundation Phase

---

## 📜 License & Copyright

**Copyright © 2026 BlackRoad OS, Inc. All Rights Reserved.**

**CEO:** Alexa Amundson | **PROPRIETARY AND CONFIDENTIAL**

This software is NOT for commercial resale. Testing purposes only.

### 🏢 Enterprise Scale:
- 30,000 AI Agents
- 30,000 Human Employees
- CEO: Alexa Amundson

**Contact:** blackroad.systems@gmail.com

See [LICENSE](LICENSE) for complete terms.
