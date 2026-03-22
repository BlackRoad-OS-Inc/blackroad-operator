import { useState, useEffect, useRef } from "react";

const STOPS = ["#FF6B2B","#FF2255","#CC00AA","#8844FF","#4488FF","#00D4FF"];
const GRAD = "linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const GRAD135 = "linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)";
const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const inter = "'Inter', sans-serif";

export default function BlackroadInteractive() {
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
        .section{max-max-width:1100px;width:100%;margin:0 auto;padding:80px 48px}
        .section-label{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.25;letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px}
        .section-title{font-size:32px;font-weight:700;color:var(--white);margin-bottom:12px;letter-spacing:-.015em}
        .section-desc{font-size:14px;color:var(--white);opacity:.4;max-width:460px;margin-bottom:48px}
        .metrics-strip{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
        .metric-cell{padding:28px 24px;border-right:1px solid var(--border)}
        .metric-cell:last-child{border-right:none}
        .metric-value{font-size:32px;font-weight:700;color:var(--white);margin-bottom:4px;letter-spacing:-.02em}
        .metric-label{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.25;letter-spacing:.06em;text-transform:uppercase}
        .tool-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
        .tool-card{border:1px solid var(--border);border-radius:10px;padding:28px;position:relative;transition:border-color .2s}
        .tool-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--g);border-radius:10px 10px 0 0;image-rendering:crisp-edges}
        .tool-card:hover{border-color:#333}
        .tool-name{font-size:16px;font-weight:700;color:var(--white);margin-bottom:8px}
        .tool-desc{font-size:12px;color:var(--white);opacity:.4;line-height:1.7;margin-bottom:12px}
        .tool-file{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
        .arch-card{border:1px solid var(--border);border-radius:12px;padding:48px;position:relative}
        .arch-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g);border-radius:12px 12px 0 0;image-rendering:crisp-edges}
        .arch-title{font-size:24px;font-weight:700;color:var(--white);margin-bottom:12px}
        .arch-desc{font-size:14px;color:var(--white);opacity:.4;line-height:1.8;margin-bottom:24px;max-width:600px}
        .arch-code{font-family:var(--jb);font-size:12px;color:var(--white);opacity:.3;border:1px solid var(--border);border-radius:8px;padding:20px;line-height:2}
        .stack-list{border-top:1px solid var(--border)}
        .stack-row{display:grid;grid-template-columns:160px 1fr auto;gap:16px;padding:16px 0;border-bottom:1px solid var(--border);align-items:center}
        .stack-layer{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.25;text-transform:uppercase;letter-spacing:.04em}
        .stack-desc{font-size:14px;color:var(--white);opacity:.5}
        .stack-file{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
        .featured-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
        .featured{border:1px solid var(--border);border-radius:12px;padding:36px;position:relative}
        .featured::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g);border-radius:12px 12px 0 0;image-rendering:crisp-edges}
        .featured-label{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.25;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px}
        .featured-title{font-size:22px;font-weight:700;color:var(--white);margin-bottom:12px}
        .featured-desc{font-size:13px;color:var(--white);opacity:.4;line-height:1.8;margin-bottom:20px}
        .featured-stat{font-family:var(--jb);font-size:11px;color:var(--white);opacity:.3}
        .roadc-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
        .roadc-code{border:1px solid var(--border);border-radius:12px;padding:36px;position:relative}
        .roadc-code::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g);border-radius:12px 12px 0 0;image-rendering:crisp-edges}
        .roadc-spec{border:1px solid var(--border);border-radius:12px;padding:36px;position:relative}
        .roadc-spec::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g);border-radius:12px 12px 0 0;image-rendering:crisp-edges}
        .spec-list{border-top:1px solid var(--border);margin-top:16px}
        .spec-row{display:grid;grid-template-columns:100px 1fr;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)}
        .spec-label{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.25;text-transform:uppercase;letter-spacing:.04em}
        .spec-value{font-size:13px;color:var(--white);opacity:.5}
        .bench-list{border-top:1px solid var(--border)}
        .bench-row{display:grid;grid-template-columns:140px 1fr auto;gap:16px;padding:14px 0;border-bottom:1px solid var(--border);align-items:center}
        .bench-target{font-size:14px;font-weight:600;color:var(--white)}
        .bench-desc{font-size:13px;color:var(--white);opacity:.4}
        .bench-spec{font-family:var(--jb);font-size:10px;color:var(--white);opacity:.2}
        .pill{text-decoration:none;padding:8px 18px;border:1px solid var(--border);border-radius:20px;font-size:12px;font-weight:500;color:var(--white);opacity:.5;display:inline-flex;align-items:center;gap:8px}
        .pill-dot{width:6px;height:6px;border-radius:50%;background:var(--g135)}
        footer{border-top:1px solid var(--border);padding:48px;display:flex;justify-content:space-between;align-items:center}
        .footer-brand{font-weight:700;font-size:16px;color:var(--white);text-decoration:none}
        .footer-links{display:flex;gap:24px}
        .footer-links a{font-size:13px;color:var(--white);opacity:.4;text-decoration:none;transition:opacity .2s}
        .footer-links a:hover{opacity:1}
        .footer-copy{font-size:12px;color:var(--white);opacity:.2}
        @media(max-width:768px){
          nav{padding:14px 20px;flex-wrap:wrap;gap:12px}.nav-links{display:none}
          .hero{padding:80px 20px 60px}.hero h1{font-size:36px}
          .section{padding:48px 20px}.tool-grid{grid-template-columns:1fr}
          .arch-card,.featured,.roadc-code,.roadc-spec{padding:28px}
          .featured-grid,.roadc-grid{grid-template-columns:1fr}
          .stack-row,.bench-row{grid-template-columns:1fr}.stack-file,.bench-spec{display:none}
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
  <a href="https://blackroad-io.pages.dev" className="nav-logo"><img src="blackroad-logo.png" alt="BlackRoad" style={{{ width: 32, height: 32, borderRadius: "50%" }}} /> BlackRoad Interactive</a>
  <div className="nav-links"><a href="#tools">Tools</a><a href="#engine">Engine</a><a href="#simulation">Simulation</a><a href="#roadc">RoadC</a><a href="#benchmarks">Benchmarks</a></div>
  <div style={{{ display: "flex", gap: 10 }}}><a href="#engine" className="btn-outline">ECS Engine</a><a href="https://github.com/blackboxprogramming" target="_blank" className="btn-solid">GitHub</a></div>
</nav>

<section className="hero" id="hero">
  <div className="orb orb-1"></div><div className="orb orb-2"></div>
  <div className="hero-badge"><div className="hero-badge-dot"></div> 8 Game Tools · ECS Architecture · 52 TOPS · RoadC</div>
  <h1>Games that run on your infrastructure</h1>
  <p>Eight tools covering the full game engine stack — physics, rendering, audio, particles, shaders, animation, and a visual level editor. All built on Entity-Component-System with Hailo-8 AI acceleration.</p>
  <div className="hero-cta"><a href="#tools" className="btn-lg btn-lg-solid">View Tools</a><a href="#roadc" className="btn-lg btn-lg-outline">RoadC Language</a></div>
</section>

<div className="section" style={{{ paddingBottom: 0 }}}>
  <div className="metrics-strip">
    <div className="metric-cell"><div className="metric-value">8</div><div className="metric-label">Game Tools</div></div>
    <div className="metric-cell"><div className="metric-value">ECS</div><div className="metric-label">Architecture</div></div>
    <div className="metric-cell"><div className="metric-value" data-stat="hailo_tops">52</div><div className="metric-label">TOPS (Hailo-8)</div></div>
    <div className="metric-cell"><div className="metric-value">RoadC</div><div className="metric-label">Game Scripting</div></div>
  </div>
</div>

<section className="section" id="tools">
  <div className="section-label">Tools</div>
  <div className="section-title">Eight game engine tools</div>
  <div className="section-desc">Full game development stack. Physics, rendering, audio, particles, shaders, animation, and level editing.</div>
  <div className="tool-grid">
    <div className="tool-card"><div className="tool-name">Game Engine</div><div className="tool-desc">ECS architecture with game loop, scene management, entity creation and destruction.</div><div className="tool-file">game_engine.py</div></div>
    <div className="tool-card"><div className="tool-name">Physics</div><div className="tool-desc">Rigid body dynamics, AABB + SAT collision detection, gravity simulation.</div><div className="tool-file">physics.py</div></div>
    <div className="tool-card"><div className="tool-name">Renderer</div><div className="tool-desc">2D/3D rendering pipeline, sprite batching, camera system, viewport management.</div><div className="tool-file">renderer.py</div></div>
    <div className="tool-card"><div className="tool-name">Audio Engine</div><div className="tool-desc">Spatial audio positioning, sound effect mixing, music layering with crossfade.</div><div className="tool-file">audio_engine.py</div></div>
    <div className="tool-card"><div className="tool-name">Particle System</div><div className="tool-desc">GPU-accelerated emitters, force fields, lifetime management, burst and continuous modes.</div><div className="tool-file">particle_system.py</div></div>
    <div className="tool-card"><div className="tool-name">Shader Library</div><div className="tool-desc">GLSL shader collection, post-processing effects, material system with PBR.</div><div className="tool-file">shader_library.py</div></div>
    <div className="tool-card"><div className="tool-name">Animation</div><div className="tool-desc">Keyframe and skeletal animation, state machines, blend trees, IK solving.</div><div className="tool-file">animation_controller.py</div></div>
    <div className="tool-card"><div className="tool-name">Level Editor</div><div className="tool-desc">Visual level design, tile maps, entity placement, JSON export for runtime loading.</div><div className="tool-file">level_editor.py</div></div>
  </div>
</section>

<section className="section" id="engine">
  <div className="section-label">Architecture</div>
  <div className="arch-card">
    <div className="arch-title">Entity-Component-System</div>
    <div className="arch-desc">The game engine uses ECS — entities are IDs, components are data, systems are logic. No inheritance hierarchies, no God objects. Add physics to anything by attaching a RigidBody component. Add rendering by attaching a Sprite component.</div>
    <div className="arch-code">
      Entity = ID (uint64)<br />
      Component = Data (Position, Velocity, Sprite, RigidBody)<br />
      System = Logic (PhysicsSystem, RenderSystem, AudioSystem)<br />
      <br />
      game_engine.py → creates entities, manages scenes<br />
      physics.py → PhysicsSystem queries (Position, RigidBody)<br />
      renderer.py → RenderSystem queries (Position, Sprite)<br />
      audio_engine.py → AudioSystem queries (Position, AudioSource)
    </div>
  </div>
</section>

<section className="section" id="simulation">
  <div className="section-label">Simulation &amp; AI</div>
  <div className="featured-grid">
    <div className="featured">
      <div className="featured-label">Research</div>
      <div className="featured-title">Simulation Theory</div>
      <div className="featured-desc">The simulation-theory repo on GitHub connects ECS architecture to simulation hypothesis research. The physics engine doubles as a simulation testbed — same rigid body dynamics, same collision detection, applied to mathematical models from <a href="https://research-lab-blackroad-io.pages.dev" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>quantum-math-lab</a>.</div>
      <div className="featured-stat">simulation-theory repo · blackroad-labs.html</div>
    </div>
    <div className="featured">
      <div className="featured-label">Hardware</div>
      <div className="featured-title">Hailo-8 Acceleration</div>
      <div className="featured-desc"><a href="https://blackroad-infra.pages.dev#accelerators" style={{{ color: "var(--white)", opacity: ".4", textDecoration: "underline", textUnderlineOffset: 3 }}}>52 TOPS</a> across 2 Hailo-8 accelerators on Cecilia and Octavia. Neural network inference for NPC behavior, real-time object detection for AR/mixed reality, edge AI game mechanics — zero cloud latency.</div>
      <div className="featured-stat">26 TOPS per accelerator · /dev/hailo0</div>
    </div>
  </div>
</section>

<section className="section" id="roadc">
  <div className="section-label">Language</div>
  <div className="section-title">RoadC — game scripting language</div>
  <div className="roadc-grid">
    <div className="roadc-code">
      <div className="arch-title">Syntax</div>
      <div className="arch-code">
        space GameWorld:<br />
        &nbsp;&nbsp;let gravity = 9.81<br />
        &nbsp;&nbsp;var player_count = 0<br />
        <br />
        &nbsp;&nbsp;fun spawn_entity(name, x, y):<br />
        &nbsp;&nbsp;&nbsp;&nbsp;let entity = create(name)<br />
        &nbsp;&nbsp;&nbsp;&nbsp;entity.position = (x, y)<br />
        &nbsp;&nbsp;&nbsp;&nbsp;player_count = player_count + 1<br />
        <br />
        &nbsp;&nbsp;fun update(dt):<br />
        &nbsp;&nbsp;&nbsp;&nbsp;for entity in entities:<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;match entity.state:<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"idle" → entity.think(dt)<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"moving" → entity.physics(dt)
      </div>
    </div>
    <div className="roadc-spec">
      <div className="arch-title">Language Spec</div>
      <div className="spec-list">
        <div className="spec-row"><div className="spec-label">Functions</div><div className="spec-value">fun keyword (not fn), Python-style colon + indent</div></div>
        <div className="spec-row"><div className="spec-label">Variables</div><div className="spec-value">let (immutable), var (mutable), const (compile-time)</div></div>
        <div className="spec-row"><div className="spec-label">Control</div><div className="spec-value">if/elif/else, while, for, match (pattern matching)</div></div>
        <div className="spec-row"><div className="spec-label">Types</div><div className="spec-value">integers, floats, strings, functions, recursion</div></div>
        <div className="spec-row"><div className="spec-label">3D Native</div><div className="spec-value">space keyword for 3D world definitions</div></div>
        <div className="spec-row"><div className="spec-label">Concurrency</div><div className="spec-value">spawn keyword for parallel execution</div></div>
        <div className="spec-row"><div className="spec-label">Pipeline</div><div className="spec-value">Lexer → Parser → Interpreter (tree-walking)</div></div>
        <div className="spec-row"><div className="spec-label">Location</div><div className="spec-value">~/roadc</div></div>
      </div>
    </div>
  </div>
</section>

<section className="section" id="benchmarks">
  <div className="section-label">Performance</div>
  <div className="section-title">Target benchmarks</div>
  <div className="bench-list">
    <div className="bench-row"><div className="bench-target">Frame Rate</div><div className="bench-desc">60fps target on Raspberry Pi 5 (ARM64, VideoCore VII)</div><div className="bench-spec">Pi 5</div></div>
    <div className="bench-row"><div className="bench-target">Physics Broad</div><div className="bench-desc">AABB bounding box broad-phase collision culling</div><div className="bench-spec">physics.py</div></div>
    <div className="bench-row"><div className="bench-target">Physics Narrow</div><div className="bench-desc">SAT (Separating Axis Theorem) narrow-phase resolution</div><div className="bench-spec">physics.py</div></div>
    <div className="bench-row"><div className="bench-target">Rendering</div><div className="bench-desc">Sprite batching, draw call minimization, OpenGL ES 3.0</div><div className="bench-spec">renderer.py</div></div>
    <div className="bench-row"><div className="bench-target">Particles</div><div className="bench-desc">GPU-accelerated emitters with compute shader support</div><div className="bench-spec">particle_system.py</div></div>
    <div className="bench-row"><div className="bench-target">AI Inference</div><div className="bench-desc">NPC behavior via Hailo-8 — 26 TOPS per accelerator, zero latency</div><div className="bench-spec">52 TOPS total</div></div>
    <div className="bench-row"><div className="bench-target">Game Scripting</div><div className="bench-desc">RoadC tree-walking interpreter for gameplay logic</div><div className="bench-spec">~/roadc</div></div>
    <div className="bench-row"><div className="bench-target">Memory</div><div className="bench-desc">Entity pool allocation, contiguous component arrays for cache efficiency</div><div className="bench-spec">game_engine.py</div></div>
  </div>
</section>

<section className="section" style={{{ paddingBottom: 0 }}}>
  <div className="section-label">Simulation Stack</div>
  <div className="section-title">How the layers connect</div>
  <div className="stack-list">
    <div className="stack-row"><div className="stack-layer">Input</div><div className="stack-desc">Game loop ticks, processes input events, updates delta time</div><div className="stack-file">game_engine.py</div></div>
    <div className="stack-row"><div className="stack-layer">Scripting</div><div className="stack-desc">RoadC scripts execute game logic, entity behaviors, world rules</div><div className="stack-file">~/roadc</div></div>
    <div className="stack-row"><div className="stack-layer">Physics</div><div className="stack-desc">Rigid body integration, collision detection (AABB broad → SAT narrow)</div><div className="stack-file">physics.py</div></div>
    <div className="stack-row"><div className="stack-layer">AI Inference</div><div className="stack-desc">Hailo-8 neural network inference for NPC decision-making</div><div className="stack-file">/dev/hailo0</div></div>
    <div className="stack-row"><div className="stack-layer">Animation</div><div className="stack-desc">Keyframe interpolation, skeletal transforms, state machine transitions</div><div className="stack-file">animation_controller.py</div></div>
    <div className="stack-row"><div className="stack-layer">Particles</div><div className="stack-desc">Emitter updates, force field application, lifetime culling</div><div className="stack-file">particle_system.py</div></div>
    <div className="stack-row"><div className="stack-layer">Render</div><div className="stack-desc">Sprite batching, shader application, post-processing, frame output</div><div className="stack-file">renderer.py + shader_library.py</div></div>
    <div className="stack-row"><div className="stack-layer">Audio</div><div className="stack-desc">Spatial positioning, effect mixing, music crossfade</div><div className="stack-file">audio_engine.py</div></div>
  </div>
</section>

<section className="section" style={{{ paddingBottom: 0 }}}>
  <div className="section-label">Related</div>
  <div className="section-title">Go deeper</div>
  <div style={{{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}}>
    <a href="https://research-lab-blackroad-io.pages.dev" className="pill"><div className="pill-dot"></div> Simulation Theory</a>
    <a href="https://blackroadai-com.pages.dev" className="pill"><div className="pill-dot"></div> AI Agents</a>
    <a href="https://blackroad-infra.pages.dev#accelerators" className="pill"><div className="pill-dot"></div> 52 TOPS Hailo-8</a>
    <a href="https://education-blackroad-io.pages.dev" className="pill"><div className="pill-dot"></div> Education Tools</a>
    <a href="https://content-blackroad-io.pages.dev" className="pill"><div className="pill-dot"></div> Media Tools</a>
    <a href="https://blackroad-assets.pages.dev#memory" className="pill"><div className="pill-dot"></div> 228 Databases</a>
  </div>
</section>

<footer>
  <a href="https://blackroad-io.pages.dev" className="footer-brand">BlackRoad Interactive</a>
  <div className="footer-links"><a href="https://github.com/blackboxprogramming" target="_blank">GitHub</a><a href="https://blackroad-io.pages.dev">OS Inc</a><a href="https://research-lab-blackroad-io.pages.dev">Labs</a><a href="https://blackroadai-com.pages.dev">AI</a><a href="https://blackroad-infra.pages.dev">Hardware</a></div>
  <div className="footer-copy">&copy; 2026 BlackRoad Interactive. All rights reserved.</div>
</footer>
<div className="grad-bar"></div>






      </div>
    </>
  );
}
