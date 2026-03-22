import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function Error404() {
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
        body{overflow-x:hidden;background:var(--bg);color:var(--white);font-family:var(--sg);min-height:100vh;display:flex;flex-direction:column}
        .grad-bar{height:4px;background:var(--g)}
        
        nav{display:flex;align-items:center;justify-content:space-between;padding:16px 48px;border-bottom:1px solid var(--border)}
        .nav-logo{font-weight:700;font-size:20px;color:var(--white);display:flex;align-items:center;gap:10px;text-decoration:none}
        .nav-mark{width:28px;height:4px;border-radius:2px;background:var(--g)}
        
        .error-page{flex:1;display:flex;align-items:center;justify-content:center;text-align:center;position:relative;overflow:hidden}
        
        /* ANIMATED GRADIENT NUMBER */
        .error-code{font-size:200px;font-weight:700;line-height:1;color:#f5f5f5;margin-bottom:24px}
        
        .error-page h2{font-size:28px;font-weight:700;color:var(--white);margin-bottom:12px}
        .error-page p{font-size:15px;color:var(--white);opacity:.4;margin-bottom:36px;max-width:400px;margin-left:auto;margin-right:auto;line-height:1.6}
        .error-actions{display:flex;gap:12px;justify-content:center}
        .btn-back{padding:12px 28px;border:none;border-radius:6px;background:var(--white);color:var(--black);font-size:14px;font-weight:600;cursor:pointer;font-family:var(--sg);text-decoration:none}
        .btn-back-outline{padding:12px 28px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--white);font-size:14px;font-weight:500;cursor:pointer;font-family:var(--sg);text-decoration:none;transition:border-color .2s}
        .btn-back-outline:hover{border-color:#444}
        
        /* FLOATING SHAPES */
        .float-shape{position:absolute;border-radius:50%;opacity:.06;pointer-events:none}
        .fs-1{width:300px;height:300px;border:3px solid #FF2255;top:10%;left:5%;animation:float 8s ease-in-out infinite}
        .fs-2{width:200px;height:200px;border:3px solid #4488FF;bottom:15%;right:10%;animation:float 6s ease-in-out infinite reverse}
        .fs-3{width:150px;height:150px;border:3px solid #8844FF;top:20%;right:20%;animation:float 7s ease-in-out infinite}
        .fs-4{width:100px;height:100px;border:3px solid #00D4FF;bottom:25%;left:15%;animation:float 5s ease-in-out infinite reverse}
        .fs-5{width:60px;height:60px;background:var(--g);bottom:30%;right:30%;border-radius:4px;transform:rotate(45deg);animation:float 9s ease-in-out infinite}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
        .fs-5{animation:floatrot 9s ease-in-out infinite}
        @keyframes floatrot{0%,100%{transform:rotate(45deg) translateY(0)}50%{transform:rotate(45deg) translateY(-20px)}}
        
        .error-terminal{margin-top:48px;border:1px solid var(--border);border-radius:8px;padding:16px 24px;text-align:left;max-width:400px;margin-left:auto;margin-right:auto}
        .error-terminal code{font-family:var(--jb);font-size:12px;color:var(--white);opacity:.4;line-height:1.8;display:block}
        .error-terminal code span{opacity:.2}
        
        footer{border-top:1px solid var(--border);padding:24px 48px;text-align:center;font-size:12px;color:var(--white);opacity:.3}
        
        @media(max-width:768px){
          .error-code{font-size:100px}
          .error-page h2{font-size:22px}
          nav{padding:14px 20px}
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
  <a className="nav-logo" href="https://blackroad-io.pages.dev"><img src="blackroad-logo.png" alt="BlackRoad" style={{{ width: 32, height: 32, borderRadius: "50%" }}} /> BlackRoad</a>
</nav>

<div className="error-page">
  <div className="float-shape fs-1"></div>
  <div className="float-shape fs-2"></div>
  <div className="float-shape fs-3"></div>
  <div className="float-shape fs-4"></div>
  <div className="float-shape fs-5"></div>

  <div>
    <div className="error-code">404</div>
    <h2>Page not found</h2>
    <p>The page you're looking for doesn't exist or has been moved to a different location.</p>
    <div className="error-actions">
      <a className="btn-back" href="https://blackroad-io.pages.dev">Go Home</a>
      <a className="btn-back-outline" href="https://blackroad-status.pages.dev">View Status</a>
    </div>
    <div className="error-terminal">
      <code><span>$</span> curl -I blackroad.io/this-page</code>
      <code>HTTP/2 404</code>
      <code>server: cloudflare</code>
      <code>x-node: alice</code>
    </div>
  </div>
</div>

<footer>&copy; 2026 BlackRoad. All rights reserved.</footer>
<div className="grad-bar"></div>






      </div>
    </>
  );
}
