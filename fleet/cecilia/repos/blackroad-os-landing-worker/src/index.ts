/**
 * BlackRoad Landing Worker
 * Proxies requests to the Cloudflare Pages deployment
 */

interface Env {
  PAGES_URL: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Proxy to Pages
    const pagesUrl = new URL(url.pathname + url.search, env.PAGES_URL);

    const response = await fetch(pagesUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });

    // Return response with CORS headers
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');

    return newResponse;
  },
};
