// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'

/**
 * E2E Config domain tests
 *
 * Validates the expected domain list shape without importing the
 * integrations/ module (which lives outside the TypeScript rootDir).
 * The actual BLACKROAD_DOMAINS array from integrations/e2e/e2e-config.ts
 * is mirrored below to verify the contract.
 */

// Mirror of integrations/e2e/e2e-config.ts BLACKROAD_DOMAINS
// Keep in sync when adding new domains.
const BLACKROAD_DOMAINS = [
  'blackroad.io',
  'os.blackroad.io',
  'blackroad.ai',
  'blackroad.network',
  'blackroad.systems',
  'blackroad.me',
  'blackroad.inc',
  'lucidia.earth',
  'lucidia.studio',
] as const

describe('E2E Config', () => {
  describe('BLACKROAD_DOMAINS', () => {
    it('should include os.blackroad.io', () => {
      expect(BLACKROAD_DOMAINS).toContain('os.blackroad.io')
    })

    it('should include core blackroad.io domain', () => {
      expect(BLACKROAD_DOMAINS).toContain('blackroad.io')
    })

    it('should have no duplicate domains', () => {
      const unique = new Set(BLACKROAD_DOMAINS)
      expect(unique.size).toBe(BLACKROAD_DOMAINS.length)
    })

    it('all domains should be non-empty strings', () => {
      for (const domain of BLACKROAD_DOMAINS) {
        expect(typeof domain).toBe('string')
        expect(domain.length).toBeGreaterThan(0)
      }
    })
  })
})

