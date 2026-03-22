import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function BlackroadCloud() {
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
        .orb-1{width:400px;height:400px;background:#00D4FF;top:-150px;left:-5%}
        .orb-2{width:350px;height:350px;background:#8844FF;top:-100px;right:-5%}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border:1px solid var(--border);border-radius:20px;font-size:12px;font-weight:500;color:var(--white);margin-bottom:32px}
        .hero-badge-dot{width:8px;height:8px;border-radius:50%;background:var(--g135)}
        .hero h1{font-size:64px;font-weight:700;color:var(--white);line-height:1.08;margin-bottom:24px;max-width:780px;margin-left:auto;margin-right:auto;letter-spacing:-.02em}
        .hero p{font-size:18px;color:var(--white);opacity:.45;max-width:520px;margin:0 auto 48px;line-height:1.7}
        .hero-cta{display:flex;gap:16px;justify-content:center}
        .btn-lg{padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;font-family:var(--sg)}
        .btn-lg-solid{background:var(--white);color:var(--black);border:none}
        .btn-lg-outline{background:transparent;color:var(--white);border:1px solid var(--border);transition:border-color .2s}
        .btn-lg-outline:hover{border-color:#444}
        
        /* ═══ SECTIONS ═══ */
        .section{max-max-width:1100px;width:100%;margin:0 auto;padding:80px 48px}
        .section-label{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.25;letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px}
        .section-title{font-size:32px;font-weight:700;color:var(--white);margin-bottom:12px;letter-spacing:-.015em}
        .section-desc{font-size:14px;color:var(--white);opacity:.4;max-width:460px;margin-bottom:48px}
        
        /* ═══ SERVICE TIERS — outlined cards, 3-col ═══ */
        .tier-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .tier-card{border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;transition:border-color .2s}
        .tier-card:hover{border-color:#333}
        .tier-card.featured{position:relative}
        .tier-card.featured::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g);border-radius:10px 10px 0 0;image-rendering:crisp-edges}
        .tier-header{padding:28px 24px 20px;border-bottom:1px solid var(--border)}
        .tier-name{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.3;letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px}
        .tier-price{font-size:36px;font-weight:700;color:var(--white)}
        .tier-period{font-size:13px;color:var(--white);opacity:.3}
        .tier-desc{font-size:12px;color:var(--white);opacity:.35;margin-top:8px;line-height:1.6}
        .tier-body{padding:24px;flex:1}
        .tier-features{list-style:none}
        .tier-features li{font-size:13px;color:var(--white);opacity:.5;padding:8px 0;display:flex;align-items:center;gap:10px}
        .tier-features li::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--g135);flex-shrink:0}
        .tier-features li.off::before{background:none;border:1px solid var(--border);width:5px;height:5px}
        .tier-features li.off{opacity:.25}
        .tier-footer{padding:16px 24px 24px}
        .btn-tier{width:100%;padding:12px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sg)}
        .btn-tier-outline{background:transparent;border:1px solid var(--border);color:var(--white);transition:border-color .2s}
        .btn-tier-outline:hover{border-color:#444}
        .btn-tier-solid{background:var(--white);border:none;color:var(--black)}
        
        /* ═══ REGION MAP — outlined cards with status ═══ */
        .region-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .region-card{border:1px solid var(--border);border-radius:8px;padding:20px;transition:border-color .2s}
        .region-card:hover{border-color:#333}
        .region-flag{font-size:11px;color:var(--white);opacity:.5;margin-bottom:8px;display:flex;align-items:center;gap:6px}
        .region-flag::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--g135)}
        .region-name{font-size:14px;font-weight:600;color:var(--white);margin-bottom:4px}
        .region-detail{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2;line-height:1.8}
        
        /* ═══ RESOURCE TABLE — lined rows ═══ */
        .res-table{width:100%;border-collapse:collapse}
        .res-table th{text-align:left;font-family:var(--jb);font-size:10px;color:var(--white);opacity:.25;letter-spacing:.06em;text-transform:uppercase;padding:12px 0;border-bottom:1px solid var(--border)}
        .res-table td{font-size:13px;color:var(--white);opacity:.5;padding:14px 0;border-bottom:1px solid var(--border)}
        .res-table tr:first-child td{border-top:1px solid var(--border)}
        .res-table code{font-family:var(--jb);font-size:12px;padding:2px 6px;border:1px solid var(--border);border-radius:3px;color:var(--white);opacity:.6}
        .res-table .res-bar{width:100px;height:4px;border-radius:2px;background:var(--border);overflow:hidden}
        .res-table .res-bar-fill{height:100%;border-radius:2px;background:var(--g);image-rendering:crisp-edges}
        
        /* ═══ UPTIME STRIP — gradient bars ═══ */
        .uptime-section{border:1px solid var(--border);border-radius:10px;padding:24px;overflow:hidden}
        .uptime-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
        .uptime-title{font-size:14px;font-weight:600;color:var(--white)}
        .uptime-pct{font-family:var(--jb);font-size:13px;color:var(--white);opacity:.4}
        .uptime-bar{display:flex;gap:2px;height:24px}
        .uptime-day{flex:1;border-radius:2px;background:var(--g135);transition:opacity .15s}
        .uptime-day:hover{opacity:.7}
        .uptime-day.warn{opacity:.4}
        .uptime-day.down{background:var(--white);opacity:.1}
        .uptime-legend{display:flex;justify-content:space-between;margin-top:6px}
        .uptime-legend span{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.15}
        
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
        
        @media(max-max-width:1024px;width:100%){.region-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:768px){
          nav{padding:14px 20px;flex-wrap:wrap;gap:12px}.nav-links{display:none}
          .hero{padding:80px 20px 60px}.hero h1{font-size:36px}
          .hero-cta{flex-direction:column;align-items:center}
          .section{padding:48px 20px}
          .tier-grid{grid-template-columns:1fr}
          .region-grid{grid-template-columns:1fr}
          .metrics-bar{grid-template-columns:repeat(2,1fr);gap:24px}
          .cta{padding:48px 20px}
          footer{flex-direction:column;gap:16px;text-align:center;padding:32px 20px}
        }
        
      `}</style>

      <div style={{ background: "#000", minHeight: "100vh", color: "#f5f5f5", overflowX: "hidden", width: "100%", fontFamily: grotesk }}>





<div className="grad-bar"></div>





<nav>
  <div className="nav-logo"><img src="blackroad-logo.png" alt="BlackRoad" style={{{ width: 32, height: 32, borderRadius: "50%" }}} /> BlackRoad Cloud</div>
  <div className="nav-links">
    <a href="#services">Services</a>
    <a href="#infra">Infrastructure</a>
    <a href="#resources">Resources</a>
    <a href="https://blackroad-io.pages.dev">BlackRoad OS Inc</a>
  </div>
  <div className="nav-cta">
    <a className="btn-outline" href="#resources" style={{{ textDecoration: "none" }}}>Console</a>
    <a className="btn-solid" href="https://blackroad-os-home.pages.dev" style={{{ textDecoration: "none" }}}>Deploy</a>
  </div>
</nav>





<section className="hero">
  <div className="orb orb-1"></div>
  <div className="orb orb-2"></div>
  <div className="hero-badge"><div className="hero-badge-dot"></div> 100 Pages · 43 KV · 18 D1 · 10 R2</div>
  <h1>Sovereign cloud on Cloudflare</h1>
  <p>100 Pages projects, 43 KV namespaces, 18 D1 databases, 10 R2 buckets, and 18 encrypted tunnels routing 48+ domains to self-hosted Pi infrastructure. $136/month total.</p>
  <div className="hero-cta">
    <a className="btn-lg btn-lg-solid" href="#services" style={{{ textDecoration: "none" }}}>View Services</a>
    <a className="btn-lg btn-lg-outline" href="#resources" style={{{ textDecoration: "none" }}}>Resource Table</a>
  </div>
</section>








<section className="section">
  <div className="section-label" id="services">Cloudflare Services</div>
  <div className="section-title">What's running</div>
  <div className="section-desc">Three tiers of cloud infrastructure — edge compute, storage, and tunnel routing.</div>
  <div className="tier-grid">
    <div className="tier-card">
      <div className="tier-header">
        <div className="tier-name">Pages</div>
        <div><span className="tier-price">100</span><span className="tier-period"> projects</span></div>
        <div className="tier-desc">Static sites, dashboards, and web apps deployed globally on Cloudflare's edge network.</div>
      </div>
      <div className="tier-body">
        <ul className="tier-features">
          <li>blackroad.io — main site</li>
          <li>blackroadai.com — AI division</li>
          <li>lucidia.earth — AI companion</li>
          <li>dashboard.blackroad.io</li>
          <li>status.blackroad.io</li>
        </ul>
      </div>
      <div className="tier-footer"><a className="btn-tier btn-tier-outline" href="#resources" style={{{ textDecoration: "none" }}}>View All</a></div>
    </div>
    <div className="tier-card featured">
      <div className="tier-header">
        <div className="tier-name">Storage</div>
        <div><span className="tier-price">43 KV + 10 R2</span></div>
        <div className="tier-desc">Key-value state, object storage, and 18 D1 SQL databases across the edge.</div>
      </div>
      <div className="tier-body">
        <ul className="tier-features">
          <li>CECE_MEMORY — AI context</li>
          <li>AGENTS_KV — agent state</li>
          <li>BILLING + SUBSCRIPTIONS</li>
          <li>blackroad-models (R2) — model weights</li>
          <li>blackroad-codex (R2) — artifacts</li>
        </ul>
      </div>
      <div className="tier-footer"><a className="btn-tier btn-tier-solid" href="#resources" style={{{ textDecoration: "none" }}}>View Resources</a></div>
    </div>
    <div className="tier-card">
      <div className="tier-header">
        <div className="tier-name">Tunnels</div>
        <div><span className="tier-price">18</span><span className="tier-period"> active</span></div>
        <div className="tier-desc">Encrypted tunnels from Cloudflare edge to self-hosted Pi nodes. No open ports.</div>
      </div>
      <div className="tier-body">
        <ul className="tier-features">
          <li>Alice — 65+ hostname routes</li>
          <li>Cecilia — 22 hostnames</li>
          <li>Octavia — 10 hostnames</li>
          <li>Lucidia — 4 hostnames</li>
          <li>WireGuard mesh failover</li>
        </ul>
      </div>
      <div className="tier-footer"><a className="btn-tier btn-tier-outline" href="#infra" style={{{ textDecoration: "none" }}}>View Topology</a></div>
    </div>
  </div>
</section>






<section className="section">
  <div className="section-label" id="infra">Infrastructure</div>
  <div className="section-title">Edge nodes</div>
  <div className="section-desc">Four active <a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--white)", opacity: ".5", textDecoration: "underline", textUnderlineOffset: 3 }}}>Pi nodes</a> plus two DigitalOcean droplets behind Cloudflare tunnels.</div>
  <div className="region-grid">
    <a href="https://blackroad-infra.pages.dev#fleet" className="region-card" style={{{ textDecoration: "none" }}}><div className="region-flag">●</div><div className="region-name">Alice — 192.168.4.49</div><div className="region-detail">Pi 400 · Gateway + DNS<br />65+ tunnel routes · Pi-hole · PostgreSQL</div></a>
    <a href="https://blackroad-infra.pages.dev#fleet" className="region-card" style={{{ textDecoration: "none" }}}><div className="region-flag" style={{{ opacity: ".3" }}}>○</div><div className="region-name">Cecilia — 192.168.4.96 (DOWN)</div><div className="region-detail">Pi 5 · <a href="https://blackroadai-com.pages.dev" style={{{ color: "var(--white)", opacity: ".3", textDecoration: "underline", textUnderlineOffset: 3 }}}>AI Inference</a><br /><a href="https://blackroad-infra.pages.dev#accelerators" style={{{ color: "var(--white)", opacity: ".3", textDecoration: "underline", textUnderlineOffset: 3 }}}>Hailo-8</a> · 16 Ollama models · 22 hostnames</div></a>
    <a href="https://blackroad-infra.pages.dev#fleet" className="region-card" style={{{ textDecoration: "none" }}}><div className="region-flag">●</div><div className="region-name">Octavia — 192.168.4.100</div><div className="region-detail">Pi 5 · Storage + <a href="https://blackroad-operator.pages.dev#infrastructure" style={{{ color: "var(--white)", opacity: ".3", textDecoration: "underline", textUnderlineOffset: 3 }}}>Swarm</a><br />1TB NVMe · Gitea · 10 hostnames</div></a>
    <div className="region-card"><div className="region-flag">●</div><div className="region-name">Anastasia — DO nyc3</div><div className="region-detail">4 CPU / 8GB · WireGuard Hub<br />Headscale · Nginx · WebSockets</div></div>
    <a href="https://blackroad-infra.pages.dev#fleet" className="region-card" style={{{ textDecoration: "none" }}}><div className="region-flag">●</div><div className="region-name">Aria — 192.168.4.98</div><div className="region-detail">Pi 5 · Portainer + Headscale<br />1 Docker container · 6 Ollama models</div></a>
    <a href="https://blackroad-infra.pages.dev#fleet" className="region-card" style={{{ textDecoration: "none" }}}><div className="region-flag">●</div><div className="region-name">Lucidia — 192.168.4.38</div><div className="region-detail">Pi 5 · APIs + Web Apps<br />14 Docker containers · 6 Ollama models</div></a>
  </div>
</section>







<section className="section">
  <div className="section-label" id="resources">Resources</div>
  <div className="section-title">KV namespaces</div>
  <div className="section-desc">44 key-value namespaces powering agent state, billing, memory, and caching.</div>
  <table className="res-table">
    <thead><tr><th>Resource</th><th>Type</th><th>Usage</th><th>Status</th></tr></thead>
    <tbody>
      <tr><td>CECE_MEMORY</td><td><code>KV</code></td><td><div className="res-bar"><div className="res-bar-fill" style={{{ width: "72%" }}}></div></div></td><td>Active</td></tr>
      <tr><td>AGENTS_KV</td><td><code>KV</code></td><td><div className="res-bar"><div className="res-bar-fill" style={{{ width: "45%" }}}></div></div></td><td>Active</td></tr>
      <tr><td>blackroad-models</td><td><code>R2</code></td><td><div className="res-bar"><div className="res-bar-fill" style={{{ width: "88%" }}}></div></div></td><td>Active</td></tr>
      <tr><td>blackroad-api-gateway</td><td><code>D1</code></td><td><div className="res-bar"><div className="res-bar-fill" style={{{ width: "31%" }}}></div></div></td><td>Active</td></tr>
    </tbody>
  </table>
</section>







<section className="section">
  <div className="uptime-section">
    <div className="uptime-header"><span className="uptime-title">Tunnel Uptime (30 days)</span><span className="uptime-pct">96.2%</span></div>
    <div className="uptime-bar">
      <div className="uptime-day"></div><div className="uptime-day"></div><div className="uptime-day"></div><div className="uptime-day"></div><div className="uptime-day"></div>
      <div className="uptime-day"></div><div className="uptime-day"></div><div className="uptime-day warn"></div><div className="uptime-day"></div><div className="uptime-day"></div>
      <div className="uptime-day"></div><div className="uptime-day"></div><div className="uptime-day"></div><div className="uptime-day"></div><div className="uptime-day"></div>
      <div className="uptime-day"></div><div className="uptime-day"></div><div className="uptime-day"></div><div className="uptime-day"></div><div className="uptime-day"></div>
      <div className="uptime-day"></div><div className="uptime-day"></div><div className="uptime-day"></div><div className="uptime-day"></div><div className="uptime-day"></div>
      <div className="uptime-day"></div><div className="uptime-day"></div><div className="uptime-day"></div><div className="uptime-day"></div><div className="uptime-day"></div>
    </div>
    <div className="uptime-legend"><span>Feb 7</span><span>Mar 9</span></div>
  </div>
</section>





<section className="section">
  <div className="metrics-bar">
    <div className="metric"><div className="metric-val">100</div><div className="metric-label">Pages Projects</div></div>
    <div className="metric"><div className="metric-val">43</div><div className="metric-label">KV Namespaces</div></div>
    <div className="metric"><div className="metric-val">10</div><div className="metric-label">R2 Buckets</div></div>
    <div className="metric"><div className="metric-val">$136</div><div className="metric-label">Monthly Cost</div></div>
  </div>
</section>





<section className="cta">
  <div className="cta-box">
    <h2>$136/month runs the whole thing</h2>
    <p>What would cost $3,756 in commercial cloud runs on <a href="https://blackroad-infra.pages.dev#fleet" style={{{ color: "var(--black)", textDecoration: "underline", textUnderlineOffset: 3 }}}>five Pis</a> and Cloudflare's free tier. See the <a href="https://finance-blackroad-io.pages.dev#economics" style={{{ color: "var(--black)", textDecoration: "underline", textUnderlineOffset: 3 }}}>full cost breakdown</a>.</p>
    <a className="btn-lg btn-lg-solid" href="https://blackroad-os-home.pages.dev" style={{{ textDecoration: "none" }}}>Deploy Your Own</a>
  </div>
</section>

<section className="section" style={{{ paddingBottom: 0 }}}>
  <div className="section-label">Related</div>
  <div className="section-title">Go deeper</div>
  <div style={{{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}}>
    <a href="https://blackroad-infra.pages.dev#fleet" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "inline-flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> 5-Node Fleet</a>
    <a href="https://blackroad-guardian-dashboard.pages.dev" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "inline-flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> Security & Encryption</a>
    <a href="https://blackroadai-com.pages.dev" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "inline-flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> AI Inference Layer</a>
    <a href="https://finance-blackroad-io.pages.dev#economics" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "inline-flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> $136/mo Economics</a>
    <a href="https://blackroad-assets.pages.dev" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "inline-flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> Data Archive</a>
    <a href="https://blackroad-os-home.pages.dev" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "inline-flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> CLI Deploy Tools</a>
  </div>
</section>

<footer>
  <div className="footer-brand"><a href="https://blackroad-io.pages.dev" style={{{ color: "inherit", textDecoration: "none" }}}>BlackRoad Cloud</a></div>
  <div className="footer-links">
    <a href="#services">Services</a>
    <a href="https://blackroad-infra.pages.dev">Hardware</a>
    <a href="https://blackroad-guardian-dashboard.pages.dev">Security</a>
    <a href="https://blackroad-os-home.pages.dev">OS</a>
    <a href="https://github.com/BlackRoad-Cloud" target="_blank">GitHub</a>
    <a href="https://blackroad-io.pages.dev">OS Inc</a>
  </div>
  <div className="footer-copy">&copy; 2026 BlackRoad Cloud. All rights reserved.</div>
</footer>
<div className="grad-bar"></div>







      </div>
    </>
  );
}
