import CryptoJS from 'crypto-js'

/**
 * Unified API Authentication System
 * Uses SHA-512 for secure key hashing and verification
 */

export interface UnifiedAPIKey {
  key: string
  hash: string
  permissions: string[]
  services: string[]
  createdAt: string
  expiresAt?: string
}

export class UnifiedAuth {
  /**
   * Generate SHA-512 hash of API key
   */
  static hashKey(apiKey: string): string {
    return CryptoJS.SHA512(apiKey).toString(CryptoJS.enc.Hex)
  }

  /**
   * Generate new unified API key
   * This key grants access to ALL BlackRoad services
   */
  static generateKey(): UnifiedAPIKey {
    const randomBytes = CryptoJS.lib.WordArray.random(32)
    const key = `br_${randomBytes.toString(CryptoJS.enc.Hex)}`
    const hash = this.hashKey(key)

    return {
      key,
      hash,
      permissions: ['read', 'write', 'deploy', 'admin'],
      services: [
        'web',
        'api',
        'prism',
        'operator',
        'docs',
        'brand',
        'core',
        'demo',
        'ideas',
        'infra',
        'research',
        'desktop'
      ],
      createdAt: new Date().toISOString(),
    }
  }

  /**
   * Verify API key against stored hash
   */
  static verifyKey(apiKey: string, storedHash: string): boolean {
    const keyHash = this.hashKey(apiKey)
    return keyHash === storedHash
  }

  /**
   * Check if key has permission for service
   */
  static hasPermission(
    apiKey: UnifiedAPIKey,
    service: string,
    permission: string
  ): boolean {
    return (
      apiKey.services.includes(service) &&
      apiKey.permissions.includes(permission)
    )
  }

  /**
   * Create service-specific token from unified key
   */
  static createServiceToken(
    unifiedKey: string,
    service: string
  ): string {
    const data = `${unifiedKey}:${service}:${Date.now()}`
    return CryptoJS.SHA512(data).toString(CryptoJS.enc.Hex)
  }

  /**
   * Encrypt sensitive data with key
   */
  static encrypt(data: string, key: string): string {
    return CryptoJS.AES.encrypt(data, key).toString()
  }

  /**
   * Decrypt sensitive data with key
   */
  static decrypt(encryptedData: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key)
    return bytes.toString(CryptoJS.enc.Utf8)
  }
}

/**
 * Agent Authentication for distributed computing
 */
export interface AgentNode {
  nodeId: string
  ipAddress: string
  location: {
    country: string
    city: string
    coordinates?: { lat: number; lon: number }
  }
  capabilities: string[]
  memory: {
    total: number
    used: number
    available: number
  }
  status: 'active' | 'idle' | 'offline'
  lastSeen: string
}

export class AgentAuth {
  /**
   * Register new agent node
   */
  static registerNode(
    nodeId: string,
    ipAddress: string,
    capabilities: string[]
  ): AgentNode {
    return {
      nodeId,
      ipAddress,
      location: {
        country: 'unknown',
        city: 'unknown',
      },
      capabilities,
      memory: {
        total: 0,
        used: 0,
        available: 0,
      },
      status: 'active',
      lastSeen: new Date().toISOString(),
    }
  }

  /**
   * Create secure node token
   */
  static createNodeToken(nodeId: string, networkKey: string): string {
    const data = `${nodeId}:${networkKey}:${Date.now()}`
    return CryptoJS.SHA512(data).toString(CryptoJS.enc.Hex)
  }

  /**
   * Verify node identity
   */
  static verifyNode(nodeToken: string, expectedHash: string): boolean {
    return nodeToken === expectedHash
  }
}
