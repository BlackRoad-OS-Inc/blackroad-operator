export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (url.pathname === '/report' && request.method === 'POST') {
      const auth = request.headers.get('X-Fleet-Secret');
      if (auth !== env.FLEET_SECRET) return Response.json({ error: 'unauthorized' }, { status: 401, headers: cors });
      const d = await request.json();
      await env.DB.prepare('INSERT OR REPLACE INTO fleet_nodes (node,cores,load_avg,ram_used_mb,ram_total_mb,disk_pct,hailo,wg_ip,uptime_seconds,last_seen) VALUES (?,?,?,?,?,?,?,?,?,datetime("now"))').bind(d.node,d.cores,d.load,d.ram_used,d.ram_total,d.disk_pct,d.hailo?1:0,d.wg_ip,d.uptime_s).run();
      return Response.json({ ok: true, node: d.node }, { headers: cors });
    }
    if (url.pathname === '/fleet') {
      const nodes = await env.DB.prepare('SELECT * FROM fleet_nodes ORDER BY node').all();
      return Response.json({ nodes: nodes.results, count: nodes.results.length }, { headers: cors });
    }
    if (url.pathname === '/health') return Response.json({ status: 'alive', service: 'fleet-bridge' }, { headers: cors });
    return Response.json({ service: 'BlackRoad Fleet Bridge', endpoints: ['POST /report', 'GET /fleet', 'GET /health'] }, { headers: cors });
  }
};
