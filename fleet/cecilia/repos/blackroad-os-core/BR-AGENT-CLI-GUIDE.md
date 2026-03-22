# BlackRoad Agent CLI Guide

Complete guide to using the BlackRoad Agent terminal commands.

## Installation

Add to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
export PATH="$PATH:/Users/alexa/blackroad-sandbox/scripts"
```

Then reload: `source ~/.zshrc` or `source ~/.bashrc`

## Quick Start Commands

### Launch Pre-Configured Agents (Fastest)

```bash
br-finance     # Launch Financial Analyst agent
br-research    # Launch Research Assistant agent
br-devops      # Launch DevOps Engineer agent
br-content     # Launch Content Writer agent
br-legal       # Launch Contract Reviewer agent
```

### Main CLI: br-agent

```bash
# Show help
br-agent help

# List active agents
br-agent list

# Show system statistics
br-agent stats

# List available packs
br-agent packs

# Search marketplace
br-agent search
br-agent search --query "financial"
br-agent search --category finance
```

## Spawning Agents

### Method 1: From Pack Template (Recommended)

```bash
# Spawn from pack
br-agent from-pack <pack-id> <agent-name>

# Examples:
br-agent from-pack pack-finance financial-analyst
br-agent from-pack pack-research-lab experiment-designer
br-agent from-pack pack-infra-devops deployment-engineer
```

### Method 2: Custom Agent

```bash
# Spawn custom agent
br-agent spawn <role> [--pack <pack>] [--capabilities <cap1,cap2>]

# Examples:
br-agent spawn "Financial Analyst" --pack pack-finance
br-agent spawn "Data Analyst" --capabilities analyze_data,generate_reports
br-agent spawn "Security Auditor" --pack pack-legal --capabilities audit_code,check_vulnerabilities
```

## Available Packs

### pack-finance
**Agents:**
- `financial-analyst` - Transaction analysis, reporting, forecasting
- `revenue-forecaster` - Revenue prediction and trend analysis

**Capabilities:**
- analyze_transactions
- generate_reports
- forecast_revenue
- analyze_trends

### pack-legal
**Agents:**
- `contract-reviewer` - Contract review and risk identification
- `compliance-checker` - Compliance auditing

**Capabilities:**
- review_contracts
- check_compliance
- draft_documents
- identify_risks
- audit_documents

### pack-research-lab
**Agents:**
- `research-assistant` - Literature review, knowledge synthesis
- `experiment-designer` - Experiment design and analysis

**Capabilities:**
- search_papers
- synthesize_knowledge
- design_experiments
- cite_sources
- analyze_results

### pack-creator-studio
**Agents:**
- `content-writer` - Content generation and SEO
- `graphic-designer` - Graphics and layout design

**Capabilities:**
- generate_content
- edit_copy
- optimize_seo
- design_graphics
- create_layouts

### pack-infra-devops
**Agents:**
- `deployment-engineer` - Service deployment and infrastructure
- `sre-monitor` - System monitoring and incident response

**Capabilities:**
- deploy_services
- manage_infrastructure
- configure_ci_cd
- monitor_systems
- analyze_metrics
- respond_to_incidents

## Managing Agents

```bash
# List all active agents
br-agent list

# Terminate an agent
br-agent terminate <agent-id>

# Example:
br-agent terminate 1a2b3c4d
```

## Marketplace

```bash
# Search all templates
br-agent search

# Search by query
br-agent search --query "financial analysis"

# Search by category
br-agent search --category finance

# Available categories:
# finance, legal, research, creative, devops, support, analytics, automation, general
```

## Installing Packs

```bash
# Install a pack
br-agent install <pack-id>

# Example:
br-agent install pack-research-lab
```

## Statistics

```bash
# Show system stats
br-agent stats

# Output includes:
# - Active agents count
# - System capacity (max 30,000 agents)
# - Communication stats (messages sent/received)
# - Marketplace stats (templates, downloads)
```

## Configuration

Default configuration: `.br-agent-config.json`

Key settings:
- **runtime_type**: Default runtime (llm_brain, workflow_engine, etc.)
- **auto_start**: Auto-start agents on spawn
- **resources**: Default CPU/memory allocation
- **breath_sync**: Enable Lucidia breath synchronization
- **max_agents**: Maximum agent capacity (30,000)

## Examples Workflow

### 1. Financial Analysis Workflow

```bash
# Spawn financial analyst
br-agent from-pack pack-finance financial-analyst

# List to get agent ID
br-agent list

# Use the agent (via communication bus in your code)
# Terminate when done
br-agent terminate <agent-id>
```

### 2. Quick Launch

```bash
# Just use the shortcut
br-finance
```

### 3. Research Project

```bash
# Install research pack
br-agent install pack-research-lab

# Spawn research assistant
br-agent from-pack pack-research-lab research-assistant

# Spawn experiment designer
br-agent from-pack pack-research-lab experiment-designer

# Check both are running
br-agent list
```

### 4. DevOps Deployment

```bash
# Launch DevOps agent
br-devops

# Or spawn deployment engineer directly
br-agent from-pack pack-infra-devops deployment-engineer
```

## Advanced Features

### Breath Synchronization
Agents spawn preferentially during Lucidia breath expansion phases (𝔅>0) for optimal system harmony.

### Emotional States
Agents track emotional states: CURIOSITY, HOPE, FEAR, LOVE, DOUBT, TRUST, JOY, GRIEF, WONDER, PEACE, TURBULENCE, CLARITY

### PS-SHA∞ Identity
Agents maintain immutable identity chains for resurrection across implementations.

### Parent-Child Lineage
Agents can spawn child agents, maintaining lineage relationships.

### Communication Patterns
- Point-to-point messaging
- Broadcast (pub/sub)
- Request/response with correlation IDs
- Priority queues (LOW, NORMAL, HIGH, URGENT)

## Troubleshooting

### Command not found
```bash
# Add to PATH
export PATH="$PATH:/Users/alexa/blackroad-sandbox/scripts"
```

### Permission denied
```bash
# Make scripts executable
chmod +x /Users/alexa/blackroad-sandbox/scripts/br-*
```

### Agent spawn fails
```bash
# Check system stats
br-agent stats

# Check if at capacity (30,000 agents max)
br-agent list
```

### Pack not found
```bash
# Install the pack first
br-agent install <pack-id>

# List available packs
br-agent packs
```

## Integration with Code

For programmatic agent interaction, see the infrastructure files:
- `src/blackroad_core/spawner.py` - Agent spawning
- `src/blackroad_core/communication.py` - Message bus
- `src/blackroad_core/marketplace.py` - Template discovery
- `src/blackroad_core/packs/__init__.py` - Pack system

## Links

- Main docs: `docs/AGENT_INFRASTRUCTURE.md`
- Test suite: `tests/test_agent_infrastructure.py`
- Configuration: `.br-agent-config.json`

---

**Color Palette Reference:** #FF9D00 #FF6B00 #FF0066 #FF006B #D600AA #7700FF #0066FF
