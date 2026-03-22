export default {
  async fetch(request) {
    const orgs = [
      'BlackRoad-OS', 'BlackRoad-AI', 'BlackRoad-Labs', 'BlackRoad-Cloud',
      'BlackRoad-Ventures', 'BlackRoad-Foundation', 'BlackRoad-Media',
      'BlackRoad-Hardware', 'BlackRoad-Education', 'BlackRoad-Gov',
      'BlackRoad-Security', 'BlackRoad-Interactive', 'BlackRoad-Archive',
      'BlackRoad-Studio', 'Blackbox-Enterprises'
    ]
    
    return new Response(`
      <!DOCTYPE html>
      <html><head><title>BlackRoad Empire</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { color: white; font-size: 3rem; margin-bottom: 2rem; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat { background: rgba(255,255,255,0.95); padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        .stat-value { font-size: 2.5rem; font-weight: 900; color: #667eea; }
        .stat-label { color: #666; margin-top: 0.5rem; }
        .orgs { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
        .org { background: rgba(255,255,255,0.95); padding: 1rem; border-radius: 8px; transition: transform 0.2s; }
        .org:hover { transform: translateY(-4px); }
        .org-name { font-weight: 700; color: #764ba2; }
      </style></head><body>
      <div class="container">
        <h1>🖤 BlackRoad Empire</h1>
        <div class="stats">
          <div class="stat"><div class="stat-value">15</div><div class="stat-label">Organizations</div></div>
          <div class="stat"><div class="stat-value">1,000+</div><div class="stat-label">Repositories</div></div>
          <div class="stat"><div class="stat-value">30,000</div><div class="stat-label">AI Agents</div></div>
          <div class="stat"><div class="stat-value">9+</div><div class="stat-label">Live Deployments</div></div>
        </div>
        <h2 style="color:white; margin-bottom:1rem;">Organizations</h2>
        <div class="orgs">
          ${orgs.map(org => `<div class="org"><div class="org-name">${org}</div><a href="https://github.com/${org}" style="color:#667eea; text-decoration:none;">github.com/${org} →</a></div>`).join('')}
        </div>
      </div>
      </body></html>
    `, { headers: { 'content-type': 'text/html' } })
  }
}
