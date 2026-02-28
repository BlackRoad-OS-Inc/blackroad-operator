/**
 * BlackRoad OS — Repo Index Worker
 *
 * Crawls all 17 GitHub organizations, indexes every repository into KV + D1.
 * Provides search, lookup, and tunnel-ready metadata for the entire ecosystem.
 *
 * Endpoints:
 *   GET  /                — service info
 *   GET  /health          — health check
 *   GET  /stats           — index statistics
 *   GET  /repos           — list all indexed repos (paginated)
 *   GET  /repos/:org      — repos for a specific org
 *   GET  /repos/:org/:name — single repo detail
 *   GET  /search?q=       — search repos by name/topic/language
 *   GET  /orgs            — list all indexed orgs with counts
 *   POST /reindex         — trigger a full re-index (auth required)
 *   POST /reindex/:org    — re-index a single org (auth required)
 *
 * Scheduled:
 *   Every 6 hours — incremental crawl of all orgs
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function requireAuth(request, env) {
  if (!env.AUTH_TOKEN) return true;
  const auth = request.headers.get("Authorization") || "";
  return auth.replace("Bearer ", "").trim() === env.AUTH_TOKEN;
}

// ─── GitHub API helpers ─────────────────────────────────────────────────────

async function githubFetch(path, env, opts = {}) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "BlackRoad-Repo-Index/1.0",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  }
  const res = await fetch(`https://api.github.com${path}`, {
    headers,
    ...opts,
  });
  return res;
}

async function fetchOrgRepos(org, env) {
  const repos = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const res = await githubFetch(
      `/orgs/${org}/repos?per_page=${perPage}&page=${page}&sort=updated`,
      env
    );

    if (!res.ok) {
      // Try user endpoint for personal accounts
      if (res.status === 404 && page === 1) {
        return fetchUserRepos(org, env);
      }
      break;
    }

    const batch = await res.json();
    if (!batch.length) break;

    repos.push(...batch);
    if (batch.length < perPage) break;
    page++;
  }

  return repos;
}

async function fetchUserRepos(user, env) {
  const repos = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const res = await githubFetch(
      `/users/${user}/repos?per_page=${perPage}&page=${page}&sort=updated`,
      env
    );
    if (!res.ok) break;

    const batch = await res.json();
    if (!batch.length) break;

    repos.push(...batch);
    if (batch.length < perPage) break;
    page++;
  }

  return repos;
}

// ─── Index storage ──────────────────────────────────────────────────────────

function repoToRecord(repo, org) {
  return {
    id: repo.id,
    org,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description || "",
    language: repo.language || "unknown",
    topics: repo.topics || [],
    visibility: repo.visibility || (repo.private ? "private" : "public"),
    default_branch: repo.default_branch || "main",
    html_url: repo.html_url,
    clone_url: repo.clone_url,
    ssh_url: repo.ssh_url,
    homepage: repo.homepage || null,
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
    open_issues: repo.open_issues_count || 0,
    size_kb: repo.size || 0,
    is_fork: repo.fork || false,
    is_archived: repo.archived || false,
    created_at: repo.created_at,
    updated_at: repo.updated_at,
    pushed_at: repo.pushed_at,
    indexed_at: new Date().toISOString(),
  };
}

async function storeRepos(records, env) {
  // Store in KV for fast lookups
  const kvWrites = records.map((r) =>
    env.INDEX.put(
      `repo:${r.org}:${r.name}`,
      JSON.stringify(r),
      {
        expirationTtl: 86400 * 7, // 7 days
        metadata: {
          org: r.org,
          name: r.name,
          language: r.language,
          stars: r.stars,
          updated_at: r.updated_at,
        },
      }
    )
  );

  await Promise.all(kvWrites);

  // Store org summary in KV
  const orgGroups = {};
  for (const r of records) {
    if (!orgGroups[r.org]) orgGroups[r.org] = [];
    orgGroups[r.org].push(r.name);
  }

  const orgWrites = Object.entries(orgGroups).map(([org, names]) =>
    env.INDEX.put(
      `org:${org}`,
      JSON.stringify({
        org,
        repo_count: names.length,
        repos: names,
        indexed_at: new Date().toISOString(),
      }),
      { expirationTtl: 86400 * 7 }
    )
  );

  await Promise.all(orgWrites);

  // Update global stats
  const stats = {
    total_repos: records.length,
    total_orgs: Object.keys(orgGroups).length,
    by_org: Object.fromEntries(
      Object.entries(orgGroups).map(([k, v]) => [k, v.length])
    ),
    languages: {},
    last_indexed: new Date().toISOString(),
  };

  for (const r of records) {
    stats.languages[r.language] = (stats.languages[r.language] || 0) + 1;
  }

  await env.INDEX.put("__stats__", JSON.stringify(stats), {
    expirationTtl: 86400 * 7,
  });

  return stats;
}

// ─── Full indexing ──────────────────────────────────────────────────────────

async function indexAllOrgs(env) {
  const orgList = (env.ORGS || "").split(",").filter(Boolean);
  const allRecords = [];
  const errors = [];

  for (const org of orgList) {
    try {
      const repos = await fetchOrgRepos(org.trim(), env);
      const records = repos.map((r) => repoToRecord(r, org.trim()));
      allRecords.push(...records);
    } catch (err) {
      errors.push({ org: org.trim(), error: err.message });
    }
  }

  const stats = await storeRepos(allRecords, env);
  return { ...stats, errors };
}

async function indexSingleOrg(org, env) {
  const repos = await fetchOrgRepos(org, env);
  const records = repos.map((r) => repoToRecord(r, org));
  await storeRepos(records, env);
  return { org, repo_count: records.length, indexed_at: new Date().toISOString() };
}

// ─── Search ─────────────────────────────────────────────────────────────────

async function searchRepos(query, env, opts = {}) {
  const q = query.toLowerCase();
  const limit = Math.min(parseInt(opts.limit) || 50, 200);
  const org = opts.org || null;

  const prefix = org ? `repo:${org}:` : "repo:";
  const list = await env.INDEX.list({ prefix, limit: 1000 });

  const matches = [];
  for (const key of list.keys) {
    const meta = key.metadata || {};
    const name = meta.name || key.name.split(":").pop();
    if (
      name.toLowerCase().includes(q) ||
      (meta.language || "").toLowerCase().includes(q) ||
      (meta.org || "").toLowerCase().includes(q)
    ) {
      matches.push({
        key: key.name,
        org: meta.org,
        name: meta.name || name,
        language: meta.language,
        stars: meta.stars,
        updated_at: meta.updated_at,
      });
    }
    if (matches.length >= limit) break;
  }

  // Sort by stars descending
  matches.sort((a, b) => (b.stars || 0) - (a.stars || 0));

  return { query, count: matches.length, results: matches };
}

// ─── Route handlers ─────────────────────────────────────────────────────────

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
        service: "blackroad-repo-index",
        version: "1.0.0",
        description:
          "Indexes all 17 BlackRoad GitHub orgs — 1,825+ repos searchable and tunnel-ready",
        endpoints: [
          "GET  /health",
          "GET  /stats",
          "GET  /repos",
          "GET  /repos/:org",
          "GET  /repos/:org/:name",
          "GET  /search?q=",
          "GET  /orgs",
          "POST /reindex",
          "POST /reindex/:org",
        ],
        ts: new Date().toISOString(),
      });
    }

    // GET /health
    if (path === "/health" && method === "GET") {
      return json({
        ok: true,
        service: "blackroad-repo-index",
        kv: !!env.INDEX,
        github_token: !!env.GITHUB_TOKEN,
        ts: new Date().toISOString(),
      });
    }

    // GET /stats
    if (path === "/stats" && method === "GET") {
      const raw = await env.INDEX.get("__stats__");
      if (!raw) {
        return json({
          total_repos: 0,
          total_orgs: 0,
          message: "Index is empty. POST /reindex to populate.",
        });
      }
      return json(JSON.parse(raw));
    }

    // GET /orgs
    if (path === "/orgs" && method === "GET") {
      const orgList = (env.ORGS || "").split(",").filter(Boolean);
      const orgs = [];
      for (const org of orgList) {
        const raw = await env.INDEX.get(`org:${org.trim()}`);
        if (raw) {
          const data = JSON.parse(raw);
          orgs.push({
            org: data.org,
            repo_count: data.repo_count,
            indexed_at: data.indexed_at,
          });
        } else {
          orgs.push({ org: org.trim(), repo_count: 0, indexed_at: null });
        }
      }
      return json({ count: orgs.length, orgs });
    }

    // GET /search?q=
    if (path === "/search" && method === "GET") {
      const q = url.searchParams.get("q");
      if (!q) return json({ error: "q parameter required" }, 400);
      const results = await searchRepos(q, env, {
        limit: url.searchParams.get("limit"),
        org: url.searchParams.get("org"),
      });
      return json(results);
    }

    // GET /repos — list all
    if (path === "/repos" && method === "GET") {
      const limit = Math.min(parseInt(url.searchParams.get("limit")) || 100, 500);
      const cursor = url.searchParams.get("cursor") || undefined;
      const list = await env.INDEX.list({ prefix: "repo:", limit, cursor });
      const repos = list.keys.map((k) => ({
        key: k.name,
        org: k.metadata?.org,
        name: k.metadata?.name,
        language: k.metadata?.language,
        stars: k.metadata?.stars,
        updated_at: k.metadata?.updated_at,
      }));
      return json({
        count: repos.length,
        cursor: list.list_complete ? null : list.cursor,
        repos,
      });
    }

    // GET /repos/:org
    const orgMatch = path.match(/^\/repos\/([^/]+)$/);
    if (orgMatch && method === "GET") {
      const org = orgMatch[1];
      const raw = await env.INDEX.get(`org:${org}`);
      if (!raw) return json({ error: `Org "${org}" not indexed` }, 404);
      const data = JSON.parse(raw);

      // Fetch individual repo metadata
      const repos = [];
      const repoNames = data.repos.slice(0, 200);
      const CONCURRENCY = 20;

      for (let i = 0; i < repoNames.length; i += CONCURRENCY) {
        const chunk = repoNames.slice(i, i + CONCURRENCY);
        const results = await Promise.all(
          chunk.map(async (name) => {
            const repoRaw = await env.INDEX.get(`repo:${org}:${name}`);
            if (!repoRaw) return null;
            const r = JSON.parse(repoRaw);
            return {
              name: r.name,
              description: r.description,
              language: r.language,
              stars: r.stars,
              visibility: r.visibility,
              is_fork: r.is_fork,
              updated_at: r.updated_at,
            };
          }),
        );

        for (const repo of results) {
          if (repo) {
            repos.push(repo);
          }
        }
      }

      return json({ org, total: data.repo_count, repos });
    }

    // GET /repos/:org/:name
    const repoMatch = path.match(/^\/repos\/([^/]+)\/([^/]+)$/);
    if (repoMatch && method === "GET") {
      const [, org, name] = repoMatch;
      const raw = await env.INDEX.get(`repo:${org}:${name}`);
      if (!raw) return json({ error: `Repo "${org}/${name}" not found` }, 404);
      return json(JSON.parse(raw));
    }

    // POST /reindex — full re-index
    if (path === "/reindex" && method === "POST") {
      if (!requireAuth(request, env)) return json({ error: "Unauthorized" }, 401);
      if (!env.GITHUB_TOKEN) {
        return json({ error: "GITHUB_TOKEN secret not configured" }, 500);
      }
      const result = await indexAllOrgs(env);
      return json({ ok: true, ...result });
    }

    // POST /reindex/:org
    const reindexOrgMatch = path.match(/^\/reindex\/([^/]+)$/);
    if (reindexOrgMatch && method === "POST") {
      if (!requireAuth(request, env)) return json({ error: "Unauthorized" }, 401);
      if (!env.GITHUB_TOKEN) {
        return json({ error: "GITHUB_TOKEN secret not configured" }, 500);
      }
      const org = reindexOrgMatch[1];
      const result = await indexSingleOrg(org, env);
      return json({ ok: true, ...result });
    }

    return json({ error: `Not found: ${method} ${path}` }, 404);
  },

  async scheduled(event, env) {
    if (env.GITHUB_TOKEN) {
      await indexAllOrgs(env);
    }
  },
};
