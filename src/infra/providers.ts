// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.

export interface HealthResult {
  provider: string
  status: 'healthy' | 'degraded' | 'unreachable'
  latencyMs: number
  details?: string
}

export interface DeployResult {
  provider: string
  success: boolean
  url?: string
  error?: string
}

async function timedFetch(
  url: string,
  opts?: RequestInit & { timeoutMs?: number },
): Promise<{ response: Response; latencyMs: number }> {
  const { timeoutMs = 10_000, ...fetchOpts } = opts ?? {}
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const start = performance.now()
  try {
    const response = await fetch(url, {
      ...fetchOpts,
      signal: controller.signal,
    })
    return { response, latencyMs: Math.round(performance.now() - start) }
  } finally {
    clearTimeout(timer)
  }
}

// ── Cloudflare ──────────────────────────────────────────────

export async function checkCloudflare(): Promise<HealthResult> {
  try {
    const { response, latencyMs } = await timedFetch('https://blackroad.io', {
      method: 'HEAD',
      timeoutMs: 8_000,
    })
    return {
      provider: 'cloudflare',
      status: response.ok ? 'healthy' : 'degraded',
      latencyMs,
      details: `HTTP ${response.status}`,
    }
  } catch (err) {
    return {
      provider: 'cloudflare',
      status: 'unreachable',
      latencyMs: -1,
      details: String(err),
    }
  }
}

export async function checkCloudflareWorker(
  workerUrl: string,
): Promise<HealthResult> {
  try {
    const { response, latencyMs } = await timedFetch(workerUrl, {
      method: 'HEAD',
      timeoutMs: 8_000,
    })
    return {
      provider: `cloudflare-worker`,
      status: response.ok ? 'healthy' : 'degraded',
      latencyMs,
      details: `${workerUrl} → HTTP ${response.status}`,
    }
  } catch (err) {
    return {
      provider: 'cloudflare-worker',
      status: 'unreachable',
      latencyMs: -1,
      details: String(err),
    }
  }
}

// ── Railway ─────────────────────────────────────────────────

export async function checkRailway(serviceUrl?: string): Promise<HealthResult> {
  const url = serviceUrl ?? process.env['RAILWAY_SERVICE_URL']
  if (!url) {
    return {
      provider: 'railway',
      status: 'degraded',
      latencyMs: -1,
      details: 'No RAILWAY_SERVICE_URL configured',
    }
  }
  try {
    const { response, latencyMs } = await timedFetch(`${url}/health`, {
      timeoutMs: 10_000,
    })
    return {
      provider: 'railway',
      status: response.ok ? 'healthy' : 'degraded',
      latencyMs,
      details: `HTTP ${response.status}`,
    }
  } catch (err) {
    return {
      provider: 'railway',
      status: 'unreachable',
      latencyMs: -1,
      details: String(err),
    }
  }
}

// ── HuggingFace ─────────────────────────────────────────────

export async function checkHuggingFace(): Promise<HealthResult> {
  try {
    const { response, latencyMs } = await timedFetch(
      'https://huggingface.co/api/whoami',
      {
        timeoutMs: 8_000,
        headers: process.env['HF_TOKEN']
          ? { Authorization: `Bearer ${process.env['HF_TOKEN']}` }
          : {},
      },
    )
    // 401 means API is up but token missing/bad — still healthy infra
    const status =
      response.ok || response.status === 401 ? 'healthy' : 'degraded'
    return {
      provider: 'huggingface',
      status,
      latencyMs,
      details: response.ok ? 'Authenticated' : `HTTP ${response.status}`,
    }
  } catch (err) {
    return {
      provider: 'huggingface',
      status: 'unreachable',
      latencyMs: -1,
      details: String(err),
    }
  }
}

export async function checkHuggingFaceModel(
  modelId: string,
): Promise<HealthResult> {
  try {
    const { response, latencyMs } = await timedFetch(
      `https://huggingface.co/api/models/${modelId}`,
      { timeoutMs: 10_000 },
    )
    return {
      provider: 'huggingface-model',
      status: response.ok ? 'healthy' : 'degraded',
      latencyMs,
      details: response.ok ? modelId : `HTTP ${response.status}`,
    }
  } catch (err) {
    return {
      provider: 'huggingface-model',
      status: 'unreachable',
      latencyMs: -1,
      details: String(err),
    }
  }
}

// ── Salesforce ───────────────────────────────────────────────

export async function checkSalesforce(): Promise<HealthResult> {
  const instanceUrl = process.env['SALESFORCE_INSTANCE_URL']
  if (!instanceUrl) {
    return {
      provider: 'salesforce',
      status: 'degraded',
      latencyMs: -1,
      details: 'No SALESFORCE_INSTANCE_URL configured',
    }
  }
  try {
    const { response, latencyMs } = await timedFetch(
      `${instanceUrl}/services/data/v62.0/limits`,
      {
        timeoutMs: 10_000,
        headers: process.env['SALESFORCE_ACCESS_TOKEN']
          ? {
              Authorization: `Bearer ${process.env['SALESFORCE_ACCESS_TOKEN']}`,
            }
          : {},
      },
    )
    const status = response.ok
      ? 'healthy'
      : response.status === 401
        ? 'degraded'
        : 'unreachable'
    return {
      provider: 'salesforce',
      status,
      latencyMs,
      details: response.ok ? 'Connected' : `HTTP ${response.status}`,
    }
  } catch (err) {
    return {
      provider: 'salesforce',
      status: 'unreachable',
      latencyMs: -1,
      details: String(err),
    }
  }
}

// ── Raspberry Pi ─────────────────────────────────────────────

export async function checkPi(
  host: string,
  name: string,
): Promise<HealthResult> {
  try {
    const { response, latencyMs } = await timedFetch(
      `http://${host}:11434/api/tags`,
      {
        timeoutMs: 5_000,
      },
    )
    return {
      provider: `pi:${name}`,
      status: response.ok ? 'healthy' : 'degraded',
      latencyMs,
      details: response.ok ? 'Ollama running' : `HTTP ${response.status}`,
    }
  } catch {
    // Pi might be running but Ollama not started — try basic HTTP
    try {
      const { latencyMs } = await timedFetch(`http://${host}:22`, {
        timeoutMs: 3_000,
      })
      return {
        provider: `pi:${name}`,
        status: 'degraded',
        latencyMs,
        details: 'Host reachable, Ollama down',
      }
    } catch {
      return {
        provider: `pi:${name}`,
        status: 'unreachable',
        latencyMs: -1,
        details: 'Offline',
      }
    }
  }
}

// ── Ollama (local) ──────────────────────────────────────────

export async function checkOllama(
  url?: string,
): Promise<HealthResult & { models?: string[] }> {
  const base = url ?? process.env['OLLAMA_URL'] ?? 'http://localhost:11434'
  try {
    const { response, latencyMs } = await timedFetch(`${base}/api/tags`, {
      timeoutMs: 5_000,
    })
    if (!response.ok) {
      return {
        provider: 'ollama',
        status: 'degraded',
        latencyMs,
        details: `HTTP ${response.status}`,
      }
    }
    const data = (await response.json()) as { models?: { name: string }[] }
    const models = data.models?.map((m) => m.name) ?? []
    return {
      provider: 'ollama',
      status: 'healthy',
      latencyMs,
      models,
      details: `${models.length} models loaded`,
    }
  } catch (err) {
    return {
      provider: 'ollama',
      status: 'unreachable',
      latencyMs: -1,
      details: String(err),
    }
  }
}

// ── Gateway ─────────────────────────────────────────────────

export async function checkGateway(url?: string): Promise<HealthResult> {
  const base =
    url ?? process.env['BLACKROAD_GATEWAY_URL'] ?? 'http://127.0.0.1:8787'
  try {
    const { response, latencyMs } = await timedFetch(`${base}/v1/health`, {
      timeoutMs: 5_000,
    })
    return {
      provider: 'gateway',
      status: response.ok ? 'healthy' : 'degraded',
      latencyMs,
      details: `HTTP ${response.status}`,
    }
  } catch {
    return {
      provider: 'gateway',
      status: 'unreachable',
      latencyMs: -1,
      details: 'Not running',
    }
  }
}

// ── Full mesh check ─────────────────────────────────────────

export interface MeshReport {
  timestamp: string
  results: HealthResult[]
  summary: {
    healthy: number
    degraded: number
    unreachable: number
    total: number
  }
}

export async function checkFullMesh(): Promise<MeshReport> {
  const workerAgentsUrl =
    process.env['BLACKROAD_AGENTS_WORKER_URL'] ??
    'https://blackroad-agents.blackroad.workers.dev'

  const results = await Promise.allSettled([
    checkGateway(),
    checkCloudflare(),
    checkCloudflareWorker(workerAgentsUrl),
    checkRailway(),
    checkHuggingFace(),
    checkSalesforce(),
    checkOllama(),
    checkPi('192.168.4.64', 'blackroad-pi'),
    checkPi('192.168.4.38', 'aria64'),
  ])

  const healthResults = results.map((r) =>
    r.status === 'fulfilled'
      ? r.value
      : {
          provider: 'unknown',
          status: 'unreachable' as const,
          latencyMs: -1,
          details: String(r.reason),
        },
  )

  return {
    timestamp: new Date().toISOString(),
    results: healthResults,
    summary: {
      healthy: healthResults.filter((r) => r.status === 'healthy').length,
      degraded: healthResults.filter((r) => r.status === 'degraded').length,
      unreachable: healthResults.filter((r) => r.status === 'unreachable')
        .length,
      total: healthResults.length,
    },
  }
}
