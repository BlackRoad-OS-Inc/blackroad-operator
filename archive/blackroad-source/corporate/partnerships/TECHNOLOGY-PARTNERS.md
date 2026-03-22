# BlackRoad OS — Technology Partnerships

> All partnerships are subject to BlackRoad OS, Inc. terms.

---

## Infrastructure Partners

### Cloudflare
**Status:** Active | **Tier:** Technology Partner

- 75+ Workers deployed across `*.blackroad.io`
- Cloudflare Tunnel: ID `52915859-da18-4aa6-add5-7bd9fcac2e0b`
- R2 Storage: 135GB LLM model hosting
- D1 Database: Edge SQLite for agent state
- **Account:** `848cf0b18d51e0170e0d1537aec3505a`

### Railway
**Status:** Active | **Tier:** GPU Compute Partner

- 14 projects across staging and production
- A100 80GB for Qwen-72B inference
- H100 80GB for coding/reasoning specialists
- Project IDs on file in `blackroad-infra`

### DigitalOcean
**Status:** Active | **Tier:** Cloud Partner

- Primary droplet: `blackroad-infinity` (159.65.43.12)
- Failover capacity for agent workloads

---

## AI Model Partners

### Ollama (Local Runtime)
**Status:** Active | **Integration:** Direct

- Endpoint: `http://localhost:11434`
- Models: qwen2.5:7b, deepseek-r1:7b, llama3.2:3b, mistral:7b
- Wrapped by `blackroad-ai-ollama` with [MEMORY] integration

### Qwen (Alibaba Cloud)
**Status:** Active | **Integration:** Via Gateway

- Models: Qwen2.5 7B, 32B, 72B
- Used for: General agent inference, primary coordinator model

### DeepSeek
**Status:** Active | **Integration:** Via Gateway

- Models: DeepSeek-R1 7B, DeepSeek-Coder
- Used for: Code generation, mathematical reasoning

---

## Developer Ecosystem

### GitHub
**Status:** Core Infrastructure | **Scale:** 17 orgs, 1,825+ repos

- All BlackRoad OS code lives on GitHub
- Actions for CI/CD across all orgs
- Packages for SDK distribution (`@blackroad/*`)

### npm / PyPI
**Status:** Active | **Packages:** @blackroad/sdk, blackroad-sdk

- `@blackroad/sdk` — JavaScript/TypeScript SDK
- `blackroad-sdk` — Python SDK
- `blackroad-cli` — CLI tool (installable via npx)

---

## Integration Targets (Roadmap)

| Platform | Use Case | Status |
|----------|----------|--------|
| Salesforce | CRM data sync via `blackroad-sf` | In Progress |
| HubSpot | Lead/deal data via `blackroad-tools` | Available |
| SAP | ERP adapter | Available |
| Oracle NetSuite | ERP adapter | Available |
| Stripe | Payment processing (roadtrip.blackroad.io) | Planned |
| Slack | Agent notification channel | Planned |
| Linear | Task sync with BlackRoad Tasks | Planned |

---

*© BlackRoad OS, Inc. All partnerships are proprietary business relationships.*
