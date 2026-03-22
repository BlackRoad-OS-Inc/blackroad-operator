// Ramp v1.0.0 — BlackRoad Onboarding & Account Setup
// ramp.blackroad.io
// From Full-Stack Plan: "Lucidia SSO — Flask + PyJWT, unified auth across both portals"
// Ramp gets new users from zero to productive. One flow. Every service.

const VERSION = '1.0.0';
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' };
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS } }); }

const ONBOARD_STEPS = [
  { id: 'account',  name: 'Create Account',    desc: 'Email + password on auth.blackroad.io', service: 'auth', required: true },
  { id: 'profile',  name: 'Set Up Profile',    desc: 'Name, avatar, preferences', service: 'auth', required: true },
  { id: 'explore',  name: 'Explore Apps',       desc: 'See what BlackRoad offers via CrossRoads', service: 'crossroads', required: false },
  { id: 'code',     name: 'First Project',      desc: 'Create or clone a repo on RoadCode', service: 'roadcode', required: false },
  { id: 'chat',     name: 'Meet the Agents',    desc: 'Say hello on RoundTrip', service: 'roundtrip', required: false },
  { id: 'run',      name: 'Run Some Code',      desc: 'Execute code on ByPass', service: 'bypass', required: false },
  { id: 'deploy',   name: 'Deploy Something',   desc: 'Ship to production via Express', service: 'express', required: false },
];

const PLANS = [
  { id: 'free',       name: 'Free',       price: 0,   features: ['5 repos','1 agent','ByPass sandbox','Community support'] },
  { id: 'builder',    name: 'Builder',    price: 29,  features: ['Unlimited repos','10 agents','Express deploys','Email support','RoadSearch'] },
  { id: 'fleet',      name: 'Fleet',      price: 99,  features: ['Everything in Builder','62 agents','Priority deploys','API access','Signal events','Detour flags'] },
  { id: 'enterprise', name: 'Enterprise', price: 299, features: ['Everything in Fleet','Custom agents','Dedicated nodes','SLA','Phone support','SSO/SAML'] },
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (path === '/api/health') return json({ status: 'alive', service: 'ramp', version: VERSION, steps: ONBOARD_STEPS.length, plans: PLANS.length, description: 'Onboarding — from zero to productive' });

    // Onboarding steps
    if (path === '/api/steps') return json({ steps: ONBOARD_STEPS });

    // Plans & pricing
    if (path === '/api/plans') return json({ plans: PLANS });

    // Start onboarding — creates account via Auth service
    if (path === '/api/start' && request.method === 'POST') {
      const body = await request.json();
      const { email, name, password } = body;
      if (!email || !password) return json({ error: 'email and password required' }, 400);

      // Create account on Auth
      let account = null;
      try {
        const r = await fetch('https://auth.blackroad.io/api/signup', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name: name || '', password }),
          signal: AbortSignal.timeout(10000),
        });
        account = await r.json();
      } catch (e) { return json({ error: `Auth service: ${e.message}` }, 502); }

      // Notify Signal
      try {
        await fetch('https://signal.blackroad.io/api/publish', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel: 'onboarding', event: 'user.signup', data: { email, name }, source: 'ramp' }),
          signal: AbortSignal.timeout(3000),
        });
      } catch {}

      // Notify RoundTrip
      try {
        await fetch('https://roundtrip.blackroad.io/api/chat', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agent: 'hestia', message: `New user joined: ${name || email}. Welcome them!`, channel: 'general' }),
          signal: AbortSignal.timeout(5000),
        });
      } catch {}

      return json({ ok: true, account, next_steps: ONBOARD_STEPS, welcome: `Welcome to BlackRoad, ${name || email}! Your agents are ready.` });
    }

    // Track onboarding progress
    if (path === '/api/progress' && request.method === 'POST') {
      const body = await request.json();
      const { user_id, step, completed } = body;
      if (!user_id || !step) return json({ error: 'user_id and step required' }, 400);
      if (env?.DB) {
        try {
          await env.DB.prepare(`CREATE TABLE IF NOT EXISTS onboarding (user_id TEXT, step TEXT, completed INTEGER, timestamp TEXT, PRIMARY KEY (user_id, step))`).run();
          await env.DB.prepare("INSERT OR REPLACE INTO onboarding (user_id, step, completed, timestamp) VALUES (?, ?, ?, datetime('now'))").bind(user_id, step, completed ? 1 : 0).run();
        } catch {}
      }
      return json({ ok: true, user_id, step, completed });
    }

    if (path === '/api/progress') {
      const userId = url.searchParams.get('user_id');
      if (!userId) return json({ error: 'user_id param required' }, 400);
      if (!env?.DB) return json({ steps: [], completed: 0 });
      try {
        const r = await env.DB.prepare('SELECT step, completed FROM onboarding WHERE user_id = ?').bind(userId).all();
        const done = (r.results || []).filter(s => s.completed).map(s => s.step);
        return json({ user_id: userId, completed: done, total: ONBOARD_STEPS.length, percent: Math.round(done.length / ONBOARD_STEPS.length * 100) });
      } catch (e) { return json({ error: e.message }); }
    }

    return json({ service: 'Ramp — Onboarding', version: VERSION, tagline: 'From zero to productive.', endpoints: { 'POST /api/start': 'Create account {email, name, password}', 'GET /api/steps': 'Onboarding steps', 'GET /api/plans': 'Pricing plans', 'POST /api/progress': 'Track step {user_id, step, completed}', 'GET /api/progress?user_id=': 'Get progress' } });
  }
};
