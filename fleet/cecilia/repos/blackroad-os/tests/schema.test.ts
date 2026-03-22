import { describe, expect, it } from 'vitest'
import { ManifestSchema } from '../src/schema.js'

const sample = {
  version: '0.1.0',
  repos: { core: 'BlackRoad-OS/blackroad-os-core' },
  services: {
    'core-web': {
      repo: 'core',
      env: 'prod',
      url: 'https://web.blackroad.io',
      health: '/api/health',
      depends: ['gateway'],
    },
  },
  packs: ['education'],
  environments: { prod: { domain_root: 'blackroad.io' } },
}

describe('ManifestSchema', () => {
  it('accepts valid manifest', () => {
    const parsed = ManifestSchema.safeParse(sample)
    expect(parsed.success).toBe(true)
  })

  it('rejects invalid manifest', () => {
    const parsed = ManifestSchema.safeParse({ ...sample, version: '' })
    expect(parsed.success).toBe(false)
  })
})
