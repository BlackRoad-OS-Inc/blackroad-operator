// BlackRoad Analytics — Sovereign, consent-first event capture
// No cookies. No fingerprinting. No PII. Just counts.
//
// Endpoints:
//   POST /event     — capture a single event
//   POST /pageview  — capture a page view
//   POST /session   — update session heartbeat
//   GET  /stats     — aggregated stats (public)
//   GET  /dashboard — detailed analytics (requires key)
//   GET  /health    — uptime check

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    // Country from Cloudflare headers (no fingerprinting needed)
    const country = request.headers.get('cf-ipcountry') || '';

    try {
      // Standard response headers
      const requestId = crypto.randomUUID().slice(0, 8);
      // ── Capture page view ──
      if (path === '/pageview' && request.method === 'POST') {
        const body = await request.json();
        const { path: pagePath, referrer, session_id, screen_w, screen_h, lang } = body;
        if (!pagePath || !session_id) return json({ error: 'path and session_id required' }, 400);

        await env.DB.prepare(
          `INSERT INTO page_views (path, referrer, session_id, screen_w, screen_h, lang, country)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          pagePath.slice(0, 500),
          (referrer || '').slice(0, 500),
          session_id.slice(0, 64),
          screen_w || 0,
          screen_h || 0,
          (lang || '').slice(0, 10),
          country
        ).run();

        // Upsert session
        await env.DB.prepare(
          `INSERT INTO sessions (id, first_path, pages, country)
           VALUES (?, ?, 1, ?)
           ON CONFLICT(id) DO UPDATE SET pages = pages + 1, last_seen = datetime('now')`
        ).bind(session_id.slice(0, 64), pagePath.slice(0, 500), country).run();

        return json({ ok: true });
      }

      // ── Capture event ──
      if (path === '/event' && request.method === 'POST') {
        const body = await request.json();
        const { name, path: eventPath, session_id, props } = body;
        if (!name || !session_id) return json({ error: 'name and session_id required' }, 400);

        await env.DB.prepare(
          `INSERT INTO events (name, path, session_id, props, country)
           VALUES (?, ?, ?, ?, ?)`
        ).bind(
          name.slice(0, 100),
          (eventPath || '').slice(0, 500),
          session_id.slice(0, 64),
          JSON.stringify(props || {}).slice(0, 2000),
          country
        ).run();

        return json({ ok: true });
      }

      // ── Session heartbeat ──
      if (path === '/session' && request.method === 'POST') {
        const body = await request.json();
        const { session_id, duration_ms } = body;
        if (!session_id) return json({ error: 'session_id required' }, 400);

        await env.DB.prepare(
          `UPDATE sessions SET duration_ms = ?, last_seen = datetime('now') WHERE id = ?`
        ).bind(duration_ms || 0, session_id.slice(0, 64)).run();

        return json({ ok: true });
      }

      // ── Public stats ──
      if (path === '/stats' && request.method === 'GET') {
        const range = url.searchParams.get('range') || '24h';
        const since = range === '7d' ? "datetime('now', '-7 days')"
                    : range === '30d' ? "datetime('now', '-30 days')"
                    : "datetime('now', '-24 hours')";

        const [views, uniques, events, topPages, topEvents, countries] = await Promise.all([
          env.DB.prepare(`SELECT COUNT(*) as c FROM page_views WHERE created_at > ${since}`).first(),
          env.DB.prepare(`SELECT COUNT(DISTINCT session_id) as c FROM page_views WHERE created_at > ${since}`).first(),
          env.DB.prepare(`SELECT COUNT(*) as c FROM events WHERE created_at > ${since}`).first(),
          env.DB.prepare(`SELECT path, COUNT(*) as views FROM page_views WHERE created_at > ${since} GROUP BY path ORDER BY views DESC LIMIT 10`).all(),
          env.DB.prepare(`SELECT name, COUNT(*) as count FROM events WHERE created_at > ${since} GROUP BY name ORDER BY count DESC LIMIT 10`).all(),
          env.DB.prepare(`SELECT country, COUNT(*) as views FROM page_views WHERE created_at > ${since} AND country != '' GROUP BY country ORDER BY views DESC LIMIT 10`).all(),
        ]);

        return json({
          range,
          views: views?.c || 0,
          unique_sessions: uniques?.c || 0,
          events: events?.c || 0,
          top_pages: topPages?.results || [],
          top_events: topEvents?.results || [],
          countries: countries?.results || [],
        });
      }

      // ── Dashboard (detailed, requires API key) ──
      if (path === '/dashboard' && request.method === 'GET') {
        const authKey = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!authKey || authKey !== env.ANALYTICS_KEY) return json({ error: 'unauthorized — use Authorization header' }, 401);

        const range = url.searchParams.get('range') || '7d';
        const since = range === '30d' ? "datetime('now', '-30 days')"
                    : range === '24h' ? "datetime('now', '-24 hours')"
                    : "datetime('now', '-7 days')";

        const [totals, daily, pages, eventNames, sessions, hourly] = await Promise.all([
          env.DB.prepare(`SELECT
            COUNT(*) as total_views,
            COUNT(DISTINCT session_id) as total_sessions
            FROM page_views WHERE created_at > ${since}`).first(),
          env.DB.prepare(`SELECT
            date(created_at) as day,
            COUNT(*) as views,
            COUNT(DISTINCT session_id) as sessions
            FROM page_views WHERE created_at > ${since}
            GROUP BY day ORDER BY day`).all(),
          env.DB.prepare(`SELECT path, COUNT(*) as views, COUNT(DISTINCT session_id) as sessions
            FROM page_views WHERE created_at > ${since}
            GROUP BY path ORDER BY views DESC LIMIT 20`).all(),
          env.DB.prepare(`SELECT name, COUNT(*) as count, COUNT(DISTINCT session_id) as sessions
            FROM events WHERE created_at > ${since}
            GROUP BY name ORDER BY count DESC LIMIT 20`).all(),
          env.DB.prepare(`SELECT
            AVG(pages) as avg_pages,
            AVG(duration_ms) as avg_duration_ms,
            COUNT(*) as total
            FROM sessions WHERE created_at > ${since}`).first(),
          env.DB.prepare(`SELECT
            strftime('%H', created_at) as hour,
            COUNT(*) as views
            FROM page_views WHERE created_at > ${since}
            GROUP BY hour ORDER BY hour`).all(),
        ]);

        return json({
          range,
          totals: totals || {},
          daily: daily?.results || [],
          pages: pages?.results || [],
          events: eventNames?.results || [],
          sessions: sessions || {},
          hourly: hourly?.results || [],
        });
      }

      // ── Health check ──
      if (path === '/health') {
        const count = await env.DB.prepare('SELECT COUNT(*) as c FROM page_views').first();
        return json({ status: 'up', total_views: count?.c || 0 });
      }

      // ── 404 ──
      return json({ error: 'not found', endpoints: ['/pageview', '/event', '/session', '/stats', '/dashboard', '/health'] }, 404);

    } catch (err) {
      return json({ error: err.message }, 500);
    }
  },
};
