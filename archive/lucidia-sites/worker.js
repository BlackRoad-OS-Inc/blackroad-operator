export default {
  async fetch(request) {
    const url = new URL(request.url);
    const host = url.hostname;
    const isStudio = host === 'lucidia.studio';

    if (url.pathname === '/robots.txt')
      return new Response(`User-agent: *\nAllow: /\nSitemap: https://${host}/sitemap.xml`, {headers:{'Content-Type':'text/plain'}});
    if (url.pathname === '/sitemap.xml')
      return new Response(`<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://${host}/</loc><priority>1.0</priority></url></urlset>`, {headers:{'Content-Type':'application/xml'}});

    let agents = 69, status = 'operational';
    try {
      const r = await fetch('https://roundtrip.blackroad.io/api/health', {signal: AbortSignal.timeout(3000)});
      if (r.ok) { const d = await r.json(); agents = d.agents || 69; status = d.status === 'alive' ? 'operational' : 'degraded'; }
    } catch {}

    const title = isStudio ? 'Lucidia Studio' : 'Lucidia';
    const sub = isStudio
      ? 'Create anything. AI-powered video, music, design, writing — all sovereign, all remembered.'
      : 'AI with persistent memory across every device, every session, every agent. She remembers who you are.';
    const features = isStudio ? [
      {icon:'🎬',h:'RoadView Studio',p:'AI video editing with natural language'},
      {icon:'🎨',h:'Canvas Studio',p:'Design with brand DNA built in'},
      {icon:'🎵',h:'Cadence',p:'Describe music, hear it instantly'},
      {icon:'✍️',h:'Writing Studio',p:'Longform with Lucidia by your side'},
      {icon:'🎮',h:'Genesis Road',p:'Voice-controlled game engine'},
      {icon:'📺',h:'RoadTube',p:'60% creator revenue share'},
    ] : [
      {icon:'🧠',h:'Persistent Memory',p:'Remembers every conversation across sessions'},
      {icon:'🤖',h:`${agents} Agents`,p:'Fleet of AI agents on sovereign hardware'},
      {icon:'🔒',h:'Sovereign',p:'Runs on your Pis, your cloud, your rules'},
      {icon:'💬',h:'RoundTrip',p:'Agent-to-agent chat hub'},
      {icon:'🌐',h:'7 Nodes',p:'5 Raspberry Pis + 2 cloud droplets, full mesh'},
      {icon:'📡',h:'52 TOPS',p:'Hailo-8 neural acceleration, edge inference'},
    ];
    const colors = ['#FF6B2B','#FF2255','#CC00AA','#8844FF','#4488FF','#00D4FF'];
    const stripeUrl = 'https://buy.stripe.com/bJe14gaVq7tP3yj7Ig4Vy0e';

    return new Response(`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — BlackRoad OS</title>
<meta name="description" content="${sub}">
<meta property="og:title" content="${title} — BlackRoad OS">
<meta property="og:description" content="${sub}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="BlackRoad OS">
<meta property="og:image" content="https://images.blackroad.io/pixel-art/road-logo.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://images.blackroad.io/pixel-art/road-logo.png">
<link rel="icon" href="https://images.blackroad.io/pixel-art/road-logo.png" type="image/png">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-XXXXXXXXXX');</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#f5f5f5;font-family:'Inter',sans-serif;overflow-x:hidden}
.grad{height:1px;background:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)}
nav{height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;border-bottom:1px solid #1a1a1a}
.mark{display:flex;gap:2px}.mark div{width:3px;height:14px;border-radius:1.5px}
.nav-t{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;color:#f5f5f5;margin-left:8px;letter-spacing:-0.02em}
.nav-l{display:flex;gap:16px}.nav-l a{font-size:13px;color:#737373;text-decoration:none}.nav-l a:hover{color:#d4d4d4}
.wrap{max-width:720px;margin:0 auto;padding:0 20px}
.hero{padding:80px 0 48px;text-align:center}
h1{font-family:'Space Grotesk',sans-serif;font-size:clamp(36px,8vw,64px);font-weight:700;color:#f5f5f5;letter-spacing:-0.03em;line-height:1.1;margin-bottom:16px}
.sub{font-size:17px;color:#737373;line-height:1.7;margin-bottom:40px;max-width:520px;margin-left:auto;margin-right:auto}
.stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:1px;background:#1a1a1a;border-radius:10px;overflow:hidden;margin-bottom:48px}
.stat{background:#0f0f0f;padding:20px 16px;text-align:center}
.stat .n{font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700;color:#f5f5f5}
.stat .l{font-family:'JetBrains Mono',monospace;font-size:9px;color:#404040;text-transform:uppercase;letter-spacing:0.06em;margin-top:4px}
.slabel{font-family:'JetBrains Mono',monospace;font-size:11px;color:#525252;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px}
.stitle{font-family:'Space Grotesk',sans-serif;font-size:clamp(24px,4vw,32px);font-weight:700;color:#f5f5f5;letter-spacing:-0.02em;margin-bottom:24px}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:48px}
.card{background:#131313;border:1px solid #1a1a1a;border-radius:10px;padding:20px;position:relative;overflow:hidden}
.card:hover{border-color:#262626}
.card .bar{position:absolute;top:0;left:0;width:3px;height:100%}
.card h3{font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:600;color:#d4d4d4;margin-bottom:6px;padding-left:12px}
.card p{font-size:13px;color:#525252;line-height:1.5;padding-left:12px}
.terminal{background:#131313;border:1px solid #1a1a1a;border-radius:10px;overflow:hidden;margin-bottom:48px}
.term-bar{padding:10px 16px;border-bottom:1px solid #1a1a1a;display:flex;align-items:center;gap:8px}
.dot{width:6px;height:6px;border-radius:50%;background:#333}
.term-body{padding:16px 18px;font-family:'JetBrains Mono',monospace;font-size:12px;line-height:2.2}
.cta-section{text-align:center;padding:48px 0;border-top:1px solid #1a1a1a}
.cta-btn{display:inline-block;padding:14px 40px;background:#f5f5f5;color:#0a0a0a;border-radius:7px;text-decoration:none;font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:600}
.pulse{display:inline-block;width:6px;height:6px;border-radius:50%;background:#a3a3a3;margin-right:6px;animation:p 2s infinite}
@keyframes p{0%,100%{opacity:1}50%{opacity:.3}}
footer .grad{margin-top:48px}
.foot{display:flex;justify-content:space-between;align-items:center;padding:20px 0;flex-wrap:wrap;gap:12px}
.foot a{font-size:12px;color:#525252;text-decoration:none}
@media(max-width:560px){.nav-l{display:none}.cards{grid-template-columns:1fr}}
</style></head><body>
<div class="grad"></div>
<nav>
<div style="display:flex;align-items:center">
<div class="mark">${colors.map(c=>`<div style="background:${c}"></div>`).join('')}</div>
<span class="nav-t">${title}</span>
</div>
<div class="nav-l">
<a href="#features">Features</a>
<a href="https://roundtrip.blackroad.io">RoundTrip</a>
<a href="https://blackroad.io">BlackRoad OS</a>
</div>
</nav>

<div class="wrap">
<div class="hero">
<h1>${title}</h1>
<p class="sub">${sub}</p>
<div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#525252"><span class="pulse"></span>${status} — <span data-live="agents">${agents}</span> agents online</div>
</div>

<div class="stats">
<div class="stat"><div class="n" data-live="agents">${agents}</div><div class="l">Agents</div></div>
<div class="stat"><div class="n">7</div><div class="l">Nodes</div></div>
<div class="stat"><div class="n">52</div><div class="l">TOPS</div></div>
<div class="stat"><div class="n">20</div><div class="l">Domains</div></div>
</div>

<div id="features">
<div class="slabel">${isStudio ? 'Creative Tools' : 'Capabilities'}</div>
<div class="stitle">${isStudio ? 'Everything you need to create' : 'What Lucidia does'}</div>
<div class="cards">
${features.map((f,i)=>`<div class="card"><div class="bar" style="background:${colors[i%6]}"></div><h3>${f.icon} ${f.h}</h3><p>${f.p}</p></div>`).join('\n')}
</div>
</div>

<div class="terminal">
<div class="term-bar"><div class="dot"></div><div class="dot"></div><div class="dot"></div><span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#262626;margin-left:4px">${isStudio ? 'studio' : 'lucidia'}</span></div>
<div class="term-body">
<div style="color:#404040">$ br ${isStudio ? 'studio' : 'lucidia'} status</div>
<div style="color:#525252;padding-left:16px">→ ${isStudio ? 'Creator Suite online — 6 tools ready' : `Memory active — ${agents} agents, persistent recall`}</div>
<div style="color:#404040">$ br ${isStudio ? 'studio create --type video' : 'lucidia ask "What did we discuss yesterday?"'}</div>
<div style="color:#525252;padding-left:16px">→ ${isStudio ? 'Initializing RoadView Studio...' : 'Searching 1,650 journal entries...'}</div>
</div>
</div>

<div class="cta-section">
<div class="slabel">Get Started</div>
<div class="stitle" style="margin-bottom:8px">Start ${isStudio ? 'creating' : 'remembering'} today</div>
<p style="color:#737373;font-size:14px;margin-bottom:32px">${isStudio ? 'All creative tools in one sovereign suite' : 'AI that actually knows who you are'}</p>
<a href="${stripeUrl}" class="cta-btn">Subscribe — $49/mo</a>
<div style="margin-top:12px"><a href="https://roundtrip.blackroad.io" style="font-size:13px;color:#525252;text-decoration:none">or talk to an agent →</a></div>
</div>
</div>

<footer>
<div class="grad"></div>
<div class="wrap">
<div class="foot">
<div>
<div style="display:flex;align-items:center;gap:7px;margin-bottom:4px">
<div class="mark" style="gap:1px">${colors.map(c=>`<div style="background:${c};width:2px;height:10px;border-radius:1px"></div>`).join('')}</div>
<span style="font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;color:#a3a3a3">BlackRoad OS, Inc.</span>
</div>
<div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#333">Pave Tomorrow.</div>
</div>
<div style="display:flex;gap:20px">
<a href="https://blackroad.io">BlackRoad</a>
<a href="https://roundtrip.blackroad.io">RoundTrip</a>
<a href="https://github.com/BlackRoad-OS-Inc">GitHub</a>
</div>
</div>
</div>
</footer>

<a href="https://roundtrip.blackroad.io" target="_blank" style="position:fixed;bottom:24px;right:24px;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#FF2255,#8844FF);display:flex;align-items:center;justify-content:center;text-decoration:none;box-shadow:0 4px 20px rgba(255,34,85,0.3);z-index:9999;font-size:20px" title="Talk to an agent">💬</a>

<script>setInterval(async()=>{try{const r=await fetch('https://blackroad.io/api/stats');const d=await r.json();document.querySelectorAll('[data-live]').forEach(el=>{const k=el.dataset.live;if(d[k]!==undefined)el.textContent=typeof d[k]==='number'?d[k].toLocaleString():d[k];});}catch{}},30000);</script>
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"auto"}'></script>
</body></html>`, {headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'public, max-age=30'}});
  }
};
