// BlackRoad Services — Multi-route Cloudflare Worker
// Serves branded landing pages for 8 BlackRoad subdomains

const SERVICES = {
  'mcp.blackroad.io': {
    title: 'MCP Agent Manager',
    tagline: 'Model Context Protocol server for AI agent orchestration',
    icon: '\u{1F916}',
    content: `
      <div class="card">
        <h2>What is MCP?</h2>
        <p>The Model Context Protocol (MCP) server orchestrates AI agents across the BlackRoad infrastructure. It provides a standardized interface for registering, managing, and routing requests to autonomous agents running on distributed compute nodes.</p>
      </div>
      <div class="card">
        <h2>API Endpoints</h2>
        <div class="endpoint"><span class="method get">GET</span> <code>/agents</code> <span class="desc">List all registered agents and their capabilities</span></div>
        <div class="endpoint"><span class="method post">POST</span> <code>/register</code> <span class="desc">Register a new agent with the orchestrator</span></div>
        <div class="endpoint"><span class="method get">GET</span> <code>/health</code> <span class="desc">Health check and system status</span></div>
        <div class="endpoint"><span class="method post">POST</span> <code>/invoke</code> <span class="desc">Invoke an agent with a task payload</span></div>
        <div class="endpoint"><span class="method get">GET</span> <code>/metrics</code> <span class="desc">Agent performance metrics and telemetry</span></div>
      </div>
      <div class="card">
        <h2>Documentation</h2>
        <p>MCP follows the open Model Context Protocol specification. Agents communicate via JSON-RPC over WebSocket or HTTP, with automatic load balancing across the Pi fleet.</p>
        <a href="https://docs.blackroad.io/mcp" class="btn">View Full Docs</a>
      </div>
    `,
  },
  'mesh.blackroad.io': {
    title: 'BlackRoad Mesh',
    tagline: 'WebRTC mesh networking for browser-based compute nodes',
    icon: '\u{1F578}\uFE0F',
    content: `
      <div class="card">
        <h2>Decentralized Compute Mesh</h2>
        <p>BlackRoad Mesh creates a peer-to-peer network of browser-based compute nodes using WebRTC. Any device with a browser can contribute processing power to the mesh, enabling truly distributed computation without centralized servers.</p>
      </div>
      <div class="card">
        <h2>How It Works</h2>
        <div class="steps">
          <div class="step"><span class="step-num">1</span> <strong>Connect</strong> &mdash; Open your browser and join the mesh network</div>
          <div class="step"><span class="step-num">2</span> <strong>Discover</strong> &mdash; WebRTC signaling finds nearby peers automatically</div>
          <div class="step"><span class="step-num">3</span> <strong>Compute</strong> &mdash; Tasks are distributed across connected nodes via WASM</div>
          <div class="step"><span class="step-num">4</span> <strong>Aggregate</strong> &mdash; Results flow back through the mesh to the requester</div>
        </div>
      </div>
      <div class="card">
        <h2>Network Status</h2>
        <div class="stats-grid">
          <div class="stat"><span class="stat-value">--</span><span class="stat-label">Active Nodes</span></div>
          <div class="stat"><span class="stat-value">--</span><span class="stat-label">Mesh Links</span></div>
          <div class="stat"><span class="stat-value">--</span><span class="stat-label">Tasks/min</span></div>
        </div>
      </div>
    `,
  },
  'cloud.blackroad.io': {
    title: 'BlackRoad Cloud',
    tagline: 'Sovereign cloud infrastructure on Raspberry Pi fleet',
    icon: '\u2601\uFE0F',
    content: `
      <div class="card">
        <h2>Sovereign Infrastructure</h2>
        <p>BlackRoad Cloud is a self-hosted cloud platform running on a fleet of Raspberry Pi nodes. No third-party cloud providers, no vendor lock-in &mdash; full sovereignty over your data and compute.</p>
      </div>
      <div class="card">
        <h2>Available Services</h2>
        <div class="service-list">
          <div class="service-item"><span class="dot active"></span> <strong>Compute</strong> &mdash; ARM64 containers via K3s</div>
          <div class="service-item"><span class="dot active"></span> <strong>Storage</strong> &mdash; Distributed block & object storage</div>
          <div class="service-item"><span class="dot active"></span> <strong>Networking</strong> &mdash; WireGuard VPN mesh + Tailscale</div>
          <div class="service-item"><span class="dot active"></span> <strong>DNS</strong> &mdash; Internal service discovery</div>
          <div class="service-item"><span class="dot active"></span> <strong>Monitoring</strong> &mdash; Prometheus + Grafana dashboards</div>
          <div class="service-item"><span class="dot active"></span> <strong>CI/CD</strong> &mdash; Gitea Actions pipelines</div>
        </div>
      </div>
      <div class="card">
        <h2>Fleet Overview</h2>
        <div class="stats-grid">
          <div class="stat"><span class="stat-value">8</span><span class="stat-label">Pi Nodes</span></div>
          <div class="stat"><span class="stat-value">64 GB</span><span class="stat-label">Total RAM</span></div>
          <div class="stat"><span class="stat-value">4 TB</span><span class="stat-label">Storage</span></div>
        </div>
      </div>
    `,
  },
  'drive.blackroad.io': {
    title: 'BlackRoad Drive',
    tagline: 'Self-hosted file storage on Pi fleet',
    icon: '\u{1F4BE}',
    content: `
      <div class="card">
        <h2>Your Files, Your Hardware</h2>
        <p>BlackRoad Drive provides self-hosted file storage with end-to-end encryption, running entirely on the Pi fleet. Sync files across devices, share with collaborators, and maintain complete ownership of your data.</p>
      </div>
      <div class="card">
        <h2>Features</h2>
        <div class="service-list">
          <div class="service-item"><span class="dot active"></span> <strong>File Sync</strong> &mdash; Real-time sync across all devices</div>
          <div class="service-item"><span class="dot active"></span> <strong>Versioning</strong> &mdash; Full file history with rollback</div>
          <div class="service-item"><span class="dot active"></span> <strong>Encryption</strong> &mdash; E2E encrypted at rest and in transit</div>
          <div class="service-item"><span class="dot active"></span> <strong>Sharing</strong> &mdash; Secure links with expiration controls</div>
          <div class="service-item"><span class="dot active"></span> <strong>WebDAV</strong> &mdash; Standard protocol access</div>
        </div>
      </div>
      <div class="card">
        <h2>Storage</h2>
        <div class="stats-grid">
          <div class="stat"><span class="stat-value">4 TB</span><span class="stat-label">Total Capacity</span></div>
          <div class="stat"><span class="stat-value">--</span><span class="stat-label">Used</span></div>
          <div class="stat"><span class="stat-value">3x</span><span class="stat-label">Replication</span></div>
        </div>
      </div>
    `,
  },
  'stream.blackroad.io': {
    title: 'BlackRoad Stream',
    tagline: 'Real-time event streaming via NATS',
    icon: '\u26A1',
    content: `
      <div class="card">
        <h2>Event-Driven Architecture</h2>
        <p>BlackRoad Stream is a real-time event streaming platform powered by NATS JetStream. It provides pub/sub messaging, persistent streams, and exactly-once delivery for all BlackRoad services.</p>
      </div>
      <div class="card">
        <h2>Connection Info</h2>
        <div class="code-block">
          <div class="code-line"><span class="code-key">Protocol:</span> NATS (nats://)</div>
          <div class="code-line"><span class="code-key">Port:</span> 4222</div>
          <div class="code-line"><span class="code-key">WebSocket:</span> wss://stream.blackroad.io/ws</div>
          <div class="code-line"><span class="code-key">Auth:</span> Token-based (JWT)</div>
        </div>
      </div>
      <div class="card">
        <h2>Streams</h2>
        <div class="service-list">
          <div class="service-item"><span class="dot active"></span> <strong>events.*</strong> &mdash; System-wide event bus</div>
          <div class="service-item"><span class="dot active"></span> <strong>metrics.*</strong> &mdash; Telemetry and monitoring data</div>
          <div class="service-item"><span class="dot active"></span> <strong>agents.*</strong> &mdash; Agent communication channel</div>
          <div class="service-item"><span class="dot active"></span> <strong>logs.*</strong> &mdash; Centralized log aggregation</div>
        </div>
      </div>
    `,
  },
  'cece.blackroad.io': {
    title: 'CECE',
    tagline: "Cecilia's AI inference engine \u2014 15 Ollama models on Hailo-8 NPU",
    icon: '\u{1F9E0}',
    content: `
      <div class="card">
        <h2>Neural Processing Unit</h2>
        <p>CECE (Cecilia Engine for Compute & Evaluation) runs 15 large language models locally on a Hailo-8 NPU accelerator. Zero cloud dependency, zero data leakage &mdash; sovereign AI inference at the edge.</p>
      </div>
      <div class="card">
        <h2>Available Models</h2>
        <div class="model-grid">
          <div class="model"><span class="model-name">llama3.2</span><span class="model-size">3B</span></div>
          <div class="model"><span class="model-name">llama3.1</span><span class="model-size">8B</span></div>
          <div class="model"><span class="model-name">mistral</span><span class="model-size">7B</span></div>
          <div class="model"><span class="model-name">mixtral</span><span class="model-size">8x7B</span></div>
          <div class="model"><span class="model-name">codellama</span><span class="model-size">7B</span></div>
          <div class="model"><span class="model-name">deepseek-r1</span><span class="model-size">7B</span></div>
          <div class="model"><span class="model-name">phi3</span><span class="model-size">3.8B</span></div>
          <div class="model"><span class="model-name">gemma2</span><span class="model-size">9B</span></div>
          <div class="model"><span class="model-name">qwen2.5</span><span class="model-size">7B</span></div>
          <div class="model"><span class="model-name">starcoder2</span><span class="model-size">7B</span></div>
          <div class="model"><span class="model-name">nomic-embed</span><span class="model-size">137M</span></div>
          <div class="model"><span class="model-name">all-minilm</span><span class="model-size">33M</span></div>
          <div class="model"><span class="model-name">tinyllama</span><span class="model-size">1.1B</span></div>
          <div class="model"><span class="model-name">orca-mini</span><span class="model-size">3B</span></div>
          <div class="model"><span class="model-name">neural-chat</span><span class="model-size">7B</span></div>
        </div>
      </div>
      <div class="card">
        <h2>API Endpoint</h2>
        <div class="code-block">
          <div class="code-line"><span class="code-key">Base URL:</span> https://cece.blackroad.io/api</div>
          <div class="code-line"><span class="code-key">Compatible:</span> OpenAI API format</div>
          <div class="code-line"><span class="code-key">Accelerator:</span> Hailo-8 26 TOPS NPU</div>
        </div>
      </div>
    `,
  },
  'os.blackroad.io': {
    title: 'BlackRoad OS',
    tagline: 'Sovereign AI operating system',
    icon: '\u{1F3F4}',
    content: `
      <div class="card">
        <h2>The Sovereign Stack</h2>
        <p>BlackRoad OS is a complete sovereign AI operating system &mdash; from bare metal Raspberry Pi nodes to AI agent orchestration. Every layer is self-hosted, self-managed, and designed for autonomy.</p>
      </div>
      <div class="card">
        <h2>System Services</h2>
        <div class="service-list">
          <a href="https://mcp.blackroad.io" class="service-item link"><span class="dot active"></span> <strong>MCP</strong> &mdash; Agent orchestration</a>
          <a href="https://mesh.blackroad.io" class="service-item link"><span class="dot active"></span> <strong>Mesh</strong> &mdash; WebRTC compute network</a>
          <a href="https://cloud.blackroad.io" class="service-item link"><span class="dot active"></span> <strong>Cloud</strong> &mdash; Pi fleet infrastructure</a>
          <a href="https://drive.blackroad.io" class="service-item link"><span class="dot active"></span> <strong>Drive</strong> &mdash; File storage</a>
          <a href="https://stream.blackroad.io" class="service-item link"><span class="dot active"></span> <strong>Stream</strong> &mdash; Event streaming</a>
          <a href="https://cece.blackroad.io" class="service-item link"><span class="dot active"></span> <strong>CECE</strong> &mdash; AI inference engine</a>
          <a href="https://research.blackroad.io" class="service-item link"><span class="dot active"></span> <strong>Research</strong> &mdash; AI research lab</a>
        </div>
      </div>
      <div class="card">
        <h2>Infrastructure</h2>
        <div class="stats-grid">
          <div class="stat"><span class="stat-value">400+</span><span class="stat-label">Shell Scripts</span></div>
          <div class="stat"><span class="stat-value">8</span><span class="stat-label">Pi Nodes</span></div>
          <div class="stat"><span class="stat-value">15</span><span class="stat-label">AI Models</span></div>
          <div class="stat"><span class="stat-value">60+</span><span class="stat-label">Daily KPIs</span></div>
        </div>
      </div>
    `,
  },
  'research.blackroad.io': {
    title: 'BlackRoad Research',
    tagline: 'AI research papers, experiments, and findings',
    icon: '\u{1F52C}',
    content: `
      <div class="card">
        <h2>Research Lab</h2>
        <p>BlackRoad Research explores the frontiers of sovereign AI, edge computing, and autonomous systems. We publish findings, run experiments on our own infrastructure, and build tools that push the boundaries of what's possible with self-hosted AI.</p>
      </div>
      <div class="card">
        <h2>Current Research Areas</h2>
        <div class="service-list">
          <div class="service-item"><span class="dot active"></span> <strong>Edge AI Inference</strong> &mdash; Optimizing LLM performance on ARM64 + NPU hardware</div>
          <div class="service-item"><span class="dot active"></span> <strong>Agent Autonomy</strong> &mdash; Measuring and improving AI agent self-sufficiency</div>
          <div class="service-item"><span class="dot active"></span> <strong>Mesh Computing</strong> &mdash; Browser-based distributed compute via WebRTC</div>
          <div class="service-item"><span class="dot active"></span> <strong>Sovereign Infrastructure</strong> &mdash; Zero-cloud architectures for AI workloads</div>
          <div class="service-item"><span class="dot active"></span> <strong>KPI Observability</strong> &mdash; 60+ daily metrics across the entire stack</div>
        </div>
      </div>
      <div class="card">
        <h2>Recent Topics</h2>
        <div class="service-list">
          <div class="service-item"><span class="dot"></span> Hailo-8 NPU throughput benchmarks for quantized LLMs</div>
          <div class="service-item"><span class="dot"></span> Multi-agent orchestration patterns with MCP</div>
          <div class="service-item"><span class="dot"></span> Pi 5 cluster network topology optimization</div>
          <div class="service-item"><span class="dot"></span> Self-healing infrastructure with autonomous bash agents</div>
        </div>
      </div>
    `,
  },
};

function renderPage(service, hostname) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${service.title} | BlackRoad</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
      background: #0a0a0a;
      color: #e0e0e0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    a { color: #FF1D6C; text-decoration: none; transition: color 0.2s; }
    a:hover { color: #F5A623; }
    code { background: #1a1a2e; padding: 2px 8px; border-radius: 4px; font-size: 0.9em; color: #FF1D6C; }

    /* Nav */
    nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 32px;
      border-bottom: 1px solid #1a1a2e;
      background: #0a0a0a;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-brand {
      font-size: 1.1em;
      font-weight: 700;
      background: linear-gradient(135deg, #F5A623, #FF1D6C, #9C27B0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: 1px;
    }
    .nav-links { display: flex; gap: 24px; font-size: 0.9em; }
    .nav-links a { color: #888; font-weight: 500; }
    .nav-links a:hover { color: #FF1D6C; }

    /* Hero */
    .hero {
      text-align: center;
      padding: 80px 32px 48px;
      background: radial-gradient(ellipse at top, #1a0a1e 0%, #0a0a0a 70%);
    }
    .hero-icon { font-size: 3em; margin-bottom: 16px; }
    .hero h1 {
      font-size: 2.8em;
      font-weight: 800;
      background: linear-gradient(135deg, #F5A623, #FF1D6C, #9C27B0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 12px;
    }
    .hero .tagline {
      font-size: 1.2em;
      color: #888;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }

    /* Content */
    .content {
      max-width: 800px;
      margin: 0 auto;
      padding: 32px 24px 64px;
      flex: 1;
    }
    .card {
      background: #111;
      border: 1px solid #1a1a2e;
      border-radius: 12px;
      padding: 28px;
      margin-bottom: 20px;
      transition: border-color 0.3s;
    }
    .card:hover { border-color: #FF1D6C33; }
    .card h2 {
      font-size: 1.3em;
      color: #fff;
      margin-bottom: 14px;
      font-weight: 700;
    }
    .card p { color: #aaa; line-height: 1.7; }

    /* Endpoints */
    .endpoint {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid #1a1a2e;
      font-size: 0.95em;
    }
    .endpoint:last-child { border-bottom: none; }
    .method {
      font-size: 0.75em;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 4px;
      min-width: 50px;
      text-align: center;
      font-family: monospace;
    }
    .method.get { background: #0d3320; color: #4ade80; }
    .method.post { background: #332b0d; color: #F5A623; }
    .desc { color: #888; }

    /* Steps */
    .steps { display: flex; flex-direction: column; gap: 12px; }
    .step {
      display: flex;
      align-items: center;
      gap: 14px;
      color: #aaa;
    }
    .step-num {
      background: linear-gradient(135deg, #FF1D6C, #9C27B0);
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8em;
      font-weight: 700;
      flex-shrink: 0;
    }

    /* Stats */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 16px;
    }
    .stat {
      text-align: center;
      padding: 16px;
      background: #0a0a0a;
      border-radius: 8px;
      border: 1px solid #1a1a2e;
    }
    .stat-value {
      display: block;
      font-size: 1.8em;
      font-weight: 800;
      background: linear-gradient(135deg, #F5A623, #FF1D6C);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .stat-label { display: block; font-size: 0.8em; color: #666; margin-top: 4px; }

    /* Services list */
    .service-list { display: flex; flex-direction: column; gap: 10px; }
    .service-item {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #aaa;
      padding: 6px 0;
    }
    .service-item.link {
      padding: 10px 12px;
      border-radius: 8px;
      transition: background 0.2s;
      color: #aaa;
    }
    .service-item.link:hover { background: #1a1a2e; color: #e0e0e0; }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #333;
      flex-shrink: 0;
    }
    .dot.active { background: #4ade80; box-shadow: 0 0 6px #4ade8066; }

    /* Models */
    .model-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 8px;
    }
    .model {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0a0a0a;
      border: 1px solid #1a1a2e;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 0.9em;
    }
    .model-name { color: #e0e0e0; font-family: monospace; }
    .model-size { color: #FF1D6C; font-size: 0.8em; font-weight: 600; }

    /* Code block */
    .code-block {
      background: #0a0a0a;
      border: 1px solid #1a1a2e;
      border-radius: 8px;
      padding: 16px 20px;
      font-family: monospace;
      font-size: 0.9em;
    }
    .code-line { padding: 4px 0; color: #aaa; }
    .code-key { color: #FF1D6C; }

    /* Button */
    .btn {
      display: inline-block;
      margin-top: 12px;
      padding: 10px 24px;
      background: linear-gradient(135deg, #FF1D6C, #9C27B0);
      color: white;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9em;
      transition: opacity 0.2s;
    }
    .btn:hover { opacity: 0.85; color: white; }

    /* Footer */
    footer {
      text-align: center;
      padding: 32px;
      border-top: 1px solid #1a1a2e;
      color: #444;
      font-size: 0.85em;
    }
    footer .motto {
      background: linear-gradient(135deg, #F5A623, #FF1D6C, #9C27B0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 700;
      font-size: 1.1em;
      margin-bottom: 8px;
    }

    @media (max-width: 600px) {
      .hero h1 { font-size: 2em; }
      .hero { padding: 48px 20px 32px; }
      .content { padding: 20px 16px 48px; }
      nav { padding: 12px 16px; }
      .nav-links { gap: 16px; font-size: 0.8em; }
      .model-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
    }
  </style>
</head>
<body>
  <nav>
    <a href="https://os.blackroad.io" class="nav-brand">BLACKROAD</a>
    <div class="nav-links">
      <a href="https://os.blackroad.io">Portal</a>
      <a href="https://chat.blackroad.io">Chat</a>
      <a href="https://docs.blackroad.io">Docs</a>
      <a href="https://git.blackroad.io">Git</a>
    </div>
  </nav>

  <div class="hero">
    <div class="hero-icon">${service.icon}</div>
    <h1>${service.title}</h1>
    <p class="tagline">${service.tagline}</p>
  </div>

  <div class="content">
    ${service.content}
  </div>

  <footer>
    <div class="motto">Pave Tomorrow</div>
    <div>&copy; ${new Date().getFullYear()} BlackRoad &middot; ${hostname}</div>
  </footer>
</body>
</html>`;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const hostname = request.headers.get('host')?.split(':')[0] || url.hostname;

    const service = SERVICES[hostname];

    if (!service) {
      // Fallback — redirect to os.blackroad.io
      return new Response(renderPage(SERVICES['os.blackroad.io'], hostname), {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      });
    }

    return new Response(renderPage(service, hostname), {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Cache-Control': 'public, max-age=3600',
        'X-BlackRoad-Service': service.title,
      },
    });
  },
};
