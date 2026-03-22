import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function Changelog() {
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
        
        .container{max-width:720px;margin:0 auto;padding:0 24px}
        .page-header{padding:80px 0 48px}
        .page-header h1{font-size:42px;font-weight:700;color:var(--white);margin-bottom:12px}
        .page-header p{font-size:16px;color:var(--white);opacity:.4}
        
        /* TIMELINE */
        .timeline{position:relative;padding-bottom:80px}
        .timeline::before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:var(--border)}
        
        .release{position:relative;padding-left:32px;margin-bottom:48px}
        .release-dot{position:absolute;left:-5px;top:6px;width:12px;height:12px;border-radius:50%;background:var(--g135)}
        .release-dot.minor{width:8px;height:8px;left:-3px;top:8px;opacity:.5}
        
        .release-version{font-family:var(--jb);font-size:13px;font-weight:600;color:var(--white);margin-bottom:4px}
        .release-date{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.25;margin-bottom:16px}
        .release h3{font-size:18px;font-weight:600;color:var(--white);margin-bottom:12px}
        
        .release-changes{list-style:none;margin-bottom:16px}
        .release-changes li{font-size:13px;color:var(--white);opacity:.5;line-height:1.8;padding-left:20px;position:relative}
        .release-changes li::before{content:'';position:absolute;left:0;top:10px;width:8px;height:2px;border-radius:1px;background:var(--g)}
        
        .release-tag{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border:1px solid var(--border);border-radius:3px;font-family:var(--jb);font-size:10px;color:var(--white);opacity:.4;margin-right:6px}
        
        /* CODE SNIPPET */
        .release-code{border:1px solid var(--border);border-radius:6px;margin-top:12px;overflow:hidden}
        .release-code-header{padding:8px 12px;border-bottom:1px solid var(--border);font-family:var(--jb);font-size:10px;color:var(--white);opacity:.3}
        .release-code-body{overflow-x:hidden;padding:12px;font-family:var(--jb);font-size:12px;color:var(--white);opacity:.6;line-height:1.7}
        
        footer{border-top:1px solid var(--border);padding:32px 48px;text-align:center;font-size:12px;color:var(--white);opacity:.3}
        
        @media(max-width:768px){
          nav{padding:14px 20px}
          .page-header{padding:48px 0 32px}.page-header h1{font-size:28px}
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
</nav>

<div className="container">
  <div className="page-header">
    <h1>Changelog</h1>
    <p>All notable changes to BlackRoad OS, documented release by release.</p>
  </div>

  <div className="timeline">
    <div className="release">
      <div className="release-dot"></div>
      <div className="release-version">v2.4.0</div>
      <div className="release-date">March 9, 2026</div>
      <h3>Power optimization & fleet hardening</h3>
      <ul className="release-changes">
        <li>Applied CPU governor tuning (conservative) across all 4 active nodes</li>
        <li>Removed Octavia overclock — voltage improved by 95mV</li>
        <li>Disabled Lucidia world-engine service — temps dropped from 73°C to 58°C</li>
        <li>Deployed power-monitor.sh to all nodes via cron (*/5)</li>
        <li>Cleaned 16 skeleton microservices from Lucidia, freed ~800MB RAM</li>
        <li>Removed obfuscated cron dropper from Cecilia</li>
      </ul>
      <div><span className="release-tag">infrastructure</span><span className="release-tag">security</span></div>
    </div>

    <div className="release">
      <div className="release-dot minor"></div>
      <div className="release-version">v2.3.1</div>
      <div className="release-date">March 7, 2026</div>
      <h3>DNS and service fixes</h3>
      <ul className="release-changes">
        <li>Fixed Cecilia dnsmasq — bind-interfaces to bind-dynamic</li>
        <li>Fixed Cecilia timezone to America/Chicago</li>
        <li>Moved PUSH_SECRET from plaintext crontabs to .env files (chmod 600)</li>
      </ul>
      <div><span className="release-tag">bugfix</span></div>
    </div>

    <div className="release">
      <div className="release-dot"></div>
      <div className="release-version">v2.3.0</div>
      <div className="release-date">March 5, 2026</div>
      <h3>RoadNet mesh deployment</h3>
      <ul className="release-changes">
        <li>Deployed 5-node carrier mesh network (SSID: RoadNet)</li>
        <li>Configured per-node subnets: 10.10.{1-5}.0/24</li>
        <li>Added WireGuard failover and Pi-hole DNS integration</li>
        <li>Boot-persistent via systemd (roadnet.service)</li>
      </ul>
      <div><span className="release-tag">feature</span><span className="release-tag">network</span></div>
      <div className="release-code">
        <div className="release-code-header">brctl</div>
        <div className="release-code-body">brctl mesh status --all<br />brctl roadnet deploy --channel auto</div>
      </div>
    </div>

    <div className="release">
      <div className="release-dot minor"></div>
      <div className="release-version">v2.2.2</div>
      <div className="release-date">February 28, 2026</div>
      <h3>GitHub profile cleanup</h3>
      <ul className="release-changes">
        <li>Archived 47 duplicate/template/empty repositories</li>
        <li>Merged/closed all 1,200+ open pull requests across 17 owners</li>
        <li>Rewrote 22 READMEs, stripped boilerplate from 22 more</li>
        <li>Updated 85+ repository descriptions and topics</li>
      </ul>
      <div><span className="release-tag">cleanup</span></div>
    </div>

    <div className="release">
      <div className="release-dot"></div>
      <div className="release-version">v2.2.0</div>
      <div className="release-date">February 20, 2026</div>
      <h3>Hailo-8 integration</h3>
      <ul className="release-changes">
        <li>Enabled Hailo-8 accelerators on Cecilia and Octavia (52 TOPS total)</li>
        <li>Configured Ollama for hardware-accelerated inference</li>
        <li>Added 4 custom CECE personality models</li>
        <li>Deployed TTS API on Cecilia</li>
      </ul>
      <div><span className="release-tag">feature</span><span className="release-tag">ai</span></div>
    </div>
  </div>
</div>

<footer>&copy; 2026 BlackRoad. All rights reserved.</footer>
<div className="grad-bar"></div>






      </div>
    </>
  );
}
