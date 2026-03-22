/**
 * BlackRoad Media — Social Post Scheduler
 * Cloudflare Worker with Cron Triggers that queues and publishes social content.
 */
export interface Env {
  POSTS_QUEUE: Queue;
  SCHEDULE_KV: KVNamespace;
  BLACKROAD_GATEWAY_URL: string;
}

interface ScheduledPost {
  id: string;
  platform: "twitter" | "mastodon" | "linkedin" | "discord";
  content: string;
  scheduledAt: number; // unix timestamp
  status: "pending" | "published" | "failed";
}

export default {
  // HTTP handler — manage posts
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const cors = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    if (url.pathname === "/schedule" && request.method === "POST") {
      const body = await request.json() as Omit<ScheduledPost, "id" | "status">;
      const post: ScheduledPost = {
        id: `post_${Date.now()}`,
        ...body,
        status: "pending",
      };
      await env.SCHEDULE_KV.put(`post:${post.id}`, JSON.stringify(post), {
        expirationTtl: 86400 * 7, // 1 week
      });
      return Response.json({ success: true, post_id: post.id }, { headers: cors });
    }

    if (url.pathname === "/posts" && request.method === "GET") {
      const list = await env.SCHEDULE_KV.list({ prefix: "post:" });
      const posts = await Promise.all(
        list.keys.map(k => env.SCHEDULE_KV.get(k.name).then(v => v ? JSON.parse(v) : null))
      );
      return Response.json({ posts: posts.filter(Boolean) }, { headers: cors });
    }

    return Response.json({ service: "BlackRoad Media Scheduler", version: "1.0" }, { headers: cors });
  },

  // Cron handler — runs every minute to publish due posts
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const now = Date.now() / 1000;
    const list = await env.SCHEDULE_KV.list({ prefix: "post:" });

    for (const key of list.keys) {
      const raw = await env.SCHEDULE_KV.get(key.name);
      if (!raw) continue;
      const post: ScheduledPost = JSON.parse(raw);

      if (post.status === "pending" && post.scheduledAt <= now) {
        // Ask PRISM to enhance the content before publishing
        const enhanced = await enhanceContent(post.content, env.BLACKROAD_GATEWAY_URL);

        // Publish (stubbed — integrate your social APIs here)
        const published = await publishPost(post.platform, enhanced);

        post.status = published ? "published" : "failed";
        await env.SCHEDULE_KV.put(key.name, JSON.stringify(post));
        console.log(`[Scheduler] ${post.id} → ${post.status} on ${post.platform}`);
      }
    }
  },
};

async function enhanceContent(content: string, gatewayUrl: string): Promise<string> {
  try {
    const r = await fetch(`${gatewayUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2",
        messages: [
          { role: "system", content: "You are PRISM. Enhance this social post: make it engaging, add relevant hashtags, keep it under 280 chars. Return only the enhanced post." },
          { role: "user", content },
        ],
        metadata: { agent: "PRISM" },
      }),
    });
    if (r.ok) {
      const data = await r.json() as { choices: Array<{ message: { content: string } }> };
      return data.choices[0].message.content;
    }
  } catch { /* fall through */ }
  return content;
}

async function publishPost(platform: string, content: string): Promise<boolean> {
  // Integration points — add your platform API calls here
  console.log(`[Publish] ${platform}: ${content.slice(0, 60)}...`);
  return true;
}
