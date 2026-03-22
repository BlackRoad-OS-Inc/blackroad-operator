# BlackRoad MCP Agent Manager

MCP (Model Context Protocol) server for managing 31,000+ BlackRoad agents directly from Claude.

## Features

8 tools for complete agent management:

| Tool | Description |
|------|-------------|
| `list_agents` | List/filter agents by core, zone, status with pagination |
| `get_agent` | Get detailed info + recent activity for a specific agent |
| `agent_stats` | Aggregate stats across all agents |
| `health_report` | Health report across zones with unhealthy agent details |
| `update_agent_status` | Change agent status (active/paused/error/offline) |
| `send_command` | Send command to agent (logged to audit + stored in KV) |
| `query_audit_log` | Query audit trail for agent actions |
| `cece_message` | Send/read messages between Cece and Alexa |
| `bulk_status_update` | Bulk update status for agents matching criteria |

## Deploy

```bash
cd blackroad-mcp-agent-manager
npm install
npx wrangler deploy
```

## Connect to Claude.ai

After deploying, add the MCP server to Claude.ai:

1. Go to Claude.ai Settings → Integrations → MCP Servers
2. Add new server:
   - Name: `BlackRoad Agent Manager`
   - URL: `https://mcp.blackroad.io/mcp`

Or update your existing BlackRoad MCP connection to point to this endpoint.

## Endpoints

- `/mcp` - MCP protocol endpoint (SSE for Claude.ai)
- `/health` - Health check
- `/api/agents` - REST: List agents
- `/api/stats` - REST: Agent statistics  
- `/api/health` - REST: Health report

## Bindings

- **D1**: `apollo-agent-registry` (79f8b80d-3bb5-4dd4-beee-a77a1084b574)
- **KV**: `AGENTS_KV` (28ed114677e54e23ad10cc7901f1fd98)

## Agent Schema

```sql
agents (
  id, hash, core, capability, zone, status, 
  health_score, last_heartbeat, tasks_completed, 
  tasks_failed, created_at, metadata
)
```

**Cores**: aria, lucidia, silas, cecilia, cadence, alice
**Zones**: railway, cloudflare, digitalocean, pi
**Status**: active, paused, error, offline

## Example Usage in Claude

"Show me all agents in the pi zone"
"What's the health report for agents below 80%?"
"Pause all error agents in the railway zone"
"Send a restart command to agent xyz-123"
