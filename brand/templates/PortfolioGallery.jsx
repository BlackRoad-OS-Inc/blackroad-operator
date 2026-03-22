import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function PortfolioGallery() {
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
        
        nav{display:flex;align-items:center;justify-content:space-between;padding:16px 48px;border-bottom:1px solid var(--border)}
        .nav-logo{font-weight:700;font-size:20px;color:var(--white);display:flex;align-items:center;gap:10px}
        .nav-mark{width:28px;height:4px;border-radius:2px;background:var(--g)}
        .nav-links{display:flex;gap:32px}
        .nav-links a{font-size:14px;font-weight:500;color:var(--white);opacity:.5;text-decoration:none}
        .nav-links a:hover{opacity:1}
        
        /* HEADER */
        .page-header{padding:80px 48px 48px;max-max-width:1100px;width:100%;margin:0 auto}
        .page-header h1{font-size:48px;font-weight:700;color:var(--white);margin-bottom:16px}
        .page-header p{font-size:16px;color:var(--white);opacity:.4;max-width:520px}
        
        /* FILTER */
        .filter-bar{display:flex;gap:8px;padding:0 48px 48px;max-max-width:1100px;width:100%;margin:0 auto;flex-wrap:wrap}
        .filter-btn{padding:8px 18px;border:1px solid var(--border);border-radius:20px;background:transparent;color:var(--white);opacity:.4;font-size:12px;font-weight:500;cursor:pointer;font-family:var(--sg);transition:all .2s}
        .filter-btn:hover{opacity:.7;border-color:#333}
        .filter-btn.active{opacity:1;border-color:#444}
        
        /* GALLERY GRID */
        .gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-max-width:1100px;width:100%;margin:0 auto;padding:0 48px 80px}
        .gallery-item{border:1px solid var(--border);border-radius:12px;overflow:hidden;transition:border-color .2s;cursor:pointer}
        .gallery-item:hover{border-color:#333}
        .gallery-thumb{aspect-ratio:16/10;position:relative;overflow:hidden}
        /* Gradient placeholder thumbnails — decorative shapes only */
        .gallery-thumb .thumb-bg{position:absolute;inset:0}
        .t1 .thumb-bg{background:linear-gradient(135deg,#FF6B2B 0%,#FF2255 50%,#CC00AA 100%)}
        .t2 .thumb-bg{background:linear-gradient(135deg,#CC00AA 0%,#8844FF 50%,#4488FF 100%)}
        .t3 .thumb-bg{background:linear-gradient(135deg,#4488FF 0%,#00D4FF 50%,#4ade80 100%)}
        .t4 .thumb-bg{background:linear-gradient(135deg,#FF2255 0%,#8844FF 100%)}
        .t5 .thumb-bg{background:linear-gradient(135deg,#8844FF 0%,#00D4FF 100%)}
        .t6 .thumb-bg{background:linear-gradient(135deg,#FF6B2B 0%,#4488FF 100%)}
        .gallery-thumb .thumb-shape{position:absolute;border-radius:50%;border:2px solid rgba(255,255,255,.15)}
        .gallery-thumb .shape-1{width:120px;height:120px;top:20%;left:20%}
        .gallery-thumb .shape-2{width:80px;height:80px;bottom:15%;right:15%}
        .gallery-thumb .shape-3{width:60px;height:60px;top:10%;right:25%;border-radius:4px;transform:rotate(45deg)}
        
        .gallery-info{padding:16px 20px}
        .gallery-title{font-size:14px;font-weight:600;color:var(--white);margin-bottom:4px}
        .gallery-desc{font-size:12px;color:var(--white);opacity:.4;margin-bottom:10px}
        .gallery-tags{display:flex;gap:6px;flex-wrap:wrap}
        .gallery-tag{padding:3px 8px;border:1px solid var(--border);border-radius:3px;font-family:var(--jb);font-size:10px;color:var(--white);opacity:.4}
        
        /* LARGE ITEM (span 2 cols) */
        .gallery-item.large{grid-column:span 2}
        .gallery-item.large .gallery-thumb{aspect-ratio:32/10}
        
        footer{border-top:1px solid var(--border);padding:32px 48px;text-align:center;font-size:12px;color:var(--white);opacity:.3}
        
        @media(max-width:768px){
          .gallery{grid-template-columns:1fr;padding:0 20px 48px}
          .gallery-item.large{grid-column:span 1}
          .gallery-item.large .gallery-thumb{aspect-ratio:16/10}
          .page-header{padding:48px 20px 32px}
          .page-header h1{font-size:32px}
          .filter-bar{padding:0 20px 32px}
          nav{padding:14px 20px}.nav-links{display:none}
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
    <a href="https://blackroad-io.pages.dev">Home</a>
    <a href="#" style={{{ opacity: 1 }}}>Work</a>
    <a href="https://hr-blackroad-io.pages.dev">About</a>
    <a href="https://support-blackroad-io.pages.dev">Contact</a>
  </div>
</nav>

<div className="page-header">
  <h1>Selected work</h1>
  <p>A collection of projects spanning distributed systems, AI infrastructure, and sovereign technology.</p>
</div>

<div className="filter-bar">
  <button className="filter-btn active">All</button>
  <button className="filter-btn">Infrastructure</button>
  <button className="filter-btn">AI / ML</button>
  <button className="filter-btn">Web</button>
  <button className="filter-btn">Open Source</button>
</div>

<div className="gallery">
  <div className="gallery-item large t1">
    <div className="gallery-thumb"><div className="thumb-bg"></div><div className="thumb-shape shape-1"></div><div className="thumb-shape shape-2"></div></div>
    <div className="gallery-info">
      <div className="gallery-title">BlackRoad Operating System</div>
      <div className="gallery-desc">Distributed OS for autonomous agents running on edge hardware</div>
      <div className="gallery-tags"><span className="gallery-tag">Infrastructure</span><span className="gallery-tag">Pi 5</span><span className="gallery-tag">WireGuard</span></div>
    </div>
  </div>
  <div className="gallery-item t2">
    <div className="gallery-thumb"><div className="thumb-bg"></div><div className="thumb-shape shape-1"></div><div className="thumb-shape shape-3"></div></div>
    <div className="gallery-info">
      <div className="gallery-title">CECE AI Engine</div>
      <div className="gallery-desc">Custom LLM personalities with TTS</div>
      <div className="gallery-tags"><span className="gallery-tag">AI</span><span className="gallery-tag">Ollama</span></div>
    </div>
  </div>
  <div className="gallery-item t3">
    <div className="gallery-thumb"><div className="thumb-bg"></div><div className="thumb-shape shape-2"></div><div className="thumb-shape shape-3"></div></div>
    <div className="gallery-info">
      <div className="gallery-title">RoadNet Mesh</div>
      <div className="gallery-desc">5-node carrier network with failover</div>
      <div className="gallery-tags"><span className="gallery-tag">Network</span><span className="gallery-tag">WiFi</span></div>
    </div>
  </div>
  <div className="gallery-item t4">
    <div className="gallery-thumb"><div className="thumb-bg"></div><div className="thumb-shape shape-1"></div></div>
    <div className="gallery-info">
      <div className="gallery-title">RoadC Language</div>
      <div className="gallery-desc">Custom programming language with Python-style indentation</div>
      <div className="gallery-tags"><span className="gallery-tag">Language</span><span className="gallery-tag">Compiler</span></div>
    </div>
  </div>
  <div className="gallery-item t5">
    <div className="gallery-thumb"><div className="thumb-bg"></div><div className="thumb-shape shape-3"></div><div className="thumb-shape shape-2"></div></div>
    <div className="gallery-info">
      <div className="gallery-title">Quantum Math Lab</div>
      <div className="gallery-desc">Mathematical simulation and visualization toolkit</div>
      <div className="gallery-tags"><span className="gallery-tag">Math</span><span className="gallery-tag">Simulation</span></div>
    </div>
  </div>
  <div className="gallery-item large t6">
    <div className="gallery-thumb"><div className="thumb-bg"></div><div className="thumb-shape shape-1"></div><div className="thumb-shape shape-2"></div><div className="thumb-shape shape-3"></div></div>
    <div className="gallery-info">
      <div className="gallery-title">Lucidia Platform</div>
      <div className="gallery-desc">Full-stack web platform with 334 web applications and FastAPI backend</div>
      <div className="gallery-tags"><span className="gallery-tag">Web</span><span className="gallery-tag">FastAPI</span><span className="gallery-tag">Next.js</span></div>
    </div>
  </div>
</div>

<footer>&copy; 2026 BlackRoad. All rights reserved.</footer>
<div className="grad-bar"></div>






      </div>
    </>
  );
}
