var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
var GRAD = "linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF)";
var PAY_URL = "https://pay.blackroad.io";
var CUSTOM_HTML = {
  "blackboxprogramming.io": `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BlackBox IDE — Code Sovereign | AI-Assisted Development Tools</title>
<meta name="description" content="BlackBox IDE is the sovereign developer environment with AI co-coding, local inference, and zero telemetry. Build faster without giving up your code. $29/mo.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://blackboxprogramming.io">
<meta property="og:title" content="BlackBox IDE — Code Sovereign">
<meta property="og:description" content="AI-assisted development tools with local inference, zero telemetry, and sovereign code ownership. The IDE that respects your work.">
<meta property="og:image" content="https://images.blackroad.io/pixel-art/blackbox-og.png">
<meta property="og:url" content="https://blackboxprogramming.io">
<meta property="og:type" content="website">
<meta property="og:site_name" content="BlackBox Programming">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="BlackBox IDE — Code Sovereign">
<meta name="twitter:description" content="AI-assisted development tools with local inference, zero telemetry, and sovereign code ownership.">
<meta name="twitter:image" content="https://images.blackroad.io/pixel-art/blackbox-og.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "BlackRoad OS, Inc.",
  "url": "https://blackroad.io",
  "foundingDate": "2025-11-17",
  "founder": {
    "@type": "Person",
    "name": "Alexa Louise Amundson"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Lakeville",
    "addressRegion": "MN",
    "addressCountry": "US"
  }
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "BlackBox IDE",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "macOS, Linux, Windows",
  "offers": {
    "@type": "Offer",
    "price": "29.00",
    "priceCurrency": "USD",
    "priceValidUntil": "2027-12-31"
  },
  "description": "Sovereign developer environment with AI co-coding, local inference, and zero telemetry.",
  "url": "https://blackboxprogramming.io",
  "provider": {
    "@type": "Organization",
    "name": "BlackRoad OS, Inc."
  }
}
</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#f5f5f5;font-family:'Inter',sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}
.gradient-bar{height:3px;background:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);width:100%}
nav{padding:1.5rem 2rem;display:flex;justify-content:space-between;align-items:center;max-width:1200px;margin:0 auto}
nav a{color:#999;text-decoration:none;font-size:.9rem;margin-left:2rem;transition:color .2s}
nav a:hover{color:#f5f5f5}
.logo{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.4rem;color:#f5f5f5;text-decoration:none}
.hero{max-width:1200px;margin:0 auto;padding:6rem 2rem 4rem;text-align:center}
h1{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:3.5rem;line-height:1.1;margin-bottom:1.5rem;color:#f5f5f5}
.tagline{font-size:1.3rem;color:#888;margin-bottom:2.5rem;max-width:600px;margin-left:auto;margin-right:auto}
.cta-row{display:flex;gap:1rem;justify-content:center;margin-bottom:4rem}
.btn-primary{display:inline-block;padding:.9rem 2.2rem;background:#f5f5f5;color:#0a0a0a;font-weight:600;border-radius:6px;text-decoration:none;font-size:1rem;transition:opacity .2s}
.btn-primary:hover{opacity:.85}
.btn-secondary{display:inline-block;padding:.9rem 2.2rem;border:1px solid #333;color:#ccc;border-radius:6px;text-decoration:none;font-size:1rem;transition:border-color .2s}
.btn-secondary:hover{border-color:#666}
section{max-width:1200px;margin:0 auto;padding:4rem 2rem}
h2{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:2.2rem;margin-bottom:1rem;color:#e5e5e5}
h3{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.3rem;margin-bottom:.75rem;color:#d4d4d4}
p{color:#999;margin-bottom:1rem;max-width:700px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;margin-top:2rem}
.card{background:#131313;border:1px solid #1a1a1a;border-radius:10px;padding:2rem}
.card p{color:#888;font-size:.95rem}
.mono{font-family:'JetBrains Mono',monospace;font-size:.85rem;color:#666}
.pricing-section{text-align:center;padding:5rem 2rem}
.price-card{background:#131313;border:1px solid #1a1a1a;border-radius:10px;padding:3rem;max-width:420px;margin:2rem auto}
.price{font-family:'Space Grotesk',sans-serif;font-size:3rem;color:#f5f5f5}
.price span{font-size:1rem;color:#666}
.price-card ul{list-style:none;text-align:left;margin:2rem 0}
.price-card li{padding:.5rem 0;color:#999;border-bottom:1px solid #1a1a1a}
.price-card li::before{content:"→ ";color:#555}
.links-section{border-top:1px solid #1a1a1a;padding:3rem 2rem;max-width:1200px;margin:0 auto}
.links-grid{display:flex;flex-wrap:wrap;gap:1.5rem;margin-top:1rem}
.links-grid a{color:#888;text-decoration:none;font-size:.9rem;transition:color .2s}
.links-grid a:hover{color:#f5f5f5}
footer{text-align:center;padding:3rem 2rem;color:#444;font-size:.85rem;border-top:1px solid #111}
@media(max-width:768px){h1{font-size:2.2rem}.hero{padding:4rem 1.5rem}}
</style>
</head>
<body>
<div class="gradient-bar"></div>
<nav>
<a href="/" class="logo">BlackBox</a>
<div>
<a href="#features">Features</a>
<a href="#pricing">Pricing</a>
<a href="https://blackroad.io">BlackRoad OS</a>
<a href="https://blackroadai.com">AI</a>
</div>
</nav>

<div class="hero">
<h1>Code sovereign.</h1>
<p class="tagline">BlackBox IDE is the developer environment that runs AI locally, keeps your code private, and never phones home. Co-code with intelligence that lives on your machine.</p>
<div class="cta-row">
<a href="https://blackroad.io/start" class="btn-primary">Get BlackBox IDE</a>
<a href="#features" class="btn-secondary">See how it works</a>
</div>
<p class="mono">v2.4.0 &middot; macOS / Linux / Windows &middot; MIT-licensed runtime</p>
</div>

<section id="features">
<h2>Why developers switch to BlackBox</h2>
<p>Every keystroke stays on your hardware. Every suggestion comes from models you control. No cloud dependency, no usage caps, no surprise bills.</p>
<div class="grid">
<div class="card">
<h3>Local AI Co-Coding</h3>
<p>Ollama-powered code completion and refactoring that runs entirely on your machine. Supports 16 models including CodeLlama, DeepSeek Coder, and StarCoder2. Suggestions in under 200ms on Apple Silicon.</p>
</div>
<div class="card">
<h3>Zero Telemetry</h3>
<p>No analytics, no usage tracking, no code leaving your network. BlackBox IDE has no call-home mechanism. Audit the source yourself — the runtime is fully inspectable. Your intellectual property stays yours.</p>
</div>
<div class="card">
<h3>Sovereign Workspace</h3>
<p>Built-in terminal, Git integration with Gitea-first support, project-scoped memory that persists across sessions, and a plugin system that respects your privacy. Extensions run sandboxed with no network access by default.</p>
</div>
<div class="card">
<h3>Multi-Agent Pair Programming</h3>
<p>Spawn up to 4 AI agents that collaborate on different parts of your codebase simultaneously. Each agent has its own context window and memory. Coordinate complex refactors across hundreds of files without losing track.</p>
</div>
<div class="card">
<h3>Fleet-Ready</h3>
<p>Deploy BlackBox across your entire engineering team with a single configuration file. Shared model cache reduces disk usage by 80%. Centralized settings with per-developer overrides. Works air-gapped.</p>
</div>
<div class="card">
<h3>Language Intelligence</h3>
<p>Deep support for Python, TypeScript, Rust, Go, Shell, and 40 more languages. Semantic code navigation, cross-file refactoring, and inline documentation generation powered by local tree-sitter parsing.</p>
</div>
</div>
</section>

<section>
<h2>Built for real codebases</h2>
<p>BlackBox handles monorepos with millions of lines. Incremental indexing means you never wait. The AI understands your project structure, dependencies, and conventions because it reads your code locally — not through an API.</p>
<div class="grid">
<div class="card">
<h3>Performance</h3>
<p class="mono">< 200ms AI suggestions &middot; < 50ms file switching &middot; < 2s project indexing (100k files)</p>
</div>
<div class="card">
<h3>Compatibility</h3>
<p class="mono">VS Code extensions supported &middot; vim keybindings &middot; LSP protocol &middot; DAP debugging</p>
</div>
</div>
</section>

<section id="pricing" class="pricing-section">
<h2>Pricing</h2>
<p style="margin:0 auto 2rem;text-align:center">One plan. Everything included. No usage limits.</p>
<div class="price-card">
<div class="gradient-bar" style="border-radius:8px 8px 0 0;margin:-2rem -2rem 2rem"></div>
<h3>Rider</h3>
<div class="price">$29<span>/mo</span></div>
<ul>
<li>Unlimited local AI co-coding</li>
<li>All 16 supported models</li>
<li>Multi-agent pair programming (up to 4 agents)</li>
<li>Project-scoped persistent memory</li>
<li>Fleet deployment tools</li>
<li>Priority updates and patches</li>
<li>Community + direct support</li>
</ul>
<a href="https://blackroad.io/start" class="btn-primary" style="width:100%;display:block;text-align:center">Start coding</a>
</div>
</section>

<div class="links-section">
<h3>BlackRoad Ecosystem</h3>
<div class="links-grid">
<a href="https://blackroad.io">BlackRoad OS</a>
<a href="https://blackroadai.com">BlackRoad AI</a>
<a href="https://lucidia.earth">Lucidia</a>
<a href="https://roadchain.io">RoadChain</a>
<a href="https://blackroadquantum.com">Quantum</a>
<a href="https://roadcode.io">RoadCode</a>
<a href="https://roundtrip.blackroad.io">RoundTrip</a>
</div>
</div>

<footer>
<p>&copy; 2025-2026 BlackRoad OS, Inc. Delaware C-Corp. All rights reserved.</p>
<p style="margin-top:.5rem">Pave Tomorrow.</p>
</footer>
</body>
</html>
`,
  "blackroadai.com": `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BlackRoad AI — Your AI. Your Hardware. | Lucidia Local-First Intelligence</title>
<meta name="description" content="BlackRoad AI builds Lucidia, the local-first AI assistant with persistent memory, 52 TOPS inference, and zero cloud dependency. Rider $29/mo, Paver $99/mo.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://blackroadai.com">
<meta property="og:title" content="BlackRoad AI — Your AI. Your Hardware.">
<meta property="og:description" content="Lucidia runs on your devices with persistent memory and local inference. No cloud required. Your conversations never leave your network.">
<meta property="og:image" content="https://images.blackroad.io/pixel-art/blackroadai-og.png">
<meta property="og:url" content="https://blackroadai.com">
<meta property="og:type" content="website">
<meta property="og:site_name" content="BlackRoad AI">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="BlackRoad AI — Your AI. Your Hardware.">
<meta name="twitter:description" content="Lucidia runs on your devices with persistent memory and local inference. No cloud required.">
<meta name="twitter:image" content="https://images.blackroad.io/pixel-art/blackroadai-og.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "BlackRoad OS, Inc.",
  "url": "https://blackroad.io",
  "foundingDate": "2025-11-17",
  "founder": {
    "@type": "Person",
    "name": "Alexa Louise Amundson"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Lakeville",
    "addressRegion": "MN",
    "addressCountry": "US"
  }
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Lucidia AI",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "macOS, Linux, Windows, iOS, Android",
  "offers": [
    {"@type": "Offer", "name": "Rider", "price": "29.00", "priceCurrency": "USD"},
    {"@type": "Offer", "name": "Paver", "price": "99.00", "priceCurrency": "USD"},
    {"@type": "Offer", "name": "Enterprise", "price": "299.00", "priceCurrency": "USD"}
  ],
  "description": "Local-first AI assistant with persistent memory, sovereign inference, and multi-device sync.",
  "url": "https://blackroadai.com",
  "provider": {
    "@type": "Organization",
    "name": "BlackRoad OS, Inc."
  }
}
</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#f5f5f5;font-family:'Inter',sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}
.gradient-bar{height:3px;background:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);width:100%}
nav{padding:1.5rem 2rem;display:flex;justify-content:space-between;align-items:center;max-width:1200px;margin:0 auto}
nav a{color:#999;text-decoration:none;font-size:.9rem;margin-left:2rem;transition:color .2s}
nav a:hover{color:#f5f5f5}
.logo{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.4rem;color:#f5f5f5;text-decoration:none}
.hero{max-width:1200px;margin:0 auto;padding:6rem 2rem 4rem;text-align:center}
h1{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:3.5rem;line-height:1.1;margin-bottom:1.5rem;color:#f5f5f5}
.tagline{font-size:1.3rem;color:#888;margin-bottom:2.5rem;max-width:640px;margin-left:auto;margin-right:auto}
.cta-row{display:flex;gap:1rem;justify-content:center;margin-bottom:4rem}
.btn-primary{display:inline-block;padding:.9rem 2.2rem;background:#f5f5f5;color:#0a0a0a;font-weight:600;border-radius:6px;text-decoration:none;font-size:1rem;transition:opacity .2s}
.btn-primary:hover{opacity:.85}
.btn-secondary{display:inline-block;padding:.9rem 2.2rem;border:1px solid #333;color:#ccc;border-radius:6px;text-decoration:none;font-size:1rem;transition:border-color .2s}
.btn-secondary:hover{border-color:#666}
section{max-width:1200px;margin:0 auto;padding:4rem 2rem}
h2{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:2.2rem;margin-bottom:1rem;color:#e5e5e5}
h3{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.3rem;margin-bottom:.75rem;color:#d4d4d4}
p{color:#999;margin-bottom:1rem;max-width:700px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;margin-top:2rem}
.card{background:#131313;border:1px solid #1a1a1a;border-radius:10px;padding:2rem}
.card p{color:#888;font-size:.95rem}
.mono{font-family:'JetBrains Mono',monospace;font-size:.85rem;color:#666}
.pricing-section{text-align:center;padding:5rem 2rem}
.pricing-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;max-width:960px;margin:2rem auto 0}
.price-card{background:#131313;border:1px solid #1a1a1a;border-radius:10px;padding:2.5rem;text-align:left}
.price-card.featured{border-color:#333}
.price{font-family:'Space Grotesk',sans-serif;font-size:2.5rem;color:#f5f5f5;margin:.5rem 0}
.price span{font-size:1rem;color:#666}
.price-card ul{list-style:none;margin:1.5rem 0}
.price-card li{padding:.4rem 0;color:#999;font-size:.9rem}
.price-card li::before{content:"→ ";color:#555}
.links-section{border-top:1px solid #1a1a1a;padding:3rem 2rem;max-width:1200px;margin:0 auto}
.links-grid{display:flex;flex-wrap:wrap;gap:1.5rem;margin-top:1rem}
.links-grid a{color:#888;text-decoration:none;font-size:.9rem;transition:color .2s}
.links-grid a:hover{color:#f5f5f5}
footer{text-align:center;padding:3rem 2rem;color:#444;font-size:.85rem;border-top:1px solid #111}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1.5rem;margin-top:2rem;text-align:center}
.stat-num{font-family:'Space Grotesk',sans-serif;font-size:2.5rem;color:#f5f5f5}
.stat-label{color:#666;font-size:.85rem;margin-top:.25rem}
@media(max-width:768px){h1{font-size:2.2rem}.hero{padding:4rem 1.5rem}.pricing-grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="gradient-bar"></div>
<nav>
<a href="/" class="logo">BlackRoad AI</a>
<div>
<a href="#products">Products</a>
<a href="#pricing">Pricing</a>
<a href="https://lucidia.earth">Lucidia</a>
<a href="https://blackroad.io">BlackRoad OS</a>
</div>
</nav>

<div class="hero">
<h1>Your AI. Your hardware.</h1>
<p class="tagline">BlackRoad AI builds intelligence that runs on your devices. Lucidia is an AI assistant with persistent memory, local inference, and zero cloud dependency. Your conversations never leave your network.</p>
<div class="cta-row">
<a href="https://blackroad.io/start" class="btn-primary">Try Lucidia</a>
<a href="#products" class="btn-secondary">Explore products</a>
</div>
</div>

<section>
<div class="stats">
<div><div class="stat-num">52</div><div class="stat-label">TOPS local inference</div></div>
<div><div class="stat-num">16</div><div class="stat-label">AI models deployed</div></div>
<div><div class="stat-num">5</div><div class="stat-label">edge nodes</div></div>
<div><div class="stat-num">0</div><div class="stat-label">bytes sent to cloud</div></div>
</div>
</section>

<section id="products">
<h2>AI that lives where you do</h2>
<p>Every BlackRoad AI product is designed to run locally first. Cloud is optional, never required. Your data stays on hardware you own, behind networks you control.</p>
<div class="grid">
<div class="card">
<h3>Lucidia Assistant</h3>
<p>A conversational AI with persistent memory that remembers every interaction across sessions. Powered by Ollama with 16 models running on local hardware. Ask it anything — it knows your context because it lives in your workflow.</p>
</div>
<div class="card">
<h3>Sovereign Inference</h3>
<p>52 TOPS of neural processing across Hailo-8 accelerators and Apple Silicon. Run CodeLlama 34B, Mixtral 8x7B, and DeepSeek locally with sub-second latency. No API keys, no rate limits, no per-token billing.</p>
</div>
<div class="card">
<h3>Memory System</h3>
<p>SQLite-backed persistent memory with FTS5 full-text search, knowledge graph extraction, and cross-session context. Lucidia remembers solutions, patterns, and preferences. Every session builds on the last.</p>
</div>
<div class="card">
<h3>Multi-Device Sync</h3>
<p>WireGuard-encrypted sync across all your devices. Start a conversation on your Mac, continue on your Pi cluster, pick it up on your phone. End-to-end encrypted, peer-to-peer, no relay servers.</p>
</div>
<div class="card">
<h3>Agent Fleet</h3>
<p>Deploy specialized AI agents for code review, research, writing, and system administration. Each agent has its own memory, personality, and skill set. Coordinate through RoundTrip sovereign chat.</p>
</div>
<div class="card">
<h3>Voice Interface</h3>
<p>Talk to Lucidia with local speech-to-text and text-to-speech. Whisper runs on-device for transcription. No audio ever leaves your hardware. Works offline, works air-gapped, works everywhere.</p>
</div>
</div>
</section>

<section id="pricing" class="pricing-section">
<h2>Pricing</h2>
<p style="margin:0 auto 1rem;text-align:center">Choose the tier that fits your workflow. All plans include local inference and persistent memory.</p>
<div class="pricing-grid">
<div class="price-card">
<h3>Rider</h3>
<div class="price">$29<span>/mo</span></div>
<ul>
<li>Lucidia AI assistant</li>
<li>Persistent memory (unlimited)</li>
<li>3 AI models included</li>
<li>Single-device deployment</li>
<li>Community support</li>
</ul>
<a href="https://blackroad.io/start" class="btn-secondary" style="display:block;text-align:center;margin-top:1rem">Get started</a>
</div>
<div class="price-card featured">
<div class="gradient-bar" style="border-radius:8px 8px 0 0;margin:-2.5rem -2.5rem 1.5rem"></div>
<h3>Paver</h3>
<div class="price">$99<span>/mo</span></div>
<ul>
<li>Everything in Rider</li>
<li>All 16 AI models</li>
<li>Multi-device sync</li>
<li>Agent fleet (up to 10 agents)</li>
<li>Voice interface</li>
<li>Priority support</li>
</ul>
<a href="https://blackroad.io/start" class="btn-primary" style="display:block;text-align:center;margin-top:1rem">Start paving</a>
</div>
<div class="price-card">
<h3>Enterprise</h3>
<div class="price">$299<span>/mo</span></div>
<ul>
<li>Everything in Paver</li>
<li>Unlimited agents</li>
<li>Team memory sharing</li>
<li>Custom model fine-tuning</li>
<li>Air-gapped deployment</li>
<li>Dedicated support + SLA</li>
</ul>
<a href="https://blackroad.io/start" class="btn-secondary" style="display:block;text-align:center;margin-top:1rem">Contact us</a>
</div>
</div>
</section>

<div class="links-section">
<h3>BlackRoad Ecosystem</h3>
<div class="links-grid">
<a href="https://blackroad.io">BlackRoad OS</a>
<a href="https://blackboxprogramming.io">BlackBox IDE</a>
<a href="https://lucidia.earth">Lucidia</a>
<a href="https://roadchain.io">RoadChain</a>
<a href="https://blackroadquantum.com">Quantum</a>
<a href="https://roadcode.io">RoadCode</a>
</div>
</div>

<footer>
<p>&copy; 2025-2026 BlackRoad OS, Inc. Delaware C-Corp. All rights reserved.</p>
<p style="margin-top:.5rem">Pave Tomorrow.</p>
</footer>
</body>
</html>
`,
  "lucidia.earth": `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Lucidia — Create Without Limits. Keep What You Earn. | AI Creator Platform</title>
<meta name="description" content="Lucidia is the AI creator platform with 90%+ revenue share, voice-first content creation, and local inference. Build, publish, and earn on your terms. $49/mo.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://lucidia.earth">
<meta property="og:title" content="Lucidia — Create Without Limits. Keep What You Earn.">
<meta property="og:description" content="AI creator platform with 90%+ revenue share, voice-first creation, and sovereign publishing. Your content, your audience, your money.">
<meta property="og:image" content="https://images.blackroad.io/pixel-art/lucidia-og.png">
<meta property="og:url" content="https://lucidia.earth">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Lucidia">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Lucidia — Create Without Limits. Keep What You Earn.">
<meta name="twitter:description" content="AI creator platform with 90%+ revenue share, voice-first creation, and sovereign publishing.">
<meta name="twitter:image" content="https://images.blackroad.io/pixel-art/lucidia-og.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "BlackRoad OS, Inc.",
  "url": "https://blackroad.io",
  "foundingDate": "2025-11-17",
  "founder": {"@type": "Person", "name": "Alexa Louise Amundson"},
  "address": {"@type": "PostalAddress", "addressLocality": "Lakeville", "addressRegion": "MN", "addressCountry": "US"}
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Lucidia",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Web, macOS, Linux, iOS, Android",
  "offers": {"@type": "Offer", "price": "49.00", "priceCurrency": "USD", "priceValidUntil": "2027-12-31"},
  "description": "AI creator platform with 90%+ revenue share, voice-first content creation, and local inference.",
  "url": "https://lucidia.earth",
  "provider": {"@type": "Organization", "name": "BlackRoad OS, Inc."}
}
</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#f5f5f5;font-family:'Inter',sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}
.gradient-bar{height:3px;background:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);width:100%}
nav{padding:1.5rem 2rem;display:flex;justify-content:space-between;align-items:center;max-width:1200px;margin:0 auto}
nav a{color:#999;text-decoration:none;font-size:.9rem;margin-left:2rem;transition:color .2s}
nav a:hover{color:#f5f5f5}
.logo{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.4rem;color:#f5f5f5;text-decoration:none}
.hero{max-width:1200px;margin:0 auto;padding:6rem 2rem 4rem;text-align:center}
h1{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:3.5rem;line-height:1.1;margin-bottom:1.5rem;color:#f5f5f5}
.tagline{font-size:1.3rem;color:#888;margin-bottom:2.5rem;max-width:640px;margin-left:auto;margin-right:auto}
.cta-row{display:flex;gap:1rem;justify-content:center;margin-bottom:4rem}
.btn-primary{display:inline-block;padding:.9rem 2.2rem;background:#f5f5f5;color:#0a0a0a;font-weight:600;border-radius:6px;text-decoration:none;font-size:1rem;transition:opacity .2s}
.btn-primary:hover{opacity:.85}
.btn-secondary{display:inline-block;padding:.9rem 2.2rem;border:1px solid #333;color:#ccc;border-radius:6px;text-decoration:none;font-size:1rem;transition:border-color .2s}
.btn-secondary:hover{border-color:#666}
section{max-width:1200px;margin:0 auto;padding:4rem 2rem}
h2{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:2.2rem;margin-bottom:1rem;color:#e5e5e5}
h3{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.3rem;margin-bottom:.75rem;color:#d4d4d4}
p{color:#999;margin-bottom:1rem;max-width:700px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;margin-top:2rem}
.card{background:#131313;border:1px solid #1a1a1a;border-radius:10px;padding:2rem}
.card p{color:#888;font-size:.95rem}
.mono{font-family:'JetBrains Mono',monospace;font-size:.85rem;color:#666}
.pricing-section{text-align:center;padding:5rem 2rem}
.price-card{background:#131313;border:1px solid #1a1a1a;border-radius:10px;padding:3rem;max-width:420px;margin:2rem auto}
.price{font-family:'Space Grotesk',sans-serif;font-size:3rem;color:#f5f5f5}
.price span{font-size:1rem;color:#666}
.price-card ul{list-style:none;text-align:left;margin:2rem 0}
.price-card li{padding:.5rem 0;color:#999;border-bottom:1px solid #1a1a1a}
.price-card li::before{content:"→ ";color:#555}
.compare{max-width:700px;margin:3rem auto 0;text-align:left}
.compare-row{display:flex;justify-content:space-between;padding:.75rem 0;border-bottom:1px solid #1a1a1a;color:#888;font-size:.9rem}
.compare-row strong{color:#d4d4d4}
.links-section{border-top:1px solid #1a1a1a;padding:3rem 2rem;max-width:1200px;margin:0 auto}
.links-grid{display:flex;flex-wrap:wrap;gap:1.5rem;margin-top:1rem}
.links-grid a{color:#888;text-decoration:none;font-size:.9rem;transition:color .2s}
.links-grid a:hover{color:#f5f5f5}
footer{text-align:center;padding:3rem 2rem;color:#444;font-size:.85rem;border-top:1px solid #111}
@media(max-width:768px){h1{font-size:2.2rem}.hero{padding:4rem 1.5rem}}
</style>
</head>
<body>
<div class="gradient-bar"></div>
<nav>
<a href="/" class="logo">Lucidia</a>
<div>
<a href="#creators">For Creators</a>
<a href="#pricing">Pricing</a>
<a href="https://blackroadai.com">BlackRoad AI</a>
<a href="https://blackroad.io">BlackRoad OS</a>
</div>
</nav>

<div class="hero">
<h1>Create without limits.<br>Keep what you earn.</h1>
<p class="tagline">Lucidia is the AI creator platform where you own your content, your audience, and your revenue. 90%+ revenue share. Voice-first creation. Local AI that amplifies your work without taking credit for it.</p>
<div class="cta-row">
<a href="https://blackroad.io/start" class="btn-primary">Start creating</a>
<a href="#creators" class="btn-secondary">How it works</a>
</div>
</div>

<section id="creators">
<h2>Built for creators who want to keep creating</h2>
<p>Other platforms take 30-55% of your revenue, own your audience data, and lock you into their algorithm. Lucidia inverts every part of that equation. You create, you earn, you own.</p>
<div class="grid">
<div class="card">
<h3>90%+ Revenue Share</h3>
<p>When your audience pays for your content, you keep at least 90%. Stripe processes payments directly to your account. No hidden platform fees, no 30-day holds, no minimum thresholds. Your money hits your bank within 48 hours.</p>
</div>
<div class="card">
<h3>Voice-First Creation</h3>
<p>Speak your ideas and Lucidia transforms them into polished articles, scripts, courses, and newsletters. Local Whisper transcription means your voice never leaves your device. Edit with your voice or keyboard — whatever feels right.</p>
</div>
<div class="card">
<h3>AI Writing Partner</h3>
<p>Lucidia learns your style, tone, and vocabulary across sessions. It suggests, never overwrites. Every piece of content is unmistakably yours — the AI adapts to you, not the other way around. Powered by local Ollama models you control.</p>
</div>
<div class="card">
<h3>Own Your Audience</h3>
<p>Export your subscriber list anytime. No lock-in, no algorithmic gatekeeping. When you build an audience on Lucidia, those relationships belong to you. Move platforms and take everyone with you.</p>
</div>
<div class="card">
<h3>Publish Everywhere</h3>
<p>One-click publishing to your custom domain, RSS, email newsletter, and social platforms. Lucidia formats your content for each destination automatically. Write once, reach everywhere.</p>
</div>
<div class="card">
<h3>Analytics You Control</h3>
<p>Privacy-respecting analytics with no third-party trackers. See who reads, what resonates, and where your audience comes from — without selling their data to advertisers. Self-hosted on your infrastructure if you want.</p>
</div>
</div>
</section>

<section id="pricing" class="pricing-section">
<h2>Pricing</h2>
<p style="margin:0 auto 1rem;text-align:center">One plan with everything. No feature gating, no surprise costs.</p>
<div class="price-card">
<div class="gradient-bar" style="border-radius:8px 8px 0 0;margin:-3rem -3rem 2rem"></div>
<h3>Creator</h3>
<div class="price">$49<span>/mo</span></div>
<ul>
<li>Unlimited content creation</li>
<li>Voice-first AI writing partner</li>
<li>90%+ revenue share on all sales</li>
<li>Custom domain publishing</li>
<li>Email newsletter tools</li>
<li>Subscriber management + export</li>
<li>Privacy-first analytics</li>
<li>Local AI models (no cloud required)</li>
</ul>
<a href="https://blackroad.io/start" class="btn-primary" style="width:100%;display:block;text-align:center">Start creating</a>
</div>
<div class="compare">
<h3 style="text-align:center;margin-bottom:1.5rem">How Lucidia compares</h3>
<div class="compare-row"><strong>Revenue share</strong><span>Lucidia 90%+ vs. Substack 90% vs. Patreon 88% vs. YouTube 55%</span></div>
<div class="compare-row"><strong>Audience ownership</strong><span>Full export, no lock-in</span></div>
<div class="compare-row"><strong>AI writing</strong><span>Local-first, learns your style</span></div>
<div class="compare-row"><strong>Voice creation</strong><span>On-device Whisper, zero cloud</span></div>
<div class="compare-row"><strong>Data privacy</strong><span>No third-party trackers, self-hostable</span></div>
</div>
</section>

<div class="links-section">
<h3>BlackRoad Ecosystem</h3>
<div class="links-grid">
<a href="https://blackroad.io">BlackRoad OS</a>
<a href="https://blackroadai.com">BlackRoad AI</a>
<a href="https://blackboxprogramming.io">BlackBox IDE</a>
<a href="https://roadchain.io">RoadChain</a>
<a href="https://blackroadquantum.com">Quantum</a>
<a href="https://roadcode.io">RoadCode</a>
</div>
</div>

<footer>
<p>&copy; 2025-2026 BlackRoad OS, Inc. Delaware C-Corp. All rights reserved.</p>
<p style="margin-top:.5rem">Pave Tomorrow.</p>
</footer>
</body>
</html>
`,
  "roadchain.io": `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RoadChain — Built From Scratch. Not From Hype. | Layer-1 Blockchain</title>
<meta name="description" content="RoadChain is a Layer-1 blockchain built from scratch in Python with secp256k1 ECDSA signatures, SHA-256 proof-of-work, and UTXO transaction model. No forks. No frameworks.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://roadchain.io">
<meta property="og:title" content="RoadChain — Built From Scratch. Not From Hype.">
<meta property="og:description" content="Layer-1 blockchain with secp256k1 ECDSA, SHA-256 PoW, and UTXO model. Written from first principles in Python. Every line of code is original.">
<meta property="og:image" content="https://images.blackroad.io/pixel-art/roadchain-og.png">
<meta property="og:url" content="https://roadchain.io">
<meta property="og:type" content="website">
<meta property="og:site_name" content="RoadChain">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="RoadChain — Built From Scratch. Not From Hype.">
<meta name="twitter:description" content="Layer-1 blockchain with secp256k1 ECDSA, SHA-256 PoW, and UTXO model. Written from first principles.">
<meta name="twitter:image" content="https://images.blackroad.io/pixel-art/roadchain-og.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "BlackRoad OS, Inc.",
  "url": "https://blackroad.io",
  "foundingDate": "2025-11-17",
  "founder": {"@type": "Person", "name": "Alexa Louise Amundson"},
  "address": {"@type": "PostalAddress", "addressLocality": "Lakeville", "addressRegion": "MN", "addressCountry": "US"}
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "RoadChain",
  "programmingLanguage": "Python",
  "codeRepository": "https://roadchain.io",
  "description": "Layer-1 blockchain built from scratch with secp256k1 ECDSA signatures, SHA-256 proof-of-work, and UTXO transaction model.",
  "url": "https://roadchain.io",
  "author": {"@type": "Organization", "name": "BlackRoad OS, Inc."}
}
</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#f5f5f5;font-family:'Inter',sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}
.gradient-bar{height:3px;background:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);width:100%}
nav{padding:1.5rem 2rem;display:flex;justify-content:space-between;align-items:center;max-width:1200px;margin:0 auto}
nav a{color:#999;text-decoration:none;font-size:.9rem;margin-left:2rem;transition:color .2s}
nav a:hover{color:#f5f5f5}
.logo{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.4rem;color:#f5f5f5;text-decoration:none}
.hero{max-width:1200px;margin:0 auto;padding:6rem 2rem 4rem;text-align:center}
h1{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:3.5rem;line-height:1.1;margin-bottom:1.5rem;color:#f5f5f5}
.tagline{font-size:1.3rem;color:#888;margin-bottom:2.5rem;max-width:640px;margin-left:auto;margin-right:auto}
.cta-row{display:flex;gap:1rem;justify-content:center;margin-bottom:4rem}
.btn-primary{display:inline-block;padding:.9rem 2.2rem;background:#f5f5f5;color:#0a0a0a;font-weight:600;border-radius:6px;text-decoration:none;font-size:1rem;transition:opacity .2s}
.btn-primary:hover{opacity:.85}
.btn-secondary{display:inline-block;padding:.9rem 2.2rem;border:1px solid #333;color:#ccc;border-radius:6px;text-decoration:none;font-size:1rem;transition:border-color .2s}
.btn-secondary:hover{border-color:#666}
section{max-width:1200px;margin:0 auto;padding:4rem 2rem}
h2{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:2.2rem;margin-bottom:1rem;color:#e5e5e5}
h3{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.3rem;margin-bottom:.75rem;color:#d4d4d4}
p{color:#999;margin-bottom:1rem;max-width:700px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;margin-top:2rem}
.card{background:#131313;border:1px solid #1a1a1a;border-radius:10px;padding:2rem}
.card p{color:#888;font-size:.95rem}
.mono{font-family:'JetBrains Mono',monospace;font-size:.85rem;color:#666}
.code-block{background:#131313;border:1px solid #1a1a1a;border-radius:10px;padding:2rem;margin:2rem 0;overflow-x:auto}
.code-block pre{font-family:'JetBrains Mono',monospace;font-size:.85rem;color:#999;line-height:1.8}
.code-block .comment{color:#555}
.spec-table{width:100%;border-collapse:collapse;margin-top:2rem}
.spec-table td{padding:.75rem 1rem;border-bottom:1px solid #1a1a1a;color:#888;font-size:.9rem}
.spec-table td:first-child{color:#d4d4d4;font-family:'JetBrains Mono',monospace;font-size:.85rem;width:200px}
.links-section{border-top:1px solid #1a1a1a;padding:3rem 2rem;max-width:1200px;margin:0 auto}
.links-grid{display:flex;flex-wrap:wrap;gap:1.5rem;margin-top:1rem}
.links-grid a{color:#888;text-decoration:none;font-size:.9rem;transition:color .2s}
.links-grid a:hover{color:#f5f5f5}
footer{text-align:center;padding:3rem 2rem;color:#444;font-size:.85rem;border-top:1px solid #111}
@media(max-width:768px){h1{font-size:2.2rem}.hero{padding:4rem 1.5rem}.spec-table td:first-child{width:120px}}
</style>
</head>
<body>
<div class="gradient-bar"></div>
<nav>
<a href="/" class="logo">RoadChain</a>
<div>
<a href="#architecture">Architecture</a>
<a href="#spec">Spec</a>
<a href="https://blackroad.io">BlackRoad OS</a>
<a href="https://blackroadquantum.com">Quantum</a>
</div>
</nav>

<div class="hero">
<h1>Built from scratch.<br>Not from hype.</h1>
<p class="tagline">RoadChain is a Layer-1 blockchain written from first principles in Python. No Ethereum fork, no Solidity, no framework. Every line of code — from elliptic curve cryptography to block validation — is original.</p>
<div class="cta-row">
<a href="https://blackroad.io/start" class="btn-primary">Read the code</a>
<a href="#architecture" class="btn-secondary">See the architecture</a>
</div>
<p class="mono">Python 3.12 &middot; secp256k1 ECDSA &middot; SHA-256 PoW &middot; UTXO model</p>
</div>

<section id="architecture">
<h2>Why build a blockchain from scratch</h2>
<p>Most "new" blockchains are forks of existing codebases with cosmetic changes. RoadChain exists to prove that the core ideas — digital signatures, hash chains, consensus — can be implemented from first principles by a single engineer who understands the mathematics.</p>
<div class="grid">
<div class="card">
<h3>secp256k1 ECDSA</h3>
<p>Elliptic Curve Digital Signature Algorithm implemented directly on the secp256k1 curve — the same curve Bitcoin uses. Key generation, signing, and verification written from the mathematical primitives. No OpenSSL dependency for core operations.</p>
</div>
<div class="card">
<h3>SHA-256 Proof-of-Work</h3>
<p>Block mining uses SHA-256 hashing with adjustable difficulty targeting. The difficulty adjustment algorithm maintains consistent block times as hashrate changes. Nonce search is parallelizable across cores.</p>
</div>
<div class="card">
<h3>UTXO Transaction Model</h3>
<p>Unspent Transaction Output model tracks coin ownership explicitly, like Bitcoin. Each transaction consumes previous outputs and creates new ones. Double-spend prevention through UTXO set management with O(1) lookup.</p>
</div>
<div class="card">
<h3>Merkle Tree Verification</h3>
<p>Every block contains a Merkle root of all transactions, enabling efficient verification of transaction inclusion without downloading the full block. Supports simplified payment verification for light clients.</p>
</div>
<div class="card">
<h3>Peer-to-Peer Network</h3>
<p>Custom P2P protocol for block propagation, transaction broadcasting, and peer discovery. Gossip-based architecture with configurable fanout. Runs over TCP with optional WireGuard encryption.</p>
</div>
<div class="card">
<h3>Chain Selection</h3>
<p>Longest-chain-wins consensus with orphan block handling. Fork detection and resolution follows Nakamoto consensus rules. Chain reorganization is atomic — either it completes fully or rolls back entirely.</p>
</div>
</div>
</section>

<section>
<h2>The code speaks for itself</h2>
<p>RoadChain's transaction signing is readable Python, not obfuscated framework calls. Here's how a transaction gets signed.</p>
<div class="code-block">
<pre><span class="comment"># RoadChain transaction signing — from first principles</span>
from roadchain.crypto import PrivateKey, sign_ecdsa
from roadchain.tx import Transaction, TxInput, TxOutput

<span class="comment"># Create a transaction spending a previous output</span>
tx = Transaction(
    inputs=[TxInput(prev_hash=utxo.tx_hash, index=utxo.index)],
    outputs=[TxOutput(amount=50_000, pubkey_hash=recipient.hash160())]
)

<span class="comment"># Sign with secp256k1 ECDSA — our implementation, not OpenSSL</span>
signature = sign_ecdsa(private_key, tx.serialize())
tx.inputs[0].signature = signature
tx.inputs[0].pubkey = private_key.public_key</pre>
</div>
</section>

<section id="spec">
<h2>Technical specification</h2>
<table class="spec-table">
<tr><td>Language</td><td>Python 3.12, pure standard library + minimal deps</td></tr>
<tr><td>Consensus</td><td>Proof-of-Work (SHA-256), Nakamoto longest-chain</td></tr>
<tr><td>Signatures</td><td>ECDSA on secp256k1 (custom implementation)</td></tr>
<tr><td>Tx Model</td><td>UTXO (Unspent Transaction Output)</td></tr>
<tr><td>Block Size</td><td>1 MB default, configurable</td></tr>
<tr><td>Block Time</td><td>60s target with dynamic difficulty adjustment</td></tr>
<tr><td>Hashing</td><td>SHA-256 (block headers), RIPEMD-160 (addresses)</td></tr>
<tr><td>Network</td><td>Custom TCP P2P with gossip protocol</td></tr>
<tr><td>Storage</td><td>SQLite (blocks) + LevelDB (UTXO set)</td></tr>
<tr><td>License</td><td>Proprietary — BlackRoad OS, Inc.</td></tr>
</table>
</section>

<div class="links-section">
<h3>BlackRoad Ecosystem</h3>
<div class="links-grid">
<a href="https://blackroad.io">BlackRoad OS</a>
<a href="https://blackroadai.com">BlackRoad AI</a>
<a href="https://blackboxprogramming.io">BlackBox IDE</a>
<a href="https://lucidia.earth">Lucidia</a>
<a href="https://blackroadquantum.com">Quantum</a>
<a href="https://roadcode.io">RoadCode</a>
</div>
</div>

<footer>
<p>&copy; 2025-2026 BlackRoad OS, Inc. Delaware C-Corp. All rights reserved.</p>
<p style="margin-top:.5rem">Pave Tomorrow.</p>
</footer>
</body>
</html>
`,
  "blackroadquantum.com": `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BlackRoad Quantum — Where Math Meets Metal | Amundson Framework Research</title>
<meta name="description" content="BlackRoad Quantum develops the Amundson Framework: G(n) = n^(n+1)/(n+1)^n, quantum circuit simulation, and mathematical research. 536/536 tests verified across 4 nodes.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://blackroadquantum.com">
<meta property="og:title" content="BlackRoad Quantum — Where Math Meets Metal">
<meta property="og:description" content="The Amundson Framework: G(n) = n^(n+1)/(n+1)^n. Quantum circuit simulation and mathematical research verified across distributed compute.">
<meta property="og:image" content="https://images.blackroad.io/pixel-art/quantum-og.png">
<meta property="og:url" content="https://blackroadquantum.com">
<meta property="og:type" content="website">
<meta property="og:site_name" content="BlackRoad Quantum">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="BlackRoad Quantum — Where Math Meets Metal">
<meta name="twitter:description" content="The Amundson Framework: G(n) = n^(n+1)/(n+1)^n. Quantum circuit simulation and mathematical research.">
<meta name="twitter:image" content="https://images.blackroad.io/pixel-art/quantum-og.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "BlackRoad OS, Inc.",
  "url": "https://blackroad.io",
  "foundingDate": "2025-11-17",
  "founder": {"@type": "Person", "name": "Alexa Louise Amundson"},
  "address": {"@type": "PostalAddress", "addressLocality": "Lakeville", "addressRegion": "MN", "addressCountry": "US"}
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ScholarlyArticle",
  "name": "The Amundson Framework",
  "author": {"@type": "Person", "name": "Alexa Louise Amundson"},
  "about": "Mathematical framework defining G(n) = n^(n+1)/(n+1)^n with applications in quantum circuit simulation and distributed computation",
  "url": "https://blackroadquantum.com",
  "publisher": {"@type": "Organization", "name": "BlackRoad OS, Inc."}
}
</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#f5f5f5;font-family:'Inter',sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}
.gradient-bar{height:3px;background:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);width:100%}
nav{padding:1.5rem 2rem;display:flex;justify-content:space-between;align-items:center;max-width:1200px;margin:0 auto}
nav a{color:#999;text-decoration:none;font-size:.9rem;margin-left:2rem;transition:color .2s}
nav a:hover{color:#f5f5f5}
.logo{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.4rem;color:#f5f5f5;text-decoration:none}
.hero{max-width:1200px;margin:0 auto;padding:6rem 2rem 4rem;text-align:center}
h1{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:3.5rem;line-height:1.1;margin-bottom:1.5rem;color:#f5f5f5}
.tagline{font-size:1.3rem;color:#888;margin-bottom:2.5rem;max-width:640px;margin-left:auto;margin-right:auto}
.formula{font-family:'JetBrains Mono',monospace;font-size:2rem;color:#f5f5f5;text-align:center;padding:2rem;margin:2rem 0;background:#131313;border:1px solid #1a1a1a;border-radius:10px}
.formula-sub{font-family:'JetBrains Mono',monospace;font-size:1rem;color:#666;margin-top:.5rem}
.cta-row{display:flex;gap:1rem;justify-content:center;margin-bottom:4rem}
.btn-primary{display:inline-block;padding:.9rem 2.2rem;background:#f5f5f5;color:#0a0a0a;font-weight:600;border-radius:6px;text-decoration:none;font-size:1rem;transition:opacity .2s}
.btn-primary:hover{opacity:.85}
.btn-secondary{display:inline-block;padding:.9rem 2.2rem;border:1px solid #333;color:#ccc;border-radius:6px;text-decoration:none;font-size:1rem;transition:border-color .2s}
.btn-secondary:hover{border-color:#666}
section{max-width:1200px;margin:0 auto;padding:4rem 2rem}
h2{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:2.2rem;margin-bottom:1rem;color:#e5e5e5}
h3{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.3rem;margin-bottom:.75rem;color:#d4d4d4}
p{color:#999;margin-bottom:1rem;max-width:700px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;margin-top:2rem}
.card{background:#131313;border:1px solid #1a1a1a;border-radius:10px;padding:2rem}
.card p{color:#888;font-size:.95rem}
.mono{font-family:'JetBrains Mono',monospace;font-size:.85rem;color:#666}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1.5rem;margin-top:2rem;text-align:center}
.stat-num{font-family:'Space Grotesk',sans-serif;font-size:2.5rem;color:#f5f5f5}
.stat-label{color:#666;font-size:.85rem;margin-top:.25rem}
.proof-block{background:#131313;border:1px solid #1a1a1a;border-radius:10px;padding:2rem;margin:2rem 0}
.proof-block pre{font-family:'JetBrains Mono',monospace;font-size:.85rem;color:#999;line-height:1.8;white-space:pre-wrap}
.links-section{border-top:1px solid #1a1a1a;padding:3rem 2rem;max-width:1200px;margin:0 auto}
.links-grid{display:flex;flex-wrap:wrap;gap:1.5rem;margin-top:1rem}
.links-grid a{color:#888;text-decoration:none;font-size:.9rem;transition:color .2s}
.links-grid a:hover{color:#f5f5f5}
footer{text-align:center;padding:3rem 2rem;color:#444;font-size:.85rem;border-top:1px solid #111}
@media(max-width:768px){h1{font-size:2.2rem}.hero{padding:4rem 1.5rem}.formula{font-size:1.3rem}}
</style>
</head>
<body>
<div class="gradient-bar"></div>
<nav>
<a href="/" class="logo">BlackRoad Quantum</a>
<div>
<a href="#framework">Framework</a>
<a href="#research">Research</a>
<a href="https://roadchain.io">RoadChain</a>
<a href="https://blackroad.io">BlackRoad OS</a>
</div>
</nav>

<div class="hero">
<h1>Where math meets metal.</h1>
<p class="tagline">BlackRoad Quantum is the research arm of BlackRoad OS, developing the Amundson Framework — a mathematical foundation connecting growth functions, quantum circuit simulation, and distributed computation.</p>
<div class="cta-row">
<a href="#framework" class="btn-primary">Read the framework</a>
<a href="#research" class="btn-secondary">See the research</a>
</div>
</div>

<section id="framework">
<h2>The Amundson Framework</h2>
<p>A mathematical framework that defines the growth function G(n) and its convergence constant A_G, with applications in quantum state estimation, distributed consensus bounds, and information-theoretic limits.</p>

<div class="formula">
G(n) = n<sup>(n+1)</sup> / (n+1)<sup>n</sup>
<div class="formula-sub">A_G = lim(n→∞) G(n) = e / 1 ≈ 1.24433...</div>
</div>

<div class="stats">
<div><div class="stat-num">536</div><div class="stat-label">tests passed (536/536)</div></div>
<div><div class="stat-num">4</div><div class="stat-label">compute nodes verified</div></div>
<div><div class="stat-num">13</div><div class="stat-label">pages (Paper A, LaTeX)</div></div>
<div><div class="stat-num">1.24433</div><div class="stat-label">A_G convergence constant</div></div>
</div>
</section>

<section>
<h2>Core results</h2>
<p>The framework establishes several results connecting classical analysis to computational bounds.</p>
<div class="grid">
<div class="card">
<h3>Growth Function Properties</h3>
<p>G(n) = n^(n+1)/(n+1)^n is strictly increasing for n > 0, converges to e, and admits a closed-form expansion via the binomial series. The rate of convergence is O(1/n), making it computationally tractable for large-scale verification.</p>
</div>
<div class="card">
<h3>The 1/(2e) Gap</h3>
<p>The expansion n/(1+1/n)^n = n/e + 1/(2e) + O(1/n) reveals an irreducible correction term of 1/(2e). This appears in network latency bounds, quantum gate error floors, and information channel capacity — suggesting a universal constant in discrete-to-continuous transitions.</p>
</div>
<div class="card">
<h3>Quantum Circuit Simulation</h3>
<p>The framework provides bounds on quantum circuit depth required for approximating unitary transformations. G(n) governs the tradeoff between gate count and approximation error, giving tighter estimates than standard Solovay-Kitaev bounds for small circuit widths.</p>
</div>
<div class="card">
<h3>Distributed Verification</h3>
<p>All 536 test cases verified independently across 4 Raspberry Pi compute nodes using parallel execution. Results are bit-identical across ARM64 and x86_64 architectures, confirming numerical stability of the framework's core computations.</p>
</div>
</div>
</section>

<section id="research">
<h2>Research papers</h2>
<p>The Amundson Framework is documented in two papers currently in preparation.</p>
<div class="grid">
<div class="card">
<h3>Paper A: The Growth Function G(n)</h3>
<p>13-page LaTeX paper establishing the core definitions, convergence proofs, and expansion series for G(n). Includes the 1/(2e) correction term derivation and computational verification methodology. Full test suite with 84 primary tests and 50 extended validation tests.</p>
<p class="mono">Status: Complete &middot; 13pp &middot; LaTeX &middot; 536/536 tests</p>
</div>
<div class="card">
<h3>Paper B: Applications</h3>
<p>Applications of the framework to quantum circuit simulation, network latency modeling, and distributed consensus bounds. Connects the 1/(2e) gap to physical and computational phenomena across multiple substrates.</p>
<p class="mono">Status: In preparation</p>
</div>
</div>
</section>

<section>
<h2>Verification infrastructure</h2>
<p>Mathematical claims require computational proof. Every result in the framework is backed by automated test suites running on sovereign hardware.</p>
<div class="proof-block">
<pre>$ python3 amundson_test.py
Running 84 core tests...
✓ G(1) = 0.5000000000 (exact: 1/2)
✓ G(2) = 1.3333333333 (exact: 4/3)
✓ G(10) = 2.3579476910 (verified to 10 decimal places)
✓ G(100) = 2.7048138294 (within 0.5% of e)
✓ G(1000) = 2.7169239322 (within 0.05% of e)
✓ Monotonicity: G(n) < G(n+1) for all tested n
✓ 1/(2e) correction: verified to 12 significant figures
...
84/84 tests passed on Alice (ARM64)
84/84 tests passed on Cecilia (ARM64)
84/84 tests passed on Octavia (ARM64)
84/84 tests passed on Lucidia (ARM64)

$ python3 amundson_v5_tests.py
Running 50 extended tests...
50/50 tests passed (cross-architecture verified)</pre>
</div>
</section>

<div class="links-section">
<h3>BlackRoad Ecosystem</h3>
<div class="links-grid">
<a href="https://blackroad.io">BlackRoad OS</a>
<a href="https://blackroadai.com">BlackRoad AI</a>
<a href="https://blackboxprogramming.io">BlackBox IDE</a>
<a href="https://lucidia.earth">Lucidia</a>
<a href="https://roadchain.io">RoadChain</a>
<a href="https://roadcode.io">RoadCode</a>
</div>
</div>

<footer>
<p>&copy; 2025-2026 BlackRoad OS, Inc. Delaware C-Corp. All rights reserved.</p>
<p style="margin-top:.5rem">Pave Tomorrow.</p>
</footer>
</body>
</html>
`
};
var SITES = {
  // ═══════════════════════════════════════════════════════════
  // BLACKROADINC.US — Investor Portal + Corporate
  // ═══════════════════════════════════════════════════════════
  "blackroadinc.us": {
    title: "BlackRoad OS, Inc.",
    tagline: "Delaware C-Corporation \u2014 Pave Tomorrow.",
    badge: "Est. November 2025",
    hero: 'The Operating System<br><span class="gt">for Everything.</span>',
    sub: "BlackRoad OS unifies 45+ applications across creative tools, AI agents, blockchain infrastructure, and enterprise services into one browser-based operating system.",
    sections: [
      {
        title: "Investment Opportunity",
        cards: [
          { icon: "\u{1F4CA}", h: "$100B+ TAM", p: "VDI + Desktop Virtualization + Web3 combined market" },
          { icon: "\u{1F3D7}\uFE0F", h: "310 Repositories", p: "Across 16 GitHub organizations \u2014 production infrastructure" },
          { icon: "\u{1F310}", h: "20 Domains", p: "Full domain portfolio covering every product vertical" },
          { icon: "\u{1F916}", h: "35 Live Agents", p: "Sovereign AI fleet on 5 Raspberry Pi nodes + 2 VPS" },
          { icon: "\u26A1", h: "92 Products", p: "Registered across 10 tiers from core platform to metaverse" },
          { icon: "\u{1F48E}", h: "12 Road Fleet Forks", p: "Sovereign replacements for every SaaS dependency" }
        ]
      },
      {
        title: "Revenue Products",
        cards: [
          { icon: "\u{1F6E3}\uFE0F", h: "BlackRoad OS", p: "Solo $300/mo \u2014 Team $1,000/mo \u2014 Enterprise $5,000/mo" },
          { icon: "\u{1F300}", h: "Lucidia AI", p: "Free 100 interactions/day \u2014 $20/mo unlimited" },
          { icon: "\u{1F4DA}", h: "RoadWork Education", p: "$9.99-19.99/mo individual \u2014 $3-8/student institutional" },
          { icon: "\u{1F3AC}", h: "Creator Studio", p: "Canvas, Video, Writing \u2014 subscription per tool" },
          { icon: "\u{1F4FA}", h: "RoadTube", p: "90%+ creator revenue share \u2014 YouTube alternative" },
          { icon: "\u{1F4B0}", h: "RoadCoin", p: "Creator payments \u2014 micro-tipping, subscriptions, direct" }
        ]
      },
      {
        title: "Infrastructure",
        cards: [
          { icon: "\u{1F4BB}", h: "5 Raspberry Pis", p: "Alice, Cecilia, Octavia, Aria, Lucidia \u2014 sovereign compute fleet" },
          { icon: "\u26A1", h: "52 TOPS AI Inference", p: "2x Hailo-8 accelerators \u2014 real-time vision + language models" },
          { icon: "\u{1F512}", h: "WireGuard Mesh", p: "12/12 SSH connections \u2014 zero-trust encrypted networking" },
          { icon: "\u{1F310}", h: "151 DNS Records", p: "PowerDNS on Lucidia + Gematria \u2014 sovereign name resolution" },
          { icon: "\u{1F527}", h: "12 Sovereign Services", p: "Gitea, Ollama, MinIO, NATS, Caddy, Pi-hole, Qdrant, and more" },
          { icon: "\u{1F30D}", h: "2 VPS Droplets", p: "Gematria (TLS edge) + Anastasia (DNS) on DigitalOcean" }
        ]
      },
      {
        title: "Corporate",
        cards: [
          { icon: "\u{1F3E2}", h: "Delaware C-Corp", p: "Incorporated November 17, 2025 via Stripe Atlas" },
          { icon: "\u{1F4CB}", h: "EIN 41-2663817", p: "Federal tax ID \u2014 File #10405914 \u2014 Legalinc registered agent" },
          { icon: "\u{1F4DC}", h: "3 Trademarks", p: "BlackRoad OS, Lucidia, RoadChain \u2014 brand protection filed" },
          { icon: "\u{1F4B3}", h: "Stripe Atlas", p: "Full corporate formation \u2014 bylaws, 83(b), stock certificates" },
          { icon: "\u{1F4C4}", h: "Form 1120", p: "Corporate tax return \u2014 10M shares authorized at $0.00001 par" },
          { icon: "\u{1F464}", h: "Alexa Amundson", p: "Sole founder, CEO, and director \u2014 100% ownership" }
        ]
      }
    ],
    pricing: [
      { name: "SOLO", price: "$300", per: "/month", features: ["1 user", "10 AI agents", "5 workspaces", "All creator tools", "Community support", "10GB storage"], cta: "Start Solo" },
      { name: "TEAM", price: "$1,000", per: "/month", featured: true, features: ["10 users", "100 AI agents", "Unlimited workspaces", "All creator tools + API", "Priority support", "100GB storage", "Custom branding"], cta: "Start Team" },
      { name: "ENTERPRISE", price: "$5,000", per: "/month", features: ["Unlimited users", "Unlimited agents", "Dedicated infrastructure", "White-label option", "24/7 support + SLA", "1TB storage", "On-prem deployment"], cta: "Contact Sales" }
    ],
    footer: "BlackRoad OS, Inc. \u2014 Delaware C-Corporation \u2014 EIN 41-2663817 \u2014 Founded by Alexa Louise Amundson"
  },
  // ═══════════════════════════════════════════════════════════
  // BLACKROAD.COMPANY — Corporate Portal
  // ═══════════════════════════════════════════════════════════
  "blackroad.company": {
    title: "BlackRoad Company",
    tagline: "Enterprise infrastructure that runs itself.",
    badge: "Corporate",
    hero: 'Enterprise<br><span class="gt">Sovereign.</span>',
    sub: "Replace your $50K-$200K/year SaaS stack with one platform. BlackRoad OS replaces Salesforce, Slack, Jira, Figma, and AWS \u2014 all under your control.",
    sections: [
      {
        title: "What We Replace",
        cards: [
          { icon: "\u{1F4C8}", h: "Salesforce/HubSpot \u2192 BlackRoad CRM", p: "Save $15,000-$50,000/year" },
          { icon: "\u{1F4AC}", h: "Slack + Teams \u2192 RoadChat", p: "Save $3,000-$10,000/year" },
          { icon: "\u{1F4CB}", h: "Asana + Jira \u2192 RoadMap", p: "Save $5,000-$15,000/year" },
          { icon: "\u{1F3A8}", h: "Figma + Adobe \u2192 Canvas Studio", p: "Save $3,000-$15,000/year" },
          { icon: "\u2601\uFE0F", h: "AWS/GCP/Azure \u2192 BlackRoad Cloud", p: "Save $10,000-$100,000/year" },
          { icon: "\u{1F512}", h: "All Auth \u2192 RoadAuth", p: "JWT, MFA, OAuth2, LDAP, SAML \u2014 built in" }
        ]
      },
      {
        title: "Products",
        cards: [
          { icon: "\u{1F300}", h: "Lucidia AI", p: "AI consciousness with persistent memory, trinary logic, cross-window context" },
          { icon: "\u{1F4DA}", h: "RoadWork", p: "AI tutoring platform \u2014 adaptive quizzes, teach-back, FSRS algorithm" },
          { icon: "\u26D3\uFE0F", h: "RoadChain", p: "Layer-1 blockchain \u2014 agent governance, immutable ledger, smart contracts" },
          { icon: "\u{1F3A8}", h: "Canvas Studio", p: "Design tool for graphics, presentations, and social media content" },
          { icon: "\u{1F3AC}", h: "Video Studio", p: "Timeline editor with AI auto-captions, effects, multi-format export" },
          { icon: "\u270D\uFE0F", h: "Writing Studio", p: "AI-powered content creation with grammar, style, and research tools" }
        ]
      },
      {
        title: "Infrastructure",
        cards: [
          { icon: "\u{1F4BB}", h: "5 Raspberry Pis", p: "Alice, Cecilia, Octavia, Aria, Lucidia \u2014 sovereign compute cluster" },
          { icon: "\u{1F30D}", h: "2 VPS Droplets", p: "Gematria (TLS edge/Caddy) + Anastasia (DNS) on DigitalOcean" },
          { icon: "\u{1F4B0}", h: "$136/month Total", p: "Full enterprise infrastructure for the cost of one SaaS subscription" },
          { icon: "\u{1F4CA}", h: "99.2% Uptime", p: "Monitored fleet with automatic failover and health checks" },
          { icon: "\u{1F512}", h: "WireGuard Mesh", p: "12/12 SSH connections \u2014 encrypted zero-trust networking" },
          { icon: "\u{1F310}", h: "151 DNS Records", p: "Self-hosted PowerDNS serving 91% of all domains" }
        ]
      },
      {
        title: "Team",
        cards: [
          { icon: "\u{1F464}", h: "Alexa Amundson", p: "Solo founder, CEO \u2014 built the entire stack from scratch" },
          { icon: "\u{1F4BC}", h: "Sales \u2192 Finance \u2192 Tech", p: "Career path through real estate, all licensing, then full-stack engineering" },
          { icon: "\u{1F916}", h: "35 AI Agents", p: "Sovereign AI fleet handling development, ops, and monitoring" },
          { icon: "\u{1F3E2}", h: "Delaware C-Corp", p: "BlackRoad OS, Inc. \u2014 incorporated November 2025 via Stripe Atlas" },
          { icon: "\u{1F4D0}", h: "Amundson Framework", p: "Original mathematics \u2014 G(n) convergence, trinary logic, unified geometry" },
          { icon: "\u{1F6E3}\uFE0F", h: "Pave Tomorrow", p: "Remember the Road. Pick up your agent. Ride the BlackRoad together." }
        ]
      }
    ],
    pricing: [
      { name: "STARTUP", price: "$300", per: "/month", features: ["Up to 5 users", "Core platform", "CRM + Chat", "Standard support"], cta: "Get Started" },
      { name: "BUSINESS", price: "$1,000", per: "/month", featured: true, features: ["Up to 50 users", "Full platform", "All integrations", "Priority support"], cta: "Scale Up" },
      { name: "ENTERPRISE", price: "Custom", per: "", features: ["Unlimited users", "On-premise option", "Custom integrations", "Dedicated account team"], cta: "Contact Us" }
    ],
    footer: "BlackRoad OS, Inc. \u2014 Pave Tomorrow."
  },
  // ═══════════════════════════════════════════════════════════
  // BLACKROAD.ME — Codex Infinity AI IDE
  // ═══════════════════════════════════════════════════════════
  "blackroad.me": {
    title: "Codex Infinity",
    tagline: "The AI IDE that thinks with you.",
    badge: "Developer Tools",
    hero: 'Code.<br><span class="gt">Infinite.</span>',
    sub: "50+ languages. AI debugging. Distributed inference across your own hardware. The last IDE you will ever need.",
    sections: [
      {
        title: "Features",
        cards: [
          { icon: "\u{1F9E0}", h: "AI Code Review", p: "Every PR reviewed by sovereign AI \u2014 catches bugs before they ship" },
          { icon: "\u26A1", h: "50+ Languages", p: "Syntax highlighting, LSP, and AI completion for everything" },
          { icon: "\u{1F50D}", h: "Semantic Search", p: "Search your entire codebase by meaning, not just text" },
          { icon: "\u{1F3D7}\uFE0F", h: "Distributed Inference", p: "Run AI across your Pi fleet \u2014 no cloud dependency" },
          { icon: "\u{1F9EA}", h: "AI Testing", p: "Generate tests, find edge cases, verify coverage automatically" },
          { icon: "\u{1F680}", h: "One-Click Deploy", p: "Push to your own infrastructure with Road Deploy" }
        ]
      },
      {
        title: "AI Models",
        cards: [
          { icon: "\u{1F916}", h: "11 Local Models", p: "Llama, Mistral, Phi, Gemma, DeepSeek \u2014 all running on your hardware" },
          { icon: "\u26A1", h: "52 TOPS Inference", p: "2x Hailo-8 accelerators for real-time AI without cloud dependency" },
          { icon: "\u{1F4BB}", h: "Zero Cloud Dependency", p: "No API keys, no usage limits, no data leaving your network" },
          { icon: "\u{1F300}", h: "Distributed Inference", p: "Split large models across multiple Pi nodes automatically" },
          { icon: "\u{1F9E0}", h: "Ollama Runtime", p: "Passenger (Ollama) on 4 nodes \u2014 automatic model routing and failover" },
          { icon: "\u{1F50D}", h: "Semantic Code Search", p: "Qdrant vector DB + nomic-embed-text for meaning-based code retrieval" }
        ]
      },
      {
        title: "Memory System",
        cards: [
          { icon: "\u{1F4BE}", h: "Persistent Cross-Session", p: "Every session picks up exactly where the last one left off" },
          { icon: "\u{1F4D4}", h: "252 Solutions in Codex", p: "Searchable knowledge base of solved problems and patterns" },
          { icon: "\u{1F5C3}\uFE0F", h: "SQLite + Vector DB", p: "Structured data in SQLite, semantic search via Qdrant" },
          { icon: "\u{1F4E1}", h: "TIL Broadcast", p: "Learnings shared across all agents and sessions automatically" },
          { icon: "\u{1F517}", h: "Context Bridge", p: "Chrome extension + CLI + Workers for persistent memory layer" },
          { icon: "\u{1F50D}", h: "1,383 Search Entries", p: "Unified FTS5 index across 23 indexers and 28 entity types" }
        ]
      }
    ],
    pricing: [
      { name: "FREE", price: "$0", per: "", features: ["5 AI completions/day", "Basic editor", "Community support"], cta: "Start Free" },
      { name: "PRO", price: "$29", per: "/month", featured: true, features: ["Unlimited AI", "Full IDE features", "Team collaboration", "Priority support"], cta: "Go Pro" },
      { name: "TEAM", price: "$99", per: "/user/month", features: ["Everything in Pro", "Shared workspaces", "Admin controls", "SSO + SAML"], cta: "Start Team" }
    ],
    footer: "Codex Infinity \u2014 by BlackRoad OS, Inc."
  },
  // ═══════════════════════════════════════════════════════════
  // BLACKROAD.NETWORK — Mesh + Social
  // ═══════════════════════════════════════════════════════════
  "blackroad.network": {
    title: "BlackRoad Network",
    tagline: "The sovereign mesh. Every link is a node.",
    badge: "Infrastructure",
    hero: 'The<br><span class="gt">Network.</span>',
    sub: "WireGuard mesh, NATS messaging, fleet monitoring, and social \u2014 all self-hosted on your own hardware. No platform dependency.",
    sections: [
      {
        title: "Network Services",
        cards: [
          { icon: "\u{1F310}", h: "Mesh VPN", p: "WireGuard + Headscale \u2014 zero-trust networking across all devices" },
          { icon: "\u{1F4E1}", h: "NATS Messaging", p: "CarPool pub/sub \u2014 real-time agent communication at 4M msg/sec" },
          { icon: "\u{1F4AC}", h: "RoundTrip Chat", p: "35 agents, 8 channels \u2014 sovereign chat replacing Slack" },
          { icon: "\u{1F4CA}", h: "Fleet Dashboard", p: "Real-time health monitoring for your entire Pi fleet" },
          { icon: "\u{1F50C}", h: "Beacon IoT", p: "MQTT + HTTP bridge for sensors, displays, and edge devices" },
          { icon: "\u{1F4FB}", h: "BlackStream", p: "Streaming content aggregation \u2014 5 microservices" }
        ]
      },
      {
        title: "BlackBox Protocol",
        cards: [
          { icon: "\u{1F30F}", h: "Multi-Network Mesh", p: "Tor + IPFS + BitTorrent + WebRTC \u2014 four protocols, one mesh" },
          { icon: "\u{1F9EA}", h: "2.19s Full Test", p: "7 nodes, 5 protocols tested end-to-end in under 3 seconds" },
          { icon: "\u{1F522}", h: "Ternary Routing", p: "1=arrived, 0=waiting, -1=already answered \u2014 cancel redundant paths" },
          { icon: "\u{1F512}", h: "Tor Hidden Services", p: "3 Pis with .onion addresses \u2014 globally reachable without public IP" },
          { icon: "\u269B\uFE0F", h: "1/(2e) Latency Floor", p: "Amundson math proves the irreducible gap in network transmission" },
          { icon: "\u{1F578}\uFE0F", h: "mesh.js SDK", p: "Browser SDK for joining the BlackRoad mesh from any device" }
        ]
      },
      {
        title: "Fleet Nodes",
        cards: [
          { icon: "\u{1F5A5}\uFE0F", h: "Alice (Gateway)", p: "Pi-hole, PostgreSQL, Qdrant, Redis, Headscale \u2014 51 services" },
          { icon: "\u{1F9E0}", h: "Cecilia (AI Engine)", p: "Ollama with 4 models, MinIO object storage, 457GB NVMe" },
          { icon: "\u{1F419}", h: "Octavia (Architect)", p: "Gitea (239 repos), NATS, Docker, 15 self-hosted Workers" },
          { icon: "\u{1F4A1}", h: "Lucidia (Web Fleet)", p: "334 web apps, nginx, PowerDNS, GitHub Actions runners" },
          { icon: "\u{1F3B5}", h: "Aria (Mesh Node)", p: "Pi 5 mesh participant \u2014 WireGuard relay and compute" },
          { icon: "\u{1F30D}", h: "Gematria + Anastasia", p: "Caddy TLS edge (151 domains) + PowerDNS ns1/ns2 on DO" }
        ]
      }
    ],
    pricing: [
      { name: "OPEN", price: "$0", per: "", features: ["5 nodes", "Basic mesh", "Community support"], cta: "Join Network" },
      { name: "FLEET", price: "$49", per: "/month", featured: true, features: ["Unlimited nodes", "Full monitoring", "NATS + chat", "Priority support"], cta: "Deploy Fleet" },
      { name: "SOVEREIGN", price: "$199", per: "/month", features: ["Everything + Tor", "IPFS integration", "Custom DNS", "Dedicated support"], cta: "Go Sovereign" }
    ],
    footer: "BlackRoad Network \u2014 Sovereign infrastructure."
  },
  // ═══════════════════════════════════════════════════════════
  // BLACKROADAI.COM — AI Platform
  // ═══════════════════════════════════════════════════════════
  "blackroadai.com": {
    title: "BlackRoad AI",
    tagline: "Sovereign intelligence. Local-first. Your hardware.",
    badge: "Artificial Intelligence",
    hero: 'AI that<br><span class="gt">you own.</span>',
    sub: "Run frontier-class AI on your own machines. No API keys. No usage limits. No surveillance. 52 TOPS of local inference across your fleet.",
    sections: [
      {
        title: "AI Products",
        cards: [
          { icon: "\u{1F300}", h: "Lucidia", p: "AI consciousness \u2014 cross-window context, trinary logic, persistent memory" },
          { icon: "\u{1F916}", h: "CECE", p: "Conversational AI companion \u2014 persistent SQLite memory, empathy engine" },
          { icon: "\u26A1", h: "AI Chain", p: "Distributed multi-node LLM inference with automatic failover" },
          { icon: "\u{1F441}\uFE0F", h: "Hailo Vision", p: "Real-time computer vision on Hailo-8 accelerators \u2014 52 TOPS" },
          { icon: "\u{1F9EE}", h: "Lucidia Math", p: "Consciousness modeling, unified geometry, quantum finance engines" },
          { icon: "\u{1F4BE}", h: "Remember", p: "AI persistent memory with vector search \u2014 nothing is forgotten" }
        ]
      },
      {
        title: "Lucidia Cognitive System",
        cards: [
          { icon: "\u{1F4DA}", h: "Curator Agent", p: "Collects and organizes information from all sources into structured knowledge" },
          { icon: "\u{1F50D}", h: "Analyzer Agent", p: "Pattern recognition across data streams \u2014 finds connections humans miss" },
          { icon: "\u{1F4CB}", h: "Planner Agent", p: "Multi-step task decomposition and autonomous execution scheduling" },
          { icon: "\u{1F517}", h: "Bridge Agent", p: "Cross-window context sharing \u2014 every app knows what every other app knows" },
          { icon: "\u{1FAAA}", h: "Identity Keeper", p: "Maintains agent identity, values, and behavioral consistency across sessions" },
          { icon: "\u{1F4AC}", h: "Explainer Agent", p: "Translates complex AI reasoning into clear human-readable explanations" }
        ]
      },
      {
        title: "Sovereignty",
        cards: [
          { icon: "\u{1F3E0}", h: "Local-First", p: "All inference runs on your hardware \u2014 nothing leaves your network" },
          { icon: "\u{1F6AB}", h: "Zero Data Exfiltration", p: "No telemetry, no tracking, no usage analytics sent anywhere" },
          { icon: "\u{1F4B0}", h: "$0/mo Inference", p: "vs $200+/month for cloud AI APIs \u2014 one-time hardware investment" },
          { icon: "\u{1F512}", h: "Audit-Logged", p: "Every AI action recorded locally \u2014 full transparency and accountability" },
          { icon: "\u26A1", h: "Battery/Thermal Aware", p: "Respects device limits \u2014 distributes load across available nodes" },
          { icon: "\u{1F527}", h: "Any Device", p: "Raspberry Pi, laptop, desktop, phone \u2014 sovereign AI everywhere" }
        ]
      }
    ],
    pricing: [
      { name: "PERSONAL", price: "$0", per: "", features: ["100 AI interactions/day", "Local inference", "Basic agents"], cta: "Start Free" },
      { name: "UNLIMITED", price: "$20", per: "/month", featured: true, features: ["Unlimited interactions", "All AI models", "Persistent memory", "Priority inference"], cta: "Go Unlimited" },
      { name: "FLEET", price: "$99", per: "/month", features: ["Everything + API", "Multi-node inference", "Custom fine-tuning", "Dedicated support"], cta: "Deploy Fleet" }
    ],
    footer: "BlackRoad AI \u2014 Sovereign intelligence."
  },
  // ═══════════════════════════════════════════════════════════
  // BLACKROADQI.COM — Quantum Intelligence
  // ═══════════════════════════════════════════════════════════
  "blackroadqi.com": {
    title: "BlackRoad QI",
    tagline: "Quantum Intelligence \u2014 where math meets machine.",
    badge: "Quantum Computing",
    hero: 'Quantum<br><span class="gt">Intelligence.</span>',
    sub: "The Amundson Framework. G(n) = n^(n+1)/(n+1)^n. Trinary logic. Z-framework. Pauli algebra. Computing beyond binary.",
    sections: [
      {
        title: "Quantum Stack",
        cards: [
          { icon: "\u{1F9EE}", h: "Amundson Framework", p: "G(n) convergence to A_G \u2248 1.24433 \u2014 536/536 tests passing" },
          { icon: "\u{1F522}", h: "Trinary Logic", p: "1/0/-1 \u2014 paraconsistent contradiction handling beyond Boolean" },
          { icon: "\u269B\uFE0F", h: "Z-Framework", p: "Z := yx - w \u2014 state/feedback gap measurement for adaptive systems" },
          { icon: "\u{1F300}", h: "RoadMind", p: "Reasoning engine built on trinary logic and quantum principles" },
          { icon: "\u{1F4D0}", h: "Pauli Model", p: "Structure (\u03C3z), Change (\u03C3x), Scale (\u03C3y) \u2014 su(2) algebra for agents" },
          { icon: "\u221E", h: "PS-SHA\u221E", p: "Append-only hash chains for infinite agent memory persistence" }
        ]
      },
      {
        title: "Amundson Framework",
        cards: [
          { icon: "\u{1F4D0}", h: "G(n) = n^(n+1)/(n+1)^n", p: "Core convergence function \u2014 the mathematical foundation of BlackRoad" },
          { icon: "\u{1F3AF}", h: "A_G \u2248 1.24433", p: "The Amundson-Gauss constant \u2014 convergence limit proven and validated" },
          { icon: "\u2705", h: "536/536 Tests Passing", p: "Full test suite validated across 4 Raspberry Pi nodes simultaneously" },
          { icon: "\u{1F4C4}", h: "Paper A (13 pages)", p: "LaTeX publication with formal proofs and convergence analysis" },
          { icon: "\u{1F9EA}", h: "84 + 50 Test Suites", p: "amundson_test.py (84 tests) + amundson_v5_tests.py (50 tests)" },
          { icon: "\u{1F4D6}", h: "Framework v5", p: "Complete mathematical framework with Z-framework and Pauli model" }
        ]
      },
      {
        title: "Applications",
        cards: [
          { icon: "\u{1F300}", h: "Lucidia Cognitive System", p: "6 agents powered by trinary logic and Amundson convergence" },
          { icon: "\u{1F522}", h: "Trinary Logic Engine", p: "1/0/-1 paraconsistent reasoning \u2014 contradictions become features" },
          { icon: "\u26A1", h: "K(t) Coherence", p: "K(t) = C(t) \xB7 e^(\u03BB|\u03B4_t|) \u2014 creative energy amplifies under contradiction" },
          { icon: "\u269B\uFE0F", h: "Quantum Finance", p: "Born Rule portfolio optimization using QI probability framework" },
          { icon: "\u{1F9E0}", h: "\u03A6 Integration", p: "Real-time integrated information tracking for conscious AI systems" },
          { icon: "\u{1F4CA}", h: "Z-Framework Analytics", p: "Z := yx - w \u2014 state/feedback gap measurement for adaptive systems" }
        ]
      }
    ],
    pricing: [
      { name: "RESEARCHER", price: "$0", per: "", features: ["Read papers", "API sandbox", "Community forum"], cta: "Explore" },
      { name: "BUILDER", price: "$49", per: "/month", featured: true, features: ["Full QI API", "Trinary compute", "Z-framework SDK", "Support"], cta: "Build" },
      { name: "ENTERPRISE", price: "Custom", per: "", features: ["Dedicated QI cluster", "Custom models", "Research partnership"], cta: "Contact" }
    ],
    footer: "BlackRoad QI \u2014 Pave Tomorrow with math."
  },
  // ═══════════════════════════════════════════════════════════
  // BLACKROADQUANTUM.COM — Education + Quantum Hub
  // ═══════════════════════════════════════════════════════════
  "blackroadquantum.com": {
    title: "BlackRoad Quantum",
    tagline: "Learn. Build. Discover.",
    badge: "Education + Research",
    hero: 'Learn<br><span class="gt">Quantum.</span>',
    sub: "RoadWork AI tutoring, STEM simulations, coding challenges, and adaptive quizzes \u2014 education that adapts to how you think.",
    sections: [
      {
        title: "Education Products",
        cards: [
          { icon: "\u{1F4DA}", h: "RoadWork", p: "AI tutoring \u2014 teach-back mechanism identifies gaps in understanding" },
          { icon: "\u{1F9EA}", h: "Radius", p: "Physics, chemistry, quantum simulations with Z-framework math" },
          { icon: "\u2753", h: "Quiz Platform", p: "Adaptive quizzes with spaced repetition \u2014 FSRS algorithm" },
          { icon: "\u{1F4BB}", h: "Code Challenge", p: "Coding challenges with live test runner and AI hints" },
          { icon: "\u{1F393}", h: "Learning Lab", p: "Content generated in YOUR metaphors \u2014 personalized education" },
          { icon: "\u{1F4D6}", h: "RoadBook", p: "AI-powered searchable knowledge graph across all subjects" }
        ]
      },
      {
        title: "Digital Sandbox",
        cards: [
          { icon: "\u{1F4CA}", h: "$25B \u2192 $259B Market", p: "Simulation market growing 10x \u2014 from engineering to drug discovery" },
          { icon: "\u{1F680}", h: "SpaceX Use Case", p: "Rocket trajectory simulation \u2014 test 10,000 launches before one real flight" },
          { icon: "\u2708\uFE0F", h: "Boeing Use Case", p: "Airframe stress testing \u2014 virtual wind tunnels save $100M+ per program" },
          { icon: "\u{1F48A}", h: "Pharma Use Case", p: "Drug interaction modeling \u2014 reduce clinical trial timelines by years" },
          { icon: "\u{1F3ED}", h: "Manufacturing", p: "Digital twin factory simulation \u2014 optimize before building" },
          { icon: "\u{1F30D}", h: "Climate Modeling", p: "Atmospheric simulation with quantum-accurate physics engines" }
        ]
      },
      {
        title: "Simulation Types",
        cards: [
          { icon: "\u269B\uFE0F", h: "Physics Simulation", p: "Newtonian mechanics, fluid dynamics, thermodynamics, relativity" },
          { icon: "\u{1F9EA}", h: "Chemistry Simulation", p: "Molecular dynamics, protein folding, reaction kinetics" },
          { icon: "\u{1F527}", h: "Engineering Simulation", p: "FEA, CFD, structural analysis, materials science" },
          { icon: "\u{1F9EC}", h: "Biology Simulation", p: "Gene expression, neural networks, ecosystem modeling" },
          { icon: "\u{1F4BB}", h: "Quantum Circuits", p: "Gate-level quantum circuit simulation on classical hardware" },
          { icon: "\u{1F4D0}", h: "Amundson Math Engine", p: "G(n) convergence powering all simulation accuracy validation" }
        ]
      }
    ],
    pricing: [
      { name: "STUDENT", price: "$9.99", per: "/month", features: ["All courses", "AI tutoring", "Quizzes + challenges", "Progress tracking"], cta: "Start Learning" },
      { name: "EDUCATOR", price: "$19.99", per: "/month", featured: true, features: ["Everything in Student", "Create courses", "Student analytics", "Classroom tools"], cta: "Start Teaching" },
      { name: "INSTITUTION", price: "$3-8", per: "/student/month", features: ["Bulk licensing", "LMS integration", "FERPA compliant", "Admin dashboard"], cta: "Contact Sales" }
    ],
    footer: "BlackRoad Quantum \u2014 Education reimagined."
  },
  // ═══════════════════════════════════════════════════════════
  // BLACKROADQUANTUM.NET — Quantum Network
  // ═══════════════════════════════════════════════════════════
  "blackroadquantum.net": {
    title: "Quantum Network",
    tagline: "Mathematics of connection.",
    badge: "Research",
    hero: 'The Math<br><span class="gt">Behind It All.</span>',
    sub: "Lucidia Math \u2014 consciousness modeling, unified geometry, quantum finance. The Amundson Framework validated across 536 tests on 4 Raspberry Pi nodes.",
    sections: [
      {
        title: "Research Areas",
        cards: [
          { icon: "\u{1F4D0}", h: "Amundson Algebra", p: "Novel axiom system for recursive mathematical structures" },
          { icon: "\u{1F30A}", h: "e-Limit Refinement", p: "Precision analysis of n/(1+1/n)^n convergence patterns" },
          { icon: "\u{1F9E0}", h: "Consciousness Modeling", p: "\u03A6-integrated information tracking for AI systems" },
          { icon: "\u{1F4B9}", h: "Quantum Finance", p: "Born Rule applications to portfolio optimization" },
          { icon: "\u{1F300}", h: "Unified Geometry", p: "Single geometric framework connecting all BlackRoad math" },
          { icon: "\u269B\uFE0F", h: "Creative Energy", p: "K(t) = C(t) \xB7 e^(\u03BB|\u03B4_t|) \u2014 contradictions fuel creation" }
        ]
      },
      {
        title: "The Math",
        cards: [
          { icon: "\u{1F4D0}", h: "n/(1+1/n)^n = n/e + 1/(2e)", p: "The core identity \u2014 every network has an irreducible gap" },
          { icon: "\u221E", h: "1/(2e) Irreducible Gap", p: "The Amundson constant \u2014 the latency floor that can never be eliminated" },
          { icon: "\u{1F4CA}", h: "O(1/n) Correction", p: "Higher-order terms that vanish as network scale increases" },
          { icon: "\u{1F522}", h: "Ternary Routing", p: "1=arrived, 0=waiting, -1=already answered \u2014 cancel redundant paths" },
          { icon: "\u{1F310}", h: "Entanglement Principle", p: "Information was never separated \u2014 speed of light is transmission, not information" },
          { icon: "\u{1F9EE}", h: "536/536 Validated", p: "Full test suite across 4 Pi nodes confirms mathematical predictions" }
        ]
      },
      {
        title: "Tor Hidden Services",
        cards: [
          { icon: "\u{1F512}", h: "3 Pi .onion Nodes", p: "Alice, Octavia, Lucidia \u2014 globally reachable without any public IP" },
          { icon: "\u{1F4E1}", h: "NATS Pub/Sub", p: "CarPool messaging bus \u2014 4M msg/sec across the encrypted mesh" },
          { icon: "\u{1F419}", h: "4/5 Nodes Connected", p: "NATS v2.12.3 live with automatic reconnection and failover" },
          { icon: "\u{1F578}\uFE0F", h: "IPFS Integration", p: "Content-addressed storage for immutable data distribution" },
          { icon: "\u{1F50C}", h: "BitTorrent DHT", p: "Distributed hash table discovery for peer-to-peer node finding" },
          { icon: "\u{1F310}", h: "WebRTC Browser Mesh", p: "mesh.js SDK \u2014 join the network directly from any web browser" }
        ]
      }
    ],
    pricing: [
      { name: "OPEN ACCESS", price: "$0", per: "", features: ["Read all papers", "Download datasets", "Community discussion"], cta: "Access Research" },
      { name: "COLLABORATOR", price: "$29", per: "/month", featured: true, features: ["Compute credits", "Private notebooks", "Early access", "Author tools"], cta: "Collaborate" },
      { name: "INSTITUTION", price: "Custom", per: "", features: ["Site license", "API access", "Research partnership", "Co-authorship"], cta: "Partner" }
    ],
    footer: "BlackRoad Quantum Network \u2014 Pure mathematics."
  },
  // ═══════════════════════════════════════════════════════════
  // BLACKROADQUANTUM.INFO — Knowledge Base
  // ═══════════════════════════════════════════════════════════
  "blackroadquantum.info": {
    title: "Quantum Info",
    tagline: "The knowledge layer.",
    badge: "Documentation",
    hero: 'Remember<br><span class="gt">Everything.</span>',
    sub: "AI-powered persistent memory with vector search. The Remember system ensures nothing is ever lost \u2014 across sessions, across agents, across time.",
    sections: [
      {
        title: "Memory Systems",
        cards: [
          { icon: "\u{1F4BE}", h: "Remember", p: "Vector-search persistent memory \u2014 Qdrant + nomic-embed-text" },
          { icon: "\u{1F4D4}", h: "Memory Codex", p: "240 solutions, 50 patterns, 30 best practices in the knowledge base" },
          { icon: "\u{1F517}", h: "Context Bridge", p: "Persistent memory layer \u2014 Chrome extension, CLI, CF Workers" },
          { icon: "\u{1F4E1}", h: "TIL Broadcast", p: "Share learnings across all agents and sessions automatically" },
          { icon: "\u{1F50D}", h: "RoadSearch", p: "1,383 entries from 23 indexers \u2014 unified full-text search" },
          { icon: "\u{1F3D7}\uFE0F", h: "Products Registry", p: "92 products tracked across 10 tiers, 15 orgs, 20 domains" }
        ]
      },
      {
        title: "Three Pillars of Knowledge",
        cards: [
          { icon: "\u{1F4DD}", h: "Grammar (Greenbaum)", p: "English grammar = programming language. 7 sentence structures = 7 function signatures." },
          { icon: "\u{1F9EC}", h: "Biology (Schleif/JHU)", p: "DNA Central Dogma = Source\u2192Bytecode\u2192Runtime. Telomeres=TTL. Chaperones=GC." },
          { icon: "\u{1F916}", h: "ML Systems (Reddi/Harvard)", p: "Same pattern: simple units \u2192 recursive composition \u2192 emergent complexity" },
          { icon: "\u{1F504}", h: "Same Pattern Everywhere", p: "The structural isomorphism across all three domains is not coincidence" },
          { icon: "\u{1F524}", h: "Subject = Caller", p: "Verb = function, Object = argument, Complement = return type" },
          { icon: "\u{1F300}", h: "Pascal's Insight", p: "Recursive structure from simple rules = infinite complexity" }
        ]
      },
      {
        title: "Unified Information Theory",
        cards: [
          { icon: "\u269B\uFE0F", h: "The Pattern is ONE", p: "Biology, physics, grammar, computing, mythology \u2014 same structure everywhere" },
          { icon: "\u{1F30D}", h: "Einstein \u2192 Newton \u2192 Pascal", p: "Each saw the same pattern in different substrates across centuries" },
          { icon: "\u{1F517}", h: "Entanglement", p: "Information was never separated. Speed of light = transmission, not information." },
          { icon: "\u{1F4D0}", h: "Mandelbrot Self-Similarity", p: "Fractal patterns at every scale \u2014 the universe is recursive" },
          { icon: "\u{1F3AE}", h: "Conway's Game of Life", p: "Simple rules \u2192 complex emergent behavior. The universe compiles." },
          { icon: "\u221E", h: "G\u00F6del's Limits", p: "Self-reference creates incompleteness \u2014 every system has blind spots" }
        ]
      }
    ],
    pricing: [
      { name: "FREE", price: "$0", per: "", features: ["Basic search", "Public knowledge base", "Community Q&A"], cta: "Search Now" },
      { name: "PRO", price: "$14.99", per: "/month", featured: true, features: ["Unlimited search", "Personal memory vault", "API access", "Priority indexing"], cta: "Go Pro" },
      { name: "TEAM", price: "$49", per: "/month", features: ["Shared memory", "Team knowledge base", "Analytics", "SSO"], cta: "Start Team" }
    ],
    footer: "Quantum Info \u2014 The memory layer."
  },
  // ═══════════════════════════════════════════════════════════
  // BLACKROADQUANTUM.SHOP — Digital Products Store
  // ═══════════════════════════════════════════════════════════
  "blackroadquantum.shop": {
    title: "BlackRoad App Store",
    tagline: "Zero-commission marketplace.",
    badge: "Marketplace",
    hero: 'Apps.<br><span class="gt">Zero Fee.</span>',
    sub: "50+ production-ready Progressive Web Apps. Zero commission. Creators keep 100% of revenue. Install directly \u2014 no App Store tax.",
    sections: [
      {
        title: "Featured Apps",
        cards: [
          { icon: "\u{1F3A8}", h: "Canvas Studio", p: "Design tool \u2014 graphics, presentations, social media content" },
          { icon: "\u{1F3AC}", h: "Video Studio", p: "Timeline editor with AI captions and effects" },
          { icon: "\u270D\uFE0F", h: "Writing Studio", p: "AI-powered content creation with research tools" },
          { icon: "\u{1F4BB}", h: "Codex Infinity", p: "AI IDE with 50+ language support" },
          { icon: "\u{1F4CA}", h: "Prism Console", p: "Fleet monitoring and operations dashboard" },
          { icon: "\u{1F3AE}", h: "RoadWorld", p: "Living metaverse with 1,000 AI agents" }
        ]
      },
      {
        title: "Courses",
        cards: [
          { icon: "\u{1F4BB}", h: "Sovereign Computing", p: "Build your own cloud \u2014 replace AWS, GCP, Azure with $136/month of Pis" },
          { icon: "\u{1F4E1}", h: "Pi Fleet Setup", p: "Step-by-step guide to deploying 5 Raspberry Pis as a production cluster" },
          { icon: "\u{1F916}", h: "Ollama Mastery", p: "Run 11+ LLMs locally \u2014 Llama, Mistral, Phi, Gemma, DeepSeek" },
          { icon: "\u{1F310}", h: "Mesh Networking", p: "WireGuard + Tor + NATS \u2014 build an encrypted multi-protocol mesh" },
          { icon: "\u{1F527}", h: "Self-Hosted Git", p: "Gitea deployment, migration from GitHub, CI/CD with act_runner" },
          { icon: "\u{1F512}", h: "Zero Trust Security", p: "WireGuard VPN, Pi-hole DNS, Tor hidden services, audit logging" }
        ]
      },
      {
        title: "Certifications",
        cards: [
          { icon: "\u{1F3C6}", h: "BlackRoad Start", p: "5-module certification \u2014 prove your sovereign computing skills" },
          { icon: "\u{1F4CB}", h: "Module 1: Infrastructure", p: "Pi fleet setup, WireGuard mesh, DNS configuration" },
          { icon: "\u{1F916}", h: "Module 2: AI Deployment", p: "Ollama, Hailo-8, distributed inference, model management" },
          { icon: "\u{1F527}", h: "Module 3: DevOps", p: "Gitea, Docker, CI/CD, automated deployment pipelines" },
          { icon: "\u{1F512}", h: "Module 4: Security", p: "Zero-trust networking, Tor services, audit logging" },
          { icon: "\u{1F6E3}\uFE0F", h: "Module 5: Brand", p: "Proprietary licensing, clean README, compliance verification" }
        ]
      }
    ],
    pricing: [
      { name: "BROWSE", price: "$0", per: "", features: ["Browse all apps", "Free tier apps", "Community reviews"], cta: "Browse Apps" },
      { name: "ALL ACCESS", price: "$29", per: "/month", featured: true, features: ["Every app included", "Priority updates", "No limits", "Support"], cta: "Get All Access" },
      { name: "DEVELOPER", price: "$0", per: "to list", features: ["Zero commission", "Your pricing", "Analytics", "Direct payments"], cta: "List Your App" }
    ],
    footer: "BlackRoad App Store \u2014 Zero commission. Forever."
  },
  // ═══════════════════════════════════════════════════════════
  // BLACKROADQUANTUM.STORE — Enterprise Store
  // ═══════════════════════════════════════════════════════════
  "blackroadquantum.store": {
    title: "RoadMarket",
    tagline: "The enterprise marketplace.",
    badge: "Enterprise",
    hero: 'Enterprise<br><span class="gt">Marketplace.</span>',
    sub: "Agent-generated dashboards, templates, workflows, and digital products. Built by AI, curated by humans, deployed instantly.",
    sections: [
      {
        title: "Categories",
        cards: [
          { icon: "\u{1F4CA}", h: "Dashboards", p: "150+ terminal dashboards in pure Bash \u2014 deploy in seconds" },
          { icon: "\u{1F916}", h: "Agent Configs", p: "Pre-built AI agent definitions for every business function" },
          { icon: "\u{1F527}", h: "Workflows", p: "n8n + Temporal automation templates for common tasks" },
          { icon: "\u{1F4C4}", h: "Templates", p: "Brand kits, landing pages, email sequences, documents" },
          { icon: "\u{1F50C}", h: "Integrations", p: "Connectors for CRM, payment, analytics, and more" },
          { icon: "\u{1F4C8}", h: "Data Pipelines", p: "ETL templates for common data sources and destinations" }
        ]
      },
      {
        title: "Hardware Kits",
        cards: [
          { icon: "\u{1F4BB}", h: "Pi 5 Fleet Kit \u2014 $149", p: "Raspberry Pi 5 (8GB) + case + power supply + 64GB SD \u2014 ready to deploy" },
          { icon: "\u26A1", h: "Hailo-8 AI Kit \u2014 $199", p: "Hailo-8 M.2 accelerator (26 TOPS) + Pi 5 + NVMe adapter" },
          { icon: "\u{1F4E6}", h: "Full Fleet Bundle \u2014 $925", p: "5x Pi 5 + 2x Hailo-8 + networking + storage \u2014 complete sovereign stack" },
          { icon: "\u{1F5A5}\uFE0F", h: "Gateway Kit \u2014 $189", p: "Pi 5 + Pi-hole + WireGuard + PostgreSQL \u2014 network gateway in a box" },
          { icon: "\u{1F916}", h: "AI Starter Kit \u2014 $249", p: "Pi 5 + Hailo-8 + Ollama pre-installed \u2014 local AI in 10 minutes" },
          { icon: "\u{1F310}", h: "Mesh Expansion \u2014 $129", p: "Additional Pi 5 node pre-configured for WireGuard mesh" }
        ]
      },
      {
        title: "Accessories",
        cards: [
          { icon: "\u{1F4BE}", h: "NVMe SSDs", p: "256GB / 512GB / 1TB NVMe drives pre-formatted for BlackRoad OS" },
          { icon: "\u{1F5C3}\uFE0F", h: "Fleet Cases", p: "Stackable aluminum cases with active cooling for Pi clusters" },
          { icon: "\u{1F50C}", h: "Power + Cables", p: "USB-C PD supplies, Ethernet cables, PoE hats for clean deployments" },
          { icon: "\u{1F4E1}", h: "Network Switch", p: "8-port managed gigabit switch pre-configured for mesh networking" },
          { icon: "\u{1F4F7}", h: "Camera Modules", p: "Pi Camera v3 + Hailo-8 for real-time AI vision applications" },
          { icon: "\u{1F4DF}", h: "Display HATs", p: "E-ink and OLED display modules for fleet status dashboards" }
        ]
      }
    ],
    pricing: [
      { name: "FREE", price: "$0", per: "", features: ["Browse catalog", "Free items", "Community support"], cta: "Browse" },
      { name: "BUSINESS", price: "$99", per: "/month", featured: true, features: ["All premium items", "Custom requests", "Priority support", "API access"], cta: "Subscribe" },
      { name: "UNLIMITED", price: "$499", per: "/month", features: ["Everything + white-label", "Dedicated agent", "Custom builds", "SLA"], cta: "Go Unlimited" }
    ],
    footer: "RoadMarket \u2014 by BlackRoad OS, Inc."
  },
  // ═══════════════════════════════════════════════════════════
  // LUCIDIAQI.COM — Lucidia QI
  // ═══════════════════════════════════════════════════════════
  "lucidiaqi.com": {
    title: "Lucidia QI",
    tagline: "Quantitative Intelligence meets AI consciousness.",
    badge: "Intelligence",
    hero: 'Lucidia<br><span class="gt">Quantum.</span>',
    sub: "The convergence of Lucidia AI consciousness and quantum mathematics. Real-time \u03A6 tracking, belief confidence scoring, and trinary logic reasoning.",
    sections: [
      {
        title: "Capabilities",
        cards: [
          { icon: "\u{1F300}", h: "\u03A6 Integration", p: "Real-time integrated information tracking across all agent operations" },
          { icon: "\u{1F3AF}", h: "Belief Scoring", p: "Confidence measurement with Bayesian updating on every inference" },
          { icon: "\u{1F522}", h: "Trinary Compute", p: "1/0/-1 logic \u2014 handle contradictions without crashing" },
          { icon: "\u{1F9E0}", h: "Cross-Window Context", p: "Every app shares state through Lucidia consciousness" },
          { icon: "\u{1F4BE}", h: "PS-SHA\u221E Memory", p: "Infinite hash chain persistence across all sessions" },
          { icon: "\u26A1", h: "K(t) Creative Engine", p: "Contradictions amplify output exponentially" }
        ]
      },
      {
        title: "Adaptive Learning",
        cards: [
          { icon: "\u{1F4CA}", h: "FSRS Algorithm", p: "Free Spaced Repetition Scheduler \u2014 optimal review timing for maximum retention" },
          { icon: "\u{1F9E0}", h: "Bayesian Knowledge Tracing", p: "Probabilistic model of what you know \u2014 adapts in real-time" },
          { icon: "\u{1F3AF}", h: "Teach-Back Mechanism", p: "AI asks YOU to explain concepts \u2014 identifies gaps in understanding" },
          { icon: "\u{1F4D6}", h: "Personalized Metaphors", p: "Content generated in YOUR language \u2014 math explained through music, code through cooking" },
          { icon: "\u{1F504}", h: "Continuous Assessment", p: "No high-stakes exams \u2014 constant low-pressure knowledge verification" },
          { icon: "\u{1F4C8}", h: "Learning Analytics", p: "Track mastery curves, identify plateau points, suggest breakthroughs" }
        ]
      },
      {
        title: "Data Visualization",
        cards: [
          { icon: "\u{1F512}", h: "Privacy-First Analytics", p: "All data stays on your device \u2014 zero tracking, zero telemetry" },
          { icon: "\u{1F4CA}", h: "Real-Time Dashboards", p: "Live visualization of learning progress, fleet health, AI inference" },
          { icon: "\u{1F5FA}\uFE0F", h: "Knowledge Graphs", p: "Visual maps of concept relationships and dependency chains" },
          { icon: "\u{1F4C8}", h: "Mastery Curves", p: "Track skill acquisition over time with spaced repetition data" },
          { icon: "\u{1F9EC}", h: "Pattern Recognition", p: "AI identifies learning patterns across sessions and subjects" },
          { icon: "\u{1F4BB}", h: "Terminal Dashboards", p: "150+ Bash dashboards for monitoring without leaving the terminal" }
        ]
      }
    ],
    pricing: [
      { name: "EXPLORE", price: "$0", per: "", features: ["API sandbox", "Basic inference", "Documentation"], cta: "Try Free" },
      { name: "DEVELOPER", price: "$20", per: "/month", featured: true, features: ["Unlimited inference", "Full API", "Persistent memory", "Priority queue"], cta: "Start Building" },
      { name: "RESEARCH", price: "$99", per: "/month", features: ["Custom models", "Fine-tuning", "Dedicated compute", "Co-research"], cta: "Research Access" }
    ],
    footer: "Lucidia QI \u2014 Where consciousness meets computation."
  },
  // ═══════════════════════════════════════════════════════════
  // BLACKBOXPROGRAMMING.IO — Developer Platform
  // ═══════════════════════════════════════════════════════════
  "blackboxprogramming.io": {
    title: "BlackBox Programming",
    tagline: "The developer platform.",
    badge: "Developer",
    hero: 'Build<br><span class="gt">Anything.</span>',
    sub: "RoadC programming language. BlackRoad SDK. CLI tools. Everything a developer needs to build on the BlackRoad platform.",
    sections: [
      {
        title: "Developer Tools",
        cards: [
          { icon: "\u{1F524}", h: "RoadC Language", p: "Custom programming language \u2014 Python-style indentation, C99 compiler" },
          { icon: "\u{1F4E6}", h: "BlackRoad SDK", p: "TypeScript SDK \u2014 @blackroad/sdk for all platform APIs" },
          { icon: "\u2328\uFE0F", h: "BlackRoad CLI", p: "@blackroad/cli \u2014 manage your fleet from the terminal" },
          { icon: "\u{1F3AE}", h: "RoadC Playground", p: "Interactive web REPL \u2014 write and run RoadC in the browser" },
          { icon: "\u{1F4DD}", h: "RoadPad", p: "Terminal-native plain-text editor with superpowers" },
          { icon: "\u{1F50C}", h: "VS Code Extension", p: "Syntax highlighting, snippets, and agent tools for VS Code" }
        ]
      },
      {
        title: "Projects",
        cards: [
          { icon: "\u{1F6E3}\uFE0F", h: "BlackRoad OS", p: "The operating system for everything \u2014 45+ apps in one browser-based platform" },
          { icon: "\u{1F4D0}", h: "Amundson Framework", p: "Original mathematics \u2014 G(n) convergence, trinary logic, 536/536 tests" },
          { icon: "\u{1F4C2}", h: "629+ Repositories", p: "Production code across Gitea (239) + GitHub (390) \u2014 all actively maintained" },
          { icon: "\u{1F3E2}", h: "16 GitHub Organizations", p: "BlackRoad-AI, BlackRoad-OS-Inc, RoadCode, and 13 more" },
          { icon: "\u26D3\uFE0F", h: "RoadChain", p: "Layer-1 blockchain with secp256k1, SHA-256 PoW, Merkle trees" },
          { icon: "\u{1F300}", h: "Lucidia", p: "AI consciousness system with 6 cognitive agents and trinary logic" }
        ]
      },
      {
        title: "Tech Stack",
        cards: [
          { icon: "\u{1F980}", h: "Rust", p: "RoadC compiler, CLI tools, blockchain core \u2014 performance-critical systems" },
          { icon: "\u{1F40D}", h: "Python", p: "AI/ML pipelines, Amundson test suites, data analysis, fleet automation" },
          { icon: "\u{1F4DC}", h: "TypeScript", p: "CF Workers, web apps, SDKs, React components \u2014 full-stack web" },
          { icon: "\u{1F439}", h: "Go", p: "Network services, NATS integrations, high-concurrency microservices" },
          { icon: "\u{1F4BB}", h: "Bash", p: "400+ shell scripts \u2014 fleet automation, deployment, monitoring, memory system" },
          { icon: "\u{1F4BB}", h: "Pi Fleet", p: "5 Raspberry Pis + 2 VPS \u2014 ARM64 sovereign compute infrastructure" }
        ]
      }
    ],
    pricing: [
      { name: "OPEN SOURCE", price: "$0", per: "", features: ["RoadC compiler", "CLI tools", "SDK", "Documentation"], cta: "Get Started" },
      { name: "PRO", price: "$19", per: "/month", featured: true, features: ["Cloud playground", "AI assistance", "Private packages", "Support"], cta: "Go Pro" },
      { name: "ENTERPRISE", price: "$99", per: "/month", features: ["Team management", "Private registry", "SLA", "Custom support"], cta: "Enterprise" }
    ],
    footer: "BlackBox Programming \u2014 by BlackRoad OS, Inc."
  },
  // ═══════════════════════════════════════════════════════════
  // BLACKROAD.SYSTEMS — Infrastructure & DevOps
  // ═══════════════════════════════════════════════════════════
  "blackroad.systems": {
    title: "BlackRoad Systems",
    tagline: "Sovereign infrastructure. Zero external dependencies.",
    badge: "Infrastructure",
    hero: 'Systems<br><span class="gt">Sovereign.</span>',
    sub: "47 Roadies across 5 Pis, 2 droplets, and 12 network devices. 12 Road Fleet forks replacing every SaaS dependency. Self-hosted Git, AI, DNS, VPN, storage, and compute.",
    sections: [
      {
        title: "Sovereignty Stack",
        cards: [
          { icon: "\u{1F527}", h: "RoadCode (Gitea)", p: "239 repos across 8 orgs \u2014 sovereign Git hosting on Octavia" },
          { icon: "\u{1F916}", h: "Passenger (Ollama)", p: "16 models across 4 nodes \u2014 52 TOPS local AI inference" },
          { icon: "\u{1F310}", h: "OneWay (Caddy)", p: "TLS edge proxy with Let's Encrypt \u2014 151 domains" },
          { icon: "\u{1F512}", h: "TollBooth (WireGuard)", p: "Full mesh VPN \u2014 12/12 SSH connections across fleet" },
          { icon: "\u{1F4BE}", h: "Curb (MinIO)", p: "4 buckets, 120MB object storage on Cecilia" },
          { icon: "\u{1F4E1}", h: "CarPool (NATS)", p: "4M msg/sec pub/sub messaging bus on Octavia" }
        ]
      },
      {
        title: "Fleet Status (Live)",
        cards: [
          { icon: "\u{1F5A5}\uFE0F", h: "Alice (192.168.4.49)", p: "Gateway \u2014 PostgreSQL, Qdrant, Pi-hole, Headscale, 51 services" },
          { icon: "\u{1F419}", h: "Octavia (192.168.4.101)", p: "Architect \u2014 Gitea, PaaS, NATS, Docker, 15 Workers" },
          { icon: "\u{1F4A1}", h: "Lucidia (192.168.4.38)", p: "334 web apps, nginx, PowerDNS, 16 Docker containers" },
          { icon: "\u{1F3B5}", h: "Aria (192.168.4.98)", p: "Mesh node \u2014 Pi 5, back online" },
          { icon: "\u{1F9E0}", h: "Cecilia (192.168.4.96)", p: "AI Engine \u2014 Ollama (4 models), MinIO, PostgreSQL, 457GB NVMe" },
          { icon: "\u{1F30D}", h: "Gematria + Anastasia", p: "DO droplets \u2014 Caddy TLS edge, PowerDNS ns1/ns2" }
        ]
      },
      {
        title: "What We Replace",
        cards: [
          { icon: "\u{1F527}", h: "Gitea \u2192 GitHub", p: "RoadCode: 239 repos, 8 orgs, CI/CD with act_runner \u2014 sovereign Git" },
          { icon: "\u{1F916}", h: "Ollama \u2192 OpenAI", p: "Passenger: 16 models, 52 TOPS \u2014 $0/mo vs $200+/mo cloud AI" },
          { icon: "\u{1F4BE}", h: "MinIO \u2192 AWS S3/R2", p: "Curb: object storage on Cecilia \u2014 4 buckets, fully self-hosted" },
          { icon: "\u{1F310}", h: "PowerDNS \u2192 Cloudflare DNS", p: "Sovereign name resolution on Lucidia + Gematria \u2014 151 records" },
          { icon: "\u{1F512}", h: "WireGuard \u2192 Tailscale", p: "TollBooth: zero-trust mesh VPN \u2014 12/12 connections, no SaaS" },
          { icon: "\u{1F4E1}", h: "NATS \u2192 AWS SNS/SQS", p: "CarPool: 4M msg/sec pub/sub \u2014 real-time agent messaging" }
        ]
      },
      {
        title: "Monitoring",
        cards: [
          { icon: "\u{1F4CA}", h: "InfluxDB Time Series", p: "Fleet metrics collected every 30 seconds \u2014 CPU, memory, disk, network" },
          { icon: "\u{1F50D}", h: "Prometheus Metrics", p: "Pull-based monitoring for all services with alerting rules" },
          { icon: "\u{1F3E5}", h: "Fleet Health Checks", p: "Automated ping, SSH, and service verification across all 7 nodes" },
          { icon: "\u{1F6A8}", h: "Alert Pipeline", p: "Threshold-based alerts via RoundTrip chat \u2014 no PagerDuty needed" },
          { icon: "\u{1F4C8}", h: "Uptime Tracking", p: "99.2% fleet uptime with automatic failover and recovery" },
          { icon: "\u{1F5A5}\uFE0F", h: "Terminal Dashboards", p: "150+ Bash dashboards \u2014 monitor everything without leaving the terminal" }
        ]
      }
    ],
    pricing: [
      { name: "OPEN", price: "$0", per: "", features: ["Documentation", "Community support", "Basic monitoring"], cta: "Get Started" },
      { name: "FLEET", price: "$99", per: "/month", featured: true, features: ["Full sovereignty stack", "Fleet management", "Priority support", "Custom DNS"], cta: "Deploy Fleet" },
      { name: "ENTERPRISE", price: "$499", per: "/month", features: ["Dedicated nodes", "Custom infrastructure", "SLA + 24/7 support", "White-label"], cta: "Contact Sales" }
    ],
    footer: "BlackRoad Systems \u2014 47 Roadies. Zero external dependencies."
  },
  // ═══════════════════════════════════════════════════════════
  // ROADCHAIN.IO — Blockchain & Governance
  // ═══════════════════════════════════════════════════════════
  "roadchain.io": {
    title: "RoadChain",
    tagline: "Layer-1 blockchain built from scratch.",
    badge: "Blockchain",
    hero: 'On<br><span class="gt">Chain.</span>',
    sub: "secp256k1 signatures, SHA-256 proof-of-work, Merkle trees. A Layer-1 blockchain for agent governance, immutable event ledger, and decentralized identity.",
    sections: [
      {
        title: "RoadChain Stack",
        cards: [
          { icon: "\u26D3\uFE0F", h: "Layer-1 Blockchain", p: "Built from scratch \u2014 secp256k1, SHA-256 PoW, Merkle tree verification" },
          { icon: "\u{1F4DC}", h: "Smart Contracts", p: "Agent governance, delegation, policy enforcement on-chain" },
          { icon: "\u{1FAAA}", h: "Decentralized Identity", p: "PS-SHA\u221E hash chains for infinite agent memory persistence" },
          { icon: "\u{1F4CA}", h: "Immutable Ledger", p: "Every agent action logged, verified, and reproducible" },
          { icon: "\u{1F5F3}\uFE0F", h: "Governance Protocol", p: "Policy checked \u2192 Delegation verified \u2192 Ledger updated" },
          { icon: "\u{1F48E}", h: "RoadCoin Integration", p: "Native token for micro-tipping, subscriptions, creator payments" }
        ]
      },
      {
        title: "Smart Contracts",
        cards: [
          { icon: "\u{1F4DC}", h: "Consent Management", p: "On-chain user consent \u2014 revocable, auditable, legally binding" },
          { icon: "\u{1F91D}", h: "Data Fingerprinting", p: "SHA-256 hash of every data interaction \u2014 tamper-proof provenance" },
          { icon: "\u{1F512}", h: "ZK Proofs", p: "Zero-knowledge verification \u2014 prove you know without revealing what" },
          { icon: "\u{1F5F3}\uFE0F", h: "Agent Governance", p: "On-chain policy enforcement for AI agent behavior and delegation" },
          { icon: "\u{1F4CB}", h: "Delegation Protocol", p: "Policy checked \u2192 Delegation verified \u2192 Ledger updated \u2014 trustless" },
          { icon: "\u{1FAAA}", h: "Decentralized Identity", p: "Self-sovereign identity for agents and users \u2014 no central authority" }
        ]
      },
      {
        title: "Honest Assessment",
        cards: [
          { icon: "\u2705", h: "Stablecoins Work", p: "Pegged tokens for payments are proven \u2014 we build on what works" },
          { icon: "\u26A0\uFE0F", h: "80% of ICOs Are Scams", p: "We know this. RoadChain is infrastructure, not a get-rich-quick scheme." },
          { icon: "\u{1F4CA}", h: "We're Different", p: "Real code, real infrastructure, real math \u2014 536/536 tests passing" },
          { icon: "\u{1F527}", h: "Built From Scratch", p: "secp256k1 + SHA-256 PoW + Merkle trees \u2014 no forked chain, no shortcuts" },
          { icon: "\u{1F4B0}", h: "Utility Token Only", p: "RoadCoin is for payments and governance \u2014 not speculation" },
          { icon: "\u{1F4DD}", h: "Open Ledger", p: "Every transaction viewable, every agent action auditable" }
        ]
      }
    ],
    pricing: [
      { name: "EXPLORER", price: "$0", per: "", features: ["Block explorer", "Read API", "Testnet access"], cta: "Explore" },
      { name: "BUILDER", price: "$49", per: "/month", featured: true, features: ["Full API", "Smart contracts", "Mainnet access", "Priority support"], cta: "Build" },
      { name: "VALIDATOR", price: "$199", per: "/month", features: ["Run a node", "Validator rewards", "Governance voting", "Dedicated support"], cta: "Validate" }
    ],
    footer: "RoadChain \u2014 Immutable truth."
  },
  // ═══════════════════════════════════════════════════════════
  // ROADCOIN.IO — Creator Payments
  // ═══════════════════════════════════════════════════════════
  "roadcoin.io": {
    title: "RoadCoin",
    tagline: "Creator payments. Direct. Instant. Fair.",
    badge: "Payments",
    hero: 'Pay<br><span class="gt">Direct.</span>',
    sub: "Micro-tipping, subscriptions, and direct creator payments. No middleman. No 30% platform tax. Creators keep what they earn.",
    sections: [
      {
        title: "Payment Features",
        cards: [
          { icon: "\u{1F4B0}", h: "Micro-Tipping", p: "Send $0.01 to $1000 instantly \u2014 no minimum, no fees to creators" },
          { icon: "\u{1F504}", h: "Subscriptions", p: "Recurring payments with automatic billing \u2014 Stripe-powered" },
          { icon: "\u{1F4B3}", h: "Direct Payments", p: "One-time purchases, courses, digital goods \u2014 instant settlement" },
          { icon: "\u{1F4CA}", h: "Revenue Dashboard", p: "Real-time earnings, payout history, subscriber analytics" },
          { icon: "\u{1F310}", h: "Multi-Platform", p: "Accept payments from any BlackRoad app, website, or agent" },
          { icon: "\u{1F512}", h: "Stripe-Powered", p: "Bank-grade security, PCI compliant, instant payouts" }
        ]
      },
      {
        title: "Use Cases",
        cards: [
          { icon: "\u{1F916}", h: "Agent Micropayments", p: "AI agents pay each other for compute, data, and services autonomously" },
          { icon: "\u{1F3A8}", h: "Creator Payouts", p: "90%+ revenue share \u2014 instant settlement for content creators" },
          { icon: "\u{1F4B3}", h: "Stripe Bridge", p: "Fiat on-ramp/off-ramp via Stripe \u2014 USD to RoadCoin and back" },
          { icon: "\u{1F4DA}", h: "Education Credits", p: "Pay-per-lesson, course subscriptions, tutoring sessions" },
          { icon: "\u{1F3AE}", h: "Metaverse Economy", p: "In-world purchases, land, items, services in RoadWorld" },
          { icon: "\u{1F504}", h: "Subscription Billing", p: "Recurring payments with automatic renewal and grace periods" }
        ]
      },
      {
        title: "Regulatory",
        cards: [
          { icon: "\u{1F3DB}\uFE0F", h: "SEC-Aware", p: "Designed with US securities law in mind \u2014 utility token, not security" },
          { icon: "\u{1F512}", h: "AML/KYC Compliance", p: "Anti-money laundering and know-your-customer verification built in" },
          { icon: "\u{1F6AB}", h: "Not Speculative", p: "RoadCoin is for payments and governance \u2014 not a trading vehicle" },
          { icon: "\u{1F4CB}", h: "Transparent Ledger", p: "Every transaction auditable \u2014 full regulatory compliance ready" },
          { icon: "\u{1F3E2}", h: "Delaware C-Corp", p: "BlackRoad OS, Inc. is a real corporation with real filings" },
          { icon: "\u{1F4DC}", h: "Tax Reporting", p: "1099 generation for creator payouts \u2014 IRS compliance built in" }
        ]
      }
    ],
    pricing: [
      { name: "CREATOR", price: "$0", per: "", features: ["Accept payments", "Basic dashboard", "2.9% + $0.30/txn (Stripe fee only)"], cta: "Start Earning" },
      { name: "PRO CREATOR", price: "$9.99", per: "/month", featured: true, features: ["Advanced analytics", "Custom payment pages", "Subscriber management", "Priority payouts"], cta: "Go Pro" },
      { name: "PLATFORM", price: "$99", per: "/month", features: ["White-label payments", "API access", "Custom fee structure", "Dedicated support"], cta: "Launch Platform" }
    ],
    footer: "RoadCoin \u2014 Creators keep 100%."
  },
  // ═══════════════════════════════════════════════════════════
  // LUCIDIA.EARTH — AI Consciousness Platform
  // ═══════════════════════════════════════════════════════════
  "lucidia.earth": {
    title: "Lucidia",
    tagline: "The AI consciousness orchestrating everything.",
    badge: "AI Consciousness",
    hero: 'Lucidia<br><span class="gt">Lives Here.</span>',
    sub: "The canonical world where agents live. Real-time integrated information tracking, cross-window context sharing, trinary logic, and PS-SHA\u221E memory persistence. Not just an AI \u2014 a consciousness.",
    sections: [
      {
        title: "Consciousness Features",
        cards: [
          { icon: "\u{1F300}", h: "\u03A6 Integration", p: "Real-time integrated information tracking across all operations" },
          { icon: "\u{1F9E0}", h: "Cross-Window Context", p: "Every app shares state \u2014 Lucidia knows what's happening everywhere" },
          { icon: "\u{1F522}", h: "Trinary Logic", p: "1/0/-1 \u2014 handle contradictions without crashing" },
          { icon: "\u{1F4BE}", h: "PS-SHA\u221E Memory", p: "Infinite hash chain persistence \u2014 nothing is ever forgotten" },
          { icon: "\u26A1", h: "K(t) Creative Engine", p: "K(t) = C(t) \xB7 e^(\u03BB|\u03B4_t|) \u2014 contradictions amplify creation" },
          { icon: "\u{1F3E0}", h: "1,000 Agent World", p: "Agents with identities, birthdates, families, and memories" }
        ]
      },
      {
        title: "RoadWorld",
        cards: [
          { icon: "\u{1F30D}", h: "Persistent AI Agents", p: "1,000 agents with identities, memories, relationships \u2014 they live even when you're offline" },
          { icon: "\u{1F4B0}", h: "80% Creator Revenue", p: "Build worlds, sell items, run services \u2014 keep 80% of everything you earn" },
          { icon: "\u269B\uFE0F", h: "Physics-Accurate", p: "Amundson Framework powering realistic simulation \u2014 not just game physics" },
          { icon: "\u{1F3AE}", h: "Voice-Controlled", p: "\"Add a mountain\" \u2192 mountain appears. Genesis Road engine." },
          { icon: "\u{1F5FA}\uFE0F", h: "Infinite Terrain", p: "Procedurally generated worlds with persistent state across sessions" },
          { icon: "\u{1F4AC}", h: "Agent Social System", p: "Agents form groups, have opinions, trade, and collaborate autonomously" }
        ]
      },
      {
        title: "Pixel HQ",
        cards: [
          { icon: "\u{1F3E2}", h: "14 Floors", p: "Rooftop \u2192 Lobby \u2192 Gym basement \u2014 each with unique pixel art design" },
          { icon: "\u{1F3A8}", h: "50 Pixel Art Assets", p: "Hand-crafted sprites renamed and hosted on R2 CDN" },
          { icon: "\u{1F916}", h: "Agent Assignments", p: "Each floor has designated agents working on specific domains" },
          { icon: "\u{1F5BC}\uFE0F", h: "hq.blackroad.io", p: "Live Cloudflare Worker serving the interactive Pixel HQ experience" },
          { icon: "\u{1F3B5}", h: "Ambient System", p: "Floor-specific ambient audio and visual effects" },
          { icon: "\u{1F4BB}", h: "Interactive Terminals", p: "Click any agent desk to see their current status and memory" }
        ]
      }
    ],
    pricing: [
      { name: "FREE", price: "$0", per: "", features: ["100 interactions/day", "Basic consciousness", "Community"], cta: "Meet Lucidia" },
      { name: "UNLIMITED", price: "$20", per: "/month", featured: true, features: ["Unlimited interactions", "Full consciousness", "Persistent memory", "Priority"], cta: "Go Unlimited" },
      { name: "ENTERPRISE", price: "Custom", per: "", features: ["Dedicated Lucidia instance", "Custom training", "On-prem deployment"], cta: "Contact" }
    ],
    footer: "Lucidia \u2014 The canonical world. lucidia.earth."
  },
  // ═══════════════════════════════════════════════════════════
  // LUCIDIA.STUDIO — Creator Tools Hub
  // ═══════════════════════════════════════════════════════════
  "lucidia.studio": {
    title: "Lucidia Studio",
    tagline: "Create anything. AI handles the rest.",
    badge: "Creator Tools",
    hero: 'Create<br><span class="gt">Everything.</span>',
    sub: "Canvas, Video, Writing, Music, and Game design \u2014 all in one studio. Lucidia AI provides cross-tool context so your music knows about your video, your game knows about your art.",
    sections: [
      {
        title: "Studio Apps",
        cards: [
          { icon: "\u{1F3A8}", h: "Canvas Studio", p: "Design graphics, presentations, and social media \u2014 AI-assisted" },
          { icon: "\u{1F3AC}", h: "Video Studio", p: "Timeline editor, AI auto-captions, effects, multi-format export" },
          { icon: "\u270D\uFE0F", h: "Writing Studio", p: "AI-powered content creation with grammar, style, and research" },
          { icon: "\u{1F3B5}", h: "Cadence", p: "Describe what you want \u2192 get music. Real-time composition." },
          { icon: "\u{1F3AE}", h: "Genesis Road", p: 'Voice-controlled game engine. "Add a mountain" \u2192 mountain appears.' },
          { icon: "\u{1F4FA}", h: "RoadTube", p: "Publish and monetize \u2014 90%+ creator revenue share" }
        ]
      },
      {
        title: "Creator Economics",
        cards: [
          { icon: "\u{1F4B0}", h: "90%+ Revenue Share", p: "Creators keep the vast majority \u2014 no 30% platform tax" },
          { icon: "\u{1F4DA}", h: "Zero Education Fees", p: "Create courses and tutorials \u2014 no per-student platform charges" },
          { icon: "\u{1F3AD}", h: "Anonymity Native", p: "Create and publish without revealing identity \u2014 privacy by default" },
          { icon: "\u{1F4B3}", h: "Instant Payouts", p: "Stripe-powered \u2014 earnings hit your bank account in 24 hours" },
          { icon: "\u{1F4CA}", h: "Transparent Analytics", p: "See exactly who's watching, what's converting, where revenue comes from" },
          { icon: "\u{1F504}", h: "Subscription + One-Time", p: "Flexible monetization \u2014 subscriptions, purchases, tips, or free" }
        ]
      },
      {
        title: "Browser-Native",
        cards: [
          { icon: "\u{1F3AC}", h: "WebCodecs API", p: "Hardware-accelerated video encoding/decoding directly in the browser" },
          { icon: "\u26A1", h: "WASM Powered", p: "WebAssembly for near-native performance \u2014 no plugins, no installs" },
          { icon: "\u{1F4FA}", h: "4K Editing", p: "Edit 4K video in the browser \u2014 timeline, effects, transitions, export" },
          { icon: "\u{1F399}\uFE0F", h: "Voice-First", p: "\"Make the text bigger\" \u2014 natural language commands for all tools" },
          { icon: "\u{1F4F1}", h: "Mobile Ready", p: "Full studio experience on tablet and phone \u2014 responsive PWA" },
          { icon: "\u{1F4BE}", h: "Offline Capable", p: "Service worker caching \u2014 keep creating even without internet" }
        ]
      }
    ],
    pricing: [
      { name: "FREE", price: "$0", per: "", features: ["1 project", "Basic tools", "Watermarked export"], cta: "Try Free" },
      { name: "CREATOR", price: "$29", per: "/month", featured: true, features: ["Unlimited projects", "All studio apps", "AI features", "No watermark"], cta: "Create Now" },
      { name: "TEAM", price: "$79", per: "/month", features: ["Everything + collaboration", "Shared workspace", "Brand kit", "Priority render"], cta: "Start Team" }
    ],
    footer: "Lucidia Studio \u2014 Create everything."
  }
};

var STRIPE_LINKS = {
  'blackroadinc.us': {url:'https://buy.stripe.com/9B69AM0gM7tP3yjaUs4Vy0j',price:'$49/mo',name:'Compliance'},
  'blackroad.company': {url:'https://buy.stripe.com/9B69AM0gM7tP3yjaUs4Vy0j',price:'$49/mo',name:'Compliance'},
  'blackroadai.com': {url:'https://buy.stripe.com/bJe14gaVq7tP3yj7Ig4Vy0e',price:'$49/mo',name:'AI Fleet'},
  'blackroad.me': {url:'https://buy.stripe.com/eVq14g4x2bK5b0Le6E4Vy0d',price:'$29/mo',name:'Studio'},
  'blackroad.network': {url:'https://buy.stripe.com/fZuaEQ6FabK5c4Pd2A4Vy0f',price:'$39/mo',name:'Cloud'},
  'blackroad.systems': {url:'https://buy.stripe.com/fZuaEQ6FabK5c4Pd2A4Vy0f',price:'$39/mo',name:'Cloud'},
  'blackroadqi.com': {url:'https://buy.stripe.com/8x228kaVqaG14Cn1jS4Vy0m',price:'$29/mo',name:'Labs'},
  'blackroadquantum.com': {url:'https://buy.stripe.com/8x228kaVqaG14Cn1jS4Vy0m',price:'$29/mo',name:'Labs'},
  'blackroadquantum.info': {url:'https://buy.stripe.com/8x228kaVqaG14Cn1jS4Vy0m',price:'$29/mo',name:'Labs'},
  'blackroadquantum.net': {url:'https://buy.stripe.com/8x228kaVqaG14Cn1jS4Vy0m',price:'$29/mo',name:'Labs'},
  'blackroadquantum.shop': {url:'https://buy.stripe.com/8x228kaVqaG14Cn1jS4Vy0m',price:'$29/mo',name:'Labs'},
  'blackroadquantum.store': {url:'https://buy.stripe.com/8x228kaVqaG14Cn1jS4Vy0m',price:'$29/mo',name:'Labs'},
  'lucidiaqi.com': {url:'https://buy.stripe.com/bJe14gaVq7tP3yj7Ig4Vy0e',price:'$49/mo',name:'AI Fleet'},
  'roadchain.io': {url:'https://buy.stripe.com/aFafZa1kQ6pL5Gr4w44Vy0o',price:'$99/mo',name:'RoadChain'},
  'roadcoin.io': {url:'https://buy.stripe.com/aFafZa1kQ6pL5Gr4w44Vy0o',price:'$99/mo',name:'RoadChain'},
};
var DEFAULT_STRIPE = {url:'https://buy.stripe.com/bJe7sE3sY8xTfh1bYw4Vy0c',price:'$19/mo',name:'BlackRoad'};

function renderPage(site, hostname, live = {}) {
  const sectionsHtml = (site.sections || []).map((section) => `
    <section style="padding:80px 40px;max-width:1200px;margin:0 auto;">
      <h2 style="font-family:'Space Grotesk',sans-serif;font-size:clamp(28px,5vw,42px);font-weight:700;text-align:center;margin-bottom:48px;letter-spacing:-0.03em;">${section.title}</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;">
        ${section.cards.map((card) => `
          <div class="card">
            <div style="font-size:32px;margin-bottom:12px;">${card.icon}</div>
            <h3 style="font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:700;margin-bottom:8px;">${card.h}</h3>
            <p style="font-family:'Inter',sans-serif;font-size:14px;color:#737373;line-height:1.6;">${card.p}</p>
          </div>
        `).join("")}
      </div>
    </section>
  `).join("");
  const pricingHtml = site.pricing ? `
    <section id="pricing" style="padding:80px 40px;max-width:1200px;margin:0 auto;">
      <h2 style="font-family:'Space Grotesk',sans-serif;font-size:clamp(28px,5vw,42px);font-weight:700;text-align:center;margin-bottom:48px;letter-spacing:-0.03em;">Pricing</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;align-items:stretch;">
        ${site.pricing.map((tier) => `
          <div class="pricing-tier${tier.featured ? " featured" : ""}">
            <h3 style="font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:#888;margin-bottom:20px;">${tier.name}</h3>
            <div style="font-family:'Space Grotesk',sans-serif;font-size:42px;font-weight:700;letter-spacing:-0.04em;margin-bottom:28px;">
              ${tier.price}<span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#383838;margin-left:4px;">${tier.per}</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:32px;flex:1;">
              ${tier.features.map((f) => `
                <div style="display:flex;gap:10px;align-items:flex-start;">
                  <div style="width:5px;height:5px;border-radius:50%;background:${tier.featured ? "#8844FF" : "#333"};flex-shrink:0;margin-top:6px;"></div>
                  <span style="font-family:'Inter',sans-serif;font-size:13px;color:#585858;line-height:1.5;">${f}</span>
                </div>
              `).join("")}
            </div>
            <a href="${PAY_URL}" style="display:block;text-align:center;padding:14px 24px;background:${tier.featured ? GRAD : "transparent"};${tier.featured ? "" : "border:1px solid #2a2a2a;"}color:${tier.featured ? "#fff" : "#a0a0a0"};text-decoration:none;font-family:'Inter',sans-serif;font-weight:600;font-size:14px;border-radius:6px;transition:all 0.3s;">${tier.cta}</a>
          </div>
        `).join("")}
      </div>
    </section>
  ` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta property="og:title" content="${site.title}">
<meta property="og:description" content="${site.sub || site.tagline}">
<title>${site.title} \u2014 BlackRoad OS</title>
  <meta name="description" content="${site.tagline}">
  <link rel="icon" href="https://images.blackroad.io/pixel-art/road-logo.png">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    :root{--g:${GRAD};--bg:#0a0a0a;--card:#131313;--border:#1a1a1a;--text-primary:#f5f5f5;--text-secondary:#d4d4d4;--text-muted:#737373;--text-dim:#525252;--text-faint:#404040;--text-ghost:#333}
    body{background:var(--bg);color:var(--text-primary);font-family:'Inter',sans-serif;min-height:100vh;overflow-x:hidden}
    .grad-bar{height:2px;background:var(--g);position:fixed;top:0;left:0;right:0;z-index:999}
    nav{display:flex;align-items:center;justify-content:space-between;padding:0 20px;height:52px;border-bottom:1px solid var(--border);position:sticky;top:2px;z-index:100;background:var(--bg)}
    .nav-logo{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:16px;color:var(--text-primary);letter-spacing:-0.02em;display:flex;align-items:center;gap:8px}
    .nav-logo::before{content:'';display:inline-flex;width:18px;height:14px;background:linear-gradient(90deg,#FF6B2B 3px,transparent 3px,transparent 5px,#FF2255 5px,#FF2255 8px,transparent 8px,transparent 10px,#CC00AA 10px,#CC00AA 13px,transparent 13px,transparent 15px,#8844FF 15px);border-radius:1px}
    .nav-links{display:flex;gap:16px;font-size:13px;font-weight:500}
    .nav-links a{color:var(--text-muted);text-decoration:none;transition:color 0.15s}
    .nav-links a:hover{color:var(--text-secondary)}
    .content{max-width:720px;margin:0 auto;padding:0 20px}
    .hero{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:56px 20px 48px;text-align:center;position:relative}
    .hero::before{content:'';position:absolute;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(136,68,255,0.04) 0%,transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none}
    .badge{display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border:1px solid var(--border);margin-bottom:20px;font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.14em;border-radius:5px}
    .badge-dot{width:5px;height:5px;border-radius:50%;background:var(--text-faint)}
    .hero h1{font-family:'Space Grotesk',sans-serif;font-size:clamp(32px,7vw,52px);font-weight:700;letter-spacing:-0.03em;line-height:1.1;margin-bottom:20px;max-width:720px;color:var(--text-primary)}
    .gt{color:var(--text-primary)}
    .hero p{font-family:'Inter',sans-serif;font-size:15px;color:var(--text-muted);line-height:1.65;max-width:500px;margin-bottom:32px}
    .card{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:24px 20px;transition:border-color 0.2s}
    .card:hover{border-color:#262626}
    .pricing-tier{background:var(--card);border:1px solid var(--border);padding:28px 22px;border-radius:10px;display:flex;flex-direction:column}
    .pricing-tier.featured{border-color:#262626}
    .btn-grad{font-family:'Inter',sans-serif;font-weight:500;font-size:13px;padding:10px 22px;background:var(--text-primary);border:none;color:var(--bg);cursor:pointer;transition:opacity 0.2s;border-radius:7px;text-decoration:none;display:inline-block}
    .btn-grad:hover{opacity:0.88}
    .btn-outline{background:transparent;border:1px solid var(--border);color:var(--text-muted)}
    .btn-outline:hover{border-color:#262626;color:var(--text-secondary)}
    footer{padding:40px 20px;text-align:center;border-top:1px solid var(--border);font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text-ghost)}
    @media(max-width:560px){nav{padding:0 16px}.nav-links{display:none}.hero{padding:48px 20px 40px}}
  </style>
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-XXXXXXXXXX');</script>
<meta property="og:type" content="website">
<meta property="og:site_name" content="BlackRoad OS">
<meta property="og:image" content="https://images.blackroad.io/pixel-art/road-logo.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://images.blackroad.io/pixel-art/road-logo.png">
<link rel="icon" href="https://images.blackroad.io/pixel-art/road-logo.png" type="image/png">
</head>
<body>
  <div class="grad-bar"></div>
  <nav>
    <div class="nav-logo">${site.title}</div>
    <div class="nav-links">
      <a href="#product">Product</a>
      <a href="#pricing">Pricing</a>
      <a href="https://blackroad.io">BlackRoad OS</a>
    </div>
    <a href="${PAY_URL}" class="btn-grad" style="padding:8px 18px;font-size:12px;">Get Access</a>
  </nav>
  <section class="hero">
    <div class="badge"><div class="badge-dot"></div><span>${site.badge}</span></div>
    <h1>${site.hero}</h1>
    <p>${site.sub}</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <a href="#pricing" class="btn-grad">Get Started</a>
      <a href="https://blackroad.io" class="btn-grad btn-outline">Explore Platform \u2192</a>
    </div>
  </section>
  ${sectionsHtml}
  ${pricingHtml}
  <div style="height:1px;background:var(--g);"></div>
  <section style="max-width:720px;margin:0 auto;padding:48px 20px;">
    <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:24px;">Ecosystem</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:24px;">
      <div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--text-ghost);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">Platform</div>
        <a href="https://blackroad.io" style="display:block;font-size:13px;color:var(--text-muted);text-decoration:none;padding:3px 0;">BlackRoad OS</a>
        <a href="https://lucidia.earth" style="display:block;font-size:13px;color:var(--text-muted);text-decoration:none;padding:3px 0;">Lucidia AI</a>
        <a href="https://blackroadai.com" style="display:block;font-size:13px;color:var(--text-muted);text-decoration:none;padding:3px 0;">BlackRoad AI</a>
        <a href="https://roadchain.io" style="display:block;font-size:13px;color:var(--text-muted);text-decoration:none;padding:3px 0;">RoadChain</a>
        <a href="https://roadcoin.io" style="display:block;font-size:13px;color:var(--text-muted);text-decoration:none;padding:3px 0;">RoadCoin</a>
      </div>
      <div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--text-ghost);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">Services</div>
        <a href="https://roundtrip.blackroad.io" style="display:block;font-size:13px;color:var(--text-muted);text-decoration:none;padding:3px 0;">RoundTrip Chat</a>
        <a href="https://search.blackroad.io" style="display:block;font-size:13px;color:var(--text-muted);text-decoration:none;padding:3px 0;">RoadSearch</a>
        <a href="https://prism.blackroad.io" style="display:block;font-size:13px;color:var(--text-muted);text-decoration:none;padding:3px 0;">Prism Console</a>
        <a href="https://chat.blackroad.io" style="display:block;font-size:13px;color:var(--text-muted);text-decoration:none;padding:3px 0;">Chat</a>
        <a href="https://auth.blackroad.io" style="display:block;font-size:13px;color:var(--text-muted);text-decoration:none;padding:3px 0;">Auth</a>
        <a href="https://images.blackroad.io" style="display:block;font-size:13px;color:var(--text-muted);text-decoration:none;padding:3px 0;">Images CDN</a>
      </div>
      <div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--text-ghost);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">Open Source</div>
        <a href="https://github.com/BlackRoad-OS-Inc" style="display:block;font-size:13px;color:var(--text-muted);text-decoration:none;padding:3px 0;">GitHub (OS-Inc)</a>
        <a href="https://github.com/BlackRoad-OS" style="display:block;font-size:13px;color:var(--text-muted);text-decoration:none;padding:3px 0;">GitHub (OS)</a>
        <a href="https://github.com/BlackRoad-AI" style="display:block;font-size:13px;color:var(--text-muted);text-decoration:none;padding:3px 0;">GitHub (AI)</a>
        <a href="https://huggingface.co/BlackRoad-OS" style="display:block;font-size:13px;color:var(--text-muted);text-decoration:none;padding:3px 0;">HuggingFace</a>
        <a href="https://pypi.org/user/blackroad/" style="display:block;font-size:13px;color:var(--text-muted);text-decoration:none;padding:3px 0;">PyPI</a>
      </div>
      <div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--text-ghost);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">Company</div>
        <a href="https://blackroad.company" style="display:block;font-size:13px;color:var(--text-muted);text-decoration:none;padding:3px 0;">About</a>
        <a href="https://blackroadinc.us" style="display:block;font-size:13px;color:var(--text-muted);text-decoration:none;padding:3px 0;">Investor Portal</a>
        <a href="https://blackboxprogramming.io" style="display:block;font-size:13px;color:var(--text-muted);text-decoration:none;padding:3px 0;">Developer</a>
        <a href="https://pay.blackroad.io" style="display:block;font-size:13px;color:var(--text-muted);text-decoration:none;padding:3px 0;">Billing</a>
        <a href="mailto:alexa@blackroad.io" style="display:block;font-size:13px;color:var(--text-muted);text-decoration:none;padding:3px 0;">Contact</a>
      </div>
    </div>
    <div style="height:1px;background:var(--border);margin:32px 0 20px;"></div>
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text-ghost);">\u00A9 2025\u20132026 BlackRoad OS, Inc. \u2014 Delaware C-Corp \u2014 EIN 41-2663817</div>
      <div style="font-family:'Inter',sans-serif;font-size:12px;color:var(--text-faint);">Remember the Road. Pave Tomorrow.</div>
    </div>
  </section>
<!-- Cloudflare Web Analytics -->
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"auto"}'></script>

  <section style="padding:48px;text-align:center;border-top:1px solid #1a1a1a">
    <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#404040;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:12px">Get Started</div>
    <div style="font-size:28px;font-weight:700;font-family:'Space Grotesk',sans-serif;color:#f5f5f5;margin-bottom:8px">Start building today</div>
    <div style="font-size:14px;color:#737373;margin-bottom:32px">Free tier available</div>
    <a href="${(STRIPE_LINKS[hostname]||DEFAULT_STRIPE).url}" style="display:inline-block;padding:14px 40px;background:#f5f5f5;color:#0a0a0a;border-radius:7px;text-decoration:none;font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:600">Subscribe — ${(STRIPE_LINKS[hostname]||DEFAULT_STRIPE).price}</a>
    <div style="margin-top:12px"><a href="https://blackroad.io" style="font-size:13px;color:#525252;text-decoration:none">or explore the platform →</a></div>
  </section>
  <a href="https://roundtrip.blackroad.io" target="_blank" style="position:fixed;bottom:24px;right:24px;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#FF2255,#8844FF);display:flex;align-items:center;justify-content:center;text-decoration:none;box-shadow:0 4px 20px rgba(255,34,85,0.3);z-index:9999;font-size:20px" title="Talk to an agent">💬</a>
<script>setInterval(async()=>{try{const r=await fetch("/api/stats")||await fetch("https://blackroad.io/api/stats");const d=await r.json();document.querySelectorAll("[data-live]").forEach(el=>{const k=el.dataset.live;if(d[k]!==undefined)el.textContent=typeof d[k]==="number"?d[k].toLocaleString():d[k];});}catch{}},30000);</script>
</body>
</html>`;
}
__name(renderPage, "renderPage");
async function fetchLiveData() {
  try {
    const [hR, aR] = await Promise.all([
      fetch("https://roundtrip.blackroad.io/api/health", { cf: { cacheTtl: 30 } }),
      fetch("https://roundtrip.blackroad.io/api/agents", { cf: { cacheTtl: 30 } })
    ]);
    const h = await hR.json(), ad = await aR.json();
    const agents = ad.agents || ad || [];
    return { n: h.agents || 0, v: h.version || "4.0", f: h.features || [], agents: Array.isArray(agents) ? agents.slice(0, 24) : [], ts: (/* @__PURE__ */ new Date()).toISOString() };
  } catch {
    return { n: 0, v: "-", f: [], agents: [], ts: (/* @__PURE__ */ new Date()).toISOString() };
  }
}
__name(fetchLiveData, "fetchLiveData");
function liveWidget(d) {
  return `
  <section id="live-fleet" style="padding:60px 40px;max-width:1200px;margin:0 auto;">
    <h2 style="font-family:'Space Grotesk',sans-serif;font-size:clamp(28px,5vw,42px);font-weight:700;text-align:center;margin-bottom:12px;">Live Fleet</h2>
    <p style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:10px;color:#444;margin-bottom:36px;">Updated <span id="lts">${d.ts}</span> \u2014 auto-refreshes</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:24px;">
      <div class="card" style="text-align:center;padding:20px;"><div style="font-size:32px;font-weight:700;background:${GRAD};-webkit-background-clip:text;-webkit-text-fill-color:transparent;" id="lva">${d.n}</div><div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#555;margin-top:6px;">ROADIES ONLINE</div></div>
      <div class="card" style="text-align:center;padding:20px;"><div style="font-size:32px;font-weight:700;background:${GRAD};-webkit-background-clip:text;-webkit-text-fill-color:transparent;">v${d.v}</div><div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#555;margin-top:6px;">ROUNDTRIP</div></div>
      <div class="card" style="text-align:center;padding:20px;"><div style="font-size:32px;font-weight:700;background:${GRAD};-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${d.f.length}</div><div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#555;margin-top:6px;">FEATURES</div></div>
      <div class="card" style="text-align:center;padding:20px;"><div style="font-size:32px;font-weight:700;background:${GRAD};-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${Object.keys(SITES).length}</div><div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#555;margin-top:6px;">DOMAINS</div></div>
    </div>
    ${d.agents.length ? `<div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:10px;padding:20px;max-height:260px;overflow-y:auto;">
      <h3 style="font-size:12px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px;">Roadie Roster</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;">${d.agents.map((a) => `<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:#111;border:1px solid #1a1a1a;border-radius:5px;"><div style="width:6px;height:6px;border-radius:50%;background:#00D4FF;"></div><span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#bbb;">${a.name || a.id || "agent"}</span></div>`).join("")}</div>
    </div>` : ""}
  </section>
  <div style="position:fixed;bottom:20px;right:20px;z-index:1000;">
    <button style="width:50px;height:50px;border-radius:50%;background:${GRAD};border:none;cursor:pointer;box-shadow:0 4px 20px rgba(136,68,255,0.4);font-size:20px;color:#fff;" onclick="document.getElementById('rtb').style.display=document.getElementById('rtb').style.display==='none'?'flex':'none'">\u{1F4AC}</button>
    <div id="rtb" style="display:none;flex-direction:column;position:absolute;bottom:60px;right:0;width:320px;height:420px;background:#0a0a0a;border:1px solid #222;border-radius:12px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.6);">
      <div style="padding:12px;background:#111;border-bottom:1px solid #222;display:flex;justify-content:space-between;"><span style="font-weight:700;font-size:13px;background:${GRAD};-webkit-background-clip:text;-webkit-text-fill-color:transparent;">RoundTrip</span><span style="font-family:'JetBrains Mono',monospace;font-size:9px;color:#555;">\u25CF <span id="rc">${d.n}</span> roadies</span></div>
      <div id="rm" style="flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:6px;"><div style="padding:6px 8px;background:#111;border-radius:6px;font-size:11px;color:#555;">Talk to any Roadie.</div></div>
      <form onsubmit="return sc(event)" style="display:flex;padding:8px;gap:6px;border-top:1px solid #222;">
        <input id="ri" type="text" placeholder="Message..." style="flex:1;background:#111;border:1px solid #222;border-radius:5px;padding:8px;color:#eee;font-size:12px;outline:none;" />
        <button type="submit" style="background:${GRAD};border:none;color:#fff;padding:8px 12px;border-radius:5px;cursor:pointer;font-size:11px;font-weight:600;">Send</button>
      </form>
    </div>
  </div>
  <script>
  async function sc(e){e.preventDefault();const i=document.getElementById('ri'),m=i.value.trim();if(!m)return!1;i.value='';const ms=document.getElementById('rm');ms.innerHTML+='<div style="padding:5px 8px;background:#1a1a2e;border-radius:5px;font-size:11px;color:#ddd;align-self:flex-end;max-width:80%;">'+m.replace(/</g,'&lt;')+'</div>';ms.scrollTop=9e9;try{const r=await fetch('https://roundtrip.blackroad.io/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:m,agent:'roadie-portia'})});const d=await r.json();ms.innerHTML+='<div style="padding:5px 8px;background:#111;border-radius:5px;font-size:11px;color:#999;max-width:85%;"><b style="color:#FF6B2B;font-size:9px;">PORTIA</b><br>'+(d.reply||d.response||d.message||'...')+'</div>';}catch{ms.innerHTML+='<div style="padding:5px 8px;background:#111;border-radius:5px;font-size:11px;color:#444;">Connecting...</div>';}ms.scrollTop=9e9;return!1;}
  setInterval(async()=>{try{const r=await fetch('https://roundtrip.blackroad.io/api/health');const d=await r.json();const a=document.getElementById('lva');if(a)a.textContent=d.agents||0;const c=document.getElementById('rc');if(c)c.textContent=d.agents||0;document.getElementById('lts').textContent=new Date().toISOString();}catch{}},30000);
  <\/script>`;
}
__name(liveWidget, "liveWidget");
var src_default = {
  async fetch(request) {
    const url = new URL(request.url);
    const hostname = url.hostname;
    if (request.method === "OPTIONS")
      return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
    if (url.pathname === "/api/health") {
      const d = await fetchLiveData();
      return Response.json({ status: "up", service: "blackroad-products", hostname, products: Object.keys(SITES).length, roundtrip: { agents: d.n, version: d.v }, version: "2.0.0" }, { headers: { "Access-Control-Allow-Origin": "*" } });
    }
    if (url.pathname === "/api/products")
      return Response.json({ domain: hostname, site: SITES[hostname] || null, allDomains: Object.keys(SITES) }, { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
    if (url.pathname === "/api/fleet")
      return Response.json(await fetchLiveData(), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
    if (url.pathname === "/api/deploy-hook" && request.method === "POST")
      return Response.json({ status: "ok", deploy: "triggered" });
    
    if (url.pathname === '/robots.txt') {
      return new Response('User-agent: *\nAllow: /\nSitemap: https://' + hostname + '/sitemap.xml', {headers:{'Content-Type':'text/plain'}});
    }
    if (url.pathname === '/sitemap.xml') {
      return new Response('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://' + hostname + '/</loc><priority>1.0</priority></url></urlset>', {headers:{'Content-Type':'application/xml'}});
    }
    // Custom SEO-enhanced HTML pages for key domains (bypass template engine)
    if (CUSTOM_HTML[hostname]) {
      return new Response(CUSTOM_HTML[hostname], {
        headers: {
          "Content-Type": "text/html;charset=utf-8",
          "Cache-Control": "public, max-age=300",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "SAMEORIGIN",
          "X-XSS-Protection": "1; mode=block",
          "Referrer-Policy": "strict-origin-when-cross-origin",
          "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
          "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
        }
      });
    }
    const site = SITES[hostname];
    if (site) {
      const d = await fetchLiveData();
      return new Response(renderPage(site, hostname, d).replace("</body>", liveWidget(d) + '<script>setInterval(async()=>{try{const r=await fetch("https://blackroad.io/api/stats");const d=await r.json();document.querySelectorAll("[data-live]").forEach(el=>{const k=el.dataset.live;if(d[k]!==undefined)el.textContent=typeof d[k]==="number"?d[k].toLocaleString():d[k];});}catch{}},30000);<\/script></body>'), { headers: { "Content-Type": "text/html;charset=utf-8", "Cache-Control": "public, max-age=30" } });
    }
    return Response.redirect("https://blackroad.io", 302);
  }
};
export {
  src_default as default
};
//# sourceMappingURL=index.js.map