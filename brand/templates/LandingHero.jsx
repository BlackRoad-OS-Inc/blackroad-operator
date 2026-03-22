import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function LandingHero() {
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
        
        *{margin:0;padding:0;box-sizing:border-box}
        html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}
        img,svg{image-rendering:crisp-edges}
        :root{
          --g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);
          --g135:linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);
          --bg:#000;--white:#fff;--black:#000;
          --border:#1a1a1a;--muted:#444;--sub:#737373;
          --sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace;
        }
        body{background:var(--bg);color:var(--white);font-family:var(--sg);overflow-x:hidden}
        
        /* ─── GRADIENT BAR ─── */
        .grad-bar{height:4px;background:var(--g)}
        
        /* ─── NAV ─── */
        nav{display:flex;align-items:center;justify-content:space-between;padding:16px 48px;border-bottom:1px solid var(--border)}
        .nav-logo{font-weight:700;font-size:20px;color:var(--white);display:flex;align-items:center;gap:10px}
        .nav-logo-mark{width:28px;height:4px;border-radius:2px;background:var(--g)}
        .nav-links{display:flex;gap:32px}
        .nav-links a{font-size:14px;font-weight:500;color:var(--white);text-decoration:none;opacity:.5;transition:opacity .2s}
        .nav-links a:hover{opacity:1}
        .nav-actions{display:flex;gap:12px}
        .btn-outline{padding:8px 20px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--white);font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sg);transition:border-color .2s}
        .btn-outline:hover{border-color:#444}
        .btn-solid{padding:8px 20px;border:none;border-radius:6px;background:var(--white);color:var(--black);font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sg)}
        
        /* ─── HERO ─── */
        .hero{text-align:center;padding:120px 48px 80px;position:relative}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border:1px solid var(--border);border-radius:20px;font-size:12px;font-weight:500;color:var(--white);margin-bottom:32px}
        .hero-badge-dot{width:8px;height:8px;border-radius:50%;background:var(--g135)}
        .hero h1{font-size:72px;font-weight:700;color:var(--white);line-height:1.05;margin-bottom:24px;max-width:800px;margin-left:auto;margin-right:auto}
        .hero p{font-size:18px;color:var(--white);opacity:.5;max-width:520px;margin:0 auto 48px;line-height:1.7}
        .hero-cta{display:flex;gap:16px;justify-content:center}
        .btn-hero{padding:14px 36px;border:none;border-radius:8px;background:var(--white);color:var(--black);font-size:15px;font-weight:600;cursor:pointer;font-family:var(--sg)}
        .btn-hero-outline{padding:14px 36px;border:1px solid var(--border);border-radius:8px;background:transparent;color:var(--white);font-size:15px;font-weight:600;cursor:pointer;font-family:var(--sg);transition:border-color .2s}
        .btn-hero-outline:hover{border-color:#444}
        
        /* ─── DECORATIVE SHAPES ─── */
        .hero-orb{position:absolute;border-radius:50%;filter:blur(80px);opacity:.15;pointer-events:none}
        .hero-orb-1{width:400px;height:400px;background:#FF2255;top:0;left:10%}
        .hero-orb-2{width:300px;height:300px;background:#4488FF;top:60px;right:10%}
        .hero-orb-3{width:200px;height:200px;background:#8844FF;bottom:0;left:40%}
        
        /* ─── METRICS BAR ─── */
        .metrics{display:flex;justify-content:center;gap:64px;padding:48px;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
        .metric{text-align:center}
        .metric-value{font-size:36px;font-weight:700;color:var(--white)}
        .metric-label{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.4;letter-spacing:.08em;text-transform:uppercase;margin-top:4px}
        
        /* ─── FEATURES ─── */
        .features{padding:80px 48px;max-max-width:1100px;width:100%;margin:0 auto}
        .features-head{text-align:center;margin-bottom:64px}
        .features-head h2{font-size:36px;font-weight:700;color:var(--white);margin-bottom:12px}
        .features-head p{font-size:15px;color:var(--white);opacity:.4;max-width:460px;margin:0 auto}
        .features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
        .feature-card{border:1px solid var(--border);border-radius:12px;padding:32px;transition:border-color .2s}
        .feature-card:hover{border-color:#333}
        .feature-icon{width:48px;height:48px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;font-size:22px;border:1px solid var(--border);position:relative;overflow:hidden}
        .feature-icon::before{content:'';position:absolute;inset:0;background:var(--g135);opacity:.1}
        .feature-card h3{font-size:16px;font-weight:600;color:var(--white);margin-bottom:8px}
        .feature-card p{font-size:13px;color:var(--white);opacity:.4;line-height:1.7}
        
        /* ─── CTA SECTION ─── */
        .cta-section{padding:80px 48px;text-align:center}
        .cta-box{max-width:700px;margin:0 auto;padding:64px;border:1px solid var(--border);border-radius:16px;position:relative;overflow:hidden}
        .cta-box::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g)}
        .cta-box h2{font-size:32px;font-weight:700;color:var(--white);margin-bottom:12px}
        .cta-box p{font-size:14px;color:var(--white);opacity:.4;margin-bottom:32px;max-width:400px;margin-left:auto;margin-right:auto}
        
        /* ─── FOOTER ─── */
        footer{border-top:1px solid var(--border);padding:48px;display:flex;justify-content:space-between;align-items:center}
        .footer-brand{font-weight:700;font-size:16px;color:var(--white)}
        .footer-links{display:flex;gap:24px}
        .footer-links a{font-size:13px;color:var(--white);opacity:.4;text-decoration:none;transition:opacity .2s}
        .footer-links a:hover{opacity:1}
        .footer-copy{font-size:12px;color:var(--white);opacity:.3}
        .grad-bar-bottom{height:4px;background:var(--g)}
        
        /* ─── RESPONSIVE ─── */
        @media(max-width:768px){
          nav{padding:14px 20px;flex-wrap:wrap;gap:12px}
          .nav-links{display:none}
          .hero{padding:80px 20px 60px}
          .hero h1{font-size:40px}
          .hero p{font-size:15px}
          .hero-cta{flex-direction:column;align-items:center}
          .metrics{flex-wrap:wrap;gap:32px;padding:32px 20px}
          .features{padding:48px 20px}
          .features-grid{grid-template-columns:1fr}
          .cta-section{padding:48px 20px}
          footer{flex-direction:column;gap:16px;text-align:center;padding:32px 20px}
        }
        
        /* ═══ RESPONSIVE — fit to screen ═══ */
        @media(max-max-width:1024px;width:100%){
          .metrics-strip{grid-template-columns:repeat(3,1fr)}
          .org-grid,.grid-4,.tier-grid,.cap-grid,.stat-grid,.shield-grid,.surface-grid,.stats-row{grid-template-columns:repeat(2,1fr)}
          .node-grid{grid-template-columns:repeat(3,1fr)}
          .product-grid,.features-grid,.focus-grid,.gallery,.team-grid,.pricing{grid-template-columns:repeat(2,1fr)}
          .footer-grid{grid-template-columns:1fr 1fr}
          .cloud-grid{grid-template-columns:repeat(2,1fr)}
        }
        @media(max-width:768px){
          nav{padding:14px 20px;flex-wrap:wrap;gap:12px}
          .nav-links{display:none}
          .hero{padding:80px 20px 60px}
          .hero h1{font-size:36px}
          .hero-cta{flex-direction:column;align-items:center}
          .section,.section-wide{padding:48px 20px}
          .metrics-strip{grid-template-columns:repeat(2,1fr)}
          .product-featured{grid-template-columns:1fr}
          .product-grid,.features-grid,.focus-grid,.gallery,.team-grid,.pricing,.cap-grid,.tier-grid,.shield-grid{grid-template-columns:1fr}
          .org-grid,.grid-4,.stat-grid,.stats-row,.surface-grid{grid-template-columns:1fr}
          .node-grid{grid-template-columns:1fr 1fr}
          .cloud-grid{grid-template-columns:1fr}
          footer{padding:32px 20px}
          .footer-grid{grid-template-columns:1fr}
          .footer-bottom{flex-direction:column;gap:12px;text-align:center}
          .topnav{padding:10px 16px}
          .topnav-links{gap:8px;flex-wrap:wrap}
          .topnav-links a{font-size:11px}
        }
        
      `}</style>

      <div style={{ background: "#000", minHeight: "100vh", color: "#f5f5f5", overflowX: "hidden", width: "100%", fontFamily: grotesk }}>

<div className="grad-bar"></div>

<nav>
  <div className="nav-logo"><img src="blackroad-logo.png" alt="BlackRoad" style={{{ width: 32, height: 32, borderRadius: "50%" }}} /> BlackRoad</div>
  <div className="nav-links">
    <a href="https://blackroad-io.pages.dev">Product</a>
    <a href="https://blackroad-docs-hub.pages.dev">Docs</a>
    <a href="https://blackroad-store.pages.dev">Pricing</a>
    <a href="https://blackroad-research.pages.dev">Blog</a>
  </div>
  <div className="nav-actions">
    <button className="btn-outline">Sign In</button>
    <button className="btn-solid">Get Started</button>
  </div>
</nav>

<section className="hero">
  <div className="hero-orb hero-orb-1"></div>
  <div className="hero-orb hero-orb-2"></div>
  <div className="hero-orb hero-orb-3"></div>
  <div className="hero-badge"><div className="hero-badge-dot"></div> Now Available</div>
  <h1>Build the future with sovereign intelligence</h1>
  <p>A distributed operating system for autonomous agents, built on open infrastructure you own and control.</p>
  <div className="hero-cta">
    <button className="btn-hero">Start Building</button>
    <button className="btn-hero-outline">View Documentation</button>
  </div>
</section>

<section className="metrics">
  <div className="metric"><div className="metric-value" data-stat="hailo_tops">52</div><div className="metric-label">TOPS Compute</div></div>
  <div className="metric"><div className="metric-value">5</div><div className="metric-label">Edge Nodes</div></div>
  <div className="metric"><div className="metric-value">207</div><div className="metric-label">Repositories</div></div>
  <div className="metric"><div className="metric-value">48+</div><div className="metric-label">Domains</div></div>
</section>

<section className="features">
  <div className="features-head">
    <h2>Everything you need</h2>
    <p>Sovereign infrastructure from edge to cloud, designed for intelligent systems.</p>
  </div>
  <div className="features-grid">
    <div className="feature-card">
      <div className="feature-icon">⚡</div>
      <h3>Edge Compute</h3>
      <p>Hailo-8 AI accelerators delivering 52 TOPS across distributed Pi 5 nodes.</p>
    </div>
    <div className="feature-card">
      <div className="feature-icon">🔗</div>
      <h3>Mesh Network</h3>
      <p>WireGuard mesh connecting every node with encrypted tunnels and failover.</p>
    </div>
    <div className="feature-card">
      <div className="feature-icon">🛡</div>
      <h3>Self-Healing</h3>
      <p>Autonomous watchdogs and heartbeats keep services alive without intervention.</p>
    </div>
    <div className="feature-card">
      <div className="feature-icon">📡</div>
      <h3>Global CDN</h3>
      <p>Cloudflare tunnels route 48+ domains through edge nodes worldwide.</p>
    </div>
    <div className="feature-card">
      <div className="feature-icon">🧠</div>
      <h3>Local AI</h3>
      <p>Ollama models running on-device with custom CECE personalities and TTS.</p>
    </div>
    <div className="feature-card">
      <div className="feature-icon">🔄</div>
      <h3>GitOps</h3>
      <p>Self-hosted Gitea with 207 repositories and automated GitHub mirroring.</p>
    </div>
  </div>
</section>

<section className="cta-section">
  <div className="cta-box">
    <h2>Ready to deploy?</h2>
    <p>Get started with BlackRoad OS in minutes. No vendor lock-in, no cloud dependency.</p>
    <button className="btn-hero">Deploy Now</button>
  </div>
</section>

<footer>
  <div className="footer-brand">BlackRoad</div>
  <div className="footer-links">
    <a href="https://blackroad-docs-hub.pages.dev">Docs</a>
    <a href="https://github.com/blackboxprogramming">GitHub</a>
    <a href="https://blackroad-status.pages.dev">Status</a>
    <a href="https://support-blackroad-io.pages.dev">Contact</a>
  </div>
  <div className="footer-copy">&copy; 2026 BlackRoad. All rights reserved.</div>
</footer>
<div className="grad-bar-bottom"></div>






      </div>
    </>
  );
}
