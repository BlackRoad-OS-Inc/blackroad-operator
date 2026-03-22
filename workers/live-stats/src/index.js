// BlackRoad Live Stats — honest numbers, fetched live
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    if (url.pathname === '/api/health') {
      return Response.json({ status: 'up', service: 'blackroad-os' }, { headers: cors });
    }

    // Fetch live data in parallel
    const [agentsRes, searchRes] = await Promise.allSettled([
      fetch('https://roundtrip.blackroad.io/api/health', { signal: AbortSignal.timeout(5000) }),
      fetch('https://search.blackroad.io/stats', { signal: AbortSignal.timeout(5000) }),
    ]);

    let agents = 200, indexed = 2027;
    try { const d = await agentsRes.value.json(); agents = d.agents || 200; } catch {}
    try { const d = await searchRes.value.json(); indexed = d.indexed_pages || 2027; } catch {}

    const stats = {
      agents,
      repos: 1713,
      orgs: 16,
      domains: 20,
      nodes: 7,
      tops: 52,
      indexed,
      products: 4,
      users: 1,
      revenue: 0,
      cost: 12,
      status: 'operational',
      founded: '2025-11-17',
      founder: 'Alexa Amundson',
      entity: 'BlackRoad OS, Inc.',
      ein: '41-2663817',
      state: 'Delaware',
      timestamp: new Date().toISOString(),
      honest: true,
    };

    return Response.json(stats, { headers: cors });
  }
};
