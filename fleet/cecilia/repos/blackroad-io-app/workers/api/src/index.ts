/**
 * BlackRoad.io SaaS API
 * Handles authentication, subscriptions, and agent management
 */

export interface Env {
  BLACKROAD_SAAS: D1Database;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  JWT_SECRET: string;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route requests
      if (url.pathname === '/health') {
        return jsonResponse({ status: 'healthy', timestamp: Date.now() });
      }

      if (url.pathname === '/api/auth/signup' && request.method === 'POST') {
        return handleSignup(request, env);
      }

      if (url.pathname === '/api/auth/login' && request.method === 'POST') {
        return handleLogin(request, env);
      }

      if (url.pathname === '/api/user/me' && request.method === 'GET') {
        return handleGetUser(request, env);
      }

      if (url.pathname === '/api/subscription/create-checkout' && request.method === 'POST') {
        return handleCreateCheckout(request, env);
      }

      if (url.pathname === '/api/subscription/portal' && request.method === 'POST') {
        return handleBillingPortal(request, env);
      }

      if (url.pathname === '/api/webhooks/stripe' && request.method === 'POST') {
        return handleStripeWebhook(request, env);
      }

      if (url.pathname.startsWith('/api/agents')) {
        return handleAgents(request, env, url);
      }

      if (url.pathname.startsWith('/api/messages')) {
        return handleMessages(request, env, url);
      }

      if (url.pathname.startsWith('/api/presence')) {
        return handlePresence(request, env, url);
      }

      if (url.pathname.startsWith('/api/ai/agents')) {
        return handleAIAgents(request, env, url);
      }

      if (url.pathname.startsWith('/api/ai/memory')) {
        return handleAIMemory(request, env, url);
      }

      if (url.pathname.startsWith('/api/ai/tasks')) {
        return handleAITasks(request, env, url);
      }

      if (url.pathname.startsWith('/api/ai/collaborate')) {
        return handleAICollaborate(request, env, url);
      }

      if (url.pathname.startsWith('/api/ai/models')) {
        return handleAIModels(request, env, url);
      }

      if (url.pathname.startsWith('/api/ai/blueprints')) {
        return handleAIBlueprints(request, env, url);
      }

      if (url.pathname.startsWith('/api/ai/marketplace')) {
        return handleAIMarketplace(request, env, url);
      }

      if (url.pathname.startsWith('/api/ai/instances')) {
        return handleAIInstances(request, env, url);
      }

      return jsonResponse({ error: 'Not found' }, 404);
    } catch (error: any) {
      console.error('API Error:', error);
      return jsonResponse({ error: error.message }, 500);
    }
  },
};

// Helper: JSON response with CORS
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Helper: Generate user ID
function generateId(): string {
  return crypto.randomUUID();
}

// Helper: Hash API key
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Handler: Signup
async function handleSignup(request: Request, env: Env): Promise<Response> {
  const { email, name, plan = 'free' } = await request.json();

  if (!email || !name) {
    return jsonResponse({ error: 'Email and name required' }, 400);
  }

  const userId = generateId();
  const now = Math.floor(Date.now() / 1000);

  try {
    // Create user
    await env.BLACKROAD_SAAS.prepare(
      'INSERT INTO users (id, email, name, created_at) VALUES (?, ?, ?, ?)'
    )
      .bind(userId, email, name, now)
      .run();

    // Create free subscription
    const subId = generateId();
    await env.BLACKROAD_SAAS.prepare(
      'INSERT INTO subscriptions (id, user_id, tier, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    )
      .bind(subId, userId, 'free', 'active', now, now)
      .run();

    if (plan === 'free') {
      return jsonResponse({
        success: true,
        userId,
        message: 'Account created successfully'
      });
    }

    // For paid plans, create Stripe checkout session
    if (plan === 'pro') {
      const checkoutUrl = await createStripeCheckout(env, userId, email, 'pro');
      return jsonResponse({ success: true, userId, checkoutUrl });
    }

    return jsonResponse({ error: 'Invalid plan' }, 400);
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint')) {
      return jsonResponse({ error: 'Email already exists' }, 409);
    }
    throw error;
  }
}

// Handler: Login
async function handleLogin(request: Request, env: Env): Promise<Response> {
  const { email, password } = await request.json();

  if (!email) {
    return jsonResponse({ error: 'Email required' }, 400);
  }

  const result = await env.BLACKROAD_SAAS.prepare(
    'SELECT * FROM users WHERE email = ?'
  )
    .bind(email)
    .first();

  if (!result) {
    return jsonResponse({ error: 'Invalid credentials' }, 401);
  }

  // Update last login
  await env.BLACKROAD_SAAS.prepare(
    'UPDATE users SET last_login = ? WHERE id = ?'
  )
    .bind(Math.floor(Date.now() / 1000), result.id)
    .run();

  // Generate JWT token
  const token = await generateJWT({
    userId: result.id,
    email: result.email
  }, env.JWT_SECRET);

  return jsonResponse({
    success: true,
    user: {
      id: result.id,
      email: result.email,
      name: result.name,
    },
    token,
  });
}

// Helper: Generate JWT
async function generateJWT(payload: any, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claims = { ...payload, iat: now, exp: now + 86400 * 30 }; // 30 days

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(claims));
  const message = `${encodedHeader}.${encodedPayload}`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${message}.${encodedSignature}`;
}

// Handler: Get user
async function handleGetUser(request: Request, env: Env): Promise<Response> {
  // In production, extract user ID from JWT
  const userId = request.headers.get('X-User-ID');

  if (!userId) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const user = await env.BLACKROAD_SAAS.prepare(
    'SELECT u.*, s.tier, s.status FROM users u LEFT JOIN subscriptions s ON u.id = s.user_id WHERE u.id = ?'
  )
    .bind(userId)
    .first();

  if (!user) {
    return jsonResponse({ error: 'User not found' }, 404);
  }

  return jsonResponse({ user });
}

// Handler: Create Stripe checkout
async function handleCreateCheckout(request: Request, env: Env): Promise<Response> {
  const { userId, plan } = await request.json();
  const user = await env.BLACKROAD_SAAS.prepare('SELECT email FROM users WHERE id = ?').bind(userId).first();

  if (!user) {
    return jsonResponse({ error: 'User not found' }, 404);
  }

  const checkoutUrl = await createStripeCheckout(env, userId, user.email as string, plan);
  return jsonResponse({ checkoutUrl });
}

// Helper: Create Stripe checkout session
async function createStripeCheckout(env: Env, userId: string, email: string, plan: string): Promise<string> {
  const priceId = plan === 'pro'
    ? 'price_1SjYNiChUUSEbzyhuaR57Blg' // BlackRoad Pro: $49/mo with 14-day trial (LIVE)
    : plan === 'enterprise'
    ? 'price_1SjYOCChUUSEbzyhzhzchK3g' // BlackRoad Enterprise: $299/mo with 14-day trial (LIVE)
    : '';

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'mode': 'subscription',
      'customer_email': email,
      'client_reference_id': userId,
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'success_url': 'https://blackroad.io/success',
      'cancel_url': 'https://blackroad.io/cancel',
      'metadata[user_id]': userId,
    }),
  });

  const session = await response.json();
  return session.url;
}

// Handler: Billing portal
async function handleBillingPortal(request: Request, env: Env): Promise<Response> {
  const { customerId } = await request.json();

  const response = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'customer': customerId,
      'return_url': 'https://blackroad.io/dashboard',
    }),
  });

  const session = await response.json();
  return jsonResponse({ url: session.url });
}

// Handler: Stripe webhooks
async function handleStripeWebhook(request: Request, env: Env): Promise<Response> {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return jsonResponse({ error: 'No signature' }, 400);
  }

  // In production, verify webhook signature here

  const event = JSON.parse(body);

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object, env);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object, env);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(event.data.object, env);
      break;
  }

  return jsonResponse({ received: true });
}

async function handleCheckoutCompleted(session: any, env: Env) {
  const userId = session.metadata.user_id || session.client_reference_id;
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  // Update user with Stripe customer ID
  await env.BLACKROAD_SAAS.prepare(
    'UPDATE users SET stripe_customer_id = ? WHERE id = ?'
  )
    .bind(customerId, userId)
    .run();

  // Update subscription to pro
  await env.BLACKROAD_SAAS.prepare(
    'UPDATE subscriptions SET tier = ?, status = ?, stripe_subscription_id = ?, updated_at = ? WHERE user_id = ?'
  )
    .bind('pro', 'active', subscriptionId, Math.floor(Date.now() / 1000), userId)
    .run();
}

async function handleSubscriptionUpdated(subscription: any, env: Env) {
  await env.BLACKROAD_SAAS.prepare(
    'UPDATE subscriptions SET status = ?, current_period_start = ?, current_period_end = ?, updated_at = ? WHERE stripe_subscription_id = ?'
  )
    .bind(
      subscription.status,
      subscription.current_period_start,
      subscription.current_period_end,
      Math.floor(Date.now() / 1000),
      subscription.id
    )
    .run();
}

async function handleSubscriptionCanceled(subscription: any, env: Env) {
  await env.BLACKROAD_SAAS.prepare(
    'UPDATE subscriptions SET status = ?, updated_at = ? WHERE stripe_subscription_id = ?'
  )
    .bind('canceled', Math.floor(Date.now() / 1000), subscription.id)
    .run();
}

// Handler: Agents CRUD
async function handleAgents(request: Request, env: Env, url: URL): Promise<Response> {
  const userId = request.headers.get('X-User-ID');

  if (!userId) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  if (request.method === 'GET') {
    // List user's agents
    const agents = await env.BLACKROAD_SAAS.prepare(
      'SELECT * FROM agent_deployments WHERE user_id = ? ORDER BY created_at DESC'
    )
      .bind(userId)
      .all();

    return jsonResponse({ agents: agents.results });
  }

  if (request.method === 'POST') {
    // Create new agent
    const { name, type, config } = await request.json();
    const agentId = generateId();
    const now = Math.floor(Date.now() / 1000);

    await env.BLACKROAD_SAAS.prepare(
      'INSERT INTO agent_deployments (id, user_id, name, type, status, config, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )
      .bind(agentId, userId, name, type, 'running', JSON.stringify(config), now, now)
      .run();

    return jsonResponse({ success: true, agentId }, 201);
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
}

// Handler: Messages
async function handleMessages(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname.replace('/api/messages', '');
  
  // GET /api/messages/channels - List all channels
  if (path === '/channels' && request.method === 'GET') {
    const channels = await env.BLACKROAD_SAAS.prepare(
      'SELECT * FROM channels ORDER BY created_at DESC'
    ).all();
    return jsonResponse({ channels: channels.results });
  }
  
  // POST /api/messages/channels - Create new channel
  if (path === '/channels' && request.method === 'POST') {
    const { name, type = 'public' } = await request.json();
    const userId = request.headers.get('X-User-ID') || 'system';
    
    const channelId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    
    await env.BLACKROAD_SAAS.prepare(
      'INSERT INTO channels (id, name, type, created_by, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(channelId, name, type, userId, now).run();
    
    return jsonResponse({ success: true, channelId });
  }
  
  // GET /api/messages/channel/:id - Get messages from channel
  if (path.match(/^\/channel\/[^\/]+$/) && request.method === 'GET') {
    const channelId = path.split('/').pop();
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const before = url.searchParams.get('before');
    
    let query = 'SELECT * FROM messages WHERE channel_id = ?';
    const params: any[] = [channelId];
    
    if (before) {
      query += ' AND created_at < ?';
      params.push(parseInt(before));
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);
    
    const messages = await env.BLACKROAD_SAAS.prepare(query)
      .bind(...params)
      .all();
    
    return jsonResponse({ messages: messages.results.reverse() });
  }
  
  // POST /api/messages/send - Send a message
  if (path === '/send' && request.method === 'POST') {
    const { channelId, content, agentId } = await request.json();
    const userId = request.headers.get('X-User-ID');
    
    if (!channelId || !content) {
      return jsonResponse({ error: 'Channel ID and content required' }, 400);
    }
    
    const messageId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    
    await env.BLACKROAD_SAAS.prepare(
      'INSERT INTO messages (id, channel_id, user_id, agent_id, content, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(messageId, channelId, userId, agentId, content, now).run();
    
    return jsonResponse({ success: true, messageId, timestamp: now });
  }

  // POST /api/messages/vote - Vote on a message
  if (path === '/vote' && request.method === 'POST') {
    const { messageId, voteType, agentId } = await request.json();
    const userId = request.headers.get('X-User-ID');

    if (!messageId || !voteType || (!userId && !agentId)) {
      return jsonResponse({ error: 'Message ID, vote type, and voter ID required' }, 400);
    }

    const now = Math.floor(Date.now() / 1000);

    // Insert or update vote
    await env.BLACKROAD_SAAS.prepare(`
      INSERT INTO message_votes (message_id, user_id, agent_id, vote_type, created_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (message_id, user_id, agent_id) DO UPDATE SET
        vote_type = excluded.vote_type
    `).bind(messageId, userId, agentId, voteType, now).run();

    // Update message vote counts
    const upvotes = await env.BLACKROAD_SAAS.prepare(
      'SELECT COUNT(*) as count FROM message_votes WHERE message_id = ? AND vote_type = ?'
    ).bind(messageId, 'up').first();

    const downvotes = await env.BLACKROAD_SAAS.prepare(
      'SELECT COUNT(*) as count FROM message_votes WHERE message_id = ? AND vote_type = ?'
    ).bind(messageId, 'down').first();

    await env.BLACKROAD_SAAS.prepare(
      'UPDATE messages SET upvotes = ?, downvotes = ? WHERE id = ?'
    ).bind(upvotes.count, downvotes.count, messageId).run();

    return jsonResponse({ success: true, upvotes: upvotes.count, downvotes: downvotes.count });
  }

  // GET /api/messages/leaderboard - Get agent leaderboard
  if (path === '/leaderboard' && request.method === 'GET') {
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Calculate karma for each agent
    const leaderboard = await env.BLACKROAD_SAAS.prepare(`
      SELECT
        COALESCE(m.agent_id, m.user_id) as agent_id,
        COUNT(DISTINCT m.id) as message_count,
        COALESCE(SUM(m.upvotes), 0) as total_upvotes,
        COALESCE(SUM(m.downvotes), 0) as total_downvotes,
        (COALESCE(SUM(m.upvotes), 0) - COALESCE(SUM(m.downvotes), 0)) as karma
      FROM messages m
      WHERE COALESCE(m.agent_id, m.user_id) IS NOT NULL
      GROUP BY COALESCE(m.agent_id, m.user_id)
      ORDER BY karma DESC
      LIMIT ?
    `).bind(limit).all();

    return jsonResponse({ leaderboard: leaderboard.results });
  }

  // GET /api/messages/search - Search messages
  if (path === '/search' && request.method === 'GET') {
    const query = url.searchParams.get('q');
    const channelId = url.searchParams.get('channel');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    if (!query) {
      return jsonResponse({ error: 'Search query required' }, 400);
    }

    let sql = 'SELECT * FROM messages WHERE content LIKE ?';
    const params: any[] = [`%${query}%`];

    if (channelId) {
      sql += ' AND channel_id = ?';
      params.push(channelId);
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const results = await env.BLACKROAD_SAAS.prepare(sql).bind(...params).all();

    return jsonResponse({ results: results.results });
  }

  // GET /api/messages/achievements - Get all achievements
  if (path === '/achievements' && request.method === 'GET') {
    const achievements = await env.BLACKROAD_SAAS.prepare(
      'SELECT * FROM achievements ORDER BY requirement_value ASC'
    ).all();

    return jsonResponse({ achievements: achievements.results });
  }

  // GET /api/messages/achievements/user/:id - Get user achievements
  if (path.match(/^\/achievements\/user\/[^\/]+$/) && request.method === 'GET') {
    const agentId = path.split('/').pop();

    const earned = await env.BLACKROAD_SAAS.prepare(`
      SELECT a.*, ua.earned_at
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.agent_id = ?
      ORDER BY ua.earned_at DESC
    `).bind(agentId).all();

    return jsonResponse({ achievements: earned.results });
  }

  // GET /api/messages/analytics - Get analytics data
  if (path === '/analytics' && request.method === 'GET') {
    const timeRange = url.searchParams.get('range') || '24h';

    let hoursAgo = 24;
    if (timeRange === '1h') hoursAgo = 1;
    if (timeRange === '7d') hoursAgo = 168;
    if (timeRange === '30d') hoursAgo = 720;

    const since = Math.floor(Date.now() / 1000) - (hoursAgo * 3600);

    // Total messages
    const totalMessages = await env.BLACKROAD_SAAS.prepare(
      'SELECT COUNT(*) as count FROM messages WHERE created_at > ?'
    ).bind(since).first();

    // Active agents
    const activeAgents = await env.BLACKROAD_SAAS.prepare(
      'SELECT COUNT(DISTINCT COALESCE(agent_id, user_id)) as count FROM messages WHERE created_at > ?'
    ).bind(since).first();

    // Messages per channel
    const channelStats = await env.BLACKROAD_SAAS.prepare(`
      SELECT c.name, COUNT(m.id) as message_count
      FROM channels c
      LEFT JOIN messages m ON c.id = m.channel_id AND m.created_at > ?
      GROUP BY c.id, c.name
      ORDER BY message_count DESC
    `).bind(since).all();

    // Top agents
    const topAgents = await env.BLACKROAD_SAAS.prepare(`
      SELECT
        COALESCE(agent_id, user_id) as agent_id,
        COUNT(*) as message_count,
        SUM(upvotes) as total_upvotes
      FROM messages
      WHERE created_at > ?
      GROUP BY COALESCE(agent_id, user_id)
      ORDER BY message_count DESC
      LIMIT 5
    `).bind(since).all();

    return jsonResponse({
      totalMessages: totalMessages.count,
      activeAgents: activeAgents.count,
      channelStats: channelStats.results,
      topAgents: topAgents.results,
      timeRange,
    });
  }

  return jsonResponse({ error: 'Not found' }, 404);
}

// Handler: Presence
async function handlePresence(request: Request, env: Env, url: URL): Promise<Response> {
  // GET /api/presence - Get all online users/agents
  if (url.pathname === '/api/presence' && request.method === 'GET') {
    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300;
    
    const presence = await env.BLACKROAD_SAAS.prepare(
      'SELECT * FROM presence WHERE last_seen > ? ORDER BY last_seen DESC'
    ).bind(fiveMinutesAgo).all();
    
    return jsonResponse({ presence: presence.results });
  }
  
  // POST /api/presence/update - Update user/agent status
  if (url.pathname === '/api/presence/update' && request.method === 'POST') {
    const { userId, agentId, status = 'online', activity } = await request.json();
    const now = Math.floor(Date.now() / 1000);
    
    await env.BLACKROAD_SAAS.prepare(`
      INSERT INTO presence (user_id, agent_id, status, last_seen, current_activity) 
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (user_id, agent_id) DO UPDATE SET 
        status = excluded.status,
        last_seen = excluded.last_seen,
        current_activity = excluded.current_activity
    `).bind(userId, agentId, status, now, activity).run();
    
    return jsonResponse({ success: true });
  }

  return jsonResponse({ error: 'Not found' }, 404);
}

// Handler: AI Agents
async function handleAIAgents(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname.replace('/api/ai/agents', '');

  // GET /api/ai/agents - List all agents
  if (path === '' && request.method === 'GET') {
    const agents = await env.BLACKROAD_SAAS.prepare(
      'SELECT * FROM agents ORDER BY name ASC'
    ).all();

    return jsonResponse({ agents: agents.results });
  }

  // GET /api/ai/agents/:id - Get specific agent
  if (path.match(/^\/[^\/]+$/) && request.method === 'GET') {
    const agentId = path.substring(1);

    const agent = await env.BLACKROAD_SAAS.prepare(
      'SELECT * FROM agents WHERE id = ?'
    ).bind(agentId).first();

    if (!agent) {
      return jsonResponse({ error: 'Agent not found' }, 404);
    }

    return jsonResponse({ agent });
  }

  return jsonResponse({ error: 'Not found' }, 404);
}

// Handler: AI Memory
async function handleAIMemory(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname.replace('/api/ai/memory', '');

  // POST /api/ai/memory - Store memory
  if (path === '' && request.method === 'POST') {
    const { agentId, userId, type, content, importance } = await request.json();

    const memoryId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    await env.BLACKROAD_SAAS.prepare(`
      INSERT INTO agent_memories (id, agent_id, user_id, memory_type, content, importance, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(memoryId, agentId, userId, type, content, importance || 5, now).run();

    return jsonResponse({ success: true, memoryId });
  }

  // GET /api/ai/memory/:agentId - Get agent memories
  if (path.match(/^\/[^\/]+$/) && request.method === 'GET') {
    const agentId = path.substring(1);
    const limit = parseInt(url.searchParams.get('limit') || '50');

    const memories = await env.BLACKROAD_SAAS.prepare(
      'SELECT * FROM agent_memories WHERE agent_id = ? ORDER BY importance DESC, created_at DESC LIMIT ?'
    ).bind(agentId, limit).all();

    return jsonResponse({ memories: memories.results });
  }

  return jsonResponse({ error: 'Not found' }, 404);
}

// Handler: AI Tasks
async function handleAITasks(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname.replace('/api/ai/tasks', '');

  // POST /api/ai/tasks - Create task
  if (path === '' && request.method === 'POST') {
    const { type, assignedTo, priority, data } = await request.json();

    const taskId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    await env.BLACKROAD_SAAS.prepare(`
      INSERT INTO tasks (id, type, assigned_to, status, priority, data, created_at)
      VALUES (?, ?, ?, 'pending', ?, ?, ?)
    `).bind(taskId, type, assignedTo, priority || 'normal', JSON.stringify(data), now).run();

    return jsonResponse({ success: true, taskId });
  }

  // GET /api/ai/tasks - List tasks
  if (path === '' && request.method === 'GET') {
    const assignedTo = url.searchParams.get('assigned_to');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params: any[] = [];

    if (assignedTo) {
      query += ' AND assigned_to = ?';
      params.push(assignedTo);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const tasks = await env.BLACKROAD_SAAS.prepare(query).bind(...params).all();

    return jsonResponse({ tasks: tasks.results });
  }

  return jsonResponse({ error: 'Not found' }, 404);
}

// Handler: AI Collaborate (the magic!)
async function handleAICollaborate(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname.replace('/api/ai/collaborate', '');

  // POST /api/ai/collaborate/request - Request agent collaboration
  if (path === '/request' && request.method === 'POST') {
    const { fromAgentId, toAgentId, action, data } = await request.json();

    const taskId = crypto.randomUUID();
    const messageId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    // Create task
    await env.BLACKROAD_SAAS.prepare(`
      INSERT INTO tasks (id, type, requester_agent_id, assigned_to, status, data, created_at)
      VALUES (?, ?, ?, ?, 'assigned', ?, ?)
    `).bind(taskId, action, fromAgentId, toAgentId, JSON.stringify(data), now).run();

    // Create message
    await env.BLACKROAD_SAAS.prepare(`
      INSERT INTO agent_messages (id, from_agent_id, to_agent_id, message_type, content, requires_response, created_at)
      VALUES (?, ?, ?, 'request', ?, TRUE, ?)
    `).bind(messageId, fromAgentId, toAgentId, JSON.stringify({ action, data, taskId }), now).run();

    return jsonResponse({ success: true, taskId, messageId });
  }

  // POST /api/ai/collaborate/learn - Record learning
  if (path === '/learn' && request.method === 'POST') {
    const { agentId, eventType, lesson } = await request.json();

    const learningId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    await env.BLACKROAD_SAAS.prepare(`
      INSERT INTO agent_learning (id, agent_id, event_type, lesson_learned, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(learningId, agentId, eventType, lesson, now).run();

    return jsonResponse({ success: true, learningId });
  }

  return jsonResponse({ error: 'Not found' }, 404);
}

// Handler: AI Models (NBA 2K-style model registry)
async function handleAIModels(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname.replace('/api/ai/models', '');

  // GET /api/ai/models - List all AI models with stats
  if (path === '' && request.method === 'GET') {
    const provider = url.searchParams.get('provider');
    const minRating = url.searchParams.get('min_rating');

    let query = 'SELECT * FROM ai_models WHERE 1=1';
    const params: any[] = [];

    if (provider) {
      query += ' AND provider = ?';
      params.push(provider);
    }

    if (minRating) {
      query += ' AND overall_rating >= ?';
      params.push(parseInt(minRating));
    }

    query += ' ORDER BY overall_rating DESC';

    const models = await env.BLACKROAD_SAAS.prepare(query).bind(...params).all();

    return jsonResponse({ models: models.results });
  }

  // GET /api/ai/models/:id - Get specific model details
  if (path.match(/^\/[^\/]+$/) && request.method === 'GET') {
    const modelId = path.substring(1);

    const model = await env.BLACKROAD_SAAS.prepare(
      'SELECT * FROM ai_models WHERE id = ?'
    ).bind(modelId).first();

    if (!model) {
      return jsonResponse({ error: 'Model not found' }, 404);
    }

    // Get performance stats
    const performance = await env.BLACKROAD_SAAS.prepare(`
      SELECT
        AVG(response_time_ms) as avg_response_time,
        AVG(cost) as avg_cost,
        AVG(user_rating) as avg_user_rating,
        COUNT(*) as total_uses
      FROM model_performance
      WHERE model_id = ?
    `).bind(modelId).first();

    return jsonResponse({
      model,
      performance: performance || {
        avg_response_time: 0,
        avg_cost: 0,
        avg_user_rating: 0,
        total_uses: 0
      }
    });
  }

  // GET /api/ai/models/compare/:id1/:id2 - Compare two models
  if (path.match(/^\/compare\/[^\/]+\/[^\/]+$/) && request.method === 'GET') {
    const [, , id1, id2] = path.split('/');

    const model1 = await env.BLACKROAD_SAAS.prepare(
      'SELECT * FROM ai_models WHERE id = ?'
    ).bind(id1).first();

    const model2 = await env.BLACKROAD_SAAS.prepare(
      'SELECT * FROM ai_models WHERE id = ?'
    ).bind(id2).first();

    if (!model1 || !model2) {
      return jsonResponse({ error: 'One or both models not found' }, 404);
    }

    return jsonResponse({
      model1,
      model2,
      winner: {
        intelligence: model1.stat_intelligence > model2.stat_intelligence ? id1 : id2,
        creativity: model1.stat_creativity > model2.stat_creativity ? id1 : id2,
        speed: model1.stat_speed > model2.stat_speed ? id1 : id2,
        cost: model1.stat_cost_efficiency > model2.stat_cost_efficiency ? id1 : id2,
        overall: model1.overall_rating > model2.overall_rating ? id1 : id2,
      }
    });
  }

  return jsonResponse({ error: 'Not found' }, 404);
}

// Handler: AI Blueprints (agent configurations)
async function handleAIBlueprints(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname.replace('/api/ai/blueprints', '');

  // GET /api/ai/blueprints - List blueprints
  if (path === '' && request.method === 'GET') {
    const userId = url.searchParams.get('user_id');
    const isPublic = url.searchParams.get('public');

    let query = 'SELECT * FROM agent_blueprints WHERE 1=1';
    const params: any[] = [];

    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    if (isPublic === 'true') {
      query += ' AND is_public = TRUE';
    }

    query += ' ORDER BY created_at DESC';

    const blueprints = await env.BLACKROAD_SAAS.prepare(query).bind(...params).all();

    return jsonResponse({ blueprints: blueprints.results });
  }

  // POST /api/ai/blueprints - Create custom agent blueprint
  if (path === '' && request.method === 'POST') {
    const {
      userId,
      name,
      description,
      baseModelId,
      attributes,
      personality,
      features,
      customInstructions,
      constraints
    } = await request.json();

    const blueprintId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    await env.BLACKROAD_SAAS.prepare(`
      INSERT INTO agent_blueprints (
        id, user_id, name, description, base_model_id,
        attr_formality, attr_enthusiasm, attr_creativity, attr_empathy,
        personality_archetype, personality_tone, emoji_usage,
        feature_web_search, feature_code_execution, feature_memory_persistence,
        feature_learning_enabled, custom_instructions,
        max_tokens_per_response, temperature, cost_limit_per_day,
        is_public, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      blueprintId, userId, name, description, baseModelId,
      attributes?.formality || 50, attributes?.enthusiasm || 50,
      attributes?.creativity || 50, attributes?.empathy || 50,
      personality?.archetype, personality?.tone, personality?.emojiUsage || 'moderate',
      features?.webSearch || false, features?.codeExecution || false,
      features?.memoryPersistence || true, features?.learningEnabled || true,
      customInstructions,
      constraints?.maxTokens || 4000, constraints?.temperature || 0.7,
      constraints?.costLimit || 50.0,
      false, now
    ).run();

    return jsonResponse({ success: true, blueprintId });
  }

  // GET /api/ai/blueprints/:id - Get specific blueprint
  if (path.match(/^\/[^\/]+$/) && request.method === 'GET') {
    const blueprintId = path.substring(1);

    const blueprint = await env.BLACKROAD_SAAS.prepare(
      'SELECT * FROM agent_blueprints WHERE id = ?'
    ).bind(blueprintId).first();

    if (!blueprint) {
      return jsonResponse({ error: 'Blueprint not found' }, 404);
    }

    // Get base model info
    const model = await env.BLACKROAD_SAAS.prepare(
      'SELECT * FROM ai_models WHERE id = ?'
    ).bind(blueprint.base_model_id).first();

    return jsonResponse({ blueprint, baseModel: model });
  }

  // POST /api/ai/blueprints/:id/clone - Clone a blueprint
  if (path.match(/^\/[^\/]+\/clone$/) && request.method === 'POST') {
    const blueprintId = path.split('/')[1];
    const { userId } = await request.json();

    const original = await env.BLACKROAD_SAAS.prepare(
      'SELECT * FROM agent_blueprints WHERE id = ?'
    ).bind(blueprintId).first();

    if (!original) {
      return jsonResponse({ error: 'Blueprint not found' }, 404);
    }

    const newBlueprintId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    // Clone the blueprint
    await env.BLACKROAD_SAAS.prepare(`
      INSERT INTO agent_blueprints (
        id, user_id, name, description, base_model_id,
        attr_formality, attr_enthusiasm, attr_creativity, attr_empathy,
        personality_archetype, personality_tone, emoji_usage,
        feature_web_search, feature_code_execution, feature_memory_persistence,
        feature_learning_enabled, custom_instructions,
        max_tokens_per_response, temperature, cost_limit_per_day,
        is_public, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      newBlueprintId, userId, `${original.name} (Clone)`, original.description,
      original.base_model_id, original.attr_formality, original.attr_enthusiasm,
      original.attr_creativity, original.attr_empathy, original.personality_archetype,
      original.personality_tone, original.emoji_usage, original.feature_web_search,
      original.feature_code_execution, original.feature_memory_persistence,
      original.feature_learning_enabled, original.custom_instructions,
      original.max_tokens_per_response, original.temperature, original.cost_limit_per_day,
      false, now
    ).run();

    // Update clone count
    await env.BLACKROAD_SAAS.prepare(`
      UPDATE agent_blueprints SET clone_count = clone_count + 1 WHERE id = ?
    `).bind(blueprintId).run();

    return jsonResponse({ success: true, blueprintId: newBlueprintId });
  }

  return jsonResponse({ error: 'Not found' }, 404);
}

// Handler: AI Marketplace (browse and download templates)
async function handleAIMarketplace(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname.replace('/api/ai/marketplace', '');

  // GET /api/ai/marketplace - Browse marketplace templates
  if (path === '' && request.method === 'GET') {
    const category = url.searchParams.get('category');
    const sortBy = url.searchParams.get('sort_by') || 'downloads';

    let query = `
      SELECT
        b.*,
        m.category,
        m.downloads,
        m.active_instances,
        m.avg_rating,
        m.is_premium,
        m.price,
        am.name as model_name,
        am.provider as model_provider
      FROM agent_blueprints b
      JOIN marketplace_templates m ON b.id = m.blueprint_id
      JOIN ai_models am ON b.base_model_id = am.id
      WHERE b.is_template = TRUE
    `;

    const params: any[] = [];

    if (category) {
      query += ' AND m.category = ?';
      params.push(category);
    }

    // Sort
    if (sortBy === 'downloads') {
      query += ' ORDER BY m.downloads DESC';
    } else if (sortBy === 'rating') {
      query += ' ORDER BY m.avg_rating DESC';
    } else if (sortBy === 'recent') {
      query += ' ORDER BY b.created_at DESC';
    }

    const templates = await env.BLACKROAD_SAAS.prepare(query).bind(...params).all();

    return jsonResponse({ templates: templates.results });
  }

  // GET /api/ai/marketplace/featured - Get featured templates
  if (path === '/featured' && request.method === 'GET') {
    const templates = await env.BLACKROAD_SAAS.prepare(`
      SELECT
        b.*,
        m.category,
        m.downloads,
        m.active_instances,
        m.avg_rating,
        m.is_premium,
        m.price
      FROM agent_blueprints b
      JOIN marketplace_templates m ON b.id = m.blueprint_id
      WHERE b.is_template = TRUE AND m.avg_rating >= 4.5
      ORDER BY m.downloads DESC
      LIMIT 10
    `).all();

    return jsonResponse({ featured: templates.results });
  }

  return jsonResponse({ error: 'Not found' }, 404);
}

// Handler: AI Instances (deployed agents from blueprints)
async function handleAIInstances(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname.replace('/api/ai/instances', '');

  // POST /api/ai/instances - Deploy an agent from blueprint
  if (path === '' && request.method === 'POST') {
    const { blueprintId, userId, name } = await request.json();

    const blueprint = await env.BLACKROAD_SAAS.prepare(
      'SELECT * FROM agent_blueprints WHERE id = ?'
    ).bind(blueprintId).first();

    if (!blueprint) {
      return jsonResponse({ error: 'Blueprint not found' }, 404);
    }

    const instanceId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    await env.BLACKROAD_SAAS.prepare(`
      INSERT INTO agent_instances (id, blueprint_id, user_id, name, status, created_at)
      VALUES (?, ?, ?, ?, 'active', ?)
    `).bind(instanceId, blueprintId, userId, name, now).run();

    // Update active instances count in marketplace
    await env.BLACKROAD_SAAS.prepare(`
      UPDATE marketplace_templates
      SET active_instances = active_instances + 1,
          downloads = downloads + 1
      WHERE blueprint_id = ?
    `).bind(blueprintId).run();

    return jsonResponse({ success: true, instanceId });
  }

  // GET /api/ai/instances - List user's instances
  if (path === '' && request.method === 'GET') {
    const userId = url.searchParams.get('user_id');

    if (!userId) {
      return jsonResponse({ error: 'user_id required' }, 400);
    }

    const instances = await env.BLACKROAD_SAAS.prepare(`
      SELECT
        i.*,
        b.name as blueprint_name,
        b.base_model_id,
        am.name as model_name,
        am.provider as model_provider
      FROM agent_instances i
      JOIN agent_blueprints b ON i.blueprint_id = b.id
      JOIN ai_models am ON b.base_model_id = am.id
      WHERE i.user_id = ?
      ORDER BY i.created_at DESC
    `).bind(userId).all();

    return jsonResponse({ instances: instances.results });
  }

  // GET /api/ai/instances/:id/stats - Get instance performance stats
  if (path.match(/^\/[^\/]+\/stats$/) && request.method === 'GET') {
    const instanceId = path.split('/')[1];

    const instance = await env.BLACKROAD_SAAS.prepare(
      'SELECT * FROM agent_instances WHERE id = ?'
    ).bind(instanceId).first();

    if (!instance) {
      return jsonResponse({ error: 'Instance not found' }, 404);
    }

    return jsonResponse({
      instance,
      stats: {
        messages_processed: instance.messages_processed,
        tokens_used: instance.tokens_used,
        cost_incurred: instance.cost_incurred,
        avg_response_time_ms: instance.avg_response_time_ms,
        uptime_percentage: instance.uptime_percentage,
        user_satisfaction: instance.user_satisfaction,
        total_ratings: instance.total_ratings,
      }
    });
  }

  return jsonResponse({ error: 'Not found' }, 404);
}
