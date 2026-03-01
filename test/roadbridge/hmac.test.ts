// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'

// Since the worker modules are plain JS (not TypeScript), we import them directly.
// The HMAC module uses Web Crypto API which vitest provides via the node environment.
import { verifyGitHubSignature, verifyDriveChannelToken } from '../../workers/roadbridge/src/hmac.js'

describe('verifyGitHubSignature', () => {
  it('should return false for missing signature', async () => {
    const result = await verifyGitHubSignature('secret', '{}', '')
    expect(result).toBe(false)
  })

  it('should return false for signature without sha256= prefix', async () => {
    const result = await verifyGitHubSignature('secret', '{}', 'invalid-sig')
    expect(result).toBe(false)
  })

  it('should verify a valid HMAC-SHA256 signature', async () => {
    const secret = 'test-webhook-secret'
    const payload = '{"action":"published"}'

    // Compute the expected signature using Web Crypto
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )
    const sig = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(payload),
    )
    const hex = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    const signature = `sha256=${hex}`

    const result = await verifyGitHubSignature(secret, payload, signature)
    expect(result).toBe(true)
  })

  it('should reject an incorrect signature', async () => {
    const result = await verifyGitHubSignature(
      'secret',
      '{"test":true}',
      'sha256=0000000000000000000000000000000000000000000000000000000000000000',
    )
    expect(result).toBe(false)
  })
})

describe('verifyDriveChannelToken', () => {
  it('should return true for matching tokens', () => {
    expect(verifyDriveChannelToken('my-token-123', 'my-token-123')).toBe(true)
  })

  it('should return false for mismatched tokens', () => {
    expect(verifyDriveChannelToken('expected', 'received')).toBe(false)
  })

  it('should return false for empty tokens', () => {
    expect(verifyDriveChannelToken('', '')).toBe(false)
    expect(verifyDriveChannelToken('token', '')).toBe(false)
    expect(verifyDriveChannelToken('', 'token')).toBe(false)
  })
})
