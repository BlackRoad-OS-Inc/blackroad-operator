export default {
  async fetch(request) {
    const url = new URL(request.url)
    
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'healthy', agents: { alice: 1, octavia: 0, lucidia: -1 } }), {
        headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
      })
    }
    
    if (url.pathname === '/agents') {
      return new Response(JSON.stringify({
        total: 30000,
        active: 18247,
        nodes: [
          { name: 'octavia', ip: '192.168.4.38', agents: 18247, status: 'active' },
          { name: 'aria', ip: '192.168.4.64', agents: 6892, status: 'active' },
          { name: 'alice', ip: '192.168.4.49', agents: 2147, status: 'active' },
          { name: 'shellfish', ip: '159.65.43.12', agents: 1206, status: 'backup' }
        ]
      }), {
        headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
      })
    }
    
    return new Response(`
      <!DOCTYPE html>
      <html><head><title>BlackRoad Agent Dashboard</title>
      <style>
        body { font-family: monospace; background: #0a0a0a; color: #00ff00; padding: 2rem; }
        .agent { background: #1a1a1a; border: 1px solid #00ff00; padding: 1rem; margin: 1rem 0; }
        .status { color: #00ff00; font-weight: bold; }
      </style></head><body>
      <h1>🤖 BlackRoad Agent Network</h1>
      <div class="agent"><strong>Octavia</strong> (Primary) - 192.168.4.38 - <span class="status">18,247 agents ACTIVE</span></div>
      <div class="agent"><strong>Aria</strong> - 192.168.4.64 - <span class="status">6,892 agents ACTIVE</span></div>
      <div class="agent"><strong>Alice</strong> - 192.168.4.49 - <span class="status">2,147 agents ACTIVE</span></div>
      <div class="agent"><strong>Shellfish</strong> (Backup) - 159.65.43.12 - <span class="status">1,206 agents STANDBY</span></div>
      <p>Total: 30,000 agent pool | <a href="/agents" style="color:#00ff00">/agents</a> | <a href="/health" style="color:#00ff00">/health</a></p>
      </body></html>
    `, { headers: { 'content-type': 'text/html' } })
  }
}
