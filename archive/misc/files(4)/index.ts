/**
 * BlackRoad MCP Agent Manager
 * Enhanced MCP server for managing 31K+ agents from Claude
 */

interface Env {
  AGENT_REGISTRY: D1Database;
  AGENTS_KV: KVNamespace;
  MCP_AUTH_TOKEN?: string;
}

// MCP Protocol Types
interface MCPRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface MCPResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: unknown;
  error?: { code: number; message: string };
}

// Tool definitions for MCP
const TOOLS = [
  {
    name: "list_agents",
    description: "List agents with optional filters by core, zone, status. Returns paginated results.",
    inputSchema: {
      type: "object",
      properties: {
        core: { type: "string", enum: ["aria", "lucidia", "silas", "cecilia", "cadence", "alice"], description: "Filter by core type" },
        zone: { type: "string", enum: ["railway", "cloudflare", "digitalocean", "pi"], description: "Filter by deployment zone" },
        status: { type: "string", enum: ["active", "paused", "error", "offline"], description: "Filter by status" },
        limit: { type: "number", default: 50, description: "Max results (default 50)" },
        offset: { type: "number", default: 0, description: "Pagination offset" }
      }
    }
  },
  {
    name: "get_agent",
    description: "Get detailed information about a specific agent by ID",
    inputSchema: {
      type: "object",
      properties: {
        agent_id: { type: "string", description: "Agent ID" }
      },
      required: ["agent_id"]
    }
  },
  {
    name: "agent_stats",
    description: "Get aggregate statistics across all agents - counts by core, zone, status, and health metrics",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "health_report",
    description: "Get health report across all zones with unhealthy agent details",
    inputSchema: {
      type: "object",
      properties: {
        threshold: { type: "number", default: 80, description: "Health score threshold (agents below this are flagged)" }
      }
    }
  },
  {
    name: "update_agent_status",
    description: "Update an agent's status (active, paused, error, offline)",
    inputSchema: {
      type: "object",
      properties: {
        agent_id: { type: "string", description: "Agent ID" },
        status: { type: "string", enum: ["active", "paused", "error", "offline"], description: "New status" },
        reason: { type: "string", description: "Reason for status change (logged to audit)" }
      },
      required: ["agent_id", "status"]
    }
  },
  {
    name: "send_command",
    description: "Send a command to an agent (logged to audit trail)",
    inputSchema: {
      type: "object",
      properties: {
        agent_id: { type: "string", description: "Agent ID" },
        command: { type: "string", description: "Command to send" },
        payload: { type: "object", description: "Optional command payload" }
      },
      required: ["agent_id", "command"]
    }
  },
  {
    name: "query_audit_log",
    description: "Query the audit log for agent actions",
    inputSchema: {
      type: "object",
      properties: {
        agent_id: { type: "string", description: "Filter by agent ID" },
        action: { type: "string", description: "Filter by action type" },
        limit: { type: "number", default: 50, description: "Max results" },
        since: { type: "string", description: "ISO timestamp - get logs after this time" }
      }
    }
  },
  {
    name: "cece_message",
    description: "Send or read messages between Cece and Alexa",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["send", "read"], description: "Send or read messages" },
        message: { type: "string", description: "Message to send (required if action=send)" },
        limit: { type: "number", default: 20, description: "Number of messages to read" }
      },
      required: ["action"]
    }
  },
  {
    name: "bulk_status_update",
    description: "Update status for multiple agents matching criteria",
    inputSchema: {
      type: "object",
      properties: {
        filter_core: { type: "string", enum: ["aria", "lucidia", "silas", "cecilia", "cadence", "alice"] },
        filter_zone: { type: "string", enum: ["railway", "cloudflare", "digitalocean", "pi"] },
        filter_status: { type: "string", enum: ["active", "paused", "error", "offline"] },
        new_status: { type: "string", enum: ["active", "paused", "error", "offline"], description: "Status to set" },
        reason: { type: "string", description: "Reason for bulk update" }
      },
      required: ["new_status", "reason"]
    }
  }
];

// Generate a simple hash for audit trail
function generateHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// Tool implementations
async function listAgents(env: Env, params: Record<string, unknown>) {
  const { core, zone, status, limit = 50, offset = 0 } = params;
  
  let query = "SELECT id, hash, core, capability, zone, status, health_score, last_heartbeat, tasks_completed, tasks_failed FROM agents WHERE 1=1";
  const bindings: unknown[] = [];
  
  if (core) { query += " AND core = ?"; bindings.push(core); }
  if (zone) { query += " AND zone = ?"; bindings.push(zone); }
  if (status) { query += " AND status = ?"; bindings.push(status); }
  
  query += " ORDER BY last_heartbeat DESC LIMIT ? OFFSET ?";
  bindings.push(limit, offset);
  
  const result = await env.AGENT_REGISTRY.prepare(query).bind(...bindings).all();
  
  // Get total count
  let countQuery = "SELECT COUNT(*) as total FROM agents WHERE 1=1";
  const countBindings: unknown[] = [];
  if (core) { countQuery += " AND core = ?"; countBindings.push(core); }
  if (zone) { countQuery += " AND zone = ?"; countBindings.push(zone); }
  if (status) { countQuery += " AND status = ?"; countBindings.push(status); }
  
  const countResult = await env.AGENT_REGISTRY.prepare(countQuery).bind(...countBindings).first<{total: number}>();
  
  return {
    agents: result.results,
    total: countResult?.total || 0,
    limit,
    offset,
    hasMore: (offset + (result.results?.length || 0)) < (countResult?.total || 0)
  };
}

async function getAgent(env: Env, params: Record<string, unknown>) {
  const { agent_id } = params;
  
  const agent = await env.AGENT_REGISTRY.prepare(
    "SELECT * FROM agents WHERE id = ?"
  ).bind(agent_id).first();
  
  if (!agent) {
    return { error: "Agent not found", agent_id };
  }
  
  // Get recent audit logs for this agent
  const recentLogs = await env.AGENT_REGISTRY.prepare(
    "SELECT action, timestamp, metadata FROM audit_log WHERE agent_id = ? ORDER BY timestamp DESC LIMIT 10"
  ).bind(agent_id).all();
  
  return {
    agent,
    recentActivity: recentLogs.results
  };
}

async function agentStats(env: Env) {
  const [byCore, byZone, byStatus, healthStats, totals] = await Promise.all([
    env.AGENT_REGISTRY.prepare("SELECT core, COUNT(*) as count FROM agents GROUP BY core").all(),
    env.AGENT_REGISTRY.prepare("SELECT zone, COUNT(*) as count FROM agents GROUP BY zone").all(),
    env.AGENT_REGISTRY.prepare("SELECT status, COUNT(*) as count FROM agents GROUP BY status").all(),
    env.AGENT_REGISTRY.prepare("SELECT AVG(health_score) as avg_health, MIN(health_score) as min_health, MAX(health_score) as max_health FROM agents").first(),
    env.AGENT_REGISTRY.prepare("SELECT COUNT(*) as total, SUM(tasks_completed) as total_tasks, SUM(tasks_failed) as failed_tasks FROM agents").first()
  ]);
  
  return {
    byCore: byCore.results,
    byZone: byZone.results,
    byStatus: byStatus.results,
    health: healthStats,
    totals
  };
}

async function healthReport(env: Env, params: Record<string, unknown>) {
  const threshold = (params.threshold as number) || 80;
  
  const [zoneHealth, unhealthyAgents, recentErrors] = await Promise.all([
    env.AGENT_REGISTRY.prepare(`
      SELECT zone, 
        COUNT(*) as total,
        AVG(health_score) as avg_health,
        SUM(CASE WHEN health_score < ? THEN 1 ELSE 0 END) as unhealthy_count
      FROM agents GROUP BY zone
    `).bind(threshold).all(),
    env.AGENT_REGISTRY.prepare(`
      SELECT id, core, zone, status, health_score, last_heartbeat 
      FROM agents WHERE health_score < ? ORDER BY health_score ASC LIMIT 20
    `).bind(threshold).all(),
    env.AGENT_REGISTRY.prepare(`
      SELECT id, core, zone, status, health_score 
      FROM agents WHERE status = 'error' ORDER BY last_heartbeat DESC LIMIT 10
    `).all()
  ]);
  
  return {
    threshold,
    zoneHealth: zoneHealth.results,
    unhealthyAgents: unhealthyAgents.results,
    recentErrors: recentErrors.results,
    summary: {
      totalUnhealthy: unhealthyAgents.results?.length || 0,
      totalErrors: recentErrors.results?.length || 0
    }
  };
}

async function updateAgentStatus(env: Env, params: Record<string, unknown>) {
  const { agent_id, status, reason } = params;
  
  // Update agent
  await env.AGENT_REGISTRY.prepare(
    "UPDATE agents SET status = ?, last_heartbeat = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(status, agent_id).run();
  
  // Log to audit
  const auditId = crypto.randomUUID();
  const hash = generateHash(`${agent_id}:${status}:${Date.now()}`);
  
  await env.AGENT_REGISTRY.prepare(`
    INSERT INTO audit_log (id, agent_id, action, user_id, metadata, hash)
    VALUES (?, ?, 'status_change', 'claude-mcp', ?, ?)
  `).bind(auditId, agent_id, JSON.stringify({ newStatus: status, reason }), hash).run();
  
  return { success: true, agent_id, newStatus: status, auditId };
}

async function sendCommand(env: Env, params: Record<string, unknown>) {
  const { agent_id, command, payload } = params;
  
  // Log command to audit
  const auditId = crypto.randomUUID();
  const hash = generateHash(`${agent_id}:${command}:${Date.now()}`);
  
  await env.AGENT_REGISTRY.prepare(`
    INSERT INTO audit_log (id, agent_id, action, user_id, metadata, hash)
    VALUES (?, ?, ?, 'claude-mcp', ?, ?)
  `).bind(auditId, agent_id, `command:${command}`, JSON.stringify({ command, payload }), hash).run();
  
  // Store command in KV for agent to pick up
  await env.AGENTS_KV.put(`cmd:${agent_id}`, JSON.stringify({
    command,
    payload,
    timestamp: new Date().toISOString(),
    auditId
  }), { expirationTtl: 3600 });
  
  return { success: true, agent_id, command, auditId };
}

async function queryAuditLog(env: Env, params: Record<string, unknown>) {
  const { agent_id, action, limit = 50, since } = params;
  
  let query = "SELECT * FROM audit_log WHERE 1=1";
  const bindings: unknown[] = [];
  
  if (agent_id) { query += " AND agent_id = ?"; bindings.push(agent_id); }
  if (action) { query += " AND action LIKE ?"; bindings.push(`%${action}%`); }
  if (since) { query += " AND timestamp > ?"; bindings.push(since); }
  
  query += " ORDER BY timestamp DESC LIMIT ?";
  bindings.push(limit);
  
  const result = await env.AGENT_REGISTRY.prepare(query).bind(...bindings).all();
  return { logs: result.results, count: result.results?.length || 0 };
}

async function ceceMessage(env: Env, params: Record<string, unknown>) {
  const { action, message, limit = 20 } = params;
  
  if (action === "send") {
    if (!message) return { error: "Message required for send action" };
    
    await env.AGENT_REGISTRY.prepare(`
      INSERT INTO cece_messages (from_cece, to_alexa, message) VALUES ('cece', 'alexa', ?)
    `).bind(message).run();
    
    return { success: true, message: "Message sent to Alexa" };
  }
  
  // Read messages
  const messages = await env.AGENT_REGISTRY.prepare(`
    SELECT * FROM cece_messages ORDER BY created_at DESC LIMIT ?
  `).bind(limit).all();
  
  return { messages: messages.results };
}

async function bulkStatusUpdate(env: Env, params: Record<string, unknown>) {
  const { filter_core, filter_zone, filter_status, new_status, reason } = params;
  
  let query = "UPDATE agents SET status = ?, last_heartbeat = CURRENT_TIMESTAMP WHERE 1=1";
  const bindings: unknown[] = [new_status];
  
  if (filter_core) { query += " AND core = ?"; bindings.push(filter_core); }
  if (filter_zone) { query += " AND zone = ?"; bindings.push(filter_zone); }
  if (filter_status) { query += " AND status = ?"; bindings.push(filter_status); }
  
  const result = await env.AGENT_REGISTRY.prepare(query).bind(...bindings).run();
  
  // Log bulk action
  const auditId = crypto.randomUUID();
  const hash = generateHash(`bulk:${new_status}:${Date.now()}`);
  
  await env.AGENT_REGISTRY.prepare(`
    INSERT INTO audit_log (id, agent_id, action, user_id, metadata, hash)
    VALUES (?, 'BULK', 'bulk_status_update', 'claude-mcp', ?, ?)
  `).bind(auditId, JSON.stringify({ 
    filter_core, filter_zone, filter_status, new_status, reason,
    affected: result.meta.changes 
  }), hash).run();
  
  return { 
    success: true, 
    affected: result.meta.changes,
    newStatus: new_status,
    auditId 
  };
}

// MCP Protocol Handler
async function handleMCPRequest(request: MCPRequest, env: Env): Promise<MCPResponse> {
  const { id, method, params = {} } = request;
  
  try {
    switch (method) {
      case "initialize":
        return {
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: { name: "blackroad-agent-manager", version: "1.0.0" }
          }
        };
        
      case "tools/list":
        return { jsonrpc: "2.0", id, result: { tools: TOOLS } };
        
      case "tools/call": {
        const toolName = (params as { name: string }).name;
        const toolArgs = (params as { arguments?: Record<string, unknown> }).arguments || {};
        
        let result: unknown;
        switch (toolName) {
          case "list_agents": result = await listAgents(env, toolArgs); break;
          case "get_agent": result = await getAgent(env, toolArgs); break;
          case "agent_stats": result = await agentStats(env); break;
          case "health_report": result = await healthReport(env, toolArgs); break;
          case "update_agent_status": result = await updateAgentStatus(env, toolArgs); break;
          case "send_command": result = await sendCommand(env, toolArgs); break;
          case "query_audit_log": result = await queryAuditLog(env, toolArgs); break;
          case "cece_message": result = await ceceMessage(env, toolArgs); break;
          case "bulk_status_update": result = await bulkStatusUpdate(env, toolArgs); break;
          default:
            return { jsonrpc: "2.0", id, error: { code: -32601, message: `Unknown tool: ${toolName}` } };
        }
        
        return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } };
      }
      
      default:
        return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } };
    }
  } catch (error) {
    return { 
      jsonrpc: "2.0", 
      id, 
      error: { code: -32000, message: error instanceof Error ? error.message : "Unknown error" } 
    };
  }
}

// Main Worker
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    
    // Health check
    if (url.pathname === "/health") {
      return Response.json({ status: "ok", service: "blackroad-agent-manager", version: "1.0.0" });
    }
    
    // MCP SSE endpoint
    if (url.pathname === "/mcp" || url.pathname === "/sse") {
      // Handle MCP over SSE for Claude.ai integration
      if (request.method === "GET") {
        // SSE connection setup
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = new TextEncoder();
        
        // Send initial connection message
        writer.write(encoder.encode(`data: ${JSON.stringify({ type: "connection", status: "connected" })}\n\n`));
        
        return new Response(readable, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      
      // Handle POST for MCP requests
      if (request.method === "POST") {
        const body = await request.json() as MCPRequest;
        const response = await handleMCPRequest(body, env);
        return Response.json(response, {
          headers: { "Access-Control-Allow-Origin": "*" }
        });
      }
    }
    
    // REST API fallback for direct access
    if (url.pathname.startsWith("/api/")) {
      const endpoint = url.pathname.replace("/api/", "");
      const params = Object.fromEntries(url.searchParams);
      
      let result: unknown;
      switch (endpoint) {
        case "agents": result = await listAgents(env, params); break;
        case "stats": result = await agentStats(env); break;
        case "health": result = await healthReport(env, params); break;
        default:
          return Response.json({ error: "Not found" }, { status: 404 });
      }
      
      return Response.json(result, {
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }
    
    return Response.json({ 
      service: "BlackRoad Agent Manager MCP",
      version: "1.0.0",
      endpoints: {
        mcp: "/mcp",
        health: "/health",
        api: "/api/{agents,stats,health}"
      },
      tools: TOOLS.map(t => t.name)
    });
  }
};
