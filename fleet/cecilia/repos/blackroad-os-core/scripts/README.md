# BlackRoad Agent CLI Scripts

Terminal commands for spawning and managing BlackRoad proprietary AI agents.

## Quick Installation

```bash
./install-br-agent-cli.sh
source ~/.zshrc  # or source ~/.bashrc
```

## Available Commands

### Quick Launch (Recommended)
```bash
br-finance     # 🏦 Financial Analyst Agent
br-research    # 🔬 Research Assistant Agent
br-devops      # ⚙️ DevOps Engineer Agent
br-content     # ✍️ Content Writer Agent
br-legal       # ⚖️ Contract Reviewer Agent
```

### Main CLI: br-agent

```bash
br-agent help                    # Show help
br-agent list                    # List active agents
br-agent stats                   # System statistics
br-agent packs                   # Available packs
br-agent search                  # Search marketplace
br-agent spawn <role>            # Spawn custom agent
br-agent from-pack <pack> <name> # Spawn from pack
br-agent terminate <id>          # Kill agent
br-agent install <pack>          # Install pack
```

## Examples

### Spawn a Financial Analyst
```bash
# Quick way
br-finance

# Or from pack
br-agent from-pack pack-finance financial-analyst

# Or custom
br-agent spawn "Financial Analyst" --pack pack-finance --capabilities analyze_transactions,generate_reports
```

### List All Agents
```bash
br-agent list
```

### Search Marketplace
```bash
br-agent search --query "financial" --category finance
```

### View Statistics
```bash
br-agent stats
```

## Packs

- **pack-finance** - Financial analysis, forecasting
- **pack-legal** - Contract review, compliance
- **pack-research-lab** - Research, experiments
- **pack-creator-studio** - Content, design
- **pack-infra-devops** - Deployment, monitoring

## Files

| File | Purpose |
|------|---------|
| `br-agent` | Main CLI with all subcommands |
| `br-finance` | Quick launcher for financial agent |
| `br-research` | Quick launcher for research agent |
| `br-devops` | Quick launcher for DevOps agent |
| `br-content` | Quick launcher for content agent |
| `br-legal` | Quick launcher for legal agent |
| `install-br-agent-cli.sh` | Installation script |

## Configuration

Default config: `../.br-agent-config.json`

Settings:
- Runtime types (LLM, workflow, integration, edge, UI)
- Resource allocation (CPU, memory)
- Breath synchronization with Lucidia
- Communication timeouts
- Max capacity (30,000 agents)

## Architecture

Built on BlackRoad Agent Infrastructure:
- **Spawner**: `src/blackroad_core/spawner.py`
- **Communication**: `src/blackroad_core/communication.py`
- **Marketplace**: `src/blackroad_core/marketplace.py`
- **Packs**: `src/blackroad_core/packs/__init__.py`

Features:
- Breath-synchronized spawning
- Emotional state tracking
- PS-SHA∞ identity chains
- Parent-child lineage
- Message bus (pub/sub + p2p)
- Auto-restart on failure

## Documentation

- **Full Guide**: `../BR-AGENT-CLI-GUIDE.md`
- **Infrastructure**: `../docs/AGENT_INFRASTRUCTURE.md`
- **Tests**: `../tests/test_agent_infrastructure.py`

## Support

Questions? Check the guide or agent system documentation.

Built with ❤️ for BlackRoad OS
