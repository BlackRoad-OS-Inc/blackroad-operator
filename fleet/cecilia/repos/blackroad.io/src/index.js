// BlackRoad.io - The Hub
// Full auth system with login/signup, dashboard, D1 backend

import { CSS, HEADER, FOOTER, layout } from './templates/base.js';
import * as pages from './pages/index.js';
import * as templates from './templates/library.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Get current user from session
    const user = await getCurrentUser(request, env);

    // Auth routes
    if (path === '/login') {
      if (method === 'POST') return handleLogin(request, env);
      return html(pages.login(user));
    }
    if (path === '/signup') {
      if (method === 'POST') return handleSignup(request, env);
      return html(pages.signup(user));
    }
    if (path === '/logout') {
      return handleLogout(request, env);
    }

    // Protected routes
    if (path === '/dashboard') {
      if (!user) return Response.redirect(url.origin + '/login', 302);
      return html(await pages.dashboard(user, env));
    }
    if (path === '/settings') {
      if (!user) return Response.redirect(url.origin + '/login', 302);
      if (method === 'POST') return handleSettings(request, user, env);
      return html(pages.settings(user));
    }

    // API routes
    if (path.startsWith('/api/')) {
      return handleAPI(path, request, env, user);
    }

    // Template library
    if (path.startsWith('/templates')) {
      return handleTemplates(path, env);
    }

    // Redirects from D1
    const redirect = await getRedirect(path, env);
    if (redirect) {
      return Response.redirect(redirect.target, redirect.permanent ? 301 : 302);
    }

    // GitHub org shortcut
    if (path.startsWith('/gh/')) {
      const org = path.replace('/gh/', '');
      return Response.redirect(`https://github.com/${org}`, 302);
    }

    // Public pages
    const pageRoutes = {
      '/': () => pages.home(env, user),
      '/design': () => pages.design(env),
      '/connect': () => pages.connect(env),
      '/ecosystem': () => pages.ecosystem(env),
      '/github': () => pages.github(env),
      '/domains': () => pages.domains(env),
      '/about': () => pages.about(env),
    };

    if (pageRoutes[path]) {
      const content = await pageRoutes[path]();
      return html(content);
    }

    return html(pages.notFound(), 404);
  }
};

// ============ AUTH HANDLERS ============

async function handleLogin(request, env) {
  const form = await request.formData();
  const email = form.get('email')?.toLowerCase().trim();
  const password = form.get('password');

  if (!email || !password) {
    return html(pages.login(null, 'Email and password required'));
  }

  // Find user
  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  if (!user) {
    return html(pages.login(null, 'Invalid email or password'));
  }

  // Verify password
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return html(pages.login(null, 'Invalid email or password'));
  }

  // Create session
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
  
  await env.DB.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(sessionId, user.id, expiresAt).run();

  // Set cookie and redirect
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/dashboard',
      'Set-Cookie': `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
    }
  });
}

async function handleSignup(request, env) {
  const form = await request.formData();
  const email = form.get('email')?.toLowerCase().trim();
  const password = form.get('password');
  const name = form.get('name')?.trim();

  if (!email || !password) {
    return html(pages.signup(null, 'Email and password required'));
  }
  if (password.length < 8) {
    return html(pages.signup(null, 'Password must be at least 8 characters'));
  }
  if (!email.includes('@')) {
    return html(pages.signup(null, 'Invalid email address'));
  }

  // Check if exists
  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) {
    return html(pages.signup(null, 'An account with this email already exists'));
  }

  // Create user
  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  
  await env.DB.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)')
    .bind(userId, email, passwordHash, name || null).run();

  // Create session
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  
  await env.DB.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(sessionId, userId, expiresAt).run();

  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/dashboard',
      'Set-Cookie': `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
    }
  });
}

async function handleLogout(request, env) {
  const cookie = parseCookies(request.headers.get('Cookie') || '');
  const sessionId = cookie.session;
  
  if (sessionId) {
    await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
  }

  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/',
      'Set-Cookie': 'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
    }
  });
}

async function handleSettings(request, user, env) {
  const form = await request.formData();
  const name = form.get('name')?.trim();
  const newPassword = form.get('new_password');
  const currentPassword = form.get('current_password');

  // Update name
  if (name !== user.name) {
    await env.DB.prepare('UPDATE users SET name = ?, updated_at = ? WHERE id = ?')
      .bind(name || null, new Date().toISOString(), user.id).run();
  }

  // Update password
  if (newPassword && currentPassword) {
    const valid = await verifyPassword(currentPassword, user.password_hash);
    if (!valid) {
      return html(pages.settings({ ...user, name }, 'Current password is incorrect'));
    }
    if (newPassword.length < 8) {
      return html(pages.settings({ ...user, name }, 'New password must be at least 8 characters'));
    }
    const newHash = await hashPassword(newPassword);
    await env.DB.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
      .bind(newHash, new Date().toISOString(), user.id).run();
  }

  return html(pages.settings({ ...user, name }, null, 'Settings saved'));
}

// ============ SESSION HELPERS ============

async function getCurrentUser(request, env) {
  const cookie = parseCookies(request.headers.get('Cookie') || '');
  const sessionId = cookie.session;
  if (!sessionId) return null;

  const session = await env.DB.prepare(
    'SELECT s.*, u.id as user_id, u.email, u.name, u.role, u.password_hash FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > ?'
  ).bind(sessionId, new Date().toISOString()).first();

  if (!session) return null;
  return { id: session.user_id, email: session.email, name: session.name, role: session.role, password_hash: session.password_hash };
}

function parseCookies(cookieHeader) {
  const cookies = {};
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) cookies[name] = value;
  });
  return cookies;
}

// ============ PASSWORD HELPERS ============

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, keyMaterial, 256);
  const hash = new Uint8Array(bits);
  const combined = new Uint8Array(salt.length + hash.length);
  combined.set(salt);
  combined.set(hash, salt.length);
  return btoa(String.fromCharCode(...combined));
}

async function verifyPassword(password, storedHash) {
  const encoder = new TextEncoder();
  const combined = Uint8Array.from(atob(storedHash), c => c.charCodeAt(0));
  const salt = combined.slice(0, 16);
  const hash = combined.slice(16);
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, keyMaterial, 256);
  const newHash = new Uint8Array(bits);
  return hash.every((byte, i) => byte === newHash[i]);
}

// ============ API HANDLERS ============

async function handleAPI(path, request, env, user) {
  const route = path.replace('/api/', '');
  
  if (route === 'stats') return json(await getStats(env));
  if (route === 'domains') return json(await getDomains(env));
  if (route === 'orgs') return json(await getOrgs(env));
  if (route === 'health') return json({ status: 'ok', timestamp: new Date().toISOString() });
  if (route === 'me') return user ? json({ id: user.id, email: user.email, name: user.name, role: user.role }) : json({ error: 'Not authenticated' }, 401);

  return json({ error: 'Not found' }, 404);
}

// ============ TEMPLATE HANDLERS ============

function handleTemplates(path, env) {
  const route = path.replace('/templates', '') || '/';
  const templateRoutes = {
    '/': () => templates.index(),
    '/base.css': () => cssResponse(templates.baseCSS()),
    '/components/header': () => html(templates.header()),
    '/components/footer': () => html(templates.footer()),
    '/layouts/base': () => html(templates.baseLayout()),
    '/pages/home': () => html(templates.homePage()),
    '/pages/about': () => html(templates.aboutPage()),
    '/pages/404': () => html(templates.notFoundPage()),
    '/pages/coming-soon': () => html(templates.comingSoonPage()),
  };
  if (templateRoutes[route]) return templateRoutes[route]();
  return html(templates.notFoundPage(), 404);
}

// ============ D1 HELPERS ============

async function getRedirect(path, env) {
  try {
    return await env.DB.prepare('SELECT target, permanent FROM redirects WHERE path = ?').bind(path).first();
  } catch { return null; }
}

async function getStats(env) {
  try {
    const result = await env.DB.prepare('SELECT key, value FROM stats').all();
    const stats = {};
    for (const row of result.results) stats[row.key] = row.value;
    return stats;
  } catch { return { agents: '1000', domains: '21', github_orgs: '16', repositories: '40' }; }
}

async function getDomains(env) {
  try {
    const result = await env.DB.prepare('SELECT name, status, primary_domain FROM domains ORDER BY primary_domain DESC, name').all();
    return result.results;
  } catch { return []; }
}

async function getOrgs(env) {
  try {
    const result = await env.DB.prepare('SELECT name, display_name, description FROM github_orgs ORDER BY name').all();
    return result.results;
  } catch { return []; }
}

// ============ RESPONSE HELPERS ============

function html(content, status = 200) {
  return new Response(content, {
    status,
    headers: {
      'content-type': 'text/html;charset=UTF-8',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'SAMEORIGIN',
      'x-xss-protection': '1; mode=block',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
      'access-control-allow-origin': '*'
    }
  });
}

function cssResponse(content) {
  return new Response(content, {
    headers: { 'content-type': 'text/css;charset=UTF-8', 'access-control-allow-origin': '*', 'cache-control': 'public, max-age=86400' }
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
  });
}
