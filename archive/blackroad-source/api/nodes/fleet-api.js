// fleet-api — reads live fleet data from shared KV (same KV as stats-blackroad)
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=30"
    };

    if (url.pathname === "/fleet" || url.pathname === "/") {
      // Read fleet data from shared KV
      const raw = await env.STATS.get("stats:fleet", { type: "json" });
      if (!raw) {
        return new Response(JSON.stringify({ error: "no fleet data", hint: "collector has not run yet" }), { headers, status: 503 });
      }

      // Transform to fleet-api format
      const nodes = {};
      const nodeList = raw?.data?.nodes || raw?.nodes || [];

      if (Array.isArray(nodeList)) {
        for (const n of nodeList) {
          const name = (n.name || "unknown").toLowerCase();
          nodes[name] = {
            status: n.status || "unknown",
            ip: n.host || "",
            hostname: name,
            temp: n.cpu_temp || 0,
            ram_used: (n.mem_used_mb || 0) * 1024 * 1024,
            ram_total: (n.mem_total_mb || 0) * 1024 * 1024,
            disk_pct: n.disk_pct || 0,
            containers: n.docker_containers || 0,
            ollama: n.ollama_models > 0 ? "active" : "inactive",
            models: n.ollama_models || 0,
            uptime: n.uptime || "",
            services: n.services || "",
            online: n.status === "online"
          };
        }
      }

      const online = Object.values(nodes).filter(n => n.online).length;
      const total = Object.keys(nodes).length;

      return new Response(JSON.stringify({
        timestamp: new Date().toISOString(),
        nodes,
        summary: { online, total, health: total > 0 ? Math.round(online / total * 100) : 0 }
      }), { headers });
    }

    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok", source: "kv-shared" }), { headers });
    }

    return new Response(JSON.stringify({ service: "fleet-api", endpoints: ["/fleet", "/health"] }), { headers });
  }
};
