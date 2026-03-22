export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/fleet') {
      try {
        const res = await fetch(env.FLEET_API + '/fleet');
        const data = await res.json();
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch {
        return new Response(JSON.stringify({ error: 'fleet unreachable' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return env.ASSETS.fetch(request);
  }
};
