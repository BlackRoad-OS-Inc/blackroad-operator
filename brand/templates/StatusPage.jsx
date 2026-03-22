import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function StatusPage() {
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
        html{-webkit-font-smoothing:antialiased}
        :root{--g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--g135:linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--bg:#000;--white:#fff;--black:#000;--border:#1a1a1a;--sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace}
        body{overflow-x:hidden;background:var(--bg);color:var(--white);font-family:var(--sg)}
        .grad-bar{height:4px;background:var(--g)}
        nav{display:flex;align-items:center;justify-content:space-between;padding:16px 48px;border-bottom:1px solid var(--border)}
        .nav-logo{font-weight:700;font-size:20px;color:var(--white);display:flex;align-items:center;gap:10px}
        .nav-mark{width:28px;height:4px;border-radius:2px;background:var(--g)}
        .nav-links{display:flex;gap:24px}
        .nav-links a{font-size:13px;font-weight:500;color:var(--white);opacity:.4;text-decoration:none;transition:opacity .15s}
        .nav-links a:hover{opacity:.8}
        .container{max-width:800px;margin:0 auto;padding:0 24px}
        
        .status-banner{margin:48px 0 32px;padding:20px 24px;border:1px solid var(--border);border-radius:10px;display:flex;align-items:center;gap:12px}
        .status-indicator{width:12px;height:12px;border-radius:50%;flex-shrink:0}
        .status-indicator.operational{background:var(--g135);box-shadow:0 0 12px rgba(136,68,255,.3)}
        .status-indicator.degraded{background:var(--g135);opacity:.5}
        .status-indicator.down{background:none;border:2px solid var(--white);opacity:.3;width:10px;height:10px}
        .status-text{font-size:16px;font-weight:600;color:var(--white)}
        .status-updated{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.3;margin-left:auto}
        
        .service-group{margin-bottom:32px}
        .service-group-title{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.3;letter-spacing:.1em;text-transform:uppercase;margin-bottom:12px}
        .service{display:flex;align-items:center;padding:14px 0;border-bottom:1px solid var(--border)}
        .service:first-child{border-top:1px solid var(--border)}
        .service-name{font-size:14px;font-weight:500;color:var(--white);flex:1}
        .service-meta{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.3;margin-right:16px}
        .service-status{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:500;color:var(--white);opacity:.6}
        .service-dot{width:6px;height:6px;border-radius:50%}
        .service-dot.up{background:var(--g135)}
        .service-dot.degraded{background:var(--g135);opacity:.5}
        .service-dot.down{background:none;border:1px solid var(--white);opacity:.3;width:5px;height:5px}
        
        .stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:32px 0}
        .stat-card{border:1px solid var(--border);border-radius:8px;padding:16px}
        .stat-label{font-family:var(--jb);font-size:10px;opacity:.3;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px}
        .stat-value{font-size:24px;font-weight:700}
        .stat-sub{font-family:var(--jb);font-size:11px;opacity:.3;margin-top:2px}
        
        .uptime-section{margin:48px 0}
        .uptime-section h2{font-size:18px;font-weight:600;color:var(--white);margin-bottom:24px}
        .uptime-row{margin-bottom:20px}
        .uptime-label{display:flex;justify-content:space-between;margin-bottom:6px}
        .uptime-name{font-size:13px;font-weight:500;color:var(--white)}
        .uptime-pct{font-family:var(--jb);font-size:12px;color:var(--white);opacity:.4}
        .uptime-bar{display:flex;gap:2px;height:28px}
        .uptime-day{flex:1;border-radius:2px;transition:opacity .15s}
        .uptime-day:hover{opacity:.8}
        .uptime-day.good{background:var(--g135)}
        .uptime-day.warn{background:var(--g135);opacity:.4}
        .uptime-day.bad{background:var(--white);opacity:.15}
        .uptime-day.none{background:var(--border)}
        .uptime-legend{display:flex;justify-content:space-between;margin-top:4px}
        .uptime-legend span{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
        
        .incidents{margin:48px 0 80px}
        .incidents h2{font-size:18px;font-weight:600;color:var(--white);margin-bottom:24px}
        .incident{border:1px solid var(--border);border-radius:8px;padding:20px;margin-bottom:12px}
        .incident-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
        .incident-title{font-size:14px;font-weight:600;color:var(--white)}
        .incident-date{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.3}
        .incident-body{overflow-x:hidden;font-size:13px;color:var(--white);opacity:.4;line-height:1.7}
        .incident-tag{display:inline-flex;align-items:center;gap:6px;padding:3px 8px;border:1px solid var(--border);border-radius:3px;font-size:10px;font-weight:600;color:var(--white);opacity:.5;margin-top:8px}
        .incident-tag::before{content:'';width:6px;height:6px;border-radius:50%}
        .incident-tag.resolved::before{background:var(--g135)}
        .incident-tag.investigating::before{background:var(--g135);opacity:.5}
        .no-incidents{text-align:center;padding:32px;opacity:.3;font-size:13px}
        
        footer{border-top:1px solid var(--border);padding:32px 48px;text-align:center;font-size:12px;color:var(--white);opacity:.3}
        footer a{color:var(--white);opacity:1;text-decoration:none}
        .grad-bar-bottom{height:4px;background:var(--g)}
        
        @media(max-width:768px){nav{padding:14px 20px}.container{padding:0 20px}.stats-row{grid-template-columns:repeat(2,1fr)}}
        
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
  <div className="nav-logo"><div className="nav-mark"></div> BlackRoad Status</div>
  <div className="nav-links">
    <a href="https://blackroad.io">Home</a>
    <a href="https://blackroad-dashboard.pages.dev">Dashboard</a>
    <a href="https://blackroad-docs-hub.pages.dev">Docs</a>
  </div>
</nav>

<div className="container">
  <div className="status-banner" id="banner">
    <div className="status-indicator" id="banner-dot"></div>
    <span className="status-text" id="banner-text">Checking systems...</span>
    <span className="status-updated" id="banner-updated">connecting</span>
  </div>

  <div className="stats-row" id="stats-row">
    <div className="stat-card"><div className="stat-label">Nodes Online</div><div className="stat-value" id="s-online">-</div><div className="stat-sub" id="s-online-sub">of 5</div></div>
    <div className="stat-card"><div className="stat-label">AI Models</div><div className="stat-value" id="s-models">-</div><div className="stat-sub">fleet total</div></div>
    <div className="stat-card"><div className="stat-label">Containers</div><div className="stat-value" id="s-containers">-</div><div className="stat-sub">running</div></div>
    <div className="stat-card"><div className="stat-label">Fleet Temp</div><div className="stat-value" id="s-temp">-</div><div className="stat-sub" id="s-temp-sub">average</div></div>
  </div>

  <div className="service-group">
    <div className="service-group-title">Edge Nodes</div>
    <div id="node-services">
      <div className="service"><span className="service-name">Loading...</span></div>
    </div>
  </div>

  <div className="service-group">
    <div className="service-group-title">Services</div>
    <div id="svc-services">
      <div className="service"><span className="service-name">Loading...</span></div>
    </div>
  </div>

  <div className="uptime-section">
    <h2>Node health (current)</h2>
    <div id="health-bars"></div>
  </div>

  <div className="incidents">
    <h2>Active issues</h2>
    <div id="incidents-list"></div>
  </div>
</div>

<footer>&copy; 2026 <a href="https://blackroad.io">BlackRoad OS, Inc.</a></footer>
<div className="grad-bar-bottom"></div>








      </div>
    </>
  );
}
