const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://blackroadai.com/</loc>
  </url>
  <url>
    <loc>https://blackroadai.com/about</loc>
  </url>
  <url>
    <loc>https://blackroadai.com/contact</loc>
  </url>
  <url>
    <loc>https://blackroadai.com/docs</loc>
  </url>
  <url>
    <loc>https://blackroadai.com/privacy</loc>
  </url>
  <url>
    <loc>https://blackroadai.com/terms</loc>
  </url>
  <url>
    <loc>https://blackroadai.com/status</loc>
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
