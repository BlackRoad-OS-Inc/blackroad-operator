import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function DashboardPage() {
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
        .grad-bar{height:3px;background:var(--g)}
        .dash-layout{display:grid;grid-template-columns:240px 1fr;min-height:100vh}
        .dash-sidebar{border-right:1px solid var(--border);padding:24px 16px;display:flex;flex-direction:column}
        .dash-logo{font-weight:700;font-size:18px;color:var(--white);display:flex;align-items:center;gap:10px;padding:0 8px;margin-bottom:32px}
        .dash-logo-mark{width:24px;height:3px;border-radius:2px;background:var(--g)}
        .dash-nav{list-style:none;flex:1}
        .dash-nav li{margin-bottom:2px}
        .dash-nav a{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:6px;font-size:13px;font-weight:500;color:var(--white);opacity:.4;text-decoration:none;transition:all .15s}
        .dash-nav a:hover{opacity:.7}
        .dash-nav a.active{opacity:1;border:1px solid var(--border)}
        .dash-nav-icon{font-size:16px;width:20px;text-align:center}
        .dash-nav-sep{height:1px;background:var(--border);margin:16px 8px}
        .dash-user{display:flex;align-items:center;gap:10px;padding:12px 8px;border-top:1px solid var(--border);margin-top:auto}
        .dash-avatar{width:32px;height:32px;border-radius:50%;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-weight:600;font-size:13px}
        .dash-user-name{font-size:13px;font-weight:500}
        .dash-user-role{font-size:11px;opacity:.3}
        .dash-main{padding:32px}
        .dash-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:32px}
        .dash-header h1{font-size:24px;font-weight:700}
        .live-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border:1px solid var(--border);border-radius:12px;font-family:var(--jb);font-size:11px;opacity:.5}
        .live-dot{width:6px;height:6px;border-radius:50%;background:var(--g135, #00D4FF);animation:pulse 2s infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}
        .stat-card{border:1px solid var(--border);border-radius:10px;padding:20px}
        .stat-label{font-family:var(--jb);font-size:10px;opacity:.3;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px}
        .stat-value{font-size:28px;font-weight:700}
        .stat-sub{font-family:var(--jb);font-size:11px;margin-top:4px;opacity:.4}
        .stat-bar{height:3px;border-radius:2px;margin-top:12px;background:var(--border);overflow:hidden}
        .stat-bar-fill{height:100%;border-radius:2px;background:var(--g);transition:width .5s}
        .table-card{border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:24px}
        .table-header{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--border)}
        .table-title{font-size:14px;font-weight:600}
        table{width:100%;border-collapse:collapse}
        th{text-align:left;font-family:var(--jb);font-size:10px;opacity:.3;letter-spacing:.06em;text-transform:uppercase;padding:10px 20px;border-bottom:1px solid var(--border)}
        td{font-size:13px;opacity:.6;padding:12px 20px;border-bottom:1px solid var(--border)}
        tr:last-child td{border-bottom:none}
        td.online{opacity:1}
        .dot{display:inline-block;width:6px;height:6px;border-radius:50%;margin-right:6px}
        .dot.up{background:var(--g135)}
        .dot.down{background:none;border:1px solid var(--white);opacity:.3;width:5px;height:5px}
        .dot.warn{background:var(--g135);opacity:.5}
        td code{font-family:var(--jb);font-size:12px}
        .detail-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
        .detail-card{border:1px solid var(--border);border-radius:10px;padding:20px}
        .detail-card h3{font-size:14px;font-weight:600;margin-bottom:16px}
        .detail-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px}
        .detail-row:last-child{border-bottom:none}
        .detail-key{opacity:.4;font-family:var(--jb);font-size:12px}
        .detail-val{font-family:var(--jb);font-size:12px}
        .error-msg{text-align:center;padding:48px;opacity:.3;font-size:14px}
        @media(max-max-width:1024px;width:100%){.dash-layout{grid-template-columns:1fr}.dash-sidebar{display:none}.stat-grid{grid-template-columns:repeat(2,1fr)}.detail-grid{grid-template-columns:1fr}}
        
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
<div className="dash-layout">
  <aside className="dash-sidebar">
    <div className="dash-logo"><div className="dash-logo-mark"></div> BlackRoad</div>
    <ul className="dash-nav">
      <li><a href="#" className="active"><span className="dash-nav-icon">◈</span> Dashboard</a></li>
      <li><a href="https://blackroad-status.pages.dev"><span className="dash-nav-icon">◇</span> Status</a></li>
      <li><a href="https://blackroad-docs-hub.pages.dev"><span className="dash-nav-icon">△</span> Docs</a></li>
      <li><a href="https://blackroad-monitoring.pages.dev"><span className="dash-nav-icon">○</span> Monitoring</a></li>
      <li><div className="dash-nav-sep"></div></li>
      <li><a href="https://blackroad.io"><span className="dash-nav-icon">□</span> Home</a></li>
      <li><a href="https://github.com/blackboxprogramming"><span className="dash-nav-icon">▽</span> GitHub</a></li>
    </ul>
    <div className="dash-user">
      <div className="dash-avatar">A</div>
      <div><div className="dash-user-name">Alexa</div><div className="dash-user-role">Admin</div></div>
    </div>
  </aside>

  <main className="dash-main">
    <div className="dash-header">
      <h1>Fleet Dashboard</h1>
      <div className="live-badge"><span className="live-dot"></span> <span id="live-ts">Connecting...</span></div>
    </div>

    <div className="stat-grid" id="stat-grid">
      <div className="stat-card"><div className="stat-label">Active Nodes</div><div className="stat-value" id="stat-nodes">—</div><div className="stat-sub" id="stat-nodes-sub">loading</div><div className="stat-bar"><div className="stat-bar-fill" id="stat-nodes-bar" style={{{ width: "0%" }}}></div></div></div>
      <div className="stat-card"><div className="stat-label">Total Models</div><div className="stat-value" id="stat-models">—</div><div className="stat-sub" id="stat-models-sub">loading</div><div className="stat-bar"><div className="stat-bar-fill" id="stat-models-bar" style={{{ width: "0%" }}}></div></div></div>
      <div className="stat-card"><div className="stat-label">Containers</div><div className="stat-value" id="stat-containers">—</div><div className="stat-sub" id="stat-containers-sub">loading</div><div className="stat-bar"><div className="stat-bar-fill" id="stat-containers-bar" style={{{ width: "0%" }}}></div></div></div>
      <div className="stat-card"><div className="stat-label">Avg Temp</div><div className="stat-value" id="stat-temp">—</div><div className="stat-sub" id="stat-temp-sub">loading</div><div className="stat-bar"><div className="stat-bar-fill" id="stat-temp-bar" style={{{ width: "0%" }}}></div></div></div>
    </div>

    <div className="table-card">
      <div className="table-header"><span className="table-title">Nodes</span></div>
      <table>
        <thead><tr><th>Name</th><th>Status</th><th>IP</th><th>Temp</th><th>Load</th><th>RAM</th><th>Disk</th><th>Models</th><th>Containers</th></tr></thead>
        <tbody id="node-table"><tr><td colspan="9" className="error-msg">Loading fleet data...</td></tr></tbody>
      </table>
    </div>

    <div className="detail-grid" id="detail-grid"></div>
  </main>
</div>








      </div>
    </>
  );
}
