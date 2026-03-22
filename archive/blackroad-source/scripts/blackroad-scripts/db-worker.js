export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    
    if (url.pathname === '/init') {
      await env.DB.exec(`
        CREATE TABLE IF NOT EXISTS agents (
          id INTEGER PRIMARY KEY,
          name TEXT,
          state INTEGER,
          type TEXT,
          ip TEXT,
          agent_count INTEGER,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY,
          agent TEXT,
          status TEXT,
          payload TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS deployments (
          id INTEGER PRIMARY KEY,
          service TEXT,
          url TEXT,
          status TEXT,
          deployed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `)
      return new Response('Database initialized')
    }
    
    if (url.pathname === '/agents') {
      const { results } = await env.DB.prepare('SELECT * FROM agents').all()
      return new Response(JSON.stringify(results), {
        headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
      })
    }
    
    if (url.pathname === '/tasks') {
      const { results } = await env.DB.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all()
      return new Response(JSON.stringify(results), {
        headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
      })
    }
    
    return new Response('BlackRoad Database API - /init | /agents | /tasks')
  }
}
