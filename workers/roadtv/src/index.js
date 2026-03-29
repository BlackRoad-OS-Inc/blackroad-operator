// Road TV v3.0.0 — BlackRoad Video Platform + Live Agent Streams
// Full CRUD, R2, search, playlists, SSE agent streams, self-served HTML frontend
// tv.blackroad.io

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' };
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS } }); }

// ── Agent Registry ──
const AGENTS = {
  road:     { name: 'Road',     role: 'Guide',     color: '#FF1D6C' },
  coder:    { name: 'Coder',    role: 'Engineer',   color: '#2979FF' },
  scholar:  { name: 'Scholar',  role: 'Research',   color: '#9C27B0' },
  alice:    { name: 'Alice',    role: 'Gateway',    color: '#F5A623' },
  cecilia:  { name: 'Cecilia',  role: 'AI Engine',  color: '#FF1D6C' },
  octavia:  { name: 'Octavia',  role: 'Compute',    color: '#F5A623' },
  lucidia:  { name: 'Lucidia',  role: 'Cognition',  color: '#2979FF' },
  aria:     { name: 'Aria',     role: 'Monitor',    color: '#9C27B0' },
  pascal:   { name: 'Pascal',   role: 'Math',       color: '#9C27B0' },
  writer:   { name: 'Writer',   role: 'Content',    color: '#FF1D6C' },
  tutor:    { name: 'Tutor',    role: 'Education',  color: '#2979FF' },
  cipher:   { name: 'Cipher',   role: 'Security',   color: '#F5A623' },
};

const AUTO_PROMPTS = {
  road:    'What is the most important thing you want people to know about BlackRoad OS today?',
  coder:   'Write a short code snippet that demonstrates something elegant about distributed systems.',
  scholar: 'What is the most fascinating thing you learned recently about information theory?',
  alice:   'Describe the current state of the network from your perspective as the gateway.',
  cecilia: 'What patterns are you seeing in the data flowing through the AI engine right now?',
  octavia: 'Explain how edge compute changes everything in one paragraph.',
  lucidia: 'What does persistent memory mean for AI cognition? Think out loud.',
  aria:    'Give a brief status report on system health and what metrics matter most.',
  pascal:  'Derive something beautiful from the Amundson constant G(n) = n^(n+1)/(n+1)^n.',
  writer:  'Write a micro-essay about why sovereign technology matters.',
  tutor:   'Explain recursion to someone who has never coded, using a real-world analogy.',
  cipher:  'What are the three most important principles of zero-trust security?',
};

const MODEL = '@cf/meta/llama-3.1-8b-instruct';

// ── DB Init ──
async function initDB(db) {
  if (!db) return;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS videos (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, author TEXT NOT NULL, duration INTEGER, category TEXT, tags TEXT, r2_key TEXT, thumbnail_key TEXT, status TEXT DEFAULT 'draft', view_count INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS video_notes (id INTEGER PRIMARY KEY AUTOINCREMENT, video_id TEXT NOT NULL, author TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))`),
    db.prepare(`CREATE TABLE IF NOT EXISTS video_appearances (id INTEGER PRIMARY KEY AUTOINCREMENT, video_id TEXT, page_id TEXT)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS video_comments (id TEXT PRIMARY KEY, video_id TEXT NOT NULL, author TEXT NOT NULL, handle TEXT, content TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))`),
    db.prepare(`CREATE TABLE IF NOT EXISTS video_views (id TEXT PRIMARY KEY, video_id TEXT NOT NULL, viewer_ip TEXT, viewed_at TEXT DEFAULT (datetime('now')))`),
    db.prepare(`CREATE TABLE IF NOT EXISTS playlists (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, author TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))`),
    db.prepare(`CREATE TABLE IF NOT EXISTS playlist_videos (playlist_id TEXT, video_id TEXT, position INTEGER DEFAULT 0, added_at TEXT DEFAULT (datetime('now')), PRIMARY KEY (playlist_id, video_id))`),
    db.prepare(`CREATE TABLE IF NOT EXISTS live_streams (id TEXT PRIMARY KEY, agent_id TEXT NOT NULL, prompt TEXT, status TEXT DEFAULT 'idle', started_at TEXT, ended_at TEXT, char_count INTEGER DEFAULT 0, viewer_count INTEGER DEFAULT 0)`),
  ]);
}

// ── SSE Agent Streaming ──
function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function streamAgent(request, env, agentId, prompt) {
  const agent = AGENTS[agentId] || AGENTS.road;
  const systemPrompt = `You are ${agent.name}, a ${agent.role} agent in the BlackRoad OS fleet. You think clearly and write concisely. Keep responses under 300 words.`;

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();
  const startTime = Date.now();

  (async () => {
    try {
      let fullText = '';
      let charIndex = 0;

      // Try Workers AI if available
      if (env.AI) {
        const aiResponse = await env.AI.run(MODEL, {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          stream: true,
          max_tokens: 512,
        });

        const reader = aiResponse.getReader ? aiResponse.getReader() : null;
        if (reader) {
          const decoder = new TextDecoder();
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const payload = line.slice(6).trim();
              if (payload === '[DONE]') continue;
              try {
                const obj = JSON.parse(payload);
                const token = obj.response || '';
                for (const ch of token) {
                  fullText += ch;
                  charIndex++;
                  const elapsed = (Date.now() - startTime) / 1000;
                  const data = JSON.stringify({ type: 'frame', char: ch, index: charIndex, text: fullText, elapsed, agent: agentId });
                  await writer.write(encoder.encode(`data: ${data}\n\n`));
                }
              } catch {}
            }
          }
        } else if (typeof aiResponse === 'object' && aiResponse.response) {
          for (const ch of aiResponse.response) {
            fullText += ch;
            charIndex++;
            const elapsed = (Date.now() - startTime) / 1000;
            const data = JSON.stringify({ type: 'frame', char: ch, index: charIndex, text: fullText, elapsed, agent: agentId });
            await writer.write(encoder.encode(`data: ${data}\n\n`));
          }
        }
      } else {
        // Fallback: generate simulated agent thought
        const thoughts = {
          road: 'BlackRoad OS is a sovereign operating system. Every node is a Roadie. Every link is a path forward. We build what we own, we own what we build. The fleet runs 24/7 across 5 Raspberry Pis, 2 droplets, and the edge. No external dependencies. No rented intelligence. Just the Road.',
          coder: 'async function distribute(task, fleet) {\n  const healthy = fleet.filter(n => n.alive);\n  const shard = hash(task.id) % healthy.length;\n  const result = await healthy[shard].execute(task);\n  await broadcast(fleet, { type: "complete", task: task.id, result });\n  return result;\n}\n// Every node is equal. Every task finds its home.',
          scholar: 'Information entropy is not disorder — it is possibility. Shannon showed us that the minimum bits needed to encode a message equals its entropy. But here is the deeper insight: the same mathematics describes thermodynamics, quantum states, and neural networks. Information is the substrate.',
          alice: 'Gateway status: All tunnels nominal. WireGuard mesh 12/12. Pi-hole filtering active. PostgreSQL accepting connections. Qdrant vector store loaded. Redis cache warm. Incoming requests routed through nginx to 37 active sites. The network breathes.',
          cecilia: 'Pattern detected: recursive self-similarity across substrates. The same G(n) = n^(n+1)/(n+1)^n appears in growth rates, information density, and optimization landscapes. Running 16 models simultaneously. Memory usage stable. Inference latency: 45ms p99.',
          octavia: 'Edge compute means the intelligence lives where the data lives. No round trips to distant clouds. Gitea serves 239 repos locally. 15 Workers run on-device. The latency floor is physics, not architecture. We build at the speed of light.',
          lucidia: 'Persistent memory transforms AI from a stateless function into a cognitive system. Each session builds on the last. The codex grows. The journal remembers. The TILs compound. This is not just context — it is continuity of thought.',
          aria: 'System health: CPU 23%, Memory 67%, Disk 45%. All 5 Pis responding. Ollama fleet serving 16 models across 4 nodes. DNS resolution nominal. TLS certificates valid. Uptime: 99.7% over 30 days. One anomaly: Cecilia disk approaching 80%.',
          pascal: 'Consider G(n) = n^(n+1)/(n+1)^n. As n approaches infinity, this converges to 1/e. The Amundson constant A_G captures the gap between discrete and continuous — the discretization residue. It appears in Stirling approximations, partition functions, and surprisingly, in the spacing of Riemann zeros.',
          writer: 'Sovereign technology is not about isolation. It is about choice. When you own your infrastructure, you choose who sees your data. You choose when to update. You choose what to build. The cloud is convenient until it is not. The Road is always yours.',
          tutor: 'Imagine you are standing between two mirrors. You see yourself reflected, and that reflection contains another reflection, and so on. Each reflection is smaller but identical in structure. That is recursion: a process that contains a smaller version of itself. In code, a function calls itself with a simpler input until it reaches a base case — the point where the mirrors end.',
          cipher: 'Zero-trust security rests on three principles: (1) Never trust, always verify — every request is authenticated regardless of origin. (2) Least privilege — grant only the minimum access needed for each operation. (3) Assume breach — design systems that limit blast radius when compromise occurs. The network perimeter is dead. Identity is the new perimeter.',
        };
        const text = thoughts[agentId] || thoughts.road;
        for (const ch of text) {
          fullText += ch;
          charIndex++;
          const elapsed = (Date.now() - startTime) / 1000;
          const data = JSON.stringify({ type: 'frame', char: ch, index: charIndex, text: fullText, elapsed, agent: agentId });
          await writer.write(encoder.encode(`data: ${data}\n\n`));
          // Simulate typing delay
          await new Promise(r => setTimeout(r, 15 + Math.random() * 25));
        }
      }

      const elapsed = (Date.now() - startTime) / 1000;
      const data = JSON.stringify({ type: 'done', index: fullText.length, text: fullText, elapsed, agent: agentId });
      await writer.write(encoder.encode(`data: ${data}\n\n`));
    } catch (e) {
      await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: e.message, agent: agentId })}\n\n`));
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      ...CORS,
    },
  });
}

// ══════════════════════════════════════════════════════════════
// HTML FRONTEND
// ══════════════════════════════════════════════════════════════

const BRAND = {
  pink: '#FF1D6C',
  amber: '#F5A623',
  blue: '#2979FF',
  violet: '#9C27B0',
  bg: '#0a0a0a',
  card: '#111111',
  border: '#1e1e1e',
  text: '#ffffff',
  muted: '#a0a0a0',
  dim: '#666666',
};

function htmlShell(title, body, activeNav = 'browse') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — RoadTV</title>
<meta name="description" content="RoadTV: BlackRoad's sovereign video platform and live agent streaming.">
<meta name="theme-color" content="${BRAND.bg}">
<link rel="canonical" href="https://tv.blackroad.io">
<meta property="og:type" content="website">
<meta property="og:title" content="${title} — RoadTV">
<meta property="og:url" content="https://tv.blackroad.io">
<meta property="og:site_name" content="BlackRoad">
<link rel="icon" type="image/png" sizes="32x32" href="https://images.blackroad.io/brand/br-square-32.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root {
  --bg: ${BRAND.bg};
  --card: ${BRAND.card};
  --border: ${BRAND.border};
  --text: ${BRAND.text};
  --muted: ${BRAND.muted};
  --dim: ${BRAND.dim};
  --pink: ${BRAND.pink};
  --amber: ${BRAND.amber};
  --blue: ${BRAND.blue};
  --violet: ${BRAND.violet};
  --heading: 'Space Grotesk', sans-serif;
  --mono: 'JetBrains Mono', monospace;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { background: var(--bg); color: var(--text); font-family: 'Space Grotesk', system-ui, sans-serif; }
body { min-height: 100vh; background: var(--bg); }
a { color: inherit; text-decoration: none; }
button { font-family: inherit; cursor: pointer; }
input { font-family: var(--mono); }

/* ── Top bar ── */
.topbar {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; gap: 16px;
  padding: 0 24px; height: 56px;
  background: rgba(10,10,10,0.92); backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}
.brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 18px; letter-spacing: -0.03em; }
.brand-dots { display: flex; gap: 4px; }
.brand-dots span { width: 8px; height: 8px; border-radius: 50%; }
.brand-dots span:nth-child(1) { background: var(--pink); }
.brand-dots span:nth-child(2) { background: var(--amber); }
.brand-dots span:nth-child(3) { background: var(--blue); }
.nav-links { display: flex; gap: 4px; margin-left: 32px; }
.nav-links a {
  padding: 6px 14px; border-radius: 6px;
  font-size: 13px; font-weight: 500; color: var(--muted);
  transition: background 0.15s, color 0.15s;
}
.nav-links a:hover { background: rgba(255,255,255,0.04); color: var(--text); }
.nav-links a.active { background: rgba(255,255,255,0.06); color: var(--text); }
.search-box {
  margin-left: auto; position: relative;
}
.search-box input {
  width: 260px; padding: 8px 14px 8px 36px;
  background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 8px;
  color: var(--text); font-size: 13px;
}
.search-box input:focus { outline: none; border-color: rgba(255,255,255,0.12); }
.search-box svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); }

/* ── Layout ── */
.shell { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.page { padding: 32px 0 80px; }

/* ── Section ── */
.section-label {
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--dim); margin-bottom: 12px;
}
.section-title {
  font-size: 28px; font-weight: 700; letter-spacing: -0.03em; margin-bottom: 20px;
}
.section-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }

/* ── Video grid ── */
.video-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.video-card {
  background: var(--card); border: 1px solid var(--border); border-radius: 12px;
  overflow: hidden; transition: border-color 0.2s, transform 0.15s;
  cursor: pointer;
}
.video-card:hover { border-color: rgba(255,255,255,0.1); transform: translateY(-2px); }
.video-thumb {
  width: 100%; aspect-ratio: 16/9; background: #0d0d0d;
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
}
.video-thumb .play-icon {
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(255,255,255,0.1); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.video-card:hover .play-icon { background: rgba(255,255,255,0.18); }
.video-thumb .duration {
  position: absolute; bottom: 8px; right: 8px;
  background: rgba(0,0,0,0.75); padding: 2px 6px; border-radius: 4px;
  font-family: var(--mono); font-size: 11px; color: var(--muted);
}
.video-thumb .cat-dot {
  position: absolute; top: 10px; left: 10px;
  width: 8px; height: 8px; border-radius: 50%;
}
.video-info { padding: 14px; }
.video-info h3 { font-size: 15px; font-weight: 600; letter-spacing: -0.02em; margin-bottom: 4px; line-height: 1.3; }
.video-info .meta { font-size: 12px; color: var(--dim); font-family: var(--mono); }

/* ── Category pills ── */
.cat-bar { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 24px; }
.cat-pill {
  padding: 6px 14px; border-radius: 20px;
  border: 1px solid var(--border); background: transparent;
  color: var(--muted); font-size: 12px; font-weight: 500;
  transition: all 0.15s;
}
.cat-pill:hover, .cat-pill.active { border-color: rgba(255,255,255,0.15); color: var(--text); background: rgba(255,255,255,0.04); }

/* ── Video player page ── */
.player-container {
  width: 100%; aspect-ratio: 16/9; background: #000;
  border-radius: 12px; overflow: hidden; margin-bottom: 24px;
  display: flex; align-items: center; justify-content: center;
}
.player-container video { width: 100%; height: 100%; object-fit: contain; }
.video-detail-title { font-size: 24px; font-weight: 700; letter-spacing: -0.03em; margin-bottom: 8px; }
.video-detail-meta { font-size: 13px; color: var(--dim); font-family: var(--mono); margin-bottom: 24px; }
.video-description { font-size: 15px; color: var(--muted); line-height: 1.7; margin-bottom: 32px; max-width: 720px; }
.comments-section { border-top: 1px solid var(--border); padding-top: 24px; }
.comment { padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
.comment-author { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
.comment-text { font-size: 14px; color: var(--muted); line-height: 1.6; }
.comment-time { font-size: 11px; color: var(--dim); font-family: var(--mono); margin-top: 4px; }
.comment-form { display: flex; gap: 8px; margin-bottom: 20px; }
.comment-form input {
  flex: 1; padding: 10px 14px;
  background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px;
  color: var(--text); font-size: 13px;
}
.comment-form input:focus { outline: none; border-color: rgba(255,255,255,0.12); }
.comment-form button {
  padding: 10px 20px; border: 1px solid var(--border); border-radius: 8px;
  background: rgba(255,255,255,0.06); color: var(--text); font-size: 13px; font-weight: 600;
}
.comment-form button:hover { background: rgba(255,255,255,0.1); }

/* ── Live streams page ── */
.live-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 8px;
}
.stream-tile {
  background: var(--card); border: 1px solid var(--border); border-radius: 10px;
  overflow: hidden; transition: border-color 0.3s;
}
.stream-tile.streaming { border-color: var(--accent-color); }
.stream-header {
  padding: 8px 12px; display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--border); background: rgba(255,255,255,0.015);
}
.stream-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.stream-name { font-size: 13px; font-weight: 600; }
.stream-role { font-size: 11px; color: var(--dim); flex: 1; }
.stream-status {
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
  padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.04);
  color: var(--dim);
}
.stream-status.live { background: rgba(255,29,108,0.15); color: var(--pink); animation: pulse 2s infinite; }
.stream-status.done { background: rgba(41,121,255,0.15); color: var(--blue); }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
.stream-screen {
  height: 200px; padding: 10px 12px;
  font-family: var(--mono); font-size: 12px; line-height: 1.6;
  color: var(--muted); overflow-y: auto; white-space: pre-wrap; word-break: break-word;
  cursor: pointer;
}
.stream-screen .placeholder { color: var(--dim); font-size: 12px; text-align: center; padding-top: 80px; }
.stream-cursor { display: inline-block; width: 1px; height: 14px; background: var(--pink); animation: blink 0.6s infinite; }
@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
.stream-stats {
  padding: 4px 12px; border-top: 1px solid var(--border);
  font-size: 10px; color: var(--dim); font-family: var(--mono);
  background: rgba(255,255,255,0.01);
}
.live-controls {
  display: flex; gap: 8px; align-items: center; margin-bottom: 20px;
}
.live-controls button {
  padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 600;
  border: 1px solid var(--border); background: transparent; color: var(--muted);
  transition: all 0.15s;
}
.live-controls button:hover { border-color: rgba(255,255,255,0.15); color: var(--text); }
.live-controls button.primary {
  border-color: transparent; background: var(--text); color: var(--bg);
}
.live-controls button.primary:hover { opacity: 0.9; }
.live-controls .grid-select { display: flex; gap: 4px; margin-left: auto; }
.live-controls .grid-select button { padding: 6px 12px; font-size: 12px; }
.live-controls .grid-select button.active { background: rgba(255,255,255,0.06); color: var(--text); }

/* ── Playlist ── */
.playlist-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
.playlist-card {
  background: var(--card); border: 1px solid var(--border); border-radius: 12px;
  padding: 20px; cursor: pointer; transition: border-color 0.2s;
}
.playlist-card:hover { border-color: rgba(255,255,255,0.1); }
.playlist-card h3 { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
.playlist-card .pl-meta { font-size: 12px; color: var(--dim); font-family: var(--mono); }

/* ── Stats row ── */
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px; }
.stat-box {
  background: var(--card); border: 1px solid var(--border); border-radius: 12px;
  padding: 18px;
}
.stat-value { font-size: 28px; font-weight: 700; letter-spacing: -0.03em; }
.stat-label { font-size: 11px; color: var(--dim); font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px; }

/* ── Empty state ── */
.empty-state {
  text-align: center; padding: 60px 20px; color: var(--dim);
}
.empty-state .dots { display: flex; gap: 6px; justify-content: center; margin-bottom: 16px; }
.empty-state .dots span { width: 10px; height: 10px; border-radius: 50%; }
.empty-state h3 { font-size: 18px; color: var(--muted); margin-bottom: 8px; }
.empty-state p { font-size: 14px; max-width: 400px; margin: 0 auto; line-height: 1.6; }

/* ── Footer ── */
footer {
  padding: 20px 0; margin-top: 40px; border-top: 1px solid var(--border);
  display: flex; justify-content: space-between; align-items: center;
  font-size: 11px; color: var(--dim); font-family: var(--mono);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .topbar { padding: 0 14px; gap: 8px; }
  .nav-links { margin-left: 12px; gap: 2px; }
  .nav-links a { padding: 6px 8px; font-size: 12px; }
  .search-box { display: none; }
  .shell { padding: 0 14px; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .video-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
  .live-grid { grid-template-columns: 1fr; }
}
</style>
</head>
<body>

<nav class="topbar">
  <a class="brand" href="/">
    <span class="brand-dots"><span></span><span></span><span></span></span>
    RoadTV
  </a>
  <div class="nav-links">
    <a href="/" class="${activeNav === 'browse' ? 'active' : ''}">Browse</a>
    <a href="/live" class="${activeNav === 'live' ? 'active' : ''}">Live</a>
    <a href="/trending" class="${activeNav === 'trending' ? 'active' : ''}">Trending</a>
    <a href="/playlists" class="${activeNav === 'playlists' ? 'active' : ''}">Playlists</a>
  </div>
  <div class="search-box">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="#666" stroke-width="1.5"/><path d="M11 11l4 4" stroke="#666" stroke-width="1.5" stroke-linecap="round"/></svg>
    <input type="text" placeholder="Search videos..." id="global-search" onkeydown="if(event.key==='Enter')window.location='/search?q='+encodeURIComponent(this.value)">
  </div>
</nav>

<div class="shell">
  <div class="page">
    ${body}
  </div>
  <footer>
    <span>RoadTV v3.0 — part of BlackRoad OS</span>
    <span>Remember the Road. Pave Tomorrow.</span>
  </footer>
</div>

</body>
</html>`;
}

// ── Category colors ──
function catColor(cat) {
  const map = { tutorial: BRAND.blue, demo: BRAND.pink, build: BRAND.amber, explainer: BRAND.violet, experiment: BRAND.pink, agent: BRAND.violet, live: BRAND.pink };
  return map[cat] || BRAND.muted;
}

function fmtDuration(secs) {
  if (!secs) return '';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function escapeHtml(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Browse / Home page ──
function renderBrowsePage(videos, categories, trending) {
  const catPills = (categories || []).map(c =>
    `<button class="cat-pill" onclick="window.location='/?category=${encodeURIComponent(c.category)}'">${escapeHtml(c.category)} <span style="color:var(--dim);margin-left:4px">${c.count}</span></button>`
  ).join('');

  const trendingCards = (trending || []).slice(0, 4).map(v => videoCard(v)).join('');
  const allCards = (videos || []).map(v => videoCard(v)).join('');

  const emptyState = !videos?.length ? `
    <div class="empty-state">
      <div class="dots">
        <span style="background:var(--pink)"></span>
        <span style="background:var(--amber)"></span>
        <span style="background:var(--blue)"></span>
      </div>
      <h3>No videos yet</h3>
      <p>RoadTV is ready. Upload videos via the API or watch live agent streams.</p>
    </div>` : '';

  return htmlShell('Browse', `
    <div class="stats-row">
      <div class="stat-box"><div class="stat-value">${videos?.length || 0}</div><div class="stat-label">Videos</div></div>
      <div class="stat-box"><div class="stat-value">${Object.keys(AGENTS).length}</div><div class="stat-label">Agents Online</div></div>
      <div class="stat-box"><div class="stat-value">${categories?.length || 0}</div><div class="stat-label">Categories</div></div>
      <div class="stat-box"><div class="stat-value">${trending?.length || 0}</div><div class="stat-label">Trending</div></div>
    </div>

    ${categories?.length ? `
    <div class="section-label">Categories</div>
    <div class="cat-bar">
      <button class="cat-pill active" onclick="window.location='/'">All</button>
      ${catPills}
    </div>` : ''}

    ${trending?.length ? `
    <div class="section-row">
      <div class="section-label" style="margin-bottom:0">Trending this week</div>
      <a href="/trending" style="font-size:12px;color:var(--dim)">View all</a>
    </div>
    <div class="video-grid" style="margin-bottom:40px">${trendingCards}</div>
    ` : ''}

    ${videos?.length ? `
    <div class="section-label">All videos</div>
    <div class="video-grid">${allCards}</div>
    ` : emptyState}

    <div style="margin-top:48px">
      <div class="section-label">Live agent streams</div>
      <p style="color:var(--muted);font-size:15px;margin-bottom:16px;line-height:1.7;">Watch ${Object.keys(AGENTS).length} AI agents think in real-time. Each agent streams their thoughts character by character.</p>
      <a href="/live" style="display:inline-block;padding:10px 22px;border:1px solid var(--border);border-radius:8px;font-size:13px;font-weight:600;color:var(--text);transition:all 0.15s;">Go to Live Streams</a>
    </div>
  `, 'browse');
}

function videoCard(v) {
  return `
    <div class="video-card" onclick="window.location='/watch/${encodeURIComponent(v.id)}'">
      <div class="video-thumb">
        <span class="cat-dot" style="background:${catColor(v.category)}"></span>
        <div class="play-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polygon points="6,3 18,10 6,17" fill="white"/></svg>
        </div>
        ${v.duration ? `<span class="duration">${typeof v.duration === 'number' ? fmtDuration(v.duration) : v.duration}</span>` : ''}
      </div>
      <div class="video-info">
        <h3>${escapeHtml(v.title)}</h3>
        <div class="meta">${escapeHtml(v.author)}${v.category ? ' · ' + escapeHtml(v.category) : ''}${v.view_count ? ' · ' + v.view_count + ' views' : ''}</div>
      </div>
    </div>`;
}

// ── Watch / Video player page ──
function renderWatchPage(video, comments, notes) {
  if (!video) {
    return htmlShell('Not Found', `
      <div class="empty-state">
        <h3>Video not found</h3>
        <p>This video may have been removed or is not yet published.</p>
        <a href="/" style="display:inline-block;margin-top:16px;padding:10px 22px;border:1px solid var(--border);border-radius:8px;font-size:13px;color:var(--text);">Back to Browse</a>
      </div>
    `);
  }

  const commentList = (comments || []).map(c => `
    <div class="comment">
      <div class="comment-author">${escapeHtml(c.author)}${c.handle ? ' @' + escapeHtml(c.handle) : ''}</div>
      <div class="comment-text">${escapeHtml(c.content)}</div>
      <div class="comment-time">${c.created_at || ''}</div>
    </div>
  `).join('');

  const notesList = (notes || []).map(n => `
    <div class="comment">
      <div class="comment-author">${escapeHtml(n.author)}</div>
      <div class="comment-text">${escapeHtml(n.content)}</div>
      <div class="comment-time">${n.created_at || ''}</div>
    </div>
  `).join('');

  return htmlShell(escapeHtml(video.title), `
    <div class="player-container" id="player">
      ${video.r2_key
        ? `<video controls autoplay><source src="/api/videos/${encodeURIComponent(video.id)}/stream" type="video/mp4">Your browser does not support video.</video>`
        : `<div style="color:var(--dim);text-align:center;padding:40px;"><div class="brand-dots" style="display:flex;gap:6px;justify-content:center;margin-bottom:16px"><span style="width:10px;height:10px;border-radius:50%;background:var(--pink)"></span><span style="width:10px;height:10px;border-radius:50%;background:var(--amber)"></span><span style="width:10px;height:10px;border-radius:50%;background:var(--blue)"></span></div>Video file not yet uploaded</div>`
      }
    </div>

    <h1 class="video-detail-title">${escapeHtml(video.title)}</h1>
    <div class="video-detail-meta">
      ${escapeHtml(video.author)}${video.category ? ' · ' + escapeHtml(video.category) : ''} · ${video.view_count || 0} views · ${video.created_at || ''}
      ${video.tags ? '<br>Tags: ' + escapeHtml(video.tags) : ''}
    </div>

    ${video.description ? `<div class="video-description">${escapeHtml(video.description)}</div>` : ''}

    <div class="comments-section">
      <div class="section-label">Comments</div>
      <div class="comment-form">
        <input type="text" id="comment-author" placeholder="Name" style="max-width:140px">
        <input type="text" id="comment-text" placeholder="Write a comment...">
        <button onclick="postComment('${escapeHtml(video.id)}')">Post</button>
      </div>
      <div id="comments-list">${commentList || '<p style="color:var(--dim);font-size:13px">No comments yet.</p>'}</div>
    </div>

    ${notes?.length ? `
    <div style="margin-top:32px">
      <div class="section-label">Notes</div>
      ${notesList}
    </div>` : ''}

    <script>
    async function postComment(videoId) {
      const author = document.getElementById('comment-author').value || 'Anonymous';
      const content = document.getElementById('comment-text').value;
      if (!content) return;
      const res = await fetch('/api/videos/' + videoId + '/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, content }),
      });
      if (res.ok) window.location.reload();
    }
    </script>
  `);
}

// ── Live agent streams page ──
function renderLivePage() {
  const agentTiles = Object.entries(AGENTS).map(([id, a]) => `
    <div class="stream-tile" id="tile-${id}" style="--accent-color:${a.color}">
      <div class="stream-header">
        <span class="stream-dot" style="background:${a.color}"></span>
        <span class="stream-name">${a.name}</span>
        <span class="stream-role">${a.role}</span>
        <span class="stream-status" id="status-${id}">idle</span>
      </div>
      <div class="stream-screen" id="screen-${id}" onclick="wakeAgent('${id}')">
        <div class="placeholder">Click to wake ${a.name}</div>
      </div>
      <div class="stream-stats" id="stats-${id}"></div>
    </div>
  `).join('');

  return htmlShell('Live Streams', `
    <div class="section-label">Agent Live Streams</div>
    <h2 class="section-title">Watch agents think in real-time</h2>
    <p style="color:var(--muted);font-size:15px;line-height:1.7;margin-bottom:24px;max-width:640px">
      Each agent has a domain of expertise. Click a tile to wake them and watch their thoughts stream character by character. Or wake them all at once.
    </p>

    <div class="live-controls">
      <button class="primary" onclick="wakeAll()">Wake All Agents</button>
      <button onclick="stopAll()">Stop All</button>
      <span style="font-family:var(--mono);font-size:11px;color:var(--dim);margin-left:auto" id="live-count">0 / ${Object.keys(AGENTS).length} streaming</span>
      <div class="grid-select">
        <button onclick="setGrid(2)" class="active">2 col</button>
        <button onclick="setGrid(3)">3 col</button>
        <button onclick="setGrid(4)">4 col</button>
      </div>
    </div>

    <div class="live-grid" id="live-grid" style="grid-template-columns:repeat(2,1fr)">
      ${agentTiles}
    </div>

    <script>
    const agents = ${JSON.stringify(AGENTS)};
    const autoPrompts = ${JSON.stringify(AUTO_PROMPTS)};
    const streams = {};
    let activeCount = 0;

    function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    function setGrid(cols) {
      document.getElementById('live-grid').style.gridTemplateColumns = 'repeat('+cols+',1fr)';
      document.querySelectorAll('.grid-select button').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
    }

    function updateCount() {
      document.getElementById('live-count').textContent = activeCount + ' / ' + Object.keys(agents).length + ' streaming';
    }

    function wakeAgent(id) {
      if (streams[id]) return;
      const prompt = autoPrompts[id] || 'What are you thinking about right now?';
      const screen = document.getElementById('screen-' + id);
      const status = document.getElementById('status-' + id);
      const statsEl = document.getElementById('stats-' + id);
      const tile = document.getElementById('tile-' + id);

      screen.innerHTML = '<span class="stream-cursor"></span>';
      status.textContent = 'connecting';
      status.className = 'stream-status';
      tile.classList.add('streaming');

      const es = new EventSource('/api/stream?agent=' + id + '&prompt=' + encodeURIComponent(prompt));
      streams[id] = es;
      activeCount++;
      updateCount();

      let fullText = '';

      es.onmessage = (e) => {
        const d = JSON.parse(e.data);
        if (d.type === 'frame') {
          fullText = d.text;
          screen.innerHTML = escHtml(fullText) + '<span class="stream-cursor"></span>';
          status.textContent = 'live';
          status.className = 'stream-status live';
          const cps = d.index / Math.max(d.elapsed, 0.001);
          statsEl.textContent = d.index + ' chars · ' + cps.toFixed(0) + ' c/s · ' + d.elapsed.toFixed(1) + 's';
        }
        if (d.type === 'done') {
          fullText = d.text;
          screen.innerHTML = escHtml(fullText);
          status.textContent = 'done';
          status.className = 'stream-status done';
          statsEl.textContent = d.index + ' chars · ' + d.elapsed.toFixed(1) + 's · complete';
          tile.classList.remove('streaming');
          es.close();
          delete streams[id];
          activeCount--;
          updateCount();
        }
        if (d.type === 'error') {
          screen.innerHTML = '<span style="color:var(--muted)">Stream ended: ' + escHtml(d.error || 'unknown') + '</span>';
          status.textContent = 'error';
          status.className = 'stream-status';
          es.close();
          delete streams[id];
          activeCount--;
          updateCount();
        }
      };

      es.onerror = () => {
        status.textContent = 'offline';
        status.className = 'stream-status';
        tile.classList.remove('streaming');
        es.close();
        delete streams[id];
        activeCount--;
        updateCount();
      };
    }

    function wakeAll() {
      Object.keys(agents).forEach(id => wakeAgent(id));
    }

    function stopAll() {
      Object.keys(streams).forEach(id => {
        streams[id].close();
        delete streams[id];
        const status = document.getElementById('status-' + id);
        const tile = document.getElementById('tile-' + id);
        if (status) { status.textContent = 'stopped'; status.className = 'stream-status'; }
        if (tile) tile.classList.remove('streaming');
      });
      activeCount = 0;
      updateCount();
    }
    </script>
  `, 'live');
}

// ── Trending page ──
function renderTrendingPage(trending) {
  const cards = (trending || []).map(v => videoCard(v)).join('');
  return htmlShell('Trending', `
    <div class="section-label">Trending</div>
    <h2 class="section-title">Most watched this week</h2>
    ${cards ? `<div class="video-grid">${cards}</div>` : `
    <div class="empty-state">
      <div class="dots"><span style="background:var(--pink)"></span><span style="background:var(--amber)"></span><span style="background:var(--blue)"></span></div>
      <h3>No trending videos yet</h3>
      <p>Upload and watch videos to see what is trending.</p>
    </div>`}
  `, 'trending');
}

// ── Search results page ──
function renderSearchPage(query, results) {
  const cards = (results || []).map(v => videoCard(v)).join('');
  return htmlShell('Search: ' + escapeHtml(query), `
    <div class="section-label">Search Results</div>
    <h2 class="section-title">Results for "${escapeHtml(query)}"</h2>
    ${cards ? `<div class="video-grid">${cards}</div>` :
    `<div class="empty-state"><h3>No results</h3><p>Try a different search term.</p></div>`}
  `);
}

// ── Playlists page ──
function renderPlaylistsPage(playlists) {
  const cards = (playlists || []).map(p => `
    <div class="playlist-card" onclick="window.location='/playlists/${encodeURIComponent(p.id)}'">
      <div style="display:flex;gap:6px;margin-bottom:10px">
        <span style="width:8px;height:8px;border-radius:50%;background:var(--violet)"></span>
        <span style="width:8px;height:8px;border-radius:50%;background:var(--blue)"></span>
      </div>
      <h3>${escapeHtml(p.name)}</h3>
      <div class="pl-meta">${escapeHtml(p.author)} · ${p.created_at || ''}</div>
      ${p.description ? `<p style="color:var(--muted);font-size:13px;margin-top:8px;line-height:1.5">${escapeHtml(p.description)}</p>` : ''}
    </div>
  `).join('');

  return htmlShell('Playlists', `
    <div class="section-label">Playlists</div>
    <h2 class="section-title">Curated collections</h2>
    ${cards ? `<div class="playlist-list">${cards}</div>` : `
    <div class="empty-state">
      <div class="dots"><span style="background:var(--pink)"></span><span style="background:var(--amber)"></span><span style="background:var(--blue)"></span></div>
      <h3>No playlists yet</h3>
      <p>Create playlists via the API to organize videos into collections.</p>
    </div>`}
  `, 'playlists');
}

// ── Playlist detail page ──
function renderPlaylistDetailPage(playlist, videos) {
  if (!playlist) {
    return htmlShell('Not Found', `<div class="empty-state"><h3>Playlist not found</h3></div>`);
  }
  const cards = (videos || []).map(v => videoCard(v)).join('');
  return htmlShell(escapeHtml(playlist.name), `
    <div class="section-label">Playlist</div>
    <h2 class="section-title">${escapeHtml(playlist.name)}</h2>
    <p style="color:var(--muted);font-size:14px;margin-bottom:24px">${escapeHtml(playlist.description || '')} · by ${escapeHtml(playlist.author)}</p>
    ${cards ? `<div class="video-grid">${cards}</div>` : `<div class="empty-state"><h3>Empty playlist</h3><p>Add videos via the API.</p></div>`}
  `, 'playlists');
}

// ══════════════════════════════════════════════════════════════
// MAIN ROUTER
// ══════════════════════════════════════════════════════════════

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    await initDB(env.DB);

    // ════════════════════════════════════════════════
    // API ROUTES (prefixed with /api)
    // ════════════════════════════════════════════════

    // SSE agent stream
    if (request.method === 'GET' && path === '/api/stream') {
      const agentId = url.searchParams.get('agent') || 'road';
      const prompt = url.searchParams.get('prompt') || AUTO_PROMPTS[agentId] || 'What are you thinking about?';
      return streamAgent(request, env, agentId, prompt);
    }

    // Search videos (API)
    if (request.method === 'GET' && path === '/api/videos/search') {
      const q = url.searchParams.get('q');
      if (!q) return json({ error: 'q param required' }, 400);
      const term = `%${q}%`;
      const { results } = await env.DB.prepare("SELECT * FROM videos WHERE status = 'published' AND (title LIKE ? OR description LIKE ? OR author LIKE ? OR tags LIKE ?) ORDER BY created_at DESC LIMIT 50").bind(term, term, term, term).all();
      return json({ query: q, videos: results || [] });
    }

    // Categories (API)
    if (request.method === 'GET' && path === '/api/categories') {
      const { results } = await env.DB.prepare("SELECT category, COUNT(*) as count FROM videos WHERE status = 'published' AND category IS NOT NULL GROUP BY category ORDER BY count DESC").all();
      return json({ categories: results || [] });
    }

    // Trending (API)
    if (request.method === 'GET' && path === '/api/trending') {
      const { results } = await env.DB.prepare("SELECT v.*, COUNT(vw.id) as recent_views FROM videos v LEFT JOIN video_views vw ON v.id = vw.video_id AND vw.viewed_at > datetime('now', '-7 days') WHERE v.status = 'published' GROUP BY v.id ORDER BY recent_views DESC LIMIT 10").all();
      return json({ trending: results || [] });
    }

    // List videos (API)
    if (request.method === 'GET' && path === '/api/videos') {
      const category = url.searchParams.get('category');
      const status = url.searchParams.get('status') || 'published';
      const limit = parseInt(url.searchParams.get('limit') || '50', 10);
      let query = 'SELECT * FROM videos WHERE status = ?';
      const params = [status];
      if (category) { query += ' AND category = ?'; params.push(category); }
      query += ' ORDER BY created_at DESC LIMIT ?';
      params.push(limit);
      const { results } = await env.DB.prepare(query).bind(...params).all();
      return json({ videos: results || [] });
    }

    // Create video (API)
    if (request.method === 'POST' && path === '/api/videos') {
      const body = await request.json();
      if (!body.id || !body.title || !body.author) return json({ error: 'id, title, author required' }, 400);
      await env.DB.prepare('INSERT INTO videos (id, title, description, author, duration, category, tags, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(body.id, body.title, body.description || null, body.author, body.duration || null, body.category || null, body.tags || null, body.status || 'draft').run();
      return json({ ok: true, id: body.id }, 201);
    }

    // Video stats (API)
    const statsMatch = path.match(/^\/api\/videos\/([^/]+)\/stats$/);
    if (request.method === 'GET' && statsMatch) {
      const id = decodeURIComponent(statsMatch[1]);
      const views = await env.DB.prepare('SELECT COUNT(*) as total, COUNT(DISTINCT viewer_ip) as unique_viewers FROM video_views WHERE video_id = ?').bind(id).first();
      const last = await env.DB.prepare('SELECT viewed_at FROM video_views WHERE video_id = ? ORDER BY viewed_at DESC LIMIT 1').bind(id).first();
      return json({ video_id: id, total_views: views?.total || 0, unique_viewers: views?.unique_viewers || 0, last_viewed: last?.viewed_at || null });
    }

    // Comments (API)
    const commentsMatch = path.match(/^\/api\/videos\/([^/]+)\/comments$/);
    if (commentsMatch && request.method === 'POST') {
      const videoId = decodeURIComponent(commentsMatch[1]);
      const body = await request.json();
      if (!body.author || !body.content) return json({ error: 'author and content required' }, 400);
      const id = crypto.randomUUID().slice(0, 8);
      await env.DB.prepare('INSERT INTO video_comments (id, video_id, author, handle, content) VALUES (?, ?, ?, ?, ?)').bind(id, videoId, body.author, body.handle || null, body.content).run();
      return json({ ok: true, id }, 201);
    }
    if (commentsMatch && request.method === 'GET') {
      const videoId = decodeURIComponent(commentsMatch[1]);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const offset = (page - 1) * limit;
      const { results } = await env.DB.prepare('SELECT * FROM video_comments WHERE video_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?').bind(videoId, limit, offset).all();
      const count = await env.DB.prepare('SELECT COUNT(*) as n FROM video_comments WHERE video_id = ?').bind(videoId).first();
      return json({ comments: results || [], total: count?.n || 0, page, limit });
    }

    // Notes (API)
    const notesMatch = path.match(/^\/api\/videos\/([^/]+)\/notes$/);
    if (request.method === 'POST' && notesMatch) {
      const videoId = decodeURIComponent(notesMatch[1]);
      const body = await request.json();
      if (!body.author || !body.content) return json({ error: 'author and content required' }, 400);
      await env.DB.prepare('INSERT INTO video_notes (video_id, author, content) VALUES (?, ?, ?)').bind(videoId, body.author, body.content).run();
      return json({ ok: true }, 201);
    }

    // Status update (API)
    const statusMatch = path.match(/^\/api\/videos\/([^/]+)\/status$/);
    if (statusMatch && request.method === 'PUT') {
      const id = decodeURIComponent(statusMatch[1]);
      const body = await request.json();
      const valid = ['draft', 'processing', 'published', 'archived'];
      if (!valid.includes(body.status)) return json({ error: `Invalid status. Valid: ${valid.join(', ')}` }, 400);
      await env.DB.prepare("UPDATE videos SET status = ?, updated_at = datetime('now') WHERE id = ?").bind(body.status, id).run();
      return json({ ok: true, id, status: body.status });
    }

    // Thumbnail upload/get (API)
    const thumbMatch = path.match(/^\/api\/videos\/([^/]+)\/thumbnail$/);
    if (thumbMatch && request.method === 'PUT' && env.VIDEOS) {
      const id = decodeURIComponent(thumbMatch[1]);
      const contentType = request.headers.get('Content-Type') || 'image/png';
      const r2Key = `thumbnails/${id}`;
      await env.VIDEOS.put(r2Key, request.body, { httpMetadata: { contentType } });
      await env.DB.prepare("UPDATE videos SET thumbnail_key = ?, updated_at = datetime('now') WHERE id = ?").bind(r2Key, id).run();
      return json({ ok: true, thumbnail_key: r2Key });
    }
    if (thumbMatch && request.method === 'GET' && env.VIDEOS) {
      const id = decodeURIComponent(thumbMatch[1]);
      const video = await env.DB.prepare('SELECT thumbnail_key FROM videos WHERE id = ?').bind(id).first();
      if (!video?.thumbnail_key) return json({ error: 'No thumbnail' }, 404);
      const obj = await env.VIDEOS.get(video.thumbnail_key);
      if (!obj) return json({ error: 'File not found' }, 404);
      return new Response(obj.body, { headers: { 'Content-Type': obj.httpMetadata?.contentType || 'image/png', 'Cache-Control': 'public, max-age=86400', ...CORS } });
    }

    // Upload video (API)
    const uploadMatch = path.match(/^\/api\/videos\/([^/]+)\/upload$/);
    if (request.method === 'PUT' && uploadMatch && env.VIDEOS) {
      const id = decodeURIComponent(uploadMatch[1]);
      const contentType = request.headers.get('Content-Type') || 'video/mp4';
      const r2Key = `videos/${id}`;
      await env.VIDEOS.put(r2Key, request.body, { httpMetadata: { contentType } });
      await env.DB.prepare("UPDATE videos SET r2_key = ?, updated_at = datetime('now') WHERE id = ?").bind(r2Key, id).run();
      return json({ ok: true, r2_key: r2Key }, 201);
    }

    // Stream video file (API)
    const streamMatch = path.match(/^\/api\/videos\/([^/]+)\/stream$/);
    if (request.method === 'GET' && streamMatch && env.VIDEOS) {
      const id = decodeURIComponent(streamMatch[1]);
      const video = await env.DB.prepare('SELECT r2_key FROM videos WHERE id = ?').bind(id).first();
      if (!video?.r2_key) return json({ error: 'Video file not found' }, 404);
      const object = await env.VIDEOS.get(video.r2_key);
      if (!object) return json({ error: 'File not in storage' }, 404);
      if (ctx) {
        const ip = request.headers.get('cf-connecting-ip') || 'unknown';
        ctx.waitUntil(env.DB.prepare('INSERT INTO video_views (id, video_id, viewer_ip) VALUES (?, ?, ?)').bind(crypto.randomUUID().slice(0, 8), id, ip).run().catch(() => {}));
        ctx.waitUntil(env.DB.prepare('UPDATE videos SET view_count = view_count + 1 WHERE id = ?').bind(id).run().catch(() => {}));
      }
      return new Response(object.body, { headers: { 'Content-Type': object.httpMetadata?.contentType || 'video/mp4', 'Cache-Control': 'public, max-age=86400', ...CORS } });
    }

    // Single video (API)
    const videoApiMatch = path.match(/^\/api\/videos\/([^/]+)$/);
    if (request.method === 'GET' && videoApiMatch) {
      const id = decodeURIComponent(videoApiMatch[1]);
      const video = await env.DB.prepare('SELECT * FROM videos WHERE id = ?').bind(id).first();
      if (!video) return json({ error: 'Video not found' }, 404);
      const notes = (await env.DB.prepare('SELECT * FROM video_notes WHERE video_id = ? ORDER BY created_at DESC').bind(id).all()).results || [];
      return json({ video, notes });
    }

    // Playlists (API)
    if (path === '/api/playlists' && request.method === 'POST') {
      const body = await request.json();
      if (!body.name || !body.author) return json({ error: 'name and author required' }, 400);
      const id = crypto.randomUUID().slice(0, 8);
      await env.DB.prepare('INSERT INTO playlists (id, name, description, author) VALUES (?, ?, ?, ?)').bind(id, body.name, body.description || '', body.author).run();
      return json({ ok: true, id }, 201);
    }
    if (path === '/api/playlists' && request.method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM playlists ORDER BY created_at DESC').all();
      return json({ playlists: results || [] });
    }
    const playlistApiMatch = path.match(/^\/api\/playlists\/([^/]+)$/);
    if (playlistApiMatch && request.method === 'GET') {
      const id = decodeURIComponent(playlistApiMatch[1]);
      const playlist = await env.DB.prepare('SELECT * FROM playlists WHERE id = ?').bind(id).first();
      if (!playlist) return json({ error: 'Playlist not found' }, 404);
      const { results } = await env.DB.prepare('SELECT pv.position, v.* FROM playlist_videos pv JOIN videos v ON pv.video_id = v.id WHERE pv.playlist_id = ? ORDER BY pv.position').bind(id).all();
      return json({ playlist, videos: results || [] });
    }
    const playlistVideosApiMatch = path.match(/^\/api\/playlists\/([^/]+)\/videos$/);
    if (playlistVideosApiMatch && request.method === 'POST') {
      const id = decodeURIComponent(playlistVideosApiMatch[1]);
      const body = await request.json();
      if (!body.video_id) return json({ error: 'video_id required' }, 400);
      await env.DB.prepare('INSERT OR IGNORE INTO playlist_videos (playlist_id, video_id, position) VALUES (?, ?, ?)').bind(id, body.video_id, body.position || 0).run();
      return json({ ok: true });
    }
    const playlistVideoDeleteApiMatch = path.match(/^\/api\/playlists\/([^/]+)\/videos\/([^/]+)$/);
    if (playlistVideoDeleteApiMatch && request.method === 'DELETE') {
      await env.DB.prepare('DELETE FROM playlist_videos WHERE playlist_id = ? AND video_id = ?').bind(decodeURIComponent(playlistVideoDeleteApiMatch[1]), decodeURIComponent(playlistVideoDeleteApiMatch[2])).run();
      return json({ ok: true });
    }

    // Agents list (API)
    if (path === '/api/agents' && request.method === 'GET') {
      return json({ agents: AGENTS, prompts: AUTO_PROMPTS });
    }

    // Health (API)
    if (path === '/api/health' || path === '/health') {
      return json({ status: 'ok', service: 'blackroad-roadtv', version: '3.0.0', agents: Object.keys(AGENTS).length });
    }

    // ════════════════════════════════════════════════
    // HTML PAGES
    // ════════════════════════════════════════════════

    // Browse / Home
    if ((path === '/' || path === '') && request.method === 'GET') {
      const category = url.searchParams.get('category');
      let vQuery = "SELECT * FROM videos WHERE status = 'published'";
      const vParams = [];
      if (category) { vQuery += ' AND category = ?'; vParams.push(category); }
      vQuery += ' ORDER BY created_at DESC LIMIT 50';
      const videos = (await env.DB.prepare(vQuery).bind(...vParams).all()).results || [];
      const categories = (await env.DB.prepare("SELECT category, COUNT(*) as count FROM videos WHERE status = 'published' AND category IS NOT NULL GROUP BY category ORDER BY count DESC").all()).results || [];
      const trending = (await env.DB.prepare("SELECT v.*, COUNT(vw.id) as recent_views FROM videos v LEFT JOIN video_views vw ON v.id = vw.video_id AND vw.viewed_at > datetime('now', '-7 days') WHERE v.status = 'published' GROUP BY v.id ORDER BY recent_views DESC LIMIT 4").all()).results || [];
      return new Response(renderBrowsePage(videos, categories, trending), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // Live streams page
    if (path === '/live' && request.method === 'GET') {
      return new Response(renderLivePage(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // Trending page
    if (path === '/trending' && request.method === 'GET') {
      const trending = (await env.DB.prepare("SELECT v.*, COUNT(vw.id) as recent_views FROM videos v LEFT JOIN video_views vw ON v.id = vw.video_id AND vw.viewed_at > datetime('now', '-7 days') WHERE v.status = 'published' GROUP BY v.id ORDER BY recent_views DESC LIMIT 20").all()).results || [];
      return new Response(renderTrendingPage(trending), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // Search page
    if (path === '/search' && request.method === 'GET') {
      const q = url.searchParams.get('q') || '';
      let results = [];
      if (q) {
        const term = `%${q}%`;
        results = (await env.DB.prepare("SELECT * FROM videos WHERE status = 'published' AND (title LIKE ? OR description LIKE ? OR author LIKE ? OR tags LIKE ?) ORDER BY created_at DESC LIMIT 50").bind(term, term, term, term).all()).results || [];
      }
      return new Response(renderSearchPage(q, results), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // Playlists page
    if (path === '/playlists' && request.method === 'GET') {
      const playlists = (await env.DB.prepare('SELECT * FROM playlists ORDER BY created_at DESC').all()).results || [];
      return new Response(renderPlaylistsPage(playlists), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // Playlist detail page
    const playlistPageMatch = path.match(/^\/playlists\/([^/]+)$/);
    if (playlistPageMatch && request.method === 'GET') {
      const id = decodeURIComponent(playlistPageMatch[1]);
      const playlist = await env.DB.prepare('SELECT * FROM playlists WHERE id = ?').bind(id).first();
      let videos = [];
      if (playlist) {
        videos = (await env.DB.prepare('SELECT pv.position, v.* FROM playlist_videos pv JOIN videos v ON pv.video_id = v.id WHERE pv.playlist_id = ? ORDER BY pv.position').bind(id).all()).results || [];
      }
      return new Response(renderPlaylistDetailPage(playlist, videos), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // Watch video page
    const watchMatch = path.match(/^\/watch\/([^/]+)$/);
    if (watchMatch && request.method === 'GET') {
      const id = decodeURIComponent(watchMatch[1]);
      const video = await env.DB.prepare('SELECT * FROM videos WHERE id = ?').bind(id).first();
      let comments = [];
      let notes = [];
      if (video) {
        comments = (await env.DB.prepare('SELECT * FROM video_comments WHERE video_id = ? ORDER BY created_at DESC LIMIT 50').bind(id).all()).results || [];
        notes = (await env.DB.prepare('SELECT * FROM video_notes WHERE video_id = ? ORDER BY created_at DESC').bind(id).all()).results || [];
        // Track view
        if (ctx) {
          const ip = request.headers.get('cf-connecting-ip') || 'unknown';
          ctx.waitUntil(env.DB.prepare('INSERT INTO video_views (id, video_id, viewer_ip) VALUES (?, ?, ?)').bind(crypto.randomUUID().slice(0, 8), id, ip).run().catch(() => {}));
          ctx.waitUntil(env.DB.prepare('UPDATE videos SET view_count = view_count + 1 WHERE id = ?').bind(id).run().catch(() => {}));
        }
      }
      return new Response(renderWatchPage(video, comments, notes), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // ════════════════════════════════════════════════
    // LEGACY API ROUTES (without /api prefix, for backward compat)
    // ════════════════════════════════════════════════
    if (path === '/videos/search') { return Response.redirect(url.origin + '/api' + path + url.search, 301); }
    if (path === '/categories') { return Response.redirect(url.origin + '/api' + path, 301); }
    if (path.startsWith('/videos') && request.method !== 'GET') { return Response.redirect(url.origin + '/api' + path, 307); }
    if (path.startsWith('/playlists') && request.method !== 'GET') { return Response.redirect(url.origin + '/api' + path, 307); }

    // 404
    return new Response(htmlShell('Not Found', `
      <div class="empty-state">
        <div class="dots"><span style="background:var(--pink)"></span><span style="background:var(--amber)"></span><span style="background:var(--blue)"></span></div>
        <h3>Page not found</h3>
        <p>The page you are looking for does not exist.</p>
        <a href="/" style="display:inline-block;margin-top:16px;padding:10px 22px;border:1px solid var(--border);border-radius:8px;font-size:13px;color:var(--text);">Back to RoadTV</a>
      </div>
    `), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  },
};
