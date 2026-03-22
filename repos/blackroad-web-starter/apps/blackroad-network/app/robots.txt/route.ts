const ROBOTS = `User-agent: *
Allow: /
Sitemap: https://blackroad.network/sitemap.xml`;

    export async function GET() {
      return new Response(ROBOTS, {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }
