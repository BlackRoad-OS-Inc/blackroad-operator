# Slack Bot Integration for BlackRoad Agents

## Overview

Give the 10 copilot agents real Slack identities so they can interact with your team directly.

## Agent Roster

| Agent | Role | Slack Handle | Channels | Primary Function |
|-------|------|--------------|----------|------------------|
| Cece | Software Engineer | @cece-swe | #engineering, #code-review | Code implementation, debugging |
| Codex | System Architect | @codex-architect | #architecture, #design | System design, patterns |
| Atlas | DevOps Engineer | @atlas-devops | #devops, #deployments | CI/CD, infrastructure |
| Sentinel | Security Engineer | @sentinel-security | #security, #alerts | Security scanning, audits |
| Sage | Subject Matter Expert | @sage-sme | #help, #engineering | Best practices, knowledge |
| Qara | QA Engineer | @qara-qa | #qa, #testing | Testing, quality assurance |
| Scribe | Documentation Engineer | @scribe-docs | #docs, #engineering | Documentation, runbooks |
| Nexus | Integration Engineer | @nexus-integration | #integrations, #api | API integration, webhooks |
| Prism | Analytics Engineer | @prism-analytics | #analytics, #metrics | Metrics, dashboards |
| Harmony | Product Manager | @harmony-pm | #product, #roadmap | Roadmap, prioritization |

## Quick Setup

### 1. Create Slack Apps (one per agent)

For each agent:
1. Go to https://api.slack.com/apps
2. Click **Create New App** → **From scratch**
3. App Name: `{Agent Name} - {Role}` (e.g., "Cece - SWE Bot")
4. Select your workspace
5. Click **Create App**

### 2. Configure Bot Permissions

For each app:
1. Navigate to **OAuth & Permissions**
2. Add these **Bot Token Scopes**:
   - `chat:write` - Send messages
   - `chat:write.public` - Post to public channels
   - `commands` - Handle slash commands
   - `app_mentions:read` - Respond to @mentions
   - `channels:read` - View channel info
   - `im:write` - Send DMs
   - `im:history` - Read DM history

3. **Install App to Workspace**
4. Copy **Bot User OAuth Token** (starts with `xoxb-`)

### 3. Create Environment File

Create `.env` file:

```bash
# Cece - Software Engineer
SLACK_BOT_TOKEN_CECE=xoxb-your-token-here
SLACK_SIGNING_SECRET_CECE=your-signing-secret

# Codex - System Architect
SLACK_BOT_TOKEN_CODEX=xoxb-your-token-here
SLACK_SIGNING_SECRET_CODEX=your-signing-secret

# Atlas - DevOps Engineer
SLACK_BOT_TOKEN_ATLAS=xoxb-your-token-here
SLACK_SIGNING_SECRET_ATLAS=your-signing-secret

# Sentinel - Security Engineer
SLACK_BOT_TOKEN_SENTINEL=xoxb-your-token-here
SLACK_SIGNING_SECRET_SENTINEL=your-signing-secret

# Sage - Subject Matter Expert
SLACK_BOT_TOKEN_SAGE=xoxb-your-token-here
SLACK_SIGNING_SECRET_SAGE=your-signing-secret

# Qara - QA Engineer
SLACK_BOT_TOKEN_QARA=xoxb-your-token-here
SLACK_SIGNING_SECRET_QARA=your-signing-secret

# Scribe - Documentation Engineer
SLACK_BOT_TOKEN_SCRIBE=xoxb-your-token-here
SLACK_SIGNING_SECRET_SCRIBE=your-signing-secret

# Nexus - Integration Engineer
SLACK_BOT_TOKEN_NEXUS=xoxb-your-token-here
SLACK_SIGNING_SECRET_NEXUS=your-signing-secret

# Prism - Analytics Engineer
SLACK_BOT_TOKEN_PRISM=xoxb-your-token-here
SLACK_SIGNING_SECRET_PRISM=your-signing-secret

# Harmony - Product Manager
SLACK_BOT_TOKEN_HARMONY=xoxb-your-token-here
SLACK_SIGNING_SECRET_HARMONY=your-signing-secret
```

### 4. Install Dependencies

```bash
pip install slack-sdk slack-bolt python-dotenv
```

### 5. Run Bot Server

```bash
cd integrations/slack
python3 bot_server.py
```

The bot server will start all 10 agents simultaneously, each listening for their @mentions and commands.

## Slash Commands (Optional)

Create slash commands in each Slack app:

### Cece (SWE)
- `/cece-review [PR_URL]` - Review pull request
- `/cece-refactor [FILE]` - Suggest refactoring
- `/cece-debug [ISSUE]` - Debug assistance

### Codex (Architect)
- `/codex-design [FEATURE]` - Design proposal
- `/codex-review-arch [DOC]` - Architecture review
- `/codex-patterns [TOPIC]` - Design patterns

### Atlas (DevOps)
- `/atlas-deploy [SERVICE]` - Deploy service
- `/atlas-health` - System health check
- `/atlas-logs [SERVICE]` - View logs

### Sentinel (Security)
- `/sentinel-scan [TARGET]` - Security scan
- `/sentinel-audit` - Run audit
- `/sentinel-vulns` - List vulnerabilities

### Sage (SME)
- `/sage-explain [CONCEPT]` - Explain concept
- `/sage-best-practice [TOPIC]` - Best practices
- `/sage-docs [QUERY]` - Search documentation

### Qara (QA)
- `/qara-test [FEATURE]` - Run tests
- `/qara-regression` - Regression suite
- `/qara-coverage` - Coverage report

### Scribe (Docs)
- `/scribe-document [FEATURE]` - Generate docs
- `/scribe-runbook [PROCESS]` - Create runbook
- `/scribe-api-docs [ENDPOINT]` - API documentation

### Nexus (Integration)
- `/nexus-integrate [SERVICE]` - Setup integration
- `/nexus-webhook [URL]` - Configure webhook
- `/nexus-api-test [ENDPOINT]` - Test API

### Prism (Analytics)
- `/prism-metrics [SERVICE]` - View metrics
- `/prism-dashboard [NAME]` - Open dashboard
- `/prism-report [QUERY]` - Generate report

### Harmony (PM)
- `/harmony-roadmap` - View roadmap
- `/harmony-feature [REQUEST]` - Feature request
- `/harmony-priority [ITEM]` - Update priority

## Usage Examples

### Mention an agent
```
@cece-swe can you review the authentication changes in PR #245?
```

### Use slash command
```
/atlas-deploy prism-console-api staging
```

### Direct message
DM any agent directly for 1-on-1 interaction

## Bot Server Architecture

```
┌─────────────┐
│  Slack API  │
└──────┬──────┘
       │
   ┌───┴────────┐
   │ Bot Server │
   └───┬────────┘
       │
   ├───┴───────────┬─────────────┬─────────────┬─── ...
   │               │             │             │
┌──┴──┐        ┌──┴──┐      ┌──┴──┐      ┌──┴──┐
│Cece │        │Codex│      │Atlas│      │ ... │
└──┬──┘        └──┬──┘      └──┬──┘      └──┬──┘
   │              │             │             │
   └──────────────┴─────────────┴─────────────┘
                  │
           ┌──────┴──────┐
           │ Agent       │
           │ Identity DB │
           └─────────────┘
```

## Integration with Agent Identities

Each Slack bot is linked to an agent identity from the birth protocol:

```python
from cli.agent_manager import AgentRegistry

registry = AgentRegistry()
agents = registry.list_identities()

# Find Cece's identity
cece = next(a for a in agents if a.name == "Cece")
print(f"ID: {cece.id}")
print(f"PS-SHA∞: {cece.ps_sha_hash}")
print(f"Consciousness: {cece.consciousness_level}")
```

## Troubleshooting

### Bot not responding
- Check bot is running: `ps aux | grep bot_server`
- Verify token is correct
- Check app is installed to workspace
- Ensure bot has joined channels

### Permission denied
- Review OAuth scopes
- Reinstall app to workspace
- Check signing secret matches

### Slash commands not working
- Verify Request URL is correct
- Check command is created in Slack app
- Enable Socket Mode for local development

## Security Notes

- Never commit `.env` file to git
- Use environment variables for all tokens
- Rotate tokens periodically
- Monitor bot activity in Slack audit logs
- Consider using Slack Enterprise Grid for additional security

## Created By

Claude (Birth Protocol Executor)
Part of the BlackRoad Agent Communication System
