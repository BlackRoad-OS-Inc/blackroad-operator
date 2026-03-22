import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function BlogListing() {
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
        
        .container{max-width:900px;margin:0 auto;padding:0 24px}
        
        .page-header{padding:80px 0 48px}
        .page-header h1{font-size:42px;font-weight:700;color:var(--white);margin-bottom:12px}
        .page-header p{font-size:16px;color:var(--white);opacity:.4}
        
        /* FEATURED POST */
        .featured{border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:48px;transition:border-color .2s}
        .featured:hover{border-color:#333}
        .featured-banner{height:200px;position:relative;overflow:hidden}
        .featured-banner-bg{position:absolute;inset:0;background:var(--g);opacity:.15}
        .featured-banner-shapes{position:absolute;inset:0}
        .featured-banner-shapes div{position:absolute;border-radius:50%;border:2px solid rgba(255,255,255,.1)}
        .fb-s1{width:200px;height:200px;top:-40px;right:10%}
        .fb-s2{width:120px;height:120px;bottom:-30px;left:20%}
        .featured-body{overflow-x:hidden;padding:28px}
        .featured-tag{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border:1px solid var(--border);border-radius:4px;font-family:var(--jb);font-size:10px;color:var(--white);opacity:.5;margin-bottom:12px}
        .featured-tag::before{content:'';width:8px;height:3px;border-radius:2px;background:var(--g)}
        .featured h2{font-size:24px;font-weight:700;color:var(--white);margin-bottom:8px}
        .featured p{font-size:14px;color:var(--white);opacity:.4;line-height:1.7;margin-bottom:12px;max-width:600px}
        .featured-meta{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.25}
        
        /* POST LIST */
        .post-list{margin-bottom:80px}
        .post{display:grid;grid-template-columns:1fr auto;gap:24px;padding:24px 0;border-bottom:1px solid var(--border);transition:opacity .15s}
        .post:first-child{border-top:1px solid var(--border)}
        .post:hover{opacity:.8}
        .post-tag{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.3;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px}
        .post h3{font-size:18px;font-weight:600;color:var(--white);margin-bottom:6px}
        .post p{font-size:13px;color:var(--white);opacity:.4;line-height:1.6;max-width:560px}
        .post-date{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.25;white-space:nowrap;padding-top:4px}
        
        /* PAGINATION */
        .pagination{display:flex;justify-content:center;gap:8px;padding:32px 0 80px}
        .page-btn{width:36px;height:36px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--white);opacity:.4;font-size:13px;font-weight:500;cursor:pointer;font-family:var(--sg);display:flex;align-items:center;justify-content:center;transition:all .2s}
        .page-btn:hover{opacity:.7;border-color:#333}
        .page-btn.active{opacity:1;border-color:#444}
        
        footer{border-top:1px solid var(--border);padding:32px 48px;text-align:center;font-size:12px;color:var(--white);opacity:.3}
        
        @media(max-width:768px){
          nav{padding:14px 20px}.nav-links{display:none}
          .page-header{padding:48px 0 32px}.page-header h1{font-size:28px}
          .featured-banner{height:120px}
          .post{grid-template-columns:1fr}.post-date{padding-top:8px}
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
    <a href="#" style={{{ opacity: 1 }}}>Blog</a>
  </div>
</nav>

<div className="container">
  <div className="page-header">
    <h1>Blog</h1>
    <p>Engineering updates, infrastructure deep-dives, and project announcements.</p>
  </div>

  <div className="featured">
    <div className="featured-banner">
      <div className="featured-banner-bg"></div>
      <div className="featured-banner-shapes"><div className="fb-s1"></div><div className="fb-s2"></div></div>
    </div>
    <div className="featured-body">
      <div className="featured-tag">Featured</div>
      <h2>Building a sovereign mesh network with Raspberry Pi 5</h2>
      <p>How we connected five edge nodes into a self-healing WireGuard mesh that routes 48+ domains through local infrastructure.</p>
      <div className="featured-meta">March 9, 2026 &middot; 8 min read</div>
    </div>
  </div>

  <div className="post-list">
    <div className="post">
      <div>
        <div className="post-tag">Engineering</div>
        <h3>Power optimization across a Pi cluster</h3>
        <p>How we reduced thermal throttling and extended SD card life across five nodes with governor tuning and swap optimization.</p>
      </div>
      <div className="post-date">Mar 7, 2026</div>
    </div>
    <div className="post">
      <div>
        <div className="post-tag">Infrastructure</div>
        <h3>Self-hosted Git with Gitea</h3>
        <p>Running 207 repositories on a Raspberry Pi with automated GitHub mirroring via relay scripts.</p>
      </div>
      <div className="post-date">Mar 5, 2026</div>
    </div>
    <div className="post">
      <div>
        <div className="post-tag">AI</div>
        <h3>Running LLMs at the edge with Hailo-8</h3>
        <p>52 TOPS of neural inference on two ARM boards — how we configured Ollama with hardware acceleration.</p>
      </div>
      <div className="post-date">Mar 3, 2026</div>
    </div>
    <div className="post">
      <div>
        <div className="post-tag">DevOps</div>
        <h3>Fleet security audit: what we found</h3>
        <p>Obfuscated cron jobs, leaked tokens, and 50+ SSH keys — a real-world security audit of our Pi cluster.</p>
      </div>
      <div className="post-date">Feb 28, 2026</div>
    </div>
    <div className="post">
      <div>
        <div className="post-tag">Product</div>
        <h3>Introducing RoadNet: carrier-grade mesh WiFi</h3>
        <p>Five access points, automatic failover, and Pi-hole DNS — a mesh network built from scratch.</p>
      </div>
      <div className="post-date">Feb 25, 2026</div>
    </div>
  </div>

  <div className="pagination">
    <button className="page-btn active">1</button>
    <button className="page-btn">2</button>
    <button className="page-btn">3</button>
    <button className="page-btn">&rarr;</button>
  </div>
</div>

<footer>&copy; 2026 BlackRoad. All rights reserved.</footer>
<div className="grad-bar"></div>






      </div>
    </>
  );
}
