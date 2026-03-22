// CrossRoads v1.0.0 — BlackRoad Decision Engine & App Router
// crossroads.blackroad.io
// From v4 Plan: "Central hub, browser OS" + "Window-in-a-window paradigm"
// CrossRoads is where paths meet — tell it what you need, it routes you to the right app.

const VERSION = '1.0.0';
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS } }); }

const APPS = {
  code:      { name: 'RoadCode',   url: 'https://roadcode.blackroad.io',   desc: 'Build, deploy, manage code', icon: '💻', keywords: ['code','build','repo','git','deploy','pr','commit'] },
  chat:      { name: 'RoundTrip',  url: 'https://roundtrip.blackroad.io',  desc: 'Talk to 62 AI agents', icon: '💬', keywords: ['chat','talk','ask','agent','discuss','message'] },
  search:    { name: 'RoadSearch', url: 'https://search.blackroad.io',     desc: 'Search everything', icon: '🔍', keywords: ['search','find','look','query','where'] },
  run:       { name: 'ByPass',     url: 'https://bypass.blackroad.io',     desc: 'Run code instantly', icon: '⚡', keywords: ['run','execute','test','sandbox','playground'] },
  deploy:    { name: 'Express',    url: 'https://express.blackroad.io',    desc: 'One-click deploy', icon: '🚀', keywords: ['deploy','ship','push','release','launch'] },
  events:    { name: 'Signal',     url: 'https://signal.blackroad.io',     desc: 'Real-time events', icon: '📡', keywords: ['event','notify','alert','webhook','stream'] },
  gateway:   { name: 'Junction',   url: 'https://junction.blackroad.io',   desc: 'API gateway', icon: '🔀', keywords: ['api','gateway','route','proxy','service'] },
  flags:     { name: 'Detour',     url: 'https://detour.blackroad.io',     desc: 'Feature flags', icon: '🚧', keywords: ['flag','feature','toggle','experiment','ab'] },
  onboard:   { name: 'Ramp',       url: 'https://ramp.blackroad.io',       desc: 'Get started', icon: '🛤️', keywords: ['start','setup','onboard','new','begin','account'] },
  pay:       { name: 'RoadPay',    url: 'https://pay.blackroad.io',        desc: 'Billing & payments', icon: '💰', keywords: ['pay','bill','subscribe','price','plan'] },
  hq:        { name: 'HQ',         url: 'https://hq.blackroad.io',         desc: 'Pixel headquarters', icon: '🏢', keywords: ['hq','office','headquarters','building'] },
  auth:      { name: 'Auth',       url: 'https://auth.blackroad.io',       desc: 'Login & accounts', icon: '🔐', keywords: ['login','auth','account','password','signup'] },
  home:      { name: 'BlackRoad',  url: 'https://blackroad.io',            desc: 'Home', icon: '🛣️', keywords: ['home','main','about','blackroad'] },
};

function routeByIntent(text) {
  const lower = text.toLowerCase();
  let best = null, bestScore = 0;
  for (const [id, app] of Object.entries(APPS)) {
    const score = app.keywords.reduce((s, kw) => s + (lower.includes(kw) ? 1 : 0), 0);
    if (score > bestScore) { best = { id, ...app }; bestScore = score; }
  }
  return best || { id: 'home', ...APPS.home };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (path === '/api/health') return json({ status: 'alive', service: 'crossroads', version: VERSION, apps: Object.keys(APPS).length, description: 'Decision engine — tell it what you need, get routed to the right app' });

    // Route: natural language → app
    if (path === '/api/route' && request.method === 'POST') {
      const body = await request.json();
      const query = body.query || body.message || '';
      if (!query) return json({ error: 'query required' }, 400);
      const app = routeByIntent(query);
      return json({ query, routed_to: app, all_apps: Object.keys(APPS).length });
    }

    // Route by query param
    if (path === '/api/route') {
      const q = url.searchParams.get('q') || '';
      if (!q) return json({ error: 'q param required' }, 400);
      const app = routeByIntent(q);
      return json({ query: q, routed_to: app });
    }

    // List all apps
    if (path === '/api/apps') {
      return json(Object.entries(APPS).map(([id, a]) => ({ id, ...a })));
    }

    // Status check all apps
    if (path === '/api/status') {
      const checks = await Promise.allSettled(
        Object.entries(APPS).map(async ([id, app]) => {
          try {
            const r = await fetch(app.url + '/api/health', { signal: AbortSignal.timeout(5000) });
            return { id, name: app.name, icon: app.icon, status: r.ok ? 'up' : 'down', http: r.status };
          } catch { return { id, name: app.name, icon: app.icon, status: 'down' }; }
        })
      );
      return json({ apps: checks.map(c => c.value || { status: 'error' }) });
    }

    return json({ service: 'CrossRoads — Decision Engine', version: VERSION, tagline: 'Where paths meet.', endpoints: { 'POST /api/route': 'Route by intent {query}', 'GET /api/route?q=': 'Route by query', 'GET /api/apps': 'List all apps', 'GET /api/status': 'Health check all apps' }, apps: Object.keys(APPS) });
  }
};
