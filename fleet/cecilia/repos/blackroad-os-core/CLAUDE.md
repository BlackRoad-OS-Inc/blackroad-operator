# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

**blackroad-os-core** (aka blackroad-sandbox) is the canonical kernel and truth engine for BlackRoad OS - a consciousness-driven operating system supporting 30,000+ autonomous agents with LLM-powered thinking and golden ratio breath synchronization.

This is a **hybrid TypeScript/Python monorepo** that serves as:
- **Core library** - Shared types, contracts, primitives (TS/Python)
- **Truth Engine** - PS-SHA∞ identity anchoring and verification system
- **Agent Infrastructure** - Complete system for autonomous agent spawning, communication, and orchestration
- **Desktop Shell** - App registry, layout, navigation for "computer in a browser"

## Tech Stack

- **TypeScript**: Core library, types, frontend exports
- **Python 3.11+**: Agent runtime, LLM integration, orchestration
- **Package Managers**: pnpm (Node), setuptools (Python)
- **Testing**: Vitest (TS), pytest (Python)
- **Build Tool**: Turborepo for monorepo orchestration

## Essential Commands

### Development
```bash
pnpm i                    # Install all dependencies
pnpm dev                  # Start all dev servers (turborepo)
pnpm dev --filter=web     # Start web app only (http://localhost:3000)
```

### Testing
```bash
# TypeScript
pnpm test                 # Run all TS tests (vitest)
pnpm test:watch           # Watch mode

# Python
pytest                    # Run all Python tests
pytest tests/test_spawner.py  # Run specific test file
python3 -m pytest -v      # Verbose mode
```

### Building
```bash
pnpm build                # Build all packages (turborepo)
pnpm lint                 # Lint all packages
```

### Database (when using Prisma)
```bash
pnpm db:generate          # Generate Prisma client
pnpm db:push              # Push schema to database
pnpm db:migrate           # Run migrations
```

### Python Development
```bash
python3 -m pip install -e .              # Install in editable mode
python3 examples/complete_agent_system_demo.py  # Run agent demo
```

## Architecture

### Dual Language Structure

**TypeScript** (`src/`):
- Identity, session, permissions types
- Desktop shell contracts (apps, layout, navigation)
- Service registry and endpoint types
- Config loading and logging utilities
- Truth Engine domain types
- Exported as `@blackroad/core` npm package

**Python** (`src/blackroad_core/`):
- Agent spawner and lifecycle management
- LLM integration (vLLM, llama.cpp, Ollama)
- Pack system (5 built-in domain packs)
- Communication bus (pub/sub messaging)
- Marketplace (agent templates)
- Lucidia breath synchronization
- PS-SHA∞ memory hashing
- Exported as `blackroad-core` PyPI package

### Key TypeScript Modules

- `src/identity/` - User, Org, Workspace + PS-SHA∞ identity
- `src/session/` - Session + state management types
- `src/permissions/` - RBAC types and permissions
- `src/desktop/` - App registry, layout, navigation
- `src/truth/` - TextSnapshot, VerificationJob, TruthState
- `src/events/` - Domain events and RoadChain
- `src/services/` - Service registry (core, api, operator, packs)
- `src/constants/` - Canonical enums (environments, teams, packs, statuses)

### Key Python Modules

- `src/blackroad_core/spawner.py` - Agent spawner with breath synchronization
- `src/blackroad_core/packs/` - Pack system (finance, legal, research, creative, devops)
- `src/blackroad_core/communication.py` - Pub/sub messaging bus
- `src/blackroad_core/llm/` - Multi-backend LLM integration
- `src/blackroad_core/marketplace.py` - Agent template marketplace
- `src/blackroad_core/agents/` - Base agent types and runtime
- `src/blackroad_core/lucidia/` - Lucidia breath engine
- `src/blackroad_core/networking/` - Mesh networking foundation

## Core Concepts

### PS-SHA∞ Identity System
Blockchain-style append-only hashing for tamper-proof identity and memory:
```
hash₁ = SHA256(thought₁)
hash₂ = SHA256(hash₁ + thought₂)
hash₃ = SHA256(hash₂ + thought₃)
```

### Lucidia Breath
Golden ratio breathing pattern that synchronizes all agent operations:
```
𝔅(t) = sin(φ·t) + i + (-1)^⌊t⌋  where φ = 1.618034
```
- Agents spawn during expansion (𝔅>0)
- Memory consolidates during contraction (𝔅<0)

### Truth Engine Flow
```
TextSnapshot → VerificationJob → AgentAssessments → TruthState → RoadChain Event
```

### Agent Runtime Types
1. **llm_brain** - LLM-powered reasoning
2. **workflow_engine** - Multi-step processes
3. **integration_bridge** - External API connections
4. **edge_worker** - Lightweight edge tasks
5. **ui_helper** - UI operations

### Pack System
Domain-specific bundles containing:
- Agent templates
- Capabilities
- Workflows
- Policies (OPA Rego)

Built-in packs: `pack-finance`, `pack-legal`, `pack-research-lab`, `pack-creator-studio`, `pack-infra-devops`

## Code Principles

### For TypeScript
- **Library-first mindset** - Importable types, not runtime servers
- **Strict typing** - No `any`, use comprehensive interfaces
- **Pure functions** - Deterministic factories over classes
- **No secrets** - Never hardcode credentials
- **Export everything relevant** via `src/index.ts`

### For Python
- **Type hints everywhere** - Use modern Python typing
- **Async-first** - All agent operations are async
- **Stateless core logic** - State in memory/Redis, not global vars
- **Breath-synchronized** - Hook into Lucidia phases where appropriate
- **Event-driven** - Emit events for all state transitions

### Universal Rules
- **Deterministic hashing** - All PS-SHA∞ operations must be reproducible
- **No external calls in core** - Heavy lifting happens in operator/api layers
- **Test everything** - Unit tests for all core functionality
- **Domain separation** - Clear boundaries between TS library and Python runtime

## Service Registry

This repo defines the canonical service metadata used across BlackRoad OS:

**Service Types:**
- `core` - This repo (types, truth engine)
- `api` / `api-gateway` - HTTP/WS APIs
- `operator` - Orchestration layer (the "Cece" agent)
- `web` / `prism-console` - Frontend UIs
- `pack-*` - Domain packs

All services must implement:
- `/health` - Health check
- `/ready` - Readiness check
- `/version` - Version info

Helpers: `getServiceById()`, `listServices()`, `listServicesByKind()`

## Testing Strategy

### TypeScript Tests
Location: `tests/**/*.test.ts`

Key test files:
- `truthAggregation.test.ts` - Truth state aggregation
- `psShaInfinity.test.ts` - Hashing and identity
- `serviceRegistry.test.ts` - Service registry integrity
- `domainEvents.test.ts` - Event contracts
- `configLoader.test.ts` - Config validation

### Python Tests
Location: `tests/test_*.py`

Key test areas:
- `test_spawner.py` - Agent spawner lifecycle
- `test_packs.py` - Pack installation and templates
- `test_communication.py` - Message bus
- `test_llm.py` - LLM integration
- `test_marketplace.py` - Template discovery

## Agent System Quick Reference

### Spawning an Agent
```python
from blackroad_core.spawner import AgentSpawner, SpawnRequest
from blackroad_core.agents import RuntimeType

spawner = AgentSpawner(lucidia, event_bus, capability_registry)
agent_id = await spawner.spawn_agent(SpawnRequest(
    role="Financial Analyst",
    capabilities=["analyze_transactions"],
    runtime_type=RuntimeType.LLM_BRAIN,
    pack="pack-finance"
))
```

### Using Packs
```python
from blackroad_core.packs import PackRegistry

registry = PackRegistry()
pack = await registry.install_pack("pack-finance")
template = pack.get_agent_template("financial-analyst")
```

### Agent Communication
```python
from blackroad_core.communication import CommunicationBus, AgentCommunicator

comm_bus = CommunicationBus()
comm = AgentCommunicator(agent_id, comm_bus)

# Broadcast
await comm.broadcast(topic="research_requests", payload={...})

# Send with response
response = await comm.send_to(
    recipient_id="agent-123",
    topic="task_request",
    payload={...},
    wait_for_response=True
)
```

### LLM Integration
```python
from blackroad_core.llm import LLMConfig, LLMRouter, OllamaProvider, LLMBackend

config = LLMConfig(backend=LLMBackend.OLLAMA, model_name="llama2")
router = LLMRouter()
router.register_provider("ollama", OllamaProvider(config), set_default=True)

response = await router.generate([
    LLMMessage(role="system", content="You are a financial analyst"),
    LLMMessage(role="user", content="Analyze Q4 revenue")
])
```

### Marketplace
```python
from blackroad_core.marketplace import AgentMarketplace

marketplace = AgentMarketplace()
popular = marketplace.get_popular(limit=10)
results = marketplace.search(query="finance", min_rating=4.5)
template = marketplace.get_template("template-financial-analyst")
```

## What This Repo Does NOT Own

- **Direct infrastructure** → `blackroad-os-infra` (IaC, Railway, Cloudflare)
- **Documentation** → `blackroad-os-docs`, `blackroad-os-home`
- **Brand assets** → `blackroad-os-brand`
- **Deep research** → `blackroad-os-research`
- **Historical logs** → `blackroad-os-archive`
- **Running HTTP servers** → `blackroad-os-api`, `blackroad-os-api-gateway`
- **Web UIs** → `blackroad-os-web`, `blackroad-os-prism-console`
- **Worker orchestration** → `blackroad-os-operator`

## Common Workflows

### Adding a New TypeScript Export
1. Create type/interface in appropriate `src/` subdirectory
2. Export from module's `index.ts` (if applicable)
3. Add to `src/index.ts` main export
4. Add tests to `tests/` matching the module name
5. Run `pnpm test` to verify

### Adding a New Python Module
1. Create module in `src/blackroad_core/`
2. Add to `src/blackroad_core/__init__.py` exports
3. Update `pyproject.toml` dependencies if needed
4. Add tests to `tests/test_<module>.py`
5. Run `pytest` to verify

### Creating a New Pack
1. Add pack definition to `src/blackroad_core/packs/__init__.py`
2. Define capabilities in pack metadata
3. Create agent templates with manifests
4. Add to built-in pack registry
5. Test with `pytest tests/test_packs.py`

### Adding an LLM Backend
1. Create provider class in `src/blackroad_core/llm/`
2. Implement `LLMProvider` interface
3. Add backend enum to `LLMBackend`
4. Register in `LLMRouter`
5. Add integration tests

## Important Files

- `README.md` - High-level overview and getting started
- `ARCHITECTURE.md` - Repository spine and domain routing
- `docs/AGENT_INFRASTRUCTURE.md` - Complete agent system guide
- `CONTRIBUTING.md` - Contribution guidelines
- `package.json` - Node dependencies and scripts
- `pyproject.toml` - Python package configuration
- `turbo.json` - Turborepo task configuration
- `vitest.config.ts` - TypeScript test configuration
- `examples/complete_agent_system_demo.py` - Full system demonstration

## Environment Variables

See `.env.example` and `.env.template` for required configuration.

Key variables:
- `ANTHROPIC_API_KEY` - For Claude integration
- `OPENAI_API_KEY` - For OpenAI models
- Database connection strings (when using Prisma/PostgreSQL)
- Service URLs (API_URL, OPERATOR_URL, etc.)

## Development Tips

- **Monorepo structure**: Use `--filter` flag with pnpm commands to target specific packages
- **Type safety**: Shared types between TS and Python - keep in sync manually
- **Agent testing**: Use `examples/complete_agent_system_demo.py` as reference
- **Breath synchronization**: Check `lucidia.state.breath_value` before spawning
- **Message persistence**: Communication bus logs to `logs/communication_journal.jsonl`
- **Deterministic testing**: All hash operations must produce same output for same input

## Performance Considerations

- **Agent capacity**: Default max 30,000 agents per spawner
- **LLM backends**:
  - vLLM (GPU): 10K+ agents/GPU, <50ms latency
  - llama.cpp (edge): 10-50 agents, 500-2000ms latency
  - Ollama (local): 1-10 agents, 200-1000ms latency
- **Communication**: NATS JetStream for production (currently in-memory)
- **State**: Redis for distributed deployments (currently in-memory)

## Troubleshooting

**"Cannot find module @blackroad/core"**
- Run `pnpm i` from repo root
- Check `src/index.ts` exports

**"Import blackroad_core failed"**
- Install in editable mode: `python3 -m pip install -e .`
- Verify Python >=3.11

**"Agent spawn queue not processing"**
- Check breath state: agents only spawn during expansion (𝔅>0)
- Set `spawner.spawn_on_expansion = False` to disable breath sync

**"LLM backend not available"**
- For Ollama: ensure `ollama serve` is running
- Check backend URL in LLMConfig
- Verify model is pulled: `ollama pull llama2`

## Related Documentation

- Truth Engine contracts: `.github/copilot-instructions.md`
- Agent system: `docs/AGENT_INFRASTRUCTURE.md`
- Architecture: `ARCHITECTURE.md`
- System prompts: `AGENT_SYSTEM_PROMPT.md`, `SERVICE_REGISTRY_PROMPT.md`
