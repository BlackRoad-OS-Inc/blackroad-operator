import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function PricingPage() {
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
        :root{--g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--bg:#000;--white:#fff;--black:#000;--border:#1a1a1a;--sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace}
        body{overflow-x:hidden;background:var(--bg);color:var(--white);font-family:var(--sg)}
        .grad-bar{height:4px;background:var(--g)}
        
        /* NAV */
        nav{display:flex;align-items:center;justify-content:space-between;padding:16px 48px;border-bottom:1px solid var(--border)}
        .nav-logo{font-weight:700;font-size:20px;color:var(--white);display:flex;align-items:center;gap:10px}
        .nav-mark{width:28px;height:4px;border-radius:2px;background:var(--g)}
        .nav-links{display:flex;gap:32px}
        .nav-links a{font-size:14px;font-weight:500;color:var(--white);opacity:.5;text-decoration:none;transition:opacity .2s}
        .nav-links a:hover{opacity:1}
        .nav-links a.active{opacity:1}
        
        /* HEADER */
        .page-header{text-align:center;padding:80px 48px 48px}
        .page-header h1{font-size:48px;font-weight:700;color:var(--white);margin-bottom:16px}
        .page-header p{font-size:16px;color:var(--white);opacity:.4;max-width:480px;margin:0 auto}
        
        /* TOGGLE */
        .toggle-row{display:flex;justify-content:center;gap:0;margin-bottom:64px}
        .toggle-btn{padding:10px 28px;border:1px solid var(--border);background:transparent;color:var(--white);opacity:.5;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sg);transition:all .2s}
        .toggle-btn:first-child{border-radius:6px 0 0 6px}
        .toggle-btn:last-child{border-radius:0 6px 6px 0;border-left:0}
        .toggle-btn.active{opacity:1;border-color:#333}
        
        /* PRICING CARDS */
        .pricing{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-max-width:1100px;width:100%;margin:0 auto;padding:0 48px 80px}
        .price-card{border:1px solid var(--border);border-radius:12px;display:flex;flex-direction:column;transition:border-color .2s}
        .price-card:hover{border-color:#333}
        .price-card.featured{border-color:#333;position:relative}
        .price-card.featured::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g);border-radius:12px 12px 0 0}
        .price-header{padding:32px 28px 24px;border-bottom:1px solid var(--border)}
        .price-name{font-size:14px;font-weight:600;color:var(--white);opacity:.5;text-transform:uppercase;letter-spacing:.06em;margin-bottom:16px}
        .price-amount{display:flex;align-items:baseline;gap:4px}
        .price-dollar{font-size:48px;font-weight:700;color:var(--white)}
        .price-period{font-size:14px;color:var(--white);opacity:.4}
        .price-desc{font-size:13px;color:var(--white);opacity:.4;margin-top:12px;line-height:1.6}
        .price-body{overflow-x:hidden;padding:28px;flex:1}
        .price-features{list-style:none}
        .price-features li{font-size:13px;color:var(--white);opacity:.7;padding:8px 0;display:flex;align-items:center;gap:10px}
        .price-features li::before{content:'';width:16px;height:16px;border-radius:50%;border:1px solid var(--border);flex-shrink:0;display:flex;align-items:center;justify-content:center}
        .price-features li.included::before{background:var(--g135);border:none}
        .price-footer{padding:20px 28px 28px}
        .btn-price{width:100%;padding:12px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;font-family:var(--sg);transition:all .2s}
        .btn-price-outline{background:transparent;border:1px solid var(--border);color:var(--white)}
        .btn-price-outline:hover{border-color:#444}
        .btn-price-solid{background:var(--white);border:none;color:var(--black)}
        
        /* FAQ */
        .faq{max-width:700px;margin:0 auto;padding:80px 48px}
        .faq h2{font-size:28px;font-weight:700;color:var(--white);text-align:center;margin-bottom:48px}
        .faq-item{border-bottom:1px solid var(--border);padding:20px 0}
        .faq-q{font-size:15px;font-weight:600;color:var(--white);cursor:pointer;display:flex;justify-content:space-between;align-items:center}
        .faq-q span{font-size:18px;color:var(--white);opacity:.3}
        .faq-a{font-size:13px;color:var(--white);opacity:.4;line-height:1.8;margin-top:12px;display:none}
        .faq-item.open .faq-a{display:block}
        
        footer{border-top:1px solid var(--border);padding:32px 48px;text-align:center;font-size:12px;color:var(--white);opacity:.3}
        
        @media(max-width:768px){
          .pricing{grid-template-columns:1fr;padding:0 20px 48px}
          .page-header{padding:48px 20px 32px}
          .page-header h1{font-size:32px}
          nav{padding:14px 20px}.nav-links{display:none}
          .faq{padding:48px 20px}
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
    <a href="#" className="active">Pricing</a>
    <a href="https://blackroad-research.pages.dev">Blog</a>
  </div>
</nav>

<div className="page-header">
  <h1>Self-hosted. Zero SaaS fees.</h1>
  <p>Everything runs on your hardware. The only cost is the hardware itself.</p>
</div>

<div className="toggle-row">
  <button className="toggle-btn active">Hardware</button>
  <button className="toggle-btn">vs SaaS</button>
</div>

<div className="pricing">
  <div className="price-card">
    <div className="price-header">
      <div className="price-name">Single Node</div>
      <div className="price-amount"><span className="price-dollar">~$80</span><span className="price-period">one-time</span></div>
      <div className="price-desc">One Raspberry Pi 5 (4GB) with SD card. Entry point for experimentation.</div>
    </div>
    <div className="price-body">
      <ul className="price-features">
        <li className="included">1 edge node (Pi 5)</li>
        <li className="included">Ollama local inference</li>
        <li className="included">Cloudflare tunnel (free tier)</li>
        <li className="included">WireGuard VPN</li>
        <li className="included">Self-healing watchdogs</li>
        <li>AI acceleration (Hailo-8)</li>
      </ul>
    </div>
    <div className="price-footer">
      <a href="https://blackroad-docs-hub.pages.dev" className="btn-price btn-price-outline" style={{{ textDecoration: "none", display: "block", textAlign: "center" }}}>View Setup Guide</a>
    </div>
  </div>

  <div className="price-card featured">
    <div className="price-header">
      <div className="price-name">Full Cluster</div>
      <div className="price-amount"><span className="price-dollar">~$650</span><span className="price-period">one-time</span></div>
      <div className="price-desc">5 Pi 5 nodes + 2 Hailo-8 accelerators. Our actual production setup.</div>
    </div>
    <div className="price-body">
      <ul className="price-features">
        <li className="included">5 edge nodes (Pi 5 cluster)</li>
        <li className="included">52 TOPS AI compute (2x Hailo-8)</li>
        <li className="included">1TB NVMe + SD storage</li>
        <li className="included">WireGuard mesh + RoadNet WiFi</li>
        <li className="included">48+ custom domains via tunnels</li>
        <li className="included">Docker Swarm orchestration</li>
      </ul>
    </div>
    <div className="price-footer">
      <a href="https://blackroad-infra.pages.dev" className="btn-price btn-price-solid" style={{{ textDecoration: "none", display: "block", textAlign: "center" }}}>See Hardware Fleet</a>
    </div>
  </div>

  <div className="price-card">
    <div className="price-header">
      <div className="price-name">Monthly Costs</div>
      <div className="price-amount"><span className="price-dollar">$136</span><span className="price-period">/month</span></div>
      <div className="price-desc">Electricity, 2 DigitalOcean droplets, domains. No SaaS subscriptions.</div>
    </div>
    <div className="price-body">
      <ul className="price-features">
        <li className="included">5 Pis @ ~$3/mo power = $15</li>
        <li className="included">2 droplets = $18/mo</li>
        <li className="included">Domains (48+) = ~$80/mo amortized</li>
        <li className="included">Cloudflare = $0 (free tier)</li>
        <li className="included">SaaS equivalent: $607+/mo</li>
        <li className="included">You save: $471+/mo</li>
      </ul>
    </div>
    <div className="price-footer">
      <a href="https://blackroad-operator.pages.dev" className="btn-price btn-price-outline" style={{{ textDecoration: "none", display: "block", textAlign: "center" }}}>See Cost Breakdown</a>
    </div>
  </div>
</div>

<div className="faq">
  <h2>Frequently asked questions</h2>
  <div className="faq-item open">
    <div className="faq-q">Why is this free? <span>−</span></div>
    <div className="faq-a" style={{{ display: "block" }}}>BlackRoad OS is fully self-hosted on hardware you own. There's no SaaS fee because there's no SaaS. You run everything — the code, the infrastructure, the AI models. The only ongoing costs are electricity and optional cloud VPS.</div>
  </div>
  <div className="faq-item">
    <div className="faq-q">What hardware do I need? <span>+</span></div>
    <div className="faq-a">Minimum: one Raspberry Pi 5 (4GB+) with a 32GB microSD card. Recommended: Pi 5 (8GB) with a Hailo-8 accelerator for AI inference. Our full fleet uses 5 Pi 5 boards with 2 Hailo-8 units (52 TOPS total).</div>
  </div>
  <div className="faq-item">
    <div className="faq-q">What does $607/mo in SaaS replace? <span>+</span></div>
    <div className="faq-a">n8n ($50), Temporal ($200), Airbyte ($300), Datadog ($20), Vercel Pro ($20), GitHub Team ($17). All replaced by self-hosted alternatives: Gitea, Docker Swarm, cron automation, and Cloudflare free tier.</div>
  </div>
  <div className="faq-item">
    <div className="faq-q">Can I start with one node and scale up? <span>+</span></div>
    <div className="faq-a">Yes. Start with a single Pi, install BlackRoad OS, and add nodes to the WireGuard mesh as you grow. Each new node auto-joins the cluster and gets a RoadNet subnet.</div>
  </div>
</div>

<footer>&copy; 2026 BlackRoad. All rights reserved.</footer>
<div className="grad-bar"></div>






      </div>
    </>
  );
}
