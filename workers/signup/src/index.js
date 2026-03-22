// BlackRoad Signup Worker — User registration + free month promo
// Handles: /api/signup, /api/login, /api/users (admin)
// (c) 2026 BlackRoad OS, Inc.

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    try {
      if (path === '/api/signup' && request.method === 'POST') {
        return await handleSignup(request, env, cors)
      }
      if (path === '/api/login' && request.method === 'POST') {
        return await handleLogin(request, env, cors)
      }
      if (path === '/api/users' && request.method === 'GET') {
        return await handleListUsers(request, env, cors)
      }
      if (path === '/api/users/count' && request.method === 'GET') {
        return await handleUserCount(env, cors)
      }
      if (path === '/api/health') {
        return json({ ok: true, service: 'blackroad-signup', ts: Date.now() }, 200, cors)
      }
      return json({ error: 'not found' }, 404, cors)
    } catch (err) {
      return json({ error: err.message }, 500, cors)
    }
  }
}

async function handleSignup(request, env, cors) {
  const data = await request.json()
  const { name, email, password, free_month, referral } = data
  const cf = request.cf || {}

  // Validate
  if (!email || !password) {
    return json({ success: false, error: 'Email and password required' }, 400, cors)
  }
  if (password.length < 8) {
    return json({ success: false, error: 'Password must be at least 8 characters' }, 400, cors)
  }
  const emailClean = email.toLowerCase().trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
    return json({ success: false, error: 'Invalid email address' }, 400, cors)
  }

  // Rate limit: max 5 signups per IP per hour
  const ip = request.headers.get('cf-connecting-ip') || 'unknown'
  const rateKey = `signup:${ip}`
  const rateCount = parseInt(await env.RATE.get(rateKey) || '0')
  if (rateCount >= 5) {
    return json({ success: false, error: 'Too many signups. Try again later.' }, 429, cors)
  }
  await env.RATE.put(rateKey, String(rateCount + 1), { expirationTtl: 3600 })

  // Check if email already exists
  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(emailClean).first()
  if (existing) {
    return json({ success: false, error: 'An account with this email already exists' }, 409, cors)
  }

  // Hash password
  const salt = randomHex(16)
  const passwordHash = await hashPassword(password, salt)

  // Determine plan and promo
  const now = Date.now()
  const plan = free_month ? 'sovereign' : 'operator'
  const freeMonthExpires = free_month ? now + (30 * 86400000) : 0 // 30 days
  const nodeId = 'node_' + randomHex(8)

  // Extract UTM from request or body
  const utm_source = data.utm_source || ''
  const utm_medium = data.utm_medium || ''
  const utm_campaign = data.utm_campaign || ''

  // Insert user
  await env.DB.prepare(`
    INSERT INTO users (email, name, password_hash, salt, plan, free_month, free_month_expires,
      node_id, node_status, referral, utm_source, utm_medium, utm_campaign, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    emailClean, name || '', passwordHash, salt, plan,
    free_month ? 1 : 0, freeMonthExpires,
    nodeId, 'provisioning',
    referral || '', utm_source, utm_medium, utm_campaign, now
  ).run()

  // Also create/update BlackBoard contact for CRM tracking
  await env.DB.prepare(`
    INSERT INTO contacts (vid, email, name, source, utm_source, utm_medium, utm_campaign,
      country, city, stage, props, first_seen, last_seen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      name = COALESCE(NULLIF(excluded.name, ''), contacts.name),
      stage = 'customer',
      last_seen = excluded.last_seen
  `).bind(
    'u_' + randomHex(6), emailClean, name || '',
    free_month ? 'promo' : 'organic',
    utm_source, utm_medium, utm_campaign,
    cf.country || '', cf.city || '',
    'customer',
    JSON.stringify({ plan, free_month: !!free_month, node_id: nodeId }),
    now, now
  ).run()

  // Track signup conversion in BlackBoard events
  await env.DB.prepare(`
    INSERT INTO conversions (vid, event, value, currency, utm_source, utm_medium, utm_campaign, site, ts)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    'u_' + emailClean.replace(/[^a-z0-9]/g, '').slice(0, 10),
    'signup',
    free_month ? 299 : 0,
    'USD',
    utm_source, utm_medium, utm_campaign,
    'blackroad.io', now
  ).run()

  return json({
    success: true,
    user: {
      email: emailClean,
      name: name || '',
      plan,
      free_month: !!free_month,
      free_month_expires: freeMonthExpires || null,
      node_id: nodeId,
      node_status: 'provisioning'
    },
    redirect: '/dashboard'
  }, 201, cors)
}

async function handleLogin(request, env, cors) {
  const data = await request.json()
  const { email, password } = data

  if (!email || !password) {
    return json({ success: false, error: 'Email and password required' }, 400, cors)
  }

  const emailClean = email.toLowerCase().trim()
  const user = await env.DB.prepare(
    'SELECT id, email, name, password_hash, salt, plan, free_month, free_month_expires, node_id, node_status, status FROM users WHERE email = ?'
  ).bind(emailClean).first()

  if (!user) {
    return json({ success: false, error: 'Invalid email or password' }, 401, cors)
  }

  const hash = await hashPassword(password, user.salt)
  if (hash !== user.password_hash) {
    return json({ success: false, error: 'Invalid email or password' }, 401, cors)
  }

  // Update last login
  await env.DB.prepare('UPDATE users SET last_login = ? WHERE id = ?').bind(Date.now(), user.id).run()

  return json({
    success: true,
    user: {
      email: user.email,
      name: user.name,
      plan: user.plan,
      free_month: !!user.free_month,
      free_month_expires: user.free_month_expires || null,
      node_id: user.node_id,
      node_status: user.node_status
    },
    redirect: '/dashboard'
  }, 200, cors)
}

async function handleListUsers(request, env, cors) {
  const rows = await env.DB.prepare(`
    SELECT email, name, plan, free_month, node_id, node_status, referral,
      utm_source, utm_campaign, status, created_at, last_login
    FROM users ORDER BY created_at DESC LIMIT 100
  `).all()
  return json(rows.results, 200, cors)
}

async function handleUserCount(env, cors) {
  const total = await env.DB.prepare('SELECT COUNT(*) as c FROM users').first()
  const sovereign = await env.DB.prepare("SELECT COUNT(*) as c FROM users WHERE plan = 'sovereign'").first()
  const freeMonth = await env.DB.prepare('SELECT COUNT(*) as c FROM users WHERE free_month = 1').first()
  const today = await env.DB.prepare('SELECT COUNT(*) as c FROM users WHERE created_at > ?').bind(Date.now() - 86400000).first()
  return json({
    total: total.c,
    sovereign: sovereign.c,
    free_month_active: freeMonth.c,
    signups_today: today.c
  }, 200, cors)
}

// Password hashing with PBKDF2
async function hashPassword(password, salt) {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  )
  return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function randomHex(bytes) {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...headers, 'content-type': 'application/json' }
  })
}
