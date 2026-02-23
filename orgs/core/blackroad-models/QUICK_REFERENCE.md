# 🎯 BlackRoad Models - Quick Reference Card

**Status:** ✅ 11 Forkies, 1 Internal Model, Production-Ready Infrastructure
**Date:** 2025-12-15

---

## 📦 Model Registry Summary

```
Forkies:   11  ✅ (upstream snapshots, never served)
Research:   1  ✅ (blackroad-coder-lora - LoRA experiment)
Internal:   1  ✅ (blackroad-coder-7b v1 - ready to deploy!)
Production: 0  ⏳ (pending customer demand)
───────────────
Total:     13  models in registry
```

---

## 🚀 Quick Commands

### Check Registry
```bash
cd /Users/alexa/blackroad-models
python3 tools/registry.py list                    # All models
python3 tools/registry.py list --stage forkie     # Just Forkies
python3 tools/registry.py list --stage internal   # Deployable models
```

### Fork a New Model
```bash
python3 tools/fork.py <org>/<model-name> --version <version>

# Example:
python3 tools/fork.py meta-llama/Llama-3.1-70B-Instruct --version v1.0.0
```

### Promote a Model
```bash
python3 tools/promote.py <source-path> <target-stage> [--name <new-name>] [--yes]

# Example: Research → Internal
python3 tools/promote.py research/alexa/finance-analyst-lora internal \
  --name blackroad-finance-analyst --yes
```

### Check Lineage
```bash
cat internal/blackroad-coder-7b-v1/LINEAGE.md
```

---

## 🏗️ 11 Forkies by Size

### 🟢 Small (7B-14B) - 5 models
Fast, efficient, edge-deployable
```
- Qwen 2.5 Coder 7B       (Apache 2.0)
- Llama 3.1 8B            (Llama Community)
- DeepSeek-Math 7B        (MIT)
- Mistral 7B v0.3         (Apache 2.0)
- Qwen 2.5 Coder 14B      (Apache 2.0)
```

### 🟡 Medium (32B-47B) - 3 models
High-quality, moderate cost
```
- Qwen 2.5 32B            (Apache 2.0)
- DeepSeek-Coder 33B      (MIT)
- Mixtral 8x7B            (Apache 2.0, 47B effective)
```

### 🔴 Large (70B+) - 3 models
State-of-art, premium
```
- Llama 3.1 70B           (Llama Community)
- Qwen 2.5 72B            (Apache 2.0)
- Mixtral 8x22B           (Apache 2.0, 141B effective)
```

---

## 📋 11 Forkies by License

### Apache 2.0 (7 models) ✅
Most permissive, commercial-friendly
```
Qwen 2.5 Coder 7B, Qwen 2.5 32B, Qwen 2.5 Coder 14B,
Qwen 2.5 72B, Mixtral 8x7B, Mixtral 8x22B, Mistral 7B
```

### MIT (2 models) ✅
Very permissive, minimal restrictions
```
DeepSeek-Math 7B, DeepSeek-Coder 33B
```

### Llama 3.1 Community (2 models) ✅
BlackRoad compliant (< 700M MAU)
```
Llama 3.1 8B, Llama 3.1 70B
```

---

## 🎯 Planned Proprietary Models (From Forkies)

| # | Model Name | Base Forkie | Domain | Status |
|---|------------|-------------|--------|--------|
| 1 | blackroad-coder-7b | Qwen Coder 7B | Code | ✅ Internal v1 |
| 2 | blackroad-finance-analyst | Llama 70B | Finance | ⏳ Planned |
| 3 | blackroad-legal-reasoning | Llama 70B | Legal | ⏳ Planned |
| 4 | blackroad-portfolio-calculator | DeepSeek-Math 7B | Finance | ⏳ Planned |
| 5 | blackroad-contract-analyzer | Mixtral 8x22B | Legal | ⏳ Planned |
| 6 | blackroad-research-assistant | Qwen 32B | Research | ⏳ Planned |
| 7 | blackroad-citation-expert | Mistral 7B | Research | ⏳ Planned |
| 8 | blackroad-creative-writer | Llama 70B | Creative | ⏳ Planned |
| 9 | blackroad-polyglot-creator | Qwen Coder 14B | Creative | ⏳ Planned |
| 10 | blackroad-infra-coder | Qwen Coder 14B | DevOps | ⏳ Planned |
| 11 | blackroad-systems-coder | DeepSeek-Coder 33B | DevOps | ⏳ Planned |
| 12 | blackroad-os-brain | Qwen 72B | Multi-domain | ⏳ Planned |
| 13 | blackroad-truth-verifier | Llama 70B | Cross-domain | ⏳ Planned |

**Timeline:** 3-6 months to train and promote all 13 models

---

## 💰 Cost Quick Reference

### Forking (One-Time)
```
Small (7B):    $25 each     → 5 models = $125
Medium (32B):  $40 each     → 3 models = $120
Large (70B+):  $65 each     → 3 models = $195
                             ───────────────
Total One-Time:              $440
```

### Serving (Monthly, Optimized)
```
Without Multi-LoRA:    $1,350/month (11 separate servers)
With Multi-LoRA:       $700/month   (6 shared base models)
                       ─────────────
Savings:               $650/month (48% reduction!)
```

---

## 🔐 Legal Compliance Checklist

For every Forkie:
- ✅ Permissive license (Apache 2.0, MIT, or Llama Community)
- ✅ Commercial use allowed
- ✅ Derivatives allowed
- ✅ Attribution preserved (LINEAGE.md)
- ❌ No GPL (viral copyleft)
- ❌ No CC-BY-NC (non-commercial)
- ❌ No research-only restrictions

**Result:** All 11 Forkies are safe for BlackRoad proprietary models!

---

## 📚 Key Documentation

```
MODELS.md                       12,000+ lines - Complete architecture
MODEL_SOVEREIGNTY_30DAY_PLAN.md  4,000+ lines - Implementation roadmap
AGENT_APPROVED_MODELS.md           350+ lines - Curated safe models
DOMAIN_MODEL_ROADMAP.md            460+ lines - Pack-to-model mapping
GPT_STYLE_OSS_RESEARCH.md          400+ lines - Why modern > GPT
FORKIES_COMPLETE_SUMMARY.md        600+ lines - Final inventory
QUICK_REFERENCE.md               (this file) - Quick commands
```

**Total:** 17,000+ lines of documentation

---

## 🎯 Model Lifecycle Stages

```
Forkie (upstream snapshot)
  ↓ [fork.py]
  ├─ Never served directly
  ├─ Version-pinned snapshot
  └─ IP boundary protection

Research (fine-tuning experiments)
  ↓ [LoRA training, 90-day max]
  ├─ Multiple experiments per Forkie
  ├─ Evaluation required (HumanEval >= 70%)
  └─ No collisions (multi-agent parallel)

Internal (staging deployment)
  ↓ [promote.py, 14-day staging]
  ├─ Service whitelist access
  ├─ No SLA (best-effort)
  └─ Performance monitoring

Production (customer-facing)
  ↓ [Legal approval + SLA]
  ├─ Customer demand required
  ├─ SLA enforced (uptime, latency)
  └─ Premium serving infrastructure
```

---

## 🔌 Agent Integration

### Model Router
**File:** `blackroad-sandbox/src/blackroad_core/model_router.py`

```python
from blackroad_core.model_router import ModelRouter

router = ModelRouter()

# Select by capability
model_config = router.select_model('code-generation', agent_id='deploy-bot')

# Generate
response = await router.generate(
    messages=[...],
    capability='code-generation',
    agent_id='deploy-bot'
)
```

### Agent Spawner
**File:** `blackroad-sandbox/src/blackroad_core/spawner.py`

```python
from blackroad_core.spawner import AgentSpawner, SpawnRequest
from blackroad_core.agents import RuntimeType

spawner = AgentSpawner(lucidia, event_bus, capability_registry)

agent_id = await spawner.spawn_agent(SpawnRequest(
    role="Financial Analyst",
    capabilities=["financial-analysis"],
    runtime_type=RuntimeType.LLM_BRAIN,
    pack="pack-finance"
))
```

---

## 🎉 Current Achievement

**What We Built:**
- ✅ 11 legally-safe Forkies (Apache 2.0, MIT, Llama Community)
- ✅ 1 research model (blackroad-coder-lora with LoRA fine-tuning)
- ✅ 1 internal model (blackroad-coder-7b v1, deployable!)
- ✅ Complete infrastructure (registry, tools, serving configs)
- ✅ Model router with capability-based selection
- ✅ Agent spawner integration
- ✅ 17,000+ lines of documentation

**What's Next:**
- ⏳ Train 12 more research models (one per domain)
- ⏳ Promote to internal (14-day staging)
- ⏳ Deploy multi-LoRA servers (cost optimization)
- ⏳ Production when customer demand exists

---

**Maintained By:** BlackRoad Platform Architecture
**Last Updated:** 2025-12-15
**Status:** 🎉 Forkies Collection Complete!

**Questions?** blackroad.systems@gmail.com
