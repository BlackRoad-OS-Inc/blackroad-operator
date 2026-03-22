import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function LandingLight() {
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
        :root{--g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--g135:linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--bg:#000;--white:#fff;--black:#000;--border:#1a1a1a;--sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace}
        body{overflow-x:hidden;background:var(--bg);color:var(--white);font-family:var(--sg)}
        .grad-bar{height:4px;background:var(--g)}
        
        /* NAV — black text on white bg */
        nav{display:flex;align-items:center;justify-content:space-between;padding:16px 48px;border-bottom:1px solid var(--border)}
        .nav-logo{font-weight:700;font-size:20px;color:var(--white);display:flex;align-items:center;gap:10px}
        .nav-mark{width:28px;height:4px;border-radius:2px;background:var(--g)}
        .nav-links{display:flex;gap:32px}
        .nav-links a{font-size:14px;font-weight:500;color:var(--white);opacity:.4;text-decoration:none;transition:opacity .2s}
        .nav-links a:hover{opacity:1}
        .btn-nav{padding:8px 20px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sg)}
        .btn-nav-outline{background:transparent;border:1px solid var(--border);color:var(--white)}
        .btn-nav-solid{background:var(--black);border:none;color:var(--white)}
        
        /* HERO */
        .hero{text-align:center;padding:120px 48px 80px;position:relative;overflow:hidden}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border:1px solid var(--border);border-radius:20px;font-size:12px;font-weight:500;color:var(--white);margin-bottom:32px}
        .hero-badge-dot{width:8px;height:8px;border-radius:50%;background:var(--g135)}
        .hero h1{font-size:64px;font-weight:700;color:var(--white);line-height:1.1;margin-bottom:24px;max-width:750px;margin-left:auto;margin-right:auto}
        .hero p{font-size:18px;color:var(--white);opacity:.4;max-width:480px;margin:0 auto 48px;line-height:1.7}
        .hero-cta{display:flex;gap:16px;justify-content:center}
        .btn-hero{padding:14px 36px;border:none;border-radius:8px;background:var(--white);color:var(--black);font-size:15px;font-weight:600;cursor:pointer;font-family:var(--sg)}
        .btn-hero-outline{padding:14px 36px;border:1px solid var(--border);border-radius:8px;background:transparent;color:var(--white);font-size:15px;font-weight:600;cursor:pointer;font-family:var(--sg)}
        
        /* DECORATIVE ORBS — colorful! */
        .hero-orb{position:absolute;border-radius:50%;filter:blur(100px);opacity:.1;pointer-events:none}
        .hero-orb-1{width:500px;height:500px;background:#FF2255;top:-100px;left:5%}
        .hero-orb-2{width:400px;height:400px;background:#4488FF;top:0;right:5%}
        .hero-orb-3{width:300px;height:300px;background:#CC00AA;bottom:-50px;left:35%}
        
        /* FEATURES */
        .features{padding:80px 48px;max-max-width:1100px;width:100%;margin:0 auto}
        .features-head{text-align:center;margin-bottom:64px}
        .features-head h2{font-size:36px;font-weight:700;color:var(--white);margin-bottom:12px}
        .features-head p{font-size:15px;color:var(--white);opacity:.4;max-width:420px;margin:0 auto}
        .features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
        .feature-card{border:1px solid var(--border);border-radius:12px;padding:32px;transition:border-color .2s}
        .feature-card:hover{border-color:#333}
        /* Colored accent bar on top — decorative, no text */
        .feature-card::before{content:'';display:block;height:3px;border-radius:2px;margin-bottom:20px}
        .feature-card::before{background:var(--g);width:40px}
        .feature-card h3{font-size:16px;font-weight:600;color:var(--white);margin-bottom:8px}
        .feature-card p{font-size:13px;color:var(--white);opacity:.4;line-height:1.7}
        
        /* METRICS */
        .metrics{display:flex;justify-content:center;gap:64px;padding:64px 48px;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
        .metric{text-align:center}
        .metric-value{font-size:40px;font-weight:700;color:var(--white)}
        .metric-label{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.3;letter-spacing:.08em;text-transform:uppercase;margin-top:4px}
        
        /* CTA */
        .cta-section{padding:80px 48px;text-align:center}
        .cta-box{max-width:700px;margin:0 auto;padding:64px;border:1px solid var(--border);border-radius:16px;position:relative;overflow:hidden}
        .cta-box::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g)}
        .cta-box h2{font-size:32px;font-weight:700;color:var(--white);margin-bottom:12px}
        .cta-box p{font-size:14px;color:var(--white);opacity:.4;margin-bottom:32px;max-width:400px;margin-left:auto;margin-right:auto}
        .btn-cta{padding:14px 36px;border:none;border-radius:8px;background:var(--white);color:var(--black);font-size:15px;font-weight:600;cursor:pointer;font-family:var(--sg)}
        
        /* FOOTER */
        footer{border-top:1px solid var(--border);padding:48px;display:flex;justify-content:space-between;align-items:center}
        .footer-brand{font-weight:700;font-size:16px;color:var(--white)}
        .footer-links{display:flex;gap:24px}
        .footer-links a{font-size:13px;color:var(--white);opacity:.4;text-decoration:none}
        .footer-links a:hover{opacity:1}
        .footer-copy{font-size:12px;color:var(--white);opacity:.3}
        
        @media(max-width:768px){
          nav{padding:14px 20px;flex-wrap:wrap;gap:12px}.nav-links{display:none}
          .hero{padding:80px 20px 60px}.hero h1{font-size:36px}
          .hero-cta{flex-direction:column;align-items:center}
          .metrics{flex-wrap:wrap;gap:32px;padding:32px 20px}
          .features{padding:48px 20px}.features-grid{grid-template-columns:1fr}
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
  <div style={{{ display: "flex", gap: 10 }}}>
    <button className="btn-nav btn-nav-outline">Sign In</button>
    <button className="btn-nav btn-nav-solid">Get Started</button>
  </div>
</nav>

<section className="hero">
  <div className="hero-orb hero-orb-1"></div>
  <div className="hero-orb hero-orb-2"></div>
  <div className="hero-orb hero-orb-3"></div>
  <div className="hero-badge"><div className="hero-badge-dot"></div> Now Available</div>
  <h1>Infrastructure you own, intelligence you control</h1>
  <p>A distributed operating system for autonomous agents, running entirely on your hardware.</p>
  <div className="hero-cta">
    <button className="btn-hero">Start Building</button>
    <button className="btn-hero-outline">Documentation</button>
  </div>
</section>

<section className="metrics">
  <div className="metric"><div className="metric-value" data-stat="hailo_tops">52</div><div className="metric-label">TOPS Compute</div></div>
  <div className="metric"><div className="metric-value">5</div><div className="metric-label">Edge Nodes</div></div>
  <div className="metric"><div className="metric-value">207</div><div className="metric-label">Repositories</div></div>
  <div className="metric"><div className="metric-value">99.7%</div><div className="metric-label">Uptime</div></div>
</section>

<section className="features">
  <div className="features-head">
    <h2>Built for sovereignty</h2>
    <p>Every component runs on hardware you physically control.</p>
  </div>
  <div className="features-grid">
    <div className="feature-card">
      <h3>Edge Compute</h3>
      <p>Hailo-8 AI accelerators delivering 52 TOPS of neural inference at the edge.</p>
    </div>
    <div className="feature-card">
      <h3>Mesh Network</h3>
      <p>WireGuard encrypted tunnels connecting every node with automatic failover.</p>
    </div>
    <div className="feature-card">
      <h3>Self-Healing</h3>
      <p>Autonomous watchdogs keep services alive without manual intervention.</p>
    </div>
    <div className="feature-card">
      <h3>Global CDN</h3>
      <p>Cloudflare tunnels route 48+ domains through your local infrastructure.</p>
    </div>
    <div className="feature-card">
      <h3>Local AI</h3>
      <p>Ollama models running on-device with custom personalities and TTS.</p>
    </div>
    <div className="feature-card">
      <h3>GitOps</h3>
      <p>Self-hosted Gitea with 207 repositories and automated mirroring.</p>
    </div>
  </div>
</section>

<section className="cta-section">
  <div className="cta-box">
    <h2>Ready to take control?</h2>
    <p>Deploy BlackRoad OS on your hardware in minutes. No cloud required.</p>
    <button className="btn-cta">Get Started Free</button>
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
  <div className="footer-copy">&copy; 2026 BlackRoad</div>
</footer>
<div className="grad-bar"></div>






      </div>
    </>
  );
}
