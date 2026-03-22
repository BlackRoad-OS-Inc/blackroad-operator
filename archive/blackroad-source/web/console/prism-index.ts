// ============================================================================
// BLACKROAD OS, INC. — Prism Console Worker
// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
// ============================================================================

import { dashboard } from './dashboard';

interface Env {
  PRISM_KV: KVNamespace;
  GITHUB_TOKEN?: string;
  GITHUB_ORG: string;
  GITHUB_REPO: string;
}

interface FleetNode {
  name: string;
  ip: string;
  status: string;
  type: string;
  role: string;
  services?: string[];
}

interface Agent {
  name: string;
  role: string;
  node: string;
  status: string;
  description: string;
  lastSeen?: string;
}

const FLEET_NODES: FleetNode[] = [
  { name: 'Alice', ip: '192.168.4.49', status: 'online', type: 'Pi 400', role: 'Gateway', services: ['Pi-hole', 'PostgreSQL', 'Qdrant', 'nginx'] },
  { name: 'Cecilia', ip: '192.168.4.96', status: 'online', type: 'Pi 5', role: 'AI Inference', services: ['Ollama (16 models)', 'Hailo-8', 'embedding'] },
  { name: 'Octavia', ip: '192.168.4.101', status: 'online', type: 'Pi 5', role: 'Git/Storage', services: ['Gitea (207 repos)', 'Docker Swarm', 'Hailo-8'] },
  { name: 'Aria', ip: '192.168.4.98', status: 'online', type: 'Pi 5', role: 'Monitoring', services: ['NATS', 'metrics'] },
  { name: 'Lucidia', ip: '192.168.4.38', status: 'online', type: 'Pi 5', role: 'Apps/CI', services: ['334 web apps', 'GitHub Actions'] },
  { name: 'Anastasia', ip: 'nyc1', status: 'online', type: 'Droplet', role: 'WireGuard Hub', services: ['WireGuard mesh', '10.8.0.x'] },
  { name: 'Gematria', ip: 'nyc3', status: 'online', type: 'Droplet', role: 'Backup', services: ['rsync', 'offsite DR'] },
];

const AGENTS: Agent[] = [
  { name: 'Alice', role: 'Gateway Controller', node: 'Alice (.49)', status: 'active', description: 'Edge routing, DNS, traffic shaping' },
  { name: 'Lucidia', role: 'App Orchestrator', node: 'Lucidia (.38)', status: 'active', description: '334 web apps, CI/CD pipelines' },
  { name: 'Cecilia', role: 'AI Engine', node: 'Cecilia (.96)', status: 'active', description: '16 Ollama models, embeddings, Hailo-8' },
  { name: 'Cece', role: 'Knowledge Curator', node: 'Cecilia (.96)', status: 'active', description: 'RAG indexing, codex maintenance' },
  { name: 'Aria', role: 'Mesh Coordinator', node: 'Aria (.98)', status: 'active', description: 'NATS pub/sub, inter-node messaging' },
  { name: 'Eve', role: 'Security Sentinel', node: 'All nodes', status: 'active', description: 'Audit logging, threat detection' },
  { name: 'Meridian', role: 'Analytics Engine', node: 'Cloudflare', status: 'active', description: 'KPI collection, stats aggregation' },
  { name: 'Sentinel', role: 'Health Monitor', node: 'All nodes', status: 'active', description: 'Fleet health, uptime checks, alerts' },
];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    const headers: Record<string, string> = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    try {
      // API routes — core
      if (path === '/api/fleet') return json(await getFleetStatus(env), headers);
      if (path === '/api/tasks') return json(await getTasks(env), headers);
      if (path === '/api/kpis') return json(await getKPIs(env), headers);
      if (path === '/api/health') return json(await getHealth(env), headers);
      if (path === '/api/repos') return json(await getRepos(env), headers);
      if (path === '/api/events') return json(await getEvents(env), headers);

      // API routes — new
      if (path === '/api/agents') return json(await getAgents(env), headers);
      if (path === '/api/memory') return json(await getMemoryStats(env), headers);
      if (path === '/api/search') return json(await proxySearch(url, env), headers);
      if (path === '/api/auth') return json(await getAuthStats(env), headers);
      if (path === '/api/billing') return json(await getBillingStats(env), headers);
      if (path === '/api/mesh') return json(await getMeshStats(env), headers);

      // Webhook
      if (path === '/api/webhook' && request.method === 'POST') {
        return json(await handleWebhook(request, env), headers);
      }

      // Dashboard
      return new Response(dashboard(), {
        headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' },
      });
    } catch (e: any) {
      return json({ error: e.message }, headers, 500);
    }
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function json(data: any, headers: Record<string, string>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

async function fetchWithTimeout(url: string, opts: RequestInit = {}, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Core endpoints
// ---------------------------------------------------------------------------

async function getFleetStatus(env: Env): Promise<any> {
  // Try live data first
  try {
    const resp = await fetchWithTimeout('https://stats-blackroad.amundsonalexa.workers.dev/fleet');
    if (resp.ok) {
      const live = await resp.json();
      await env.PRISM_KV.put('fleet:status', JSON.stringify(live), { expirationTtl: 300 });
      return live;
    }
  } catch { /* fall through */ }

  // Then KV cache
  const cached = await env.PRISM_KV.get('fleet:status', 'json');
  if (cached) return cached;

  // Static fallback
  return {
    timestamp: new Date().toISOString(),
    nodes: FLEET_NODES,
  };
}

async function getTasks(env: Env): Promise<any> {
  const ghHeaders: Record<string, string> = { 'User-Agent': 'BlackRoad-Prism/3.0' };
  if (env.GITHUB_TOKEN) ghHeaders['Authorization'] = `token ${env.GITHUB_TOKEN}`;
  try {
    const resp = await fetchWithTimeout(
      `https://api.github.com/repos/${env.GITHUB_ORG}/${env.GITHUB_REPO}/issues?state=open&per_page=30`,
      { headers: ghHeaders }
    );
    if (!resp.ok) throw new Error(`GitHub API: ${resp.status}`);
    const issues: any[] = await resp.json();
    return issues.map((i) => ({
      number: i.number,
      title: i.title,
      labels: i.labels.map((l: any) => ({ name: l.name, color: l.color })),
      state: i.state,
      created: i.created_at,
      url: i.html_url,
    }));
  } catch {
    return [];
  }
}

async function getKPIs(env: Env): Promise<any> {
  const cached = await env.PRISM_KV.get('kpis:latest', 'json');
  return cached || {
    commits: 333,
    repos: 306,
    loc: '7.2M',
    fleet: '5/5',
    models: 27,
    agents: 8,
    skills: 50,
    tops: 52,
  };
}

async function getHealth(env: Env): Promise<any> {
  const fleet = await getFleetStatus(env);
  const nodes = fleet.nodes || FLEET_NODES;
  const online = nodes.filter((n: any) => n.status === 'online').length;
  return {
    status: online >= 5 ? 'operational' : online >= 3 ? 'degraded' : 'down',
    nodes_online: online,
    nodes_total: nodes.length,
    timestamp: new Date().toISOString(),
  };
}

async function getRepos(env: Env): Promise<any> {
  const ghHeaders: Record<string, string> = { 'User-Agent': 'BlackRoad-Prism/3.0' };
  if (env.GITHUB_TOKEN) ghHeaders['Authorization'] = `token ${env.GITHUB_TOKEN}`;
  try {
    const resp = await fetchWithTimeout(
      `https://api.github.com/users/${env.GITHUB_ORG}/repos?per_page=100&sort=updated`,
      { headers: ghHeaders }
    );
    const repos: any[] = await resp.json();
    return {
      total: repos.length,
      recent: repos.slice(0, 10).map((r) => ({
        name: r.name,
        description: r.description,
        language: r.language,
        updated: r.updated_at,
        stars: r.stargazers_count,
      })),
    };
  } catch {
    return { total: 0, recent: [] };
  }
}

async function getEvents(env: Env): Promise<any> {
  return (await env.PRISM_KV.get('events:recent', 'json')) || [];
}

// ---------------------------------------------------------------------------
// New endpoints
// ---------------------------------------------------------------------------

async function getAgents(env: Env): Promise<any> {
  // Try KV for live agent heartbeats
  const cached = await env.PRISM_KV.get('agents:status', 'json');
  if (cached) return cached;

  return {
    timestamp: new Date().toISOString(),
    total: AGENTS.length,
    active: AGENTS.filter(a => a.status === 'active').length,
    agents: AGENTS.map(a => ({
      ...a,
      lastSeen: a.lastSeen || new Date().toISOString(),
    })),
  };
}

async function getMemoryStats(env: Env): Promise<any> {
  // Try KV for periodically-pushed memory stats
  const cached = await env.PRISM_KV.get('memory:stats', 'json');
  if (cached) return cached;

  return {
    timestamp: new Date().toISOString(),
    journal: { entries: 0, label: 'Journal Entries' },
    codex: { solutions: 0, patterns: 0, label: 'Codex' },
    til: { broadcasts: 0, label: 'TIL Broadcasts' },
    tasks: { total: 0, claimed: 0, completed: 0, label: 'Task Marketplace' },
    fts5: { entries: 156675, databases: 228, label: 'FTS5 Index' },
    searchIndex: { entries: 1383, indexers: 23, types: 28, label: 'Unified Search' },
  };
}

async function proxySearch(url: URL, _env: Env): Promise<any> {
  const query = url.searchParams.get('q');
  if (!query) return { error: 'Missing ?q= parameter', results: [] };

  try {
    const resp = await fetchWithTimeout(
      `https://road-search.amundsonalexa.workers.dev/search?q=${encodeURIComponent(query)}`,
      { headers: { 'User-Agent': 'BlackRoad-Prism/3.0' } }
    );
    if (!resp.ok) throw new Error(`Search API: ${resp.status}`);
    return await resp.json();
  } catch (e: any) {
    return { error: e.message, results: [] };
  }
}

async function getAuthStats(env: Env): Promise<any> {
  const cached = await env.PRISM_KV.get('auth:stats', 'json');
  if (cached) return cached;

  try {
    const resp = await fetchWithTimeout('https://auth.blackroad.io/auth/status');
    if (resp.ok) {
      const data = await resp.json();
      await env.PRISM_KV.put('auth:stats', JSON.stringify(data), { expirationTtl: 300 });
      return data;
    }
  } catch { /* fall through */ }

  return { users: 42, sessions: 0, provider: 'JWT + D1', endpoint: 'auth.blackroad.io' };
}

async function getBillingStats(env: Env): Promise<any> {
  const cached = await env.PRISM_KV.get('billing:stats', 'json');
  if (cached) return cached;

  try {
    const resp = await fetchWithTimeout('https://pay.blackroad.io/stats');
    if (resp.ok) {
      const data = await resp.json();
      await env.PRISM_KV.put('billing:stats', JSON.stringify(data), { expirationTtl: 300 });
      return data;
    }
  } catch { /* fall through */ }

  return {
    plans: 4,
    addons: 4,
    provider: 'RoadPay + Stripe',
    endpoint: 'pay.blackroad.io',
    database: 'D1 tollbooth',
  };
}

async function getMeshStats(env: Env): Promise<any> {
  const cached = await env.PRISM_KV.get('mesh:stats', 'json');
  if (cached) return cached;

  try {
    const resp = await fetchWithTimeout('https://mesh-blackroad.amundsonalexa.workers.dev/api/stats');
    if (resp.ok) {
      const data = await resp.json();
      await env.PRISM_KV.put('mesh:stats', JSON.stringify(data), { expirationTtl: 300 });
      return data;
    }
  } catch { /* fall through */ }

  // Also try the custom domain
  try {
    const resp = await fetchWithTimeout('https://mesh.blackroad.io/api/stats');
    if (resp.ok) {
      const data = await resp.json();
      await env.PRISM_KV.put('mesh:stats', JSON.stringify(data), { expirationTtl: 300 });
      return data;
    }
  } catch { /* fall through */ }

  return {
    protocol: 'NATS v2.12.3',
    nodesConnected: 4,
    nodesTotal: 5,
    pubsubAgents: true,
    wireguard: { hub: 'anastasia', subnet: '10.8.0.x' },
  };
}

// ---------------------------------------------------------------------------
// Webhook handler
// ---------------------------------------------------------------------------

async function handleWebhook(request: Request, env: Env): Promise<any> {
  const event = request.headers.get('X-GitHub-Event') || 'unknown';
  const payload: any = await request.json();

  const entry = {
    type: event,
    action: payload.action,
    repo: payload.repository?.full_name,
    title: payload.issue?.title || payload.pull_request?.title || '',
    sender: payload.sender?.login || '',
    timestamp: new Date().toISOString(),
  };

  const existing: any[] = (await env.PRISM_KV.get('events:recent', 'json')) || [];
  existing.unshift(entry);
  await env.PRISM_KV.put('events:recent', JSON.stringify(existing.slice(0, 50)));

  return { received: true, event };
}
