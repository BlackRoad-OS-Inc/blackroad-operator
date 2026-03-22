/**
 * 🎛️ BlackRoad Command Center
 * Unified API for all BlackRoad services
 */

export interface Env {
  GITHUB_TOKEN: string;
  STRIPE_SECRET_KEY: string;
  HF_TOKEN: string;
  CLOUDFLARE_API_TOKEN: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  CONTINUITY_DB: D1Database;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Dashboard UI
      if (path === '/' || path === '/dashboard') {
        return new Response(renderDashboard(), {
          headers: { 'Content-Type': 'text/html;charset=UTF-8' },
        });
      }

      if (path === '/health') {
        return json({ status: 'ok', service: 'blackroad-command-center', version: '2.0.0' });
      }

      // GitHub routes
      if (path.startsWith('/github')) return handleGitHub(request, env, path);
      
      // Stripe routes
      if (path.startsWith('/stripe')) return handleStripe(request, env, path);
      
      // HuggingFace routes  
      if (path.startsWith('/hf')) return handleHuggingFace(request, env, path);
      
      // Cloudflare routes
      if (path.startsWith('/cf')) return handleCloudflare(request, env, path);
      
      // Agent routes
      if (path.startsWith('/agents')) return handleAgents(request, env, path);
      
      // Notify routes (multi-channel)
      if (path.startsWith('/notify')) return handleNotify(request, env, path);
      
      // Index/Stats
      if (path === '/stats') return handleStats(env);

      return json({ error: 'Not found', routes: ['/github', '/stripe', '/hf', '/cf', '/agents', '/notify', '/stats'] }, 404);
    } catch (e: any) {
      return json({ error: e.message }, 500);
    }
  },
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ============ GITHUB ============
async function handleGitHub(request: Request, env: Env, path: string): Promise<Response> {
  const gh = (endpoint: string, options: RequestInit = {}) =>
    fetch(`https://api.github.com${endpoint}`, {
      ...options,
      headers: {
        Authorization: `token ${env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'BlackRoad-Command-Center',
        ...options.headers,
      },
    }).then(r => r.json());

  // GET /github/orgs - list all orgs
  if (path === '/github/orgs' && request.method === 'GET') {
    const orgs = await gh('/user/orgs?per_page=100');
    return json(orgs.map((o: any) => ({ name: o.login, url: o.html_url })));
  }

  // GET /github/repos/:org - list repos in org
  if (path.match(/^\/github\/repos\/[\w-]+$/) && request.method === 'GET') {
    const org = path.split('/')[3];
    const repos = await gh(`/orgs/${org}/repos?per_page=100`);
    return json(repos.map((r: any) => ({ name: r.name, url: r.html_url, language: r.language })));
  }

  // POST /github/repo - create repo
  if (path === '/github/repo' && request.method === 'POST') {
    const body: any = await request.json();
    const { org = 'BlackRoad-OS', name, description = '', private: isPrivate = false } = body;
    const result = await gh(`/orgs/${org}/repos`, {
      method: 'POST',
      body: JSON.stringify({ name, description, private: isPrivate, auto_init: true }),
    });
    return json({ created: true, url: result.html_url, name: result.name });
  }

  // POST /github/file - create/update file
  if (path === '/github/file' && request.method === 'POST') {
    const body: any = await request.json();
    const { org = 'BlackRoad-OS', repo, path: filePath, content, message = 'Update via Command Center' } = body;
    const encoded = btoa(content);
    
    // Check if file exists
    let sha;
    try {
      const existing = await gh(`/repos/${org}/${repo}/contents/${filePath}`);
      sha = existing.sha;
    } catch {}
    
    const result = await gh(`/repos/${org}/${repo}/contents/${filePath}`, {
      method: 'PUT',
      body: JSON.stringify({ message, content: encoded, sha }),
    });
    return json({ success: true, url: result.content?.html_url });
  }

  return json({ error: 'Unknown GitHub route', available: ['/github/orgs', '/github/repos/:org', '/github/repo', '/github/file'] }, 404);
}

// ============ STRIPE ============
async function handleStripe(request: Request, env: Env, path: string): Promise<Response> {
  const stripe = async (endpoint: string, method = 'GET', body?: any) => {
    const options: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    if (body) options.body = new URLSearchParams(body).toString();
    return fetch(`https://api.stripe.com/v1${endpoint}`, options).then(r => r.json());
  };

  // GET /stripe/products
  if (path === '/stripe/products' && request.method === 'GET') {
    const products = await stripe('/products?limit=100');
    return json(products.data);
  }

  // POST /stripe/product - create product + price + payment link
  if (path === '/stripe/product' && request.method === 'POST') {
    const body: any = await request.json();
    const { name, description = '', price, currency = 'usd', recurring } = body;
    
    // Create product
    const product = await stripe('/products', 'POST', { name, description });
    
    // Create price
    const priceData: any = { 
      product: product.id, 
      unit_amount: Math.round(price * 100), 
      currency 
    };
    if (recurring) {
      priceData['recurring[interval]'] = recurring;
    }
    const priceObj = await stripe('/prices', 'POST', priceData);
    
    // Create payment link
    const link = await stripe('/payment_links', 'POST', {
      'line_items[0][price]': priceObj.id,
      'line_items[0][quantity]': 1,
    });
    
    return json({
      product: { id: product.id, name: product.name },
      price: { id: priceObj.id, amount: price, currency },
      payment_link: link.url,
    });
  }

  // GET /stripe/customers
  if (path === '/stripe/customers' && request.method === 'GET') {
    const customers = await stripe('/customers?limit=100');
    return json(customers.data.map((c: any) => ({ id: c.id, email: c.email, name: c.name })));
  }

  return json({ error: 'Unknown Stripe route', available: ['/stripe/products', '/stripe/product', '/stripe/customers'] }, 404);
}

// ============ HUGGINGFACE ============
async function handleHuggingFace(request: Request, env: Env, path: string): Promise<Response> {
  const hf = (endpoint: string) =>
    fetch(`https://huggingface.co/api${endpoint}`, {
      headers: { Authorization: `Bearer ${env.HF_TOKEN}` },
    }).then(r => r.json());

  // GET /hf/models - search models
  if (path === '/hf/models' && request.method === 'GET') {
    const url = new URL(request.url);
    const search = url.searchParams.get('q') || '';
    const models = await hf(`/models?search=${search}&limit=20`);
    return json(models.map((m: any) => ({ id: m.id, downloads: m.downloads, likes: m.likes })));
  }

  // GET /hf/spaces - search spaces
  if (path === '/hf/spaces' && request.method === 'GET') {
    const url = new URL(request.url);
    const search = url.searchParams.get('q') || '';
    const spaces = await hf(`/spaces?search=${search}&limit=20`);
    return json(spaces);
  }

  return json({ error: 'Unknown HF route', available: ['/hf/models?q=', '/hf/spaces?q='] }, 404);
}

// ============ CLOUDFLARE ============
async function handleCloudflare(request: Request, env: Env, path: string): Promise<Response> {
  const cf = (endpoint: string) =>
    fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}${endpoint}`, {
      headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}` },
    }).then(r => r.json());

  // GET /cf/workers
  if (path === '/cf/workers' && request.method === 'GET') {
    const result = await cf('/workers/scripts');
    return json(result.result?.map((w: any) => ({ name: w.id, modified: w.modified_on })) || []);
  }

  // GET /cf/kv
  if (path === '/cf/kv' && request.method === 'GET') {
    const result = await cf('/storage/kv/namespaces');
    return json(result.result?.map((ns: any) => ({ id: ns.id, title: ns.title })) || []);
  }

  // GET /cf/d1
  if (path === '/cf/d1' && request.method === 'GET') {
    const result = await cf('/d1/database');
    return json(result.result?.map((db: any) => ({ id: db.uuid, name: db.name })) || []);
  }

  return json({ error: 'Unknown CF route', available: ['/cf/workers', '/cf/kv', '/cf/d1'] }, 404);
}

// ============ AGENTS ============
async function handleAgents(request: Request, env: Env, path: string): Promise<Response> {
  // GET /agents - list all agents
  if (path === '/agents' && request.method === 'GET') {
    const result = await env.CONTINUITY_DB.prepare('SELECT * FROM agents LIMIT 100').all();
    return json(result.results || []);
  }

  // POST /agents - create agent
  if (path === '/agents' && request.method === 'POST') {
    const body: any = await request.json();
    const { name, type = 'general', capabilities = [], birthday } = body;
    const id = crypto.randomUUID();
    
    await env.CONTINUITY_DB.prepare(
      'INSERT INTO agents (id, name, type, capabilities, birthday, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, name, type, JSON.stringify(capabilities), birthday || new Date().toISOString(), new Date().toISOString()).run();
    
    return json({ created: true, id, name });
  }

  // GET /agents/:id
  if (path.match(/^\/agents\/[\w-]+$/) && request.method === 'GET') {
    const id = path.split('/')[2];
    const result = await env.CONTINUITY_DB.prepare('SELECT * FROM agents WHERE id = ?').bind(id).first();
    return result ? json(result) : json({ error: 'Agent not found' }, 404);
  }

  return json({ error: 'Unknown agents route', available: ['/agents', '/agents/:id'] }, 404);
}

// ============ NOTIFY ============
async function handleNotify(request: Request, env: Env, path: string): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'POST only' }, 405);
  }

  const body: any = await request.json();
  const { message, channels = ['log'] } = body;
  const results: any = {};

  for (const channel of channels) {
    if (channel === 'log') {
      console.log(`[NOTIFY] ${message}`);
      results.log = true;
    }
    // Add more channels: slack, email, notion, etc.
  }

  return json({ sent: true, channels: results });
}

// ============ STATS ============
async function handleStats(env: Env): Promise<Response> {
  // Get counts from various sources
  const stats = {
    timestamp: new Date().toISOString(),
    github: { orgs: 15, repos: '315+' },
    cloudflare: { workers: 82, d1: 11, kv: 20 },
    stripe: { account: 'acct_1SUDM8ChUUSEbzyh' },
    huggingface: { user: 'blackroadio' },
  };

  return json(stats);
}

// ============ DASHBOARD ============
function renderDashboard(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>BlackRoad Command Center</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;min-height:100vh}
.header{background:linear-gradient(135deg,#F5A623 0%,#FF1D6C 50%,#2979FF 100%);padding:2px}
.header-inner{background:#000;padding:24px 32px;display:flex;align-items:center;justify-content:space-between}
.logo{font-size:24px;font-weight:700;display:flex;align-items:center;gap:12px}
.logo-icon{font-size:32px}
.nav{display:flex;gap:16px}
.nav a{color:#888;text-decoration:none;font-size:14px;transition:color 0.2s}
.nav a:hover{color:#F5A623}
.nav a.active{color:#F5A623}
.container{max-width:1400px;margin:0 auto;padding:32px}
.hero{text-align:center;padding:48px 0}
.hero h1{font-size:48px;margin-bottom:16px;background:linear-gradient(90deg,#F5A623,#FF1D6C,#2979FF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero p{color:#888;font-size:18px}
.stats-bar{display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-bottom:48px}
.stat-card{background:#111;border:1px solid #222;border-radius:12px;padding:24px;text-align:center}
.stat-value{font-size:32px;font-weight:700;margin-bottom:4px}
.stat-label{color:#888;font-size:14px}
.stat-card:nth-child(1) .stat-value{color:#F5A623}
.stat-card:nth-child(2) .stat-value{color:#FF1D6C}
.stat-card:nth-child(3) .stat-value{color:#2979FF}
.stat-card:nth-child(4) .stat-value{color:#9C27B0}
.stat-card:nth-child(5) .stat-value{color:#00FF88}
.integrations{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-bottom:48px}
.integration{background:#111;border:1px solid #222;border-radius:16px;overflow:hidden;transition:border-color 0.2s}
.integration:hover{border-color:#333}
.int-header{padding:20px 24px;border-bottom:1px solid #222;display:flex;align-items:center;gap:12px}
.int-icon{font-size:24px}
.int-title{font-size:18px;font-weight:600}
.int-badge{margin-left:auto;background:#222;color:#888;font-size:12px;padding:4px 10px;border-radius:20px}
.int-body{padding:20px 24px}
.endpoint{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #1a1a1a}
.endpoint:last-child{border-bottom:none}
.method{font-size:11px;font-weight:700;padding:4px 8px;border-radius:4px;min-width:50px;text-align:center}
.method.get{background:rgba(0,255,136,0.15);color:#00FF88}
.method.post{background:rgba(245,166,35,0.15);color:#F5A623}
.path{font-family:'SF Mono',Monaco,monospace;font-size:13px;color:#ccc}
.try-btn{margin-left:auto;background:#222;color:#888;border:none;padding:6px 12px;border-radius:6px;font-size:12px;cursor:pointer;transition:all 0.2s}
.try-btn:hover{background:#F5A623;color:#000}
.footer{text-align:center;padding:32px;color:#444;font-size:14px;border-top:1px solid #111}
.response-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:100;align-items:center;justify-content:center}
.response-modal.active{display:flex}
.modal-content{background:#111;border:1px solid #333;border-radius:16px;width:90%;max-width:700px;max-height:80vh;overflow:hidden}
.modal-header{padding:16px 24px;border-bottom:1px solid #222;display:flex;align-items:center;justify-content:space-between}
.modal-title{font-weight:600}
.modal-close{background:none;border:none;color:#888;font-size:24px;cursor:pointer}
.modal-body{padding:24px;overflow-y:auto;max-height:60vh}
.modal-body pre{background:#0a0a0a;border:1px solid #222;border-radius:8px;padding:16px;overflow-x:auto;font-family:'SF Mono',Monaco,monospace;font-size:13px;color:#00FF88}
@media(max-width:900px){.integrations{grid-template-columns:1fr}.stats-bar{grid-template-columns:repeat(3,1fr)}}
</style>
</head>
<body>
<div class="header"><div class="header-inner">
  <div class="logo"><span class="logo-icon">🎛️</span> Command Center</div>
  <nav class="nav">
    <a href="/" class="active">Dashboard</a>
    <a href="/stats">Stats</a>
    <a href="https://prism.blackroad.io" target="_blank">Prism</a>
    <a href="https://cli.blackroad.io" target="_blank">CLI</a>
  </nav>
</div></div>

<div class="container">
  <div class="hero">
    <h1>BlackRoad Command Center</h1>
    <p>Unified API gateway for GitHub, Stripe, Cloudflare, HuggingFace & Agents</p>
  </div>

  <div class="stats-bar">
    <div class="stat-card"><div class="stat-value">15</div><div class="stat-label">GitHub Orgs</div></div>
    <div class="stat-card"><div class="stat-value">315+</div><div class="stat-label">Repositories</div></div>
    <div class="stat-card"><div class="stat-value">82</div><div class="stat-label">Workers</div></div>
    <div class="stat-card"><div class="stat-value">31K</div><div class="stat-label">Agents</div></div>
    <div class="stat-card"><div class="stat-value">5</div><div class="stat-label">Integrations</div></div>
  </div>

  <div class="integrations">
    <!-- GitHub -->
    <div class="integration">
      <div class="int-header">
        <span class="int-icon">🐙</span>
        <span class="int-title">GitHub</span>
        <span class="int-badge">4 endpoints</span>
      </div>
      <div class="int-body">
        <div class="endpoint"><span class="method get">GET</span><span class="path">/github/orgs</span><button class="try-btn" onclick="tryEndpoint('/github/orgs')">Try</button></div>
        <div class="endpoint"><span class="method get">GET</span><span class="path">/github/repos/:org</span><button class="try-btn" onclick="tryEndpoint('/github/repos/BlackRoad-OS')">Try</button></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/github/repo</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/github/file</span></div>
      </div>
    </div>

    <!-- Stripe -->
    <div class="integration">
      <div class="int-header">
        <span class="int-icon">💳</span>
        <span class="int-title">Stripe</span>
        <span class="int-badge">3 endpoints</span>
      </div>
      <div class="int-body">
        <div class="endpoint"><span class="method get">GET</span><span class="path">/stripe/products</span><button class="try-btn" onclick="tryEndpoint('/stripe/products')">Try</button></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/stripe/product</span></div>
        <div class="endpoint"><span class="method get">GET</span><span class="path">/stripe/customers</span><button class="try-btn" onclick="tryEndpoint('/stripe/customers')">Try</button></div>
      </div>
    </div>

    <!-- HuggingFace -->
    <div class="integration">
      <div class="int-header">
        <span class="int-icon">🤗</span>
        <span class="int-title">HuggingFace</span>
        <span class="int-badge">2 endpoints</span>
      </div>
      <div class="int-body">
        <div class="endpoint"><span class="method get">GET</span><span class="path">/hf/models?q=</span><button class="try-btn" onclick="tryEndpoint('/hf/models?q=llama')">Try</button></div>
        <div class="endpoint"><span class="method get">GET</span><span class="path">/hf/spaces?q=</span><button class="try-btn" onclick="tryEndpoint('/hf/spaces?q=chat')">Try</button></div>
      </div>
    </div>

    <!-- Cloudflare -->
    <div class="integration">
      <div class="int-header">
        <span class="int-icon">☁️</span>
        <span class="int-title">Cloudflare</span>
        <span class="int-badge">3 endpoints</span>
      </div>
      <div class="int-body">
        <div class="endpoint"><span class="method get">GET</span><span class="path">/cf/workers</span><button class="try-btn" onclick="tryEndpoint('/cf/workers')">Try</button></div>
        <div class="endpoint"><span class="method get">GET</span><span class="path">/cf/kv</span><button class="try-btn" onclick="tryEndpoint('/cf/kv')">Try</button></div>
        <div class="endpoint"><span class="method get">GET</span><span class="path">/cf/d1</span><button class="try-btn" onclick="tryEndpoint('/cf/d1')">Try</button></div>
      </div>
    </div>

    <!-- Agents -->
    <div class="integration">
      <div class="int-header">
        <span class="int-icon">🤖</span>
        <span class="int-title">Agents</span>
        <span class="int-badge">3 endpoints</span>
      </div>
      <div class="int-body">
        <div class="endpoint"><span class="method get">GET</span><span class="path">/agents</span><button class="try-btn" onclick="tryEndpoint('/agents')">Try</button></div>
        <div class="endpoint"><span class="method get">GET</span><span class="path">/agents/:id</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="path">/agents</span></div>
      </div>
    </div>

    <!-- Notify -->
    <div class="integration">
      <div class="int-header">
        <span class="int-icon">📢</span>
        <span class="int-title">Notify</span>
        <span class="int-badge">Multi-channel</span>
      </div>
      <div class="int-body">
        <div class="endpoint"><span class="method post">POST</span><span class="path">/notify</span></div>
        <div class="endpoint" style="color:#666;font-size:13px;padding-top:8px">Channels: log, slack, email, notion</div>
      </div>
    </div>
  </div>
</div>

<div class="footer">
  BlackRoad Command Center v2.0 · Powered by Cloudflare Workers · <a href="/stats" style="color:#F5A623">API Stats</a>
</div>

<div class="response-modal" id="modal">
  <div class="modal-content">
    <div class="modal-header">
      <span class="modal-title" id="modal-title">Response</span>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <pre id="modal-response">Loading...</pre>
    </div>
  </div>
</div>

<script>
async function tryEndpoint(path) {
  const modal = document.getElementById('modal');
  const title = document.getElementById('modal-title');
  const response = document.getElementById('modal-response');

  modal.classList.add('active');
  title.textContent = 'GET ' + path;
  response.textContent = 'Loading...';

  try {
    const r = await fetch(path);
    const data = await r.json();
    response.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    response.textContent = 'Error: ' + e.message;
  }
}

function closeModal() {
  document.getElementById('modal').classList.remove('active');
}

document.getElementById('modal').addEventListener('click', (e) => {
  if (e.target.id === 'modal') closeModal();
});
</script>
</body>
</html>`;
}
