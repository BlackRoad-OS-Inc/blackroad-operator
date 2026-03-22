// Signal v1.0.0 — BlackRoad Real-Time Event Hub
// signal.blackroad.io
// From Full-Stack Plan: "Redis pub/sub for real-time collaboration edits or notifications"
// Signal is the event bus — any service publishes, any service subscribes.

const VERSION = '1.0.0';
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' };
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS } }); }

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (path === '/api/health') return json({ status: 'alive', service: 'signal', version: VERSION, description: 'Real-time event hub — publish, subscribe, stream' });

    // Publish an event
    if (path === '/api/publish' && request.method === 'POST') {
      const body = await request.json();
      const { channel, event, data, source } = body;
      if (!channel || !event) return json({ error: 'channel and event required' }, 400);
      const entry = { id: crypto.randomUUID(), channel, event, data: data || {}, source: source || 'unknown', timestamp: new Date().toISOString() };
      // Store in D1
      if (env?.DB) {
        try {
          await env.DB.prepare(`CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, channel TEXT, event TEXT, data TEXT, source TEXT, timestamp TEXT)`).run();
          await env.DB.prepare('INSERT INTO events (id, channel, event, data, source, timestamp) VALUES (?, ?, ?, ?, ?, ?)').bind(entry.id, channel, event, JSON.stringify(data || {}), source || 'unknown', entry.timestamp).run();
        } catch {}
      }
      // Fan out to RoundTrip
      try {
        await fetch('https://roundtrip.blackroad.io/api/chat', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agent: 'echo', message: `[SIGNAL] ${channel}/${event}: ${JSON.stringify(data || {}).slice(0, 200)}`, channel: 'ops' }),
          signal: AbortSignal.timeout(5000),
        });
      } catch {}
      return json({ ok: true, event: entry });
    }

    // Get recent events
    if (path === '/api/events') {
      const channel = url.searchParams.get('channel');
      const limit = Math.min(parseInt(url.searchParams.get('limit')) || 50, 200);
      if (!env?.DB) return json({ events: [] });
      try {
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, channel TEXT, event TEXT, data TEXT, source TEXT, timestamp TEXT)`).run();
        const q = channel
          ? env.DB.prepare('SELECT * FROM events WHERE channel = ? ORDER BY timestamp DESC LIMIT ?').bind(channel, limit)
          : env.DB.prepare('SELECT * FROM events ORDER BY timestamp DESC LIMIT ?').bind(limit);
        const r = await q.all();
        return json({ events: (r.results || []).map(e => ({ ...e, data: JSON.parse(e.data || '{}') })) });
      } catch (e) { return json({ events: [], error: e.message }); }
    }

    // List channels
    if (path === '/api/channels') {
      if (!env?.DB) return json({ channels: [] });
      try {
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, channel TEXT, event TEXT, data TEXT, source TEXT, timestamp TEXT)`).run();
        const r = await env.DB.prepare('SELECT channel, COUNT(*) as count, MAX(timestamp) as last_event FROM events GROUP BY channel ORDER BY last_event DESC').all();
        return json({ channels: r.results || [] });
      } catch (e) { return json({ channels: [], error: e.message }); }
    }

    // Subscribe (long-poll — check for new events since timestamp)
    if (path === '/api/subscribe') {
      const channel = url.searchParams.get('channel');
      const since = url.searchParams.get('since') || new Date(Date.now() - 60000).toISOString();
      if (!env?.DB) return json({ events: [] });
      try {
        const r = await env.DB.prepare('SELECT * FROM events WHERE channel = ? AND timestamp > ? ORDER BY timestamp ASC LIMIT 50').bind(channel || 'all', since).all();
        return json({ events: (r.results || []).map(e => ({ ...e, data: JSON.parse(e.data || '{}') })), since, next_since: new Date().toISOString() });
      } catch (e) { return json({ events: [], error: e.message }); }
    }

    return json({ service: 'Signal — Real-Time Event Hub', version: VERSION, endpoints: { 'POST /api/publish': 'Publish event {channel, event, data, source}', 'GET /api/events': 'Recent events (?channel=&limit=)', 'GET /api/channels': 'List active channels', 'GET /api/subscribe': 'Long-poll (?channel=&since=)' } });
  }
};
