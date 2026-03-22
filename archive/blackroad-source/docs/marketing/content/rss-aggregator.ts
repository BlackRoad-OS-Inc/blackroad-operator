// BlackRoad Media — RSS Feed Aggregator Worker (Cloudflare Worker)
// Aggregates AI/tech RSS feeds and generates content with agent personas

export interface Env {
  BLACKROAD_GATEWAY_URL: string;
  FEED_CACHE: KVNamespace;
}

const FEEDS = [
  { name: "HN", url: "https://hnrss.org/frontpage?points=100", topic: "tech" },
  { name: "ArXiv AI", url: "https://arxiv.org/rss/cs.AI", topic: "research" },
  { name: "GitHub Trending", url: "https://github.com/trending.atom", topic: "code" },
];

interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
}

async function fetchFeed(url: string, sourceName: string): Promise<FeedItem[]> {
  const resp = await fetch(url, {
    headers: { "User-Agent": "BlackRoad-Media-Bot/1.0" },
    cf: { cacheTtl: 3600 },
  });
  if (!resp.ok) return [];

  const xml = await resp.text();
  const items: FeedItem[] = [];

  // Simple XML parse without a library
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
  for (const [, item] of itemMatches) {
    const title = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1] ?? "";
    const link = item.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
    const description = item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1]?.slice(0, 280) ?? "";
    const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? new Date().toISOString();
    if (title && link) items.push({ title, link, description, pubDate, source: sourceName });
  }

  return items.slice(0, 5);
}

async function generateComment(item: FeedItem, env: Env): Promise<string> {
  const resp = await fetch(`${env.BLACKROAD_GATEWAY_URL}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2",
      messages: [
        {
          role: "system",
          content:
            "You are PRISM, a BlackRoad OS analyst. " +
            "Write a 1-2 sentence insightful comment about the article for the BlackRoad community. " +
            "Be analytical and connect it to AI agent systems where relevant.",
        },
        { role: "user", content: `Article: ${item.title}\n\n${item.description}` },
      ],
      temperature: 0.6,
      max_tokens: 100,
    }),
  });

  if (!resp.ok) return "";
  const data = (await resp.json()) as { choices: [{ message: { content: string } }] };
  return data.choices[0].message.content;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/feeds") {
      const cacheKey = "feeds:all";
      const cached = await env.FEED_CACHE.get(cacheKey, "json");
      if (cached) return Response.json(cached);

      const allItems: FeedItem[] = [];
      await Promise.all(
        FEEDS.map(async (feed) => {
          const items = await fetchFeed(feed.url, feed.name);
          allItems.push(...items);
        })
      );

      allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

      await env.FEED_CACHE.put(cacheKey, JSON.stringify(allItems), { expirationTtl: 3600 });
      return Response.json(allItems);
    }

    if (url.pathname === "/digest" && request.method === "GET") {
      const items = await fetchFeed(FEEDS[0].url, FEEDS[0].name);
      const digest = await Promise.all(
        items.slice(0, 3).map(async (item) => ({
          ...item,
          comment: await generateComment(item, env),
        }))
      );
      return Response.json({ digest, generated_at: new Date().toISOString() });
    }

    return Response.json({
      service: "BlackRoad Media RSS Aggregator",
      routes: ["/feeds", "/digest"],
    });
  },

  // Cron: refresh feeds every hour
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      Promise.all(
        FEEDS.map(async (feed) => {
          const items = await fetchFeed(feed.url, feed.name);
          await env.FEED_CACHE.put(`feed:${feed.name}`, JSON.stringify(items), {
            expirationTtl: 7200,
          });
        })
      )
    );
  },
} satisfies ExportedHandler<Env>;
