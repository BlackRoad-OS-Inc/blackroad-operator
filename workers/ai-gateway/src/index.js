// ============================================================================
// BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
// ============================================================================
// BlackRoad AI Gateway — Production Edge AI Routing
// OpenAI-compatible API at api.blackroad.io
//
// Endpoints:
//   POST /v1/chat/completions   — OpenAI-compatible (streaming + non-streaming)
//   POST /v1/embeddings         — Embedding generation
//   GET  /v1/models             — List all routable models
//   GET  /v1/providers          — Provider status
//   POST /v1/keys/create        — Generate API key (admin)
//   GET  /v1/keys/usage         — Usage for current API key
//   GET  /v1/fleet              — Pi fleet status
//   GET  /healthz               — Health check
//   GET  /metrics               — Request metrics (admin)
//   GET  /                      — API documentation

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-BlackRoad-Chat',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    try {
      // ─── Public endpoints (no auth) ───
      if (path === '/healthz' || path === '/health') {
        return json({ status: 'ok', gateway: 'blackroad-ai-gateway', version: 2, ts: new Date().toISOString() }, 200, cors)
      }

      if (path === '/' && request.method === 'GET') {
        return json(API_DOCS, 200, cors)
      }

      if (path === '/v1/models' && request.method === 'GET') {
        return json({
          object: 'list',
          data: MODEL_TABLE.map(m => ({
            id: m.id, object: 'model', created: 1710000000,
            owned_by: `blackroad-${m.provider}`,
            provider: m.provider, speed: m.speed || 'standard',
            tier: m.tier || 'standard'
          }))
        }, 200, cors)
      }

      if (path === '/v1/providers' && request.method === 'GET') {
        return json({ providers: PROVIDERS.map(p => ({ name: p.name, format: p.format })) }, 200, cors)
      }

      // ─── Authenticated endpoints ───
      const authHeader = request.headers.get('Authorization') || ''
      const token = authHeader.replace(/^Bearer\s+/i, '').trim()

      // Allow chat.blackroad.io to use a shared anonymous key for starter tier
      const isAnonymousChat = path === '/v1/chat/completions' && !token && request.headers.get('X-BlackRoad-Chat') === 'true'

      if (path === '/v1/chat/completions' && request.method === 'POST') {
        let keyData = null

        if (isAnonymousChat) {
          // Anonymous chat — rate-limited, starter tier only
          keyData = { name: 'anonymous-chat', tier: 'starter', rate_limit: 10, daily_limit: 50, user_id: 'anonymous' }
        } else if (token) {
          keyData = await validateApiKey(env, token)
          if (!keyData) {
            return json({ error: { message: 'Invalid API key. Get one at https://blackroad.io/signup', type: 'auth_error', code: 'invalid_api_key' } }, 401, cors)
          }
        } else {
          return json({ error: { message: 'API key required. Set Authorization: Bearer br-xxx or get a key at https://blackroad.io/signup', type: 'auth_error', code: 'missing_api_key' } }, 401, cors)
        }

        // Rate limit check
        const rateLimitResult = await checkRateLimit(env, keyData)
        if (!rateLimitResult.allowed) {
          return json({
            error: {
              message: `Rate limit exceeded. ${rateLimitResult.reason}`,
              type: 'rate_limit_error',
              code: 'rate_limit_exceeded'
            }
          }, 429, { ...cors, 'Retry-After': '60', 'X-RateLimit-Limit': String(keyData.rate_limit || 60), 'X-RateLimit-Remaining': '0' })
        }

        // Tier-based model access
        const result = await handleChatCompletions(request, env, cors, keyData)

        // Log usage asynchronously
        env.ctx?.waitUntil?.(logUsage(env, keyData, request))

        return result
      }

      // ─── Key management (admin only) ───
      if (path === '/v1/keys/create' && request.method === 'POST') {
        const adminKey = env.ADMIN_API_KEY
        if (!adminKey || token !== adminKey) {
          return json({ error: { message: 'Admin access required', type: 'auth_error' } }, 403, cors)
        }
        return await handleCreateKey(request, env, cors)
      }

      // ─── Usage for current key ───
      if (path === '/v1/keys/usage' && request.method === 'GET') {
        if (!token) return json({ error: { message: 'API key required' } }, 401, cors)
        const keyData = await validateApiKey(env, token)
        if (!keyData) return json({ error: { message: 'Invalid API key' } }, 401, cors)
        return await handleGetUsage(env, keyData, cors)
      }

      // ─── Fleet status (static) ───
      if (path === '/v1/fleet') {
        return json({ fleet: FLEET_NODES }, 200, cors)
      }

      // ─── Fleet health (via tunnel) ───
      if (path === '/v1/fleet/health') {
        const start = Date.now()
        try {
          const controller = new AbortController()
          const timer = setTimeout(() => controller.abort(), 8000)
          const res = await fetch('http://159.65.43.12:11435/api/tags', { signal: controller.signal })
          clearTimeout(timer)
          if (res.ok) {
            const data = await res.json()
            const modelCount = data.models?.length || 0
            const modelNames = (data.models || []).map(m => m.name)
            return json({
              fleet_health: 'online',
              tunnel: 'ollama.blackroad.io',
              models: modelCount,
              model_list: modelNames,
              latency_ms: Date.now() - start,
              tops: 52,
              nodes: FLEET_NODES.map(n => ({ name: n.name, models: n.models.length })),
              checked_at: new Date().toISOString()
            }, 200, cors)
          }
          return json({ fleet_health: 'error', latency_ms: Date.now() - start }, 502, cors)
        } catch (e) {
          return json({ fleet_health: 'offline', error: e.message, latency_ms: Date.now() - start }, 503, cors)
        }
      }

      // ─── Metrics (admin) ───
      if (path === '/metrics') {
        const adminKey = env.ADMIN_API_KEY
        if (!adminKey || token !== adminKey) {
          return json({ error: { message: 'Admin access required' } }, 403, cors)
        }
        return await handleMetrics(env, cors)
      }

      return json({ error: 'Not found. See / for API docs.' }, 404, cors)
    } catch (err) {
      return json({ error: { message: err.message, type: 'server_error' } }, 500, cors)
    }
  }
}

// ═══════════════════════════════════════════
// API KEY MANAGEMENT
// ═══════════════════════════════════════════

async function validateApiKey(env, key) {
  if (!key || !key.startsWith('br-')) return null
  try {
    const data = await env.AI_STATE.get(`apikey:${key}`, 'json')
    if (!data) return null
    if (data.revoked) return null
    if (data.expires_at && new Date(data.expires_at) < new Date()) return null
    return data
  } catch {
    return null
  }
}

async function checkRateLimit(env, keyData) {
  const rateLimit = keyData.rate_limit || TIER_LIMITS[keyData.tier]?.rpm || 20
  const dailyLimit = keyData.daily_limit || TIER_LIMITS[keyData.tier]?.daily || 1000
  const key = keyData.name || keyData.user_id || 'unknown'

  try {
    // Per-minute rate limiting via KV
    const minuteKey = `rl:${key}:${Math.floor(Date.now() / 60000)}`
    const minuteCount = parseInt(await env.AI_STATE.get(minuteKey) || '0')
    if (minuteCount >= rateLimit) {
      return { allowed: false, reason: `${rateLimit} requests per minute limit reached. Upgrade at https://blackroad.io/pricing` }
    }

    // Daily limit
    const dayKey = `rl:${key}:day:${new Date().toISOString().slice(0, 10)}`
    const dayCount = parseInt(await env.AI_STATE.get(dayKey) || '0')
    if (dayCount >= dailyLimit) {
      return { allowed: false, reason: `${dailyLimit} requests per day limit reached. Upgrade at https://blackroad.io/pricing` }
    }

    // Increment counters
    await env.AI_STATE.put(minuteKey, String(minuteCount + 1), { expirationTtl: 120 })
    await env.AI_STATE.put(dayKey, String(dayCount + 1), { expirationTtl: 86400 * 2 })

    return { allowed: true, remaining: rateLimit - minuteCount - 1 }
  } catch {
    return { allowed: true, remaining: rateLimit }
  }
}

const TIER_LIMITS = {
  starter:    { rpm: 10,   daily: 50,    models: ['starter'] },
  sovereign:  { rpm: 60,   daily: 5000,  models: ['starter', 'fast', 'standard'] },
  enterprise: { rpm: 300,  daily: 50000, models: ['starter', 'fast', 'standard', 'premium'] },
}

async function handleCreateKey(request, env, cors) {
  const body = await request.json()
  const name = body.name || `key-${Date.now()}`
  const tier = body.tier || 'starter'
  const userId = body.user_id || body.email || 'unknown'

  // Generate key: br-{random}
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  const key = 'br-' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')

  const keyData = {
    name,
    key_prefix: key.slice(0, 10) + '...',
    tier,
    user_id: userId,
    rate_limit: TIER_LIMITS[tier]?.rpm || 20,
    daily_limit: TIER_LIMITS[tier]?.daily || 1000,
    created_at: new Date().toISOString(),
    revoked: false
  }

  await env.AI_STATE.put(`apikey:${key}`, JSON.stringify(keyData))

  // Store in D1 for querying
  try {
    await env.DB.prepare(
      `INSERT INTO api_keys (key_hash, name, tier, user_id, created_at) VALUES (?, ?, ?, ?, ?)`
    ).bind(key.slice(0, 10), name, tier, userId, keyData.created_at).run()
  } catch {}

  return json({
    key,
    name,
    tier,
    rate_limit: keyData.rate_limit,
    daily_limit: keyData.daily_limit,
    message: 'Store this key securely. It will not be shown again.'
  }, 201, cors)
}

async function handleGetUsage(env, keyData, cors) {
  const key = keyData.name || keyData.user_id || 'unknown'
  const today = new Date().toISOString().slice(0, 10)
  const dayKey = `rl:${key}:day:${today}`
  const dayCount = parseInt(await env.AI_STATE.get(dayKey) || '0')

  const limits = TIER_LIMITS[keyData.tier] || TIER_LIMITS.free

  return json({
    tier: keyData.tier,
    usage: {
      today: dayCount,
      daily_limit: limits.daily,
      remaining: Math.max(0, limits.daily - dayCount),
      rate_limit_rpm: limits.rpm
    },
    key_prefix: keyData.key_prefix || key.slice(0, 10),
    created_at: keyData.created_at,
    upgrade_url: 'https://blackroad.io/pricing'
  }, 200, cors)
}

async function logUsage(env, keyData, request) {
  try {
    const key = keyData.name || keyData.user_id || 'unknown'
    const totalKey = 'metrics:total_requests'
    const count = parseInt(await env.AI_STATE.get(totalKey) || '0') + 1
    await env.AI_STATE.put(totalKey, String(count))

    // Per-user total
    const userKey = `metrics:user:${key}`
    const uCount = parseInt(await env.AI_STATE.get(userKey) || '0') + 1
    await env.AI_STATE.put(userKey, String(uCount))
  } catch {}
}

async function handleMetrics(env, cors) {
  const total = parseInt(await env.AI_STATE.get('metrics:total_requests') || '0')

  const providerCounts = {}
  for (const p of PROVIDERS) {
    const c = parseInt(await env.AI_STATE.get(`metrics:provider:${p.name}`) || '0')
    if (c > 0) providerCounts[p.name] = c
  }

  return json({
    total_requests: total,
    by_provider: providerCounts,
    tiers: TIER_LIMITS
  }, 200, cors)
}

// ═══════════════════════════════════════════
// PROVIDER REGISTRY
// ═══════════════════════════════════════════
const PROVIDERS = [
  { name: 'ollama-fleet', url: null, keyEnv: null, format: 'ollama' },
  { name: 'groq',      url: 'https://api.groq.com/openai/v1',    keyEnv: 'GROQ_API_KEY',      format: 'openai' },
  { name: 'together',  url: 'https://api.together.xyz/v1',       keyEnv: 'TOGETHER_API_KEY',  format: 'openai' },
  { name: 'deepseek',  url: 'https://api.deepseek.com',          keyEnv: 'DEEPSEEK_API_KEY',  format: 'openai' },
  { name: 'xai',       url: 'https://api.x.ai/v1',              keyEnv: 'XAI_API_KEY',       format: 'openai' },
  { name: 'openai',    url: 'https://api.openai.com/v1',         keyEnv: 'OPENAI_API_KEY',    format: 'openai' },
  { name: 'anthropic', url: 'https://api.anthropic.com/v1',      keyEnv: 'ANTHROPIC_API_KEY', format: 'anthropic' },
  { name: 'gemini',    url: 'https://generativelanguage.googleapis.com/v1beta', keyEnv: 'GEMINI_API_KEY', format: 'gemini' },
]

// Sovereign fleet — local Ollama instances on Pi nodes (tunneled via Cloudflare)
const FLEET_NODES = [
  { name: 'cecilia',  ip: '192.168.4.96',  port: 11434, models: ['qwen3:8b', 'llama3:8b-instruct-q4_K_M', 'cece:latest', 'cece2:latest', 'codellama:7b', 'qwen2.5-coder:3b', 'llama3.2:3b', 'deepseek-r1:1.5b', 'tinyllama:latest'] },
  { name: 'octavia',  ip: '192.168.4.101', port: 11434, models: ['phi3.5:latest', 'gemma2:2b', 'codellama:7b', 'llama3.2:3b', 'llama3.2:1b', 'deepseek-r1:1.5b', 'qwen2.5:1.5b', 'tinyllama:latest'] },
  { name: 'lucidia',  ip: '192.168.4.38',  port: 11434, models: ['qwen2.5:3b', 'lucidia:latest', 'llama3.2:1b', 'tinyllama:latest', 'qwen2.5:1.5b'] },
  { name: 'aria',     ip: '192.168.4.98',  port: 11434, models: ['qwen2.5-coder:3b', 'llama3.2:3b', 'llama3.2:1b', 'deepseek-r1:1.5b', 'tinyllama:latest'] },
]

// ═══════════════════════════════════════════
// MODEL → PROVIDER ROUTING TABLE
// ═══════════════════════════════════════════
const MODEL_TABLE = [
  // Starter tier — Groq (LPU, fastest, free)
  { id: 'llama-3.3-70b-versatile',        provider: 'groq', speed: 'fastest', tier: 'starter' },
  { id: 'llama-3.1-8b-instant',           provider: 'groq', speed: 'fastest', tier: 'starter' },
  { id: 'llama-3.1-70b-versatile',        provider: 'groq', speed: 'fastest', tier: 'starter' },
  { id: 'mixtral-8x7b-32768',             provider: 'groq', speed: 'fastest', tier: 'starter' },
  { id: 'gemma2-9b-it',                   provider: 'groq', speed: 'fastest', tier: 'starter' },
  { id: 'deepseek-r1-distill-llama-70b',  provider: 'groq', speed: 'fastest', tier: 'starter' },

  // Fast tier — Together + DeepSeek
  { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',          provider: 'together', speed: 'fast', tier: 'fast' },
  { id: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',    provider: 'together', speed: 'fast', tier: 'fast' },
  { id: 'Qwen/Qwen2.5-72B-Instruct-Turbo',                  provider: 'together', speed: 'fast', tier: 'fast' },
  { id: 'deepseek-ai/DeepSeek-R1',                           provider: 'together', speed: 'standard', tier: 'fast' },
  { id: 'deepseek-ai/DeepSeek-V3',                           provider: 'together', speed: 'standard', tier: 'fast' },
  { id: 'mistralai/Mixtral-8x22B-Instruct-v0.1',            provider: 'together', speed: 'fast', tier: 'fast' },
  { id: 'deepseek-chat',     provider: 'deepseek', speed: 'standard', tier: 'fast' },
  { id: 'deepseek-reasoner', provider: 'deepseek', speed: 'standard', tier: 'fast' },

  // Standard tier — xAI, OpenAI, Gemini
  { id: 'grok-3',           provider: 'xai',     speed: 'fast',     tier: 'standard' },
  { id: 'grok-3-mini',      provider: 'xai',     speed: 'fast',     tier: 'standard' },
  { id: 'grok-2',           provider: 'xai',     speed: 'fast',     tier: 'standard' },
  { id: 'gpt-4o',           provider: 'openai',  speed: 'standard', tier: 'standard' },
  { id: 'gpt-4o-mini',      provider: 'openai',  speed: 'fast',     tier: 'standard' },
  { id: 'gpt-4-turbo',      provider: 'openai',  speed: 'standard', tier: 'standard' },
  { id: 'o4-mini',          provider: 'openai',  speed: 'standard', tier: 'standard' },
  { id: 'o3-mini',          provider: 'openai',  speed: 'standard', tier: 'standard' },
  { id: 'gemini-2.0-flash', provider: 'gemini',  speed: 'fast',     tier: 'standard' },
  { id: 'gemini-2.0-pro',   provider: 'gemini',  speed: 'standard', tier: 'standard' },
  { id: 'gemini-1.5-pro',   provider: 'gemini',  speed: 'standard', tier: 'standard' },
  { id: 'gemini-1.5-flash', provider: 'gemini',  speed: 'fast',     tier: 'standard' },

  // Premium tier — Anthropic
  { id: 'claude-opus-4-6',   provider: 'anthropic', speed: 'standard', tier: 'premium' },

  // Local fleet — Ollama on Pi nodes (sovereign, no cloud dependency)
  { id: 'qwen3:8b',                     provider: 'ollama-fleet', speed: 'local', tier: 'starter', node: 'cecilia' },
  { id: 'llama3:8b-instruct-q4_K_M',    provider: 'ollama-fleet', speed: 'local', tier: 'starter', node: 'cecilia' },
  { id: 'cece:latest',                  provider: 'ollama-fleet', speed: 'local', tier: 'starter', node: 'cecilia' },
  { id: 'codellama:7b',                 provider: 'ollama-fleet', speed: 'local', tier: 'starter', node: 'cecilia' },
  { id: 'phi3.5:latest',                provider: 'ollama-fleet', speed: 'local', tier: 'starter', node: 'octavia' },
  { id: 'gemma2:2b',                    provider: 'ollama-fleet', speed: 'local', tier: 'starter', node: 'octavia' },
  { id: 'tinyllama:latest',             provider: 'ollama-fleet', speed: 'local', tier: 'starter', node: 'cecilia' },
  { id: 'deepseek-r1:1.5b',             provider: 'ollama-fleet', speed: 'local', tier: 'starter', node: 'cecilia' },
  { id: 'llama3.2:3b',                  provider: 'ollama-fleet', speed: 'local', tier: 'starter', node: 'cecilia' },
  { id: 'llama3.2:1b',                  provider: 'ollama-fleet', speed: 'local', tier: 'starter', node: 'lucidia' },
  { id: 'qwen2.5:3b',                   provider: 'ollama-fleet', speed: 'local', tier: 'starter', node: 'lucidia' },
  { id: 'qwen2.5-coder:3b',             provider: 'ollama-fleet', speed: 'local', tier: 'starter', node: 'aria' },
  { id: 'claude-sonnet-4-6', provider: 'anthropic', speed: 'fast',     tier: 'premium' },
  { id: 'claude-haiku-4-5',  provider: 'anthropic', speed: 'fastest',  tier: 'premium' },
]

function resolveModel(model) {
  const entry = MODEL_TABLE.find(m => m.id === model)
  if (entry) return entry

  const prefix = MODEL_TABLE.find(m => model.startsWith(m.id))
  if (prefix) return prefix

  if (model.includes('claude')) return { id: model, provider: 'anthropic', tier: 'premium' }
  if (model.includes('gpt') || model.includes('o1') || model.includes('o3') || model.includes('o4')) return { id: model, provider: 'openai', tier: 'standard' }
  if (model.includes('grok')) return { id: model, provider: 'xai', tier: 'standard' }
  if (model.includes('gemini')) return { id: model, provider: 'gemini', tier: 'standard' }
  if (model.includes('deepseek')) return { id: model, provider: 'deepseek', tier: 'fast' }
  if (model.includes('llama') || model.includes('mixtral') || model.includes('gemma')) return { id: model, provider: 'groq', tier: 'starter' }

  return { id: model, provider: 'groq', tier: 'starter' }
}

function canAccessModel(keyTier, modelTier) {
  const tierOrder = ['starter', 'fast', 'standard', 'premium']
  return tierOrder.indexOf(keyTier) >= tierOrder.indexOf(modelTier || 'starter')
}

// ═══════════════════════════════════════════
// CHAT COMPLETIONS HANDLER
// ═══════════════════════════════════════════
async function handleChatCompletions(request, env, cors, keyData) {
  const startTime = Date.now()
  const requestId = `chatcmpl-${crypto.randomUUID().slice(0, 12)}`
  const data = await request.json()

  const model = data.model || 'llama-3.3-70b-versatile'
  const stream = data.stream || false

  const resolved = resolveModel(model)

  // Check tier access
  if (!canAccessModel(keyData.tier, resolved.tier)) {
    return json({
      error: {
        message: `Model '${model}' requires ${resolved.tier} tier. You have ${keyData.tier} tier. Upgrade at https://blackroad.io/pricing`,
        type: 'insufficient_tier',
        code: 'model_access_denied',
        tier_required: resolved.tier,
        current_tier: keyData.tier
      }
    }, 403, cors)
  }

  const providerConfig = PROVIDERS.find(p => p.name === resolved.provider)

  if (!providerConfig) {
    return json({ error: { message: `No provider for model ${model}`, type: 'invalid_request_error' } }, 400, cors)
  }

  // ─── Ollama fleet routing (sovereign, no API keys needed) ───
  if (providerConfig.format === 'ollama') {
    try {
      const fleetResult = await handleOllamaFleet(resolved, data, stream, requestId, startTime, cors, env, keyData)
      const fleetBody = await fleetResult.clone().json().catch(() => null)
      if (fleetBody?.error) throw new Error(fleetBody.error.message || 'fleet error')
      return fleetResult
    } catch {
      // Fleet failed — fall back to Groq
      const groqConfig = PROVIDERS.find(p => p.name === 'groq')
      if (groqConfig && env[groqConfig.keyEnv]) {
        return await proxyToProvider(groqConfig, env[groqConfig.keyEnv], { ...data, model: 'llama-3.1-8b-instant' }, stream, requestId, startTime, cors, env, keyData)
      }
    }
  }

  const apiKey = env[providerConfig.keyEnv]
  if (!apiKey) {
    // Fallback chain: try other cloud providers first, then fall back to local fleet
    const fallbacks = ['groq', 'together', 'openai']
    for (const fb of fallbacks) {
      const fbConfig = PROVIDERS.find(p => p.name === fb)
      if (fbConfig && env[fbConfig.keyEnv]) {
        return await proxyToProvider(fbConfig, env[fbConfig.keyEnv], { ...data, model: getDefaultModel(fb) }, stream, requestId, startTime, cors, env, keyData)
      }
    }
    // Ultimate fallback: local Ollama fleet (always available, no keys needed)
    return await handleOllamaFleet({ ...resolved, provider: 'ollama-fleet', node: 'cecilia' }, { ...data, model: 'tinyllama:latest' }, stream, requestId, startTime, cors, env, keyData)
  }

  if (providerConfig.format === 'anthropic') {
    return await handleAnthropic(providerConfig, apiKey, data, stream, requestId, startTime, cors, env, keyData)
  }

  if (providerConfig.format === 'gemini') {
    return await handleGemini(providerConfig, apiKey, data, stream, requestId, startTime, cors, env, keyData)
  }

  return await proxyToProvider(providerConfig, apiKey, data, stream, requestId, startTime, cors, env, keyData)
}

// ═══════════════════════════════════════════
// OLLAMA FLEET HANDLER (sovereign inference)
// ═══════════════════════════════════════════
async function handleOllamaFleet(resolved, data, stream, requestId, startTime, cors, env, keyData) {
  // Find the target node
  const targetNodeName = resolved.node || 'cecilia'
  const node = FLEET_NODES.find(n => n.name === targetNodeName) || FLEET_NODES[0]
  const ollamaModel = data.model || 'tinyllama:latest'

  // Convert OpenAI messages format to Ollama prompt
  const messages = data.messages || []
  const prompt = messages.map(m => {
    if (m.role === 'system') return `System: ${m.content}`
    if (m.role === 'assistant') return `Assistant: ${m.content}`
    return m.content
  }).join('\n\n')

  // Route through Gematria DO droplet (non-CF, avoids 1033 same-zone loop)
  const ollamaUrl = 'http://159.65.43.12:11435/api/generate'

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 120000)

    const ollamaResp = await fetch(ollamaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: ollamaModel, prompt, stream: false }),
      signal: controller.signal,
    })

    clearTimeout(timer)

    if (!ollamaResp.ok) {
      const errText = await ollamaResp.text().catch(() => 'Unknown error')
      return json({ error: { message: `Fleet node ${node.name} error: ${errText}`, type: 'fleet_error', node: node.name } }, 502, cors)
    }

    const result = await ollamaResp.json()
    const content = result.response || ''

    // Track provider usage
    try {
      const provKey = `metrics:provider:ollama-fleet`
      const c = parseInt(await env.AI_STATE.get(provKey) || '0') + 1
      await env.AI_STATE.put(provKey, String(c))
    } catch {}

    // Return in OpenAI-compatible format
    return json({
      id: requestId,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: ollamaModel,
      provider: 'ollama-fleet',
      node: node.name,
      choices: [{
        index: 0,
        message: { role: 'assistant', content },
        finish_reason: 'stop',
      }],
      usage: {
        prompt_tokens: result.prompt_eval_count || 0,
        completion_tokens: result.eval_count || 0,
        total_tokens: (result.prompt_eval_count || 0) + (result.eval_count || 0),
      },
      blackroad: {
        latency_ms: Date.now() - startTime,
        node: node.name,
        fleet_ip: node.ip,
        sovereign: true,
      }
    }, 200, cors)

  } catch (err) {
    // Try fallback with smaller model via same tunnel
    try {
      const fbResp = await fetch('http://159.65.43.12:11435/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'tinyllama:latest', prompt, stream: false }),
      })
      if (fbResp.ok) {
        const fbResult = await fbResp.json()
        return json({
          id: requestId, object: 'chat.completion', created: Math.floor(Date.now() / 1000),
          model: 'tinyllama:latest', provider: 'ollama-fleet', node: 'fallback',
          choices: [{ index: 0, message: { role: 'assistant', content: fbResult.response || '' }, finish_reason: 'stop' }],
          blackroad: { latency_ms: Date.now() - startTime, fallback: true, sovereign: true }
        }, 200, cors)
      }
    } catch {}
    return json({ error: { message: `Fleet inference failed: ${err.message}`, type: 'fleet_error' } }, 503, cors)
  }
}

function getDefaultModel(provider) {
  switch (provider) {
    case 'groq': return 'llama-3.3-70b-versatile'
    case 'together': return 'meta-llama/Llama-3.3-70B-Instruct-Turbo'
    case 'openai': return 'gpt-4o-mini'
    case 'deepseek': return 'deepseek-chat'
    case 'xai': return 'grok-3-mini'
    default: return 'llama-3.3-70b-versatile'
  }
}

// ═══════════════════════════════════════════
// OPENAI-COMPATIBLE PROXY
// ═══════════════════════════════════════════
async function proxyToProvider(config, apiKey, data, stream, requestId, startTime, cors, env, keyData) {
  const body = {
    model: data.model,
    messages: data.messages,
    stream,
    temperature: data.temperature ?? 0.7,
    max_tokens: data.max_tokens || data.max_completion_tokens || 4096
  }

  const response = await fetch(`${config.url}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  })

  incrementMetric(env, config.name)

  const latency = Date.now() - startTime
  const rateHeaders = {
    'X-RateLimit-Limit': String(keyData?.rate_limit || 60),
    'X-Request-Id': requestId,
    'X-Provider': config.name,
    'X-Latency-Ms': String(latency),
    'X-Tier': keyData?.tier || 'starter'
  }

  if (stream) {
    return new Response(response.body, {
      status: response.status,
      headers: { ...cors, ...rateHeaders, 'content-type': 'text/event-stream', 'cache-control': 'no-cache' }
    })
  }

  const result = await response.json()

  if (result.choices) {
    result._blackroad = { provider: config.name, latency_ms: latency, request_id: requestId, tier: keyData?.tier }
  }

  return json(result, response.status, { ...cors, ...rateHeaders })
}

// ═══════════════════════════════════════════
// ANTHROPIC HANDLER
// ═══════════════════════════════════════════
async function handleAnthropic(config, apiKey, data, stream, requestId, startTime, cors, env, keyData) {
  const messages = data.messages || []
  const systemMsgs = messages.filter(m => m.role === 'system')
  const nonSystemMsgs = messages.filter(m => m.role !== 'system')

  const body = {
    model: data.model,
    max_tokens: data.max_tokens || 4096,
    messages: nonSystemMsgs.map(m => ({ role: m.role, content: m.content })),
    stream
  }

  if (systemMsgs.length > 0) {
    body.system = systemMsgs.map(m => m.content).join('\n\n')
  }

  const response = await fetch(`${config.url}/messages`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  })

  incrementMetric(env, 'anthropic')

  if (stream) {
    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()
    const encoder = new TextEncoder()
    transformAnthropicStream(response.body, writer, encoder, requestId, data.model).catch(() => writer.close())
    return new Response(readable, {
      headers: { ...cors, 'content-type': 'text/event-stream', 'cache-control': 'no-cache', 'x-provider': 'anthropic', 'x-request-id': requestId }
    })
  }

  const result = await response.json()
  const text = result.content?.find(b => b.type === 'text')?.text || ''
  const latency = Date.now() - startTime

  return json({
    id: requestId, object: 'chat.completion', created: Math.floor(Date.now() / 1000), model: data.model,
    choices: [{ index: 0, message: { role: 'assistant', content: text }, finish_reason: result.stop_reason === 'end_turn' ? 'stop' : result.stop_reason }],
    usage: { prompt_tokens: result.usage?.input_tokens || 0, completion_tokens: result.usage?.output_tokens || 0, total_tokens: (result.usage?.input_tokens || 0) + (result.usage?.output_tokens || 0) },
    _blackroad: { provider: 'anthropic', latency_ms: latency, request_id: requestId, tier: keyData?.tier }
  }, 200, { ...cors, 'x-provider': 'anthropic', 'x-request-id': requestId })
}

async function transformAnthropicStream(body, writer, encoder, requestId, model) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const d = line.slice(6)
        if (d === '[DONE]') continue
        try {
          const event = JSON.parse(d)
          if (event.type === 'content_block_delta' && event.delta?.text) {
            await writer.write(encoder.encode(`data: ${JSON.stringify({
              id: requestId, object: 'chat.completion.chunk', created: Math.floor(Date.now() / 1000), model,
              choices: [{ index: 0, delta: { content: event.delta.text }, finish_reason: null }]
            })}\n\n`))
          } else if (event.type === 'message_stop') {
            await writer.write(encoder.encode(`data: ${JSON.stringify({
              id: requestId, object: 'chat.completion.chunk', created: Math.floor(Date.now() / 1000), model,
              choices: [{ index: 0, delta: {}, finish_reason: 'stop' }]
            })}\n\n`))
            await writer.write(encoder.encode('data: [DONE]\n\n'))
          }
        } catch {}
      }
    }
  } finally { await writer.close() }
}

// ═══════════════════════════════════════════
// GEMINI HANDLER
// ═══════════════════════════════════════════
async function handleGemini(config, apiKey, data, stream, requestId, startTime, cors, env, keyData) {
  const messages = data.messages || []
  const system = messages.filter(m => m.role === 'system').map(m => m.content).join('\n\n')
  const userContent = messages.filter(m => m.role !== 'system').map(m => m.content).join('\n\n')
  const input = system ? `[System]\n${system}\n\n[User]\n${userContent}` : userContent

  const model = data.model || 'gemini-2.0-flash'
  const endpoint = stream ? 'streamGenerateContent' : 'generateContent'
  const url = `${config.url}/models/${model}:${endpoint}?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: input }] }],
      generationConfig: { maxOutputTokens: data.max_tokens || 4096, temperature: data.temperature ?? 0.7 }
    })
  })

  incrementMetric(env, 'gemini')

  if (stream) {
    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()
    const encoder = new TextEncoder()
    transformGeminiStream(response.body, writer, encoder, requestId, model).catch(() => writer.close())
    return new Response(readable, {
      headers: { ...cors, 'content-type': 'text/event-stream', 'cache-control': 'no-cache', 'x-provider': 'gemini', 'x-request-id': requestId }
    })
  }

  const result = await response.json()
  const text = result.candidates?.[0]?.content?.parts?.find(p => p.text)?.text || ''
  const latency = Date.now() - startTime

  return json({
    id: requestId, object: 'chat.completion', created: Math.floor(Date.now() / 1000), model,
    choices: [{ index: 0, message: { role: 'assistant', content: text }, finish_reason: 'stop' }],
    usage: { prompt_tokens: result.usageMetadata?.promptTokenCount || 0, completion_tokens: result.usageMetadata?.candidatesTokenCount || 0, total_tokens: result.usageMetadata?.totalTokenCount || 0 },
    _blackroad: { provider: 'gemini', latency_ms: latency, request_id: requestId, tier: keyData?.tier }
  }, 200, { ...cors, 'x-provider': 'gemini', 'x-request-id': requestId })
}

async function transformGeminiStream(body, writer, encoder, requestId, model) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      try {
        const textMatch = buffer.match(/"text"\s*:\s*"([^"]*)"/)
        if (textMatch) {
          await writer.write(encoder.encode(`data: ${JSON.stringify({
            id: requestId, object: 'chat.completion.chunk', created: Math.floor(Date.now() / 1000), model,
            choices: [{ index: 0, delta: { content: textMatch[1] }, finish_reason: null }]
          })}\n\n`))
          buffer = ''
        }
      } catch {}
    }
    await writer.write(encoder.encode(`data: ${JSON.stringify({
      id: requestId, object: 'chat.completion.chunk', created: Math.floor(Date.now() / 1000), model,
      choices: [{ index: 0, delta: {}, finish_reason: 'stop' }]
    })}\n\n`))
    await writer.write(encoder.encode('data: [DONE]\n\n'))
  } finally { await writer.close() }
}

// ═══════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'content-type': 'application/json' }
  })
}

async function incrementMetric(env, provider) {
  try {
    const key = 'metrics:total_requests'
    const count = parseInt(await env.AI_STATE.get(key) || '0') + 1
    await env.AI_STATE.put(key, String(count))
    const pKey = `metrics:provider:${provider}`
    const pCount = parseInt(await env.AI_STATE.get(pKey) || '0') + 1
    await env.AI_STATE.put(pKey, String(pCount))
  } catch {}
}

// ═══════════════════════════════════════════
// API DOCUMENTATION (served at /)
// ═══════════════════════════════════════════
const API_DOCS = {
  name: 'BlackRoad AI Gateway',
  version: 2,
  description: 'OpenAI-compatible multi-provider AI API. One key, 30+ models, 7 providers.',
  base_url: 'https://api.blackroad.io',
  docs_url: 'https://blackroad.io/docs',
  pricing_url: 'https://blackroad.io/pricing',
  endpoints: {
    'POST /v1/chat/completions': 'OpenAI-compatible chat (streaming supported)',
    'GET /v1/models': 'List all available models',
    'GET /v1/providers': 'List providers',
    'GET /v1/keys/usage': 'Check your usage and limits',
    'GET /healthz': 'Health check'
  },
  authentication: 'Bearer token in Authorization header. Get a key at https://blackroad.io/signup',
  example: {
    curl: `curl -X POST https://api.blackroad.io/v1/chat/completions -H "Authorization: Bearer br-YOUR_KEY" -H "Content-Type: application/json" -d '{"model":"llama-3.3-70b-versatile","messages":[{"role":"user","content":"Hello"}]}'`,
    python: `from openai import OpenAI\nclient = OpenAI(base_url="https://api.blackroad.io/v1", api_key="br-YOUR_KEY")\nresponse = client.chat.completions.create(model="llama-3.3-70b-versatile", messages=[{"role":"user","content":"Hello"}])\nprint(response.choices[0].message.content)`
  },
  tiers: {
    starter:    { price: '$0/mo',  rpm: 10,  daily: 50,    models: 'Groq + Sovereign Fleet (Ollama on Pi nodes)' },
    starter:    { price: '$9/mo',  rpm: 30,  daily: 1000,  models: '+ Together AI, DeepSeek native' },
    pro:        { price: '$29/mo', rpm: 60,  daily: 5000,  models: '+ OpenAI, Gemini, Grok' },
    enterprise: { price: '$99/mo', rpm: 300, daily: 50000, models: '+ Claude, priority routing' }
  },
  providers: ['groq', 'together', 'deepseek', 'xai', 'openai', 'anthropic', 'gemini'],
  model_count: MODEL_TABLE.length
}
