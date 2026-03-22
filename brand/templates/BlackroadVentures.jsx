import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function BlackroadVentures() {
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
        html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility;-webkit-text-stroke:.2px rgba(255,255,255,.1)}
        :root{--g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--g135:linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--bg:#000;--white:#fff;--black:#000;--border:#1a1a1a;--sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace}
        body{background:var(--bg);color:var(--white);font-family:var(--sg);overflow-x:hidden}
        .grad-bar{height:4px;background:var(--g);image-rendering:crisp-edges}
        nav{display:flex;align-items:center;justify-content:space-between;padding:16px 48px;border-bottom:1px solid var(--border)}
        .nav-logo{font-weight:700;font-size:20px;color:var(--white);display:flex;align-items:center;gap:10px;text-decoration:none}
        .nav-links{display:flex;gap:32px}
        .nav-links a{font-size:14px;font-weight:500;color:var(--white);opacity:.5;text-decoration:none;transition:opacity .2s}
        .nav-links a:hover{opacity:1}
        a.btn-outline,a.btn-solid,a.btn-lg{text-decoration:none;display:inline-flex;align-items:center}
        .btn-outline{padding:8px 20px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--white);font-size:13px;font-weight:600;font-family:var(--sg);transition:border-color .2s}
        .btn-outline:hover{border-color:#444}
        .btn-solid{padding:8px 20px;border:none;border-radius:6px;background:var(--white);color:var(--black);font-size:13px;font-weight:600;font-family:var(--sg)}
        .hero{text-align:center;padding:120px 48px 80px;position:relative}
        .orb{position:absolute;border-radius:50%;filter:blur(120px);opacity:.06;pointer-events:none}
        .orb-1{width:400px;height:400px;background:#FF2255;top:-150px;left:-5%}
        .orb-2{width:350px;height:350px;background:#4488FF;top:-100px;right:-5%}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border:1px solid var(--border);border-radius:20px;font-size:12px;font-weight:500;color:var(--white);margin-bottom:32px}
        .hero-badge-dot{width:8px;height:8px;border-radius:50%;background:var(--g135)}
        .hero h1{font-size:64px;font-weight:700;color:var(--white);line-height:1.08;margin-bottom:24px;max-width:780px;margin-left:auto;margin-right:auto;letter-spacing:-.02em}
        .hero p{font-size:18px;color:var(--white);opacity:.45;max-width:560px;margin:0 auto 48px;line-height:1.7}
        .hero-cta{display:flex;gap:16px;justify-content:center}
        .btn-lg{padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;font-family:var(--sg)}
        .btn-lg-solid{background:var(--white);color:var(--black);border:none}
        .btn-lg-outline{background:transparent;color:var(--white);border:1px solid var(--border);transition:border-color .2s}
        .section{max-max-width:1100px;width:100%;margin:0 auto;padding:80px 48px}
        .section-label{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.25;letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px}
        .section-title{font-size:32px;font-weight:700;color:var(--white);margin-bottom:12px;letter-spacing:-.015em}
        .section-desc{font-size:14px;color:var(--white);opacity:.4;max-width:560px;margin-bottom:48px;line-height:1.8}
        .metrics-strip{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
        .metric-cell{padding:28px 24px;border-right:1px solid var(--border)}
        .metric-cell:last-child{border-right:none}
        .metric-value{font-size:32px;font-weight:700;color:var(--white);margin-bottom:4px;letter-spacing:-.02em}
        .metric-label{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.25;letter-spacing:.06em;text-transform:uppercase}
        .org-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .org-card{border:1px solid var(--border);border-radius:10px;padding:20px;display:block;text-decoration:none;color:var(--white);transition:border-color .2s}
        .org-card:hover{border-color:#333}
        .org-name{font-size:14px;font-weight:600;color:var(--white);margin-bottom:4px}
        .org-repos{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
        .econ-list{border-top:1px solid var(--border)}
        .econ-row{display:grid;grid-template-columns:200px 1fr auto;gap:16px;padding:16px 0;border-bottom:1px solid var(--border);align-items:center}
        .econ-item{font-size:14px;font-weight:600;color:var(--white)}
        .econ-desc{font-size:13px;color:var(--white);opacity:.4}
        .econ-cost{font-family:var(--jb);font-size:13px;color:var(--white);opacity:.3}
        .thesis-card{border:1px solid var(--border);border-radius:12px;padding:48px;position:relative}
        .thesis-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g);border-radius:12px 12px 0 0;image-rendering:crisp-edges}
        .thesis-title{font-size:24px;font-weight:700;color:var(--white);margin-bottom:16px}
        .thesis-text{font-size:14px;color:var(--white);opacity:.4;line-height:2;max-width:640px}
        footer{border-top:1px solid var(--border);padding:48px;display:flex;justify-content:space-between;align-items:center}
        .footer-brand{font-weight:700;font-size:16px;color:var(--white);text-decoration:none}
        .footer-links{display:flex;gap:24px}
        .footer-links a{font-size:13px;color:var(--white);opacity:.4;text-decoration:none;transition:opacity .2s}
        .footer-links a:hover{opacity:1}
        .footer-copy{font-size:12px;color:var(--white);opacity:.2}
        @media(max-width:768px){
          nav{padding:14px 20px;flex-wrap:wrap;gap:12px}.nav-links{display:none}
          .hero{padding:80px 20px 60px}.hero h1{font-size:36px}
          .section{padding:48px 20px}.org-grid{grid-template-columns:repeat(2,1fr)}
          .thesis-card{padding:28px}
          .econ-row{grid-template-columns:1fr auto}.econ-desc{display:none}
          .metrics-strip{grid-template-columns:repeat(2,1fr)}
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
  <a href="https://blackroad-io.pages.dev" className="nav-logo"><img src="blackroad-logo.png" alt="BlackRoad" style={{{ width: 32, height: 32, borderRadius: "50%" }}} /> BlackRoad Ventures</a>
  <div className="nav-links"><a href="#thesis">Thesis</a><a href="#portfolio">Portfolio</a><a href="#economics">Economics</a></div>
  <div style={{{ display: "flex", gap: 10 }}}><a href="#economics" className="btn-outline">Cost Breakdown</a><a href="https://blackroad-io.pages.dev" className="btn-solid">OS Inc</a></div>
</nav>

<section className="hero" id="hero">
  <div className="orb orb-1"></div><div className="orb orb-2"></div>
  <div className="hero-badge"><div className="hero-badge-dot"></div> 16 Portfolio Orgs · $136/mo</div>
  <h1>Sovereign technology, self-funded</h1>
  <p>No VC, no cloud bills, no dependencies. 16 orgs, 1,573 repos, and an entire internet running on $136 a month.</p>
  <div className="hero-cta"><a href="#thesis" className="btn-lg btn-lg-solid">Read Thesis</a><a href="#portfolio" className="btn-lg btn-lg-outline">View Portfolio</a></div>
</section>

<div className="section" style={{{ paddingBottom: 0 }}}>
  <div className="metrics-strip">
    <div className="metric-cell"><div className="metric-value">16</div><div className="metric-label">Organizations</div></div>
    <div className="metric-cell"><div className="metric-value" data-stat="repos" data-stat="repos">627</div><div className="metric-label">Repositories</div></div>
    <div className="metric-cell"><div className="metric-value">$136</div><div className="metric-label">Monthly Cost</div></div>
    <div className="metric-cell"><div className="metric-value">$0</div><div className="metric-label">VC Funding</div></div>
  </div>
</div>

<section className="section" id="thesis">
  <div className="thesis-card">
    <div className="thesis-title">Own your infrastructure</div>
    <div className="thesis-text">
      The thesis is simple: if you own the hardware, you own the product. <a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>Five Raspberry Pis</a> and two DigitalOcean droplets replace AWS, GCP, and Azure. <a href="https://blackroad-systems.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>Cloudflare's free tier</a> handles DNS, CDN, and TLS for 48+ domains. The entire stack costs $136/month — less than a single EC2 instance with reserved capacity.<br /><br />
      No investors. No board. No runway. The infrastructure pays for itself because it costs almost nothing to run. The target is $19.99/month SaaS — one product that covers the entire infrastructure cost with margin.<br /><br />
      The browser is your computer now. That is not a metaphor. That is the <a href="https://blackroad-os-home.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>product</a>.
    </div>
  </div>
</section>

<section className="section" id="portfolio">
  <div className="section-label">Portfolio</div>
  <div className="section-title">17 organizations</div>
  <div className="section-desc">Every org is a division. Every division has real code. The portfolio is the ecosystem.</div>
  <div className="org-grid">
    <a href="https://blackroad-io.pages.dev" className="org-card"><div className="org-name">BlackRoad-OS-Inc</div><div className="org-repos">127 repos · Central data layer</div></a>
    <a href="https://blackroadai-com.pages.dev" className="org-card"><div className="org-name">BlackRoad AI</div><div className="org-repos">6 agents · Hailo-8 inference</div></a>
    <a href="https://blackroad-systems.pages.dev" className="org-card"><div className="org-name">BlackRoad Cloud</div><div className="org-repos">100 Pages · 43 KV · 10 R2</div></a>
    <a href="https://blackroad-guardian-dashboard.pages.dev" className="org-card"><div className="org-name">BlackRoad Security</div><div className="org-repos">6 tools · Zero trust</div></a>
    <a href="https://blackroad-infra.pages.dev" className="org-card"><div className="org-name">BlackRoad Hardware</div><div className="org-repos">7 tools · 52 TOPS</div></a>
    <a href="https://content-blackroad-io.pages.dev" className="org-card"><div className="org-name">BlackRoad Media</div><div className="org-repos">7 tools · BackRoad Social</div></a>
    <a href="https://education-blackroad-io.pages.dev" className="org-card"><div className="org-name">BlackRoad Education</div><div className="org-repos">3 tools · SM-2 algorithm</div></a>
    <a href="https://blackroad-metaverse.pages.dev" className="org-card"><div className="org-name">BlackRoad Interactive</div><div className="org-repos">8 tools · ECS engine</div></a>
    <a href="https://blackroad-assets.pages.dev" className="org-card"><div className="org-name">BlackRoad Archive</div><div className="org-repos">5 tools · 228 databases</div></a>
    <a href="https://creator-studio-blackroad-io.pages.dev" className="org-card"><div className="org-name">BlackRoad Studio</div><div className="org-repos">Brand lock system</div></a>
    <a href="https://blackroad-company.pages.dev" className="org-card"><div className="org-name">BlackRoad Foundation</div><div className="org-repos">5 tools · Operations</div></a>
    <a href="https://operations-blackroad-io.pages.dev" className="org-card"><div className="org-name">BlackRoad Gov</div><div className="org-repos">4 tools · Civic tech</div></a>
    <a href="https://blackroad-operator.pages.dev" className="org-card"><div className="org-name">Blackbox Enterprises</div><div className="org-repos">6 enterprise forks</div></a>
    <a href="https://research-lab-blackroad-io.pages.dev" className="org-card"><div className="org-name">BlackRoad Labs</div><div className="org-repos">Research · 1,012 equations</div></a>
    <a href="https://blackroad-os-home.pages.dev" className="org-card"><div className="org-name">BlackRoad OS</div><div className="org-repos">80+ CLI tools · 5 nodes</div></a>
    <a href="https://finance-blackroad-io.pages.dev" className="org-card"><div className="org-name">BlackRoad Ventures</div><div className="org-repos">This page · The thesis</div></a>
  </div>
</section>

<section className="section" id="economics">
  <div className="section-label">Economics</div>
  <div className="section-title">$136/month runs the whole thing</div>
  <div className="section-desc">96.4% cost reduction vs equivalent cloud infrastructure. Here is every dollar.</div>
  <div className="econ-list">
    <div className="econ-row"><div className="econ-item"><a href="https://blackroad-systems.pages.dev" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>DigitalOcean (2 droplets)</a></div><div className="econ-desc">gematria (4cpu/8GB) + anastasia (1cpu/1GB) — WireGuard hub, Headscale, APIs</div><div className="econ-cost">~$30/mo</div></div>
    <div className="econ-row"><div className="econ-item">Domains (~48)</div><div className="econ-desc">blackroad.io, blackroadai.com, lucidia.ai, and 45+ more across registrars</div><div className="econ-cost">~$106/yr</div></div>
    <div className="econ-row"><div className="econ-item"><a href="https://blackroad-systems.pages.dev" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>Cloudflare</a></div><div className="econ-desc">100 Pages, 43 KV, 10 R2, 18 D1, 18 tunnels — all on free tier</div><div className="econ-cost">$0/mo</div></div>
    <div className="econ-row"><div className="econ-item"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>5 Raspberry Pis</a></div><div className="econ-desc"><a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>Alice, Cecilia, Octavia, Aria, Lucidia</a> — electricity only after purchase</div><div className="econ-cost">~$5/mo</div></div>
    <div className="econ-row"><div className="econ-item"><a href="https://blackroad-infra.pages.dev#accelerators" style={{{ color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3 }}}>2x Hailo-8 accelerators</a></div><div className="econ-desc">52 TOPS total — one-time hardware purchase, no <a href="https://blackroadai-com.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>inference API</a> costs</div><div className="econ-cost">$0/mo</div></div>
  </div>
</section>

<section className="section" style={{{ paddingBottom: 0 }}}>
  <div className="section-label">Related</div>
  <div className="section-title">Go deeper</div>
  <div style={{{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}}>
    <a href="https://blackroad-infra.pages.dev#fleet" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "inline-flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> 5-Node Fleet</a>
    <a href="https://blackroad-systems.pages.dev" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "inline-flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> Cloudflare Stack</a>
    <a href="https://blackroadai-com.pages.dev" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "inline-flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> AI Agents</a>
    <a href="https://blackroad-guardian-dashboard.pages.dev" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "inline-flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> Security &amp; Encryption</a>
    <a href="https://blackroad-os-home.pages.dev" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "inline-flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> 80+ CLI Tools</a>
    <a href="https://creator-studio-blackroad-io.pages.dev" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "inline-flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> Brand Lock</a>
  </div>
</section>

<footer>
  <a href="https://blackroad-io.pages.dev" className="footer-brand">BlackRoad Ventures</a>
  <div className="footer-links"><a href="https://blackroad-io.pages.dev">OS Inc</a><a href="https://blackroad-systems.pages.dev">Cloud</a><a href="https://blackroad-infra.pages.dev">Hardware</a><a href="https://blackroad-os-home.pages.dev">BlackRoad OS</a><a href="https://blackroadai-com.pages.dev">AI</a></div>
  <div className="footer-copy">&copy; 2026 BlackRoad Ventures. All rights reserved.</div>
</footer>
<div className="grad-bar"></div>






      </div>
    </>
  );
}
