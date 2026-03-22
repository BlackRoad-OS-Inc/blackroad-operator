// ── BlackRoad Auth — Sovereign Authentication ──
// D1-backed, JWT sessions, password hashing via Web Crypto
// Zero third-party auth dependencies

const CORS_HEADERS = (origin, env) => {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',');
  const o = allowed.includes(origin) ? origin : allowed[0];
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
};

// ── Crypto helpers (Web Crypto API, no external deps) ──
async function hashPassword(password, salt) {
  salt = salt || crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' }, key, 256);
  const hash = btoa(String.fromCharCode(...new Uint8Array(bits)));
  const saltB64 = btoa(String.fromCharCode(...salt));
  return `${saltB64}:${hash}`;
}

async function verifyPassword(password, stored) {
  const [saltB64] = stored.split(':');
  const salt = new Uint8Array(atob(saltB64).split('').map(c => c.charCodeAt(0)));
  const result = await hashPassword(password, salt);
  return result === stored;
}

async function createJWT(payload, secret, expiresIn = 86400) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresIn, iss: 'blackroad.io' };

  const enc = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '');
  const bodyB64 = btoa(JSON.stringify(body)).replace(/=/g, '');
  const data = `${headerB64}.${bodyB64}`;

  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${data}.${sigB64}`;
}

async function verifyJWT(token, secret) {
  try {
    const [headerB64, bodyB64, sigB64] = token.split('.');
    const data = `${headerB64}.${bodyB64}`;
    const enc = new TextEncoder();

    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const sig = Uint8Array.from(atob(sigB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sig, enc.encode(data));

    if (!valid) return null;

    const body = JSON.parse(atob(bodyB64));
    if (body.exp < Math.floor(Date.now() / 1000)) return null;

    return body;
  } catch {
    return null;
  }
}

function generateId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

// ── DB Schema ──
const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'operator',
  stripe_customer_id TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  last_login INTEGER,
  metadata TEXT DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  ip TEXT,
  user_agent TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
`;

// ── Rate limiting (in-memory per isolate, simple but effective) ──
const rateLimits = new Map();
function checkRateLimit(ip, limit = 10, windowSec = 60) {
  const now = Date.now();
  const key = ip;
  const entry = rateLimits.get(key);
  if (!entry || now - entry.start > windowSec * 1000) {
    rateLimits.set(key, { start: now, count: 1 });
    return true;
  }
  entry.count++;
  if (entry.count > limit) return false;
  return true;
}

async function safeJson(request) {
  try { return await request.json(); }
  catch { return null; }
}

// ── Route handlers ──
async function handleSignup(request, env) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (!checkRateLimit(ip, 5, 60)) {
    return Response.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await safeJson(request);
  if (!body) return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  const { email, password, name } = body;

  if (!email || !password) {
    return Response.json({ error: 'Email and password required' }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }
  if (!email.includes('@')) {
    return Response.json({ error: 'Invalid email' }, { status: 400 });
  }

  // Check if user exists
  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase()).first();
  if (existing) {
    return Response.json({ error: 'Email already registered' }, { status: 409 });
  }

  const id = generateId();
  const passwordHash = await hashPassword(password);

  await env.DB.prepare(
    'INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)'
  ).bind(id, email.toLowerCase(), name || '', passwordHash).run();

  // Create session
  const token = await createJWT({ sub: id, email: email.toLowerCase(), name: name || '', plan: 'operator' }, env.JWT_SECRET);

  // Store session
  const sessionId = generateId();
  const tokenDigest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  const tokenHash = Array.from(new Uint8Array(tokenDigest), b => b.toString(16).padStart(2, '0')).join('');
  const expiresAt = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days
  await env.DB.prepare(
    'INSERT INTO sessions (id, user_id, token_hash, expires_at, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(sessionId, id, tokenHash, expiresAt, request.headers.get('cf-connecting-ip') || '', request.headers.get('user-agent') || '').run();

  return Response.json({
    user: { id, email: email.toLowerCase(), name: name || '', plan: 'operator' },
    token,
    expiresAt,
  });
}

async function handleSignin(request, env) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (!checkRateLimit(ip, 10, 60)) {
    return Response.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await safeJson(request);
  if (!body) return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  const { email, password } = body;

  if (!email || !password) {
    return Response.json({ error: 'Email and password required' }, { status: 400 });
  }

  const user = await env.DB.prepare(
    'SELECT id, email, name, password_hash, plan, metadata FROM users WHERE email = ?'
  ).bind(email.toLowerCase()).first();

  if (!user) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  // Update last login
  await env.DB.prepare('UPDATE users SET last_login = unixepoch(), updated_at = unixepoch() WHERE id = ?').bind(user.id).run();

  // Create session
  const token = await createJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
  }, env.JWT_SECRET, 86400 * 30);

  const sessionId = generateId();
  const tokenDigest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  const tokenHash = Array.from(new Uint8Array(tokenDigest), b => b.toString(16).padStart(2, '0')).join('');
  const expiresAt = Math.floor(Date.now() / 1000) + 86400 * 30;
  await env.DB.prepare(
    'INSERT INTO sessions (id, user_id, token_hash, expires_at, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(sessionId, user.id, tokenHash, expiresAt, request.headers.get('cf-connecting-ip') || '', request.headers.get('user-agent') || '').run();

  return Response.json({
    user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
    token,
    expiresAt,
  });
}

async function handleMe(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const token = auth.slice(7);
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) {
    return Response.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const user = await env.DB.prepare(
    'SELECT id, email, name, plan, stripe_customer_id, created_at, last_login, metadata FROM users WHERE id = ?'
  ).bind(payload.sub).first();

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  return Response.json({ user });
}

async function handleSignout(request, env) {
  const auth = request.headers.get('Authorization');
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.slice(7);
    const payload = await verifyJWT(token, env.JWT_SECRET);
    if (payload) {
      // Delete all sessions for this user
      await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(payload.sub).run();
    }
  }
  return Response.json({ ok: true });
}

async function handleUpdateUser(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const payload = await verifyJWT(auth.slice(7), env.JWT_SECRET);
  if (!payload) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  const body = await safeJson(request);
  if (!body) return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  const updates = [];
  const values = [];

  // Only allow safe fields
  if (typeof body.name === 'string') { updates.push('name = ?'); values.push(body.name.slice(0, 200)); }
  if (body.metadata !== undefined) { updates.push('metadata = ?'); values.push(JSON.stringify(body.metadata).slice(0, 5000)); }

  if (body.password) {
    if (body.password.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    const hash = await hashPassword(body.password);
    updates.push('password_hash = ?');
    values.push(hash);
  }

  if (updates.length === 0) {
    return Response.json({ error: 'Nothing to update' }, { status: 400 });
  }

  updates.push('updated_at = unixepoch()');
  values.push(payload.sub);

  await env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();

  return Response.json({ ok: true });
}

async function handleStats(env) {
  const users = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
  const sessions = await env.DB.prepare('SELECT COUNT(*) as count FROM sessions WHERE expires_at > unixepoch()').first();
  return Response.json({
    users: users?.count || 0,
    active_sessions: sessions?.count || 0,
    status: 'up',
  });
}

// ── HTML Login/Signup Page ──
function renderAuthPage() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sign In - BlackRoad OS</title>
<link rel="icon" type="image/x-icon" href="https://images.blackroad.io/brand/favicon.png" />
<link rel="icon" type="image/png" sizes="192x192" href="https://images.blackroad.io/brand/br-square-192.png" />
<link rel="apple-touch-icon" sizes="180x180" href="https://images.blackroad.io/brand/apple-touch-icon.png" />
<meta property="og:image" content="https://images.blackroad.io/brand/blackroad-icon-512.png" />
<meta property="og:title" content="Sign In - BlackRoad OS" />
<meta property="og:description" content="Sovereign authentication. Your identity, your keys, your data." />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{
  --g:linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);
  --bg:#000;--card:#0a0a0a;--border:#1a1a1a;--text:#f5f5f5;--muted:#737373;--dim:#999;
  --sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace;
}
html{height:100%}
body{font-family:var(--sg);background:var(--bg);color:var(--text);min-height:100%;display:flex;align-items:center;justify-content:center;-webkit-font-smoothing:antialiased;overflow:hidden}
canvas#bg{position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none}
.wrap{position:relative;z-index:1;width:420px;max-width:92vw}
.logo{text-align:center;margin-bottom:32px}
.logo span{font-size:28px;font-weight:700;background:var(--g);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.logo p{color:var(--muted);font-size:13px;margin-top:6px}
.card{padding:40px 36px;border-radius:16px;border:1px solid transparent;background:linear-gradient(var(--card),var(--card)) padding-box,var(--g) border-box}
.tabs{display:flex;gap:0;margin-bottom:28px;border-radius:8px;overflow:hidden;border:1px solid var(--border)}
.tab{flex:1;padding:10px;text-align:center;font-size:14px;font-weight:600;cursor:pointer;background:transparent;color:var(--muted);transition:all 0.3s;border:none;font-family:var(--sg)}
.tab.active{background:rgba(255,255,255,0.06);color:#fff}
.tab:hover:not(.active){color:var(--dim)}
.field{margin-bottom:16px}
.field label{display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:6px}
.field input{width:100%;padding:12px 16px;border-radius:8px;border:1px solid var(--border);background:rgba(255,255,255,0.03);color:#fff;font-family:var(--jb);font-size:14px;outline:none;transition:border-color 0.3s}
.field input:focus{border-color:rgba(136,68,255,0.5)}
.field input::placeholder{color:rgba(255,255,255,0.2)}
.name-field{display:none}
.signup-mode .name-field{display:block}
.submit-btn{width:100%;margin-top:24px;padding:14px;border:none;border-radius:8px;background:var(--g);color:#fff;font-family:var(--sg);font-size:15px;font-weight:700;cursor:pointer;transition:opacity 0.3s,transform 0.2s}
.submit-btn:hover{opacity:0.9;transform:translateY(-1px)}
.submit-btn:active{transform:translateY(0)}
.submit-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none}
.error-msg{color:rgba(255,34,85,0.9);font-size:13px;text-align:center;margin-top:12px;min-height:20px;transition:opacity 0.3s}
.success-msg{color:rgba(0,212,255,0.9);font-size:13px;text-align:center;margin-top:12px;min-height:20px}
.footer-links{text-align:center;margin-top:20px;display:flex;justify-content:center;gap:16px}
.footer-links a{color:var(--muted);text-decoration:none;font-size:12px;transition:color 0.3s}
.footer-links a:hover{color:#fff}
.eco{text-align:center;margin-top:32px;color:rgba(255,255,255,0.15);font-size:12px}
.eco a{color:rgba(255,255,255,0.25);text-decoration:none}
.eco a:hover{color:rgba(255,255,255,0.5)}
.password-rules{font-size:11px;color:var(--muted);margin-top:4px;display:none}
.signup-mode .password-rules{display:block}
</style>
</head>
<body>
<canvas id="bg"></canvas>
<div class="wrap">
  <div class="logo">
    <span>BlackRoad OS</span>
    <p>Sovereign Authentication</p>
  </div>
  <div class="card" id="auth-card">
    <div class="tabs">
      <button class="tab active" data-mode="signin">Sign In</button>
      <button class="tab" data-mode="signup">Sign Up</button>
    </div>
    <form id="auth-form" autocomplete="off">
      <div class="field name-field">
        <label>Name</label>
        <input type="text" id="f-name" placeholder="Your name (optional)" autocomplete="name">
      </div>
      <div class="field">
        <label>Email</label>
        <input type="email" id="f-email" placeholder="you@example.com" required autocomplete="email">
      </div>
      <div class="field">
        <label>Password</label>
        <input type="password" id="f-pass" placeholder="Enter password" required autocomplete="current-password">
        <div class="password-rules">Minimum 8 characters</div>
      </div>
      <button type="submit" class="submit-btn" id="submit-btn">Sign In</button>
      <div class="error-msg" id="error-msg"></div>
      <div class="success-msg" id="success-msg"></div>
    </form>
    <div class="footer-links">
      <a href="https://blackroad.io">Home</a>
      <a href="https://guide.blackroad.io">Getting Started</a>
      <a href="https://help.blackroad.io">Help</a>
    </div>
  </div>
  <div class="eco">
    <p>BlackRoad OS &mdash; Pave Tomorrow.</p>
    <p>&copy; 2025-2026 <a href="https://blackroad.company">BlackRoad OS, Inc.</a></p>
  </div>
</div>
<script>
(function(){
  const c=document.getElementById('bg'),x=c.getContext('2d');
  let w,h,pts=[];
  function resize(){w=c.width=innerWidth;h=c.height=innerHeight;pts=[];for(let i=0;i<30;i++)pts.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-0.5)*0.3,vy:(Math.random()-0.5)*0.3,r:Math.random()*1.5+0.5})}
  resize();addEventListener('resize',resize);
  function draw(){x.clearRect(0,0,w,h);pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;x.beginPath();x.arc(p.x,p.y,p.r,0,Math.PI*2);x.fillStyle='rgba(255,255,255,0.04)';x.fill()});
  for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const d=Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y);if(d<150){x.beginPath();x.moveTo(pts[i].x,pts[i].y);x.lineTo(pts[j].x,pts[j].y);x.strokeStyle='rgba(255,255,255,'+0.02*(1-d/150)+')';x.stroke()}}
  requestAnimationFrame(draw)}draw()
})();

let mode='signin';
const card=document.getElementById('auth-card');
const form=document.getElementById('auth-form');
const btn=document.getElementById('submit-btn');
const errEl=document.getElementById('error-msg');
const successEl=document.getElementById('success-msg');
const tabs=document.querySelectorAll('.tab');

tabs.forEach(t=>t.addEventListener('click',()=>{
  mode=t.dataset.mode;
  tabs.forEach(tb=>tb.classList.toggle('active',tb===t));
  card.classList.toggle('signup-mode',mode==='signup');
  btn.textContent=mode==='signin'?'Sign In':'Create Account';
  errEl.textContent='';successEl.textContent='';
  document.getElementById('f-pass').autocomplete=mode==='signin'?'current-password':'new-password';
}));

form.addEventListener('submit',async function(e){
  e.preventDefault();
  errEl.textContent='';successEl.textContent='';
  const email=document.getElementById('f-email').value.trim();
  const password=document.getElementById('f-pass').value;
  const name=document.getElementById('f-name').value.trim();

  if(!email||!password){errEl.textContent='Email and password are required.';return}
  if(mode==='signup'&&password.length<8){errEl.textContent='Password must be at least 8 characters.';return}

  btn.disabled=true;
  btn.textContent=mode==='signin'?'Signing in...':'Creating account...';

  try{
    const endpoint=mode==='signin'?'/api/signin':'/api/signup';
    const body=mode==='signin'?{email,password}:{email,password,name};
    const res=await fetch(endpoint,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(body)
    });
    const data=await res.json();

    if(res.ok&&data.token){
      localStorage.setItem('br_token',data.token);
      localStorage.setItem('br_email',data.user?.email||email);
      localStorage.setItem('br_user',JSON.stringify(data.user||{}));
      successEl.textContent=mode==='signin'?'Signed in. Redirecting...':'Account created. Redirecting...';
      setTimeout(()=>{window.location.href='https://blackroad.io'},1200);
    } else {
      errEl.textContent=data.error||'Something went wrong. Try again.';
    }
  }catch(err){
    errEl.textContent='Connection error. Please try again.';
  }

  btn.disabled=false;
  btn.textContent=mode==='signin'?'Sign In':'Create Account';
});

// If already logged in, show a message
const existing=localStorage.getItem('br_token');
if(existing){
  successEl.textContent='You are already signed in.';
}
</script>
</body>
</html>`;
  return new Response(html, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
}

// ── Main ──
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const origin = request.headers.get('Origin') || '';
    const cors = CORS_HEADERS(origin, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    // Init DB on first request
    if (path === '/api/init' || path === '/init') {
      const statements = SCHEMA.split(';').filter(s => s.trim());
      for (const sql of statements) {
        await env.DB.prepare(sql).run();
      }
      return Response.json({ ok: true, message: 'Schema initialized' }, { headers: cors });
    }

    try {
      let response;

      switch (path) {
        case '/':
          // Serve HTML login/signup page for browser requests
          if (request.method === 'GET') {
            return renderAuthPage();
          }
          response = Response.json({
            service: 'BlackRoad Auth',
            version: '1.0.0',
            endpoints: ['/api/signup', '/api/signin', '/api/me', '/api/signout', '/api/user', '/api/stats', '/api/health'],
          });
          break;

        case '/api/signup':
          if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
          response = await handleSignup(request, env);
          break;

        case '/api/signin':
          if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
          response = await handleSignin(request, env);
          break;

        case '/api/me':
          response = await handleMe(request, env);
          break;

        case '/api/signout':
          response = await handleSignout(request, env);
          break;

        case '/api/user':
          if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
          response = await handleUpdateUser(request, env);
          break;

        case '/api/stats':
          response = await handleStats(env);
          break;

        case '/api/health':
          response = Response.json({ status: 'up', service: 'auth-blackroad' });
          break;

        default:
          response = Response.json({
            service: 'BlackRoad Auth',
            version: '1.0.0',
            endpoints: ['/api/signup', '/api/signin', '/api/me', '/api/signout', '/api/user', '/api/stats', '/api/health'],
            docs: 'POST /api/signup {email, password, name} → {user, token}',
          });
      }

      // Add CORS headers to response
      const headers = new Headers(response.headers);
      for (const [k, v] of Object.entries(cors)) headers.set(k, v);
      return new Response(response.body, { status: response.status, headers });

    } catch (err) {
      return Response.json({ error: err.message }, { status: 500, headers: cors });
    }
  },
};
