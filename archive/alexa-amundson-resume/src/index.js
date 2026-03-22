// ── Alexa Amundson — Interactive Resume ──
// Cloudflare Worker with cinematic scroll reveals + print stylesheet

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', service: 'alexa-resume' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(renderResume(), {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  },
};

function renderResume() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Alexa Louise Amundson — Resume</title>
<meta name="description" content="Founder & CEO at BlackRoad OS, Inc. Edge AI infrastructure, 20 domains, 275+ repos, 52 TOPS compute.">
<link rel="icon" href="https://images.blackroad.io/favicon.ico">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html{-webkit-font-smoothing:antialiased;scroll-behavior:smooth}
:root{
  --bg:#050505;--card:#0a0a0a;--text:#f5f5f5;--border:#1a1a1a;--muted:#666;
  --g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);
  --g135:linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);
  --sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace;
}
body{background:var(--bg);color:var(--text);font-family:var(--sg);line-height:1.7}
a{color:var(--text);text-decoration:none}

/* Gradient bar */
.grad-bar{height:3px;background:var(--g)}

/* Nav */
nav{display:flex;align-items:center;justify-content:space-between;padding:14px 48px;border-bottom:1px solid var(--border);background:rgba(5,5,5,.95);backdrop-filter:blur(20px);position:sticky;top:0;z-index:100}
.nav-logo{font-weight:700;font-size:17px;display:flex;align-items:center;gap:10px}
.nav-mark{width:28px;height:3px;border-radius:2px;background:var(--g)}
.nav-links{display:flex;align-items:center;gap:20px}
.nav-links a{font-size:12px;font-family:var(--jb);color:var(--muted);transition:color .2s}
.nav-links a:hover{color:var(--text)}
.btn-download{padding:6px 16px;border:1px solid var(--border);border-radius:6px;font-size:12px;font-family:var(--jb);color:var(--text);transition:all .2s}
.btn-download:hover{border-color:#4488FF;color:#4488FF}

/* Scroll reveal */
.reveal{opacity:0;transform:translateY(30px);transition:opacity .7s ease,transform .7s ease}
.reveal.visible{opacity:1;transform:translateY(0)}

/* Container */
.container{max-width:760px;margin:0 auto;padding:0 24px}

/* Hero */
.hero{padding:80px 0 60px;text-align:center;position:relative}
.hero-orb{position:absolute;width:400px;height:400px;border-radius:50%;background:var(--g135);filter:blur(160px);opacity:.06;pointer-events:none}
.hero-orb-1{top:-120px;left:-100px}
.hero-orb-2{top:-80px;right:-100px}
.hero h1{font-size:42px;font-weight:700;letter-spacing:-.02em;margin-bottom:8px}
.hero h1 span{background:var(--g);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero-title{font-size:18px;font-weight:400;color:var(--muted);margin-bottom:24px}
.hero-links{display:flex;justify-content:center;gap:24px;flex-wrap:wrap}
.hero-links a{font-family:var(--jb);font-size:12px;color:var(--muted);border:1px solid var(--border);padding:6px 16px;border-radius:6px;transition:all .2s}
.hero-links a:hover{color:var(--text);border-color:#4488FF}

/* Stats bar */
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:48px 0}
.stat{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:20px;text-align:center}
.stat-num{font-size:28px;font-weight:700;background:var(--g);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.stat-label{font-size:11px;font-family:var(--jb);color:var(--muted);margin-top:4px;text-transform:uppercase;letter-spacing:.1em}

/* Section */
.section{margin:56px 0}
.section-title{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.15em;color:var(--muted);margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid var(--border)}

/* Experience */
.exp{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:28px;margin-bottom:16px;position:relative;overflow:hidden}
.exp::before{content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:var(--g)}
.exp-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}
.exp-role{font-size:18px;font-weight:600}
.exp-company{font-size:14px;color:var(--muted);margin-top:2px}
.exp-date{font-family:var(--jb);font-size:11px;color:var(--muted);white-space:nowrap}
.exp-bullets{list-style:none;padding:0}
.exp-bullets li{font-size:14px;color:#bbb;padding:4px 0 4px 18px;position:relative;line-height:1.6}
.exp-bullets li::before{content:'';position:absolute;left:0;top:12px;width:6px;height:6px;border-radius:50%;background:var(--g135)}

/* Skills */
.skills-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.skill-cat{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:20px}
.skill-cat-title{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:12px}
.skill-tags{display:flex;flex-wrap:wrap;gap:6px}
.skill-tag{font-family:var(--jb);font-size:11px;padding:4px 10px;border:1px solid var(--border);border-radius:5px;color:#ccc;transition:all .2s}
.skill-tag:hover{border-color:#4488FF;color:var(--text)}

/* Projects */
.projects-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.project{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:20px;transition:border-color .2s}
.project:hover{border-color:#333}
.project-name{font-size:15px;font-weight:600;margin-bottom:6px}
.project-desc{font-size:13px;color:var(--muted);line-height:1.5}
.project-tech{display:flex;flex-wrap:wrap;gap:4px;margin-top:10px}
.project-tech span{font-family:var(--jb);font-size:10px;padding:2px 8px;border:1px solid var(--border);border-radius:4px;color:var(--muted)}

/* Footer */
footer{border-top:1px solid var(--border);padding:24px 48px;display:flex;align-items:center;justify-content:space-between;margin-top:64px}
footer span{font-size:12px;color:var(--muted)}
.footer-links{display:flex;gap:20px}
.footer-links a{font-size:12px;color:var(--muted);transition:color .2s}
.footer-links a:hover{color:var(--text)}

/* Mobile */
@media(max-width:640px){
  nav{padding:14px 20px}
  .hero{padding:48px 0 40px}
  .hero h1{font-size:28px}
  .stats{grid-template-columns:repeat(2,1fr)}
  .skills-grid,.projects-grid{grid-template-columns:1fr}
  .exp-header{flex-direction:column;gap:4px}
  footer{flex-direction:column;gap:12px;text-align:center;padding:24px 20px}
}

/* Print stylesheet */
@media print{
  *{background:white!important;color:black!important;border-color:#ddd!important;-webkit-text-fill-color:black!important}
  body{font-size:11pt;line-height:1.4}
  .grad-bar,nav,.hero-orb,.subscribe,footer,.btn-download,.nav-links{display:none!important}
  .container{max-width:100%;padding:0 20px}
  .hero{padding:20px 0;text-align:left}
  .hero h1{font-size:24pt}
  .hero-title{font-size:12pt}
  .hero-links a{border:none;padding:0;font-size:10pt;color:#333!important}
  .hero-links{justify-content:flex-start;gap:16px}
  .stats{margin:16px 0}
  .stat{border:1px solid #ddd;padding:12px}
  .stat-num{font-size:18pt}
  .section{margin:24px 0}
  .exp{padding:16px;border:1px solid #ddd;page-break-inside:avoid}
  .exp::before{background:#333}
  .reveal{opacity:1!important;transform:none!important}
  .skill-tag{border:1px solid #ccc}
  .project{border:1px solid #ddd;page-break-inside:avoid}
  @page{margin:0.75in}
}
</style>
</head>
<body>
<div class="grad-bar"></div>
<nav>
  <a href="https://blackroad.io" class="nav-logo"><div class="nav-mark"></div>BlackRoad</a>
  <div class="nav-links">
    <a href="https://blackroad.io">Home</a>
    <a href="https://github.com/blackboxprogramming">GitHub</a>
    <a href="https://status.blackroad.io">Status</a>
    <a href="javascript:window.print()" class="btn-download">Download PDF</a>
  </div>
</nav>

<div class="container">
  <!-- Hero -->
  <div class="hero reveal">
    <div class="hero-orb hero-orb-1"></div>
    <div class="hero-orb hero-orb-2"></div>
    <h1>Alexa Louise <span>Amundson</span></h1>
    <div class="hero-title">Founder & CEO, BlackRoad OS, Inc.</div>
    <div class="hero-links">
      <a href="mailto:alexa@blackroad.io">alexa@blackroad.io</a>
      <a href="https://github.com/blackboxprogramming">github/blackboxprogramming</a>
      <a href="https://blackroad.io">blackroad.io</a>
      <a href="#">USA</a>
    </div>
  </div>

  <!-- Stats -->
  <div class="stats reveal">
    <div class="stat"><div class="stat-num">20</div><div class="stat-label">Domains</div></div>
    <div class="stat"><div class="stat-num">275+</div><div class="stat-label">Repositories</div></div>
    <div class="stat"><div class="stat-num">29</div><div class="stat-label">AI Models</div></div>
    <div class="stat"><div class="stat-num">52</div><div class="stat-label">TOPS Compute</div></div>
  </div>

  <!-- Experience -->
  <div class="section reveal">
    <div class="section-title">Experience</div>

    <div class="exp">
      <div class="exp-header">
        <div>
          <div class="exp-role">Founder & CEO</div>
          <div class="exp-company">BlackRoad OS, Inc. — Delaware C-Corp (Stripe Atlas)</div>
        </div>
        <div class="exp-date">Nov 2025 — Present</div>
      </div>
      <ul class="exp-bullets">
        <li>Built sovereign edge AI infrastructure from 5 Raspberry Pis, 2 cloud VMs, and Cloudflare edge — total hardware cost under $700</li>
        <li>Operates 20 production domains, 275+ repositories, 29 local AI models, and 52 TOPS of Hailo-8 neural compute</li>
        <li>Designed and deployed WireGuard mesh VPN connecting all nodes with sub-millisecond internal latency</li>
        <li>Created RoadPay billing system, RoadSearch with D1 FTS5, and auth platform serving 42 users</li>
        <li>Built 400+ shell scripts, 223 CLI tools, and a custom programming language (RoadC)</li>
        <li>Sole engineer: infrastructure, backend, frontend, AI/ML, DevOps, security, and product</li>
      </ul>
    </div>

    <div class="exp">
      <div class="exp-header">
        <div>
          <div class="exp-role">Sales, Finance & Real Estate</div>
          <div class="exp-company">Licensed Professional — Multiple Industries</div>
        </div>
        <div class="exp-date">Previous</div>
      </div>
      <ul class="exp-bullets">
        <li>Licensed in sales, finance, and real estate — full regulatory compliance across all three</li>
        <li>Career progression from client-facing sales through financial services to real estate transactions</li>
        <li>Applied structured problem-solving and client management skills that now drive technical architecture decisions</li>
      </ul>
    </div>
  </div>

  <!-- Technical Skills -->
  <div class="section reveal">
    <div class="section-title">Technical Skills</div>
    <div class="skills-grid">
      <div class="skill-cat">
        <div class="skill-cat-title">Languages</div>
        <div class="skill-tags">
          <span class="skill-tag">JavaScript</span>
          <span class="skill-tag">Python</span>
          <span class="skill-tag">Bash</span>
          <span class="skill-tag">TypeScript</span>
          <span class="skill-tag">Go</span>
          <span class="skill-tag">SQL</span>
          <span class="skill-tag">RoadC</span>
        </div>
      </div>
      <div class="skill-cat">
        <div class="skill-cat-title">Infrastructure</div>
        <div class="skill-tags">
          <span class="skill-tag">Raspberry Pi</span>
          <span class="skill-tag">Cloudflare</span>
          <span class="skill-tag">Docker</span>
          <span class="skill-tag">WireGuard</span>
          <span class="skill-tag">Nginx</span>
          <span class="skill-tag">systemd</span>
        </div>
      </div>
      <div class="skill-cat">
        <div class="skill-cat-title">AI / ML</div>
        <div class="skill-tags">
          <span class="skill-tag">Ollama</span>
          <span class="skill-tag">Hailo-8</span>
          <span class="skill-tag">Qdrant</span>
          <span class="skill-tag">NATS</span>
          <span class="skill-tag">RAG</span>
          <span class="skill-tag">Embeddings</span>
        </div>
      </div>
      <div class="skill-cat">
        <div class="skill-cat-title">Databases & Storage</div>
        <div class="skill-tags">
          <span class="skill-tag">PostgreSQL</span>
          <span class="skill-tag">SQLite</span>
          <span class="skill-tag">D1</span>
          <span class="skill-tag">KV</span>
          <span class="skill-tag">R2</span>
          <span class="skill-tag">MinIO</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Projects -->
  <div class="section reveal">
    <div class="section-title">Projects</div>
    <div class="projects-grid">
      <div class="project">
        <div class="project-name">BlackRoad OS</div>
        <div class="project-desc">Sovereign operating system spanning 5 Pis, 20 domains, 95+ Cloudflare Workers, and 400+ automation scripts.</div>
        <div class="project-tech"><span>Bash</span><span>JS</span><span>Python</span><span>CF Workers</span></div>
      </div>
      <div class="project">
        <div class="project-name">Lucidia</div>
        <div class="project-desc">AI reasoning engine with 50 skills, NATS pub/sub mesh, and local-first inference on Hailo-8 accelerators.</div>
        <div class="project-tech"><span>Python</span><span>Ollama</span><span>NATS</span><span>Hailo</span></div>
      </div>
      <div class="project">
        <div class="project-name">RoadPay</div>
        <div class="project-desc">Custom billing system with D1 backend, 4 subscription plans, usage metering, and Stripe as card charger only.</div>
        <div class="project-tech"><span>Workers</span><span>D1</span><span>Stripe</span></div>
      </div>
      <div class="project">
        <div class="project-name">RoadSearch</div>
        <div class="project-desc">Full-text search across 1,383 entries from 23 indexers. D1 FTS5 backend with AI-powered answers.</div>
        <div class="project-tech"><span>D1</span><span>FTS5</span><span>Ollama</span></div>
      </div>
      <div class="project">
        <div class="project-name">RoadChain</div>
        <div class="project-desc">Blockchain-inspired immutable audit log for agent actions and infrastructure events.</div>
        <div class="project-tech"><span>SQLite</span><span>Python</span><span>HMAC</span></div>
      </div>
      <div class="project">
        <div class="project-name">RoadC Language</div>
        <div class="project-desc">Custom programming language with lexer, parser, and interpreter. Built from scratch for edge compute.</div>
        <div class="project-tech"><span>JS</span><span>Compiler</span></div>
      </div>
    </div>
  </div>

  <!-- Education & Licensing -->
  <div class="section reveal">
    <div class="section-title">Licensing & Formation</div>
    <div class="exp">
      <div class="exp-header">
        <div>
          <div class="exp-role">BlackRoad OS, Inc.</div>
          <div class="exp-company">Delaware C-Corp — Stripe Atlas — EIN: 41-2663817</div>
        </div>
        <div class="exp-date">Nov 17, 2025</div>
      </div>
      <ul class="exp-bullets">
        <li>10M shares Common authorized ($0.00001 par value), 83(b) election filed</li>
        <li>Sole founder, CEO, and director</li>
      </ul>
    </div>
    <div class="exp">
      <div class="exp-header">
        <div>
          <div class="exp-role">Professional Licenses</div>
          <div class="exp-company">Sales, Finance, and Real Estate</div>
        </div>
        <div class="exp-date">Active</div>
      </div>
      <ul class="exp-bullets">
        <li>Licensed across sales, financial services, and real estate — all in good standing</li>
      </ul>
    </div>
  </div>
</div>

<footer>
  <span>&copy; 2026 Alexa Amundson — BlackRoad OS, Inc.</span>
  <div class="footer-links">
    <a href="https://blackroad.io">Home</a>
    <a href="https://brand.blackroad.io">Brand</a>
    <a href="https://status.blackroad.io">Status</a>
    <a href="https://portal.blackroad.io">Portal</a>
  </div>
</footer>

<script>
// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 100);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => observer.observe(el));
</script>
</body>
</html>`;
}
