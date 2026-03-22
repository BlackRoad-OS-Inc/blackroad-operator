const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://lucidia.studio/</loc>
  </url>
  <url>
    <loc>https://lucidia.studio/about</loc>
  </url>
  <url>
    <loc>https://lucidia.studio/contact</loc>
  </url>
  <url>
    <loc>https://lucidia.studio/docs</loc>
  </url>
  <url>
    <loc>https://lucidia.studio/privacy</loc>
  </url>
  <url>
    <loc>https://lucidia.studio/terms</loc>
  </url>
  <url>
    <loc>https://lucidia.studio/status</loc>
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
