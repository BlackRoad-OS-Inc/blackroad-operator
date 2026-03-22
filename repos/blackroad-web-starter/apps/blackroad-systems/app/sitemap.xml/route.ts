const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://blackroad.systems/</loc>
  </url>
  <url>
    <loc>https://blackroad.systems/about</loc>
  </url>
  <url>
    <loc>https://blackroad.systems/contact</loc>
  </url>
  <url>
    <loc>https://blackroad.systems/docs</loc>
  </url>
  <url>
    <loc>https://blackroad.systems/privacy</loc>
  </url>
  <url>
    <loc>https://blackroad.systems/terms</loc>
  </url>
  <url>
    <loc>https://blackroad.systems/status</loc>
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
