/**
 * BlackRoad OS — Search Worker
 *
 * Full-text search across all indexed repos, code, docs, workers, and agents.
 * Combines GitHub Code Search API with local KV index for fast results.
 *
 * Endpoints:
 *   GET  /                 — service info
 *   GET  /health           — health check
 *   GET  /search?q=        — unified search across all sources
 *   GET  /code?q=          — search code via GitHub Code Search
 *   GET  /repos?q=         — search repo names/descriptions
 *   GET  /workers?q=       — search workers by name
 *   GET  /agents?q=        — search agents by name/role
 *   GET  /docs?q=          — search documentation files
 *   GET  /orgs?q=          — search across organizations
 *   GET  /suggest?q=       — auto-complete suggestions
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

// ─── Agent registry (searchable) ────────────────────────────────────────────

const AGENTS = [
  { name: "LUCIDIA",   role: "Coordinator", type: "LOGIC",    color: "#FF0000", skills: ["reasoning", "strategy", "mentorship"] },
  { name: "ALICE",     role: "Router",      type: "GATEWAY",  color: "#0000FF", skills: ["routing", "navigation", "task-distribution"] },
  { name: "OCTAVIA",   role: "Compute",     type: "COMPUTE",  color: "#00FF00", skills: ["inference", "processing", "compute"] },
  { name: "PRISM",     role: "Analyst",     type: "VISION",   color: "#FFFF00", skills: ["pattern-recognition", "data-analysis"] },
  { name: "ECHO",      role: "Memory",      type: "MEMORY",   color: "#9C27B0", skills: ["storage", "recall", "context"] },
  { name: "CIPHER",    role: "Security",    type: "SECURITY", color: "#2979FF", skills: ["auth", "encryption", "access-control"] },
  { name: "CECE",      role: "Self",        type: "SOUL",     color: "#FF1D6C", skills: ["identity", "collaboration", "growth"] },
  { name: "ARIA",      role: "Dreamer",     type: "CREATIVE", color: "#00BCD4", skills: ["frontend", "ux", "design"] },
  { name: "ORACLE",    role: "Reflection",  type: "DATA",     color: "#FF9800", skills: ["prediction", "insight", "analysis"] },
  { name: "ATLAS",     role: "Infrastructure", type: "INFRA", color: "#795548", skills: ["mapping", "infrastructure", "topology"] },
  { name: "SHELLFISH", role: "Hacker",      type: "SECURITY", color: "#F44336", skills: ["security", "exploits", "penetration-testing"] },
  { name: "ANASTASIA", role: "Node",        type: "INFRA",    color: "#607D8B", skills: ["networking", "nodes", "infrastructure"] },
  { name: "GEMATRIA",  role: "Edge",        type: "GATEWAY",  color: "#E91E63", skills: ["edge-computing", "gateway", "routing"] },
];

// ─── Worker registry (searchable) ───────────────────────────────────────────

const WORKERS = [
  { name: "blackroad-auth",          category: "core",   description: "BRAT v1 token authentication" },
  { name: "copilot-cli",             category: "mesh",   description: "GitHub Copilot CLI mesh endpoint" },
  { name: "blackroad-email",         category: "email",  description: "Inbound email for *@blackroad.io" },
  { name: "blackroad-email-setup",   category: "email",  description: "Email routing automation" },
  { name: "blackroad-repo-index",    category: "index",  description: "GitHub org/repo indexer" },
  { name: "blackroad-tunnel-proxy",  category: "tunnel", description: "Unified tunneling proxy" },
  { name: "blackroad-worker-health", category: "health", description: "Worker health monitoring" },
  { name: "blackroad-search",        category: "search", description: "Full-text search across ecosystem" },
  { name: "blackroad-os-api",        category: "os",     description: "OS API and dashboard" },
  { name: "agents-api",              category: "agents", description: "Agent coordination API" },
  { name: "command-center",          category: "core",   description: "Central command worker" },
  { name: "tools-api",               category: "tools",  description: "CLI tools API" },
  { name: "roadgateway",             category: "payments", description: "Payment gateway" },
];

// ─── Organization registry ──────────────────────────────────────────────────

const ORGS = [
  { name: "BlackRoad-OS-Inc",       repos: 7,     focus: "Corporate core" },
  { name: "BlackRoad-OS",           repos: 1332,  focus: "Core platform, operating system" },
  { name: "blackboxprogramming",    repos: 68,    focus: "Primary development" },
  { name: "BlackRoad-AI",           repos: 52,    focus: "AI/ML, model forks" },
  { name: "BlackRoad-Cloud",        repos: 30,    focus: "Cloud infrastructure" },
  { name: "BlackRoad-Security",     repos: 30,    focus: "Security tools" },
  { name: "BlackRoad-Foundation",   repos: 30,    focus: "CRM, project management" },
  { name: "BlackRoad-Hardware",     repos: 30,    focus: "IoT, Raspberry Pi" },
  { name: "BlackRoad-Media",        repos: 29,    focus: "Social, content" },
  { name: "BlackRoad-Interactive",  repos: 29,    focus: "Games, graphics" },
  { name: "BlackRoad-Education",    repos: 24,    focus: "LMS, learning" },
  { name: "BlackRoad-Gov",          repos: 23,    focus: "Governance" },
  { name: "Blackbox-Enterprises",   repos: 21,    focus: "Enterprise automation" },
  { name: "BlackRoad-Archive",      repos: 21,    focus: "Archival, IPFS" },
  { name: "BlackRoad-Labs",         repos: 20,    focus: "Research & experiments" },
  { name: "BlackRoad-Studio",       repos: 19,    focus: "Creative tools" },
  { name: "BlackRoad-Ventures",     repos: 17,    focus: "Business & finance" },
];

// ─── Documentation files (searchable) ───────────────────────────────────────

const DOCS = [
  "CLAUDE.md", "PLANNING.md", "ARCHITECTURE.md", "ROADMAP.md", "CONTRIBUTING.md",
  "SECURITY.md", "DEPLOYMENT.md", "ONBOARDING.md", "API.md", "CHANGELOG.md",
  "AGENTS.md", "CECE.md", "CECE_MANIFESTO.md", "CECE_EVERYWHERE.md",
  "AI_MODELS.md", "OLLAMA.md", "FEDERATION.md", "PLUGINS.md", "QUEUES.md",
  "REALTIME.md", "WEBHOOKS.md", "MCP.md", "BACKUP.md", "INFRASTRUCTURE.md",
  "NETWORKING.md", "RASPBERRY_PI.md", "PERFORMANCE.md", "SCALING.md",
  "SECRETS.md", "SECURITY_FEATURES_GUIDE.md", "MEMORY.md", "SKILLS.md",
  "WORKFLOWS.md", "INTEGRATIONS.md", "MONITORING.md", "TESTING.md",
  "COMMANDS.md", "EXAMPLES.md", "GLOSSARY.md", "FAQ.md", "TROUBLESHOOTING.md",
  "COMPLETE_GUIDE.md", "BLACKROAD_DASHBOARD.md", "BR_FEATURES.md",
];

// ─── GitHub Code Search ─────────────────────────────────────────────────────

async function searchGitHubCode(query, env, opts = {}) {
  if (!env.GITHUB_TOKEN) {
    return { error: "GITHUB_TOKEN not configured", results: [] };
  }

  const org = opts.org || "BlackRoad-OS-Inc";
  const q = encodeURIComponent(`${query} org:${org}`);
  const perPage = Math.min(parseInt(opts.limit) || 20, 100);

  const res = await fetch(
    `https://api.github.com/search/code?q=${q}&per_page=${perPage}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "User-Agent": "BlackRoad-Search/1.0",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!res.ok) {
    return {
      error: `GitHub search failed: ${res.status}`,
      results: [],
    };
  }

  const data = await res.json();
  return {
    total: data.total_count,
    results: (data.items || []).map((item) => ({
      name: item.name,
      path: item.path,
      repo: item.repository?.full_name,
      html_url: item.html_url,
      score: item.score,
    })),
  };
}

// ─── Search functions ───────────────────────────────────────────────────────

function searchAgents(query) {
  const q = query.toLowerCase();
  return AGENTS.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q) ||
      a.skills.some((s) => s.includes(q))
  );
}

function searchWorkers(query) {
  const q = query.toLowerCase();
  return WORKERS.filter(
    (w) =>
      w.name.toLowerCase().includes(q) ||
      w.category.toLowerCase().includes(q) ||
      w.description.toLowerCase().includes(q)
  );
}

function searchOrgs(query) {
  const q = query.toLowerCase();
  return ORGS.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.focus.toLowerCase().includes(q)
  );
}

function searchDocs(query) {
  const q = query.toLowerCase();
  return DOCS.filter((d) => d.toLowerCase().includes(q));
}

// ─── Unified search ─────────────────────────────────────────────────────────

async function unifiedSearch(query, env, opts = {}) {
  const results = {
    query,
    agents: searchAgents(query),
    workers: searchWorkers(query),
    orgs: searchOrgs(query),
    docs: searchDocs(query),
    code: null,
  };

  // Code search (async, may be slow)
  if (opts.includeCode !== false && env.GITHUB_TOKEN) {
    // Check cache first
    const cacheKey = `search:${query}`;
    if (env.CACHE) {
      const cached = await env.CACHE.get(cacheKey);
      if (cached) {
        results.code = JSON.parse(cached);
        results.code._cached = true;
      }
    }

    if (!results.code) {
      results.code = await searchGitHubCode(query, env, opts);
      // Cache for 5 minutes
      if (env.CACHE && results.code.results?.length) {
        await env.CACHE.put(cacheKey, JSON.stringify(results.code), {
          expirationTtl: 300,
        });
      }
    }
  }

  results.total_results =
    results.agents.length +
    results.workers.length +
    results.orgs.length +
    results.docs.length +
    (results.code?.results?.length || 0);

  return results;
}

// ─── Suggestions ────────────────────────────────────────────────────────────

function getSuggestions(query) {
  const q = query.toLowerCase();
  const suggestions = [];

  // Agent names
  for (const a of AGENTS) {
    if (a.name.toLowerCase().startsWith(q)) suggestions.push({ type: "agent", value: a.name });
  }

  // Worker names
  for (const w of WORKERS) {
    if (w.name.toLowerCase().includes(q)) suggestions.push({ type: "worker", value: w.name });
  }

  // Org names
  for (const o of ORGS) {
    if (o.name.toLowerCase().includes(q)) suggestions.push({ type: "org", value: o.name });
  }

  // Doc names
  for (const d of DOCS) {
    if (d.toLowerCase().includes(q)) suggestions.push({ type: "doc", value: d });
  }

  return suggestions.slice(0, 20);
}

// ─── Router ─────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "") || "/";
    const method = request.method;

    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    // GET / — service info
    if (path === "/" && method === "GET") {
      return json({
        service: "blackroad-search",
        version: "1.0.0",
        description: "Full-text search across all BlackRoad repos, code, workers, agents, and docs",
        searchable: {
          agents: AGENTS.length,
          workers: WORKERS.length,
          orgs: ORGS.length,
          docs: DOCS.length,
          code: !!env.GITHUB_TOKEN,
        },
        endpoints: [
          "GET /health",
          "GET /search?q=",
          "GET /code?q=",
          "GET /repos?q=",
          "GET /workers?q=",
          "GET /agents?q=",
          "GET /docs?q=",
          "GET /orgs?q=",
          "GET /suggest?q=",
        ],
        ts: new Date().toISOString(),
      });
    }

    // GET /health
    if (path === "/health" && method === "GET") {
      return json({
        ok: true,
        service: "blackroad-search",
        cache_kv: !!env.CACHE,
        github_token: !!env.GITHUB_TOKEN,
        ts: new Date().toISOString(),
      });
    }

    const q = url.searchParams.get("q");

    // GET /search?q= — unified search
    if (path === "/search" && method === "GET") {
      if (!q) return json({ error: "q parameter required" }, 400);
      const results = await unifiedSearch(q, env, {
        limit: url.searchParams.get("limit"),
        org: url.searchParams.get("org"),
      });
      return json(results);
    }

    // GET /code?q=
    if (path === "/code" && method === "GET") {
      if (!q) return json({ error: "q parameter required" }, 400);
      const results = await searchGitHubCode(q, env, {
        limit: url.searchParams.get("limit"),
        org: url.searchParams.get("org"),
      });
      return json(results);
    }

    // GET /workers?q=
    if (path === "/workers" && method === "GET") {
      if (!q) return json({ workers: WORKERS });
      return json({ query: q, workers: searchWorkers(q) });
    }

    // GET /agents?q=
    if (path === "/agents" && method === "GET") {
      if (!q) return json({ agents: AGENTS });
      return json({ query: q, agents: searchAgents(q) });
    }

    // GET /orgs?q=
    if (path === "/orgs" && method === "GET") {
      if (!q) return json({ orgs: ORGS });
      return json({ query: q, orgs: searchOrgs(q) });
    }

    // GET /docs?q=
    if (path === "/docs" && method === "GET") {
      if (!q) return json({ docs: DOCS });
      return json({ query: q, docs: searchDocs(q) });
    }

    // GET /suggest?q=
    if (path === "/suggest" && method === "GET") {
      if (!q) return json({ suggestions: [] });
      return json({ query: q, suggestions: getSuggestions(q) });
    }

    return json({ error: `Not found: ${method} ${path}` }, 404);
  },
};
