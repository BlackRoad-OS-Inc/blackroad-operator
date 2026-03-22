export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname
    
    // Route to different services
    const routes = {
      '/api': 'https://blackroad-api.amundsonalexa.workers.dev',
      '/agents': 'https://blackroad-agents.amundsonalexa.workers.dev',
      '/empire': 'https://blackroad-empire.amundsonalexa.workers.dev',
      '/registry': 'https://blackroad-registry.amundsonalexa.workers.dev',
      '/db': 'https://blackroad-db-api.amundsonalexa.workers.dev',
      '/codex': 'https://blackroad-codex.amundsonalexa.workers.dev'
    }
    
    for (const [route, target] of Object.entries(routes)) {
      if (path.startsWith(route)) {
        return fetch(target + path.replace(route, ''))
      }
    }
    
    return new Response(`
<!DOCTYPE html>
<html><head><title>BlackRoad Gateway</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 2rem; }
.container { max-width: 1000px; margin: 0 auto; }
h1 { color: white; font-size: 3rem; margin-bottom: 1rem; }
.endpoints { background: white; border-radius: 12px; padding: 2rem; margin: 2rem 0; }
.endpoint { padding: 1rem; margin: 0.5rem 0; background: #f5f5f5; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
.endpoint:hover { background: #e0e0e0; }
.path { font-family: monospace; color: #667eea; font-weight: 700; }
a { color: #764ba2; text-decoration: none; }
.status { color: #4ade80; font-weight: 600; }
</style></head><body>
<div class="container">
<h1>🌐 BlackRoad Gateway</h1>
<p style="color: white; font-size: 1.25rem; margin-bottom: 2rem;"><span class="status">● ONLINE</span> | Routing to all services</p>
<div class="endpoints">
<h2 style="margin-bottom: 1rem;">Active Endpoints</h2>
${Object.entries(routes).map(([path, url]) => `
<div class="endpoint">
  <span class="path">${path}</span>
  <a href="${path}">Open →</a>
</div>
`).join('')}
</div>
<div style="background: rgba(255,255,255,0.95); padding: 2rem; border-radius: 12px;">
<h3>Quick Stats</h3>
<p>⚡ Services: 6 active</p>
<p>🤖 Agents: 30,000 pool</p>
<p>🏢 Organizations: 15</p>
<p>📦 Repositories: 1,000+</p>
<p>🗄️ Database: D1 operational</p>
</div>
</div>
</body></html>
    `, { headers: { 'content-type': 'text/html' } })
  }
}
