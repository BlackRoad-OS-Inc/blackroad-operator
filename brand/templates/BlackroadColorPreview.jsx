import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function BlackroadColorPreview() {
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
        
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #000; color: #f5f5f5; font-family: 'Space Grotesk', sans-serif; overflow-x: hidden; }
        
          .grad-bar { height: 4px; background: linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF); }
          .container { max-max-width:1000px;width:100%; margin: 0 auto; padding: 48px 24px; }
        
          .header { text-align: center; padding: 80px 0 64px; }
          .logo-mark { width: 160px; height: 6px; border-radius: 3px; background: linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF); margin: 0 auto 24px; }
          .header h1 { font-weight: 700; font-size: 56px; letter-spacing: -0.03em; color: #fff; }
          .header p { font-size: 14px; color: #666; margin-top: 12px; font-weight: 400; letter-spacing: 0.04em; }
        
          .section { margin-bottom: 72px; }
          .section-title { font-weight: 700; font-size: 24px; color: #fff; margin-bottom: 6px; }
          .section-sub { font-size: 13px; color: #555; margin-bottom: 28px; font-weight: 400; }
          .divider { height: 2px; border-radius: 1px; background: linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF); opacity: 0.3; margin-bottom: 28px; }
        
          /* Spectrum */
          .spectrum-row { display: flex; gap: 32px; padding: 20px 0; border-bottom: 1px solid #111; align-items: center; }
          .spectrum-swatch { width: 56px; height: 56px; border-radius: 10px; flex-shrink: 0; }
          .spectrum-info { flex: 1; }
          .spectrum-name { font-weight: 600; font-size: 15px; color: #f5f5f5; }
          .spectrum-hex { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #555; margin-top: 2px; }
          .spectrum-token { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #333; margin-top: 1px; }
          .spectrum-bar { width: 200px; height: 4px; border-radius: 2px; flex-shrink: 0; }
        
          /* Gradients */
          .gradient-item { margin-bottom: 20px; }
          .gradient-strip { height: 40px; border-radius: 6px; margin-bottom: 8px; }
          .gradient-label { font-weight: 600; font-size: 13px; color: #f5f5f5; }
          .gradient-meta { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #444; margin-top: 2px; }
        
          /* Surfaces */
          .surface-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
          .surface-item { text-align: center; }
          .surface-block { height: 72px; border-radius: 8px; border: 1px solid #222; margin-bottom: 8px; }
          .surface-name { font-weight: 600; font-size: 12px; color: #f5f5f5; }
          .surface-hex { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #444; margin-top: 2px; }
        
          /* Typography */
          .type-row { display: flex; align-items: baseline; gap: 24px; padding: 18px 0; border-bottom: 1px solid #111; }
          .type-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 0.1em; min-width: 64px; }
          .type-sample { flex: 1; color: #f5f5f5; }
          .type-meta { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #333; min-width: 180px; text-align: right; }
        
          /* Components */
          .demo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
          .demo-card { border-radius: 10px; border: 1px solid #1a1a1a; background: #0a0a0a; overflow: hidden; }
          .demo-card-grad { height: 3px; background: linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF); }
          .demo-card-head { padding: 16px 20px; border-bottom: 1px solid #141414; display: flex; justify-content: space-between; align-items: center; }
          .demo-card-head h3 { font-weight: 600; font-size: 14px; color: #f5f5f5; }
          .demo-card-head span { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #444; }
          .demo-card-body { padding: 20px; }
        
          .node-row { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border: 1px solid #151515; border-radius: 6px; margin-bottom: 8px; }
          .node-indicator { width: 24px; height: 4px; border-radius: 2px; flex-shrink: 0; }
          .node-name { font-weight: 500; font-size: 13px; color: #f5f5f5; flex: 1; }
          .node-ip { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #444; }
          .node-off .node-name { color: #333; }
        
          .btn { display: inline-block; padding: 10px 24px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; border: none; font-family: 'Space Grotesk', sans-serif; }
          .btn-white { background: #fff; color: #000; }
          .btn-outline { background: transparent; border: 1px solid #222; color: #f5f5f5; }
          .btn-row { display: flex; gap: 12px; margin-bottom: 16px; }
        
          .terminal { padding: 14px 16px; background: #0a0a0a; border: 1px solid #151515; border-radius: 6px; }
          .terminal div { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #555; }
          .terminal .cmd { color: #f5f5f5; }
          .terminal-grad { height: 2px; border-radius: 1px; background: linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF); margin-bottom: 10px; opacity: 0.5; }
        
          /* Tokens */
          .tokens-block { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 8px; padding: 24px; font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.8; color: #555; white-space: pre; overflow-x: auto; }
          .tokens-block .prop { color: #888; }
          .tokens-block .val { color: #f5f5f5; }
          .tokens-block .cmt { color: #333; }
        
          /* ─── Animations Section ─── */
          .anim-section { padding: 80px 0; }
          .anim-section .section-title { text-align: center; }
          .anim-section .section-sub { text-align: center; }
          .anim-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 16px; }
          .anim-card { border: 1px solid #1a1a1a; border-radius: 12px; background: #0a0a0a; overflow: hidden; }
          .anim-card-top { height: 3px; background: linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF); }
          .anim-label { font-weight: 600; font-size: 13px; color: #fff; padding: 16px 20px 0; }
          .anim-desc { font-size: 12px; color: #444; padding: 4px 20px 0; }
          .anim-stage { height: 200px; display: flex; align-items: center; justify-content: center; padding: 20px; position: relative; overflow: hidden; }
        
          /* 1. Gradient Sweep */
          @keyframes gradSweep {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
          }
          .anim-sweep { width: 100%; height: 6px; border-radius: 3px; background: linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF, #FF6B2B); background-size: 200% 100%; animation: gradSweep 3s linear infinite; }
        
          /* 2. Pulse Ring */
          @keyframes pulseRing {
            0% { transform: scale(0.3); opacity: 1; }
            100% { transform: scale(1.8); opacity: 0; }
          }
          .pulse-container { position: relative; width: 80px; height: 80px; }
          .pulse-ring { position: absolute; inset: 0; border-radius: 50%; border: 2px solid transparent; background: linear-gradient(135deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF) border-box; -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; }
          .pulse-ring:nth-child(1) { animation: pulseRing 2.4s ease-out infinite; }
          .pulse-ring:nth-child(2) { animation: pulseRing 2.4s ease-out 0.8s infinite; }
          .pulse-ring:nth-child(3) { animation: pulseRing 2.4s ease-out 1.6s infinite; }
          .pulse-dot { position: absolute; top: 50%; left: 50%; width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 50%; background: #fff; }
        
          /* 3. Spectrum Bars */
          @keyframes barWave {
            0%, 100% { transform: scaleY(0.3); }
            50% { transform: scaleY(1); }
          }
          .bar-group { display: flex; gap: 4px; align-items: center; height: 80px; }
          .bar-group span { width: 6px; height: 100%; border-radius: 3px; background: linear-gradient(180deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF); animation: barWave 1.4s ease-in-out infinite; transform-origin: center; }
          .bar-group span:nth-child(1) { animation-delay: 0s; }
          .bar-group span:nth-child(2) { animation-delay: 0.1s; }
          .bar-group span:nth-child(3) { animation-delay: 0.2s; }
          .bar-group span:nth-child(4) { animation-delay: 0.3s; }
          .bar-group span:nth-child(5) { animation-delay: 0.4s; }
          .bar-group span:nth-child(6) { animation-delay: 0.5s; }
          .bar-group span:nth-child(7) { animation-delay: 0.6s; }
          .bar-group span:nth-child(8) { animation-delay: 0.7s; }
          .bar-group span:nth-child(9) { animation-delay: 0.8s; }
          .bar-group span:nth-child(10) { animation-delay: 0.9s; }
          .bar-group span:nth-child(11) { animation-delay: 1.0s; }
          .bar-group span:nth-child(12) { animation-delay: 1.1s; }
        
          /* 4. Orbit */
          @keyframes orbit {
            0% { transform: rotate(0deg) translateX(50px) rotate(0deg); }
            100% { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
          }
          @keyframes orbitReverse {
            0% { transform: rotate(0deg) translateX(34px) rotate(0deg); }
            100% { transform: rotate(-360deg) translateX(34px) rotate(360deg); }
          }
          .orbit-container { position: relative; width: 120px; height: 120px; }
          .orbit-track { position: absolute; inset: 0; border-radius: 50%; border: 1px solid #1a1a1a; }
          .orbit-track-inner { position: absolute; inset: 18px; border-radius: 50%; border: 1px solid #141414; }
          .orbit-center { position: absolute; top: 50%; left: 50%; width: 10px; height: 10px; margin: -5px 0 0 -5px; border-radius: 50%; background: #fff; }
          .orbit-dot { position: absolute; top: 50%; left: 50%; width: 6px; height: 6px; margin: -3px 0 0 -3px; border-radius: 50%; }
          .orbit-dot-outer { animation: orbit 4s linear infinite; }
          .orbit-dot-inner { animation: orbitReverse 2.8s linear infinite; }
          .orbit-dot-outer .dot-fill { width: 6px; height: 6px; border-radius: 50%; background: linear-gradient(135deg, #FF6B2B, #00D4FF); }
          .orbit-dot-inner .dot-fill { width: 5px; height: 5px; border-radius: 50%; background: linear-gradient(135deg, #CC00AA, #4488FF); }
        
          /* 5. Loading Line */
          @keyframes loadSlide {
            0% { left: -30%; }
            100% { left: 100%; }
          }
          .load-track { width: 100%; height: 4px; border-radius: 2px; background: #111; position: relative; overflow: hidden; }
          .load-fill { position: absolute; top: 0; height: 100%; width: 30%; border-radius: 2px; background: linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF); animation: loadSlide 1.8s ease-in-out infinite; }
        
          /* 6. Morph Shape */
          @keyframes morph {
            0%, 100% { border-radius: 50% 50% 50% 50%; transform: rotate(0deg); }
            25% { border-radius: 30% 70% 50% 50%; transform: rotate(90deg); }
            50% { border-radius: 50% 30% 70% 50%; transform: rotate(180deg); }
            75% { border-radius: 70% 50% 30% 70%; transform: rotate(270deg); }
          }
          .morph-shape { width: 80px; height: 80px; background: linear-gradient(135deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF); animation: morph 6s ease-in-out infinite; }
        
          /* 7. Typewriter */
          @keyframes typewriter {
            0% { width: 0; }
            50% { width: 100%; }
            90% { width: 100%; }
            100% { width: 0; }
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          .typewriter-wrap { display: inline-flex; align-items: center; }
          .typewriter-text { font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #fff; overflow: hidden; white-space: nowrap; animation: typewriter 4s steps(20) infinite; border-right: 2px solid #fff; }
          .typewriter-grad { height: 2px; border-radius: 1px; background: linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF); margin-top: 12px; }
        
          /* 8. Particle Float */
          @keyframes float1 { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(30px,-20px) scale(1.2); } 66% { transform: translate(-15px,15px) scale(0.8); } }
          @keyframes float2 { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(-25px,25px) scale(0.9); } 66% { transform: translate(20px,-10px) scale(1.1); } }
          @keyframes float3 { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(15px,20px) scale(1.15); } 66% { transform: translate(-30px,-15px) scale(0.85); } }
          .particle-field { position: relative; width: 200px; height: 120px; }
          .particle { position: absolute; border-radius: 50%; background: linear-gradient(135deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF); }
          .p1 { width: 12px; height: 12px; top: 20%; left: 15%; animation: float1 5s ease-in-out infinite; }
          .p2 { width: 8px; height: 8px; top: 60%; left: 45%; animation: float2 4s ease-in-out infinite; }
          .p3 { width: 16px; height: 16px; top: 30%; left: 70%; animation: float3 6s ease-in-out infinite; }
          .p4 { width: 6px; height: 6px; top: 75%; left: 20%; animation: float2 3.5s ease-in-out 0.5s infinite; }
          .p5 { width: 10px; height: 10px; top: 50%; left: 80%; animation: float1 4.5s ease-in-out 1s infinite; }
          .p6 { width: 4px; height: 4px; top: 15%; left: 50%; animation: float3 3s ease-in-out 0.3s infinite; }
        
          /* Footer */
          .footer { text-align: center; padding: 64px 0 40px; }
          .footer-line { width: 80px; height: 4px; border-radius: 2px; background: linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF); margin: 0 auto 20px; }
          .footer h2 { font-weight: 700; font-size: 20px; color: #fff; }
          .footer p { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #333; margin-top: 8px; }
        
          @media (max-width: 768px) {
            .surface-grid { grid-template-columns: repeat(2, 1fr); }
            .demo-grid, .anim-grid { grid-template-columns: 1fr; }
            .header h1 { font-size: 36px; }
            .spectrum-bar { display: none; }
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

<div className="container">

  <div className="header">
    <div className="logo-mark"></div>
    <h1>BlackRoad Brand System</h1>
    <p>Color · Typography · Surface · Gradient · Tokens</p>
  </div>

  
  <div className="section">
    <div className="section-title">Spectrum</div>
    <div className="section-sub">6 accent colors — gradient only, never solid, never text</div>
    <div className="divider"></div>

    <div className="spectrum-row">
      <div className="spectrum-swatch" style={{{ background: "linear-gradient(135deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)" }}}></div>
      <div className="spectrum-info">
        <div className="spectrum-name">Ember</div>
        <div className="spectrum-hex">#FF6B2B</div>
        <div className="spectrum-token">--br-ember</div>
      </div>
      <div className="spectrum-bar" style={{{ background: "linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)" }}}></div>
    </div>

    <div className="spectrum-row">
      <div className="spectrum-swatch" style={{{ background: "linear-gradient(135deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)" }}}></div>
      <div className="spectrum-info">
        <div className="spectrum-name">Flare</div>
        <div className="spectrum-hex">#FF2255</div>
        <div className="spectrum-token">--br-flare</div>
      </div>
      <div className="spectrum-bar" style={{{ background: "linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)" }}}></div>
    </div>

    <div className="spectrum-row">
      <div className="spectrum-swatch" style={{{ background: "linear-gradient(135deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)" }}}></div>
      <div className="spectrum-info">
        <div className="spectrum-name">Magenta</div>
        <div className="spectrum-hex">#CC00AA</div>
        <div className="spectrum-token">--br-magenta</div>
      </div>
      <div className="spectrum-bar" style={{{ background: "linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)" }}}></div>
    </div>

    <div className="spectrum-row">
      <div className="spectrum-swatch" style={{{ background: "linear-gradient(135deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)" }}}></div>
      <div className="spectrum-info">
        <div className="spectrum-name">Orchid</div>
        <div className="spectrum-hex">#8844FF</div>
        <div className="spectrum-token">--br-orchid</div>
      </div>
      <div className="spectrum-bar" style={{{ background: "linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)" }}}></div>
    </div>

    <div className="spectrum-row">
      <div className="spectrum-swatch" style={{{ background: "linear-gradient(135deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)" }}}></div>
      <div className="spectrum-info">
        <div className="spectrum-name">Arc</div>
        <div className="spectrum-hex">#4488FF</div>
        <div className="spectrum-token">--br-arc</div>
      </div>
      <div className="spectrum-bar" style={{{ background: "linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)" }}}></div>
    </div>

    <div className="spectrum-row" style={{{ borderBottom: "none" }}}>
      <div className="spectrum-swatch" style={{{ background: "linear-gradient(135deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)" }}}></div>
      <div className="spectrum-info">
        <div className="spectrum-name">Cyan</div>
        <div className="spectrum-hex">#00D4FF</div>
        <div className="spectrum-token">--br-cyan</div>
      </div>
      <div className="spectrum-bar" style={{{ background: "linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)" }}}></div>
    </div>
  </div>

  
  <div className="section">
    <div className="section-title">Gradients</div>
    <div className="section-sub">5 preset combinations</div>
    <div className="divider"></div>
    <div className="gradient-item">
      <div className="gradient-strip" style={{{ background: "linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)" }}}></div>
      <div className="gradient-label">Full Spectrum</div>
      <div className="gradient-meta">#FF6B2B → #FF2255 → #CC00AA → #8844FF → #4488FF → #00D4FF</div>
    </div>
    <div style={{{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}}>
      <div className="gradient-item">
        <div className="gradient-strip" style={{{ background: "linear-gradient(135deg, #FF6B2B, #FF2255, #8844FF, #00D4FF)" }}}></div>
        <div className="gradient-label">Warm → Cool</div>
        <div className="gradient-meta">#FF6B2B → #FF2255 → #8844FF → #00D4FF</div>
      </div>
      <div className="gradient-item">
        <div className="gradient-strip" style={{{ background: "linear-gradient(90deg, #CC00AA, #8844FF, #4488FF)" }}}></div>
        <div className="gradient-label">Pulse</div>
        <div className="gradient-meta">#CC00AA → #8844FF → #4488FF</div>
      </div>
      <div className="gradient-item">
        <div className="gradient-strip" style={{{ background: "linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA)" }}}></div>
        <div className="gradient-label">Fire</div>
        <div className="gradient-meta">#FF6B2B → #FF2255 → #CC00AA</div>
      </div>
      <div className="gradient-item">
        <div className="gradient-strip" style={{{ background: "linear-gradient(90deg, #8844FF, #4488FF, #00D4FF)" }}}></div>
        <div className="gradient-label">Ice</div>
        <div className="gradient-meta">#8844FF → #4488FF → #00D4FF</div>
      </div>
    </div>
  </div>

  
  <div className="section">
    <div className="section-title">Surfaces</div>
    <div className="section-sub">8 neutral tones — black & white only</div>
    <div className="divider"></div>
    <div className="surface-grid">
      <div className="surface-item">
        <div className="surface-block" style={{{ background: "#000" }}}></div>
        <div className="surface-name">Base</div>
        <div className="surface-hex">#000000</div>
      </div>
      <div className="surface-item">
        <div className="surface-block" style={{{ background: "#0a0a0a" }}}></div>
        <div className="surface-name">Card</div>
        <div className="surface-hex">#0a0a0a</div>
      </div>
      <div className="surface-item">
        <div className="surface-block" style={{{ background: "#111" }}}></div>
        <div className="surface-name">Elevated</div>
        <div className="surface-hex">#111111</div>
      </div>
      <div className="surface-item">
        <div className="surface-block" style={{{ background: "#181818" }}}></div>
        <div className="surface-name">Hover</div>
        <div className="surface-hex">#181818</div>
      </div>
      <div className="surface-item">
        <div className="surface-block" style={{{ background: "#222" }}}></div>
        <div className="surface-name">Border</div>
        <div className="surface-hex">#222222</div>
      </div>
      <div className="surface-item">
        <div className="surface-block" style={{{ background: "#444" }}}></div>
        <div className="surface-name">Muted</div>
        <div className="surface-hex">#444444</div>
      </div>
      <div className="surface-item">
        <div className="surface-block" style={{{ background: "#737373" }}}></div>
        <div className="surface-name">Secondary</div>
        <div className="surface-hex">#737373</div>
      </div>
      <div className="surface-item">
        <div className="surface-block" style={{{ background: "#f5f5f5" }}}></div>
        <div className="surface-name">Primary</div>
        <div className="surface-hex">#f5f5f5</div>
      </div>
    </div>
  </div>

  
  <div className="section">
    <div className="section-title">Typography</div>
    <div className="section-sub">Space Grotesk · JetBrains Mono</div>
    <div className="divider"></div>
    <div className="type-row">
      <div className="type-label">Display</div>
      <div className="type-sample" style={{{ fontWeight: 700, fontSize: 40 }}}>BlackRoad OS</div>
      <div className="type-meta">Space Grotesk 700 · 48–80px</div>
    </div>
    <div className="type-row">
      <div className="type-label">Heading</div>
      <div className="type-sample" style={{{ fontWeight: 600, fontSize: 28 }}}>Agent Infrastructure</div>
      <div className="type-meta">Space Grotesk 600 · 24–40px</div>
    </div>
    <div className="type-row">
      <div className="type-label">Body</div>
      <div className="type-sample" style={{{ fontWeight: 400, fontSize: 16, color: "#999" }}}>A distributed AI operating system built for the next generation.</div>
      <div className="type-meta">Space Grotesk 400 · 14–16px</div>
    </div>
    <div className="type-row">
      <div className="type-label">Label</div>
      <div className="type-sample" style={{{ fontWeight: 600, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}}>System Status · Active</div>
      <div className="type-meta">Space Grotesk 600 · 12–13px</div>
    </div>
    <div className="type-row">
      <div className="type-label">Code</div>
      <div className="type-sample" style={{{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 400, fontSize: 13 }}}>Z := yx − w → equilibrium reached</div>
      <div className="type-meta">JetBrains Mono 400 · 11–13px</div>
    </div>
    <div className="type-row" style={{{ borderBottom: "none" }}}>
      <div className="type-label">Micro</div>
      <div className="type-sample" style={{{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 500, fontSize: 10, color: "#666" }}}>RC:0x4200 · PS-SHA∞ · QBFT-4200</div>
      <div className="type-meta">JetBrains Mono 500 · 9–10px</div>
    </div>
  </div>

  
  <div className="section">
    <div className="section-title">Components</div>
    <div className="section-sub">Cards, buttons, status indicators</div>
    <div className="divider"></div>
    <div className="demo-grid">
      <div className="demo-card">
        <div className="demo-card-grad"></div>
        <div className="demo-card-head">
          <h3>Agent Status</h3>
          <span>5 nodes · 3 online</span>
        </div>
        <div className="demo-card-body">
          <div className="node-row">
            <div className="node-indicator" style={{{ background: "linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)" }}}></div>
            <div className="node-name">Alice</div>
            <div className="node-ip">192.168.4.49</div>
          </div>
          <div className="node-row">
            <div className="node-indicator" style={{{ background: "linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)" }}}></div>
            <div className="node-name">Cecilia</div>
            <div className="node-ip">192.168.4.96</div>
          </div>
          <div className="node-row node-off" style={{{ marginBottom: 0 }}}>
            <div className="node-indicator" style={{{ background: "#333" }}}></div>
            <div className="node-name">Octavia</div>
            <div className="node-ip">offline</div>
          </div>
        </div>
      </div>

      <div className="demo-card">
        <div className="demo-card-grad"></div>
        <div className="demo-card-head">
          <h3>Actions</h3>
          <span>Button styles</span>
        </div>
        <div className="demo-card-body">
          <div className="btn-row">
            <button className="btn btn-white">Deploy Agent</button>
            <button className="btn btn-outline">View Logs</button>
          </div>
          <div className="btn-row">
            <button className="btn btn-outline">Stop Process</button>
            <button className="btn btn-outline">Connect</button>
          </div>
          <div className="terminal">
            <div className="terminal-grad"></div>
            <div className="cmd">$ blackroad deploy --fleet all</div>
            <div style={{{ marginTop: 6 }}}>Propagating to 5 nodes...</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  
  <div className="section">
    <div className="section-title">CSS Tokens</div>
    <div className="section-sub">Copy-paste ready :root variables</div>
    <div className="divider"></div>
    <div className="tokens-block"><span className="cmt">/* BlackRoad Design Tokens */</span>
:root {
  <span className="cmt">/* Backgrounds */</span>
  <span className="prop">--br-bg</span>:       <span className="val">#000000</span>;
  <span className="prop">--br-card</span>:     <span className="val">#0a0a0a</span>;
  <span className="prop">--br-elevated</span>: <span className="val">#111111</span>;
  <span className="prop">--br-hover</span>:    <span className="val">#181818</span>;

  <span className="cmt">/* Text */</span>
  <span className="prop">--br-text</span>:     <span className="val">#f5f5f5</span>;
  <span className="prop">--br-sub</span>:      <span className="val">#737373</span>;
  <span className="prop">--br-muted</span>:    <span className="val">#444444</span>;

  <span className="cmt">/* Borders */</span>
  <span className="prop">--br-border</span>:   <span className="val">#222222</span>;

  <span className="cmt">/* Gradient — the only color expression */</span>
  <span className="prop">--br-gradient</span>: <span className="val">linear-gradient(90deg,
    #FF6B2B, #FF2255, #CC00AA,
    #8844FF, #4488FF, #00D4FF)</span>;
}</div>
  </div>

  
  <div className="section anim-section">
    <div className="section-title">Animations</div>
    <div className="section-sub">Motion patterns for the brand system</div>
    <div className="divider"></div>

    <div className="anim-grid">

      
      <div className="anim-card">
        <div className="anim-card-top"></div>
        <div className="anim-label">Gradient Sweep</div>
        <div className="anim-desc">Continuous gradient scroll for loading bars, borders, progress</div>
        <div className="anim-stage">
          <div style={{{ width: "80%" }}}>
            <div className="anim-sweep"></div>
          </div>
        </div>
      </div>

      
      <div className="anim-card">
        <div className="anim-card-top"></div>
        <div className="anim-label">Pulse Ring</div>
        <div className="anim-desc">Expanding gradient rings for status, notifications, focus states</div>
        <div className="anim-stage">
          <div className="pulse-container">
            <div className="pulse-ring"></div>
            <div className="pulse-ring"></div>
            <div className="pulse-ring"></div>
            <div className="pulse-dot"></div>
          </div>
        </div>
      </div>

      
      <div className="anim-card">
        <div className="anim-card-top"></div>
        <div className="anim-label">Spectrum Bars</div>
        <div className="anim-desc">Audio-visualizer wave for activity, processing, live data</div>
        <div className="anim-stage">
          <div className="bar-group">
            <span></span><span></span><span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>
      </div>

      
      <div className="anim-card">
        <div className="anim-card-top"></div>
        <div className="anim-label">Orbit</div>
        <div className="anim-desc">Dual-orbit system for agents, connections, network activity</div>
        <div className="anim-stage">
          <div className="orbit-container">
            <div className="orbit-track"></div>
            <div className="orbit-track-inner"></div>
            <div className="orbit-center"></div>
            <div className="orbit-dot orbit-dot-outer"><div className="dot-fill"></div></div>
            <div className="orbit-dot orbit-dot-inner"><div className="dot-fill"></div></div>
          </div>
        </div>
      </div>

      
      <div className="anim-card">
        <div className="anim-card-top"></div>
        <div className="anim-label">Loading Line</div>
        <div className="anim-desc">Sliding gradient bar for progress, page transitions, async ops</div>
        <div className="anim-stage">
          <div style={{{ width: "80%" }}}>
            <div className="load-track">
              <div className="load-fill"></div>
            </div>
          </div>
        </div>
      </div>

      
      <div className="anim-card">
        <div className="anim-card-top"></div>
        <div className="anim-label">Morph Shape</div>
        <div className="anim-desc">Organic shape-shifting for hero sections, backgrounds, identity</div>
        <div className="anim-stage">
          <div className="morph-shape"></div>
        </div>
      </div>

      
      <div className="anim-card">
        <div className="anim-card-top"></div>
        <div className="anim-label">Typewriter</div>
        <div className="anim-desc">Terminal-style text reveal for commands, status messages</div>
        <div className="anim-stage">
          <div>
            <div className="typewriter-wrap">
              <div className="typewriter-text">blackroad deploy --all</div>
            </div>
            <div className="typewriter-grad"></div>
          </div>
        </div>
      </div>

      
      <div className="anim-card">
        <div className="anim-card-top"></div>
        <div className="anim-label">Particle Float</div>
        <div className="anim-desc">Drifting gradient particles for ambient backgrounds, hero areas</div>
        <div className="anim-stage">
          <div className="particle-field">
            <div className="particle p1"></div>
            <div className="particle p2"></div>
            <div className="particle p3"></div>
            <div className="particle p4"></div>
            <div className="particle p5"></div>
            <div className="particle p6"></div>
          </div>
        </div>
      </div>

    </div>
  </div>

  
  <div className="footer">
    <div className="footer-line"></div>
    <h2>BlackRoad OS</h2>
    <p>Brand System Reference · 2026</p>
  </div>

</div>

<div className="grad-bar"></div>







      </div>
    </>
  );
}
