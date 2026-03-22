export default {
  async fetch(request) {
    const services = [
      'blackroad-api',
      'blackroad-agents', 
      'blackroad-empire',
      'blackroad-registry',
      'blackroad-db-api',
      'blackroad-codex',
      'blackroad-gateway',
      'blackroad-status'
    ]
    
    const checks = await Promise.all(
      services.map(async s => {
        try {
          const r = await fetch(`https://${s}.amundsonalexa.workers.dev`, { method: 'HEAD' })
          return { service: s, status: r.ok ? 'up' : 'down', code: r.status }
        } catch (e) {
          return { service: s, status: 'error', error: e.message }
        }
      })
    )
    
    return new Response(JSON.stringify({ checks, total: services.length, up: checks.filter(c => c.status === 'up').length }), {
      headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
    })
  }
}
