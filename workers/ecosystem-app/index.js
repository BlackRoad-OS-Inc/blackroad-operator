// BlackRoad Ecosystem Index — Static SPA Worker
const HTML = `PLACEHOLDER`;

export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Serve static assets from the build
    if (url.pathname.startsWith('/assets/')) {
      // In production, these would come from R2 or KV
      return new Response('/* asset */', { 
        headers: { 'Content-Type': 'application/javascript', 'Cache-Control': 'public, max-age=31536000, immutable' }
      });
    }
    
    return new Response(HTML, {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Cache-Control': 'public, max-age=300',
        'X-BR-Router': '2.0',
        'X-BR-Brand': 'Ember→Flare→Magenta→Orchid→Arc→Cyan',
      }
    });
  }
};
