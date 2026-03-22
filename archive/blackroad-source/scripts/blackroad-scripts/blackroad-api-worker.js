export default {
  async fetch(request) {
    return new Response(JSON.stringify({
      service: 'BlackRoad API Gateway',
      status: 'active',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        version: '/version',
        agents: '/agents',
        tasks: '/tasks'
      },
      organizations: 15,
      repositories: 1000,
      agents: 30000,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': '*'
      }
    })
  }
}
