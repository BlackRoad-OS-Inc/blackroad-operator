const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://blackroad.me/</loc>
  </url>
  <url>
    <loc>https://blackroad.me/about</loc>
  </url>
  <url>
    <loc>https://blackroad.me/contact</loc>
  </url>
  <url>
    <loc>https://blackroad.me/docs</loc>
  </url>
  <url>
    <loc>https://blackroad.me/privacy</loc>
  </url>
  <url>
    <loc>https://blackroad.me/terms</loc>
  </url>
  <url>
    <loc>https://blackroad.me/status</loc>
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
