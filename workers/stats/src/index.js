/**
 * BlackRoad Stats API — Enhanced
 *
 * Single source of truth for all fleet statistics + BlackBoard analytics.
 * Every website fetches from this instead of hardcoding numbers.
 *
 * GET /api/stats          — all stats as JSON (enhanced with analytics)
 * GET /api/stats/live     — real-time: active visitors, pageviews today/hour
 * GET /api/stats/traffic  — traffic breakdown by site
 * GET /api/stats/perf     — Core Web Vitals summary
 * GET /api/stats/geo      — country/city breakdown
 * GET /api/stats/tech     — browser/os/device breakdown
 * GET /api/stats/timeline — daily pageviews/visitors for last 30 days
 * GET /api/stats/all      — everything in one call (dashboard)
 * GET /api/stats/:key     — single stat
 * POST /api/stats         — update stats (from fleet cron, requires auth)
 * GET /api/health         — detailed health check with uptime + data freshness
 * GET /stats.js           — embeddable client library
 * GET /health             — legacy health (redirects to /api/health)
 *
 * Cron: refreshes GitHub + Gitea + Cloudflare + BlackBoard every 5 minutes.
 * Fleet nodes push local stats (memories, databases, models) via POST.
 */

// ─── Constants ───────────────────────────────────────────────

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cross-Origin-Resource-Policy': 'cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'X-Robots-Tag': 'noindex, nofollow',
};

const CACHE_TTL = 120_000; // 2 minutes for GET responses
const CRON_TTL_GITHUB = 3600; // 1 hour KV TTL (cron refreshes every 5 min, TTL is fallback)
const CRON_TTL_CF = 3600;
const CRON_TTL_GITEA = 3600;
const CRON_TTL_BB = 600; // BlackBoard refreshes faster
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 30; // max POST requests per IP per minute
const WORKER_START = Date.now();

// Hardware constants — only change when physical hardware changes
const HARDWARE = {
  tops: 52,          // 2x Hailo-8 @ 26 TOPS
  nodes: 5,          // Alice, Cecilia, Octavia, Aria, Lucidia
  hailo_units: 2,    // Cecilia + Octavia
};

// All GitHub orgs to crawl
const GITHUB_ORGS = [
  'BlackRoad-OS', 'BlackRoad-AI', 'BlackRoad-OS-Inc', 'Blackbox-Enterprises',
  'BlackRoad-Cloud', 'BlackRoad-Security', 'BlackRoad-Media', 'BlackRoad-Foundation',
  'BlackRoad-Interactive', 'BlackRoad-Hardware', 'BlackRoad-Labs', 'BlackRoad-Studio',
  'BlackRoad-Ventures', 'BlackRoad-Education', 'BlackRoad-Gov', 'BlackRoad-Archive',
];

// BlackBoard API base
const BB_BASE = 'https://bb.blackroad.io';

// Privacy manifest — public transparency about data practices
const PRIVACY_MANIFEST = {
  service: 'BlackRoad Stats API',
  version: '2.1.0',
  owner: 'BlackRoad OS, Inc.',
  contact: 'amundsonalexa@gmail.com',
  data_collected: {
    stats_api: {
      description: 'Aggregated infrastructure metrics — no user data',
      fields: ['repo counts', 'worker counts', 'fleet node status', 'hardware specs'],
      pii: false,
      cookies: false,
    },
    blackboard_analytics: {
      description: 'Privacy-respecting website analytics',
      fields: ['page path', 'referrer domain', 'viewport size', 'browser family', 'country (from CF edge, IP not stored)'],
      optional_fields: ['canvas fingerprint hash (not raw data)', 'scroll depth', 'click heatmaps'],
      pii: false,
      cookies: false,
      ip_stored: false,
      ip_handling: 'Last octet zeroed before any processing. Never stored in raw form.',
    },
    fleet_push: {
      description: 'Internal fleet nodes push hardware metrics',
      fields: ['CPU temp', 'disk %', 'RAM %', 'uptime', 'model count'],
      pii: false,
      auth_required: true,
    },
  },
  opt_out: {
    dnt: 'Set Do Not Track (DNT: 1) in your browser. BlackBoard honors it fully — fingerprinting, heatmaps, and interaction tracking are disabled. Only anonymous pageview counts are recorded.',
    disable: 'Block bb.blackroad.io in your browser or ad blocker to disable all analytics.',
  },
  retention: {
    raw_events: '90 days',
    aggregated_stats: 'Indefinite',
    fingerprints: '30 days',
    heatmaps: '90 days',
  },
  data_sharing: 'None. No data is sold, shared with, or accessible to third parties.',
  data_location: 'Cloudflare edge network (no single data center).',
  rights: 'Email us to request data deletion or export.',
};

// ─── Helpers ─────────────────────────────────────────────────

function json(data, status = 200, cacheSeconds = 120) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${cacheSeconds}`,
      ...CORS,
    },
  });
}

function safeFetch(url, opts = {}) {
  return fetch(url, {
    signal: AbortSignal.timeout(opts.timeout || 8000),
    ...opts,
  }).catch(() => null);
}

async function safeJson(url, opts = {}) {
  try {
    const res = await safeFetch(url, opts);
    if (!res || !res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function kvGet(env, key) {
  try {
    const raw = await env.STATS_KV.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function kvPut(env, key, data, ttl) {
  const opts = ttl ? { expirationTtl: ttl } : {};
  await env.STATS_KV.put(key, JSON.stringify(data), opts);
}

// ─── Rate Limiting ───────────────────────────────────────────

const rateLimitMap = new Map(); // ephemeral, per-isolate

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return true;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) return false;
  return true;
}

// ─── Embeddable Client Script ────────────────────────────────

const STATS_JS = `(function(){
  var base='https://stats.blackroad.io';
  var cache={};

  function animateCount(el,target){
    var start=0,dur=800,t0=performance.now();
    var fmt=el.dataset.statFormat||'number';
    function step(ts){
      var p=Math.min((ts-t0)/dur,1);
      p=1-Math.pow(1-p,3);
      var v=Math.round(start+(target-start)*p);
      if(fmt==='percent')el.textContent=v+'%';
      else if(fmt==='ms')el.textContent=v+'ms';
      else el.textContent=v.toLocaleString();
      if(p<1)requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function drawSparkline(el,data){
    if(!data||!data.length)return;
    var w=parseInt(el.dataset.sparkWidth)||100;
    var h=parseInt(el.dataset.sparkHeight)||24;
    var color=el.dataset.sparkColor||'#FF1D6C';
    var max=Math.max.apply(null,data);
    var min=Math.min.apply(null,data);
    var range=max-min||1;
    var step=w/(data.length-1);
    var pts=data.map(function(v,i){
      return (i*step)+','+(h-((v-min)/range)*h*0.8-h*0.1);
    }).join(' ');
    el.innerHTML='<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" xmlns="http://www.w3.org/2000/svg">'
      +'<polyline points="'+pts+'" fill="none" stroke="'+color+'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
      +'</svg>';
  }

  function load(url,cb){
    if(cache[url]){cb(cache[url]);return;}
    fetch(url,{signal:AbortSignal.timeout(4000)})
      .then(function(r){return r.json()})
      .then(function(d){cache[url]=d;cb(d)})
      .catch(function(){});
  }

  load(base+'/api/stats',function(s){
    document.querySelectorAll('[data-live-stat]').forEach(function(el){
      var k=el.getAttribute('data-live-stat'),v=s[k];
      if(v!=null){
        el.textContent=typeof v==='number'?v.toLocaleString():v;
        if(el.dataset.t)el.dataset.t=v;
      }
    });
    document.querySelectorAll('[data-stat-counter]').forEach(function(el){
      var k=el.getAttribute('data-stat-counter'),v=s[k];
      if(typeof v==='number')animateCount(el,v);
      else if(v!=null)el.textContent=v;
    });
  });

  load(base+'/api/stats/timeline',function(d){
    document.querySelectorAll('[data-stat-sparkline]').forEach(function(el){
      var k=el.getAttribute('data-stat-sparkline')||'pageviews';
      if(d&&d.timeline){
        var vals=d.timeline.map(function(day){return day[k]||0});
        drawSparkline(el,vals);
      }
    });
  });
})();`;

// ─── Router ──────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    // Static assets
    if (path === '/stats.js') {
      return new Response(STATS_JS, {
        headers: {
          'Content-Type': 'application/javascript',
          'Cache-Control': 'public, max-age=300',
          ...CORS,
        },
      });
    }

    // Health endpoints
    if (path === '/health' || path === '/api/health') {
      return await handleHealth(env);
    }

    // Privacy manifest
    if (path === '/privacy' || path === '/api/privacy') {
      return json(PRIVACY_MANIFEST, 200, 3600);
    }

    // GET endpoints
    if (request.method === 'GET') {
      if (path === '/api/stats') return json(await getAllStats(env));
      if (path === '/api/stats/live') return json(await getLiveStats(env));
      if (path === '/api/stats/traffic') return json(await getTrafficStats(env));
      if (path === '/api/stats/perf') return json(await getPerfStats(env));
      if (path === '/api/stats/geo') return json(await getGeoStats(env));
      if (path === '/api/stats/tech') return json(await getTechStats(env));
      if (path === '/api/stats/timeline') return json(await getTimelineStats(env));
      if (path === '/api/stats/all') return json(await getAllCombined(env));
      if (path === '/api/stats/nodes') return json(await getNodeStats(env));
      if (path === '/api/stats/fleet-health') return json(await getFleetHealth(env));
      if (path === '/api/stats/velocity') return json(await getVelocity(env));

      // GET /api/stats/:key — single stat lookup
      if (path.startsWith('/api/stats/')) {
        const key = path.split('/api/stats/')[1];
        const stats = await getAllStats(env);
        if (key in stats) return json({ [key]: stats[key] });
        return json({ error: 'Unknown stat: ' + key }, 404);
      }
    }

    // POST /api/stats — fleet push
    if (path === '/api/stats' && request.method === 'POST') {
      return await handleFleetPush(request, env);
    }

    return json({ error: 'Not found' }, 404);
  },

  // Cron: refresh all external stats
  async scheduled(event, env, ctx) {
    ctx.waitUntil(refreshAllStats(env));
  },
};

// ─── POST handler with rate limiting ─────────────────────────

async function handleFleetPush(request, env) {
  // Rate limit
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (!checkRateLimit(ip)) {
    return json({ error: 'Rate limit exceeded' }, 429, 0);
  }

  // Auth
  const auth = request.headers.get('Authorization');
  if (!auth || auth !== 'Bearer ' + (env.STATS_SECRET || '')) {
    return json({ error: 'Unauthorized' }, 401);
  }

  // Validate request body size
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
  if (contentLength > 64 * 1024) {
    return json({ error: 'Payload too large' }, 413, 0);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400, 0);
  }

  // Validate body is a plain object
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json({ error: 'Expected JSON object' }, 400, 0);
  }

  const existing = (await kvGet(env, 'fleet_stats')) || {};
  const merged = { ...existing, updated: new Date().toISOString() };

  // Only allow known safe value types, sanitize strings
  for (const [k, v] of Object.entries(body)) {
    if (k.startsWith('_')) continue; // skip meta keys except _node
    if (k === '_node' && typeof v === 'string') { continue; } // handled below
    if (typeof v === 'number' && isFinite(v) && typeof existing[k] === 'number') {
      merged[k] = Math.max(existing[k], v);
    } else if (typeof v === 'number' && isFinite(v)) {
      merged[k] = v;
    } else if (typeof v === 'string' && v.length <= 500) {
      merged[k] = v.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    }
  }

  await kvPut(env, 'fleet_stats', merged);

  // Track uptime and per-node data
  if (body._node && typeof body._node === 'string') {
    const nodeName = body._node.toLowerCase().replace(/[^a-z0-9-]/g, '');
    await recordUptime(env, nodeName);

    // Store per-node metrics for the /nodes endpoint
    const nodeData = (await kvGet(env, 'node_data')) || {};
    nodeData[nodeName] = {
      cpu_temp: body.cpu_temp ?? nodeData[nodeName]?.cpu_temp ?? null,
      disk_pct: body.disk_pct ?? nodeData[nodeName]?.disk_pct ?? null,
      ram_pct: body.ram_pct ?? nodeData[nodeName]?.ram_pct ?? null,
      load_avg: body.load_avg ?? nodeData[nodeName]?.load_avg ?? null,
      models: body.models ?? nodeData[nodeName]?.models ?? null,
      docker_containers: body.docker_containers ?? nodeData[nodeName]?.docker_containers ?? null,
      services_up: body.services_up ?? nodeData[nodeName]?.services_up ?? null,
      uptime_secs: body.uptime_secs ?? nodeData[nodeName]?.uptime_secs ?? null,
      inet_up: body.inet_up ?? null,
      updated: new Date().toISOString(),
    };
    await kvPut(env, 'node_data', nodeData);
  }

  return json({ ok: true, stats: merged });
}

// ─── Health ──────────────────────────────────────────────────

async function handleHealth(env) {
  const now = Date.now();
  const uptimeSec = Math.floor((now - WORKER_START) / 1000);

  const [gh, cf, gitea, bb, fleet] = await Promise.all([
    kvGet(env, 'github_stats'),
    kvGet(env, 'cloudflare_stats'),
    kvGet(env, 'gitea_stats'),
    kvGet(env, 'bb_stats'),
    kvGet(env, 'fleet_stats'),
  ]);

  function freshness(data) {
    if (!data || !data.updated) return { status: 'unknown', last_refresh: null, age_seconds: null };
    const age = Math.floor((now - new Date(data.updated).getTime()) / 1000);
    return {
      status: age < 600 ? 'fresh' : age < 1800 ? 'stale' : 'expired',
      last_refresh: data.updated,
      age_seconds: age,
    };
  }

  const uptimeData = (await kvGet(env, 'uptime_records')) || {};

  return json({
    status: 'ok',
    service: 'blackroad-stats',
    version: '2.0.0',
    uptime_seconds: uptimeSec,
    sources: {
      github: freshness(gh),
      cloudflare: freshness(cf),
      gitea: freshness(gitea),
      blackboard: freshness(bb),
      fleet: freshness(fleet),
    },
    uptime_tracking: {
      nodes_tracked: Object.keys(uptimeData).length,
      nodes: Object.fromEntries(
        Object.entries(uptimeData).map(([node, data]) => [
          node,
          {
            last_seen: data.last_seen,
            uptime_pct: calculateUptimePercent(data),
            checks: data.checks || 0,
            ups: data.ups || 0,
          },
        ]),
      ),
    },
  }, 200, 30);
}

// ─── Uptime tracking ────────────────────────────────────────

async function recordUptime(env, nodeName) {
  const records = (await kvGet(env, 'uptime_records')) || {};
  const now = new Date().toISOString();

  if (!records[nodeName]) {
    records[nodeName] = { first_seen: now, last_seen: now, checks: 0, ups: 0 };
  }

  records[nodeName].last_seen = now;
  records[nodeName].checks = (records[nodeName].checks || 0) + 1;
  records[nodeName].ups = (records[nodeName].ups || 0) + 1;

  await kvPut(env, 'uptime_records', records);
}

function calculateUptimePercent(data) {
  if (!data || !data.checks || data.checks === 0) return 0;
  return Math.round(((data.ups || 0) / data.checks) * 10000) / 100;
}

// ─── Cache layer ─────────────────────────────────────────────

async function getCached(env, kvKey, builder, ttl = CACHE_TTL) {
  const cached = await kvGet(env, kvKey);
  if (cached && cached._ts && Date.now() - cached._ts < ttl) {
    const result = { ...cached };
    delete result._ts;
    return result;
  }
  const data = await builder(env);
  await kvPut(env, kvKey, { ...data, _ts: Date.now() });
  return data;
}

async function getAllStats(env) {
  return getCached(env, 'all_stats', buildStats);
}

// ─── Build main stats ───────────────────────────────────────

async function buildStats(env) {
  const stats = { ...HARDWARE };

  const [fleet, gh, cf, gitea, bb, velocity, fleetHealth] = await Promise.all([
    kvGet(env, 'fleet_stats'),
    kvGet(env, 'github_stats'),
    kvGet(env, 'cloudflare_stats'),
    kvGet(env, 'gitea_stats'),
    kvGet(env, 'bb_stats'),
    kvGet(env, 'github_velocity'),
    buildFleetHealthScore(env),
  ]);

  Object.assign(stats, {
    // GitHub
    repos: gh?.public_repos || null,
    repos_total: gh?.repos_total || null,
    orgs: gh?.orgs || null,
    org_breakdown: gh?.org_breakdown || null,
    github_user: 'blackboxprogramming',

    // Fleet (pushed by nodes)
    memories: fleet?.memories || null,
    databases: fleet?.databases || null,
    models: fleet?.models || null,
    cece_personas: fleet?.cece_personas || null,
    nodes_online: fleet?.nodes_online || null,
    agents: fleet?.agents || null,

    // Cloudflare (fetched by cron)
    workers: cf?.workers || null,
    pages: cf?.pages || null,
    domains: cf?.domains || null,
    tunnels: cf?.tunnels || null,

    // Gitea (fetched by cron)
    gitea_repos: gitea?.repos || fleet?.gitea_repos || null,

    // BlackBoard analytics
    total_pageviews: bb?.total_pageviews || null,
    total_visitors: bb?.total_visitors || null,
    total_sessions: bb?.total_sessions || null,
    avg_lcp: bb?.avg_lcp || null,
    avg_fcp: bb?.avg_fcp || null,
    bounce_rate: bb?.bounce_rate || null,
    top_country: bb?.top_country || null,
    top_browser: bb?.top_browser || null,
    top_device: bb?.top_device || null,
    errors_24h: bb?.errors_24h || null,
    bots_24h: bb?.bots_24h || null,
    active_visitors: bb?.active_visitors || null,

    // Velocity (GitHub commit activity)
    commits_24h: velocity?.commits_24h ?? null,
    commits_7d: velocity?.commits_7d ?? null,
    commits_30d: velocity?.commits_30d ?? null,
    active_repos_7d: velocity?.active_repos_7d ?? null,

    // Fleet health
    fleet_health: fleetHealth?.score ?? null,
    fleet_rating: fleetHealth?.rating ?? null,

    // Privacy
    privacy_url: 'https://stats.blackroad.io/privacy',
    dnt_honored: true,

    // Meta
    updated: fleet?.updated || gh?.updated || cf?.updated || bb?.updated || null,
  });

  return stats;
}

async function buildFleetHealthScore(env) {
  const fleet = (await kvGet(env, 'fleet_stats')) || {};
  const uptime = (await kvGet(env, 'uptime_records')) || {};
  const nodeData = (await kvGet(env, 'node_data')) || {};
  const totalNodes = 5;
  const onlineNodes = fleet.nodes_online || 0;
  let score = Math.round((onlineNodes / totalNodes) * 40);
  const uptimeValues = Object.values(uptime).map((u) => calculateUptimePercent(u)).filter((v) => v > 0);
  if (uptimeValues.length > 0) score += Math.round((uptimeValues.reduce((a, b) => a + b, 0) / uptimeValues.length / 100) * 20);
  const temps = Object.values(nodeData).map((n) => n.cpu_temp).filter((t) => typeof t === 'number');
  const avgTemp = temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : 50;
  score += avgTemp < 55 ? 15 : avgTemp < 65 ? 12 : avgTemp < 75 ? 8 : avgTemp < 85 ? 4 : 0;
  const disks = Object.values(nodeData).map((n) => n.disk_pct).filter((d) => typeof d === 'number');
  const avgDisk = disks.length > 0 ? disks.reduce((a, b) => a + b, 0) / disks.length : 50;
  score += avgDisk < 50 ? 15 : avgDisk < 70 ? 12 : avgDisk < 85 ? 8 : avgDisk < 95 ? 4 : 0;
  const services = Object.values(nodeData).map((n) => n.services_up).filter((s) => typeof s === 'number');
  score += services.reduce((a, b) => a + b, 0) > 10 ? 10 : services.reduce((a, b) => a + b, 0) > 5 ? 7 : services.reduce((a, b) => a + b, 0) > 0 ? 4 : 0;
  const rating = score >= 85 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'fair' : score >= 30 ? 'degraded' : 'critical';
  return { score, rating };
}

// ─── Live stats ──────────────────────────────────────────────

async function getLiveStats(env) {
  return getCached(env, 'live_stats_cache', async () => {
    const bb = await kvGet(env, 'bb_stats');
    const bbLive = await kvGet(env, 'bb_live');

    return {
      active_visitors: bbLive?.active_visitors ?? bb?.active_visitors ?? 0,
      pageviews_today: bbLive?.pageviews_today ?? bb?.pageviews_today ?? 0,
      pageviews_hour: bbLive?.pageviews_hour ?? 0,
      top_pages_now: bbLive?.top_pages || [],
      updated: bbLive?.updated || bb?.updated || null,
    };
  }, 30_000); // 30s cache for live data
}

// ─── Traffic stats ───────────────────────────────────────────

async function getTrafficStats(env) {
  return getCached(env, 'traffic_stats_cache', async () => {
    const bbSites = await kvGet(env, 'bb_sites');
    return {
      sites: bbSites?.sites || [],
      total_sites: bbSites?.total_sites || 0,
      updated: bbSites?.updated || null,
    };
  });
}

// ─── Performance stats ──────────────────────────────────────

async function getPerfStats(env) {
  return getCached(env, 'perf_stats_cache', async () => {
    const bbPerf = await kvGet(env, 'bb_performance');
    return {
      lcp: bbPerf?.lcp || null,
      fcp: bbPerf?.fcp || null,
      fid: bbPerf?.fid || null,
      cls: bbPerf?.cls || null,
      ttfb: bbPerf?.ttfb || null,
      inp: bbPerf?.inp || null,
      samples: bbPerf?.samples || 0,
      rating: bbPerf?.rating || null,
      updated: bbPerf?.updated || null,
    };
  });
}

// ─── Geo stats ───────────────────────────────────────────────

async function getGeoStats(env) {
  return getCached(env, 'geo_stats_cache', async () => {
    const bbStats = await kvGet(env, 'bb_stats');
    return {
      countries: bbStats?.countries || [],
      cities: bbStats?.cities || [],
      top_country: bbStats?.top_country || null,
      updated: bbStats?.updated || null,
    };
  });
}

// ─── Tech stats ──────────────────────────────────────────────

async function getTechStats(env) {
  return getCached(env, 'tech_stats_cache', async () => {
    const bbStats = await kvGet(env, 'bb_stats');
    return {
      browsers: bbStats?.browsers || [],
      os: bbStats?.os || [],
      devices: bbStats?.devices || [],
      top_browser: bbStats?.top_browser || null,
      top_device: bbStats?.top_device || null,
      updated: bbStats?.updated || null,
    };
  });
}

// ─── Timeline stats ─────────────────────────────────────────

async function getTimelineStats(env) {
  return getCached(env, 'timeline_stats_cache', async () => {
    const bbTimeline = await kvGet(env, 'bb_timeline');
    return {
      timeline: bbTimeline?.timeline || [],
      period: bbTimeline?.period || 'last_30_days',
      updated: bbTimeline?.updated || null,
    };
  });
}

// ─── All combined (dashboard endpoint) ──────────────────────

async function getAllCombined(env) {
  const [stats, live, traffic, perf, geo, tech, timeline] = await Promise.all([
    getAllStats(env),
    getLiveStats(env),
    getTrafficStats(env),
    getPerfStats(env),
    getGeoStats(env),
    getTechStats(env),
    getTimelineStats(env),
  ]);

  return {
    stats,
    live,
    traffic,
    performance: perf,
    geo,
    tech,
    timeline,
    nodes: await getNodeStats(env),
    fleet_health: await getFleetHealth(env),
    velocity: await getVelocity(env),
    privacy: PRIVACY_MANIFEST,
  };
}

// ─── Per-node stats ─────────────────────────────────────────

async function getNodeStats(env) {
  return getCached(env, 'node_stats_cache', async () => {
    const fleet = (await kvGet(env, 'fleet_stats')) || {};
    const uptime = (await kvGet(env, 'uptime_records')) || {};
    const nodeData = (await kvGet(env, 'node_data')) || {};

    const nodes = {};
    const knownNodes = ['alice', 'cecilia', 'octavia', 'aria', 'lucidia'];

    for (const name of knownNodes) {
      const nd = nodeData[name] || {};
      const up = uptime[name] || {};
      nodes[name] = {
        status: up.last_seen && (Date.now() - new Date(up.last_seen).getTime()) < 600_000 ? 'online' : 'offline',
        last_seen: up.last_seen || null,
        uptime_pct: calculateUptimePercent(up),
        cpu_temp: nd.cpu_temp ?? null,
        disk_pct: nd.disk_pct ?? null,
        ram_pct: nd.ram_pct ?? null,
        load_avg: nd.load_avg ?? null,
        models: nd.models ?? null,
        docker_containers: nd.docker_containers ?? null,
        services_up: nd.services_up ?? null,
        uptime_secs: nd.uptime_secs ?? null,
      };
    }

    return {
      nodes,
      total: knownNodes.length,
      online: Object.values(nodes).filter((n) => n.status === 'online').length,
      updated: fleet.updated || null,
    };
  }, 60_000);
}

// ─── Fleet health score ─────────────────────────────────────

async function getFleetHealth(env) {
  return getCached(env, 'fleet_health_cache', async () => {
    const fleet = (await kvGet(env, 'fleet_stats')) || {};
    const uptime = (await kvGet(env, 'uptime_records')) || {};
    const nodeData = (await kvGet(env, 'node_data')) || {};

    // Compute health score (0-100)
    let score = 0;
    let factors = [];

    // Factor 1: Node availability (40 points)
    const totalNodes = 5;
    const onlineNodes = fleet.nodes_online || 0;
    const nodeScore = Math.round((onlineNodes / totalNodes) * 40);
    score += nodeScore;
    factors.push({ name: 'node_availability', score: nodeScore, max: 40, detail: `${onlineNodes}/${totalNodes} nodes online` });

    // Factor 2: Average uptime % (20 points)
    const uptimeValues = Object.values(uptime).map((u) => calculateUptimePercent(u)).filter((v) => v > 0);
    const avgUptime = uptimeValues.length > 0 ? uptimeValues.reduce((a, b) => a + b, 0) / uptimeValues.length : 0;
    const uptimeScore = Math.round((avgUptime / 100) * 20);
    score += uptimeScore;
    factors.push({ name: 'uptime', score: uptimeScore, max: 20, detail: `${avgUptime.toFixed(1)}% average` });

    // Factor 3: Thermal health (15 points) — penalize temps > 70C
    const temps = Object.values(nodeData).map((n) => n.cpu_temp).filter((t) => typeof t === 'number');
    const avgTemp = temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : 50;
    const thermalScore = avgTemp < 55 ? 15 : avgTemp < 65 ? 12 : avgTemp < 75 ? 8 : avgTemp < 85 ? 4 : 0;
    score += thermalScore;
    factors.push({ name: 'thermal', score: thermalScore, max: 15, detail: `${avgTemp.toFixed(1)}°C average` });

    // Factor 4: Disk health (15 points) — penalize disks > 80%
    const disks = Object.values(nodeData).map((n) => n.disk_pct).filter((d) => typeof d === 'number');
    const avgDisk = disks.length > 0 ? disks.reduce((a, b) => a + b, 0) / disks.length : 50;
    const diskScore = avgDisk < 50 ? 15 : avgDisk < 70 ? 12 : avgDisk < 85 ? 8 : avgDisk < 95 ? 4 : 0;
    score += diskScore;
    factors.push({ name: 'disk', score: diskScore, max: 15, detail: `${avgDisk.toFixed(1)}% average usage` });

    // Factor 5: Service health (10 points)
    const services = Object.values(nodeData).map((n) => n.services_up).filter((s) => typeof s === 'number');
    const totalServices = services.reduce((a, b) => a + b, 0);
    const serviceScore = totalServices > 10 ? 10 : totalServices > 5 ? 7 : totalServices > 2 ? 4 : totalServices > 0 ? 2 : 0;
    score += serviceScore;
    factors.push({ name: 'services', score: serviceScore, max: 10, detail: `${totalServices} services healthy` });

    const rating = score >= 85 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'fair' : score >= 30 ? 'degraded' : 'critical';

    return {
      score,
      rating,
      factors,
      fleet_summary: {
        nodes_online: onlineNodes,
        nodes_total: totalNodes,
        avg_cpu_temp: temps.length > 0 ? Math.round(avgTemp * 10) / 10 : null,
        avg_disk_pct: disks.length > 0 ? Math.round(avgDisk * 10) / 10 : null,
        avg_uptime_pct: uptimeValues.length > 0 ? Math.round(avgUptime * 10) / 10 : null,
        total_models: fleet.models || null,
        total_databases: fleet.databases || null,
      },
      updated: new Date().toISOString(),
    };
  }, 60_000);
}

// ─── Commit velocity ────────────────────────────────────────

async function getVelocity(env) {
  return getCached(env, 'velocity_cache', async () => {
    const velocity = (await kvGet(env, 'github_velocity')) || {};
    const gh = (await kvGet(env, 'github_stats')) || {};
    return {
      commits_24h: velocity.commits_24h ?? null,
      commits_7d: velocity.commits_7d ?? null,
      commits_30d: velocity.commits_30d ?? null,
      active_repos_7d: velocity.active_repos_7d ?? null,
      top_repos: velocity.top_repos || [],
      repos_total: gh.repos_total || null,
      orgs: gh.orgs || null,
      updated: velocity.updated || null,
    };
  });
}

// ─── Cron: refresh all external APIs ─────────────────────────

async function refreshAllStats(env) {
  await Promise.allSettled([
    refreshGitHubStats(env),
    refreshGitHubVelocity(env),
    refreshCloudflareStats(env),
    refreshGiteaStats(env),
    refreshBlackBoardStats(env),
    refreshBlackBoardSites(env),
    refreshBlackBoardPerformance(env),
    refreshBlackBoardLive(env),
    refreshBlackBoardTimeline(env),
    refreshUptimeCheck(env),
  ]);

  // Invalidate computed caches so next GET rebuilds them
  await Promise.allSettled([
    env.STATS_KV.delete('all_stats'),
    env.STATS_KV.delete('live_stats_cache'),
    env.STATS_KV.delete('traffic_stats_cache'),
    env.STATS_KV.delete('perf_stats_cache'),
    env.STATS_KV.delete('geo_stats_cache'),
    env.STATS_KV.delete('tech_stats_cache'),
    env.STATS_KV.delete('timeline_stats_cache'),
    env.STATS_KV.delete('node_stats_cache'),
    env.STATS_KV.delete('fleet_health_cache'),
    env.STATS_KV.delete('velocity_cache'),
  ]);
}

// ─── GitHub ──────────────────────────────────────────────────

async function refreshGitHubStats(env) {
  try {
    const user = env.GITHUB_USER || 'blackboxprogramming';
    const headers = { 'User-Agent': 'BlackRoad-Stats/2.0' };

    const userData = await safeJson('https://api.github.com/users/' + user, { headers });
    if (!userData) return;

    let totalOrgRepos = 0;
    const orgBreakdown = {};

    const orgFetches = GITHUB_ORGS.map(async (org) => {
      const data = await safeJson('https://api.github.com/orgs/' + org, {
        headers,
        timeout: 5000,
      });
      if (data) {
        const count = data.public_repos || 0;
        orgBreakdown[org] = count;
        totalOrgRepos += count;
      }
    });

    await Promise.allSettled(orgFetches);

    await kvPut(env, 'github_stats', {
      public_repos: userData.public_repos,
      repos_total: userData.public_repos + totalOrgRepos,
      orgs: GITHUB_ORGS.length,
      org_breakdown: orgBreakdown,
      followers: userData.followers || 0,
      updated: new Date().toISOString(),
    }, CRON_TTL_GITHUB);
  } catch { /* swallow */ }
}

// ─── GitHub Velocity (commit activity) ──────────────────────

async function refreshGitHubVelocity(env) {
  try {
    const user = env.GITHUB_USER || 'blackboxprogramming';
    const headers = { 'User-Agent': 'BlackRoad-Stats/2.0' };

    // GitHub Events API — returns last 90 days of public events
    const events = await safeJson(`https://api.github.com/users/${user}/events/public?per_page=100`, { headers });
    if (!events || !Array.isArray(events)) return;

    const now = Date.now();
    const DAY = 86400_000;
    let commits24h = 0, commits7d = 0, commits30d = 0;
    const repoActivity = {};

    for (const evt of events) {
      if (evt.type !== 'PushEvent') continue;
      const age = now - new Date(evt.created_at).getTime();
      const count = evt.payload?.commits?.length || 0;
      const repo = evt.repo?.name || 'unknown';

      if (age < DAY) commits24h += count;
      if (age < 7 * DAY) {
        commits7d += count;
        repoActivity[repo] = (repoActivity[repo] || 0) + count;
      }
      if (age < 30 * DAY) commits30d += count;
    }

    // Also check org events for the most active orgs
    const topOrgs = ['BlackRoad-OS', 'BlackRoad-AI', 'BlackRoad-OS-Inc'];
    for (const org of topOrgs) {
      const orgEvents = await safeJson(`https://api.github.com/orgs/${org}/events?per_page=30`, {
        headers, timeout: 5000,
      });
      if (!orgEvents || !Array.isArray(orgEvents)) continue;
      for (const evt of orgEvents) {
        if (evt.type !== 'PushEvent') continue;
        const age = now - new Date(evt.created_at).getTime();
        const count = evt.payload?.commits?.length || 0;
        const repo = evt.repo?.name || 'unknown';
        if (age < DAY) commits24h += count;
        if (age < 7 * DAY) {
          commits7d += count;
          repoActivity[repo] = (repoActivity[repo] || 0) + count;
        }
        if (age < 30 * DAY) commits30d += count;
      }
    }

    const topRepos = Object.entries(repoActivity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([repo, commits]) => ({ repo, commits }));

    await kvPut(env, 'github_velocity', {
      commits_24h: commits24h,
      commits_7d: commits7d,
      commits_30d: commits30d,
      active_repos_7d: Object.keys(repoActivity).length,
      top_repos: topRepos,
      updated: new Date().toISOString(),
    }, CRON_TTL_GITHUB);
  } catch { /* swallow */ }
}

// ─── Cloudflare ──────────────────────────────────────────────

async function refreshCloudflareStats(env) {
  try {
    const token = env.CF_API_TOKEN;
    if (!token) return;

    const acct = env.CF_ACCOUNT_ID || '848cf0b18d51e0170e0d1537aec3505a';
    const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };
    const dnsHeaders = { 'Authorization': 'Bearer ' + (env.CF_DNS_TOKEN || token) };

    const [workersRes, pagesRes, zonesRes, tunnelsRes] = await Promise.allSettled([
      safeFetch(`https://api.cloudflare.com/client/v4/accounts/${acct}/workers/scripts`, { headers }),
      safeFetch(`https://api.cloudflare.com/client/v4/accounts/${acct}/pages/projects`, { headers }),
      safeFetch(`https://api.cloudflare.com/client/v4/zones?per_page=50&status=active`, { headers: dnsHeaders }),
      safeFetch(`https://api.cloudflare.com/client/v4/accounts/${acct}/cfd_tunnel?is_deleted=false&per_page=100`, { headers }),
    ]);

    const cfStats = { updated: new Date().toISOString() };

    async function extract(settled, key) {
      if (settled.status === 'fulfilled' && settled.value && settled.value.ok) {
        try {
          const d = await settled.value.json();
          cfStats[key] = (d.result || []).length;
        } catch { /* swallow */ }
      }
    }

    await Promise.all([
      extract(workersRes, 'workers'),
      extract(pagesRes, 'pages'),
      extract(zonesRes, 'domains'),
      extract(tunnelsRes, 'tunnels'),
    ]);

    await kvPut(env, 'cloudflare_stats', cfStats, CRON_TTL_CF);
  } catch { /* swallow */ }
}

// ─── Gitea ───────────────────────────────────────────────────

async function refreshGiteaStats(env) {
  try {
    const giteaUrl = env.GITEA_URL || 'https://git.blackroad.io';
    const res = await safeFetch(giteaUrl + '/api/v1/repos/search?limit=1', {
      headers: { 'User-Agent': 'BlackRoad-Stats/2.0' },
    });

    if (res && res.ok) {
      // Gitea returns total count in X-Total-Count header
      const totalHeader = res.headers.get('X-Total-Count');
      const total = totalHeader ? parseInt(totalHeader, 10) : 0;
      if (total > 0) {
        await kvPut(env, 'gitea_stats', {
          repos: total,
          updated: new Date().toISOString(),
        }, CRON_TTL_GITEA);
        return;
      }
      // Fallback: parse body for data array length
      try {
        const body = await res.json();
        const arr = Array.isArray(body) ? body : (body.data || []);
        // If limit=1 returned 1 item, try a larger fetch
        if (arr.length > 0) {
          const res2 = await safeFetch(giteaUrl + '/api/v1/repos/search?limit=50&page=1', {
            headers: { 'User-Agent': 'BlackRoad-Stats/2.0' },
          });
          if (res2 && res2.ok) {
            const tc = res2.headers.get('X-Total-Count');
            if (tc) {
              await kvPut(env, 'gitea_stats', {
                repos: parseInt(tc, 10),
                updated: new Date().toISOString(),
              }, CRON_TTL_GITEA);
              return;
            }
          }
        }
      } catch {}
    }

    // Log failure for debugging (visible in wrangler tail)
    console.log('Gitea fetch failed:', res ? `status=${res.status}` : 'null response');
  } catch (e) {
    console.log('Gitea error:', e.message);
  }
}

// ─── BlackBoard: Main stats ─────────────────────────────────

async function refreshBlackBoardStats(env) {
  try {
    const data = await safeJson(BB_BASE + '/api/stats');
    if (!data) return;

    // Normalize whatever shape bb returns into our canonical fields
    const bb = {
      total_pageviews: data.total_pageviews ?? data.pageviews ?? data.views ?? 0,
      total_visitors: data.total_visitors ?? data.visitors ?? data.unique_visitors ?? 0,
      total_sessions: data.total_sessions ?? data.sessions ?? 0,
      avg_lcp: data.avg_lcp ?? data.lcp ?? null,
      avg_fcp: data.avg_fcp ?? data.fcp ?? null,
      bounce_rate: data.bounce_rate ?? null,
      active_visitors: data.active_visitors ?? data.active ?? 0,
      pageviews_today: data.pageviews_today ?? data.today?.pageviews ?? 0,
      errors_24h: data.errors_24h ?? data.errors ?? 0,
      bots_24h: data.bots_24h ?? data.bots ?? 0,
      top_country: data.top_country ?? (data.countries && data.countries[0]?.country) ?? null,
      top_browser: data.top_browser ?? (data.browsers && data.browsers[0]?.browser) ?? null,
      top_device: data.top_device ?? (data.devices && data.devices[0]?.device) ?? null,
      countries: data.countries || [],
      cities: data.cities || [],
      browsers: data.browsers || [],
      os: data.os || data.operating_systems || [],
      devices: data.devices || [],
      updated: new Date().toISOString(),
    };

    await kvPut(env, 'bb_stats', bb, CRON_TTL_BB);
  } catch { /* swallow */ }
}

// ─── BlackBoard: Sites ──────────────────────────────────────

async function refreshBlackBoardSites(env) {
  try {
    const data = await safeJson(BB_BASE + '/api/sites');
    if (!data) return;

    const sites = (data.sites || data.results || (Array.isArray(data) ? data : [])).map((s) => ({
      domain: s.domain || s.site || s.hostname,
      pageviews: s.pageviews ?? s.views ?? 0,
      visitors: s.visitors ?? s.unique_visitors ?? 0,
      sessions: s.sessions ?? 0,
      bounce_rate: s.bounce_rate ?? null,
    }));

    await kvPut(env, 'bb_sites', {
      sites,
      total_sites: sites.length,
      updated: new Date().toISOString(),
    }, CRON_TTL_BB);
  } catch { /* swallow */ }
}

// ─── BlackBoard: Performance ────────────────────────────────

async function refreshBlackBoardPerformance(env) {
  try {
    const data = await safeJson(BB_BASE + '/api/performance');
    if (!data) return;

    function rateMetric(name, value) {
      if (value === null || value === undefined) return null;
      const thresholds = {
        lcp: [2500, 4000],
        fcp: [1800, 3000],
        fid: [100, 300],
        cls: [0.1, 0.25],
        ttfb: [800, 1800],
        inp: [200, 500],
      };
      const t = thresholds[name];
      if (!t) return 'unknown';
      return value <= t[0] ? 'good' : value <= t[1] ? 'needs-improvement' : 'poor';
    }

    const lcp = data.lcp ?? data.avg_lcp ?? null;
    const fcp = data.fcp ?? data.avg_fcp ?? null;
    const fid = data.fid ?? data.avg_fid ?? null;
    const cls = data.cls ?? data.avg_cls ?? null;
    const ttfb = data.ttfb ?? data.avg_ttfb ?? null;
    const inp = data.inp ?? data.avg_inp ?? null;

    const ratings = [rateMetric('lcp', lcp), rateMetric('fcp', fcp), rateMetric('fid', fid), rateMetric('cls', cls), rateMetric('ttfb', ttfb), rateMetric('inp', inp)].filter(Boolean);
    const overallGood = ratings.filter((r) => r === 'good').length;
    const overall = ratings.length > 0
      ? overallGood / ratings.length >= 0.75 ? 'good' : overallGood / ratings.length >= 0.5 ? 'needs-improvement' : 'poor'
      : null;

    await kvPut(env, 'bb_performance', {
      lcp, fcp, fid, cls, ttfb, inp,
      lcp_rating: rateMetric('lcp', lcp),
      fcp_rating: rateMetric('fcp', fcp),
      fid_rating: rateMetric('fid', fid),
      cls_rating: rateMetric('cls', cls),
      ttfb_rating: rateMetric('ttfb', ttfb),
      inp_rating: rateMetric('inp', inp),
      rating: overall,
      samples: data.samples ?? data.total_samples ?? 0,
      updated: new Date().toISOString(),
    }, CRON_TTL_BB);
  } catch { /* swallow */ }
}

// ─── BlackBoard: Live ───────────────────────────────────────

async function refreshBlackBoardLive(env) {
  try {
    // Try a live/realtime endpoint; fall back to main stats
    const data = await safeJson(BB_BASE + '/api/stats?period=realtime');
    if (!data) return;

    await kvPut(env, 'bb_live', {
      active_visitors: data.active_visitors ?? data.active ?? data.current_visitors ?? 0,
      pageviews_today: data.pageviews_today ?? data.today_pageviews ?? 0,
      pageviews_hour: data.pageviews_hour ?? data.hourly_pageviews ?? 0,
      top_pages: (data.top_pages || data.pages || []).slice(0, 10).map((p) => ({
        path: p.path || p.page || p.url,
        views: p.views || p.pageviews || p.count || 0,
      })),
      updated: new Date().toISOString(),
    }, 60); // 1 min TTL for live data
  } catch { /* swallow */ }
}

// ─── BlackBoard: Timeline ───────────────────────────────────

async function refreshBlackBoardTimeline(env) {
  try {
    const data = await safeJson(BB_BASE + '/api/stats?period=30d');
    if (!data) return;

    const timeline = (data.timeline || data.daily || data.days || []).map((d) => ({
      date: d.date || d.day,
      pageviews: d.pageviews ?? d.views ?? 0,
      visitors: d.visitors ?? d.unique_visitors ?? 0,
      sessions: d.sessions ?? 0,
    }));

    await kvPut(env, 'bb_timeline', {
      timeline,
      period: 'last_30_days',
      updated: new Date().toISOString(),
    }, CRON_TTL_BB);
  } catch { /* swallow */ }
}

// ─── Uptime check ───────────────────────────────────────────

async function refreshUptimeCheck(env) {
  try {
    const records = (await kvGet(env, 'uptime_records')) || {};
    const now = Date.now();

    // For nodes that haven't checked in for 10+ minutes, increment check count but not ups
    for (const [node, data] of Object.entries(records)) {
      if (data.last_seen) {
        const age = now - new Date(data.last_seen).getTime();
        if (age > 600_000) {
          // Node hasn't reported — count as a missed check
          data.checks = (data.checks || 0) + 1;
        }
      }
    }

    await kvPut(env, 'uptime_records', records);
  } catch { /* swallow */ }
}
