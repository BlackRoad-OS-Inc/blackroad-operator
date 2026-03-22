const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://blackroad.network/</loc>
  </url>
  <url>
    <loc>https://blackroad.network/about</loc>
  </url>
  <url>
    <loc>https://blackroad.network/contact</loc>
  </url>
  <url>
    <loc>https://blackroad.network/docs</loc>
  </url>
  <url>
    <loc>https://blackroad.network/privacy</loc>
  </url>
  <url>
    <loc>https://blackroad.network/terms</loc>
  </url>
  <url>
    <loc>https://blackroad.network/status</loc>
  </url>
</urlset>`;

    export async function GET() {
      return new Response(body, {
        status: 200,
        headers: {
          "Content-Type": "application/xml",
        },
      });
    }
