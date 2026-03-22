const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://lucidia.earth/</loc>
  </url>
  <url>
    <loc>https://lucidia.earth/about</loc>
  </url>
  <url>
    <loc>https://lucidia.earth/contact</loc>
  </url>
  <url>
    <loc>https://lucidia.earth/docs</loc>
  </url>
  <url>
    <loc>https://lucidia.earth/privacy</loc>
  </url>
  <url>
    <loc>https://lucidia.earth/terms</loc>
  </url>
  <url>
    <loc>https://lucidia.earth/status</loc>
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
