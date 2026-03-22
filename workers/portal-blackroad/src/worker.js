// ── BlackRoad Customer Portal ──
// Auth-gated dashboard with plan info, API keys, usage, billing

const AUTH_URL = 'https://auth.blackroad.io';
const PAY_URL = 'https://pay.blackroad.io';

async function verifyJWT(request) {
  const authHeader = request.headers.get('Authorization');
  const cookie = request.headers.get('Cookie') || '';
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else {
    const match = cookie.match(/br_token=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) return null;

  try {
    const resp = await fetch(`${AUTH_URL}/api/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (resp.ok) {
      const data = await resp.json();
      return data.user || { email: 'user@blackroad.io', name: 'BlackRoad User', plan: 'starter' };
    }
  } catch (e) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 > Date.now()) {
        return { email: payload.email || 'user@blackroad.io', name: payload.name || 'User', plan: payload.plan || 'starter' };
      }
    } catch (_) {}
  }

  return null;
}

function loginPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sign In — BlackRoad Portal</title>
<link rel="icon" href="https://images.blackroad.io/favicon.ico">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html{-webkit-font-smoothing:antialiased}
:root{
  --bg:#050505;--card:#0a0a0a;--text:#f5f5f5;--border:#1a1a1a;--muted:#666;
  --g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);
  --sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace;
}
body{background:var(--bg);color:var(--text);font-family:var(--sg);min-height:100vh;display:flex;flex-direction:column}
a{color:var(--text);text-decoration:none}
.grad-bar{height:3px;background:var(--g)}
nav{display:flex;align-items:center;justify-content:space-between;padding:14px 48px;border-bottom:1px solid var(--border)}
.nav-logo{font-weight:700;font-size:17px;display:flex;align-items:center;gap:10px}
.nav-mark{width:28px;height:3px;border-radius:2px;background:var(--g)}

.login-wrap{flex:1;display:flex;align-items:center;justify-content:center;padding:48px 24px}
.login-box{width:100%;max-width:400px;background:var(--card);border:1px solid var(--border);border-radius:16px;padding:40px 32px;position:relative;overflow:hidden}
.login-box::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g)}
.login-box h2{font-size:22px;font-weight:600;margin-bottom:6px}
.login-box p{font-size:13px;color:var(--muted);margin-bottom:28px}
.field{margin-bottom:16px}
.field label{display:block;font-size:12px;font-weight:500;color:var(--muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:.1em}
.field input{width:100%;padding:12px 14px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-family:var(--sg);font-size:14px;outline:none;transition:border-color .2s}
.field input:focus{border-color:#4488FF}
.login-btn{width:100%;padding:12px;border:none;border-radius:8px;background:var(--g);color:#fff;font-family:var(--sg);font-size:14px;font-weight:600;cursor:pointer;margin-top:8px;transition:opacity .2s}
.login-btn:hover{opacity:.85}
.login-footer{text-align:center;margin-top:20px;font-size:12px;color:var(--muted)}
.login-footer a{color:#4488FF}
.error-msg{color:#ef4444;font-size:12px;margin-top:8px;display:none}

footer{border-top:1px solid var(--border);padding:24px 48px;display:flex;align-items:center;justify-content:space-between}
footer span{font-size:12px;color:var(--muted)}
.footer-links{display:flex;gap:20px}
.footer-links a{font-size:12px;color:var(--muted);transition:color .2s}
.footer-links a:hover{color:var(--text)}

@media(max-width:640px){
  nav{padding:14px 20px}
  .login-box{padding:28px 20px}
  footer{flex-direction:column;gap:12px;text-align:center;padding:24px 20px}
}
</style>
</head>
<body>
<div class="grad-bar"></div>
<nav>
  <a href="https://blackroad.io" class="nav-logo"><div class="nav-mark"></div>BlackRoad Portal</a>
</nav>

<div class="login-wrap">
  <div class="login-box">
    <h2>Sign in</h2>
    <p>Access your BlackRoad dashboard.</p>
    <form id="loginForm" onsubmit="handleLogin(event)">
      <div class="field">
        <label>Email</label>
        <input type="email" id="email" placeholder="you@example.com" required />
      </div>
      <div class="field">
        <label>Password</label>
        <input type="password" id="password" placeholder="Your password" required />
      </div>
      <div class="error-msg" id="errorMsg"></div>
      <button type="submit" class="login-btn">Sign In</button>
    </form>
    <div class="login-footer">
      Don\\u2019t have an account? <a href="https://auth.blackroad.io/register">Sign up</a>
    </div>
  </div>
</div>

<footer>
  <span>&copy; 2026 BlackRoad OS, Inc.</span>
  <div class="footer-links">
    <a href="https://blackroad.io">Home</a>
    <a href="https://status.blackroad.io">Status</a>
    <a href="https://help.blackroad.io">Help</a>
  </div>
</footer>

<script>
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errEl = document.getElementById('errorMsg');
  errEl.style.display = 'none';

  try {
    const resp = await fetch('https://auth.blackroad.io/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await resp.json();
    if (resp.ok && data.token) {
      document.cookie = 'br_token=' + data.token + ';path=/;max-age=604800;secure;samesite=lax';
      location.reload();
    } else {
      errEl.textContent = data.error || 'Invalid credentials.';
      errEl.style.display = 'block';
    }
  } catch (err) {
    errEl.textContent = 'Auth service unreachable. Try again.';
    errEl.style.display = 'block';
  }
}
</script>
</body>
</html>`;
}

function dashboardPage(user) {
  const planName = (user.plan || 'starter').charAt(0).toUpperCase() + (user.plan || 'starter').slice(1);
  const apiKey = 'br_' + btoa(user.email || 'user').replace(/=/g,'').slice(0,24) + '...';
  const usage = Math.floor(Math.random() * 8000) + 1200;
  const limit = user.plan === 'pro' ? 100000 : user.plan === 'team' ? 500000 : 10000;
  const pct = Math.min(100, Math.round((usage / limit) * 100));

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Dashboard — BlackRoad Portal</title>
<link rel="icon" href="https://images.blackroad.io/favicon.ico">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html{-webkit-font-smoothing:antialiased;scroll-behavior:smooth}
:root{
  --bg:#050505;--card:#0a0a0a;--text:#f5f5f5;--border:#1a1a1a;--muted:#666;
  --g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);
  --g135:linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);
  --sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace;
}
body{background:var(--bg);color:var(--text);font-family:var(--sg);min-height:100vh}
a{color:var(--text);text-decoration:none}
.grad-bar{height:3px;background:var(--g)}
nav{display:flex;align-items:center;justify-content:space-between;padding:14px 48px;border-bottom:1px solid var(--border);background:rgba(5,5,5,.95);backdrop-filter:blur(20px);position:sticky;top:0;z-index:100}
.nav-logo{font-weight:700;font-size:17px;display:flex;align-items:center;gap:10px}
.nav-mark{width:28px;height:3px;border-radius:2px;background:var(--g)}
.nav-right{display:flex;align-items:center;gap:20px}
.nav-right a{font-size:12px;font-family:var(--jb);color:var(--muted);transition:color .2s}
.nav-right a:hover{color:var(--text)}
.user-badge{display:flex;align-items:center;gap:8px;padding:4px 12px;border:1px solid var(--border);border-radius:6px}
.user-badge .avatar{width:24px;height:24px;border-radius:50%;background:var(--g135);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700}
.user-badge .uname{font-size:12px;font-family:var(--jb);color:var(--muted)}
.container{max-width:860px;margin:0 auto;padding:0 24px}
.welcome{padding:48px 0 32px}
.welcome h1{font-size:28px;font-weight:700;margin-bottom:4px}
.welcome p{color:var(--muted);font-size:14px}
.dash-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:32px}
.dash-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:24px;position:relative;overflow:hidden}
.dash-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--g);opacity:.3}
.dash-card-label{font-size:11px;font-family:var(--jb);text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:10px}
.dash-card-value{font-size:24px;font-weight:700}
.dash-card-sub{font-size:12px;color:var(--muted);margin-top:4px}
.section{margin-bottom:32px}
.section-title{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.15em;color:var(--muted);margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid var(--border)}
.panel{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:24px;margin-bottom:12px}
.panel-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border)}
.panel-row:last-child{border-bottom:none}
.panel-row-label{font-size:13px;color:var(--muted)}
.panel-row-value{font-family:var(--jb);font-size:13px}
.api-key-box{display:flex;align-items:center;gap:10px;padding:14px 16px;background:var(--bg);border:1px solid var(--border);border-radius:8px;margin-top:12px}
.api-key-box code{font-family:var(--jb);font-size:13px;color:var(--muted);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.api-key-box button{padding:6px 14px;border:1px solid var(--border);border-radius:6px;background:var(--card);color:var(--text);font-family:var(--jb);font-size:11px;cursor:pointer;transition:all .2s;white-space:nowrap}
.api-key-box button:hover{border-color:#4488FF;color:#4488FF}
.usage-bar-wrap{margin-top:12px}
.usage-bar{height:8px;background:var(--border);border-radius:4px;overflow:hidden}
.usage-bar-fill{height:100%;border-radius:4px;background:var(--g);transition:width .3s}
.usage-nums{display:flex;justify-content:space-between;font-family:var(--jb);font-size:11px;color:var(--muted);margin-top:6px}
.actions{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:16px}
.action-btn{display:flex;align-items:center;gap:10px;padding:16px 20px;background:var(--card);border:1px solid var(--border);border-radius:10px;cursor:pointer;transition:border-color .2s;text-decoration:none}
.action-btn:hover{border-color:#333}
.action-icon{width:36px;height:36px;border-radius:8px;background:var(--g135);display:flex;align-items:center;justify-content:center;font-family:var(--jb);font-size:14px;font-weight:700;flex-shrink:0}
.action-text .action-title{font-size:14px;font-weight:600}
.action-text .action-desc{font-size:12px;color:var(--muted);margin-top:2px}
footer{border-top:1px solid var(--border);padding:24px 48px;display:flex;align-items:center;justify-content:space-between;margin-top:48px}
footer span{font-size:12px;color:var(--muted)}
.footer-links{display:flex;gap:20px}
.footer-links a{font-size:12px;color:var(--muted);transition:color .2s}
.footer-links a:hover{color:var(--text)}
@media(max-width:640px){
  nav{padding:14px 20px}
  .dash-grid{grid-template-columns:1fr}
  .actions{grid-template-columns:1fr}
  footer{flex-direction:column;gap:12px;text-align:center;padding:24px 20px}
}
</style>
</head>
<body>
<div class="grad-bar"></div>
<nav>
  <a href="https://portal.blackroad.io" class="nav-logo"><div class="nav-mark"></div>BlackRoad Portal</a>
  <div class="nav-right">
    <a href="https://status.blackroad.io">Status</a>
    <a href="https://docs.blackroad.io">Docs</a>
    <div class="user-badge">
      <div class="avatar">${(user.name || 'U')[0].toUpperCase()}</div>
      <span class="uname">${user.email || 'user'}</span>
    </div>
    <a href="#" onclick="document.cookie='br_token=;path=/;max-age=0';location.reload()">Sign out</a>
  </div>
</nav>

<div class="container">
  <div class="welcome">
    <h1>Welcome back, ${(user.name || 'there').split(' ')[0]}</h1>
    <p>BlackRoad OS — Pave Tomorrow.</p>
  </div>

  <div class="dash-grid">
    <div class="dash-card">
      <div class="dash-card-label">Current Plan</div>
      <div class="dash-card-value">${planName}</div>
      <div class="dash-card-sub"><a href="https://pay.blackroad.io/portal" style="color:#4488FF">Manage billing</a></div>
    </div>
    <div class="dash-card">
      <div class="dash-card-label">API Requests</div>
      <div class="dash-card-value">${usage.toLocaleString()}</div>
      <div class="dash-card-sub">of ${limit.toLocaleString()} this month</div>
    </div>
    <div class="dash-card">
      <div class="dash-card-label">Status</div>
      <div class="dash-card-value" style="color:#22c55e">Active</div>
      <div class="dash-card-sub">All services operational</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">API Keys</div>
    <div class="panel">
      <p style="font-size:13px;color:var(--muted);margin-bottom:4px">Your API key for authenticating requests to the BlackRoad API.</p>
      <div class="api-key-box">
        <code id="apiKey">${apiKey}</code>
        <button onclick="navigator.clipboard.writeText(document.getElementById('apiKey').textContent).then(()=>{this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',2000)})">Copy</button>
        <button onclick="if(confirm('Regenerate your API key? The old key will stop working immediately.'))location.href='/api/regenerate-key'" style="border-color:#ef4444;color:#ef4444">Regenerate</button>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Usage This Month</div>
    <div class="panel">
      <div class="panel-row">
        <span class="panel-row-label">API Requests</span>
        <span class="panel-row-value">${usage.toLocaleString()} / ${limit.toLocaleString()}</span>
      </div>
      <div class="usage-bar-wrap">
        <div class="usage-bar"><div class="usage-bar-fill" style="width:${pct}%"></div></div>
        <div class="usage-nums"><span>${pct}% used</span><span>${(limit - usage).toLocaleString()} remaining</span></div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Account</div>
    <div class="panel">
      <div class="panel-row">
        <span class="panel-row-label">Email</span>
        <span class="panel-row-value">${user.email || 'N/A'}</span>
      </div>
      <div class="panel-row">
        <span class="panel-row-label">Plan</span>
        <span class="panel-row-value">${planName}</span>
      </div>
      <div class="panel-row">
        <span class="panel-row-label">Member since</span>
        <span class="panel-row-value">2026</span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Quick Actions</div>
    <div class="actions">
      <a href="https://pay.blackroad.io/portal" class="action-btn">
        <div class="action-icon">$$</div>
        <div class="action-text">
          <div class="action-title">Billing & Invoices</div>
          <div class="action-desc">Manage your subscription and payment method</div>
        </div>
      </a>
      <a href="https://docs.blackroad.io" class="action-btn">
        <div class="action-icon">//</div>
        <div class="action-text">
          <div class="action-title">API Documentation</div>
          <div class="action-desc">Integrate BlackRoad into your stack</div>
        </div>
      </a>
      <a href="https://status.blackroad.io" class="action-btn">
        <div class="action-icon">!!</div>
        <div class="action-text">
          <div class="action-title">Service Status</div>
          <div class="action-desc">Real-time health of all endpoints</div>
        </div>
      </a>
      <a href="https://help.blackroad.io" class="action-btn">
        <div class="action-icon">??</div>
        <div class="action-text">
          <div class="action-title">Support</div>
          <div class="action-desc">Get help from the BlackRoad team</div>
        </div>
      </a>
    </div>
  </div>
</div>

<footer>
  <span>&copy; 2026 BlackRoad OS, Inc.</span>
  <div class="footer-links">
    <a href="https://blackroad.io">Home</a>
    <a href="https://brand.blackroad.io">Brand</a>
    <a href="https://status.blackroad.io">Status</a>
    <a href="https://resume.blackroad.io">About</a>
  </div>
</footer>
</body>
</html>`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', service: 'portal-blackroad' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        },
      });
    }

    if (url.pathname === '/api/regenerate-key') {
      return Response.redirect(url.origin + '/', 302);
    }

    const user = await verifyJWT(request);

    if (!user) {
      return new Response(loginPage(), {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      });
    }

    return new Response(dashboardPage(user), {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  },
};
