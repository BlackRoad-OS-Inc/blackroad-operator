# Alexa Amundson

Lakeville, MN | amundsonalexa@gmail.com | (507) 828-0842 | [blackroad.io](https://blackroad.io) | [GitHub](https://github.com/blackboxprogramming)

---

## Summary

AI/ML engineer and distributed systems architect with production RAG pipelines (156K+ entries, hybrid vector+BM25 retrieval, re-ranking), multi-agent orchestration (14-module agentic framework, tool use, autonomous planning), and 29 LLMs deployed across a 6-node edge fleet with 52 TOPS neural acceleration — achieving 57-71% cost reduction at sub-200ms latency. Fine-tuned 4 custom models, built AI gateways with guardrails (OPA/Rego policy, content safety, fallback chains), and deployed 4 vector databases in production. FINRA-licensed (Series 7/63/65) with $23M+ in sales and $18.4M AUM identified. Bridges AI engineering with regulated-industry compliance in a single package.

---

## Technical Skills

**Distributed Systems:** Custom task queues (SQLite, dead-letter routing, visibility timeouts), append-only journal replication (SHA-256 chained JSONL), lock-free concurrent sync, heartbeat failure detection, WireGuard mesh VPN, NATS, Docker Swarm

**Cloud & Edge:** Cloudflare (130+ Workers, 95+ Pages, 40 KV, 7 D1, 10 R2, 18 Tunnels), DigitalOcean, Terraform, Ansible, Raspberry Pi fleet, Hailo-8 accelerators (52 TOPS)

**AI/ML & LLM Engineering:** RAG pipelines (hybrid search: dense embeddings + BM25 sparse retrieval, chunking strategies, re-ranking, citation grounding), agentic AI (multi-agent orchestration, tool use, function calling, autonomous planning loops), fine-tuning (LoRA/QLoRA, custom Modelfiles, 4 production models), LLM evaluation (automated benchmarking, hallucination detection, response quality scoring), prompt engineering (chain-of-thought, few-shot, system prompt architecture), Model Context Protocol (MCP) server integration, multi-provider gateway (Anthropic Claude, OpenAI, Ollama, Gemini — unified API with fallback chains), guardrails & safety (OPA/Rego policy enforcement, content filtering, token budget controls)

**Vector & Knowledge Systems:** Qdrant (production), Weaviate, Chroma, Milvus (deployed), embedding pipelines (sentence-transformers, OpenAI ada-002), 156K+ memory entries in FTS5 semantic index, knowledge graph construction, hybrid retrieval (vector + keyword + metadata filtering)

**Edge AI & Inference:** Hailo-8 accelerators (52 TOPS), ONNX Runtime, quantized model deployment (GGUF/GPTQ), Ollama (29 models across 4-node fleet), vLLM, load-balanced inference routing, sub-200ms edge latency

**Computer Vision & Multimodal:** YOLOv5, ResNet, TTS pipelines, vision-language models, image generation (DALL-E 3, Flux, SDXL — 4 provider agents), multimodal RAG (text + image retrieval)

**Languages:** Python (FastAPI, LangGraph, LangChain, LlamaIndex), TypeScript/Node.js 22 (Hono, Zod, AI SDK), Bash (400+ scripts), SQL, Excel VBA

**MLOps & LLMOps:** Docker (100+ Dockerfiles), Kubernetes, Terraform, Ansible, MLFlow, Dagster, model versioning, A/B inference routing, cost tracking per-token, distributed tracing (OpenTelemetry), Grafana observability, GitHub Actions CI/CD, Gitea self-hosted

**Databases & Storage:** PostgreSQL, SQLite, InfluxDB, Qdrant, Weaviate, Chroma, MinIO S3, Redis, Cloudflare D1/KV/R2, FTS5 semantic indexes

**Financial:** FINRA compliance (2210, SEC 204-2), risk modeling, annuity product engineering, Salesforce (Einstein Analytics, data governance)

---

## Experience

### Founder & Chief Architect — BlackRoad OS
*Remote | June 2024 – Present*

- Architected **five-layer AI ecosystem** (Interface → Orchestration → Data → Compliance → Compute) with deterministic multi-agent coordination across web, mobile, CLI, and edge
- Built **production RAG pipelines** with hybrid retrieval (dense vector embeddings + BM25 sparse search), intelligent chunking strategies, cross-encoder re-ranking, and citation-grounded responses — serving 156K+ memory entries across a 184MB FTS5 semantic index
- Designed **agentic AI orchestration framework** (14 Python modules, 9 specialized agent roles) with autonomous planning loops, tool use/function calling, capability-based routing, and 30K-agent scale architecture
- Directed **hybrid LLM deployment** (Mistral 7B/Llama 3 + Claude fallbacks) achieving **57-71% cost reduction** ($1.0-1.3K vs $3.5K/mo) with sub-200ms edge latency via quantized model serving (GGUF)
- Built **AI gateway with guardrails** (Hono/Zod) — multi-provider routing (Anthropic, OpenAI, Ollama, Gemini), OPA/Rego policy enforcement, content safety filtering, token budget controls, automatic fallback chains
- **Fine-tuned 4 custom LLMs** (custom Ollama Modelfiles with system prompts, temperature tuning, context window optimization) deployed across production fleet
- Built **distributed task queue** (SQLite-backed) with 4 queue types, dead-letter routing, automatic retry, worker daemon with heartbeat tracking
- Built **task orchestrator daemon** polling task marketplace, routing by priority, dispatching to GitHub Actions across 6-node fleet, cleaning up zombie agents
- Built **agent registry** managing 11+ agents (hardware/AI/human) with SSH connectivity, capability discovery, cryptographic identity
- Deployed **29 Ollama models across 4 edge nodes** with load-balanced inference routing, health monitoring, token counting, and model hot-swapping
- Integrated **2x Hailo-8 AI accelerators** (52 TOPS) for edge neural inference — YOLOv5 object detection, ResNet classification, ONNX model deployment
- Built **real-time memory sync daemon** enabling 100+ concurrent AI instances to share state (1ms polling, lock-free JSONL append-only journal, SHA-256 chain verification)
- Implemented **LLM observability stack** — distributed tracing (trace ID propagation, span hierarchies), per-model cost tracking, latency percentiles, hallucination monitoring, and service dependency graphs via OpenTelemetry + Grafana
- Built **multimodal AI image pipeline** with 4 generation agents (DALL-E 3, Flux, SDXL, FAL), R2 storage, D1 metadata indexing, and CLI tools for batch generation
- Integrated **Model Context Protocol (MCP)** servers for extended tool use — connecting LLMs to databases, file systems, APIs, and external services
- Deployed and manage **130+ Cloudflare Workers**, **95+ Pages**, **18 tunnels** routing **48+ domains**
- Operate 6-node WireGuard mesh (4 Raspberry Pis + 2 cloud VPS) with 20+ persistent services, self-hosted Gitea (207 repos)

### Internal Annuity Wholesaler / Senior Sales Analyst — Securian Financial
*St. Paul, MN | July 2024 – June 2025*

- Generated **$23M+ in annuity sales** (92% of goal vs. 74% territory median)
- Engineered product optimization calculator analyzing 5+ annuity structures with scenario modeling across 5-7 year horizons
- Built **data quality pipeline** driving **75% of new lead generation** by identifying 50%+ CRM error rate
- Implemented **behavioral analytics** increasing advisor engagement **33% MoM**
- Architected CRM governance auditing **6,000+ Salesforce records** for FINRA 2210 compliance
- Selected as technical presenter at LPL Financial conferences and Securian Winter Sales Conferences (24,000+ advisor network)

### Financial Advisor — Ameriprise Financial
*Minneapolis, MN | July 2023 – June 2024*

- Identified **$18.4M in convertible AUM** via Excel/VBA customer segmentation and cohort analysis
- Retained **$3.1M in at-risk assets** through quantitative reallocation strategies
- Ranked **#1 in qualified appointments**, 97% client satisfaction

### Licensed Real Estate Agent / Investment Analyst — eXp Realty
*White Bear Lake & Apple Valley, MN | May 2022 – December 2023*

- Built lead qualification and appraisal gap risk models converting behavioral signals into pipeline
- Executed **1,000+ outreach touchpoints** achieving **10% conversion** to qualified leads

---

## BlackRoad OS — Platform Architecture

> Built in 9 months. 1,533 repositories. 6 compute nodes. 20 product divisions. 0 outside engineers.

### Retrieval Augmented Generation (RAG) Engine
| Metric | Value |
|--------|-------|
| Indexed entries | **156,675** |
| SQLite databases | **228** |
| Semantic index size | **184 MB** |
| Query latency (p95) | **< 50 ms** |
| Vector stores in production | **4** (Qdrant, Weaviate, Chroma, Milvus) |
| Retrieval strategies | **3** (dense embedding, BM25 sparse, metadata filter) |

- **Hybrid retrieval pipeline** — dense vector embeddings (sentence-transformers, ada-002) + BM25 sparse keyword search fire in parallel; results merged via reciprocal rank fusion, then scored by cross-encoder re-ranker before LLM injection
- **Intelligent chunking** — recursive splitting with 128-token overlap, semantic boundary detection, parent-child chunk linking preserving document-level context across 228 databases
- **Citation grounding** — 100% of generated responses map claims to source chunk IDs with document-level traceability, enabling FINRA/SEC audit compliance
- **Federated multi-store search** — Qdrant (HNSW, 156K vectors), PostgreSQL (structured metadata), SQLite FTS5 (full-text fallback), Cloudflare KV (40 namespaces, edge cache) — single query fans out to all 4 stores

### Multi-Agent Orchestration (Agentic AI)
| Metric | Value |
|--------|-------|
| Agent modules | **14** |
| Specialized roles | **9** |
| CLI tools available to agents | **22** |
| Fleet nodes | **6** |
| Heartbeat interval | **60 sec** |
| Design ceiling | **30,000 concurrent agents** |

- **9 agent roles** in production: planner, researcher, coder, reviewer, deployer, monitor, healer, memory-keeper, router — each with isolated tool permissions and cryptographic identity
- **Autonomous DAG execution** — agents decompose tasks into subtask graphs, execute ≤6 parallel branches, checkpoint every 30 sec, self-correct on failure with ≤3 retry attempts before escalation
- **Tool use / function calling** — 22 CLI tools + SSH to 6 fleet nodes + 8 D1 databases + 40 KV namespaces + external APIs — agents chain 5-15 tool calls per task
- **Capability routing** — task marketplace scores agents on 12-dimension skill vectors, current load (CPU/RAM/GPU), and hardware affinity (Hailo-8 vision tasks, NVMe-heavy data tasks)
- **Zero-downtime lifecycle** — registration → identity verification (ed25519 keys) → health heartbeats (60s) → automatic failover (< 5 sec) → graceful drain on shutdown

### Persistent Memory System (PS-SHA-∞)
| Metric | Value |
|--------|-------|
| Memory entries | **156,675** |
| Concurrent AI instances | **100+** |
| Sync polling interval | **1 ms** |
| Hash chain algorithm | **SHA-256** |
| Journal format | **Append-only JSONL** |
| Compliance standards | **SEC 204-2, FINRA 4511** |

- **Cryptographic audit trail** — every write produces a SHA-256 chained JSONL entry; 156K+ entries form an immutable ledger verifiable in O(n) time
- **Cross-session continuity** — 0% context loss between AI sessions; agents resume with full prior state, eliminating cold-start degradation
- **Real-time sync** — 100+ concurrent instances, 1ms poll cycle, lock-free writes, checkpoint-based conflict resolution with < 10ms convergence
- **Regulatory-grade** — chain verification satisfies SEC 204-2 record retention (6-year minimum) and FINRA 4511 (books and records) requirements

### Edge AI Inference Network
| Metric | Value |
|--------|-------|
| Compute nodes | **6** (4x Pi 5 + 2x cloud VPS) |
| Neural accelerators | **2x Hailo-8** |
| Total edge TOPS | **52** |
| LLMs deployed | **29** (4 custom fine-tuned) |
| Model families | **8** (Mistral, Llama 3, CodeLlama, Qwen, Phi, DeepSeek, Gemma, custom) |
| Inference latency (p95) | **< 200 ms** |
| Cloud cost reduction | **57-71%** ($1.0-1.3K vs $3.5K/mo) |
| Edge-first routing | **80%+ requests served locally** at $0/token |
| Memory reduction via quantization | **4-8x** (GGUF/GPTQ) |

- **29 models across 4 edge nodes** with health-aware load balancing, automatic model hot-swap, per-model token counting, and latency-based routing
- **52 TOPS acceleration** — 2x Hailo-8 (26 TOPS each) running YOLOv5 object detection, ResNet-50 classification, and custom ONNX pipelines at wire speed
- **Cost arbitrage engine** — routes 80%+ of inference to $0/token edge models; Claude/GPT-4 fallback triggers only when local confidence < threshold — saves **$2.2-2.5K/month**
- **Quantized serving** — 7B+ parameter models run on 8GB devices via GGUF 4-bit quantization, maintaining > 95% benchmark accuracy vs. full-precision baselines

### AI Gateway & Guardrails
| Metric | Value |
|--------|-------|
| LLM providers | **4** (Anthropic, OpenAI, Ollama, Gemini) |
| Policy rules (OPA/Rego) | **Active enforcement** |
| Failover time | **< 500 ms** |
| Trace propagation | **100% of requests** |
| Cost granularity | **Per-token, per-model, per-user** |

- **Unified API** (Hono/Zod, TypeScript) — single endpoint, 4 provider backends, latency-based selection with < 500ms automatic failover
- **Policy engine** (OPA/Rego) — enforces token budgets, content safety filters, model ACLs, and compliance constraints evaluated in < 5ms per request
- **Full observability** — OpenTelemetry traces span agent → gateway → model with per-request IDs; Grafana dashboards track p50/p95/p99 latency, cost per-token per-model, error rates, and service dependency graphs

### Multimodal AI Pipeline
| Metric | Value |
|--------|-------|
| Image generation providers | **4** (DALL-E 3, Flux, SDXL, FAL) |
| Storage backend | **Cloudflare R2** (10 buckets) |
| Metadata index | **Cloudflare D1** |
| TTS endpoints | **1** (dedicated Cecilia node) |
| CDN domain | **images.blackroad.io** |

- **4-agent generation system** — intelligent provider selection by style/cost/speed; DALL-E 3 for photorealism, Flux for speed, SDXL for artistic control, FAL for batch
- **Vision-language RAG** — images, screenshots, and diagrams processed alongside text in retrieval pipeline for multimodal context injection
- **CLI tooling** — `br-generate` and `br-upload` for batch operations; D1 metadata indexing enables semantic search over generated assets

### Sovereign Infrastructure (Zero Vendor Lock-in)
| Metric | Value |
|--------|-------|
| Total repositories | **1,533** (1,326 GitHub + 207 Gitea) |
| GitHub organizations | **15** |
| Product divisions | **20** |
| Deployed web services | **334** |
| Cloudflare Workers | **130+** |
| Cloudflare Pages | **95+** |
| Custom domains | **48+** |
| Tunnels | **18** |
| KV namespaces | **40** |
| D1 databases | **8** |
| R2 buckets | **10** |
| Mesh WiFi APs | **5** (RoadNet) |
| WireGuard peers | **6** |
| DNS zones (custom) | **5** (.blackroad, .cece, .entity, .soul, .dream) |
| USPTO trademarks | **3** (BLACKROAD OS, BLACKBOXPROGRAMMING, ALICE) |
| Total distributed storage | **1.25 TB+** |
| Infrastructure codebase | **400+ Bash, 240+ Node.js, 100+ Dockerfiles** |

- **Full sovereign stack** — Kubernetes (1.2GB), Terraform (347MB), Vault (341MB), vLLM, Ray, Nextcloud (5.9GB), Home Assistant, Godot, Krita, and 100+ platforms forked, maintained, and deployable on-prem or cloud
- **Carrier-grade networking** — RoadNet mesh WiFi (5 APs, 5 /24 subnets), WireGuard VPN (6 peers), Headscale/Tailscale overlay, Pi-hole + PowerDNS with 5 custom TLDs
- **Self-healing fleet** — autonomy daemons on every node: heartbeat (60s), auto-heal (5min), service watchdog (30s), power optimization (5min) — all cron-persistent

---

## Licenses & Certifications

- **FINRA:** SIE, Series 7, Series 63, Series 65 (CRD# 7794541)
- **Insurance:** Life & Health (Minnesota)
- **Trademarks (USPTO):** BLACKROAD OS, BLACKBOXPROGRAMMING, ALICE

---

## Education

**University of Minnesota — Twin Cities**
B.A., Strategic Communication: Advertising & Public Relations | December 2022

---

## Awards

National Speech & Debate Finalist | Securian Winter Sales Conference Presenter (2x) | LPL Due Diligence Presenter | Ameriprise Sales Training Award | Enterprise MSP Sales Award (3x)

---

## BlackRoad OS — By The Numbers

*Metrics updated daily. All figures GitHub-verified or infrastructure-audited.*

| Category | Metric | Value |
|----------|--------|-------|
| **AI / LLM** | Models in production | **29** (8 families, 4 custom) |
| | RAG entries indexed | **156,675** |
| | Semantic index | **184 MB** across **228 databases** |
| | Vector databases | **4** (Qdrant, Weaviate, Chroma, Milvus) |
| | Neural accelerators | **2x Hailo-8 (52 TOPS)** |
| | LLM providers unified | **4** (Anthropic, OpenAI, Ollama, Gemini) |
| | Agent modules / roles | **14 / 9** |
| | LLM cost reduction | **57-71%** ($2.2-2.5K/mo saved) |
| | Inference latency (p95) | **< 200 ms** edge, **< 50 ms** RAG query |
| **Infrastructure** | Compute nodes | **6** (4x Pi 5 + 2x cloud VPS) |
| | Total repositories | **1,533** (1,326 GitHub + 207 Gitea) |
| | GitHub organizations | **15** |
| | Cloudflare Workers | **130+** |
| | Cloudflare Pages | **95+** |
| | Custom domains | **48+** |
| | Tunnels / KV / D1 / R2 | **18 / 40 / 8 / 10** |
| | Deployed web services | **334** |
| | Distributed storage | **1.25 TB+** |
| **Code** | Bash scripts | **400+** |
| | Node.js projects | **240+** |
| | Dockerfiles | **100+** |
| | Product divisions | **20** |
| | USPTO trademarks | **3** |
