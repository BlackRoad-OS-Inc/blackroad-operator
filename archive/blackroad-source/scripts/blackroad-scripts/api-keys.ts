import { nanoid } from 'nanoid'

export interface APIKey {
  id: string
  key: string
  name: string
  userId: string
  permissions: string[]
  rateLimit: {
    requestsPerMinute: number
    requestsPerDay: number
  }
  usage: {
    totalRequests: number
    lastUsed: Date | null
  }
  createdAt: Date
  expiresAt: Date | null
  revoked: boolean
}

export interface RateLimitInfo {
  allowed: boolean
  remaining: number
  resetAt: Date
}

// In-memory store (use Redis/PostgreSQL in production)
const apiKeys: Map<string, APIKey> = new Map()
const usageTracking: Map<string, { count: number; window: number }> = new Map()

export function generateAPIKey(): string {
  const prefix = 'br_live'
  const key = nanoid(32)
  return `${prefix}_${key}`
}

export function createAPIKey(
  userId: string,
  name: string,
  permissions: string[] = ['read'],
  rateLimit = { requestsPerMinute: 60, requestsPerDay: 10000 }
): APIKey {
  const key = generateAPIKey()
  const apiKey: APIKey = {
    id: nanoid(),
    key,
    name,
    userId,
    permissions,
    rateLimit,
    usage: {
      totalRequests: 0,
      lastUsed: null,
    },
    createdAt: new Date(),
    expiresAt: null,
    revoked: false,
  }
  
  apiKeys.set(key, apiKey)
  return apiKey
}

export function getAPIKey(key: string): APIKey | null {
  return apiKeys.get(key) || null
}

export function validateAPIKey(key: string): {
  valid: boolean
  reason?: string
  apiKey?: APIKey
} {
  const apiKey = getAPIKey(key)
  
  if (!apiKey) {
    return { valid: false, reason: 'Invalid API key' }
  }
  
  if (apiKey.revoked) {
    return { valid: false, reason: 'API key has been revoked' }
  }
  
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { valid: false, reason: 'API key has expired' }
  }
  
  return { valid: true, apiKey }
}

export function checkRateLimit(key: string): RateLimitInfo {
  const apiKey = getAPIKey(key)
  if (!apiKey) {
    return { allowed: false, remaining: 0, resetAt: new Date() }
  }
  
  const now = Date.now()
  const windowStart = Math.floor(now / 60000) * 60000 // 1-minute window
  const trackingKey = `${key}:${windowStart}`
  
  let usage = usageTracking.get(trackingKey)
  if (!usage || usage.window !== windowStart) {
    usage = { count: 0, window: windowStart }
    usageTracking.set(trackingKey, usage)
  }
  
  const allowed = usage.count < apiKey.rateLimit.requestsPerMinute
  const remaining = Math.max(0, apiKey.rateLimit.requestsPerMinute - usage.count)
  const resetAt = new Date(windowStart + 60000)
  
  if (allowed) {
    usage.count++
    apiKey.usage.totalRequests++
    apiKey.usage.lastUsed = new Date()
  }
  
  return { allowed, remaining, resetAt }
}

export function revokeAPIKey(key: string): boolean {
  const apiKey = getAPIKey(key)
  if (!apiKey) return false
  
  apiKey.revoked = true
  return true
}

export function listAPIKeys(userId: string): APIKey[] {
  return Array.from(apiKeys.values())
    .filter(key => key.userId === userId)
}

export function getUsageStats(key: string) {
  const apiKey = getAPIKey(key)
  if (!apiKey) return null
  
  return {
    totalRequests: apiKey.usage.totalRequests,
    lastUsed: apiKey.usage.lastUsed,
    rateLimit: apiKey.rateLimit,
    createdAt: apiKey.createdAt,
  }
}
