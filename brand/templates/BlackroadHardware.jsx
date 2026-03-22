import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function BlackroadHardware() {
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
        .btn-lg-outline:hover{border-color:#444}
        .section{max-max-width:1100px;width:100%;margin:0 auto;padding:80px 48px}
        .section-label{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.25;letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px}
        .section-title{font-size:32px;font-weight:700;color:var(--white);margin-bottom:12px;letter-spacing:-.015em}
        .section-desc{font-size:14px;color:var(--white);opacity:.4;max-width:460px;margin-bottom:48px}
        .metrics-strip{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
        .metric-cell{padding:28px 24px;border-right:1px solid var(--border)}
        .metric-cell:last-child{border-right:none}
        .metric-value{font-size:32px;font-weight:700;color:var(--white);margin-bottom:4px;letter-spacing:-.02em}
        .metric-label{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.25;letter-spacing:.06em;text-transform:uppercase}
        .tool-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .tool-card{border:1px solid var(--border);border-radius:10px;padding:28px;position:relative;transition:border-color .2s}
        .tool-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--g);border-radius:10px 10px 0 0;image-rendering:crisp-edges}
        .tool-card:hover{border-color:#333}
        .tool-name{font-size:18px;font-weight:700;color:var(--white);margin-bottom:8px}
        .tool-desc{font-size:13px;color:var(--white);opacity:.4;line-height:1.7;margin-bottom:16px}
        .tool-file{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
        .node-list{border-top:1px solid var(--border)}
        .node-row{display:grid;grid-template-columns:140px 1fr 140px auto;gap:16px;padding:18px 0;border-bottom:1px solid var(--border);align-items:center}
        .node-name{font-size:14px;font-weight:600;color:var(--white)}
        .node-spec{font-size:13px;color:var(--white);opacity:.4}
        .node-ip{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.2}
        .node-dot{width:8px;height:8px;border-radius:50%}
        .node-dot.on{background:var(--g135)}
        .node-dot.off{background:#333}
        .hailo-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
        .hailo-card{border:1px solid var(--border);border-radius:10px;padding:28px;position:relative}
        .hailo-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--g);border-radius:10px 10px 0 0;image-rendering:crisp-edges}
        .hailo-node{font-size:18px;font-weight:700;color:var(--white);margin-bottom:4px}
        .hailo-serial{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.2;margin-bottom:12px}
        .hailo-spec{font-size:13px;color:var(--white);opacity:.4;line-height:1.8}
        footer{border-top:1px solid var(--border);padding:48px;display:flex;justify-content:space-between;align-items:center}
        .footer-brand{font-weight:700;font-size:16px;color:var(--white);text-decoration:none}
        .footer-links{display:flex;gap:24px}
        .footer-links a{font-size:13px;color:var(--white);opacity:.4;text-decoration:none;transition:opacity .2s}
        .footer-links a:hover{opacity:1}
        .footer-copy{font-size:12px;color:var(--white);opacity:.2}
        @media(max-width:768px){
          nav{padding:14px 20px;flex-wrap:wrap;gap:12px}.nav-links{display:none}
          .hero{padding:80px 20px 60px}.hero h1{font-size:36px}
          .section{padding:48px 20px}.tool-grid,.hailo-grid{grid-template-columns:1fr}
          .node-row{grid-template-columns:100px 1fr auto}.node-ip{display:none}
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
  <a href="https://blackroad-io.pages.dev" className="nav-logo"><img src="blackroad-logo.png" alt="BlackRoad" style={{{ width: 32, height: 32, borderRadius: "50%" }}} /> BlackRoad Hardware</a>
  <div className="nav-links"><a href="#tools">Tools</a><a href="#fleet">Fleet</a><a href="#accelerators">Accelerators</a></div>
  <div style={{{ display: "flex", gap: 10 }}}><a href="#fleet" className="btn-outline">Node Status</a><a href="https://github.com/blackroad-hardware" target="_blank" className="btn-solid">GitHub</a></div>
</nav>

<section className="hero" id="hero">
  <div className="orb orb-1"></div><div className="orb orb-2"></div>
  <div className="hero-badge"><div className="hero-badge-dot"></div> 7 Hardware Tools · 52 TOPS</div>
  <h1>Software that touches silicon</h1>
  <p>Seven tools for sensors, power, firmware, and fleet tracking across 5 Raspberry Pis with 2 Hailo-8 AI accelerators.</p>
  <div className="hero-cta"><a href="#tools" className="btn-lg btn-lg-solid">View Tools</a><a href="#accelerators" className="btn-lg btn-lg-outline">AI Accelerators</a></div>
</section>

<div className="section" style={{{ paddingBottom: 0 }}}>
  <div className="metrics-strip">
    <div className="metric-cell"><div className="metric-value">5</div><div className="metric-label">Raspberry Pis</div></div>
    <div className="metric-cell"><div className="metric-value" data-stat="hailo_tops">52</div><div className="metric-label">TOPS (2x Hailo-8)</div></div>
    <div className="metric-cell"><div className="metric-value">7</div><div className="metric-label">Hardware Tools</div></div>
    <div className="metric-cell"><div className="metric-value">1TB</div><div className="metric-label">NVMe Storage</div></div>
  </div>
</div>

<section className="section" id="tools">
  <div className="section-label">Tools</div>
  <div className="section-title">Seven hardware management tools</div>
  <div className="section-desc">Sensors, power, firmware, fleet tracking — all Python, all local, all running on the hardware they manage.</div>
  <div className="tool-grid">
    <div className="tool-card"><div className="tool-name">Sensor Network</div><div className="tool-desc">I2C and SPI sensor aggregation. Configurable polling intervals, threshold-based alerts, data logging to SQLite.</div><div className="tool-file">sensor_network.py</div></div>
    <div className="tool-card"><div className="tool-name">IoT Gateway</div><div className="tool-desc">MQTT broker bridge for device provisioning and telemetry ingestion. Routes sensor data across the fleet.</div><div className="tool-file">iot_gateway.py</div></div>
    <div className="tool-card"><div className="tool-name">Power Manager</div><div className="tool-desc">CPU governor control (conservative mode), voltage monitoring, thermal throttling detection. Deployed to all nodes via cron.</div><div className="tool-file">power_manager.py</div></div>
    <div className="tool-card"><div className="tool-name">Fleet Tracker</div><div className="tool-desc">Device discovery via mDNS and ARP. Health monitoring with 1-minute heartbeats. Fleet-wide command execution.</div><div className="tool-file">fleet_tracker.py</div></div>
    <div className="tool-card"><div className="tool-name">Device Registry</div><div className="tool-desc">125+ devices cataloged. Layer 7 deep scan for service detection. UUID assignment. Master at ~/roadnet/DEVICE-REGISTRY.md.</div><div className="tool-file">device_registry.py</div></div>
    <div className="tool-card"><div className="tool-name">Firmware Updater</div><div className="tool-desc">OTA firmware updates with rollback support. Version tracking across all nodes. Auto-revert on failure.</div><div className="tool-file">firmware_updater.py</div></div>
    <div className="tool-card"><div className="tool-name">Smart Home</div><div className="tool-desc">eero mesh integration (Thread/Matter). Apple TV AirPlay, Roku API, device automation across the LAN.</div><div className="tool-file">smart_home.py</div></div>
  </div>
</section>

<section className="section" id="fleet">
  <div className="section-label">Fleet</div>
  <div className="section-title">Five nodes, all physical</div>
  <div className="node-list">
    <div className="node-row"><div className="node-name">Alice</div><div className="node-spec">Pi 400 · 33.6°C · 0.916V · 369M/3.7G RAM · 78% disk · <a href="https://blackroad-systems.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>48+ domains</a> · Pi-hole · PostgreSQL</div><div className="node-ip">192.168.4.49</div><div className="node-dot on"></div></div>
    <div className="node-row"><div className="node-name">Cecilia</div><div className="node-spec">Pi 5 · <a href="#accelerators" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>Hailo-8</a> · <a href="https://blackroadai-com.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>CECE API · TTS · 16 Ollama models</a> · MinIO · UNREACHABLE</div><div className="node-ip">192.168.4.96</div><div className="node-dot off"></div></div>
    <div className="node-row"><div className="node-name">Octavia</div><div className="node-spec">Pi 5 · 32.0°C · 0.781V · 1.4G/7.9G RAM · 68% disk · <a href="#accelerators" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>Hailo-8</a> · 931G NVMe · Gitea (207 repos) · 4 containers · <a href="https://blackroadai-com.pages.dev#models" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>11 Ollama models</a></div><div className="node-ip">192.168.4.100</div><div className="node-dot on"></div></div>
    <div className="node-row"><div className="node-name">Aria</div><div className="node-spec">Pi 5 · 54.0°C · 0.873V · 1.1G/7.9G RAM · 82% disk · Portainer · Headscale · 1 container · <a href="https://blackroadai-com.pages.dev#models" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>6 Ollama models</a></div><div className="node-ip">192.168.4.98</div><div className="node-dot on"></div></div>
    <div className="node-row"><div className="node-name">Lucidia</div><div className="node-spec">Pi 5 · 61.2°C · 5.3G/7.9G RAM · 42% disk · 14 containers · <a href="https://blackroadai-com.pages.dev#models" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>6 Ollama models</a> · <a href="https://blackroad-systems.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>334 web apps</a></div><div className="node-ip">192.168.4.38</div><div className="node-dot on"></div></div>
  </div>
</section>

<section className="section" id="accelerators">
  <div className="section-label">AI Accelerators</div>
  <div className="section-title">52 TOPS of edge inference</div>
  <div className="section-desc">Two Hailo-8 accelerators on PCIe, 26 TOPS each. Neural network inference at the edge, no cloud.</div>
  <div className="hailo-grid">
    <div className="hailo-card">
      <div className="hailo-node">Cecilia · Hailo-8</div>
      <div className="hailo-serial">HLLWM2B233704667</div>
      <div className="hailo-spec">26 TOPS · /dev/hailo0 verified<br />PCIe · Pi 5 host<br /><a href="https://blackroadai-com.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>CECE inference · TTS pipeline</a><br />Voltage: 0.876V post-optimization</div>
    </div>
    <div className="hailo-card">
      <div className="hailo-node">Octavia · Hailo-8</div>
      <div className="hailo-serial">HLLWM2B233704606</div>
      <div className="hailo-spec">26 TOPS · /dev/hailo0 verified<br />PCIe · Pi 5 host · 1TB NVMe<br /><a href="https://blackroadai-com.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>Ollama inference</a> · <a href="https://blackroad-operator.pages.dev#infrastructure" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>Swarm workloads</a><br />Voltage: 0.781V (undervoltage)</div>
    </div>
  </div>
</section>

<section className="section" style={{{ paddingBottom: 0 }}}>
  <div className="section-label">Related</div>
  <div className="section-title">Go deeper</div>
  <div style={{{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}}>
    <a href="https://blackroadai-com.pages.dev" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> AI Agents &amp; Ollama</a>
    <a href="https://blackroad-guardian-dashboard.pages.dev#fleet" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> Fleet Security</a>
    <a href="https://blackroad-systems.pages.dev" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> Cloudflare &amp; Tunnels</a>
    <a href="https://blackroad-operator.pages.dev#infrastructure" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> Docker Swarm</a>
    <a href="https://blackroad-assets.pages.dev#memory" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> 228 Databases</a>
    <a href="https://finance-blackroad-io.pages.dev#economics" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> $136/mo Economics</a>
    <a href="https://blackroad-os-home.pages.dev" style={{{ textDecoration: "none", padding: "8px 18px", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 500, color: "var(--white)", opacity: ".5", display: "flex", alignItems: "center", gap: 8 }}}><div style={{{ width: 6, height: 6, borderRadius: "50%", background: "var(--g135)" }}}></div> 80+ CLI Tools</a>
  </div>
</section>

<footer>
  <a href="https://blackroad-io.pages.dev" className="footer-brand">BlackRoad Hardware</a>
  <div className="footer-links"><a href="https://github.com/blackroad-hardware" target="_blank">GitHub</a><a href="https://blackroad-io.pages.dev">OS Inc</a><a href="https://blackroad-systems.pages.dev">Cloud</a><a href="https://blackroadai-com.pages.dev">AI</a><a href="https://blackroad-guardian-dashboard.pages.dev">Security</a><a href="https://blackroad-os-home.pages.dev">OS</a></div>
  <div className="footer-copy">&copy; 2026 BlackRoad Hardware. All rights reserved.</div>
</footer>
<div className="grad-bar"></div>






      </div>
    </>
  );
}
