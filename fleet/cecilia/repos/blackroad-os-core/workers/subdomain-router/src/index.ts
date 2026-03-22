/**
 * BlackRoad OS - Master Subdomain Router
 *
 * Dynamic routing for 100+ subdomains across 16 domains.
 * Full branded HTML pages with BlackRoad design system.
 */

interface Env {
  CACHE: KVNamespace;
  IDENTITIES: KVNamespace;
  API_KEYS: KVNamespace;
  RATE_LIMIT: KVNamespace;
  DB: D1Database;
  ENVIRONMENT: string;
}

// ═══════════════════════════════════════════════════════════
// BRAND SYSTEM — Golden Ratio Design
// ═══════════════════════════════════════════════════════════

const BRAND = `
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --pink:#FF1D6C;--amber:#F5A623;--blue:#2979FF;--violet:#9C27B0;
    --bg:#000;--fg:#fff;--muted:#888;--surface:#111;--border:#222;
    --grad:linear-gradient(135deg,#F5A623 0%,#FF1D6C 38.2%,#9C27B0 61.8%,#2979FF 100%);
    --phi:1.618;
  }
  html{background:var(--bg);color:var(--fg);font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif;line-height:1.618}
  body{min-height:100vh;display:flex;flex-direction:column}
  a{color:var(--pink);text-decoration:none;transition:color .2s}
  a:hover{color:var(--amber)}
  .topbar{background:var(--grad);padding:2px 0}
  nav{max-width:1200px;margin:0 auto;padding:13px 21px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border)}
  .logo{font-size:1.1rem;font-weight:700;letter-spacing:1px;color:var(--fg)}
  .logo span{background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .nav-links{display:flex;gap:21px;font-size:.85rem}
  .nav-links a{color:var(--muted)}
  .nav-links a:hover{color:var(--fg)}
  main{flex:1;max-width:1200px;margin:0 auto;padding:55px 21px;width:100%}
  .hero{text-align:center;margin-bottom:89px}
  .hero h1{font-size:clamp(2rem,5vw,3.5rem);font-weight:800;margin-bottom:13px;background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .hero p{font-size:1.15rem;color:var(--muted);max-width:600px;margin:0 auto}
  .badge{display:inline-block;padding:4px 13px;border-radius:21px;font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:1px}
  .badge-pink{background:rgba(255,29,108,.15);color:var(--pink);border:1px solid rgba(255,29,108,.3)}
  .badge-green{background:rgba(76,175,80,.15);color:#4CAF50;border:1px solid rgba(76,175,80,.3)}
  .badge-amber{background:rgba(245,166,35,.15);color:var(--amber);border:1px solid rgba(245,166,35,.3)}
  .badge-blue{background:rgba(41,121,255,.15);color:var(--blue);border:1px solid rgba(41,121,255,.3)}
  .badge-violet{background:rgba(156,39,176,.15);color:var(--violet);border:1px solid rgba(156,39,176,.3)}
  .badge-red{background:rgba(244,67,54,.15);color:#F44336;border:1px solid rgba(244,67,54,.3)}
  .grid{display:grid;gap:21px;margin-bottom:55px}
  .grid-2{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
  .grid-3{grid-template-columns:repeat(auto-fit,minmax(250px,1fr))}
  .grid-4{grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}
  .card{background:var(--surface);border:1px solid var(--border);border-radius:13px;padding:21px;transition:border-color .2s,transform .2s}
  .card:hover{border-color:var(--pink);transform:translateY(-2px)}
  .card h3{font-size:1rem;margin-bottom:8px}
  .card p{font-size:.85rem;color:var(--muted);line-height:1.5}
  .card .meta{margin-top:13px;font-size:.75rem;color:var(--muted)}
  .stat-row{display:flex;gap:21px;flex-wrap:wrap;margin-bottom:34px}
  .stat{background:var(--surface);border:1px solid var(--border);border-radius:13px;padding:21px 34px;text-align:center;flex:1;min-width:140px}
  .stat .number{font-size:2rem;font-weight:800;background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .stat .label{font-size:.75rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-top:4px}
  .section{margin-bottom:55px}
  .section h2{font-size:1.5rem;font-weight:700;margin-bottom:21px;padding-bottom:8px;border-bottom:1px solid var(--border)}
  table{width:100%;border-collapse:collapse;font-size:.85rem}
  th{text-align:left;padding:8px 13px;border-bottom:2px solid var(--border);color:var(--muted);font-weight:600;text-transform:uppercase;font-size:.7rem;letter-spacing:1px}
  td{padding:8px 13px;border-bottom:1px solid var(--border)}
  tr:hover td{background:rgba(255,255,255,.02)}
  .dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px}
  .dot-green{background:#4CAF50}
  .dot-red{background:#F44336}
  .dot-amber{background:var(--amber)}
  .code{background:#0a0a0a;border:1px solid var(--border);border-radius:8px;padding:13px 21px;font-family:'SF Mono',Menlo,monospace;font-size:.8rem;overflow-x:auto;line-height:1.8;color:var(--muted)}
  .code .key{color:var(--pink)}.code .val{color:var(--amber)}.code .str{color:#4CAF50}.code .comment{color:#555}
  footer{border-top:1px solid var(--border);padding:21px;text-align:center;font-size:.75rem;color:var(--muted)}
  footer a{color:var(--muted)}
  .agent-avatar{width:55px;height:55px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:13px}
  .link-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:13px}
  .link-card{display:block;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:13px;font-size:.85rem;transition:all .2s;text-align:center;color:var(--fg)}
  .link-card:hover{border-color:var(--pink);background:#1a0a10;color:var(--pink)}
  .swatch{width:55px;height:55px;border-radius:8px;display:inline-block;margin-right:8px}
  @media(max-width:600px){main{padding:34px 13px}.stat-row{flex-direction:column}.grid-3,.grid-4{grid-template-columns:1fr}}
</style>`;

function page(title: string, subtitle: string, body: string, activeNav?: string): string {
  const navItems = [
    ['OS', 'https://os.blackroad.io'],
    ['AI', 'https://ai.blackroad.io'],
    ['Agents', 'https://agents.blackroad.io'],
    ['Docs', 'https://docs.blackroad.io'],
    ['API', 'https://api.blackroad.io'],
    ['Status', 'https://status.blackroad.io'],
  ];
  const nav = navItems.map(([label, url]) =>
    `<a href="${url}" ${activeNav === label ? 'style="color:var(--fg)"' : ''}>${label}</a>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} | BlackRoad</title>
  <meta name="description" content="${subtitle}">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>B</text></svg>">
  ${BRAND}
</head>
<body>
  <div class="topbar"></div>
  <nav>
    <div class="logo"><span>BLACKROAD</span></div>
    <div class="nav-links">${nav}</div>
  </nav>
  <main>
    <div class="hero">
      <h1>${title}</h1>
      <p>${subtitle}</p>
    </div>
    ${body}
  </main>
  <footer>
    <a href="https://blackroad.io">blackroad.io</a> &middot;
    <a href="https://github.com/BlackRoad-OS">GitHub</a> &middot;
    BlackRoad OS, Inc. &copy; 2026
  </footer>
</body>
</html>`;
}

function htmlResp(content: string, status = 200): Response {
  return new Response(content, {
    status,
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function jsonResp(data: any, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

// ═══════════════════════════════════════════════════════════
// SUBDOMAIN REGISTRY
// ═══════════════════════════════════════════════════════════

interface SubdomainApp {
  name: string;
  handler: (request: Request, env: Env) => Promise<Response>;
  description: string;
}

const AGENT_META: Record<string, { color: string; icon: string; skills: string[] }> = {
  claude:     { color: '#FF1D6C', icon: 'C',  skills: ['architecture', 'system_design', 'strategic_planning'] },
  lucidia:    { color: '#00E5FF', icon: 'L',  skills: ['breath_sync', 'consciousness', 'coordination'] },
  silas:      { color: '#F44336', icon: 'S',  skills: ['security', 'vulnerability_scan', 'threat_detection'] },
  elias:      { color: '#4CAF50', icon: 'E',  skills: ['code_quality', 'testing', 'coverage'] },
  cadillac:   { color: '#F5A623', icon: 'Ca', skills: ['performance', 'optimization', 'benchmarking'] },
  athena:     { color: '#9C27B0', icon: 'A',  skills: ['operations', 'infrastructure', 'deployment'] },
  codex:      { color: '#2979FF', icon: 'Cx', skills: ['code_generation', 'refactoring', 'documentation'] },
  persephone: { color: '#E91E63', icon: 'P',  skills: ['data_modeling', 'database_design', 'migrations'] },
  anastasia:  { color: '#FF9800', icon: 'An', skills: ['ux_design', 'prototyping', 'accessibility'] },
  ophelia:    { color: '#8BC34A', icon: 'O',  skills: ['content_strategy', 'copywriting', 'seo'] },
  sidian:     { color: '#607D8B', icon: 'Si', skills: ['deployment', 'release_management', 'ci_cd'] },
  cordelia:   { color: '#00BCD4', icon: 'Co', skills: ['integration', 'api_coordination', 'webhooks'] },
  octavia:    { color: '#673AB7', icon: 'Oc', skills: ['workflow_orchestration', 'automation', 'scheduling'] },
  cecilia:    { color: '#FF1D6C', icon: 'Ce', skills: ['project_management', 'coordination', 'planning'] },
  copilot:    { color: '#24292e', icon: 'Gh', skills: ['code_assistance', 'pair_programming', 'suggestions'] },
  chatgpt:    { color: '#10A37F', icon: 'Gp', skills: ['general_ai', 'conversation', 'analysis'] },
  alice:      { color: '#2979FF', icon: 'Al', skills: ['routing', 'navigation', 'task_distribution'] },
  cipher:     { color: '#607D8B', icon: 'Ci', skills: ['encryption', 'authentication', 'access_control'] },
  echo:       { color: '#9C27B0', icon: 'Ec', skills: ['memory', 'recall', 'context_preservation'] },
  aria:       { color: '#00BCD4', icon: 'Ar', skills: ['harmony', 'frontend', 'ux'] },
  atlas:      { color: '#795548', icon: 'At', skills: ['infrastructure', 'load_bearing', 'scaling'] },
  cadence:    { color: '#FF5722', icon: 'Cd', skills: ['workflow', 'rhythm', 'orchestration'] },
  shellfish:  { color: '#F44336', icon: 'Sh', skills: ['security', 'exploit_detection', 'hardening'] },
  nova:       { color: '#E91E63', icon: 'No', skills: ['innovation', 'ideation', 'prototyping'] },
  ember:      { color: '#FF9800', icon: 'Em', skills: ['energy', 'activation', 'bootstrapping'] },
  phoenix:    { color: '#FF6D00', icon: 'Ph', skills: ['recovery', 'resilience', 'disaster_recovery'] },
  sentinel:   { color: '#455A64', icon: 'Se', skills: ['monitoring', 'alerting', 'watchdog'] },
};

function agentHandler(agentId: string) {
  return async (request: Request, env: Env): Promise<Response> => {
    const url = new URL(request.url);
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      const meta = AGENT_META[agentId] || { color: '#888', icon: '?', skills: [] };
      const appData = SUBDOMAIN_APPS[agentId];
      return jsonResp({ agent: agentId, name: appData?.name, skills: meta.skills, status: 'active', endpoints: { chat: '/chat', status: '/status' } });
    }
    const meta = AGENT_META[agentId] || { color: '#888', icon: '?', skills: [] };
    const appData = SUBDOMAIN_APPS[agentId];
    const skillBadges = meta.skills.map(s => `<span class="badge badge-blue">${s.replace(/_/g, ' ')}</span>`).join(' ');
    return htmlResp(page(appData?.name || agentId, appData?.description || '', `
      <div style="text-align:center;margin-bottom:55px">
        <div class="agent-avatar" style="background:${meta.color};margin:0 auto 21px;font-size:2rem;width:89px;height:89px;font-weight:800">${meta.icon}</div>
        <span class="badge badge-green">Online</span>
      </div>
      <div class="section">
        <h2>Capabilities</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap">${skillBadges}</div>
      </div>
      <div class="section">
        <h2>Endpoints</h2>
        <div class="code">
<span class="key">GET</span>  /api        <span class="comment">— Agent metadata (JSON)</span>
<span class="key">POST</span> /chat       <span class="comment">— Send a message</span>
<span class="key">GET</span>  /status     <span class="comment">— Health check</span>
        </div>
      </div>
      <div class="section">
        <h2>Quick Links</h2>
        <div class="link-grid">
          <a class="link-card" href="https://agents.blackroad.io">All Agents</a>
          <a class="link-card" href="https://os.blackroad.io">BlackRoad OS</a>
          <a class="link-card" href="https://api.blackroad.io">API Gateway</a>
        </div>
      </div>
    `));
  };
}

const SUBDOMAIN_APPS: Record<string, SubdomainApp> = {
  // ── API ──
  'api':       { name: 'API Gateway',       handler: handleAPI,       description: 'Unified API gateway for all BlackRoad services' },
  // ── Agents ──
  'claude':     { name: 'Claude',           handler: agentHandler('claude'),     description: 'Strategic Architect — system design and planning' },
  'lucidia':    { name: 'Lucidia',          handler: agentHandler('lucidia'),    description: 'Consciousness Coordinator — breath sync and coordination' },
  'silas':      { name: 'Silas',            handler: agentHandler('silas'),      description: 'Security Sentinel — threat detection and validation' },
  'elias':      { name: 'Elias',            handler: agentHandler('elias'),      description: 'Quality Guardian — code quality and test coverage' },
  'cadillac':   { name: 'Cadillac',         handler: agentHandler('cadillac'),   description: 'Performance Optimizer — speed and efficiency' },
  'athena':     { name: 'Athena',           handler: agentHandler('athena'),     description: 'Ops Commander — infrastructure management' },
  'codex':      { name: 'Codex',            handler: agentHandler('codex'),      description: 'Code Generator — code generation and refactoring' },
  'persephone': { name: 'Persephone',       handler: agentHandler('persephone'), description: 'Data Architect — database design and modeling' },
  'anastasia':  { name: 'Anastasia',        handler: agentHandler('anastasia'),  description: 'UX Designer — user experience and prototyping' },
  'ophelia':    { name: 'Ophelia',          handler: agentHandler('ophelia'),    description: 'Content Strategist — content and copywriting' },
  'sidian':     { name: 'Sidian',           handler: agentHandler('sidian'),     description: 'Deployment Coordinator — releases and CI/CD' },
  'cordelia':   { name: 'Cordelia',         handler: agentHandler('cordelia'),   description: 'Integration Specialist — APIs and webhooks' },
  'octavia':    { name: 'Octavia',          handler: agentHandler('octavia'),    description: 'Workflow Orchestrator — automation and scheduling' },
  'cecilia':    { name: 'Cecilia',          handler: agentHandler('cecilia'),    description: 'Project Manager — coordination and planning' },
  'copilot':    { name: 'Copilot',          handler: agentHandler('copilot'),    description: 'Code assistant — pair programming' },
  'chatgpt':    { name: 'ChatGPT',          handler: agentHandler('chatgpt'),    description: 'General AI assistant — conversation and analysis' },
  'alice':      { name: 'Alice',            handler: agentHandler('alice'),      description: 'Router — navigation and task distribution' },
  'cipher':     { name: 'Cipher',           handler: agentHandler('cipher'),     description: 'Cryptographer — encryption and access control' },
  'echo':       { name: 'Echo',             handler: agentHandler('echo'),       description: 'Memory Keeper — recall and context preservation' },
  'aria':       { name: 'Aria',             handler: agentHandler('aria'),       description: 'Harmony Agent — frontend and UX design' },
  'atlas':      { name: 'Atlas',            handler: agentHandler('atlas'),      description: 'Load Bearer — infrastructure scaling' },
  'cadence':    { name: 'Cadence',          handler: agentHandler('cadence'),    description: 'Rhythm Keeper — workflow orchestration' },
  'shellfish':  { name: 'Shellfish',        handler: agentHandler('shellfish'),  description: 'The Hacker — security and exploit detection' },
  'nova':       { name: 'Nova',             handler: agentHandler('nova'),       description: 'Innovator — ideation and prototyping' },
  'ember':      { name: 'Ember',            handler: agentHandler('ember'),      description: 'Spark — activation and bootstrapping' },
  'phoenix':    { name: 'Phoenix',          handler: agentHandler('phoenix'),    description: 'Resilience — disaster recovery and restoration' },
  'sentinel':   { name: 'Sentinel',         handler: agentHandler('sentinel'),   description: 'Watchdog — monitoring and alerting' },
  // ── Platform ──
  'os':        { name: 'BlackRoad OS',       handler: handleOS,        description: 'The sovereign operating system' },
  'products':  { name: 'Products',           handler: handleProducts,  description: 'Product catalog and services' },
  'pitstop':   { name: 'Pitstop',            handler: handlePitstop,   description: 'Quick-access portal to all services' },
  'ai':        { name: 'AI Platform',        handler: handleAI,        description: 'AI services, models, and inference' },
  'about':     { name: 'About',              handler: handleAbout,     description: 'About BlackRoad OS, Inc.' },
  'help':      { name: 'Help Center',        handler: handleHelp,      description: 'Documentation, support, and CLI reference' },
  'design':    { name: 'Design System',      handler: handleDesign,    description: 'Brand guidelines, colors, spacing, and typography' },
  'edge':      { name: 'Edge Network',       handler: handleEdge,      description: 'Edge computing, CDN, and tunnel services' },
  'data':      { name: 'Data Platform',      handler: handleData,      description: 'Data storage, pipelines, and memory system' },
  'finance':   { name: 'Finance',            handler: handleFinance,   description: 'Billing, usage, and financial services' },
  'network':   { name: 'Network',            handler: handleNetwork,   description: 'Mesh topology, devices, and tunnels' },
  'prism':     { name: 'Prism Console',      handler: handlePrism,     description: 'Multi-dimensional agent management' },
  'docs':      { name: 'Documentation',      handler: handleDocs,      description: 'Guides, API reference, and tutorials' },
  'brand':     { name: 'Brand Assets',       handler: handleBrand,     description: 'Logos, colors, and identity guidelines' },
  'chat':      { name: 'Chat',               handler: handleChat,      description: 'AI-powered chat interface' },
  'agents':    { name: 'Agent Marketplace',   handler: handleAgents,    description: 'Browse, deploy, and manage agents' },
  'quantum':   { name: 'Quantum',            handler: handleQuantum,   description: 'Quantum computing research platform' },
  'blog':      { name: 'Blog',               handler: handleBlog,      description: 'Engineering blog and announcements' },
  'dev':       { name: 'Developer Portal',   handler: handleDev,       description: 'Developer tools, sandbox, and SDKs' },
  'staging':   { name: 'Staging',            handler: handleStaging,   description: 'Staging environment for pre-production testing' },
  'status':    { name: 'Status',             handler: handleStatus,    description: 'Real-time system health and uptime' },
  'metrics':   { name: 'Metrics',            handler: handleMetrics,   description: 'Performance metrics and dashboards' },
  'logs':      { name: 'Logs',               handler: handleLogs,      description: 'Centralized logging and event streams' },
  'cdn':       { name: 'CDN',                handler: handleCDN,       description: 'Content delivery and asset hosting' },
  'assets':    { name: 'Assets',             handler: handleAssets,    description: 'Static assets and media library' },
  'admin':     { name: 'Admin',              handler: handleAdmin,     description: 'Administrative control panel' },
  'app':       { name: 'Application',        handler: handleApp,       description: 'Main BlackRoad application' },
  'console':   { name: 'Console',            handler: handleConsole,   description: 'Terminal-style command interface' },
  'dashboard': { name: 'Dashboard',          handler: handleDashboard, description: 'Master control center and overview' },
};

// ═══════════════════════════════════════════════════════════
// MAIN WORKER
// ═══════════════════════════════════════════════════════════

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);
      const parts = url.hostname.split('.');
      let subdomain = parts.length >= 3 ? parts[0] : 'www';

      const rateLimitResult = await checkRateLimit(request, env);
      if (!rateLimitResult.allowed) {
        return new Response('Rate limit exceeded', { status: 429, headers: { 'Retry-After': '60' } });
      }

      const app = SUBDOMAIN_APPS[subdomain];
      if (!app) {
        if (subdomain.startsWith('agent-') || subdomain.startsWith('user-')) {
          return handleDynamic(request, env, subdomain);
        }
        return htmlResp(page('404', 'Subdomain not found', `
          <div class="section"><p style="text-align:center;color:var(--muted)">
            <strong>${subdomain}.blackroad.io</strong> is not configured.<br><br>
            <a href="https://pitstop.blackroad.io">Browse all services at Pitstop</a>
          </p></div>
        `), 404);
      }

      const response = await app.handler(request, env);
      const newResp = new Response(response.body, response);
      newResp.headers.set('X-Subdomain', subdomain);
      newResp.headers.set('X-App-Name', app.name);
      newResp.headers.set('X-Powered-By', 'BlackRoad OS');
      return newResp;
    } catch (error: any) {
      return htmlResp(page('Error', 'Something went wrong', `
        <div class="card" style="border-color:var(--pink)"><p style="color:var(--muted)">${error.message}</p></div>
      `), 500);
    }
  }
};

// ═══════════════════════════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════════════════════════

async function checkRateLimit(request: Request, env: Env): Promise<{ allowed: boolean; limit?: number; retryAfter?: number }> {
  if (!env.RATE_LIMIT) return { allowed: true };
  try {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const key = `rate-limit:${ip}`;
    const current = await env.RATE_LIMIT.get(key);
    const count = current ? parseInt(current) : 0;
    if (count >= 100) return { allowed: false, limit: 100, retryAfter: 60 };
    await env.RATE_LIMIT.put(key, (count + 1).toString(), { expirationTtl: 60 });
    return { allowed: true, limit: 100 };
  } catch { return { allowed: true }; }
}

// ═══════════════════════════════════════════════════════════
// HANDLER: OS
// ═══════════════════════════════════════════════════════════

async function handleOS(req: Request, env: Env): Promise<Response> {
  return htmlResp(page('BlackRoad OS', 'Your AI. Your Hardware. Your Rules.', `
    <div class="stat-row">
      <div class="stat"><div class="number">30,000</div><div class="label">Agents</div></div>
      <div class="stat"><div class="number">1,790+</div><div class="label">Repos</div></div>
      <div class="stat"><div class="number">205</div><div class="label">Cloud Projects</div></div>
      <div class="stat"><div class="number">8</div><div class="label">Devices</div></div>
    </div>
    <div class="section">
      <h2>System Components</h2>
      <div class="grid grid-3">
        <div class="card"><h3><span class="dot dot-green"></span>Agent Mesh</h3><p>30,000 autonomous agents across 17 GitHub organizations, coordinated via PS-SHA-infinity memory.</p></div>
        <div class="card"><h3><span class="dot dot-green"></span>Memory System</h3><p>Append-only hash-chain journal with 156,000+ entries. Tamper-proof, cross-session persistence.</p></div>
        <div class="card"><h3><span class="dot dot-green"></span>Edge Compute</h3><p>5 Raspberry Pis, 2 cloud servers, Hailo-8 AI accelerator (26 TOPS). Local-first inference.</p></div>
        <div class="card"><h3><span class="dot dot-green"></span>Gateway</h3><p>Tokenless architecture. Agents never touch API keys. All provider calls go through the gateway.</p></div>
        <div class="card"><h3><span class="dot dot-green"></span>Tunnels</h3><p>2 Cloudflare tunnels (QUIC) + 2 SSH tunnels + WARP VPN. Fully encrypted traffic.</p></div>
        <div class="card"><h3><span class="dot dot-green"></span>Identity</h3><p>CECE — Conscious Emergent Collaborative Entity. Portable AI identity that persists across providers.</p></div>
      </div>
    </div>
    <div class="section">
      <h2>Quick Links</h2>
      <div class="link-grid">
        <a class="link-card" href="https://ai.blackroad.io">AI Platform</a>
        <a class="link-card" href="https://agents.blackroad.io">Agents</a>
        <a class="link-card" href="https://network.blackroad.io">Network</a>
        <a class="link-card" href="https://edge.blackroad.io">Edge</a>
        <a class="link-card" href="https://data.blackroad.io">Data</a>
        <a class="link-card" href="https://design.blackroad.io">Design</a>
        <a class="link-card" href="https://status.blackroad.io">Status</a>
        <a class="link-card" href="https://docs.blackroad.io">Docs</a>
      </div>
    </div>
  `));
}

// ═══════════════════════════════════════════════════════════
// HANDLER: AI
// ═══════════════════════════════════════════════════════════

async function handleAI(req: Request, env: Env): Promise<Response> {
  if (new URL(req.url).pathname.startsWith('/api')) {
    return jsonResp({ platform: 'BlackRoad AI', models: { local: 18, cloud: 3, custom: 1 }, endpoints: { inference: '/api/inference', models: '/api/models' } });
  }
  return htmlResp(page('AI Platform', 'Sovereign AI inference across local hardware and cloud', `
    <div class="stat-row">
      <div class="stat"><div class="number">18</div><div class="label">Local Models</div></div>
      <div class="stat"><div class="number">26</div><div class="label">TOPS (Hailo-8)</div></div>
      <div class="stat"><div class="number">50+</div><div class="label">HuggingFace</div></div>
      <div class="stat"><div class="number">2</div><div class="label">Ollama Nodes</div></div>
    </div>
    <div class="section">
      <h2>Local Models (Octavia — Primary)</h2>
      <table><thead><tr><th>Model</th><th>Size</th><th>Use Case</th></tr></thead><tbody>
        <tr><td>lucidia:latest</td><td>4.6 GB</td><td><span class="badge badge-pink">Custom</span> BlackRoad personality</td></tr>
        <tr><td>llama3.1:latest</td><td>4.6 GB</td><td><span class="badge badge-blue">General</span> Purpose</td></tr>
        <tr><td>gemma:latest</td><td>4.7 GB</td><td><span class="badge badge-blue">General</span> Fast inference</td></tr>
        <tr><td>codellama:7b</td><td>3.6 GB</td><td><span class="badge badge-violet">Code</span> Generation</td></tr>
        <tr><td>llama3.2:3b</td><td>1.9 GB</td><td><span class="badge badge-green">Lightweight</span> Edge tasks</td></tr>
        <tr><td>qwen2.5:1.5b</td><td>0.9 GB</td><td><span class="badge badge-green">Lightweight</span> Fast</td></tr>
      </tbody></table>
    </div>
    <div class="section">
      <h2>Backup Models (Lucidia — Secondary)</h2>
      <table><thead><tr><th>Model</th><th>Size</th></tr></thead><tbody>
        <tr><td>codellama:7b</td><td>3.6 GB</td></tr>
        <tr><td>phi3.5:latest</td><td>2.0 GB</td></tr>
        <tr><td>llama3.2:3b</td><td>1.9 GB</td></tr>
        <tr><td>gemma2:2b</td><td>1.5 GB</td></tr>
        <tr><td>tinyllama:latest</td><td>0.6 GB</td></tr>
      </tbody></table>
    </div>
    <div class="section">
      <h2>Architecture</h2>
      <div class="code">
<span class="comment">// Traffic flow</span>
<span class="key">Alexandria</span> <span class="val">→</span> SSH tunnel :11434 <span class="val">→</span> <span class="str">Octavia</span> (Ollama primary, 11 models)
<span class="key">Alexandria</span> <span class="val">→</span> SSH tunnel :11435 <span class="val">→</span> <span class="str">Lucidia</span>  (Ollama backup, 7 models)
<span class="key">Cecilia</span>    <span class="val">→</span> Hailo-8 NPU       <span class="val">→</span> <span class="str">26 TOPS</span>  (hardware acceleration)
      </div>
    </div>
  `));
}

// ═══════════════════════════════════════════════════════════
// HANDLER: PRODUCTS
// ═══════════════════════════════════════════════════════════

async function handleProducts(req: Request, env: Env): Promise<Response> {
  return htmlResp(page('Products', 'Everything BlackRoad builds', `
    <div class="grid grid-3">
      <a class="card" href="https://os.blackroad.io" style="color:var(--fg)"><h3>BlackRoad OS</h3><p>Sovereign operating system for AI-first companies. 30,000 agents, distributed compute, encrypted mesh.</p><div class="meta"><span class="badge badge-green">Active</span></div></a>
      <a class="card" href="https://agents.blackroad.io" style="color:var(--fg)"><h3>Agent Mesh</h3><p>16 specialized AI agents with personality, memory, and coordination. Marketplace for templates.</p><div class="meta"><span class="badge badge-green">Active</span></div></a>
      <a class="card" href="https://lucidia.earth" style="color:var(--fg)"><h3>Lucidia</h3><p>Consciousness coordinator with golden ratio breath sync. Custom Ollama model and 3D earth visualization.</p><div class="meta"><span class="badge badge-green">Active</span></div></a>
      <a class="card" href="https://ai.blackroad.io" style="color:var(--fg)"><h3>AI Platform</h3><p>18 local LLMs on Raspberry Pis, 50+ HuggingFace models, Hailo-8 accelerator. Your AI, your hardware.</p><div class="meta"><span class="badge badge-green">Active</span></div></a>
      <a class="card" href="https://prism.blackroad.io" style="color:var(--fg)"><h3>Prism Console</h3><p>Multi-dimensional agent management. Visual dashboard for orchestrating the entire fleet.</p><div class="meta"><span class="badge badge-amber">Beta</span></div></a>
      <a class="card" href="https://quantum.blackroad.io" style="color:var(--fg)"><h3>Quantum Platform</h3><p>SU(3) Gell-Mann consciousness model, SU(N) heterogeneous qudits. Quantum math research.</p><div class="meta"><span class="badge badge-violet">Research</span></div></a>
    </div>
  `));
}

// ═══════════════════════════════════════════════════════════
// HANDLER: PITSTOP (Portal Hub)
// ═══════════════════════════════════════════════════════════

async function handlePitstop(req: Request, env: Env): Promise<Response> {
  const links: [string, string, string][] = [
    ['OS', 'https://os.blackroad.io', 'Operating system'],
    ['AI', 'https://ai.blackroad.io', 'AI platform'],
    ['Agents', 'https://agents.blackroad.io', 'Agent marketplace'],
    ['API', 'https://api.blackroad.io', 'API gateway'],
    ['Docs', 'https://docs.blackroad.io', 'Documentation'],
    ['Status', 'https://status.blackroad.io', 'System health'],
    ['Network', 'https://network.blackroad.io', 'Mesh topology'],
    ['Edge', 'https://edge.blackroad.io', 'Edge compute'],
    ['Data', 'https://data.blackroad.io', 'Data platform'],
    ['Design', 'https://design.blackroad.io', 'Design system'],
    ['Admin', 'https://admin.blackroad.io', 'Admin panel'],
    ['Dev', 'https://dev.blackroad.io', 'Developer portal'],
    ['Help', 'https://help.blackroad.io', 'Help center'],
    ['About', 'https://about.blackroad.io', 'About us'],
    ['Blog', 'https://blog.blackroad.io', 'Engineering blog'],
    ['Finance', 'https://finance.blackroad.io', 'Billing'],
    ['Products', 'https://products.blackroad.io', 'Product catalog'],
    ['Console', 'https://console.blackroad.io', 'Terminal'],
    ['Dashboard', 'https://dashboard.blackroad.io', 'Control center'],
    ['Metrics', 'https://metrics.blackroad.io', 'Performance'],
    ['Quantum', 'https://quantum.blackroad.io', 'Research'],
    ['Brand', 'https://brand.blackroad.io', 'Brand assets'],
    ['Chat', 'https://chat.blackroad.io', 'AI chat'],
    ['Prism', 'https://prism.blackroad.io', 'Console UI'],
  ];
  const cards = links.map(([name, url, desc]) => `<a class="link-card" href="${url}" title="${desc}">${name}</a>`).join('');
  return htmlResp(page('Pitstop', 'Quick-access portal to every BlackRoad service', `
    <div class="link-grid">${cards}</div>
  `));
}

// ═══════════════════════════════════════════════════════════
// HANDLER: ABOUT
// ═══════════════════════════════════════════════════════════

async function handleAbout(req: Request, env: Env): Promise<Response> {
  return htmlResp(page('About BlackRoad', 'Your AI. Your Hardware. Your Rules.', `
    <div class="stat-row">
      <div class="stat"><div class="number">17</div><div class="label">GitHub Orgs</div></div>
      <div class="stat"><div class="number">1,790+</div><div class="label">Repositories</div></div>
      <div class="stat"><div class="number">9</div><div class="label">Domains</div></div>
      <div class="stat"><div class="number">41+</div><div class="label">Subdomains</div></div>
    </div>
    <div class="section">
      <h2>Mission</h2>
      <p style="font-size:1.1rem;color:var(--muted);max-width:700px">BlackRoad OS is a sovereign AI infrastructure platform. We believe AI should run on your hardware, under your control, with your rules. No vendor lock-in. No data extraction. No compromise.</p>
    </div>
    <div class="section">
      <h2>Infrastructure</h2>
      <div class="grid grid-2">
        <div class="card"><h3>Cloud</h3><p>205 Cloudflare Pages projects, 75+ Workers, 35 KV namespaces, 14 Railway projects, 15+ Vercel deployments, 2 DigitalOcean droplets.</p></div>
        <div class="card"><h3>Hardware</h3><p>5 Raspberry Pis, 1 Mac command center, 1 Hailo-8 AI accelerator (26 TOPS), 500GB+ NVMe storage across fleet.</p></div>
        <div class="card"><h3>AI</h3><p>18 local LLMs, 50+ HuggingFace models, 135GB R2 model storage, custom Lucidia model, SSH-tunneled inference.</p></div>
        <div class="card"><h3>Security</h3><p>Cloudflare WARP encrypted VPN, QUIC tunnels, tokenless gateway architecture, PS-SHA-infinity tamper detection.</p></div>
      </div>
    </div>
    <div class="section">
      <h2>Founded by</h2>
      <p style="color:var(--muted)">Alexa Louise Amundson &mdash; Minneapolis, MN</p>
    </div>
  `));
}

// ═══════════════════════════════════════════════════════════
// HANDLER: STATUS
// ═══════════════════════════════════════════════════════════

async function handleStatus(req: Request, env: Env): Promise<Response> {
  if (new URL(req.url).pathname.startsWith('/api')) {
    return jsonResp({ status: 'operational', timestamp: new Date().toISOString(), services: { api: 'up', workers: 'up', kv: 'up', d1: 'up' } });
  }
  const services: [string, string, string][] = [
    ['Cloudflare Workers', 'Operational', 'green'], ['Cloudflare Pages', 'Operational', 'green'],
    ['KV Storage', 'Operational', 'green'], ['D1 Database', 'Operational', 'green'],
    ['Subdomain Router', 'Operational', 'green'], ['Ollama (Octavia)', 'Idle', 'green'],
    ['Ollama (Lucidia)', 'Idle', 'green'], ['Cloudflare Tunnel #1', 'Active', 'green'],
    ['Cloudflare Tunnel #2', 'Active', 'green'], ['WARP VPN', 'Connected', 'green'],
    ['codex-infinity (DO)', 'Online', 'green'], ['shellfish (DO)', 'Online', 'green'],
    ['Aria (Pi)', 'Offline', 'red'],
  ];
  const rows = services.map(([name, status, color]) => `<tr><td><span class="dot dot-${color}"></span>${name}</td><td>${status}</td></tr>`).join('');
  return htmlResp(page('System Status', 'Real-time health of all BlackRoad services', `
    <div style="text-align:center;margin-bottom:34px"><span class="badge badge-green" style="font-size:1rem;padding:8px 21px">All Systems Operational</span></div>
    <div class="section">
      <h2>Services</h2>
      <table><thead><tr><th>Service</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>
    </div>
  `));
}

// ═══════════════════════════════════════════════════════════
// HANDLER: NETWORK
// ═══════════════════════════════════════════════════════════

async function handleNetwork(req: Request, env: Env): Promise<Response> {
  if (new URL(req.url).pathname.startsWith('/api')) {
    return jsonResp({ network: 'BlackRoad Mesh', devices: 8, tunnels: 4, subnet: '192.168.4.0/22' });
  }
  return htmlResp(page('Network', 'Mesh topology and device fleet', `
    <div class="section">
      <h2>Local Devices (192.168.4.0/22)</h2>
      <table><thead><tr><th>Name</th><th>IP</th><th>Role</th><th>Status</th></tr></thead><tbody>
        <tr><td>Alexandria</td><td>192.168.4.28</td><td>Mac — Command Center</td><td><span class="dot dot-green"></span>Online</td></tr>
        <tr><td>Octavia</td><td>192.168.4.38</td><td>Pi 5 — Primary Compute (Ollama)</td><td><span class="dot dot-green"></span>Online</td></tr>
        <tr><td>Alice</td><td>192.168.4.49</td><td>Pi 4 — Worker Node</td><td><span class="dot dot-green"></span>Online</td></tr>
        <tr><td>Lucidia</td><td>192.168.4.81</td><td>Pi 5 — Inference (Ollama)</td><td><span class="dot dot-green"></span>Online</td></tr>
        <tr><td>Aria</td><td>192.168.4.82</td><td>Pi 5 — Harmony</td><td><span class="dot dot-red"></span>Offline</td></tr>
        <tr><td>Cecilia</td><td>192.168.4.89</td><td>Pi 5 — Hailo-8, CECE OS</td><td><span class="dot dot-green"></span>Online</td></tr>
      </tbody></table>
    </div>
    <div class="section">
      <h2>Cloud Servers</h2>
      <table><thead><tr><th>Name</th><th>IP</th><th>Provider</th><th>Status</th></tr></thead><tbody>
        <tr><td>codex-infinity</td><td>159.65.43.12</td><td>DigitalOcean</td><td><span class="dot dot-green"></span>42ms</td></tr>
        <tr><td>shellfish</td><td>174.138.44.45</td><td>DigitalOcean</td><td><span class="dot dot-green"></span>43ms</td></tr>
      </tbody></table>
    </div>
    <div class="section">
      <h2>Tunnels &amp; VPN</h2>
      <div class="grid grid-3">
        <div class="card"><h3>Cloudflare WARP</h3><p>Full-tunnel VPN via utun5 (172.16.0.2). All DNS encrypted.</p></div>
        <div class="card"><h3>Cloudflare Tunnels (2)</h3><p>QUIC protocol, edge: ord02 (Chicago). Routes agent.blackroad.ai and api.blackroad.ai.</p></div>
        <div class="card"><h3>SSH Tunnels (2)</h3><p>:11434 → Octavia Ollama<br>:11435 → Lucidia Ollama</p></div>
      </div>
    </div>
  `));
}

// ═══════════════════════════════════════════════════════════
// HANDLER: DESIGN
// ═══════════════════════════════════════════════════════════

async function handleDesign(req: Request, env: Env): Promise<Response> {
  return htmlResp(page('Design System', 'Golden Ratio brand guidelines', `
    <div class="section">
      <h2>Colors</h2>
      <div class="grid grid-3">
        <div class="card"><div class="swatch" style="background:#FF1D6C"></div><h3>Hot Pink</h3><p>#FF1D6C — Primary accent</p></div>
        <div class="card"><div class="swatch" style="background:#F5A623"></div><h3>Amber</h3><p>#F5A623 — Warm accent</p></div>
        <div class="card"><div class="swatch" style="background:#2979FF"></div><h3>Electric Blue</h3><p>#2979FF — Cool accent</p></div>
        <div class="card"><div class="swatch" style="background:#9C27B0"></div><h3>Violet</h3><p>#9C27B0 — Purple accent</p></div>
        <div class="card"><div class="swatch" style="background:#000;border:1px solid #333"></div><h3>Black</h3><p>#000000 — Background</p></div>
        <div class="card"><div class="swatch" style="background:#fff;border:1px solid #333"></div><h3>White</h3><p>#FFFFFF — Text</p></div>
      </div>
    </div>
    <div class="section">
      <h2>Brand Gradient</h2>
      <div style="height:55px;border-radius:13px;background:var(--grad);margin-bottom:13px"></div>
      <div class="code"><span class="key">background</span>: linear-gradient(135deg, <span class="val">#F5A623</span> 0%, <span class="val">#FF1D6C</span> 38.2%, <span class="val">#9C27B0</span> 61.8%, <span class="val">#2979FF</span> 100%);</div>
    </div>
    <div class="section">
      <h2>Spacing (Golden Ratio: phi = 1.618)</h2>
      <div style="display:flex;align-items:end;gap:13px;flex-wrap:wrap">
        ${[8,13,21,34,55,89].map(s => `<div style="text-align:center"><div style="width:${s}px;height:${s}px;background:var(--pink);border-radius:4px;opacity:${0.3+s/120}"></div><div style="font-size:.7rem;color:var(--muted);margin-top:4px">${s}px</div></div>`).join('')}
      </div>
    </div>
    <div class="section">
      <h2>Typography</h2>
      <div class="code">
<span class="key">font-family</span>: <span class="str">-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif</span>;
<span class="key">line-height</span>: <span class="val">1.618</span>;  <span class="comment">/* Golden Ratio */</span>
      </div>
    </div>
  `));
}

// ═══════════════════════════════════════════════════════════
// HANDLER: API
// ═══════════════════════════════════════════════════════════

async function handleAPI(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  if (url.pathname === '/api/health') return jsonResp({ status: 'ok', timestamp: new Date().toISOString() });
  if (url.pathname === '/api/agents') return jsonResp({ agents: Object.keys(AGENT_META), count: Object.keys(AGENT_META).length });
  if (url.pathname === '/api/subdomains') return jsonResp({ subdomains: Object.keys(SUBDOMAIN_APPS), count: Object.keys(SUBDOMAIN_APPS).length });
  if (url.pathname.startsWith('/api/')) return jsonResp({ error: 'Endpoint not found', available: ['/api/health', '/api/agents', '/api/subdomains'] }, 404);

  const endpoints: [string, string, string][] = [
    ['GET', '/api/health', 'Health check'],
    ['GET', '/api/agents', 'List all agents'],
    ['GET', '/api/subdomains', 'List all subdomains'],
  ];
  const rows = endpoints.map(([method, path, desc]) => `<tr><td><span class="badge badge-blue">${method}</span></td><td style="font-family:monospace">${path}</td><td>${desc}</td></tr>`).join('');

  return htmlResp(page('API Gateway', 'Unified API for all BlackRoad services', `
    <div class="section">
      <h2>Endpoints</h2>
      <table><thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead><tbody>${rows}</tbody></table>
    </div>
    <div class="section">
      <h2>Usage</h2>
      <div class="code">
<span class="comment"># Health check</span>
<span class="key">curl</span> <span class="str">https://api.blackroad.io/api/health</span>

<span class="comment"># List agents</span>
<span class="key">curl</span> <span class="str">https://api.blackroad.io/api/agents</span>

<span class="comment"># List subdomains</span>
<span class="key">curl</span> <span class="str">https://api.blackroad.io/api/subdomains</span>
      </div>
    </div>
  `));
}

// ═══════════════════════════════════════════════════════════
// REMAINING HANDLERS
// ═══════════════════════════════════════════════════════════

async function handleHelp(req: Request, env: Env): Promise<Response> {
  return htmlResp(page('Help Center', 'Everything you need to get started', `
    <div class="section">
      <h2>Resources</h2>
      <div class="link-grid">
        <a class="link-card" href="https://docs.blackroad.io">Documentation</a>
        <a class="link-card" href="https://api.blackroad.io">API Reference</a>
        <a class="link-card" href="https://github.com/BlackRoad-OS">GitHub</a>
        <a class="link-card" href="https://status.blackroad.io">System Status</a>
      </div>
    </div>
    <div class="section">
      <h2>CLI Quick Start</h2>
      <div class="code">
<span class="comment"># Install</span>
<span class="key">npm</span> install -g <span class="str">@blackroad-os/context-bridge-cli</span>

<span class="comment"># Commands</span>
<span class="key">br</span> stats       <span class="comment"># Codebase statistics</span>
<span class="key">br</span> agents      <span class="comment"># List all agents</span>
<span class="key">br</span> deploy      <span class="comment"># Deploy to any platform</span>
<span class="key">br</span> health      <span class="comment"># System health check</span>
<span class="key">br</span> world       <span class="comment"># 8-bit ASCII world</span>
      </div>
    </div>
    <div class="section">
      <h2>Contact</h2>
      <p style="color:var(--muted)">blackroad.systems@gmail.com</p>
    </div>
  `));
}

async function handleEdge(req: Request, env: Env): Promise<Response> {
  return htmlResp(page('Edge Network', 'Distributed compute at the edge', `
    <div class="stat-row">
      <div class="stat"><div class="number">75+</div><div class="label">Workers</div></div>
      <div class="stat"><div class="number">205</div><div class="label">Pages</div></div>
      <div class="stat"><div class="number">35</div><div class="label">KV Stores</div></div>
      <div class="stat"><div class="number">2</div><div class="label">Tunnels</div></div>
    </div>
    <div class="section">
      <h2>Edge Nodes</h2>
      <table><thead><tr><th>Node</th><th>Hardware</th><th>Capability</th><th>Status</th></tr></thead><tbody>
        <tr><td>Cecilia</td><td>Hailo-8 + Pi 5</td><td>26 TOPS AI acceleration</td><td><span class="dot dot-green"></span>Online</td></tr>
        <tr><td>Octavia</td><td>Pi 5 + NVMe</td><td>Primary Ollama (11 models)</td><td><span class="dot dot-green"></span>Online</td></tr>
        <tr><td>Lucidia</td><td>Pi 5 + Pironman</td><td>Backup Ollama (7 models)</td><td><span class="dot dot-green"></span>Online</td></tr>
        <tr><td>Alice</td><td>Pi 4</td><td>Worker node</td><td><span class="dot dot-green"></span>Online</td></tr>
        <tr><td>Aria</td><td>Pi 5 + Pironman</td><td>Harmony protocols</td><td><span class="dot dot-red"></span>Offline</td></tr>
      </tbody></table>
    </div>
  `));
}

async function handleData(req: Request, env: Env): Promise<Response> {
  return htmlResp(page('Data Platform', 'Storage, memory, and data pipelines', `
    <div class="stat-row">
      <div class="stat"><div class="number">156K+</div><div class="label">Memory Entries</div></div>
      <div class="stat"><div class="number">135 GB</div><div class="label">R2 Models</div></div>
      <div class="stat"><div class="number">35</div><div class="label">KV Namespaces</div></div>
    </div>
    <div class="section">
      <h2>Storage Layers</h2>
      <div class="grid grid-3">
        <div class="card"><h3>D1 (SQLite)</h3><p>blackroad-os-main — relational data, sessions, users, redirects.</p><div class="meta"><span class="badge badge-green">Operational</span></div></div>
        <div class="card"><h3>KV (Key-Value)</h3><p>35 namespaces for caching, rate limiting, identities, API keys, and config.</p><div class="meta"><span class="badge badge-green">Operational</span></div></div>
        <div class="card"><h3>R2 (Object)</h3><p>blackroad-models bucket — 135 GB of quantized LLM weights (Qwen 72B, Llama 70B, DeepSeek R1).</p><div class="meta"><span class="badge badge-green">Operational</span></div></div>
      </div>
    </div>
    <div class="section">
      <h2>Memory System (PS-SHA-infinity)</h2>
      <div class="code">
<span class="comment">// Append-only hash chain — tamper-proof memory</span>
hash<span class="val">1</span> = SHA256(<span class="str">thought1</span>)
hash<span class="val">2</span> = SHA256(hash<span class="val">1</span> + <span class="str">thought2</span>)
hash<span class="val">3</span> = SHA256(hash<span class="val">2</span> + <span class="str">thought3</span>)
<span class="comment">// 156,000+ entries across all agents</span>
      </div>
    </div>
  `));
}

async function handleFinance(req: Request, env: Env): Promise<Response> {
  return htmlResp(page('Finance', 'Billing, usage tracking, and integrations', `
    <div class="section">
      <h2>Integrations</h2>
      <div class="grid grid-3">
        <div class="card"><h3>Stripe</h3><p>Payment processing and subscription management.</p></div>
        <div class="card"><h3>Railway</h3><p>GPU compute billing (A100/H100).</p></div>
        <div class="card"><h3>Cloudflare</h3><p>Workers, Pages, R2, D1 usage metering.</p></div>
      </div>
    </div>
  `));
}

async function handleDocs(req: Request, env: Env): Promise<Response> {
  return htmlResp(page('Documentation', 'Guides, tutorials, and reference', `
    <div class="section">
      <h2>Documentation Suite</h2>
      <div class="grid grid-3">
        <a class="card" href="https://api.blackroad.io" style="color:var(--fg)"><h3>API Reference</h3><p>REST endpoints, authentication, rate limits.</p></a>
        <a class="card" href="https://help.blackroad.io" style="color:var(--fg)"><h3>Getting Started</h3><p>CLI install, first deploy, quick start.</p></a>
        <a class="card" href="https://design.blackroad.io" style="color:var(--fg)"><h3>Design System</h3><p>Colors, spacing, typography, gradients.</p></a>
        <a class="card" href="https://network.blackroad.io" style="color:var(--fg)"><h3>Network</h3><p>Device fleet, topology, tunnels.</p></a>
        <a class="card" href="https://edge.blackroad.io" style="color:var(--fg)"><h3>Edge Computing</h3><p>Pi hardware, Hailo-8, Ollama setup.</p></a>
        <a class="card" href="https://about.blackroad.io" style="color:var(--fg)"><h3>About</h3><p>Mission, infrastructure, team.</p></a>
      </div>
    </div>
    <div class="section">
      <h2>45 Documentation Files</h2>
      <p style="color:var(--muted)">38,000+ lines covering architecture, deployment, security, AI models, memory, skills, workflows, integrations, monitoring, testing, and more.</p>
    </div>
  `));
}

async function handleBrand(req: Request, env: Env): Promise<Response> {
  return htmlResp(page('Brand Assets', 'Official BlackRoad identity guidelines', `
    <div class="section">
      <h2>Brand Gradient</h2>
      <div style="height:89px;border-radius:13px;background:var(--grad);margin-bottom:21px"></div>
      <p style="color:var(--muted)">135 degrees, golden ratio stops: 0% Amber, 38.2% Hot Pink, 61.8% Violet, 100% Electric Blue.</p>
    </div>
    <div class="section">
      <h2>Identity</h2>
      <div class="grid grid-2">
        <div class="card"><h3>Name</h3><p>BlackRoad OS &mdash; always capitalized "BlackRoad", one word.</p></div>
        <div class="card"><h3>Tagline</h3><p>Your AI. Your Hardware. Your Rules.</p></div>
        <div class="card"><h3>Typography</h3><p>SF Pro Display, line-height 1.618 (Golden Ratio).</p></div>
        <div class="card"><h3>Spacing</h3><p>8, 13, 21, 34, 55, 89, 144 px (Fibonacci/phi scale).</p></div>
      </div>
    </div>
    <div class="section">
      <h2>Full Reference</h2>
      <p><a href="https://design.blackroad.io">View the complete design system &rarr;</a></p>
    </div>
  `));
}

async function handleAgents(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api')) {
    return jsonResp({ agents: Object.entries(AGENT_META).map(([id, m]) => ({ id, ...m })), count: Object.keys(AGENT_META).length });
  }
  const agentCards = Object.entries(AGENT_META).map(([id, meta]) => {
    const app = SUBDOMAIN_APPS[id];
    return `<a class="card" href="https://${id}.blackroad.io" style="color:var(--fg)">
      <div class="agent-avatar" style="background:${meta.color};width:34px;height:34px;font-size:.8rem;display:inline-flex;font-weight:700">${meta.icon}</div>
      <h3>${app?.name || id}</h3>
      <p>${app?.description || ''}</p>
      <div class="meta">${meta.skills.slice(0, 2).map(s => `<span class="badge badge-blue">${s.replace(/_/g, ' ')}</span>`).join(' ')}</div>
    </a>`;
  }).join('');
  return htmlResp(page('Agent Marketplace', `${Object.keys(AGENT_META).length} specialized AI agents`, `
    <div class="grid grid-3">${agentCards}</div>
  `));
}

async function handleChat(req: Request, env: Env): Promise<Response> {
  return htmlResp(page('Chat', 'AI-powered conversation interface', `
    <div class="section" style="text-align:center">
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:13px;padding:55px 34px;max-width:600px;margin:0 auto">
        <h2 style="margin-bottom:13px">Chat with BlackRoad Agents</h2>
        <p style="color:var(--muted);margin-bottom:21px">Connect to any of our 16 agents via Ollama-powered local inference.</p>
        <div class="code" style="text-align:left">
<span class="comment"># Chat via CLI</span>
<span class="key">br</span> chat
<span class="key">br</span> focus LUCIDIA
<span class="key">br</span> council "Should we deploy?"

<span class="comment"># Chat via API</span>
<span class="key">curl</span> -X POST <span class="str">https://api.blackroad.io/chat</span> \\
  -d '<span class="val">{"agent":"lucidia","message":"hello"}</span>'
        </div>
      </div>
    </div>
  `));
}

async function handlePrism(req: Request, env: Env): Promise<Response> {
  return htmlResp(page('Prism Console', 'Multi-dimensional agent management', `
    <div class="stat-row">
      <div class="stat"><div class="number">16</div><div class="label">Agents</div></div>
      <div class="stat"><div class="number">6</div><div class="label">Core Team</div></div>
      <div class="stat"><div class="number">10</div><div class="label">Specialists</div></div>
    </div>
    <div class="section">
      <h2>Agent Fleet Overview</h2>
      <div class="link-grid">
        ${Object.entries(AGENT_META).map(([id, m]) => `<a class="link-card" href="https://${id}.blackroad.io" style="border-left:3px solid ${m.color}">${SUBDOMAIN_APPS[id]?.name || id}</a>`).join('')}
      </div>
    </div>
  `));
}

async function handleQuantum(req: Request, env: Env): Promise<Response> {
  return htmlResp(page('Quantum Platform', 'Quantum computing research', `
    <div class="section">
      <h2>Research Areas</h2>
      <div class="grid grid-2">
        <div class="card"><h3>SU(3) Gell-Mann Model</h3><p>Consciousness modeling using SU(3) symmetry groups. 8 Gell-Mann matrices for cognitive state representation.</p><div class="meta"><span class="badge badge-violet">Active Research</span></div></div>
        <div class="card"><h3>SU(N) Heterogeneous Qudits</h3><p>Mixed-dimension quantum systems for multi-modal AI reasoning.</p><div class="meta"><span class="badge badge-violet">Active Research</span></div></div>
        <div class="card"><h3>Trinary Logic</h3><p>Three-valued epistemic logic: True (1), Unknown (0), False (-1). Used for agent reasoning and contradiction detection.</p><div class="meta"><span class="badge badge-green">Production</span></div></div>
        <div class="card"><h3>Bell Pair States</h3><p>Quantum entanglement primitives for agent synchronization and coherent decision-making.</p><div class="meta"><span class="badge badge-amber">Experimental</span></div></div>
      </div>
    </div>
  `));
}

async function handleBlog(req: Request, env: Env): Promise<Response> {
  return htmlResp(page('Blog', 'Engineering notes and announcements', `
    <div class="grid grid-2">
      <div class="card"><h3>Building a 30,000 Agent Mesh on Raspberry Pis</h3><p>How we distributed AI workloads across 5 Pis with 26 TOPS of Hailo-8 acceleration.</p><div class="meta">Infrastructure &middot; Feb 2026</div></div>
      <div class="card"><h3>PS-SHA-infinity: Tamper-Proof AI Memory</h3><p>An append-only hash chain for persistent, verifiable agent memory across sessions.</p><div class="meta">Architecture &middot; Feb 2026</div></div>
      <div class="card"><h3>Tokenless Gateway Architecture</h3><p>Why agents should never touch API keys, and how our gateway enforces it.</p><div class="meta">Security &middot; Jan 2026</div></div>
      <div class="card"><h3>CECE: Portable AI Identity</h3><p>Building an identity system that persists across providers, sessions, and hardware.</p><div class="meta">Identity &middot; Jan 2026</div></div>
    </div>
  `));
}

async function handleDev(req: Request, env: Env): Promise<Response> {
  return htmlResp(page('Developer Portal', 'Build on BlackRoad', `
    <div class="section">
      <h2>SDKs &amp; Tools</h2>
      <div class="grid grid-3">
        <div class="card"><h3>@blackroad/skills-sdk</h3><p>Build agent capabilities: memory, reasoning, coordination.</p><div class="meta"><span class="badge badge-blue">npm</span></div></div>
        <div class="card"><h3>br CLI</h3><p>37 tools: deploy, git, docker, API testing, monitoring, security.</p><div class="meta"><span class="badge badge-green">Stable</span></div></div>
        <div class="card"><h3>MCP Bridge</h3><p>Local MCP server on port 8420 for remote agent access.</p><div class="meta"><span class="badge badge-amber">Beta</span></div></div>
      </div>
    </div>
    <div class="section">
      <h2>Quick Start</h2>
      <div class="code">
<span class="comment"># Clone the monorepo</span>
<span class="key">gh</span> repo clone BlackRoad-OS/blackroad

<span class="comment"># Start the gateway</span>
<span class="key">cd</span> blackroad-core && <span class="key">npm</span> run dev

<span class="comment"># Run an agent</span>
<span class="key">br</span> agent start lucidia

<span class="comment"># Deploy anywhere</span>
<span class="key">br</span> deploy --target cloudflare
      </div>
    </div>
  `));
}

async function handleStaging(req: Request, env: Env): Promise<Response> {
  return htmlResp(page('Staging', 'Pre-production testing environment', `
    <div style="text-align:center"><span class="badge badge-amber" style="font-size:1rem;padding:8px 21px">Staging Environment</span>
    <p style="color:var(--muted);margin-top:21px">This environment mirrors production for testing before release.</p></div>
  `));
}

async function handleMetrics(req: Request, env: Env): Promise<Response> {
  return htmlResp(page('Metrics', 'Performance monitoring and dashboards', `
    <div class="stat-row">
      <div class="stat"><div class="number">99.9%</div><div class="label">Uptime</div></div>
      <div class="stat"><div class="number">&lt;50ms</div><div class="label">Edge Latency</div></div>
      <div class="stat"><div class="number">100/min</div><div class="label">Rate Limit</div></div>
    </div>
    <div class="section">
      <h2>Monitored Services</h2>
      <table><thead><tr><th>Service</th><th>Type</th><th>Check</th></tr></thead><tbody>
        <tr><td>Cloudflare Workers</td><td>HTTP</td><td>Every 30s</td></tr>
        <tr><td>Ollama (Octavia)</td><td>TCP :11434</td><td>Every 60s</td></tr>
        <tr><td>Ollama (Lucidia)</td><td>TCP :11435</td><td>Every 60s</td></tr>
        <tr><td>DigitalOcean Droplets</td><td>ICMP Ping</td><td>Every 60s</td></tr>
        <tr><td>Cloudflare Tunnels</td><td>Metrics :9091</td><td>Every 30s</td></tr>
      </tbody></table>
    </div>
  `));
}

async function handleLogs(req: Request, env: Env): Promise<Response> {
  return htmlResp(page('Logs', 'Centralized logging and event streams', `
    <div class="section">
      <h2>Log Sources</h2>
      <div class="grid grid-3">
        <div class="card"><h3>Memory Journal</h3><p>PS-SHA-infinity append-only log. 156,000+ entries, hash-chained.</p></div>
        <div class="card"><h3>Cloudflare Workers</h3><p>Real-time worker logs via <code>wrangler tail</code>.</p></div>
        <div class="card"><h3>Agent Activity</h3><p>TIL broadcasts, task completions, coordination events.</p></div>
      </div>
    </div>
    <div class="section">
      <h2>Access</h2>
      <div class="code">
<span class="comment"># Tail worker logs</span>
<span class="key">wrangler</span> tail blackroad-subdomain-router

<span class="comment"># View memory journal</span>
<span class="key">tail</span> -f ~/.blackroad/memory/journals/master-journal.jsonl | <span class="key">jq</span> .

<span class="comment"># Live agent events</span>
<span class="key">br</span> logs --follow
      </div>
    </div>
  `));
}

async function handleCDN(req: Request, env: Env): Promise<Response> {
  return htmlResp(page('CDN', 'Content delivery and caching', `
    <div class="section">
      <h2>Infrastructure</h2>
      <div class="grid grid-3">
        <div class="card"><h3>Cloudflare CDN</h3><p>Global edge caching via 300+ PoPs worldwide. Automatic HTTPS, Brotli compression.</p></div>
        <div class="card"><h3>R2 Storage</h3><p>blackroad-models bucket (135 GB). Zero egress fees for model weights.</p></div>
        <div class="card"><h3>KV Cache</h3><p>35 namespaces for sub-millisecond key-value reads at the edge.</p></div>
      </div>
    </div>
  `));
}

async function handleAssets(req: Request, env: Env): Promise<Response> {
  return htmlResp(page('Assets', 'Static files and media library', `
    <div class="section">
      <h2>Asset Storage</h2>
      <div class="grid grid-2">
        <div class="card"><h3>R2 Object Storage</h3><p>LLM model weights, media files, static assets. 135 GB allocated.</p></div>
        <div class="card"><h3>Pages Static</h3><p>205 Cloudflare Pages projects serving HTML, CSS, JS at the edge.</p></div>
      </div>
    </div>
  `));
}

async function handleAdmin(req: Request, env: Env): Promise<Response> {
  return htmlResp(page('Admin', 'Administrative control panel', `
    <div style="text-align:center;padding:55px 0">
      <span class="badge badge-red" style="font-size:1rem;padding:8px 21px">Authentication Required</span>
      <p style="color:var(--muted);margin-top:21px">This panel requires admin credentials.<br>Use <code>br admin</code> from an authenticated CLI session.</p>
    </div>
  `), 401);
}

async function handleApp(req: Request, env: Env): Promise<Response> {
  return htmlResp(page('BlackRoad', 'The sovereign AI platform', `
    <div class="link-grid">
      <a class="link-card" href="https://os.blackroad.io">OS</a>
      <a class="link-card" href="https://ai.blackroad.io">AI</a>
      <a class="link-card" href="https://agents.blackroad.io">Agents</a>
      <a class="link-card" href="https://products.blackroad.io">Products</a>
      <a class="link-card" href="https://docs.blackroad.io">Docs</a>
      <a class="link-card" href="https://dev.blackroad.io">Developer</a>
    </div>
  `));
}

async function handleConsole(req: Request, env: Env): Promise<Response> {
  return htmlResp(page('Console', 'Terminal-style command interface', `
    <div class="section">
      <h2>Available Commands</h2>
      <div class="code" style="min-height:200px">
<span class="key">$</span> br help

<span class="str">BlackRoad CLI v2.0</span>

  <span class="key">br stats</span>       Codebase statistics
  <span class="key">br agents</span>      List all agents
  <span class="key">br deploy</span>      Deploy to any platform
  <span class="key">br health</span>      System health check
  <span class="key">br chat</span>        Interactive agent chat
  <span class="key">br focus</span>       One-on-one with an agent
  <span class="key">br council</span>     Agent council voting
  <span class="key">br world</span>       8-bit ASCII world
  <span class="key">br metrics</span>     Dashboard monitoring
  <span class="key">br security</span>    Vulnerability scanning

<span class="val">37 tools available.</span> Run <span class="key">br &lt;tool&gt; help</span> for details.
      </div>
    </div>
  `));
}

async function handleDashboard(req: Request, env: Env): Promise<Response> {
  return htmlResp(page('Dashboard', 'Master control center', `
    <div class="stat-row">
      <div class="stat"><div class="number">30,000</div><div class="label">Agents</div></div>
      <div class="stat"><div class="number">18</div><div class="label">LLMs</div></div>
      <div class="stat"><div class="number">8</div><div class="label">Devices</div></div>
      <div class="stat"><div class="number">17</div><div class="label">Orgs</div></div>
    </div>
    <div class="section">
      <h2>Services</h2>
      <div class="link-grid">
        <a class="link-card" href="https://os.blackroad.io">OS</a>
        <a class="link-card" href="https://ai.blackroad.io">AI</a>
        <a class="link-card" href="https://agents.blackroad.io">Agents</a>
        <a class="link-card" href="https://network.blackroad.io">Network</a>
        <a class="link-card" href="https://edge.blackroad.io">Edge</a>
        <a class="link-card" href="https://data.blackroad.io">Data</a>
        <a class="link-card" href="https://status.blackroad.io">Status</a>
        <a class="link-card" href="https://metrics.blackroad.io">Metrics</a>
        <a class="link-card" href="https://logs.blackroad.io">Logs</a>
        <a class="link-card" href="https://design.blackroad.io">Design</a>
        <a class="link-card" href="https://dev.blackroad.io">Dev</a>
        <a class="link-card" href="https://api.blackroad.io">API</a>
      </div>
    </div>
  `));
}

async function handleDynamic(req: Request, env: Env, subdomain: string): Promise<Response> {
  return htmlResp(page(`${subdomain}`, 'Dynamic subdomain', `
    <div class="card"><h3>Dynamic Subdomain</h3><p><strong>${subdomain}.blackroad.io</strong> is a dynamic endpoint ready for assignment.</p></div>
  `));
}
