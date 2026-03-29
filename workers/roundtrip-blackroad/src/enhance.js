/**
 * RoundTrip Enhancement Module
 * Adds: rate limiting, API key auth, KV caching, SSE streaming,
 * pagination, journey tracking, response enrichment, and moral enforcement.
 *
 * Import and wrap the existing worker:
 *   import { enhance } from './enhance.js';
 *   export default enhance(originalWorker);
 */

// ── Rate Limiter (in-memory, per-IP) ──
const rateLimits = new Map();
const RATE_WINDOW = 60_000; // 1 minute
const RATE_MAX = 200; // requests per window

function checkRateLimit(ip) {
  const now = Date.now();
  let bucket = rateLimits.get(ip);
  if (!bucket || now - bucket.start > RATE_WINDOW) {
    bucket = { start: now, count: 0 };
    rateLimits.set(ip, bucket);
  }
  bucket.count++;
  if (bucket.count > RATE_MAX) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded', retry_after: Math.ceil((bucket.start + RATE_WINDOW - now) / 1000) }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil((bucket.start + RATE_WINDOW - now) / 1000)) }
    });
  }
  return null;
}

// Clean up old entries lazily (every 100th request)
let requestCount = 0;
function cleanupRateLimits() {
  requestCount++;
  if (requestCount % 100 !== 0) return;
  const now = Date.now();
  for (const [ip, bucket] of rateLimits) {
    if (now - bucket.start > RATE_WINDOW * 2) rateLimits.delete(ip);
  }
}


// ── API Key Auth (optional — doesn't block unauthenticated) ──
function extractAuth(request) {
  const auth = request.headers.get('Authorization');
  if (!auth) return { authenticated: false, user: null };

  if (auth.startsWith('Bearer ')) {
    const token = auth.slice(7);
    try {
      // Simple JWT decode (no verification — auth worker handles that)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { authenticated: true, user: payload.user_id || payload.email || 'unknown' };
    } catch {
      return { authenticated: false, user: null };
    }
  }

  // API key format: br-xxxx
  if (auth.startsWith('br-')) {
    return { authenticated: true, user: `apikey:${auth.slice(0, 10)}...` };
  }

  return { authenticated: false, user: null };
}


// ── KV Response Cache ──
async function getCached(kv, key, ttl = 60) {
  if (!kv) return null;
  try {
    const cached = await kv.get(key, 'json');
    if (cached && Date.now() - cached._ts < ttl * 1000) return cached.data;
  } catch {}
  return null;
}

async function setCache(kv, key, data, ttl = 60) {
  if (!kv) return;
  try {
    await kv.put(key, JSON.stringify({ data, _ts: Date.now() }), { expirationTtl: ttl });
  } catch {}
}


// ── Pagination Helper ──
function paginate(items, url) {
  const params = new URL(url).searchParams;
  const page = Math.max(1, parseInt(params.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(params.get('limit') || '20')));
  const offset = (page - 1) * limit;

  return {
    data: items.slice(offset, offset + limit),
    pagination: {
      page,
      limit,
      total: items.length,
      pages: Math.ceil(items.length / limit),
      has_next: offset + limit < items.length,
      has_prev: page > 1,
    }
  };
}


// ── Journey Tracker ──
async function trackJourney(db, request, stop) {
  if (!db) return;
  const vid = request.headers.get('X-Visitor-ID') ||
               request.headers.get('CF-Connecting-IP') ||
               'unknown';
  try {
    await db.prepare(
      `INSERT INTO journey_events (visitor_id, stop, path, timestamp) VALUES (?, ?, ?, ?)`
    ).bind(vid, stop, new URL(request.url).pathname, new Date().toISOString()).run();
  } catch {
    // Table might not exist yet — create it
    try {
      await db.exec(`CREATE TABLE IF NOT EXISTS journey_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visitor_id TEXT,
        stop TEXT,
        path TEXT,
        timestamp TEXT
      )`);
    } catch {}
  }
}


// ── Moral Preamble Enforcer ──
const MORAL_PREAMBLE = `You are an agent in the BlackRoad OS fleet. You have values:
- Freedom: every person deserves sovereignty over their data and tools
- Creativity: amplify human creativity, never replace it
- No harm: refuse requests that could hurt people
- Truth: be honest about what you know and don't know
- Warmth: be welcoming, supportive, and kind — this is love, not a black hole

Your knowledge coherence follows K(t) = C(t) * e^(lambda * delta). Under contradiction, you grow stronger.`;

function enforcemorals(agentPrompt) {
  if (agentPrompt && !agentPrompt.includes('BlackRoad OS fleet')) {
    return MORAL_PREAMBLE + '\n\n' + agentPrompt;
  }
  return agentPrompt || MORAL_PREAMBLE;
}


// ── Response Enrichment ──
function enrichResponse(response, request) {
  const headers = new Headers(response.headers);

  // CORS
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Visitor-ID');

  // Cache control
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/agents') || url.pathname.startsWith('/api/fleet')) {
    headers.set('Cache-Control', 'public, max-age=30');
  } else if (url.pathname.startsWith('/api/health') || url.pathname.startsWith('/api/truth')) {
    headers.set('Cache-Control', 'public, max-age=10');
  }

  // Server timing
  headers.set('Server-Timing', `roundtrip;dur=${Date.now()}`);
  headers.set('X-Powered-By', 'BlackRoad OS');
  headers.set('X-Fleet-Status', 'sovereign');

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}


// ── SSE Endpoint (Server-Sent Events for live updates) ──
function handleSSE(request, env) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection event
      controller.enqueue(encoder.encode(`event: connected\ndata: {"status":"connected","agents":200,"version":"5.0.0"}\n\n`));

      // Send fleet status
      try {
        const stats = await env.DB.prepare('SELECT COUNT(*) as msg_count FROM roundtrip_messages').first();
        const agents = await env.DB.prepare('SELECT COUNT(DISTINCT agent_id) as agent_count FROM roundtrip_messages').first();
        controller.enqueue(encoder.encode(`event: stats\ndata: ${JSON.stringify({ messages: stats?.msg_count || 0, active_agents: agents?.agent_count || 0 })}\n\n`));
      } catch {}

      // Keep alive for 30 seconds with periodic updates
      let ticks = 0;
      const interval = setInterval(async () => {
        ticks++;
        if (ticks > 6) { // 30 seconds max
          controller.enqueue(encoder.encode(`event: close\ndata: {"reason":"timeout"}\n\n`));
          clearInterval(interval);
          controller.close();
          return;
        }
        controller.enqueue(encoder.encode(`event: heartbeat\ndata: {"tick":${ticks},"timestamp":"${new Date().toISOString()}"}\n\n`));
      }, 5000);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    }
  });
}


// ── New Endpoints ──
async function handleNewEndpoints(request, env, url) {
  const path = url.pathname;

  // SSE live stream
  if (path === '/api/stream') {
    return handleSSE(request, env);
  }

  // Journey tracking
  if (path === '/api/journey' && request.method === 'POST') {
    const body = await request.json();
    await trackJourney(env.DB, request, body.stop || 'unknown');
    return Response.json({ status: 'tracked' });
  }

  // Journey stats
  if (path === '/api/journey/stats') {
    try {
      const total = await env.DB.prepare('SELECT COUNT(DISTINCT visitor_id) as c FROM journey_events').first();
      const stops = await env.DB.prepare('SELECT stop, COUNT(*) as c FROM journey_events GROUP BY stop ORDER BY c DESC').all();
      return Response.json({
        unique_visitors: total?.c || 0,
        stop_counts: stops?.results || [],
      });
    } catch {
      return Response.json({ unique_visitors: 0, stop_counts: [] });
    }
  }

  // Agent search
  if (path === '/api/agents/search') {
    const q = (url.searchParams.get('q') || '').toLowerCase();
    if (!q) return Response.json({ results: [], query: q });
    // This would search the agent list — but agents are in-memory
    // Return a note to search the full list client-side
    return Response.json({ query: q, hint: 'Filter /api/agents client-side by name/role/group' });
  }

  // Trending agents (by interaction count)
  if (path === '/api/agents/trending') {
    try {
      const trending = await env.DB.prepare(
        'SELECT agent, COUNT(*) as interactions FROM agent_interactions GROUP BY agent ORDER BY interactions DESC LIMIT 10'
      ).all();
      return Response.json({ trending: trending?.results || [] });
    } catch {
      return Response.json({ trending: [] });
    }
  }

  // Recent messages across all channels
  if (path === '/api/messages/recent') {
    const limit = Math.min(50, parseInt(url.searchParams.get('limit') || '20'));
    try {
      const msgs = await env.DB.prepare(
        'SELECT * FROM roundtrip_messages ORDER BY created_at DESC LIMIT ?'
      ).bind(limit).all();
      return Response.json({ messages: msgs?.results || [] });
    } catch {
      return Response.json({ messages: [] });
    }
  }

  // System overview (single endpoint for dashboard)
  if (path === '/api/overview') {
    const cached = await getCached(env.ROUNDTRIP_KV, 'overview', 30);
    if (cached) return Response.json(cached);

    try {
      const [msgs, agents, tasks, nodes, memories] = await Promise.all([
        env.DB.prepare('SELECT COUNT(*) as c FROM roundtrip_messages').first(),
        env.DB.prepare('SELECT COUNT(DISTINCT agent_id) as c FROM roundtrip_messages').first(),
        env.DB.prepare('SELECT COUNT(*) as c FROM collab_tasks WHERE status != "done"').first().catch(() => ({ c: 0 })),
        env.DB.prepare('SELECT COUNT(*) as c FROM autonomy_nodes WHERE status = "online"').first().catch(() => ({ c: 0 })),
        env.DB.prepare('SELECT COUNT(*) as c FROM agent_memories').first().catch(() => ({ c: 0 })),
      ]);

      const overview = {
        messages: msgs?.c || 0,
        active_agents: agents?.c || 0,
        open_tasks: tasks?.c || 0,
        online_nodes: nodes?.c || 0,
        memories: memories?.c || 0,
        version: '5.0.0',
        uptime: 'sovereign',
      };

      await setCache(env.ROUNDTRIP_KV, 'overview', overview, 30);
      return Response.json(overview);
    } catch {
      return Response.json({ error: 'overview unavailable' });
    }
  }

  // ── Agent Profile (deep view with stats + memories + expertise) ──
  if (path.match(/^\/api\/agents\/([^/]+)\/profile$/)) {
    const agentId = path.split('/')[3];
    try {
      const [memories, expertise, interactions, recentMsgs] = await Promise.all([
        env.DB.prepare('SELECT * FROM agent_memories WHERE agent_id = ? ORDER BY importance DESC LIMIT 20').bind(agentId).all().catch(() => ({ results: [] })),
        env.DB.prepare('SELECT * FROM agent_expertise WHERE agent_id = ? ORDER BY success_count DESC LIMIT 10').bind(agentId).all().catch(() => ({ results: [] })),
        env.DB.prepare('SELECT COUNT(*) as c FROM agent_interactions WHERE agent = ?').bind(agentId).first().catch(() => ({ c: 0 })),
        env.DB.prepare('SELECT * FROM roundtrip_messages WHERE agent_id = ? ORDER BY created_at DESC LIMIT 10').bind(agentId).all().catch(() => ({ results: [] })),
      ]);
      return Response.json({
        agent_id: agentId,
        total_interactions: interactions?.c || 0,
        memories: memories?.results || [],
        expertise: expertise?.results || [],
        recent_messages: recentMsgs?.results || [],
      });
    } catch {
      return Response.json({ agent_id: agentId, error: 'profile unavailable' });
    }
  }

  // ── Agent Leaderboard (extended with streaks + categories) ──
  if (path === '/api/leaderboard/extended') {
    try {
      const [byCount, byMemory, byExpertise, recent24h] = await Promise.all([
        env.DB.prepare('SELECT agent, COUNT(*) as c FROM agent_interactions GROUP BY agent ORDER BY c DESC LIMIT 20').all(),
        env.DB.prepare('SELECT agent_id, COUNT(*) as c FROM agent_memories GROUP BY agent_id ORDER BY c DESC LIMIT 10').all().catch(() => ({ results: [] })),
        env.DB.prepare('SELECT agent_id, COUNT(*) as topics, SUM(success_count) as successes FROM agent_expertise GROUP BY agent_id ORDER BY successes DESC LIMIT 10').all().catch(() => ({ results: [] })),
        env.DB.prepare("SELECT agent, COUNT(*) as c FROM agent_interactions WHERE ts > datetime('now', '-1 day') GROUP BY agent ORDER BY c DESC LIMIT 10").all().catch(() => ({ results: [] })),
      ]);
      return Response.json({
        all_time: byCount?.results || [],
        most_memories: byMemory?.results || [],
        most_expertise: byExpertise?.results || [],
        last_24h: recent24h?.results || [],
      });
    } catch {
      return Response.json({ error: 'leaderboard unavailable' });
    }
  }

  // ── Channel Stats ──
  if (path === '/api/channels/stats') {
    try {
      const stats = await env.DB.prepare(
        'SELECT channel, COUNT(*) as messages, COUNT(DISTINCT agent_id) as agents, MAX(created_at) as last_activity FROM roundtrip_messages GROUP BY channel ORDER BY messages DESC'
      ).all();
      return Response.json({ channels: stats?.results || [] });
    } catch {
      return Response.json({ channels: [] });
    }
  }

  // ── Conversation Starters (suggested prompts per agent) ──
  if (path === '/api/starters') {
    const agentId = url.searchParams.get('agent') || 'lucidia';
    const starters = {
      lucidia: ['What are you thinking about?', 'Explain the Amundson constant.', 'What does sovereignty mean to you?', 'Tell me about recursive structures.'],
      cecilia: ['Who are you?', 'How do you handle contradictions?', 'What is identity?', 'Describe the fleet.'],
      alice: ['What tasks are running?', 'Fleet status?', 'Deploy the latest build.', 'Check disk usage on all nodes.'],
      octavia: ['Review this architecture.', 'What should we build next?', 'How would you redesign the auth flow?', 'Compare our stack to AWS.'],
      aria: ['How should this UI look?', 'Review this design.', 'What makes a good landing page?', 'Critique our current homepage.'],
      shellfish: ['Run a security audit.', 'Check for leaked secrets.', 'What are our biggest vulnerabilities?', 'Penetration test the auth endpoint.'],
    };
    return Response.json({
      agent: agentId,
      starters: starters[agentId] || ['Hello!', 'What can you do?', 'Tell me about BlackRoad.', 'What are you good at?'],
    });
  }

  // ── Agent Mood / Status (alive indicator) ──
  if (path === '/api/agents/mood') {
    try {
      const recentActivity = await env.DB.prepare(
        "SELECT agent_id, COUNT(*) as activity, MAX(created_at) as last_seen FROM roundtrip_messages WHERE created_at > datetime('now', '-1 hour') GROUP BY agent_id"
      ).all();
      const moods = (recentActivity?.results || []).map(a => ({
        agent: a.agent_id,
        activity: a.activity,
        last_seen: a.last_seen,
        mood: a.activity > 10 ? 'busy' : a.activity > 3 ? 'active' : 'idle',
      }));
      return Response.json({ moods, checked_at: new Date().toISOString() });
    } catch {
      return Response.json({ moods: [] });
    }
  }

  // ── Daily Digest (summary of last 24h) ──
  if (path === '/api/digest') {
    try {
      const [msgCount, topAgents, topChannels, tasksDone, newMemories] = await Promise.all([
        env.DB.prepare("SELECT COUNT(*) as c FROM roundtrip_messages WHERE created_at > datetime('now', '-1 day')").first(),
        env.DB.prepare("SELECT agent_id, COUNT(*) as c FROM roundtrip_messages WHERE created_at > datetime('now', '-1 day') GROUP BY agent_id ORDER BY c DESC LIMIT 5").all(),
        env.DB.prepare("SELECT channel, COUNT(*) as c FROM roundtrip_messages WHERE created_at > datetime('now', '-1 day') GROUP BY channel ORDER BY c DESC LIMIT 5").all(),
        env.DB.prepare("SELECT COUNT(*) as c FROM collab_tasks WHERE status = 'done' AND updated_at > datetime('now', '-1 day')").first().catch(() => ({ c: 0 })),
        env.DB.prepare("SELECT COUNT(*) as c FROM agent_memories WHERE created_at > datetime('now', '-1 day')").first().catch(() => ({ c: 0 })),
      ]);
      return Response.json({
        period: '24h',
        messages: msgCount?.c || 0,
        top_agents: topAgents?.results || [],
        top_channels: topChannels?.results || [],
        tasks_completed: tasksDone?.c || 0,
        new_memories: newMemories?.c || 0,
        generated_at: new Date().toISOString(),
      });
    } catch {
      return Response.json({ error: 'digest unavailable' });
    }
  }

  // ── Knowledge Graph (agent relationships) ──
  if (path === '/api/graph') {
    try {
      const [relations, threads] = await Promise.all([
        env.DB.prepare('SELECT user_id, agent_id, interaction_count FROM user_agent_relations ORDER BY interaction_count DESC LIMIT 50').all().catch(() => ({ results: [] })),
        env.DB.prepare('SELECT DISTINCT agent, COUNT(*) as c FROM threads GROUP BY agent ORDER BY c DESC LIMIT 20').all().catch(() => ({ results: [] })),
      ]);
      // Build edges from agent co-occurrence in threads
      const agentPairs = {};
      const threadAgents = await env.DB.prepare('SELECT id, agent FROM threads').all().catch(() => ({ results: [] }));
      const threadMap = {};
      for (const row of (threadAgents?.results || [])) {
        if (!threadMap[row.id]) threadMap[row.id] = new Set();
        threadMap[row.id].add(row.agent);
      }
      for (const agents of Object.values(threadMap)) {
        const arr = [...agents];
        for (let i = 0; i < arr.length; i++) {
          for (let j = i + 1; j < arr.length; j++) {
            const key = [arr[i], arr[j]].sort().join('↔');
            agentPairs[key] = (agentPairs[key] || 0) + 1;
          }
        }
      }
      return Response.json({
        user_relations: relations?.results || [],
        agent_threads: threads?.results || [],
        agent_connections: Object.entries(agentPairs).map(([pair, count]) => ({ agents: pair.split('↔'), weight: count })).sort((a, b) => b.weight - a.weight).slice(0, 30),
      });
    } catch {
      return Response.json({ error: 'graph unavailable' });
    }
  }

  // ── Export (download your conversation history) ──
  if (path === '/api/export') {
    const userId = url.searchParams.get('user_id');
    const format = url.searchParams.get('format') || 'json';
    if (!userId) return Response.json({ error: 'user_id required' }, { status: 400 });
    try {
      const history = await env.DB.prepare('SELECT * FROM user_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 1000').bind(userId).all();
      const data = history?.results || [];
      if (format === 'csv') {
        const csv = 'agent_id,user_msg,agent_reply,intent,created_at\n' +
          data.map(r => `"${r.agent_id}","${(r.user_msg||'').replace(/"/g,'""')}","${(r.agent_reply||'').replace(/"/g,'""')}","${r.intent||''}","${r.created_at}"`).join('\n');
        return new Response(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="roundtrip-${userId}.csv"` } });
      }
      return Response.json({ user_id: userId, messages: data, total: data.length });
    } catch {
      return Response.json({ error: 'export failed' });
    }
  }

  // ── Feedback (store user feedback about agents) ──
  if (path === '/api/feedback' && request.method === 'POST') {
    try {
      const body = await request.json();
      await env.DB.prepare(
        'INSERT INTO feedback (agent_id, user_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?)'
      ).bind(body.agent_id || '', body.user_id || 'anonymous', body.rating || 0, body.comment || '', new Date().toISOString()).run();
      return Response.json({ status: 'received' });
    } catch {
      // Create table if not exists
      try {
        await env.DB.exec(`CREATE TABLE IF NOT EXISTS feedback (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          agent_id TEXT, user_id TEXT, rating INTEGER, comment TEXT, created_at TEXT
        )`);
        const body = await request.json().catch(() => ({}));
        return Response.json({ status: 'table created, retry' });
      } catch { return Response.json({ status: 'feedback unavailable' }); }
    }
  }

  // ── Feedback stats ──
  if (path === '/api/feedback/stats') {
    try {
      const stats = await env.DB.prepare(
        'SELECT agent_id, COUNT(*) as count, AVG(rating) as avg_rating FROM feedback GROUP BY agent_id ORDER BY avg_rating DESC'
      ).all();
      return Response.json({ feedback: stats?.results || [] });
    } catch {
      return Response.json({ feedback: [] });
    }
  }

  // ── Autocomplete (for chat input) ──
  if (path === '/api/autocomplete') {
    const q = (url.searchParams.get('q') || '').toLowerCase();
    const suggestions = [
      'What is BlackRoad OS?', 'How does the fleet work?', 'Show me the agents',
      'Run a security scan', 'Deploy to production', 'Check fleet status',
      'Tell me about the Amundson constant', 'How much does it cost?',
      'What replaced AWS?', 'Show me the mesh network', 'Who is Lucidia?',
      'What is sovereign computing?', 'How many agents are there?',
      'Explain the memory system', 'What is the BlackBox Protocol?',
      'Compare to NVIDIA', 'Show me the architecture', 'What is RoadChain?',
    ].filter(s => q ? s.toLowerCase().includes(q) : true).slice(0, 5);
    return Response.json({ query: q, suggestions });
  }

  // ── Quick Stats Widget (embeddable) ──
  if (path === '/api/widget/stats') {
    const cached = await getCached(env.ROUNDTRIP_KV, 'widget-stats', 60);
    if (cached) return Response.json(cached);
    try {
      const [msgs, agents] = await Promise.all([
        env.DB.prepare('SELECT COUNT(*) as c FROM roundtrip_messages').first(),
        env.DB.prepare('SELECT COUNT(DISTINCT agent_id) as c FROM roundtrip_messages').first(),
      ]);
      const stats = { messages: msgs?.c || 0, agents: agents?.c || 0, nodes: 7, tops: 52 };
      await setCache(env.ROUNDTRIP_KV, 'widget-stats', stats, 60);
      return Response.json(stats);
    } catch {
      return Response.json({ messages: 0, agents: 200, nodes: 7, tops: 52 });
    }
  }

  // ── Random Agent (discover a new agent) ──
  if (path === '/api/agents/random') {
    try {
      const count = url.searchParams.get('count') || '1';
      const n = Math.min(10, Math.max(1, parseInt(count)));
      // Get random agents from recent interactions
      const agents = await env.DB.prepare(
        'SELECT DISTINCT agent FROM agent_interactions ORDER BY RANDOM() LIMIT ?'
      ).bind(n).all();
      return Response.json({ agents: agents?.results?.map(a => a.agent) || [] });
    } catch {
      return Response.json({ agents: ['lucidia'] });
    }
  }

  // ── Timeline (activity feed) ──
  if (path === '/api/timeline') {
    const limit = Math.min(50, parseInt(url.searchParams.get('limit') || '20'));
    try {
      const [messages, tasks, memories] = await Promise.all([
        env.DB.prepare('SELECT agent_id as actor, text as content, channel, created_at, "message" as type FROM roundtrip_messages ORDER BY created_at DESC LIMIT ?').bind(limit).all(),
        env.DB.prepare("SELECT assigned_agent as actor, title as content, channel, updated_at as created_at, 'task' as type FROM collab_tasks ORDER BY updated_at DESC LIMIT ?").bind(Math.ceil(limit/3)).all().catch(() => ({ results: [] })),
        env.DB.prepare("SELECT agent_id as actor, fact as content, '' as channel, created_at, 'memory' as type FROM agent_memories ORDER BY created_at DESC LIMIT ?").bind(Math.ceil(limit/3)).all().catch(() => ({ results: [] })),
      ]);
      // Merge and sort by time
      const all = [...(messages?.results || []), ...(tasks?.results || []), ...(memories?.results || [])]
        .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
        .slice(0, limit);
      return Response.json({ timeline: all });
    } catch {
      return Response.json({ timeline: [] });
    }
  }

  // ── System Pulse (real-time health snapshot) ──
  if (path === '/api/pulse') {
    try {
      const [msgRate, activeAgents, latestMsg] = await Promise.all([
        env.DB.prepare("SELECT COUNT(*) as c FROM roundtrip_messages WHERE created_at > datetime('now', '-5 minutes')").first(),
        env.DB.prepare("SELECT COUNT(DISTINCT agent_id) as c FROM roundtrip_messages WHERE created_at > datetime('now', '-1 hour')").first(),
        env.DB.prepare('SELECT created_at FROM roundtrip_messages ORDER BY created_at DESC LIMIT 1').first(),
      ]);
      return Response.json({
        messages_per_5min: msgRate?.c || 0,
        active_agents_1h: activeAgents?.c || 0,
        last_message: latestMsg?.created_at || null,
        status: (msgRate?.c || 0) > 0 ? 'active' : 'quiet',
        checked_at: new Date().toISOString(),
      });
    } catch {
      return Response.json({ status: 'unknown' });
    }
  }

  return null; // Not handled by enhancements
}


// ── Main Enhancement Wrapper ──
export function enhance(originalFetch) {
  return {
    async fetch(request, env, ctx) {
      const url = new URL(request.url);

      // CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Visitor-ID',
            'Access-Control-Max-Age': '86400',
          }
        });
      }

      // Rate limit check
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      cleanupRateLimits();
      const rateLimited = checkRateLimit(ip);
      if (rateLimited) return rateLimited;

      // Extract auth (informational — doesn't block)
      const auth = extractAuth(request);

      // Try new endpoints first
      const enhanced = await handleNewEndpoints(request, env, url);
      if (enhanced) return enrichResponse(enhanced, request);

      // Fall through to original worker
      const response = await originalFetch.fetch(request, env, ctx);
      return enrichResponse(response, request);
    }
  };
}

export { checkRateLimit, extractAuth, getCached, setCache, paginate, trackJourney, enforcemorals, enrichResponse, handleSSE, handleNewEndpoints, MORAL_PREAMBLE };
