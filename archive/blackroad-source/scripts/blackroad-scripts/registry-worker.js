export default {
  async fetch(request) {
    const services = [
      { name: 'web', url: 'web.blackroad.io', status: 'active' },
      { name: 'prism', url: 'prism.blackroad.io', status: 'active' },
      { name: 'operator', url: 'operator.blackroad.io', status: 'active' },
      { name: 'brand', url: 'brand.blackroad.io', status: 'active' },
      { name: 'core', url: 'core.blackroad.io', status: 'active' },
      { name: 'docs', url: 'docs.blackroad.io', status: 'active' },
      { name: 'api', url: 'api.blackroad.io', status: 'active' }
    ]
    
    return new Response(JSON.stringify({
      registry: {
        version: '1.0.0',
        updated: new Date().toISOString(),
        total_services: 24,
        domains: ['blackroad.io', 'blackroad.systems'],
        services: services
      },
      deployments: {
        cloudflare: 9,
        railway: 11,
        total: 20
      },
      infrastructure: {
        organizations: 15,
        repositories: 1000,
        agents: 30000,
        scripts: 8000
      }
    }), {
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': '*'
      }
    })
  }
}
