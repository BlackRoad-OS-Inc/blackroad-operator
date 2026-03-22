// BlackRoad OS — app.blackroad.io
// The front door. Login. See your dashboard. Pick a plan. Pay.
// This is step A of the product rollout.

const VERSION = '1.0.0';
const AUTH_URL = 'https://auth.blackroad.io';
const PAY_URL = 'https://pay.blackroad.io';

const PLANS = [
  { id: 'free', name: 'Free', price: 0, period: '', features: ['5 projects', '1 AI agent', 'Community support', 'ByPass sandbox'], cta: 'Get Started' },
  { id: 'builder', name: 'Builder', price: 29, period: '/mo', features: ['Unlimited projects', '10 AI agents', 'Express deploys', 'RoadSearch', 'Email support'], cta: 'Start Building', popular: true },
  { id: 'fleet', name: 'Fleet', price: 99, period: '/mo', features: ['Everything in Builder', '62 AI agents', 'Priority deploys', 'Signal events', 'Detour flags', 'Phone support'], cta: 'Go Fleet' },
  { id: 'enterprise', name: 'Enterprise', price: 299, period: '/mo', features: ['Everything in Fleet', 'Custom agents', 'Dedicated nodes', 'SLA guarantee', 'SSO/SAML', 'On-premise option'], cta: 'Contact Us' },
];

const APPS = [
  { name: 'RoadCode', url: 'https://roadcode.blackroad.io', desc: 'Build & deploy code', icon: '💻' },
  { name: 'RoundTrip', url: 'https://roundtrip.blackroad.io', desc: 'Talk to your agents', icon: '💬' },
  { name: 'ByPass', url: 'https://bypass.blackroad.io', desc: 'Run code instantly', icon: '⚡' },
  { name: 'Express', url: 'https://express.blackroad.io', desc: 'One-click deploy', icon: '🚀' },
  { name: 'RoadSearch', url: 'https://search.blackroad.io', desc: 'Search everything', icon: '🔍' },
  { name: 'Signal', url: 'https://signal.blackroad.io', desc: 'Real-time events', icon: '📡' },
  { name: 'CrossRoads', url: 'https://crossroads.blackroad.io', desc: 'Find the right tool', icon: '🔀' },
  { name: 'Detour', url: 'https://detour.blackroad.io', desc: 'Feature flags', icon: '🚧' },
  { name: 'Junction', url: 'https://junction.blackroad.io', desc: 'Connect services', icon: '🔗' },
  { name: 'HQ', url: 'https://hq.blackroad.io', desc: 'Pixel headquarters', icon: '🏢' },
];

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' };

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    return new Response(HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8', ...CORS } });
  }
};

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>BlackRoad OS — Your Device. Your Data. Your Agents.</title>
<link rel="icon" href="https://images.blackroad.io/pixel-art/road-logo.png">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{--bg:#000;--card:#0a0a0a;--elevated:#111;--hover:#181818;--border:#1a1a1a;--muted:#444;--sub:#737373;--text:#f5f5f5;--sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace;--in:'Inter',sans-serif;--grad:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--radius:6px;--radius-lg:10px}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--text);font-family:var(--in);min-height:100vh}
a{color:var(--text);text-decoration:none}
.grad-bar{height:4px;background:var(--grad)}

/* Hero */
.hero{max-width:800px;margin:0 auto;padding:80px 24px 60px;text-align:center}
.hero h1{font-family:var(--sg);font-size:clamp(2rem,5vw,3.5rem);font-weight:700;line-height:1.1;margin-bottom:16px}
.hero h1 span{background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero p{color:var(--sub);font-size:18px;line-height:1.6;max-width:600px;margin:0 auto 32px}
.hero-cta{display:inline-flex;gap:12px;flex-wrap:wrap;justify-content:center}
.btn{display:inline-block;padding:14px 32px;border-radius:var(--radius);font-family:var(--sg);font-weight:600;font-size:15px;cursor:pointer;border:none;transition:opacity .2s}
.btn-primary{background:var(--grad);color:#fff}
.btn-outline{background:none;border:1px solid var(--border);color:var(--text)}
.btn:hover{opacity:.85}

/* Stats bar */
.stats{display:flex;justify-content:center;gap:40px;padding:24px;flex-wrap:wrap}
.stat{text-align:center}
.stat-num{font-family:var(--sg);font-size:28px;font-weight:700}
.stat-label{font-size:12px;color:var(--sub);margin-top:4px}

/* Apps grid */
.section{max-width:1100px;margin:0 auto;padding:60px 24px}
.section-title{font-family:var(--sg);font-size:24px;font-weight:700;margin-bottom:8px}
.section-sub{color:var(--sub);margin-bottom:32px}
.apps{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
.app{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px;transition:border-color .2s;display:block}
.app:hover{border-color:var(--muted)}
.app-icon{font-size:28px;margin-bottom:8px}
.app-name{font-family:var(--sg);font-size:15px;font-weight:600;margin-bottom:4px}
.app-desc{font-size:13px;color:var(--sub)}

/* Pricing */
.pricing{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
.plan{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:28px;position:relative}
.plan.popular{border-image:var(--grad) 1}
.plan-badge{position:absolute;top:-10px;right:16px;background:var(--grad);color:#fff;font-size:11px;font-family:var(--sg);font-weight:600;padding:2px 10px;border-radius:4px}
.plan-name{font-family:var(--sg);font-size:18px;font-weight:700;margin-bottom:4px}
.plan-price{font-family:var(--sg);font-size:36px;font-weight:700;margin-bottom:4px}
.plan-price span{font-size:16px;color:var(--sub);font-weight:400}
.plan-features{list-style:none;margin:16px 0 24px}
.plan-features li{padding:6px 0;font-size:13px;color:var(--sub);border-bottom:1px solid var(--border)}
.plan-features li:last-child{border:none}
.plan-cta{display:block;width:100%;padding:12px;border-radius:var(--radius);font-family:var(--sg);font-weight:600;font-size:14px;text-align:center;cursor:pointer;border:none;transition:opacity .2s}
.plan-cta-primary{background:var(--grad);color:#fff}
.plan-cta-outline{background:none;border:1px solid var(--border);color:var(--text)}
.plan-cta:hover{opacity:.85}

/* Auth */
.auth-section{max-width:480px;margin:0 auto;padding:60px 24px}
.auth-box{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:32px}
.auth-box h2{font-family:var(--sg);font-size:20px;margin-bottom:4px}
.auth-box p{color:var(--sub);font-size:13px;margin-bottom:24px}
.input{width:100%;background:var(--hover);border:1px solid var(--border);color:var(--text);padding:12px 14px;border-radius:var(--radius);font-size:14px;font-family:var(--in);margin-bottom:12px;outline:none}
.input:focus{border-color:var(--muted)}

/* Footer */
footer{text-align:center;padding:40px 24px;color:var(--muted);font-size:12px;border-top:1px solid var(--border);margin-top:60px}

/* Views */
.view{display:none}.view.active{display:block}

@media(max-width:768px){.hero{padding:48px 16px 40px}.stats{gap:24px}.section{padding:40px 16px}}
</style>
</head>
<body>

<div class="grad-bar"></div>

<!-- LANDING VIEW -->
<div class="view active" id="v-landing">
  <div class="hero">
    <h1>Your device. Your data.<br><span>Your agents.</span></h1>
    <p>BlackRoad turns any device you own into an AI-powered workspace. Your data stays with you. Your agents work for you. No surveillance. No subscriptions you can't cancel.</p>
    <div class="hero-cta">
      <button class="btn btn-primary" onclick="showView('v-signup')">Get Started Free</button>
      <button class="btn btn-outline" onclick="showView('v-pricing')">See Pricing</button>
    </div>
  </div>

  <div class="stats">
    <div class="stat"><div class="stat-num">62</div><div class="stat-label">AI Agents</div></div>
    <div class="stat"><div class="stat-num">414</div><div class="stat-label">Projects</div></div>
    <div class="stat"><div class="stat-num">19</div><div class="stat-label">Live Apps</div></div>
    <div class="stat"><div class="stat-num">52</div><div class="stat-label">TOPS Compute</div></div>
  </div>

  <div class="section">
    <div class="section-title">Your apps</div>
    <div class="section-sub">Everything runs on your device. No cloud required.</div>
    <div class="apps">
      ${APPS.map(a => '<a class="app" href="' + a.url + '"><div class="app-icon">' + a.icon + '</div><div class="app-name">' + a.name + '</div><div class="app-desc">' + a.desc + '</div></a>').join('')}
    </div>
  </div>

  <div class="section" id="pricing-section">
    <div class="section-title">Pick your plan</div>
    <div class="section-sub">Pay for what you use. Cancel anytime. No tricks.</div>
    <div class="pricing">
      ${PLANS.map(p => '<div class="plan' + (p.popular ? ' popular' : '') + '">' + (p.popular ? '<div class="plan-badge">Most Popular</div>' : '') + '<div class="plan-name">' + p.name + '</div><div class="plan-price">$' + p.price + '<span>' + p.period + '</span></div><ul class="plan-features">' + p.features.map(f => '<li>' + f + '</li>').join('') + '</ul><button class="plan-cta ' + (p.popular ? 'plan-cta-primary' : 'plan-cta-outline') + '" onclick="pickPlan(\'' + p.id + '\')">' + p.cta + '</button></div>').join('')}
    </div>
  </div>
</div>

<!-- SIGNUP VIEW -->
<div class="view" id="v-signup">
  <div class="auth-section">
    <div class="auth-box">
      <h2>Create your account</h2>
      <p>Start free. Upgrade when you're ready.</p>
      <input class="input" id="signup-name" type="text" placeholder="Your name">
      <input class="input" id="signup-email" type="email" placeholder="Email">
      <input class="input" id="signup-pw" type="password" placeholder="Password">
      <button class="btn btn-primary" style="width:100%;margin-top:8px" onclick="signup()">Create Account</button>
      <p style="margin-top:16px;text-align:center;font-size:12px;color:var(--muted)">Already have an account? <a style="border-bottom:1px solid var(--muted);cursor:pointer" onclick="showView('v-login')">Log in</a></p>
    </div>
  </div>
</div>

<!-- LOGIN VIEW -->
<div class="view" id="v-login">
  <div class="auth-section">
    <div class="auth-box">
      <h2>Welcome back</h2>
      <p>Log in to your workspace.</p>
      <input class="input" id="login-email" type="email" placeholder="Email">
      <input class="input" id="login-pw" type="password" placeholder="Password">
      <button class="btn btn-primary" style="width:100%;margin-top:8px" onclick="login()">Log In</button>
      <p style="margin-top:16px;text-align:center;font-size:12px;color:var(--muted)">No account? <a style="border-bottom:1px solid var(--muted);cursor:pointer" onclick="showView('v-signup')">Sign up free</a></p>
    </div>
  </div>
</div>

<!-- DASHBOARD VIEW -->
<div class="view" id="v-dash">
  <div class="section" style="padding-top:32px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
      <div>
        <div class="section-title" id="dash-greeting">Welcome back</div>
        <div class="section-sub" style="margin:0">Your workspace is ready.</div>
      </div>
      <button class="btn btn-outline" onclick="logout()">Log out</button>
    </div>
    <div class="apps">
      ${APPS.map(a => '<a class="app" href="' + a.url + '"><div class="app-icon">' + a.icon + '</div><div class="app-name">' + a.name + '</div><div class="app-desc">' + a.desc + '</div></a>').join('')}
    </div>
  </div>
</div>

<!-- PRICING VIEW -->
<div class="view" id="v-pricing">
  <div class="section" style="padding-top:40px">
    <div style="text-align:center;margin-bottom:32px">
      <div class="section-title" style="text-align:center">Pick your plan</div>
      <div class="section-sub" style="text-align:center">Pay for what you use. Cancel anytime. No tricks.</div>
    </div>
    <div class="pricing">
      ${PLANS.map(p => '<div class="plan' + (p.popular ? ' popular' : '') + '">' + (p.popular ? '<div class="plan-badge">Most Popular</div>' : '') + '<div class="plan-name">' + p.name + '</div><div class="plan-price">$' + p.price + '<span>' + p.period + '</span></div><ul class="plan-features">' + p.features.map(f => '<li>' + f + '</li>').join('') + '</ul><button class="plan-cta ' + (p.popular ? 'plan-cta-primary' : 'plan-cta-outline') + '" onclick="pickPlan(\'' + p.id + '\')">' + p.cta + '</button></div>').join('')}
    </div>
    <p style="text-align:center;margin-top:24px"><a style="cursor:pointer;border-bottom:1px solid var(--muted);color:var(--sub)" onclick="showView('v-landing')">Back home</a></p>
  </div>
</div>

<footer>&copy; 2026 BlackRoad OS, Inc. All rights reserved. &mdash; Pave Tomorrow.</footer>

<script>
let token = localStorage.getItem('br_token');
let user = null;
try { user = JSON.parse(localStorage.getItem('br_user')); } catch {}

function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

if (token && user) {
  document.getElementById('dash-greeting').textContent = 'Welcome back, ' + (user.name || user.email);
  showView('v-dash');
}

async function signup() {
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const pw = document.getElementById('signup-pw').value;
  if (!email || !pw) return alert('Email and password required');
  try {
    const r = await fetch('${AUTH_URL}/api/signup', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password: pw }),
    });
    const d = await r.json();
    if (d.token) {
      localStorage.setItem('br_token', d.token);
      localStorage.setItem('br_user', JSON.stringify({ email, name }));
      document.getElementById('dash-greeting').textContent = 'Welcome, ' + (name || email);
      showView('v-dash');
    } else { alert(d.error || 'Signup failed'); }
  } catch (e) { alert('Connection error: ' + e.message); }
}

async function login() {
  const email = document.getElementById('login-email').value;
  const pw = document.getElementById('login-pw').value;
  if (!email || !pw) return alert('Email and password required');
  try {
    const r = await fetch('${AUTH_URL}/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pw }),
    });
    const d = await r.json();
    if (d.token) {
      localStorage.setItem('br_token', d.token);
      localStorage.setItem('br_user', JSON.stringify({ email, name: d.name || email }));
      document.getElementById('dash-greeting').textContent = 'Welcome back, ' + (d.name || email);
      showView('v-dash');
    } else { alert(d.error || 'Login failed'); }
  } catch (e) { alert('Connection error: ' + e.message); }
}

function logout() {
  localStorage.removeItem('br_token');
  localStorage.removeItem('br_user');
  showView('v-landing');
}

function pickPlan(id) {
  if (id === 'free') { showView('v-signup'); return; }
  if (id === 'enterprise') { window.location.href = 'mailto:alexa@blackroad.io?subject=Enterprise'; return; }
  // Go to Stripe checkout via RoadPay
  window.location.href = '${PAY_URL}/checkout?plan=' + id;
}
</script>
</body>
</html>`;
