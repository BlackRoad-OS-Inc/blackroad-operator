# BlackRoad Domain Model Roadmap
## Forkies → Proprietary Models per Pack

**Status:** 8 Forkies ready, 1 proprietary model deployed
**Updated:** 2025-12-15

---

## 🎯 Strategy: One Forkie, Multiple Derivatives

**Key Insight:** The same base model (Forkie) can be fine-tuned for multiple domains with different training data!

**Example:**
```
forkies/llama-3-1-70b-instruct@v1.0.0
  ├─> research/pack-finance/finance-analyst → internal/blackroad-finance-analyst-v1
  ├─> research/pack-legal/legal-reasoning → internal/blackroad-legal-reasoning-v1
  └─> research/pack-creator-studio/creative-writer → internal/blackroad-creative-writer-v1
```

---

## 📦 Pack-Finance Models

### 1. blackroad-finance-analyst

**Base Forkie:** `forkies/llama-3-1-70b-instruct@v1.0.0`
- **License:** Llama 3.1 Community (< 700M MAU) ✅
- **Size:** 70B parameters
- **Why:** Strong reasoning, financial context understanding

**Training Data:**
- Financial reports (10-Ks, 10-Qs)
- Earnings call transcripts
- Market analysis reports
- BlackRoad portfolio data (anonymized)

**Capabilities:**
- financial-analysis
- portfolio-optimization
- risk-assessment
- market-trend-prediction

**Target Performance:**
- FinanceBench: >= 80%
- BlackRoad Portfolio Eval: >= 85%

**Research Path:** `research/pack-finance/finance-analyst-lora`
**Internal Target:** `internal/blackroad-finance-analyst/v1`
**Estimated Cost:** $30-40 (A100 80GB, 8 hours)

---

### 2. blackroad-portfolio-calculator

**Base Forkie:** `forkies/deepseek-math-7b-instruct@v1.0.0`
- **License:** MIT ✅
- **Size:** 7B parameters
- **Why:** Superior math reasoning, financial calculations

**Training Data:**
- Portfolio rebalancing scenarios
- Risk-adjusted return calculations
- Tax optimization strategies
- Options pricing models

**Capabilities:**
- financial-calculations
- portfolio-math
- risk-metrics
- tax-optimization

**Target Performance:**
- MATH benchmark: >= 75%
- Financial Math Eval: >= 90%

**Research Path:** `research/pack-finance/portfolio-calculator-lora`
**Internal Target:** `internal/blackroad-portfolio-calculator/v1`
**Estimated Cost:** $15-25 (A100 40GB, 4 hours)

---

## ⚖️ Pack-Legal Models

### 3. blackroad-legal-reasoning

**Base Forkie:** `forkies/llama-3-1-70b-instruct@v1.0.0`
- **License:** Llama 3.1 Community ✅
- **Size:** 70B parameters
- **Why:** 128K context (long documents), complex legal reasoning

**Training Data:**
- Legal briefs and case law
- Contract templates
- Regulatory compliance documents
- BlackRoad legal reviews (anonymized)

**Capabilities:**
- legal-analysis
- contract-review
- compliance-checking
- case-law-research

**Target Performance:**
- LegalBench: >= 75%
- Contract Analysis: >= 80%

**Research Path:** `research/pack-legal/legal-reasoning-lora`
**Internal Target:** `internal/blackroad-legal-reasoning/v1`
**Estimated Cost:** $30-40 (A100 80GB, 8 hours)

---

### 4. blackroad-contract-analyzer

**Base Forkie:** `forkies/mixtral-8x7b-instruct-v0-1@v0.1.0`
- **License:** Apache 2.0 ✅
- **Size:** 47B parameters (8 experts x 7B)
- **Why:** MoE efficiency, handles long contracts

**Training Data:**
- Contract templates (employment, vendor, service)
- Amendment analysis
- Clause extraction patterns
- Term negotiation scenarios

**Capabilities:**
- contract-extraction
- clause-analysis
- risk-identification
- amendment-drafting

**Target Performance:**
- Contract NER: >= 85%
- Clause Detection: >= 90%

**Research Path:** `research/pack-legal/contract-analyzer-lora`
**Internal Target:** `internal/blackroad-contract-analyzer/v1`
**Estimated Cost:** $25-35 (A100 80GB, 6 hours)

---

## 🔬 Pack-Research-Lab Models

### 5. blackroad-research-assistant

**Base Forkie:** `forkies/qwen2-5-32b-instruct@v1.0.0`
- **License:** Apache 2.0 ✅
- **Size:** 32B parameters
- **Why:** Strong instruction following, multilingual, research-focused

**Training Data:**
- Academic papers (arXiv, PubMed)
- Literature review patterns
- Citation formatting
- Experimental methodology

**Capabilities:**
- research-planning
- literature-review
- hypothesis-generation
- experiment-design

**Target Performance:**
- MMLU: >= 80%
- SciQ: >= 85%
- Citation Accuracy: >= 90%

**Research Path:** `research/pack-research-lab/research-assistant-lora`
**Internal Target:** `internal/blackroad-research-assistant/v1`
**Estimated Cost:** $20-30 (A100 40GB, 6 hours)

---

### 6. blackroad-citation-expert

**Base Forkie:** `forkies/mistral-7b-instruct-v0-3@v0.3.0`
- **License:** Apache 2.0 ✅
- **Size:** 7B parameters
- **Why:** Fast, accurate summarization and citation

**Training Data:**
- Citation formats (APA, MLA, Chicago, IEEE)
- Bibliography generation
- Reference management
- Citation graph analysis

**Capabilities:**
- citation-formatting
- bibliography-generation
- reference-validation
- citation-network-analysis

**Target Performance:**
- Citation Format Accuracy: >= 95%
- Reference Completeness: >= 90%

**Research Path:** `research/pack-research-lab/citation-expert-lora`
**Internal Target:** `internal/blackroad-citation-expert/v1`
**Estimated Cost:** $10-20 (A100 40GB, 4 hours)

---

## 🎨 Pack-Creator-Studio Models

### 7. blackroad-creative-writer

**Base Forkie:** `forkies/llama-3-1-70b-instruct@v1.0.0`
- **License:** Llama 3.1 Community ✅
- **Size:** 70B parameters
- **Why:** Best creative reasoning, storytelling

**Training Data:**
- Creative writing samples
- Story structure patterns
- Character development arcs
- BlackRoad brand voice examples

**Training Data:**
- Dialogue generation
- Narrative consistency
- Genre adaptation
- Style transfer

**Capabilities:**
- creative-writing
- storytelling
- dialogue-generation
- brand-voice-matching

**Target Performance:**
- WritingPrompts: Human eval >= 4/5
- Perplexity: <= 15
- Brand Voice Match: >= 85%

**Research Path:** `research/pack-creator-studio/creative-writer-lora`
**Internal Target:** `internal/blackroad-creative-writer/v1`
**Estimated Cost:** $30-40 (A100 80GB, 8 hours)

---

### 8. blackroad-polyglot-creator

**Base Forkie:** `forkies/qwen2-5-coder-14b-instruct@v1.0.0`
- **License:** Apache 2.0 ✅
- **Size:** 14B parameters
- **Why:** Multimodal (code + creative text)

**Training Data:**
- Technical documentation
- Tutorial writing
- Code explanations
- Mixed text+code content

**Capabilities:**
- technical-writing
- tutorial-creation
- code-documentation
- multimodal-generation

**Target Performance:**
- Doc Quality: Human eval >= 4/5
- Code Accuracy: >= 80%

**Research Path:** `research/pack-creator-studio/polyglot-creator-lora`
**Internal Target:** `internal/blackroad-polyglot-creator/v1`
**Estimated Cost:** $20-30 (A100 40GB, 6 hours)

---

## ⚙️ Pack-Infra-DevOps Models

### 9. blackroad-infra-coder (COMPLETED ✅)

**Base Forkie:** `forkies/qwen2-5-coder-7b-instruct@v1.0.0`
- **Status:** ✅ Promoted to `internal/blackroad-coder-7b/v1`
- **Performance:** HumanEval 72% (+10.8% vs base)
- **Deployed:** Ready for Railway deployment

---

### 10. blackroad-systems-coder

**Base Forkie:** `forkies/qwen2-5-coder-14b-instruct@v1.0.0`
- **License:** Apache 2.0 ✅
- **Size:** 14B parameters
- **Why:** Infrastructure-as-Code, DevOps expertise

**Training Data:**
- Terraform/OpenTofu configurations
- Kubernetes YAML
- Ansible playbooks
- Docker/containerization
- CI/CD pipelines (GitHub Actions, Railway)

**Capabilities:**
- infrastructure-as-code
- container-orchestration
- ci-cd-automation
- cloud-configuration

**Target Performance:**
- IaC Correctness: >= 85%
- K8s YAML Validity: >= 90%

**Research Path:** `research/pack-infra-devops/systems-coder-lora`
**Internal Target:** `internal/blackroad-infra-coder/v1`
**Estimated Cost:** $20-30 (A100 40GB, 6 hours)

---

## 🧠 Cross-Domain Models

### 11. blackroad-os-brain (Future)

**Base Forkie:** `forkies/qwen2-5-72b-instruct@v1.0.0` (future fork)
- **License:** Apache 2.0 ✅
- **Size:** 72B parameters
- **Why:** Multi-domain orchestration, governance reasoning

**Training Data:**
- All BlackRoad domain knowledge
- Agent orchestration patterns
- Policy decision-making
- Multi-turn conversations

**Capabilities:**
- multi-domain-reasoning
- agent-orchestration
- policy-enforcement
- complex-planning

**Target:** `production/blackroad-os-brain/v1.0`
**Estimated Cost:** $40-60 (A100 80GB, 12 hours)

---

### 12. blackroad-truth-verifier

**Base Forkie:** `forkies/llama-3-1-70b-instruct@v1.0.0`
- **License:** Llama 3.1 Community ✅
- **Size:** 70B parameters
- **Why:** Fact-checking, bias detection

**Training Data:**
- Fact-checking datasets
- Bias detection patterns
- Source credibility assessment
- Truth state examples (from Truth Engine)

**Capabilities:**
- fact-checking
- bias-detection
- source-verification
- truth-assessment

**Target:** `internal/blackroad-truth-verifier/v1`
**Estimated Cost:** $30-40 (A100 80GB, 8 hours)

---

## 📊 Summary Matrix

| Domain | Base Forkie | BlackRoad Model | Status | Cost |
|--------|-------------|----------------|--------|------|
| **Finance** | Llama 70B | blackroad-finance-analyst | Planned | $35 |
| **Finance** | DeepSeek-Math 7B | blackroad-portfolio-calculator | Planned | $20 |
| **Legal** | Llama 70B | blackroad-legal-reasoning | Planned | $35 |
| **Legal** | Mixtral 8x7B | blackroad-contract-analyzer | Planned | $30 |
| **Research** | Qwen 32B | blackroad-research-assistant | Planned | $25 |
| **Research** | Mistral 7B | blackroad-citation-expert | Planned | $15 |
| **Creative** | Llama 70B | blackroad-creative-writer | Planned | $35 |
| **Creative** | Qwen Coder 14B | blackroad-polyglot-creator | Planned | $25 |
| **DevOps** | Qwen Coder 7B | blackroad-coder-7b | ✅ Done | $20 |
| **DevOps** | Qwen Coder 14B | blackroad-infra-coder | Planned | $25 |
| **Cross** | Llama 70B | blackroad-truth-verifier | Planned | $35 |
| **Cross** | Qwen 72B (future) | blackroad-os-brain | Future | $50 |

**Total One-Time Cost:** ~$350 (for 11 models)
**Total Serving Cost:** ~$300/month (multi-LoRA optimization)

---

## 🚀 Deployment Priority

### Phase 1: Core Capabilities (Next 7 Days)
1. ✅ **blackroad-coder-7b** (DevOps) - DONE!
2. **blackroad-finance-analyst** (Finance) - High demand
3. **blackroad-legal-reasoning** (Legal) - Compliance critical

### Phase 2: Specialized (Next 14 Days)
4. **blackroad-research-assistant** (Research)
5. **blackroad-creative-writer** (Creative)
6. **blackroad-infra-coder** (DevOps advanced)

### Phase 3: Advanced (Next 30 Days)
7. **blackroad-portfolio-calculator** (Finance math)
8. **blackroad-contract-analyzer** (Legal contracts)
9. **blackroad-citation-expert** (Research citations)
10. **blackroad-polyglot-creator** (Creative technical)

### Phase 4: Production (Future)
11. **blackroad-truth-verifier** (Cross-domain)
12. **blackroad-os-brain** (Multi-domain orchestrator)

---

## 💰 Cost Optimization: Multi-LoRA Serving

**Key Insight:** Serve multiple LoRA adapters on one base model!

**Example:**
```
Base: Llama 3.1 70B (shared)
LoRAs:
  - blackroad-finance-analyst (LoRA 1)
  - blackroad-legal-reasoning (LoRA 2)
  - blackroad-creative-writer (LoRA 3)
```

**Savings:**
- **Without Multi-LoRA:** 3 x $200/month = $600/month
- **With Multi-LoRA:** 1 x $200/month = $200/month
- **Saved:** $400/month (67% reduction!)

---

## 📋 Next Actions

1. **Create Research Experiments** (11 models)
   ```bash
   # Finance
   python tools/create_research.py pack-finance/finance-analyst \
     --base llama-3-1-70b-instruct \
     --data financial-reports

   # Legal
   python tools/create_research.py pack-legal/legal-reasoning \
     --base llama-3-1-70b-instruct \
     --data legal-corpus

   # ... etc for all 11
   ```

2. **Prepare Training Data** (per domain)
   - Collect domain-specific examples
   - Format as JSONL (prompt → completion)
   - Upload to S3

3. **Train in Parallel** (if GPU budget allows)
   - Start with high-priority domains
   - Monitor eval results
   - Promote if pass criteria

4. **Deploy Multi-LoRA Servers**
   - Group by base model
   - Configure LoRA routing
   - Test capability-based access

---

**Maintained By:** BlackRoad Platform Architecture
**Last Updated:** 2025-12-15

**Questions?** blackroad.systems@gmail.com
