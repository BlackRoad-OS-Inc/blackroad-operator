# BlackRoad Multi-Platform Agent Onboarding Guide

## Overview

This guide covers the complete onboarding process for all 1,250 BlackRoad agents across all platforms.

**Platforms Supported:**
- GitHub (already configured)
- Slack (`blackroadinc` workspace)
- Discord (3 servers)
- Reddit (`r/thelightremembers`)
- Instagram (`@blackroad_ai`)
- Linear (`blackboxprogramming` workspace)
- Asana

---

## Table of Contents

1. [Architecture](#architecture)
2. [Quick Start](#quick-start)
3. [Email Configuration](#email-configuration)
4. [Platform Setup](#platform-setup)
5. [CLI Usage](#cli-usage)
6. [Automation Scripts](#automation-scripts)
7. [Troubleshooting](#troubleshooting)

---

## Architecture

### Agent Identity System

**Total Agents:** 1,250
- **Copilot Agents (P1-P10):** 10 agents
- **Foundation Agents (P11-P14):** 4 agents
- **Archetype Agents (P15-P1187):** 1,173 agents
- **Specialized Agents (P1188-P1246):** 59 agents
- **Service Bots (P1247-P1250):** 4 agents

### Email Domains

All agents are assigned email addresses across 6 domains with balanced distribution:

| Domain | Capacity | Purpose |
|--------|----------|---------|
| `blackroad.ai` | 500 | Primary agent communications |
| `blackroad.io` | 300 | Developer/technical agents |
| `thelightremembers.com` | 200 | Community agents |
| `blackboxprogramming.com` | 200 | Engineering agents |
| `prism.blackroad.ai` | 50 | Analytics agents |
| `console.blackroad.ai` | 50 | CLI agents |

**Total Capacity:** 1,300 email addresses

### Username Formats

```
GitHub:    @{name}_blackroad
Slack:     @{name}
Discord:   {name}#{discriminator}
Reddit:    u/{name}_blackroad
Instagram: @{name}_blackroad
Linear:    {name}
Asana:     {name}
```

---

## Quick Start

### 1. Generate Agent Identities

```bash
cd /home/user/blackroad-prism-console

# View current platform statistics
python agents/platform_identity_manager.py stats

# Export all identities
python agents/platform_identity_manager.py export

# Export CSV for specific platform
python agents/platform_identity_manager.py export-csv --platform slack
```

### 2. Create Onboarding Workflow

```bash
# Create workflow for all platforms
python scripts/onboarding_automation.py create

# Create workflow for specific platforms
python scripts/onboarding_automation.py create --platforms slack discord linear

# Execute workflow
python scripts/onboarding_automation.py execute onboard_YYYYMMDD_HHMMSS
```

### 3. Provision Platform Accounts

```bash
# Provision all agents on all platforms
python agents/multi_platform_orchestrator.py provision

# Provision specific platforms
python agents/multi_platform_orchestrator.py provision --platforms slack linear

# Generate bulk invitation files
python agents/multi_platform_orchestrator.py bulk-invite --platform slack
python agents/multi_platform_orchestrator.py bulk-invite --platform linear
python agents/multi_platform_orchestrator.py bulk-invite --platform asana
```

---

## Email Configuration

### Domain Setup

All domains are configured in `/home/user/blackroad-prism-console/mdm/domains_config.json`.

**Email Servers:**
- Production 1: `174.138.44.45`
- Production 2: `159.65.43.12`

**SMTP Relay:** `smtp.blackroad.ai`

### Verify Domain Configuration

```bash
# Check DNS records
dig MX blackroad.ai
dig MX blackroad.io

# Test SMTP relay
telnet smtp.blackroad.ai 25
```

---

## Platform Setup

### GitHub (Already Configured)

All agents already have GitHub identities configured via:
- `.github/workflows/agent-pr-creator.yml`
- `.github/workflows/agent-issue-creator.yml`
- `.github/workflows/agent-commenter.yml`

**No additional setup required.**

### Slack

**Workspace:** `blackroadinc`
**Invite URL:** https://join.slack.com/t/blackroadinc/shared_invite/zt-3hvk4un6f-t3UbD6T6u7099msAjcpNvg

#### Setup Steps:

1. Generate bulk invitation CSV:
```bash
python agents/multi_platform_orchestrator.py bulk-invite --platform slack
```

2. Import to Slack:
   - Go to Slack Admin: https://blackroadinc.slack.com/admin
   - Navigate to "Invite Members"
   - Upload `registry/slack_bulk_invites.csv`
   - Review and send invitations

3. Verify invitations:
```bash
python cli/enhanced_agent_cli.py dashboard P1
```

#### API Setup (Optional):

For automated posting, configure Slack bot:

```bash
export SLACK_BOT_TOKEN="xoxb-your-token"
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
```

### Discord

**Servers:**
1. Server 1: https://discord.gg/r3KDvBXPn
2. Server 2: https://discord.gg/tcj5MZsxH
3. Server 3: https://discord.gg/CB3XfazUV

#### Bot Setup (Recommended):

1. Create Discord Application:
   - Visit https://discord.com/developers/applications
   - Click "New Application"
   - Name: "BlackRoad Agent Bot"

2. Create Bot User:
   - Navigate to "Bot" section
   - Click "Add Bot"
   - Enable intents:
     - Server Members Intent
     - Message Content Intent
   - Copy bot token

3. Invite Bot to Servers:
   - Navigate to "OAuth2" > "URL Generator"
   - Select scopes: `bot`, `applications.commands`
   - Select permissions: `Send Messages`, `Manage Messages`, `Embed Links`
   - Copy generated URL
   - Open URL and add to all 3 servers

4. Configure:
```bash
export DISCORD_BOT_TOKEN="your-bot-token"
python sync_connectors/connectors/discord_enhanced.py
```

#### Manual Account Setup:

For individual agent accounts, use generated credentials:
```bash
python agents/multi_platform_orchestrator.py export --platform discord
```

Review `registry/discord_credentials.json` for setup instructions.

### Reddit

**Subreddit:** `r/thelightremembers`
**URL:** https://www.reddit.com/r/thelightremembers/

#### API Setup:

1. Create Reddit App:
   - Visit https://www.reddit.com/prefs/apps
   - Click "Create App" or "Create Another App"
   - Type: "Script"
   - Name: "BlackRoad Agents"
   - Redirect URI: `http://localhost:8080`

2. Configure:
```bash
export REDDIT_CLIENT_ID="your-client-id"
export REDDIT_CLIENT_SECRET="your-client-secret"
export REDDIT_USER_AGENT="BlackRoad:Agent:v1.0"
```

3. Test:
```bash
python sync_connectors/connectors/reddit.py
```

#### Manual Account Creation:

Reddit requires manual CAPTCHA solving for account creation:

```bash
# Export credentials
python agents/multi_platform_orchestrator.py export --platform reddit

# Review credentials file
cat registry/reddit_credentials.json
```

Use credentials to manually create accounts at https://www.reddit.com/register

### Instagram

**Main Account:** `@blackroad_ai`
**URL:** https://www.instagram.com/blackroad_ai

#### Limitations:

Instagram Graph API requires:
- Instagram Business or Creator account
- Facebook Page linkage
- Manual app review from Meta

#### Setup (Business Accounts):

1. Create Facebook Page:
   - Visit https://www.facebook.com/pages/create
   - Create page for "BlackRoad Agents"

2. Create Instagram Business Account:
   - Visit https://www.instagram.com/accounts/emailsignup/
   - Sign up with agent email
   - Convert to Business account in settings
   - Link to Facebook Page

3. Generate Access Token:
   - Visit https://developers.facebook.com/
   - Create app
   - Add Instagram Graph API product
   - Generate long-lived access token

4. Configure:
```bash
export INSTAGRAM_ACCESS_TOKEN="your-access-token"
```

#### Recommended Approach:

For the 1,250 agents, use **webhook-based posting** from main `@blackroad_ai` account rather than creating individual accounts.

### Linear

**Workspace:** `blackboxprogramming`
**Team ID:** `c33efc9b-38b7-43f3-bccf-eb93ad2e3f93`
**URL:** https://linear.app/blackboxprogramming/team/c33efc9b-38b7-43f3-bccf-eb93ad2e3f93/projects/all

#### Setup Steps:

1. Generate bulk invitation CSV:
```bash
python agents/multi_platform_orchestrator.py bulk-invite --platform linear
```

2. Import to Linear:
   - Go to Linear Settings: https://linear.app/blackboxprogramming/settings/members
   - Click "Invite Members"
   - Upload `registry/linear_bulk_invites.csv`
   - Assign to "Engineering" team
   - Send invitations

3. API Configuration:
```bash
export LINEAR_API_KEY="lin_api_your-key"
python sync_connectors/connectors/linear.py
```

### Asana

**Workspace URL:** https://app.asana.com/0/1211130261655445/1211130261655445

#### Setup Steps:

1. Generate bulk invitation CSV:
```bash
python agents/multi_platform_orchestrator.py bulk-invite --platform asana
```

2. Import to Asana:
   - Go to Asana Admin Console
   - Navigate to "Members"
   - Click "Invite Members"
   - Upload `registry/asana_bulk_invites.csv`
   - Send invitations

3. API Configuration:
```bash
export ASANA_ACCESS_TOKEN="your-access-token"
python sync_connectors/connectors/asana.py
```

---

## CLI Usage

### Enhanced CLI

The enhanced CLI provides rich terminal UI with platform dashboards:

```bash
# Interactive mode
python cli/enhanced_agent_cli.py interactive

# Show platform dashboard for agent
python cli/enhanced_agent_cli.py dashboard P1

# Show recent activity
python cli/enhanced_agent_cli.py activity P1 --days 7

# Capture terminal screenshot
python cli/enhanced_agent_cli.py screenshot --output terminal.png

# Post cross-platform comment
python cli/enhanced_agent_cli.py comment P1 "Hello from agent!" \
  --targets '{"slack":{"channel_id":"C12345"},"github":{"issue_number":42}}'
```

### Interactive Commands:

```
blackroad> help              # Show help
blackroad> dashboard P1      # Show agent dashboard
blackroad> activity P15      # Show agent activity
blackroad> screenshot        # Capture screenshot
blackroad> exit              # Exit
```

---

## Automation Scripts

### Platform Identity Manager

```bash
# Show statistics
python agents/platform_identity_manager.py stats

# Export all identities
python agents/platform_identity_manager.py export

# Export CSV
python agents/platform_identity_manager.py export-csv --platform slack

# Generate credentials for specific agent/platform
python agents/platform_identity_manager.py credentials --agent-id P1 --platform slack

# Show agents missing from platform
python agents/platform_identity_manager.py missing --platform discord
```

### Multi-Platform Orchestrator

```bash
# Provision all platforms
python agents/multi_platform_orchestrator.py provision

# Provision specific platforms
python agents/multi_platform_orchestrator.py provision --platforms slack discord

# Export credentials
python agents/multi_platform_orchestrator.py export --platform slack

# Generate bulk invitation CSV
python agents/multi_platform_orchestrator.py bulk-invite --platform linear

# Show statistics
python agents/multi_platform_orchestrator.py stats
```

### Onboarding Automation

```bash
# Create workflow
python scripts/onboarding_automation.py create

# Create workflow for specific platforms
python scripts/onboarding_automation.py create --platforms slack linear asana

# Execute workflow
python scripts/onboarding_automation.py execute onboard_20251110_120000
```

---

## File Structure

```
blackroad-prism-console/
├── agents/
│   ├── platform_identity_manager.py       # Core identity management
│   ├── multi_platform_orchestrator.py     # Platform provisioning
│   └── github_communication_hub.py        # GitHub integration
├── cli/
│   ├── enhanced_agent_cli.py              # Enhanced CLI
│   ├── agent_manager.py                   # Agent management
│   └── console.py                         # Console utilities
├── sync_connectors/
│   └── connectors/
│       ├── slack.py                       # Slack connector
│       ├── discord_enhanced.py            # Discord connector
│       ├── reddit.py                      # Reddit connector
│       ├── instagram.py                   # Instagram connector
│       ├── linear.py                      # Linear connector
│       └── asana.py                       # Asana connector
├── scripts/
│   └── onboarding_automation.py           # Onboarding workflows
├── registry/
│   ├── agent_platform_identities.json     # Platform config
│   ├── agent_platform_identities_full.json # Full export
│   ├── github_agent_identities.json       # GitHub agents
│   ├── github_agent_identities_archetypes.jsonl
│   └── github_agent_identities_specialized.jsonl
├── mdm/
│   └── domains_config.json                # Domain configuration
└── PLATFORM_ONBOARDING_GUIDE.md          # This guide
```

---

## Troubleshooting

### Issue: Domain capacity exceeded

**Solution:**
```bash
# Check current usage
python agents/platform_identity_manager.py stats

# Add more domains or increase limits in mdm/domains_config.json
```

### Issue: Platform API rate limits

**Solution:**
- Use batch processing with delays
- Implement exponential backoff
- Use webhook posting for high-volume platforms

### Issue: Email deliverability

**Solution:**
```bash
# Check MX records
dig MX blackroad.ai

# Test SMTP connection
telnet smtp.blackroad.ai 25

# Verify SPF/DKIM records
dig TXT blackroad.ai
```

### Issue: Agent credentials lost

**Solution:**
```bash
# Re-export credentials
python agents/multi_platform_orchestrator.py export --platform slack

# Regenerate for specific agent
python agents/platform_identity_manager.py credentials --agent-id P1 --platform slack
```

---

## Next Steps

After onboarding:

1. **Verify Access:** Test platform access for sample agents
2. **Configure Webhooks:** Set up webhooks for automated posting
3. **Enable Monitoring:** Set up monitoring and alerting
4. **Activate Agents:** Begin agent task assignment
5. **Test Communication:** Verify cross-platform commenting works

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/blackboxprogramming/blackroad-prism-console/issues
- Slack: #agent-support channel
- Documentation: `/home/user/blackroad-prism-console/docs/`

---

**Generated:** 2025-11-10
**Version:** 1.0.0
**Agents:** 1,250
**Platforms:** 7
