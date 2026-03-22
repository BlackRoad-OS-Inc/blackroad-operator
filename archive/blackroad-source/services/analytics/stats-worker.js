// BlackRoad Stats API — Central live data hub for all BlackRoad websites
// KV-backed, pushed from Mac cron, consumed by all frontends
//
// GET  /fleet       — node status, specs, services
// GET  /infra       — infrastructure counts (tunnels, DBs, ports, etc.)
// GET  /github      — live GitHub data (proxied + cached)
// GET  /analytics   — proxied from analytics worker
// GET  /all         — combined payload for single-fetch
// POST /push        — push data from collector (requires STATS_KEY)
// GET  /health      — uptime check

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Cache-Control': 'public, max-age=30',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

const GITHUB_USER = 'blackboxprogramming';
const ANALYTICS_URL = 'https://analytics-blackroad.amundsonalexa.workers.dev';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    try {
      // ── Push data from collector ──
      if (path === '/push' && request.method === 'POST') {
        const authKey = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!authKey || authKey !== env.STATS_KEY) return json({ error: 'unauthorized — use Authorization header' }, 401);

        const body = await request.json();
        const { category, data } = body;
        if (!category || !data) return json({ error: 'category and data required' }, 400);

        // Store with timestamp
        const payload = { data, updated_at: new Date().toISOString() };
        await env.STATS.put(`stats:${category}`, JSON.stringify(payload));
        return json({ ok: true, category });
      }

      // ── Fleet status ──
      if (path === '/fleet') {
        const raw = await env.STATS.get('stats:fleet');
        if (!raw) return json({ error: 'no fleet data yet', hint: 'run collector' }, 404);
        return json(JSON.parse(raw));
      }

      // ── Infrastructure counts ──
      if (path === '/infra') {
        const raw = await env.STATS.get('stats:infra');
        if (!raw) return json({ error: 'no infra data yet' }, 404);
        return json(JSON.parse(raw));
      }

      // ── GitHub data (proxied + cached 5min) ──
      if (path === '/github') {
        const cached = await env.STATS.get('cache:github');
        if (cached) return json(JSON.parse(cached));

        // Fetch repos (2 pages to get all)
        const [p1, p2] = await Promise.all([
          fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&page=1&sort=updated`, {
            headers: { 'User-Agent': 'BlackRoad-Stats/1.0', ...(env.GITHUB_TOKEN ? { 'Authorization': `token ${env.GITHUB_TOKEN}` } : {}) }
          }),
          fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&page=2&sort=updated`, {
            headers: { 'User-Agent': 'BlackRoad-Stats/1.0', ...(env.GITHUB_TOKEN ? { 'Authorization': `token ${env.GITHUB_TOKEN}` } : {}) }
          }),
        ]);
        const repos1 = await p1.json();
        const repos2 = await p2.json();
        const allRepos = [...(Array.isArray(repos1) ? repos1 : []), ...(Array.isArray(repos2) ? repos2 : [])];
        const nonFork = allRepos.filter(r => !r.fork);

        const result = {
          total_repos: allRepos.length,
          non_fork_repos: nonFork.length,
          forks: allRepos.length - nonFork.length,
          total_stars: nonFork.reduce((s, r) => s + (r.stargazers_count || 0), 0),
          total_size_kb: nonFork.reduce((s, r) => s + (r.size || 0), 0),
          languages: [...new Set(nonFork.map(r => r.language).filter(Boolean))],
          most_recent: nonFork.slice(0, 5).map(r => ({
            name: r.name,
            updated: r.updated_at,
            language: r.language,
            stars: r.stargazers_count,
          })),
          fetched_at: new Date().toISOString(),
        };

        await env.STATS.put('cache:github', JSON.stringify(result), { expirationTtl: 300 });
        return json(result);
      }

      // ── Analytics proxy ──
      if (path === '/analytics') {
        const range = url.searchParams.get('range') || '24h';
        const cached = await env.STATS.get(`cache:analytics:${range}`);
        if (cached) return json(JSON.parse(cached));

        const res = await fetch(`${ANALYTICS_URL}/stats?range=${range}`);
        if (!res.ok) return json({ error: 'analytics unavailable' }, 502);
        const data = await res.json();
        await env.STATS.put(`cache:analytics:${range}`, JSON.stringify(data), { expirationTtl: 60 });
        return json(data);
      }

      // ── Combined payload ──
      if (path === '/all') {
        const [fleet, infra, github, analytics] = await Promise.all([
          env.STATS.get('stats:fleet'),
          env.STATS.get('stats:infra'),
          env.STATS.get('cache:github').then(c => c || fetchGitHub(env)),
          env.STATS.get('cache:analytics:24h').then(c => c || env.STATS.get('stats:analytics')).then(c => c || fetchAnalytics(env)),
        ]);

        const ecosystem = await env.STATS.get('stats:ecosystem');

        return json({
          fleet: fleet ? JSON.parse(fleet) : null,
          infra: infra ? JSON.parse(infra) : null,
          github: github ? (typeof github === 'string' ? JSON.parse(github) : github) : null,
          analytics: analytics ? (typeof analytics === 'string' ? JSON.parse(analytics) : analytics) : null,
          ecosystem: ecosystem ? JSON.parse(ecosystem) : null,
        });
      }

      // ── Ecosystem stats ──
      if (path === '/ecosystem') {
        const eco = await env.STATS.get('stats:ecosystem');
        return json(eco ? JSON.parse(eco) : { data: {} });
      }

      // ── Any pushed category by name ──
      if (path.startsWith('/stats/')) {
        const category = path.slice(7);
        const data = await env.STATS.get(`stats:${category}`);
        return json(data ? JSON.parse(data) : { error: 'not found' });
      }

      // ── Health ──
      if (path === '/health') {
        const fleet = await env.STATS.get('stats:fleet');
        const fleetAge = fleet ? JSON.parse(fleet).updated_at : null;
        return json({
          status: 'up',
          fleet_data: fleetAge ? `last updated ${fleetAge}` : 'no data yet',
        });
      }

      return json({ error: 'not found', endpoints: ['/fleet', '/infra', '/github', '/analytics', '/all', '/push', '/health'] }, 404);

    } catch (err) {
      return json({ error: err.message }, 500);
    }
  },
};

async function fetchGitHub(env) {
  try {
    const [p1, p2] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&page=1&sort=updated`, {
        headers: { 'User-Agent': 'BlackRoad-Stats/1.0', ...(env.GITHUB_TOKEN ? { 'Authorization': `token ${env.GITHUB_TOKEN}` } : {}) }
      }),
      fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&page=2&sort=updated`, {
        headers: { 'User-Agent': 'BlackRoad-Stats/1.0', ...(env.GITHUB_TOKEN ? { 'Authorization': `token ${env.GITHUB_TOKEN}` } : {}) }
      }),
    ]);
    const repos = [...await p1.json(), ...await p2.json()];
    const nonFork = repos.filter(r => !r.fork);
    const result = {
      total_repos: repos.length,
      non_fork_repos: nonFork.length,
      forks: repos.length - nonFork.length,
      total_stars: nonFork.reduce((s, r) => s + (r.stargazers_count || 0), 0),
      languages: [...new Set(nonFork.map(r => r.language).filter(Boolean))],
      fetched_at: new Date().toISOString(),
    };
    await env.STATS.put('cache:github', JSON.stringify(result), { expirationTtl: 300 });
    return JSON.stringify(result);
  } catch { return null; }
}

async function fetchAnalytics(env) {
  try {
    const res = await fetch(`${ANALYTICS_URL}/stats?range=24h`);
    const data = await res.json();
    await env.STATS.put('cache:analytics:24h', JSON.stringify(data), { expirationTtl: 60 });
    return JSON.stringify(data);
  } catch { return null; }
}
