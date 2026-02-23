# Agent-Approved Open-Source Models
## Safe for Commercial Derivatives (Legal for BlackRoad Forkies)

**Updated:** 2025-12-15
**Purpose:** Curated list of open-source models safe for AI agents to fork and fine-tune into BlackRoad proprietary models.

---

## ✅ Legal Requirements

### Must Have:
1. **Permissive License**
   - Apache 2.0 ✅
   - MIT ✅
   - Llama 3.x Community License ✅ (with MAU < 700M restriction)
   - Qwen License ✅ (Apache 2.0-style)

2. **Clear Attribution**
   - Original license preserved
   - Upstream authors credited

3. **Commercial Use Allowed**
   - No "research-only" restrictions
   - Derivatives permitted

### Must Avoid:
- ❌ GPL (viral copyleft)
- ❌ CC-BY-NC (non-commercial)
- ❌ Research-only licenses
- ❌ Gated models requiring approval

---

## 🎯 BlackRoad Domain Model Strategy

### Pack-Finance Models

**Financial Analysis**
- **Base:** Llama 3.1 70B Instruct
- **License:** Llama 3.1 Community (< 700M MAU) ✅
- **Why:** Strong reasoning, financial context
- **Target:** `internal/blackroad-finance-analyst-v1`

**Math & Calculations**
- **Base:** DeepSeek-Math 7B
- **License:** MIT ✅
- **Why:** Superior math reasoning
- **Target:** `internal/blackroad-portfolio-calculator-v1`

---

### Pack-Legal Models

**Legal Reasoning**
- **Base:** Llama 3.1 70B Instruct
- **License:** Llama 3.1 Community ✅
- **Why:** Long context (128K), complex reasoning
- **Target:** `internal/blackroad-legal-reasoning-v1`

**Contract Analysis**
- **Base:** Mixtral 8x22B Instruct
- **License:** Apache 2.0 ✅
- **Why:** MoE efficiency, handles long documents
- **Target:** `internal/blackroad-contract-analyzer-v1`

---

### Pack-Research-Lab Models

**Research Assistant**
- **Base:** Qwen 2.5 32B Instruct
- **License:** Apache 2.0 ✅
- **Why:** Strong instruction following, multilingual
- **Target:** `internal/blackroad-research-assistant-v1`

**Citation & Summarization**
- **Base:** Mistral 7B Instruct v0.3
- **License:** Apache 2.0 ✅
- **Why:** Fast, accurate, summarization-focused
- **Target:** `internal/blackroad-citation-expert-v1`

---

### Pack-Creator-Studio Models

**Creative Writing**
- **Base:** Llama 3.1 70B Instruct
- **License:** Llama 3.1 Community ✅
- **Why:** Best creative reasoning
- **Target:** `internal/blackroad-creative-writer-v1`

**Code + Creative Hybrid**
- **Base:** Qwen 2.5 Coder 32B
- **License:** Apache 2.0 ✅
- **Why:** Multimodal (code + text)
- **Target:** `internal/blackroad-polyglot-creator-v1`

---

### Pack-Infra-DevOps Models

**Infrastructure Code**
- **Base:** Qwen 2.5 Coder 14B
- **License:** Apache 2.0 ✅
- **Why:** YAML, Terraform, Kubernetes expertise
- **Target:** `internal/blackroad-infra-coder-v1`

**Systems Programming**
- **Base:** DeepSeek-Coder 33B Instruct
- **License:** MIT ✅
- **Why:** Rust, C++, low-level expertise
- **Target:** `internal/blackroad-systems-coder-v1`

---

### Cross-Domain Models

**Multi-Domain Orchestrator**
- **Base:** Llama 3.1 405B (via API) OR Qwen 2.5 72B
- **License:** Llama Community / Apache 2.0 ✅
- **Why:** Governance, complex reasoning, multi-turn
- **Target:** `production/blackroad-os-brain-v1`

**Truth Verification**
- **Base:** Llama 3.1 70B Instruct
- **License:** Llama Community ✅
- **Why:** Fact-checking, bias detection
- **Target:** `internal/blackroad-truth-verifier-v1`

---

## 🔍 Approved Model Catalog

### Tier 1: Already Forked ✅ (11 Forkies)

| Model | License | Size | Use Case | Status |
|-------|---------|------|----------|--------|
| **Qwen 2.5 Coder 7B** | Apache 2.0 | 7B | Code generation | ✅ Forked v1.0.0 |
| **Llama 3.1 8B Instruct** | Llama Community | 8B | General reasoning | ✅ Forked v1.0.0 |
| **Mixtral 8x7B Instruct** | Apache 2.0 | 47B | High-capacity MoE | ✅ Forked v0.1.0 |
| **Llama 3.1 70B Instruct** | Llama Community | 70B | Finance, Legal, Creative | ✅ Forked v1.0.0 |
| **Qwen 2.5 32B Instruct** | Apache 2.0 | 32B | Research, General | ✅ Forked v1.0.0 |
| **DeepSeek-Math 7B** | MIT | 7B | Math, Finance | ✅ Forked v1.0.0 |
| **Qwen 2.5 Coder 14B** | Apache 2.0 | 14B | DevOps, Infra | ✅ Forked v1.0.0 |
| **Mistral 7B Instruct v0.3** | Apache 2.0 | 7B | Summarization | ✅ Forked v0.3.0 |
| **DeepSeek-Coder 33B** | MIT | 33B | Systems programming | ✅ Forked v1.0.0 |
| **Qwen 2.5 72B Instruct** | Apache 2.0 | 72B | Multi-domain orchestration | ✅ Forked v1.0.0 |
| **Mixtral 8x22B Instruct** | Apache 2.0 | 141B | Long documents | ✅ Forked v0.1.0 |

---

### Tier 2: Future Considerations

| Model | License | Size | Use Case | Notes |
|-------|---------|------|----------|-------|
| CodeLlama 34B | Llama 2 License | 34B | Specialized code | Surpassed by Qwen - skip |
| Llama 3.1 405B | Llama Community | 405B | Ultimate reasoning | API-only (too large to self-host) |
| Phi-3 Medium | MIT | 14B | Edge deployment | Consider for mobile agents |

---

## 🚨 Models to Avoid (Not Agent-Approved)

| Model | License | Why Avoid |
|-------|---------|-----------|
| Falcon 180B | Custom (restrictive) | Commercial restrictions |
| BLOOM | RAIL (restrictive) | Use restrictions |
| OPT | OPT License | Meta deprecates, unclear terms |
| GPT-NeoX | Apache 2.0 ✅ | **Actually OK!** But outdated |
| Pythia | Apache 2.0 ✅ | **Actually OK!** But small/old |

---

## 📋 License Compliance Matrix

### Safe Licenses (Approved for Forkies → Proprietary)

| License | Commercial OK? | Derivatives OK? | Attribution Required? | Notes |
|---------|---------------|----------------|---------------------|-------|
| **Apache 2.0** | ✅ Yes | ✅ Yes | ✅ Yes | Ideal for BlackRoad |
| **MIT** | ✅ Yes | ✅ Yes | ✅ Yes | Very permissive |
| **Llama 3.1 Community** | ✅ Yes (< 700M MAU) | ✅ Yes | ✅ Yes | BlackRoad compliant |
| **Qwen License** | ✅ Yes | ✅ Yes | ✅ Yes | Apache 2.0-style |

### Unsafe Licenses (Do Not Fork)

| License | Commercial OK? | Why Unsafe |
|---------|---------------|------------|
| **GPL-3.0** | ✅ Yes | ❌ Viral (forces open-source derivatives) |
| **CC-BY-NC** | ❌ No | ❌ Non-commercial only |
| **Research-Only** | ❌ No | ❌ No commercial use |

---

## 🎯 Forking Strategy

### Phase 1: Core Domains (Next 7 Days)
1. **Llama 3.1 70B Instruct** → Finance + Legal + Creative
2. **Qwen 2.5 32B Instruct** → Research
3. **DeepSeek-Math 7B** → Finance calculations

### Phase 2: Specialized (Next 14 Days)
4. **Qwen 2.5 Coder 14B** → DevOps/Infra
5. **Mistral 7B Instruct** → Summarization
6. **DeepSeek-Coder 33B** → Systems programming

### Phase 3: Production (Next 30 Days)
7. **Qwen 2.5 72B** or **Llama 3.1 405B (API)** → blackroad-os-brain

---

## 💰 Cost Analysis

### Forking Costs (One-Time)

| Model | Size | Download | Storage | Training (LoRA) | Total |
|-------|------|----------|---------|----------------|-------|
| Llama 3.1 70B | 140GB | Free | $5/month | $20-40 (A100 8hr) | ~$45 |
| Qwen 2.5 32B | 64GB | Free | $3/month | $15-30 (A100 4hr) | ~$35 |
| DeepSeek-Math 7B | 14GB | Free | $1/month | $10-20 (A100 4hr) | ~$25 |

**Total for 3 models:** ~$105 one-time + $9/month storage

### Serving Costs (Ongoing)

| Model | Hardware | Cost/Month | Use Case |
|-------|----------|-----------|----------|
| 7B models | A10 (16GB) | $50 | Code, Math, Summarization |
| 32B models | A100 (40GB) | $100 | Research, General |
| 70B models | A100 (80GB) | $200 | Finance, Legal, Creative |

**Strategy:** Share hardware via multi-LoRA serving!

---

## 🔐 Legal Compliance Checklist

For each Forkie:

- [ ] License is Apache 2.0, MIT, or Llama Community ✅
- [ ] Original LICENSE file included ✅
- [ ] LINEAGE.md documents upstream attribution ✅
- [ ] Commercial use explicitly allowed ✅
- [ ] No viral copyleft (GPL) ❌
- [ ] No non-commercial restrictions ❌
- [ ] Model registry tracks upstream license ✅

---

## 🎓 Why These Models Are "Agent-Approved"

### 1. Legal Safety
- All have permissive licenses
- Clear commercial use rights
- No hidden restrictions

### 2. Technical Quality
- State-of-art performance in domains
- Active upstream maintenance
- Strong community support

### 3. Agent-Friendly
- Instruction-following capabilities
- Tool use support (future)
- Multi-turn conversation
- Fast inference

### 4. BlackRoad Alignment
- Match our domain packs
- Support PS-SHA∞ workflows
- Compatible with agent spawner
- Enhance Lucidia/Cece capabilities

---

## 📝 Attribution Template

For each proprietary model derived from Forkies:

```markdown
## Upstream Attribution

**Base Model:** [Model Name]
**Developer:** [Upstream Organization]
**License:** [License Type]
**Source:** [HuggingFace URL]

**Citation:**
```
@article{model-citation,
  title={Model Paper Title},
  author={Authors},
  journal={Venue},
  year={Year}
}
```

**Derivative Work:** BlackRoad [Model Name]
**License:** Proprietary (BlackRoad Systems LLC)
**Attribution Required:** Yes
```

---

## 🚀 Next Steps

1. **Fork Tier 2 Models** (5 models)
   ```bash
   python tools/fork.py meta-llama/Llama-3.1-70B-Instruct --version v1.0.0
   python tools/fork.py Qwen/Qwen2.5-32B-Instruct --version v1.0.0
   python tools/fork.py deepseek-ai/deepseek-math-7b-instruct --version v1.0.0
   python tools/fork.py Qwen/Qwen2.5-Coder-14B-Instruct --version v1.0.0
   python tools/fork.py mistralai/Mistral-7B-Instruct-v0.3 --version v0.3.0
   ```

2. **Create Research Experiments** (1 per domain)
   - finance: Llama 70B + financial data
   - legal: Llama 70B + legal corpus
   - research: Qwen 32B + papers
   - creative: Llama 70B + creative writing
   - infra: Qwen 14B + IaC examples

3. **Train LoRA Adapters** (parallel if GPUs available)

4. **Evaluate & Promote** (if pass criteria)

5. **Deploy Multi-LoRA Server** (cost optimization)

---

**Maintained By:** BlackRoad Platform Architecture
**Last Updated:** 2025-12-15
**Review Cadence:** Monthly or when new OSS models released

**Questions?** blackroad.systems@gmail.com
