# BlackRoad Model Sovereignty Architecture

**Version:** 1.0
**Last Updated:** 2025-12-14
**Owner:** BlackRoad Platform Architecture

---

## Philosophy

**Models are intellectual property, not infrastructure.**

BlackRoad actively forks, fine-tunes, and evolves open-source AI models into proprietary assets. This is intentional platform strategy, not accidental sprawl.

### Core Principles

1. **Fork with Purpose** - Every forked model has a clear owner and evolution path
2. **Separation of Concerns** - Models ≠ Services. Weights ≠ APIs.
3. **IP Boundaries** - Upstream forks stay isolated from proprietary derivatives
4. **Multi-Agent Safety** - Defaults prevent accidental exposure or coupling
5. **Lifecycle Discipline** - Research → Internal → Production → Deprecated

---

## Model Taxonomy

### 1. Forkies (Upstream Inputs)

**Definition:** Version-pinned snapshots of open-source models used as upstream dependencies.

**Characteristics:**
- ✅ Reproducible (pinned commit/tag)
- ✅ Read-only after fork
- ✅ Never served directly to users
- ✅ May power many agents in parallel
- ❌ Never modified in-place
- ❌ Never exposed as public products

**Examples:**
```
forkies/llama-3.1-8b-instruct@v1.0.0
forkies/qwen-2.5-coder-7b@commit-a3f2b1
forkies/mixtral-8x7b-v0.1@hf-snapshot-2024-12-01
forkies/whisper-large-v3@openai-release-1.0
```

**Source Categories:**
- Open-source LLMs (Llama, Qwen, Mixtral, etc.)
- Multimodal models (CLIP, Whisper, vision transformers)
- Math/reasoning models (DeepSeek-Math, Llemma)
- Agent frameworks (AutoGPT, BabyAGI architectures)
- Control models (decision transformers, world models)

---

### 2. Research Models (Internal Experiments)

**Definition:** Experimental derivatives of Forkies undergoing active development.

**Characteristics:**
- 🔬 Under active experimentation
- 🔒 Not production-ready
- 👤 Single owner (person/team/agent)
- 📊 Evaluated but not validated
- ⏱️ Time-boxed (default: 90 days → promote or archive)

**Lifecycle:**
```
Forkie → Experiment → Eval → (Promote to Production | Archive)
```

**Examples:**
```
research/alexa/financial-analyst-llama-3.1-lora
research/agent-cece/legal-reasoning-qwen-merge
research/pack-finance/portfolio-advisor-v0.3-experimental
```

**Naming Convention:**
```
research/{owner}/{purpose}-{base-model}-{technique}
```

---

### 3. Internal Models (Validated, Not Public)

**Definition:** Production-quality models used internally across BlackRoad services/agents.

**Characteristics:**
- ✅ Production-ready performance
- ✅ Evaluated and validated
- ✅ May be served via internal APIs
- ✅ Cross-domain usage allowed
- ❌ Not exposed to external users
- ❌ Not marketed as products

**Examples:**
```
internal/blackroad-coder-7b-v1
internal/blackroad-finance-analyst-v2.1
internal/blackroad-legal-reasoning-v1.5
internal/blackroad-multimodal-planner-v1
```

**Promotion Criteria:**
- Passes domain-specific evals (>= baseline threshold)
- Deployed to staging for 14+ days without critical issues
- Approved by domain owner
- Documented usage guide

---

### 4. Production Models (Proprietary Assets)

**Definition:** BlackRoad's flagship proprietary models, served to customers or powering user-facing features.

**Characteristics:**
- 🚀 Customer-facing or revenue-generating
- 📄 Explicit licensing and usage terms
- 🔐 Access control enforced
- 📈 Performance SLAs defined
- 🧪 Continuous monitoring and evaluation

**Examples:**
```
production/blackroad-os-brain-v3.0
production/roadwork-job-matcher-v1.2
production/blackroad-truth-verifier-v2.5
```

**Naming Convention:**
```
production/{product-or-domain}-{purpose}-v{major}.{minor}
```

**SLA Requirements:**
- Uptime: 99.5%+
- Latency: p95 < 2s
- Accuracy: domain-specific baseline
- Incident response: < 1 hour

---

### 5. Deprecated Models (Archived)

**Definition:** Models removed from active use, retained for lineage and compliance.

**Characteristics:**
- 🗄️ Read-only archive
- 📜 Lineage preserved
- ❌ No serving infrastructure
- ❌ No active development

**Retention Policy:**
- Keep weights + configs for 2 years
- Keep eval results indefinitely
- Keep lineage graph indefinitely

---

## Repository Structure

### Monorepo Layout

```
blackroad-models/
├── forkies/                          # Upstream snapshots
│   ├── llama-3.1-8b-instruct/
│   │   ├── v1.0.0/                   # Version-pinned snapshot
│   │   │   ├── config.json
│   │   │   ├── tokenizer/
│   │   │   ├── weights/              # Symlink to blob storage
│   │   │   ├── LICENSE               # Upstream license
│   │   │   └── FORK.yaml             # Fork metadata
│   │   └── README.md
│   ├── qwen-2.5-coder-7b/
│   └── mixtral-8x7b-v0.1/
│
├── research/                         # Experiments (short-lived)
│   ├── alexa/
│   │   └── financial-analyst-llama-lora/
│   ├── agent-cece/
│   └── pack-finance/
│
├── internal/                         # Validated internal models
│   ├── blackroad-coder-7b/
│   │   ├── v1/
│   │   │   ├── config.json
│   │   │   ├── weights/
│   │   │   ├── eval_results/
│   │   │   ├── LINEAGE.md            # Derivation from Forkies
│   │   │   └── USAGE.md              # How to use
│   │   └── v2/
│   └── blackroad-finance-analyst/
│
├── production/                       # Customer-facing models
│   ├── blackroad-os-brain/
│   │   ├── v3.0/
│   │   │   ├── config.json
│   │   │   ├── weights/
│   │   │   ├── eval_results/
│   │   │   ├── SLA.md                # Performance SLA
│   │   │   ├── LICENSE.md            # BlackRoad proprietary
│   │   │   └── CHANGELOG.md
│   │   └── v2.5/                     # Previous version
│   └── roadwork-job-matcher/
│
├── deprecated/                       # Archived models
│   ├── internal/
│   └── production/
│
├── serving/                          # Model serving configs (separate!)
│   ├── vllm/
│   ├── ollama/
│   └── railway/
│
├── evals/                            # Evaluation harnesses
│   ├── finance/
│   ├── legal/
│   ├── coding/
│   └── reasoning/
│
├── tools/                            # Model management utilities
│   ├── fork.py                       # Fork upstream model
│   ├── promote.py                    # Promote research → internal → prod
│   ├── eval.py                       # Run evaluation suite
│   ├── serve.py                      # Start model server
│   └── registry.py                   # Model registry client
│
├── registry/                         # Model registry metadata
│   ├── forkies.yaml
│   ├── research.yaml
│   ├── internal.yaml
│   ├── production.yaml
│   └── lineage.yaml                  # Full derivation graph
│
└── README.md                         # This file
```

---

## Model Registry Schema

### Core Entity: `ModelRegistryEntry`

```yaml
# Example: internal/blackroad-coder-7b/v1/MANIFEST.yaml

id: blackroad-coder-7b-v1
name: BlackRoad Coder 7B
version: 1.0.0
stage: internal                        # forkie | research | internal | production | deprecated

# Ownership
owner:
  type: domain                         # domain | project | person | agent
  id: pack-infra-devops
  contact: devops@blackroad.io

# Lineage
derived_from:
  - id: forkies/qwen-2.5-coder-7b@v1.0.0
    method: fine-tuning                # fine-tuning | merge | distillation | architecture-change
    details: "LoRA fine-tuned on BlackRoad internal codebases (15K examples)"

# Capabilities
capabilities:
  - code-generation
  - code-completion
  - bug-fixing
  - documentation

# Performance
evals:
  - name: HumanEval
    score: 0.72
    date: 2025-12-01
  - name: BlackRoad Internal Coding Benchmark
    score: 0.84
    date: 2025-12-01

# Serving
serving:
  allowed: true
  endpoints:
    - https://models-internal.blackroad.io/coder-7b-v1
  backends:
    - vllm
    - ollama
  max_concurrent_users: 100

# Access Control
access:
  internal_only: true
  allowed_services:
    - blackroad-os-operator
    - pack-infra-devops
    - blackroad-prism-console
  allowed_agents:
    - agent-cece
    - pack-infra-devops/*

# Lifecycle
lifecycle:
  created_at: 2025-11-15T10:00:00Z
  promoted_from_research: 2025-12-01T14:30:00Z
  production_ready: false
  deprecated: false
  retention_until: null                # null = indefinite

# Artifacts
artifacts:
  weights: s3://blackroad-models/internal/blackroad-coder-7b/v1/weights.safetensors
  config: s3://blackroad-models/internal/blackroad-coder-7b/v1/config.json
  tokenizer: s3://blackroad-models/internal/blackroad-coder-7b/v1/tokenizer/
  eval_results: s3://blackroad-models/internal/blackroad-coder-7b/v1/evals/

# License
license:
  type: proprietary
  owner: BlackRoad Systems LLC
  usage_terms: internal-only
  upstream_license: Apache-2.0         # From Qwen base model
  attribution_required: true
```

---

## Lifecycle States & Transitions

```
┌──────────┐
│  Forkie  │ (Upstream snapshot, read-only)
└────┬─────┘
     │ fork + experiment
     ▼
┌──────────┐
│ Research │ (Active experimentation, single owner)
└────┬─────┘
     │ eval + validate
     ▼
┌──────────┐
│ Internal │ (Production-ready, internal use only)
└────┬─────┘
     │ customer-facing decision
     ▼
┌────────────┐
│ Production │ (Customer-facing, SLA enforced)
└────┬───────┘
     │ replacement or sunset
     ▼
┌────────────┐
│ Deprecated │ (Archived, no serving)
└────────────┘
```

**State Transition Rules:**

| From | To | Requirements |
|------|-----|-------------|
| Forkie | Research | Owner assigned, purpose documented |
| Research | Internal | Passes domain evals, 14-day staging, owner approval |
| Internal | Production | Customer need validated, SLA defined, legal approval |
| Research | Deprecated | 90 days no activity OR failed evals |
| Internal | Deprecated | Replaced by newer version OR no usage in 180 days |
| Production | Deprecated | Sunset plan approved, migration complete |

---

## Domain/Project Ownership Mapping

### Pack-Specific Models

| Domain | Owned Models | Base Forkies |
|--------|--------------|-------------|
| **pack-finance** | blackroad-finance-analyst-v2<br>blackroad-portfolio-advisor-v1 | llama-3.1-70b<br>qwen-2.5-math-7b |
| **pack-legal** | blackroad-legal-reasoning-v1<br>blackroad-contract-analyzer-v1 | mixtral-8x22b<br>llama-3.1-70b |
| **pack-research-lab** | blackroad-research-assistant-v3<br>blackroad-citation-expert-v1 | qwen-2.5-32b<br>llama-3.1-405b (API) |
| **pack-creator-studio** | blackroad-creative-writer-v2<br>blackroad-image-caption-v1 | llama-3.1-70b<br>clip-vit-large-patch14 |
| **pack-infra-devops** | blackroad-coder-7b-v1<br>blackroad-ops-assistant-v1 | qwen-2.5-coder-7b<br>deepseek-coder-33b |

### Platform Models (No Pack)

| Model | Owner | Purpose |
|-------|-------|---------|
| blackroad-os-brain | Platform Core | Multi-domain orchestration agent |
| blackroad-truth-verifier | Truth Engine | PS-SHA∞ verification and assessment |
| roadwork-job-matcher | RoadWork Product | Job matching and application AI |
| blackroad-multimodal-planner | Platform Core | Vision + language task planning |

---

## Service → Model Access Matrix

### Services Allowed to Serve Models

| Service | Allowed Models | Purpose |
|---------|----------------|---------|
| **blackroad-os-operator** (Cece) | All internal + production | Agent orchestration |
| **blackroad-os-api** | Production only | Customer-facing API |
| **pack-finance** | pack-finance models + platform models | Financial agent runtime |
| **pack-legal** | pack-legal models + platform models | Legal agent runtime |
| **pack-research-lab** | pack-research-lab models + platform models | Research agent runtime |
| **pack-creator-studio** | pack-creator-studio models + platform models | Creative agent runtime |
| **pack-infra-devops** | pack-infra-devops models + platform models | DevOps agent runtime |
| **roadwork-api** | roadwork-* production models | RoadWork product backend |

### Access Enforcement

**Default Policy:** Deny all access unless explicitly allowed.

**Enforcement Mechanisms:**
1. **API Key Scoping** - Model serving endpoints check caller service ID
2. **Network Policies** - Kubernetes NetworkPolicies restrict pod-to-pod
3. **Registry Checks** - Model registry enforces `access.allowed_services`
4. **Audit Logging** - All model access logged to `logs/model_access.jsonl`

---

## Guardrails Preventing Model Leakage

### 1. Forkie Isolation

**Rule:** Forkies MUST NOT be served directly.

**Enforcement:**
- No public endpoints for `/forkies/*`
- Registry blocks `serving.allowed = true` for Forkies
- CI/CD checks reject serving configs pointing to Forkies

**Violation Example:**
```yaml
# ❌ BLOCKED by CI
serving:
  model: forkies/llama-3.1-8b-instruct/v1.0.0
  endpoint: /api/chat
```

---

### 2. Research Model Containment

**Rule:** Research models MUST NOT leave research namespace.

**Enforcement:**
- Research models default to `access.internal_only = true`
- No production endpoints
- Auto-archive after 90 days of inactivity

**Valid Research Access:**
```yaml
# ✅ Allowed: researcher local testing
access:
  allowed_services: []
  allowed_agents:
    - agent-alexa-local-dev
```

**Invalid Research Access:**
```yaml
# ❌ BLOCKED: research model in production
access:
  allowed_services:
    - blackroad-os-api  # Production service!
```

---

### 3. Agent-Model Decoupling

**Rule:** Agents MUST NOT hard-code model IDs.

**Enforcement:**
- Agents specify **capability**, not model
- Model router resolves capability → model
- Swapping models does not require agent redeployment

**Good Agent Code:**
```python
# ✅ Capability-based
agent.configure(capabilities=["code-generation", "bug-fixing"])
response = await agent.generate(prompt)  # Router picks model
```

**Bad Agent Code:**
```python
# ❌ Hard-coded model
from blackroad_core.llm import LLMClient
client = LLMClient(model="blackroad-coder-7b-v1")  # Tight coupling!
```

**Router Configuration:**
```yaml
# Model router maps capabilities → models
capability_map:
  code-generation:
    - blackroad-coder-7b-v1 (weight: 0.8)
    - qwen-2.5-coder-7b (weight: 0.2, fallback: true)
  financial-analysis:
    - blackroad-finance-analyst-v2 (weight: 1.0)
```

---

### 4. Production Model Licensing

**Rule:** Production models MUST have explicit licenses.

**Enforcement:**
- Promotion to `production/` requires `LICENSE.md`
- CI/CD checks block promotion without license
- Legal team approval required

**License Template:**
```markdown
# BlackRoad Proprietary Model License

**Model:** blackroad-os-brain-v3.0
**Owner:** BlackRoad Systems LLC
**Effective Date:** 2025-12-01

## Upstream Attribution
Derived from: Llama 3.1 70B Instruct (Meta, Apache 2.0)

## Usage Rights
- ✅ Internal BlackRoad services and agents
- ✅ Customer-facing BlackRoad products
- ❌ Redistribution of weights
- ❌ Competitive analysis or benchmarking without permission

## SLA & Support
See: SLA.md
```

---

### 5. Multi-Agent Experiment Isolation

**Rule:** Parallel research experiments MUST NOT collide.

**Enforcement:**
- Research models namespaced by owner: `research/{owner}/*`
- Separate blob storage prefixes
- Registry prevents name collisions

**Example:**
```
research/alexa/coder-experiment-1/
research/agent-cece/coder-experiment-1/  # Different owner, no collision
research/alexa/coder-experiment-2/       # Same owner, sequential numbering
```

---

## Model Management CLI

### Tools Overview

| Tool | Purpose | Example |
|------|---------|---------|
| `model fork` | Create Forkie from upstream | `model fork huggingface/qwen-2.5-coder-7b` |
| `model create` | Start research experiment | `model create research/alexa/my-experiment --base forkies/llama-3.1-8b` |
| `model eval` | Run evaluation suite | `model eval research/alexa/my-experiment --suite coding` |
| `model promote` | Promote to next stage | `model promote research/alexa/my-experiment --to internal` |
| `model serve` | Start model server | `model serve internal/blackroad-coder-7b-v1 --backend vllm` |
| `model list` | List models by stage | `model list --stage internal` |
| `model lineage` | Show derivation graph | `model lineage production/blackroad-os-brain-v3` |
| `model deprecate` | Archive model | `model deprecate internal/old-model-v1` |

---

### Example Workflow

```bash
# 1. Fork upstream model
model fork huggingface/qwen-2.5-coder-7b --version v1.0.0
# Creates: forkies/qwen-2.5-coder-7b/v1.0.0/

# 2. Start research experiment
model create research/alexa/blackroad-coder-lora \
  --base forkies/qwen-2.5-coder-7b/v1.0.0 \
  --method fine-tuning
# Creates: research/alexa/blackroad-coder-lora/

# 3. Fine-tune locally
cd research/alexa/blackroad-coder-lora
python train.py --dataset internal-code --epochs 3

# 4. Run evals
model eval research/alexa/blackroad-coder-lora --suite coding
# Result: HumanEval 0.72, BlackRoad Internal 0.84

# 5. Promote to internal
model promote research/alexa/blackroad-coder-lora --to internal --name blackroad-coder-7b-v1
# Creates: internal/blackroad-coder-7b/v1/

# 6. Deploy to staging
model serve internal/blackroad-coder-7b-v1 \
  --backend vllm \
  --endpoint https://models-staging.blackroad.io/coder-7b-v1

# 7. Validate in staging (14 days)
# ... agents use the model ...

# 8. Promote to production (if customer-facing needed)
model promote internal/blackroad-coder-7b-v1 --to production
# Requires: legal approval, SLA definition, customer validation

# 9. Deprecate old version
model deprecate internal/blackroad-coder-7b-v0
# Moves to: deprecated/internal/blackroad-coder-7b/v0/
```

---

## Integration with Existing BlackRoad Systems

### 1. Agent Spawner Integration

**Before (Hard-coded models):**
```python
agent = await spawner.spawn_agent(SpawnRequest(
    role="Code Assistant",
    capabilities=["code-generation"],
    llm_model="llama-3.1-8b"  # ❌ Hard-coded
))
```

**After (Capability-based):**
```python
agent = await spawner.spawn_agent(SpawnRequest(
    role="Code Assistant",
    capabilities=["code-generation"],
    # Model router automatically selects best model for capability
))
```

**Model Router Configuration:**
```yaml
# In blackroad-os-operator/config/model_router.yaml
capability_map:
  code-generation:
    - model: internal/blackroad-coder-7b-v1
      weight: 0.8
      latency_target: 500ms
    - model: forkies/qwen-2.5-coder-7b/v1.0.0
      weight: 0.2
      fallback: true
```

---

### 2. Pack System Integration

Each pack declares **model dependencies**, not ownership:

```yaml
# pack-infra-devops/pack.yaml
pack_id: pack-infra-devops
version: 2.0.0

model_dependencies:
  required:
    - capability: code-generation
      min_score: 0.70  # HumanEval
  optional:
    - capability: infrastructure-as-code
      min_score: 0.65

# Pack does NOT specify which model, just capability requirements
```

**Pack Installation:**
```bash
pack install pack-infra-devops
# Registry checks: Are required capabilities available?
# Model router maps: code-generation → internal/blackroad-coder-7b-v1
```

---

### 3. Truth Engine Integration

**Models as Verification Agents:**

```yaml
# Truth verification workflow
verification_job:
  id: vj-123
  snapshot_id: snap-456
  verifier_agents:
    - agent_id: agent-truth-verifier-1
      model: production/blackroad-truth-verifier-v2  # Explicit for SLA
      capability: fact-checking
    - agent_id: agent-truth-verifier-2
      model: production/blackroad-truth-verifier-v2
      capability: bias-detection
```

**Why explicit model here?**
- Production SLA required
- Reproducible verification (same model version)
- Audit trail compliance

---

### 4. LLM Router Integration

**Updated `LLMRouter` API:**

```python
from blackroad_core.llm import LLMRouter, LLMCapability

router = LLMRouter(registry_url="https://registry.blackroad.io")

# Capability-based generation
response = await router.generate(
    messages=[...],
    capability=LLMCapability.CODE_GENERATION,
    min_score=0.70
)

# Explicit model (for production reproducibility)
response = await router.generate(
    messages=[...],
    model="production/blackroad-os-brain-v3.0"
)
```

**Router Logic:**
1. Check caller service ID
2. Verify access permissions in registry
3. Select model by capability OR explicit model ID
4. Route to appropriate serving backend
5. Log access to audit trail

---

## Serving Infrastructure (Separate from Models)

**Key Principle:** Serving configs live outside model repos.

```
blackroad-models/serving/
├── vllm/
│   ├── internal-coder.yaml         # Serves internal/blackroad-coder-7b-v1
│   ├── production-brain.yaml       # Serves production/blackroad-os-brain-v3
│   └── base-config.yaml
├── ollama/
│   └── modelfiles/
│       ├── blackroad-coder.modelfile
│       └── blackroad-brain.modelfile
└── railway/
    ├── model-server-deployment.yaml
    └── autoscaling.yaml
```

**Why separate?**
- Model = artifact (weights, config)
- Serving = runtime (API, scaling, monitoring)
- Same model can be served by multiple backends
- Changing serving infrastructure ≠ changing model

---

## Evaluation Strategy

### Domain-Specific Eval Suites

| Domain | Eval Suite | Metrics |
|--------|------------|---------|
| **Coding** | HumanEval, MBPP, BlackRoad Internal Coding | Pass@1, Pass@10 |
| **Finance** | FinanceBench, BlackRoad Portfolio Eval | Accuracy, F1 |
| **Legal** | LegalBench, Contract NER | Precision, Recall |
| **Research** | MMLU, SciQ, Citation Accuracy | Accuracy, Hallucination Rate |
| **Creative** | WritingPrompts, Style Transfer | Human eval, Perplexity |

### Promotion Thresholds

| Stage | Requirements |
|-------|-------------|
| Research → Internal | >= 90% of baseline Forkie performance |
| Internal → Production | >= baseline + 14-day staging + legal approval |

---

## Cost & Performance Optimization

### Model Serving Tiers

| Tier | Models | Infrastructure | Cost/Month |
|------|--------|---------------|-----------|
| **Development** | Research models | Local Ollama | $0 |
| **Staging** | Internal models | Railway (1 instance) | $10-20 |
| **Production** | Production models | Railway (autoscaled) + vLLM | $50-200 |

### Optimization Strategies

1. **Model Quantization**
   - Research: FP16
   - Internal: INT8 (GGUF for Ollama)
   - Production: INT4 (AWQ/GPTQ for vLLM)

2. **Caching**
   - Prompt caching for repeated queries
   - KV cache sharing across requests

3. **Batching**
   - Continuous batching in vLLM
   - Target: 10-50 concurrent requests per instance

---

## Security & Compliance

### 1. Access Audit Trail

Every model access logged:

```json
{
  "timestamp": "2025-12-14T10:30:00Z",
  "model_id": "internal/blackroad-coder-7b-v1",
  "caller_service": "pack-infra-devops",
  "caller_agent": "agent-cece-123",
  "endpoint": "https://models-internal.blackroad.io/coder-7b-v1/generate",
  "tokens_generated": 256,
  "latency_ms": 420,
  "allowed": true
}
```

### 2. Upstream License Compliance

**Tracking:**
- Each Forkie includes `LICENSE` from upstream
- Each derived model includes `LINEAGE.md` with attribution
- CI/CD enforces license compatibility checks

**Example Compatibility Matrix:**

| Upstream License | Can Derive Internal? | Can Derive Production? |
|------------------|---------------------|----------------------|
| Apache 2.0 | ✅ Yes | ✅ Yes (with attribution) |
| MIT | ✅ Yes | ✅ Yes (with attribution) |
| Llama 3.1 Community License | ✅ Yes | ✅ Yes (if < 700M MAU) |
| GPL-3.0 | ✅ Yes (internal only) | ❌ No (viral license) |

### 3. Data Privacy

**Training Data Classification:**
- Public data → OK for any model
- Internal BlackRoad data → Internal/Production models only
- Customer data → Production models with explicit consent only

**Enforcement:**
- Training scripts check data classification
- Audit logs track training data sources

---

## Minimum Viable Implementation (Next 30 Days)

### Week 1: Foundation

**Goals:**
- ✅ Create `blackroad-models/` monorepo
- ✅ Set up registry schema (YAML)
- ✅ Fork first 3 models (Llama, Qwen, Mixtral)

**Deliverables:**
- Repo structure created
- `registry/forkies.yaml` with 3 entries
- `tools/fork.py` script working

---

### Week 2: First Research Experiment

**Goals:**
- ✅ Create first research model (blackroad-coder LoRA)
- ✅ Set up evaluation harness
- ✅ Document lineage

**Deliverables:**
- `research/alexa/blackroad-coder-lora/`
- HumanEval results
- `LINEAGE.md` documenting derivation

---

### Week 3: Internal Model Promotion

**Goals:**
- ✅ Promote research → internal
- ✅ Deploy to Railway with vLLM
- ✅ Integrate with agent spawner

**Deliverables:**
- `internal/blackroad-coder-7b/v1/`
- Model serving endpoint live
- Agent spawner using capability-based routing

---

### Week 4: Guardrails & Monitoring

**Goals:**
- ✅ Implement access control checks
- ✅ Set up audit logging
- ✅ Document complete workflow

**Deliverables:**
- Access matrix enforced
- `logs/model_access.jsonl` logging
- Complete `MODELS.md` (this document)

---

## FAQ

### Q: When should I create a new model vs. reuse existing?

**Create new model if:**
- Different base architecture
- Different training data domain
- Different performance requirements (latency vs accuracy)

**Reuse existing if:**
- Same capability, just need better prompts
- Model already meets eval thresholds

---

### Q: Can multiple agents use the same model simultaneously?

**Yes.** Models are stateless artifacts. Serving infrastructure handles concurrency.

---

### Q: What if I want to experiment with a Forkie directly?

**Allowed for local development only:**
```bash
# OK: Local testing
ollama run forkies/llama-3.1-8b-instruct

# NOT OK: Serving Forkie to other agents/services
model serve forkies/llama-3.1-8b-instruct --endpoint /api/chat  # ❌ Blocked
```

---

### Q: How do I know which model an agent is using?

**Check audit logs:**
```bash
grep agent-123 logs/model_access.jsonl | tail -n 10
```

**Or query registry:**
```bash
model query --agent agent-123 --capability code-generation
```

---

### Q: Can I deploy a research model to production directly?

**No.** Must go through `research → internal → production` lifecycle.

**Why?**
- Internal stage validates production-readiness (14-day staging)
- Legal/compliance review required for production
- SLA definition required

---

## Next Steps

1. **Create `blackroad-models/` monorepo** (this structure)
2. **Fork first 3 upstream models** (Llama 3.1, Qwen 2.5, Mixtral)
3. **Build model registry service** (YAML-based initially, later PostgreSQL)
4. **Integrate with agent spawner** (capability-based routing)
5. **Set up vLLM serving** (Railway deployment)
6. **Implement access controls** (service ID checks, audit logging)
7. **Document first complete workflow** (fork → research → internal → production)

---

## References

- **Upstream Model Sources:**
  - Meta Llama: https://github.com/meta-llama/llama-models
  - Qwen: https://github.com/QwenLM/Qwen
  - Mixtral: https://huggingface.co/mistralai/Mixtral-8x7B-v0.1

- **Serving Backends:**
  - vLLM: https://github.com/vllm-project/vllm
  - Ollama: https://github.com/ollama/ollama
  - llama.cpp: https://github.com/ggerganov/llama.cpp

- **Evaluation Harnesses:**
  - HumanEval: https://github.com/openai/human-eval
  - HELM: https://github.com/stanford-crfm/helm
  - LM Evaluation Harness: https://github.com/EleutherAI/lm-evaluation-harness

---

**Last Updated:** 2025-12-14
**Maintained By:** BlackRoad Platform Architecture
**Review Cadence:** Monthly or after major model promotion

**Questions?** blackroad.systems@gmail.com
