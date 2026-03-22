/**
 * BlackRoad Router Worker
 * Routes requests to the appropriate Pages deployment based on hostname
 */

interface Env {
  // No env vars needed - we hardcode the routing
}

const ROUTES: Record<string, string> = {
  'blackroad.io': 'https://web-meixvgif8-alexa-amundsons-projects.vercel.app',
  'www.blackroad.io': 'https://web-meixvgif8-alexa-amundsons-projects.vercel.app',
  'app.blackroad.io': 'https://blackroad-console.pages.dev',
  'docs.blackroad.io': 'https://blackroad-os-docs.pages.dev',
  'demo.blackroad.io': 'https://blackroad-os-demo.pages.dev',
  'home.blackroad.io': 'https://blackroad-os-home.pages.dev',
  'brand.blackroad.io': 'https://blackroad-os-brand.pages.dev',
  'api.blackroad.io': 'https://web-meixvgif8-alexa-amundsons-projects.vercel.app',
  'status.blackroad.io': 'https://web-meixvgif8-alexa-amundsons-projects.vercel.app',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const hostname = url.hostname;

    // Find the target Pages URL
    const targetBase = ROUTES[hostname];

    if (!targetBase) {
      // Unknown hostname - return 404
      return new Response(`Unknown domain: ${hostname}`, {
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Proxy to the Pages deployment
    const targetUrl = new URL(url.pathname + url.search, targetBase);

    try {
      const response = await fetch(targetUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      // Return response with proper headers
      const newResponse = new Response(response.body, response);

      // Allow CORS from blackroad domains
      const origin = request.headers.get('Origin') || '';
      if (origin.includes('blackroad')) {
        newResponse.headers.set('Access-Control-Allow-Origin', origin);
      }

      return newResponse;
    } catch (error) {
      return new Response(`Error proxying to ${targetBase}: ${error}`, {
        status: 502,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  },
};
