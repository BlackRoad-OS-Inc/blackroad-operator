import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function DocsPage() {
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
        body{background:var(--bg);color:var(--white);font-family:var(--sg)}
        .grad-bar{height:4px;background:var(--g)}
        
        /* NAV */
        nav{display:flex;align-items:center;justify-content:space-between;padding:16px 48px;border-bottom:1px solid var(--border)}
        .nav-logo{font-weight:700;font-size:20px;color:var(--white);display:flex;align-items:center;gap:10px}
        .nav-mark{width:28px;height:4px;border-radius:2px;background:var(--g)}
        .nav-search{padding:8px 16px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--white);font-size:13px;font-family:var(--sg);width:280px;outline:none}
        .nav-search::placeholder{color:var(--white);opacity:.3}
        
        /* LAYOUT */
        .docs-layout{display:grid;grid-template-columns:260px 1fr 200px;min-height:calc(100vh - 60px)}
        
        /* SIDEBAR */
        .sidebar{border-right:1px solid var(--border);padding:32px 24px;overflow-y:auto}
        .sidebar-section{margin-bottom:28px}
        .sidebar-title{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.3;letter-spacing:.1em;text-transform:uppercase;margin-bottom:12px}
        .sidebar-links{list-style:none}
        .sidebar-links li{margin-bottom:2px}
        .sidebar-links a{display:block;padding:6px 12px;border-radius:5px;font-size:13px;color:var(--white);opacity:.5;text-decoration:none;transition:all .15s}
        .sidebar-links a:hover{opacity:.8}
        .sidebar-links a.active{opacity:1;border-left:2px solid;border-image:var(--g) 1;padding-left:10px}
        
        /* CONTENT */
        .docs-content{padding:48px 56px;max-width:760px}
        .docs-breadcrumb{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.3;margin-bottom:32px}
        .docs-breadcrumb span{opacity:.6}
        .docs-content h1{font-size:36px;font-weight:700;color:var(--white);margin-bottom:16px}
        .docs-content .lead{font-size:16px;color:var(--white);opacity:.5;line-height:1.7;margin-bottom:40px}
        .docs-content h2{font-size:22px;font-weight:700;color:var(--white);margin:48px 0 16px;padding-top:24px;border-top:1px solid var(--border)}
        .docs-content h3{font-size:16px;font-weight:600;color:var(--white);margin:32px 0 12px}
        .docs-content p{font-size:14px;color:var(--white);opacity:.6;line-height:1.8;margin-bottom:20px}
        .docs-content ul{margin:12px 0 20px 20px}
        .docs-content li{font-size:14px;color:var(--white);opacity:.6;line-height:1.8;margin-bottom:4px}
        
        /* CODE BLOCKS */
        .code-block{border:1px solid var(--border);border-radius:8px;margin:20px 0;overflow:hidden}
        .code-header{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid var(--border)}
        .code-lang{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.3}
        .code-copy{padding:4px 10px;border:1px solid var(--border);border-radius:4px;background:transparent;color:var(--white);opacity:.4;font-size:11px;cursor:pointer;font-family:var(--jb)}
        .code-body{padding:16px;font-family:var(--jb);font-size:13px;color:var(--white);opacity:.8;line-height:1.7;overflow-x:auto}
        
        /* CALLOUT */
        .callout{border:1px solid var(--border);border-radius:8px;padding:16px 20px;margin:20px 0;position:relative}
        .callout::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:8px 0 0 8px}
        .callout-info::before{background:var(--g)}
        .callout-warn::before{background:var(--g)}
        .callout-title{font-size:13px;font-weight:600;color:var(--white);margin-bottom:4px}
        .callout-text{font-size:13px;color:var(--white);opacity:.5;line-height:1.6}
        
        /* TABLE */
        .docs-table{width:100%;border-collapse:collapse;margin:20px 0}
        .docs-table th{text-align:left;font-size:12px;font-weight:600;color:var(--white);opacity:.5;padding:10px 16px;border-bottom:1px solid var(--border);font-family:var(--jb);text-transform:uppercase;letter-spacing:.04em}
        .docs-table td{font-size:13px;color:var(--white);opacity:.6;padding:12px 16px;border-bottom:1px solid var(--border)}
        .docs-table code{font-family:var(--jb);font-size:12px;padding:2px 6px;border:1px solid var(--border);border-radius:3px}
        
        /* TOC */
        .toc{padding:48px 20px;position:sticky;top:0;height:fit-content}
        .toc-title{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.3;letter-spacing:.1em;text-transform:uppercase;margin-bottom:16px}
        .toc-links{list-style:none}
        .toc-links li{margin-bottom:8px}
        .toc-links a{font-size:12px;color:var(--white);opacity:.4;text-decoration:none;transition:opacity .15s}
        .toc-links a:hover{opacity:.8}
        .toc-links a.active{opacity:1}
        
        /* NAV BOTTOM */
        .docs-nav-bottom{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:64px;padding-top:32px;border-top:1px solid var(--border)}
        .docs-nav-link{border:1px solid var(--border);border-radius:8px;padding:16px 20px;text-decoration:none;transition:border-color .2s}
        .docs-nav-link:hover{border-color:#333}
        .docs-nav-label{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.3;text-transform:uppercase;letter-spacing:.08em}
        .docs-nav-title{font-size:14px;font-weight:600;color:var(--white);margin-top:4px}
        .docs-nav-link.next{text-align:right}
        
        @media(max-max-width:1024px;width:100%){.docs-layout{grid-template-columns:1fr}.sidebar,.toc{display:none}.docs-content{padding:32px 20px}}
        
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
  <div className="nav-logo"><img src="blackroad-logo.png" alt="BlackRoad" style={{{ width: 32, height: 32, borderRadius: "50%" }}} /> BlackRoad Docs</div>
  <input className="nav-search" placeholder="Search documentation..." type="text" />
</nav>

<div className="docs-layout">
  <aside className="sidebar">
    <div className="sidebar-section">
      <div className="sidebar-title">Getting Started</div>
      <ul className="sidebar-links">
        <li><a href="#" className="active">Introduction</a></li>
        <li><a href="#">Quick Start</a></li>
        <li><a href="#">Installation</a></li>
        <li><a href="#">Configuration</a></li>
      </ul>
    </div>
    <div className="sidebar-section">
      <div className="sidebar-title">Core Concepts</div>
      <ul className="sidebar-links">
        <li><a href="#">Architecture</a></li>
        <li><a href="#">Nodes</a></li>
        <li><a href="#">Mesh Network</a></li>
        <li><a href="#">Services</a></li>
      </ul>
    </div>
    <div className="sidebar-section">
      <div className="sidebar-title">Guides</div>
      <ul className="sidebar-links">
        <li><a href="#">Deploy a Node</a></li>
        <li><a href="#">Setup WireGuard</a></li>
        <li><a href="#">AI Inference</a></li>
        <li><a href="#">Monitoring</a></li>
      </ul>
    </div>
    <div className="sidebar-section">
      <div className="sidebar-title">API Reference</div>
      <ul className="sidebar-links">
        <li><a href="#">REST API</a></li>
        <li><a href="#">WebSocket</a></li>
        <li><a href="#">CLI</a></li>
      </ul>
    </div>
  </aside>

  <main className="docs-content">
    <div className="docs-breadcrumb">Docs <span>/</span> Getting Started <span>/</span> Introduction</div>
    <h1>Introduction</h1>
    <p className="lead">BlackRoad OS is a distributed operating system for autonomous agents, designed to run on edge hardware you own and control.</p>

    <div className="callout callout-info">
      <div className="callout-title">Prerequisites</div>
      <div className="callout-text">You'll need at least one Raspberry Pi 5 (4GB+), a microSD card, and a network connection to get started.</div>
    </div>

    <h2>Installation</h2>
    <p>Install the BlackRoad CLI to bootstrap your first node. The installer handles all dependencies automatically.</p>

    <div className="code-block">
      <div className="code-header">
        <span className="code-lang">bash</span>
        <button className="code-copy">Copy</button>
      </div>
      <div className="code-body">curl -fsSL https://install.blackroad.io | bash
brctl init --node alice
brctl status</div>
    </div>

    <h2>Architecture overview</h2>
    <p>BlackRoad OS consists of three layers: the mesh network (WireGuard), the service orchestrator (Docker Swarm), and the intelligence layer (Ollama + Hailo).</p>

    <table className="docs-table">
      <thead><tr><th>Layer</th><th>Technology</th><th>Purpose</th></tr></thead>
      <tbody>
        <tr><td>Network</td><td><code>WireGuard</code></td><td>Encrypted mesh between all nodes</td></tr>
        <tr><td>Orchestration</td><td><code>Docker Swarm</code></td><td>Service deployment and scaling</td></tr>
        <tr><td>Intelligence</td><td><code>Ollama</code></td><td>Local LLM inference</td></tr>
        <tr><td>Acceleration</td><td><code>Hailo-8</code></td><td>52 TOPS neural compute</td></tr>
      </tbody>
    </table>

    <h2>Configuration</h2>
    <p>Each node is configured through a YAML file that defines its role, services, and network settings.</p>

    <div className="code-block">
      <div className="code-header">
        <span className="code-lang">yaml</span>
        <button className="code-copy">Copy</button>
      </div>
      <div className="code-body">node:
  name: alice
  role: gateway
  network:
    wireguard:
      address: 10.8.0.6/24
      listen_port: 51820
  services:
    - pihole
    - postgresql
    - cloudflared</div>
    </div>

    <div className="callout callout-warn">
      <div className="callout-title">Important</div>
      <div className="callout-text">Never expose WireGuard private keys in version control. Use environment variables or a secrets manager.</div>
    </div>

    <h3>Next steps</h3>
    <ul>
      <li>Set up your first node with the Quick Start guide</li>
      <li>Learn about the mesh network architecture</li>
      <li>Configure AI inference with Ollama and Hailo-8</li>
    </ul>

    <div className="docs-nav-bottom">
      <a className="docs-nav-link prev" href="#">
        <div className="docs-nav-label">Previous</div>
        <div className="docs-nav-title">Overview</div>
      </a>
      <a className="docs-nav-link next" href="#">
        <div className="docs-nav-label">Next</div>
        <div className="docs-nav-title">Quick Start</div>
      </a>
    </div>
  </main>

  <aside className="toc">
    <div className="toc-title">On this page</div>
    <ul className="toc-links">
      <li><a href="#" className="active">Introduction</a></li>
      <li><a href="#">Installation</a></li>
      <li><a href="#">Architecture overview</a></li>
      <li><a href="#">Configuration</a></li>
      <li><a href="#">Next steps</a></li>
    </ul>
  </aside>
</div>






      </div>
    </>
  );
}
