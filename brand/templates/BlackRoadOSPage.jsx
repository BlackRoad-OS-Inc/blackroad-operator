import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function BlackRoadOSPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; overflow-x: hidden; background: #000; }
        body { overflow-x: hidden; max-width: 100vw; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #1c1c1c; border-radius: 4px; }
        
        *{margin:0;padding:0;box-sizing:border-box;shape-rendering:geometricPrecision}
        html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility;-webkit-text-stroke:.2px rgba(255,255,255,.1);scroll-behavior:smooth}
        :root{
          --g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);
          --g135:linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);
          --bg:#000;--white:#fff;--black:#000;--border:#1a1a1a;
          --sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace;
        }
        body{background:var(--bg);color:var(--white);font-family:var(--sg);overflow-x:hidden}
        
        /* ═══ GRAD BAR ═══ */
        .grad-bar{height:4px;background:var(--g);image-rendering:crisp-edges}
        
        /* ═══ NAV ═══ */
        nav{display:flex;align-items:center;justify-content:space-between;padding:16px 48px;border-bottom:1px solid var(--border)}
        .nav-logo{font-weight:700;font-size:20px;color:var(--white);display:flex;align-items:center;gap:10px}
        .nav-logo-mark{width:28px;height:4px;border-radius:2px;background:var(--g);image-rendering:crisp-edges}
        .nav-links{display:flex;gap:32px}
        .nav-links a{font-size:14px;font-weight:500;color:var(--white);opacity:.5;text-decoration:none;transition:opacity .2s}
        .nav-links a:hover{opacity:1}
        .nav-cta{display:flex;gap:10px}
        .btn-outline{padding:8px 20px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--white);font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sg);transition:border-color .2s}
        .btn-outline:hover{border-color:#444}
        .btn-solid{padding:8px 20px;border:none;border-radius:6px;background:var(--white);color:var(--black);font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sg)}
        
        /* ═══ HERO ═══ */
        .hero{text-align:center;padding:120px 48px 80px;position:relative}
        .orb{position:absolute;border-radius:50%;filter:blur(120px);opacity:.06;pointer-events:none}
        .orb-1{width:400px;height:400px;background:#8844FF;top:-150px;left:-5%}
        .orb-2{width:350px;height:350px;background:#00D4FF;top:-100px;right:-5%}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border:1px solid var(--border);border-radius:20px;font-size:12px;font-weight:500;color:var(--white);margin-bottom:32px}
        .hero-badge-dot{width:8px;height:8px;border-radius:50%;background:var(--g135)}
        .hero h1{font-size:64px;font-weight:700;color:var(--white);line-height:1.08;margin-bottom:24px;max-width:780px;margin-left:auto;margin-right:auto;letter-spacing:-.02em}
        .hero p{font-size:18px;color:var(--white);opacity:.45;max-width:500px;margin:0 auto 48px;line-height:1.7}
        .hero-cta{display:flex;gap:16px;justify-content:center}
        .btn-lg{padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;font-family:var(--sg)}
        .btn-lg-solid{background:var(--white);color:var(--black);border:none}
        .btn-lg-outline{background:transparent;color:var(--white);border:1px solid var(--border);transition:border-color .2s}
        .btn-lg-outline:hover{border-color:#444}
        
        /* ═══ TERMINAL PREVIEW ═══ */
        .terminal-wrap{max-width:700px;margin:-20px auto 0;position:relative;z-index:1}
        .terminal{border:1px solid var(--border);border-radius:10px;overflow:hidden}
        .terminal-header{display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid var(--border)}
        .terminal-dot{width:10px;height:10px;border-radius:50%;border:1px solid var(--border)}
        .terminal-title{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.3;margin-left:auto}
        .terminal-body{padding:20px;font-family:var(--jb);font-size:13px;color:var(--white);opacity:.6;line-height:2}
        .terminal-body .prompt{opacity:.3}
        .terminal-body .cmd{opacity:.8}
        .terminal-body .out{opacity:.4}
        .terminal-accent{height:2px;background:var(--g);image-rendering:crisp-edges}
        
        /* ═══ SECTIONS ═══ */
        .section{max-max-width:1100px;width:100%;margin:0 auto;padding:80px 48px}
        .section-label{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.25;letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px}
        .section-title{font-size:32px;font-weight:700;color:var(--white);margin-bottom:12px;letter-spacing:-.015em}
        .section-desc{font-size:14px;color:var(--white);opacity:.4;max-width:460px;margin-bottom:48px}
        
        /* ═══ LAYER STACK — lined rows ═══ */
        .layer-stack{border-top:1px solid var(--border)}
        .layer{display:grid;grid-template-columns:120px 1fr 1fr;gap:24px;padding:24px 0;border-bottom:1px solid var(--border);align-items:start}
        .layer-num{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2;letter-spacing:.08em;text-transform:uppercase;padding-top:4px}
        .layer-name{font-size:16px;font-weight:600;color:var(--white)}
        .layer-desc{font-size:13px;color:var(--white);opacity:.4;line-height:1.7}
        .layer-tech{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
        .layer-tag{padding:3px 8px;border:1px solid var(--border);border-radius:3px;font-family:var(--jb);font-size:10px;color:var(--white);opacity:.4}
        
        /* ═══ NODE GRID — outlined cards ═══ */
        .node-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:16px}
        .node-card{border:1px solid var(--border);border-radius:10px;padding:24px;text-align:center;transition:border-color .2s}
        .node-card:hover{border-color:#333}
        .node-avatar{width:48px;height:48px;border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;color:var(--white);position:relative;overflow:hidden}
        .node-avatar::before{content:'';position:absolute;inset:0;background:var(--g135);opacity:.1}
        .node-ring{position:absolute;inset:-2px;border-radius:50%;border:2px solid transparent;background:var(--g);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;padding:2px}
        .node-name{font-size:14px;font-weight:600;color:var(--white);margin-bottom:4px}
        .node-role{font-size:11px;color:var(--white);opacity:.3;margin-bottom:12px}
        .node-stat{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.25;line-height:1.8}
        .node-status{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:12px;font-size:11px;color:var(--white);opacity:.4}
        .node-status-dot{width:6px;height:6px;border-radius:50%;background:var(--g135)}
        .node-status-dot.off{background:none;border:1px solid var(--white);opacity:.3;width:5px;height:5px}
        
        /* ═══ CODE INSTALL ═══ */
        .install-card{border:1px solid var(--border);border-radius:10px;overflow:hidden;max-width:600px}
        .install-grad{height:2px;background:var(--g);image-rendering:crisp-edges}
        .install-header{padding:14px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
        .install-lang{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.3}
        .install-copy{padding:4px 10px;border:1px solid var(--border);border-radius:4px;background:transparent;color:var(--white);opacity:.3;font-size:11px;cursor:pointer;font-family:var(--jb)}
        .install-body{padding:20px;font-family:var(--jb);font-size:13px;color:var(--white);opacity:.7;line-height:1.8}
        
        /* ═══ METRICS ═══ */
        .metrics-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding:48px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
        .metric{text-align:center}
        .metric-val{font-size:36px;font-weight:700;color:var(--white)}
        .metric-label{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.3;letter-spacing:.08em;text-transform:uppercase;margin-top:4px}
        
        /* ═══ CTA ═══ */
        .cta{text-align:center;padding:80px 48px}
        .cta-box{max-width:700px;margin:0 auto;padding:64px;border:1px solid var(--border);border-radius:16px;position:relative;overflow:hidden}
        .cta-box::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g)}
        .cta-box h2{font-size:28px;font-weight:700;color:var(--white);margin-bottom:12px;letter-spacing:-.015em}
        .cta-box p{font-size:14px;color:var(--white);opacity:.4;margin-bottom:32px;max-width:400px;margin-left:auto;margin-right:auto}
        
        /* ═══ FOOTER ═══ */
        footer{border-top:1px solid var(--border);padding:48px;display:flex;justify-content:space-between;align-items:center}
        .footer-brand{font-weight:700;font-size:16px;color:var(--white)}
        .footer-links{display:flex;gap:24px}
        .footer-links a{font-size:13px;color:var(--white);opacity:.4;text-decoration:none;transition:opacity .2s}
        .footer-links a:hover{opacity:1}
        .footer-copy{font-size:12px;color:var(--white);opacity:.2}
        
        @media(max-max-width:1024px;width:100%){.node-grid{grid-template-columns:repeat(3,1fr)}}
        @media(max-width:768px){
          nav{padding:14px 20px;flex-wrap:wrap;gap:12px}.nav-links{display:none}
          .hero{padding:80px 20px 60px}.hero h1{font-size:36px}
          .hero-cta{flex-direction:column;align-items:center}
          .terminal-wrap{margin:0 20px}
          .section{padding:48px 20px}
          .layer{grid-template-columns:1fr;gap:8px}
          .node-grid{grid-template-columns:1fr 1fr}
          .metrics-bar{grid-template-columns:repeat(2,1fr);gap:24px}
          .cta{padding:48px 20px}
          footer{flex-direction:column;gap:16px;text-align:center;padding:32px 20px}
        }
        
      `}</style>

      <div style={{ background: "#000", minHeight: "100vh", color: "#f5f5f5", overflowX: "hidden", width: "100%", fontFamily: grotesk }}>





<div className="grad-bar"></div>





<nav>
  <div className="nav-logo"><img src="blackroad-logo.png" alt="BlackRoad" style={{{ width: 32, height: 32, borderRadius: "50%" }}} /> BlackRoad OS</div>
  <div className="nav-links">
    <a href="#architecture">Architecture</a>
    <a href="#fleet">Nodes</a>
    <a href="#deploy">Install</a>
    <a href="https://github.com/blackboxprogramming/BlackRoad-Operating-System" target="_blank">GitHub</a>
  </div>
  <div className="nav-cta">
    <a className="btn-outline" href="https://blackroad-status.pages.dev" style={{{ textDecoration: "none" }}}>Status</a>
    <a className="btn-solid" href="#deploy" style={{{ textDecoration: "none" }}}>Deploy</a>
  </div>
</nav>





<section className="hero">
  <div className="orb orb-1"></div>
  <div className="orb orb-2"></div>
  <div className="hero-badge"><div className="hero-badge-dot"></div> #!/blackroad — 80+ CLI tools · 5 Nodes · 6 Agents</div>
  <h1>The sovereign operating system</h1>
  <p>The operator monorepo. 80+ br-* shell scripts, a TypeScript CLI, Python agents, and a Node.js gateway — all running on five Raspberry Pis connected by an encrypted WireGuard mesh. Your chaos is the input.</p>
  <div className="hero-cta">
    <a className="btn-lg btn-lg-solid" href="#architecture" style={{{ textDecoration: "none" }}}>View Architecture</a>
    <a className="btn-lg btn-lg-outline" href="https://github.com/blackboxprogramming/BlackRoad-Operating-System" target="_blank" style={{{ textDecoration: "none" }}}>GitHub</a>
  </div>
</section>







<div className="terminal-wrap">
  <div className="terminal">
    <div className="terminal-accent"></div>
    <div className="terminal-header">
      <div className="terminal-dot"></div>
      <div className="terminal-dot"></div>
      <div className="terminal-dot"></div>
      <span className="terminal-title">blackroad@alice ~ </span>
    </div>
    <div className="terminal-body">
      <div><span className="prompt">$ </span><span className="cmd">br-fleet.sh status</span></div>
      <div className="out">alice    .49   ● online   Pi400   gateway, dns, postgres, 65 tunnels</div>
      <div className="out">cecilia  .96   ○ down     Pi5     hailo-8, ollama×16, cece-api, tts</div>
      <div className="out">octavia  .100  ● online   Pi5     hailo-8, gitea×207, nvme, swarm</div>
      <div className="out">aria     .98   ● online   Pi5     portainer, headscale, ollama×6</div>
      <div className="out">lucidia  .38   ● online   Pi5     334 web apps, github-runners</div>
      <div><span className="prompt">$ </span><span className="cmd">br-ai.sh "what agents are running?"</span></div>
      <div className="out">Streaming from cecilia/cece-7b...</div>
      <div className="out">LUCIDIA (reasoning), ALICE (worker), OCTAVIA (storage),</div>
      <div className="out">PRISM (analysis), ECHO (relay), CIPHER (security)</div>
    </div>
  </div>
</div>







<section className="section">
  <div className="section-label" id="architecture">Architecture</div>
  <div className="section-title">System layers</div>
  <div className="section-desc">Four layers from hardware to application, each self-healing and boot-persistent.</div>
  <div className="layer-stack">
    <div className="layer">
      <div className="layer-num">L1</div>
      <div><div className="layer-name">Hardware</div><div className="layer-tech"><a href="https://blackroad-infra.pages.dev#fleet" className="layer-tag" style={{{ textDecoration: "none" }}}>Pi 5</a><a href="https://blackroad-infra.pages.dev#accelerators" className="layer-tag" style={{{ textDecoration: "none" }}}>Hailo-8</a><span className="layer-tag">NVMe</span></div></div>
      <div className="layer-desc">Five <a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>Raspberry Pi nodes</a> with two <a href="https://blackroad-infra.pages.dev#accelerators" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>Hailo-8 AI accelerators</a> (52 TOPS), 1TB NVMe, thermal management, power optimization via conservative governors.</div>
    </div>
    <div className="layer">
      <div className="layer-num">L2</div>
      <div><div className="layer-name">Network</div><div className="layer-tech"><span className="layer-tag">WireGuard</span><a href="https://blackroad-systems.pages.dev" className="layer-tag" style={{{ textDecoration: "none" }}}>Cloudflare</a></div></div>
      <div className="layer-desc">Encrypted WireGuard mesh (10.8.0.x) connecting all nodes through Anastasia hub. 18 <a href="https://blackroad-systems.pages.dev" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>Cloudflare tunnels</a> route <a href="https://blackroad-systems.pages.dev#resources" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>48+ domains</a> to the fleet.</div>
    </div>
    <div className="layer">
      <div className="layer-num">L3</div>
      <div><div className="layer-name">Services</div><div className="layer-tech"><a href="https://blackroad-operator.pages.dev#infrastructure" className="layer-tag" style={{{ textDecoration: "none" }}}>Docker</a><a href="https://blackroadai-com.pages.dev#models" className="layer-tag" style={{{ textDecoration: "none" }}}>Ollama</a><span className="layer-tag">Gitea</span></div></div>
      <div className="layer-desc">Docker Swarm orchestration, <a href="https://blackroadai-com.pages.dev#models" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>16 Ollama models</a>, self-hosted Gitea with 207 repos, PostgreSQL, Pi-hole DNS, <a href="https://blackroad-assets.pages.dev" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>MinIO object storage</a>.</div>
    </div>
    <div className="layer">
      <div className="layer-num">L4</div>
      <div><div className="layer-name">Autonomy</div><div className="layer-tech"><span className="layer-tag">Self-Healing</span></div></div>
      <div className="layer-desc">Heartbeat checks every minute, healing scripts every five minutes. Automatic service restart, fleet telemetry, power monitoring via cron.</div>
    </div>
  </div>
</section>








<section className="section">
  <div className="section-label" id="fleet">Fleet</div>
  <div className="section-title">Edge nodes</div>
  <div className="section-desc">Five Raspberry Pi nodes forming a self-healing WireGuard mesh across the local network.</div>
  <div className="node-grid">
    <div className="node-card">
      <div className="node-avatar"><div className="node-ring"></div>A</div>
      <div className="node-name">Alice</div>
      <div className="node-role">Gateway · DNS · PostgreSQL</div>
      <div className="node-stat">Pi 400 · 192.168.4.49<br />10.8.0.6 · 65+ tunnel routes</div>
      <div className="node-status"><div className="node-status-dot"></div>Online</div>
    </div>
    <div className="node-card">
      <div className="node-avatar"><div className="node-ring"></div>C</div>
      <div className="node-name">Cecilia</div>
      <div className="node-role">AI Inference · TTS · MinIO</div>
      <div className="node-stat">Pi 5 · 192.168.4.96<br />10.8.0.3 · Hailo-8 (26 TOPS)</div>
      <div className="node-status"><div className="node-status-dot off"></div>Down</div>
    </div>
    <div className="node-card">
      <div className="node-avatar"><div className="node-ring"></div>O</div>
      <div className="node-name">Octavia</div>
      <div className="node-role">Gitea · NVMe · Docker Swarm</div>
      <div className="node-stat">Pi 5 · 192.168.4.100<br />10.8.0.4 · Hailo-8 (26 TOPS)</div>
      <div className="node-status"><div className="node-status-dot"></div>Online</div>
    </div>
    <div className="node-card">
      <div className="node-avatar"><div className="node-ring"></div>R</div>
      <div className="node-name">Aria</div>
      <div className="node-role">Portainer · Headscale</div>
      <div className="node-stat">Pi 5 · 192.168.4.98<br />10.8.0.7 · Ollama×6</div>
      <div className="node-status"><div className="node-status-dot"></div>Online</div>
    </div>
    <div className="node-card">
      <div className="node-avatar"><div className="node-ring"></div>L</div>
      <div className="node-name">Lucidia</div>
      <div className="node-role">APIs · Web Apps · DNS</div>
      <div className="node-stat">Pi 5 · 192.168.4.38<br />10.8.0.5 · 334 web apps</div>
      <div className="node-status"><div className="node-status-dot"></div>Online</div>
    </div>
  </div>
</section>






<section className="section">
  <div className="section-label" id="deploy">Deploy</div>
  <div className="section-title">Quick start</div>
  <div className="section-desc">Clone the scripts repo and deploy to your Pi fleet in three commands.</div>
  <div className="install-card">
    <div className="install-grad"></div>
    <div className="install-header">
      <span className="install-lang">bash</span>
      <button className="install-copy">Copy</button>
    </div>
    <div className="install-body">git clone https://github.com/BlackRoad-OS-Inc/blackroad-operator.git<br />cd blackroad-operator<br />npm install<br /><br /># CLI tools (80+ br-* scripts)<br />./br-fleet.sh status        # SSH into all Pis<br />./br-ai.sh "explain this"   # Stream Ollama prompt<br />./br doctor                  # Full system health check<br />./br deploy --target=all     # Multi-cloud deploy</div>
  </div>
</section>






<section className="section">
  <div className="metrics-bar">
    <div className="metric"><div className="metric-val">612</div><div className="metric-label">Shell Scripts</div></div>
    <div className="metric"><div className="metric-val">87</div><div className="metric-label">Python Scripts</div></div>
    <div className="metric"><div className="metric-val">207</div><div className="metric-label">Git Repos</div></div>
    <div className="metric"><div className="metric-val">$136</div><div className="metric-label">Monthly Cost</div></div>
  </div>
</section>






<section className="cta">
  <div className="cta-box">
    <h2>Deploy sovereign infrastructure</h2>
    <p><a href="https://finance-blackroad-io.pages.dev#economics" style={{{ color: "var(--black)", textDecoration: "underline", textUnderlineOffset: 3 }}}>$136/month</a> runs what would cost $3,756 in commercial cloud. That's a 96.4% cost reduction.</p>
    <a className="btn-lg btn-lg-solid" href="#deploy" style={{{ textDecoration: "none" }}}>Get Started</a>
  </div>
</section>

<section className="section" style={{{ paddingBottom: 0 }}}>
  <div className="section-label">Related</div>
  <div className="section-title">Go deeper</div>
  <div style={{{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}}>
    <a href="https://blackroad-infra.pages.dev#fleet" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "inline-flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> 5-Node Hardware Fleet</a>
    <a href="https://blackroadai-com.pages.dev" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "inline-flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> 6 AI Agents</a>
    <a href="https://blackroad-systems.pages.dev" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "inline-flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> 100 Cloudflare Pages</a>
    <a href="https://blackroad-guardian-dashboard.pages.dev" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "inline-flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> Fleet Security</a>
    <a href="https://blackroad-operator.pages.dev" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "inline-flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> Docker Swarm Orchestration</a>
    <a href="https://finance-blackroad-io.pages.dev#economics" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "inline-flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> $136/mo Cost Breakdown</a>
  </div>
</section>

<footer>
  <div className="footer-brand"><a href="https://blackroad-io.pages.dev" style={{{ color: "inherit", textDecoration: "none" }}}>BlackRoad OS</a></div>
  <div className="footer-links">
    <a href="#architecture">Architecture</a>
    <a href="https://blackroad-infra.pages.dev">Hardware</a>
    <a href="https://blackroadai-com.pages.dev">AI</a>
    <a href="https://blackroad-systems.pages.dev">Cloud</a>
    <a href="https://github.com/blackboxprogramming" target="_blank">GitHub</a>
    <a href="https://blackroad-io.pages.dev">OS Inc</a>
  </div>
  <div className="footer-copy">&copy; 2026 BlackRoad OS. All rights reserved.</div>
</footer>
<div className="grad-bar"></div>







      </div>
    </>
  );
}
