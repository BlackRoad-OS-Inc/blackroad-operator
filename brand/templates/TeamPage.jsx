import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function TeamPage() {
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
        
        .container{max-max-width:1100px;width:100%;margin:0 auto;padding:0 48px}
        
        .page-header{text-align:center;padding:80px 0 64px}
        .page-header h1{font-size:42px;font-weight:700;color:var(--white);margin-bottom:12px}
        .page-header p{font-size:16px;color:var(--white);opacity:.4;max-width:480px;margin:0 auto}
        
        /* TEAM GRID */
        .team-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-bottom:80px}
        .team-card{border:1px solid var(--border);border-radius:12px;text-align:center;padding:40px 24px 32px;transition:border-color .2s}
        .team-card:hover{border-color:#333}
        .team-avatar{width:80px;height:80px;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:28px;color:var(--white);position:relative;overflow:hidden}
        .team-avatar::before{content:'';position:absolute;inset:0;background:var(--g135);opacity:.15}
        .team-avatar-ring{position:absolute;inset:-2px;border-radius:50%;border:2px solid transparent;background:var(--g);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;padding:2px}
        .team-name{font-size:16px;font-weight:600;color:var(--white);margin-bottom:4px}
        .team-role{font-size:13px;color:var(--white);opacity:.4;margin-bottom:16px}
        .team-bio{font-size:12px;color:var(--white);opacity:.3;line-height:1.6}
        .team-links{display:flex;justify-content:center;gap:12px;margin-top:16px}
        .team-link{width:32px;height:32px;border:1px solid var(--border);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--white);opacity:.3;text-decoration:none;transition:all .2s}
        .team-link:hover{opacity:.7;border-color:#333}
        
        /* VALUES */
        .values{padding:80px 0;border-top:1px solid var(--border)}
        .values h2{font-size:28px;font-weight:700;color:var(--white);text-align:center;margin-bottom:48px}
        .values-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
        .value-card{border-top:1px solid var(--border);padding:24px 0}
        .value-num{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.2;margin-bottom:8px}
        .value-card h3{font-size:16px;font-weight:600;color:var(--white);margin-bottom:8px}
        .value-card p{font-size:13px;color:var(--white);opacity:.4;line-height:1.7}
        /* Gradient accent dot */
        .value-dot{width:24px;height:3px;border-radius:2px;background:var(--g);margin-bottom:12px}
        
        /* CTA */
        .join-cta{text-align:center;padding:80px 0;border-top:1px solid var(--border)}
        .join-cta h2{font-size:28px;font-weight:700;color:var(--white);margin-bottom:12px}
        .join-cta p{font-size:14px;color:var(--white);opacity:.4;margin-bottom:32px;max-width:400px;margin-left:auto;margin-right:auto}
        .btn-join{padding:14px 36px;border:none;border-radius:8px;background:var(--white);color:var(--black);font-size:15px;font-weight:600;cursor:pointer;font-family:var(--sg)}
        
        footer{border-top:1px solid var(--border);padding:32px 48px;text-align:center;font-size:12px;color:var(--white);opacity:.3}
        
        @media(max-width:768px){
          nav{padding:14px 20px}.nav-links{display:none}
          .container{padding:0 20px}
          .page-header{padding:48px 0 32px}.page-header h1{font-size:32px}
          .team-grid{grid-template-columns:1fr}
          .values-grid{grid-template-columns:1fr}
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
    <a href="#" style={{{ opacity: 1 }}}>About</a>
    <a href="https://blackroad-research.pages.dev">Blog</a>
  </div>
</nav>

<div className="container">
  <div className="page-header">
    <h1>Meet the team</h1>
    <p>The people building sovereign infrastructure for the next generation of intelligent systems.</p>
  </div>

  <div className="team-grid">
    <div className="team-card">
      <div className="team-avatar"><div className="team-avatar-ring"></div>A</div>
      <div className="team-name">Alexa</div>
      <div className="team-role">Founder & Lead Engineer</div>
      <div className="team-bio">Building distributed systems and AI infrastructure from the edge up.</div>
      <div className="team-links">
        <a className="team-link" href="#">GH</a>
        <a className="team-link" href="#">@</a>
      </div>
    </div>
    <div className="team-card">
      <div className="team-avatar"><div className="team-avatar-ring"></div>C</div>
      <div className="team-name">CECE</div>
      <div className="team-role">AI Agent</div>
      <div className="team-bio">Custom LLM personality running on Cecilia with 16 Ollama models and TTS.</div>
      <div className="team-links">
        <a className="team-link" href="#">API</a>
      </div>
    </div>
    <div className="team-card">
      <div className="team-avatar"><div className="team-avatar-ring"></div>L</div>
      <div className="team-name">Lucidia</div>
      <div className="team-role">Platform Agent</div>
      <div className="team-bio">FastAPI backend serving 334 web applications with automated DNS and tunneling.</div>
      <div className="team-links">
        <a className="team-link" href="#">API</a>
      </div>
    </div>
  </div>

  <div className="values">
    <h2>What we believe</h2>
    <div className="values-grid">
      <div className="value-card">
        <div className="value-dot"></div>
        <div className="value-num">01</div>
        <h3>Own your infrastructure</h3>
        <p>Every packet that leaves your network is a dependency. We build systems that run on hardware you can hold in your hand.</p>
      </div>
      <div className="value-card">
        <div className="value-dot"></div>
        <div className="value-num">02</div>
        <h3>Automate everything</h3>
        <p>If you have to do it twice, script it. Self-healing watchdogs and autonomous agents eliminate manual intervention.</p>
      </div>
      <div className="value-card">
        <div className="value-dot"></div>
        <div className="value-num">03</div>
        <h3>Ship fast, break nothing</h3>
        <p>207 repositories, automated mirroring, and continuous deployment across five edge nodes.</p>
      </div>
      <div className="value-card">
        <div className="value-dot"></div>
        <div className="value-num">04</div>
        <h3>Open by default</h3>
        <p>Open source, open protocols, open hardware. No vendor lock-in, no cloud dependency.</p>
      </div>
    </div>
  </div>

  <div className="join-cta">
    <h2>Want to build with us?</h2>
    <p>We're always looking for people who believe in sovereign technology.</p>
    <button className="btn-join">Get in Touch</button>
  </div>
</div>

<footer>&copy; 2026 BlackRoad. All rights reserved.</footer>
<div className="grad-bar"></div>






      </div>
    </>
  );
}
