export default {
  async fetch(req) {
    return new Response(HTML, { headers: { 'Content-Type': 'text/html;charset=utf-8' } });
  }
};
const HTML = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>AI Chain — Distributed LLM Inference</title>
<link rel="icon" href="https://images.blackroad.io/brand/favicon.png">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#fff;font-family:Inter,system-ui,sans-serif;min-height:100vh}nav{display:flex;align-items:center;gap:2rem;padding:1rem 2rem;border-bottom:1px solid #111;position:sticky;top:0;background:rgba(0,0,0,.95);backdrop-filter:blur(20px);z-index:100}.logo{font-family:Space Grotesk,sans-serif;font-weight:800;font-size:1.1rem;background:linear-gradient(135deg,#F5A623,#FF1D6C,#9C27B0,#2979FF);-webkit-background-clip:text;-webkit-text-fill-color:transparent}nav a{color:#888;text-decoration:none;font-size:.85rem}nav a:hover{color:#fff}.hero{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:65vh;text-align:center;padding:4rem 2rem}.badge{display:inline-flex;align-items:center;gap:.5rem;background:#0f2010;color:#4ade80;font-size:.8rem;padding:.3rem .8rem;border-radius:20px;margin-bottom:1.5rem;font-family:JetBrains Mono,monospace}.badge::before{content:"";width:7px;height:7px;background:#4ade80;border-radius:50%;animation:p 2s infinite}@keyframes p{0%,100%{opacity:1}50%{opacity:.3}}h1{font-family:Space Grotesk,sans-serif;font-size:clamp(3rem,7vw,5rem);font-weight:800;background:linear-gradient(135deg,#F5A623 0%,#FF1D6C 38.2%,#9C27B0 61.8%,#2979FF 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:1rem}.sub{color:#888;font-size:1.2rem;max-width:600px;line-height:1.6;margin-bottom:2rem}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem;max-width:1000px;margin:0 auto 4rem;padding:0 2rem}.card{background:#0a0a0a;border:1px solid #1a1a1a;border-radius:16px;padding:2rem;transition:border-color .3s}.card:hover{border-color:#333}.card h3{font-family:Space Grotesk,sans-serif;font-size:1.1rem;margin-bottom:.5rem}.card p{color:#888;font-size:.9rem;line-height:1.6}.arch{font-family:JetBrains Mono,monospace;background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:2rem;color:#4ade80;font-size:.75rem;line-height:1.8;overflow-x:auto;white-space:pre;max-width:900px;margin:2rem auto 4rem;text-align:left}.section{max-width:900px;margin:0 auto 4rem;padding:0 2rem}.section h2{font-family:Space Grotesk,sans-serif;font-size:2rem;font-weight:700;margin-bottom:1.5rem;background:linear-gradient(135deg,#F5A623,#FF1D6C);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.nodes{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-top:1.5rem}.node{background:#0a0a0a;border:1px solid #1a1a1a;border-radius:10px;padding:1.25rem;text-align:center}.node .name{font-family:JetBrains Mono,monospace;font-weight:700;font-size:1rem}.node .ip{color:#555;font-size:.75rem;margin-top:.25rem}.node .role{color:#4ade80;font-size:.8rem;margin-top:.5rem}.online{border-left:3px solid #4ade80}.offline{border-left:3px solid #ef4444;opacity:.5}footer{text-align:center;padding:3rem 2rem;color:#333;font-size:.8rem;border-top:1px solid #111}footer a{color:#555;text-decoration:none;margin:0 .75rem}footer a:hover{color:#fff}.tl{font-family:Space Grotesk,sans-serif;color:#555;font-size:.85rem;margin-top:.75rem}</style></head><body>
<nav><div class="logo">AI Chain</div><a href="https://blackroad.io">Home</a><a href="https://ai.blackroad.io">AI</a><a href="https://mesh.blackroad.io">Network</a><a href="https://search.blackroad.io">Search</a><a href="https://github.com/BlackRoad-OS-Inc/ai-chain">GitHub</a></nav>
<div class="hero"><div class="badge">Distributed Inference &bull; Auto-Failover</div><h1>AI Chain</h1><p class="sub">Chain Ollama models across Raspberry Pi fleet for load-balanced AI at the edge. Automatic failover, model sharding, and distributed inference — no single point of failure.</p></div>
<div class="arch">
┌─────────────────────────────────────────────────────────────────┐
│                    AI CHAIN — Request Flow                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Client Request                                                │
│       │                                                         │
│       ▼                                                         │
│   ┌──────────────┐                                              │
│   │  AI Gateway   │  gateway.blackroad.io                       │
│   │  (CF Worker)  │  Route by model + load                      │
│   └──────┬───────┘                                              │
│          │                                                      │
│    ┌─────┼─────────────────┐                                    │
│    │     │                 │                                     │
│    ▼     ▼                 ▼                                     │
│ ┌──────┐ ┌────────┐ ┌──────────┐                                │
│ │Alice │ │Cecilia │ │ Octavia  │  ◄── Primary inference nodes   │
│ │ .49  │ │  .96   │ │  .101   │                                │
│ │Embed │ │16 Model│ │11 Model │                                │
│ │Qdrant│ │Hailo-8 │ │Hailo-8  │                                │
│ └──────┘ └────────┘ └─────────┘                                │
│                                                                 │
│   Failover: Cecilia down? → route to Octavia automatically     │
│   Sharding: Large models split across nodes                     │
│   Latency: avg 45ms local, 120ms via WireGuard                 │
└─────────────────────────────────────────────────────────────────┘</div>
<div class="cards"><div class="card"><h3>Load Balancing</h3><p>Requests distributed across nodes based on model availability, current load, and memory pressure. Weighted round-robin with health checks every 30 seconds.</p></div><div class="card"><h3>Automatic Failover</h3><p>When a node goes offline, requests instantly reroute to the next available node. Zero downtime for inference — the chain never breaks.</p></div><div class="card"><h3>Model Sharding</h3><p>Large models that exceed single-node RAM can be split across multiple Pis. Tensor parallelism over the local network for bigger-than-node inference.</p></div><div class="card"><h3>Edge Inference</h3><p>2x Hailo-8 NPUs provide 52 TOPS of dedicated neural compute. Vision models, classification, and real-time detection at wire speed.</p></div></div>
<div class="section"><h2>Fleet Nodes</h2><div class="nodes"><div class="node online"><div class="name">Alice</div><div class="ip">192.168.4.49</div><div class="role">Gateway &bull; Qdrant &bull; PostgreSQL</div></div><div class="node offline"><div class="name">Cecilia</div><div class="ip">192.168.4.96</div><div class="role">16 Models &bull; Hailo-8 &bull; Embedder</div></div><div class="node online"><div class="name">Octavia</div><div class="ip">192.168.4.101</div><div class="role">11 Models &bull; Hailo-8 &bull; Gitea</div></div><div class="node online"><div class="name">Lucidia</div><div class="ip">192.168.4.38</div><div class="role">334 Apps &bull; GitHub Actions</div></div><div class="node offline"><div class="name">Aria</div><div class="ip">192.168.4.98</div><div class="role">Offline &bull; Needs Power Cycle</div></div></div></div>
<div class="section"><h2>Quick Start</h2><div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:1.5rem;font-family:JetBrains Mono,monospace;font-size:.85rem;color:#4ade80;line-height:1.8"><span style="color:#555"># Install</span><br>pip install ai-chain<br><br><span style="color:#555"># Configure nodes</span><br>ai-chain init --nodes alice,cecilia,octavia<br><br><span style="color:#555"># Run inference</span><br>ai-chain generate --model llama3.1:8b --prompt "Explain BlackRoad OS"<br><br><span style="color:#555"># Check fleet status</span><br>ai-chain status --all</div></div>
<footer><a href="https://blackroad.io">Home</a><a href="https://ai.blackroad.io">AI</a><a href="https://mesh.blackroad.io">Network</a><a href="https://search.blackroad.io">Search</a><a href="https://github.com/BlackRoad-OS-Inc">GitHub</a><div class="tl">BlackRoad OS — Pave Tomorrow.</div></footer>
<script src="https://bb.blackroad.io/bb.js" defer></script></body></html>`;
