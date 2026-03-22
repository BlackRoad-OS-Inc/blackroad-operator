export default {
  async fetch(req) {
    const url = new URL(req.url);

    // Proxy API requests to Ollama
    if (url.pathname.startsWith('/api/')) {
      return new Response('Ollama API — use ai.blackroad.ai for direct access', { status: 503 });
    }

    return new Response(HTML, { headers: { 'Content-Type': 'text/html;charset=utf-8' } });
  }
};

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>BlackRoad AI — Sovereign Intelligence at the Edge</title>
<link rel="icon" href="https://images.blackroad.io/brand/favicon.png">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000;color:#fff;font-family:'Inter',system-ui,sans-serif;min-height:100vh;overflow-x:hidden}
nav{display:flex;align-items:center;gap:2rem;padding:1rem 2rem;border-bottom:1px solid #111;position:sticky;top:0;background:rgba(0,0,0,.95);backdrop-filter:blur(20px);z-index:100}
.logo{font-family:'Space Grotesk',sans-serif;font-weight:800;font-size:1.1rem;background:linear-gradient(135deg,#F5A623,#FF1D6C,#9C27B0,#2979FF);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
nav a{color:#888;text-decoration:none;font-size:.85rem;transition:color .2s}nav a:hover{color:#fff}
.hero{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:70vh;text-align:center;padding:4rem 2rem;position:relative}
.hero::before{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:600px;height:600px;background:radial-gradient(circle,rgba(41,121,255,.08),transparent 70%);pointer-events:none}
.badge{display:inline-flex;align-items:center;gap:.5rem;background:#0f2010;color:#4ade80;font-size:.8rem;padding:.3rem .8rem;border-radius:20px;margin-bottom:1.5rem;font-family:'JetBrains Mono',monospace}
.badge::before{content:'';width:7px;height:7px;background:#4ade80;border-radius:50%;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
h1{font-family:'Space Grotesk',sans-serif;font-size:clamp(3rem,7vw,5.5rem);font-weight:800;background:linear-gradient(135deg,#F5A623 0%,#FF1D6C 38.2%,#9C27B0 61.8%,#2979FF 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:1rem;line-height:1.1}
.sub{color:#888;font-size:1.25rem;max-width:600px;line-height:1.6;margin-bottom:2.5rem}
.stats-row{display:flex;gap:3rem;flex-wrap:wrap;justify-content:center;margin-bottom:3rem}
.stat{text-align:center}.stat .val{font-family:'Space Grotesk',sans-serif;font-size:2.8rem;font-weight:800;color:#4ade80}.stat .lbl{font-size:.75rem;color:#555;text-transform:uppercase;letter-spacing:.12em;margin-top:.25rem}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;max-width:1100px;margin:0 auto 4rem;padding:0 2rem}
.card{background:#0a0a0a;border:1px solid #1a1a1a;border-radius:16px;padding:2rem;transition:border-color .3s,transform .2s}
.card:hover{border-color:#333;transform:translateY(-2px)}
.card h3{font-family:'Space Grotesk',sans-serif;font-size:1.2rem;font-weight:700;margin-bottom:.75rem;color:#fff}
.card .icon{font-size:2rem;margin-bottom:1rem;display:block}
.card p{color:#888;font-size:.9rem;line-height:1.6}
.card .tag{display:inline-block;background:#111;color:#4ade80;font-family:'JetBrains Mono',monospace;font-size:.7rem;padding:.2rem .5rem;border-radius:6px;margin-top:.75rem}
.section{max-width:900px;margin:0 auto 4rem;padding:0 2rem}
.section h2{font-family:'Space Grotesk',sans-serif;font-size:2rem;font-weight:700;margin-bottom:1.5rem;background:linear-gradient(135deg,#F5A623,#FF1D6C);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.endpoint{background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:1.25rem;margin-bottom:1rem;display:flex;align-items:flex-start;gap:1rem}
.method{font-family:'JetBrains Mono',monospace;font-size:.75rem;font-weight:700;padding:.25rem .5rem;border-radius:6px;min-width:50px;text-align:center}
.get{background:#0f2010;color:#4ade80}.post{background:#1a1020;color:#c084fc}
.endpoint .path{font-family:'JetBrains Mono',monospace;color:#fff;font-size:.9rem}.endpoint .desc{color:#666;font-size:.8rem;margin-top:.25rem}
.models{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem;margin-top:1.5rem}
.model{background:#0a0a0a;border:1px solid #1a1a1a;border-radius:10px;padding:1rem}
.model .name{font-family:'JetBrains Mono',monospace;color:#fff;font-size:.85rem;font-weight:500}.model .size{color:#555;font-size:.75rem;margin-top:.25rem}
.arch{font-family:'JetBrains Mono',monospace;background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:2rem;color:#4ade80;font-size:.8rem;line-height:1.8;overflow-x:auto;white-space:pre;margin-top:1.5rem}
footer{text-align:center;padding:3rem 2rem;color:#333;font-size:.8rem;border-top:1px solid #111}
footer a{color:#555;text-decoration:none;margin:0 .75rem}footer a:hover{color:#fff}
.tagline{font-family:'Space Grotesk',sans-serif;color:#555;font-size:.85rem;margin-top:.75rem}
</style>
</head>
<body>
<nav>
  <div class="logo">BlackRoad AI</div>
  <a href="https://blackroad.io">Home</a>
  <a href="https://mesh.blackroad.io">Network</a>
  <a href="https://search.blackroad.io">Search</a>
  <a href="https://prism.blackroad.io">Console</a>
  <a href="https://github.com/BlackRoad-OS-Inc">GitHub</a>
</nav>

<div class="hero">
  <div class="badge">52 TOPS &bull; 5 Nodes &bull; 11 Models</div>
  <h1>BlackRoad AI</h1>
  <p class="sub">Sovereign intelligence at the edge. Local-first AI inference across a Raspberry Pi fleet with 2x Hailo-8 NPUs. No cloud dependency. No token limits. Your models, your hardware, your data.</p>
  <div class="stats-row">
    <div class="stat"><div class="val">52</div><div class="lbl">TOPS Compute</div></div>
    <div class="stat"><div class="val">11</div><div class="lbl">Models Loaded</div></div>
    <div class="stat"><div class="val">5</div><div class="lbl">Fleet Nodes</div></div>
    <div class="stat"><div class="val">50</div><div class="lbl">AI Skills</div></div>
  </div>
</div>

<div class="cards">
  <div class="card">
    <span class="icon">&#x1F9E0;</span>
    <h3>Ollama Fleet</h3>
    <p>11 language models running across Octavia and Cecilia. Llama 3.1, Mistral, CodeLlama, Phi-3, Gemma, Nomic embeddings. Automatic load balancing across nodes.</p>
    <span class="tag">ollama:11434</span>
  </div>
  <div class="card">
    <span class="icon">&#x26A1;</span>
    <h3>AI Gateway</h3>
    <p>Tokenless API gateway routes requests to the fastest available model. OpenAI-compatible endpoints. No API keys required for BlackRoad OS users. Rate-limited at the edge.</p>
    <span class="tag">gateway.blackroad.io</span>
  </div>
  <div class="card">
    <span class="icon">&#x1F4A0;</span>
    <h3>Hailo-8 NPU</h3>
    <p>2x Hailo-8 neural processing units delivering 52 TOPS of dedicated AI compute. Hardware acceleration for vision, classification, and real-time inference at the edge.</p>
    <span class="tag">26 TOPS &times; 2</span>
  </div>
  <div class="card">
    <span class="icon">&#x1F3AF;</span>
    <h3>50 AI Skills</h3>
    <p>Pre-built reasoning modules across 6 domains: physics, mathematics, chemistry, architecture, biology, and language. Each skill chains multiple models for deep analysis.</p>
    <span class="tag">lucidia-core</span>
  </div>
  <div class="card">
    <span class="icon">&#x1F50D;</span>
    <h3>RAG Pipeline</h3>
    <p>Qdrant vector database on Alice with nomic-embed-text embeddings. 156K indexed entries. Retrieval-augmented generation with academic citations and moral context layer.</p>
    <span class="tag">qdrant:6333</span>
  </div>
  <div class="card">
    <span class="icon">&#x1F916;</span>
    <h3>BlackRoad LLM</h3>
    <p>Custom 13M parameter transformer trained on the BlackRoad corpus (5.8MB, 488K tokens). Word-level tokenizer, 6 transformer layers, trained in 2.9 minutes on Apple MPS.</p>
    <span class="tag">v4 &mdash; 2026-03-16</span>
  </div>
</div>

<div class="section">
  <h2>Fleet Architecture</h2>
  <div class="arch">
┌─────────────────────────────────────────────────────────────┐
│  BlackRoad AI Fleet — Sovereign Inference Network           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │  Alice    │    │ Cecilia  │    │ Octavia  │              │
│  │ .49      │    │ .96      │    │ .101     │              │
│  │ Gateway  │    │ 16 Models│    │ 11 Models│              │
│  │ Qdrant   │    │ Hailo-8  │    │ Hailo-8  │              │
│  │ Postgres │    │ Embedder │    │ Gitea    │              │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘              │
│       │               │               │                    │
│       └───────────────┼───────────────┘                    │
│                       │                                     │
│              ┌────────┴────────┐                            │
│              │  WireGuard Mesh │                            │
│              │   10.8.0.x     │                            │
│              └────────┬────────┘                            │
│                       │                                     │
│  ┌──────────┐    ┌────┴─────┐                              │
│  │ Lucidia  │    │   Aria   │                              │
│  │ .38      │    │  .98     │                              │
│  │ 334 Apps │    │  Offline │                              │
│  │ Actions  │    │          │                              │
│  └──────────┘    └──────────┘                              │
│                                                             │
│  Total: 52 TOPS │ 27 Models │ 228 SQLite DBs              │
└─────────────────────────────────────────────────────────────┘</div>
</div>

<div class="section">
  <h2>API Endpoints</h2>
  <div class="endpoint"><span class="method get">GET</span><div><div class="path">/api/tags</div><div class="desc">List all available models and their metadata</div></div></div>
  <div class="endpoint"><span class="method post">POST</span><div><div class="path">/api/generate</div><div class="desc">Generate a completion from a model. Body: { model, prompt, stream }</div></div></div>
  <div class="endpoint"><span class="method post">POST</span><div><div class="path">/api/chat</div><div class="desc">Chat with a model. Body: { model, messages, stream }</div></div></div>
  <div class="endpoint"><span class="method post">POST</span><div><div class="path">/api/embeddings</div><div class="desc">Generate embeddings. Body: { model: "nomic-embed-text", prompt }</div></div></div>
  <div class="endpoint"><span class="method get">GET</span><div><div class="path">/api/ps</div><div class="desc">List models currently loaded in memory</div></div></div>
  <div class="endpoint"><span class="method get">GET</span><div><div class="path">/health</div><div class="desc">Health check — returns fleet node status</div></div></div>
</div>

<div class="section">
  <h2>Available Models</h2>
  <div class="models">
    <div class="model"><div class="name">llama3.1:8b</div><div class="size">4.7 GB &bull; Meta</div></div>
    <div class="model"><div class="name">mistral:7b</div><div class="size">4.1 GB &bull; Mistral AI</div></div>
    <div class="model"><div class="name">codellama:7b</div><div class="size">3.8 GB &bull; Meta</div></div>
    <div class="model"><div class="name">phi3:mini</div><div class="size">2.3 GB &bull; Microsoft</div></div>
    <div class="model"><div class="name">gemma:2b</div><div class="size">1.4 GB &bull; Google</div></div>
    <div class="model"><div class="name">nomic-embed-text</div><div class="size">274 MB &bull; Nomic</div></div>
    <div class="model"><div class="name">qwen2:1.5b</div><div class="size">934 MB &bull; Alibaba</div></div>
    <div class="model"><div class="name">tinyllama:1.1b</div><div class="size">637 MB &bull; TinyLlama</div></div>
    <div class="model"><div class="name">deepseek-r1:1.5b</div><div class="size">1.1 GB &bull; DeepSeek</div></div>
    <div class="model"><div class="name">starcoder2:3b</div><div class="size">1.7 GB &bull; BigCode</div></div>
    <div class="model"><div class="name">blackroad-llm:v4</div><div class="size">50 MB &bull; BlackRoad</div></div>
  </div>
</div>

<footer>
  <a href="https://blackroad.io">Home</a>
  <a href="https://ai.blackroad.io">AI</a>
  <a href="https://mesh.blackroad.io">Network</a>
  <a href="https://search.blackroad.io">Search</a>
  <a href="https://pay.blackroad.io">Pricing</a>
  <a href="https://github.com/BlackRoad-OS-Inc">GitHub</a>
  <div class="tagline">BlackRoad OS &mdash; Pave Tomorrow.</div>
</footer>
<script src="https://bb.blackroad.io/bb.js" defer></script>
</body>
</html>`;
