// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import {
  parseConfig,
  getDefaultConfig,
  validateConfig,
  isExcluded,
} from '../../workers/roadbridge/src/config.js'

describe('parseConfig', () => {
  it('should return defaults for empty input', () => {
    const config = parseConfig('')
    expect(config.drive.on_release).toBe(true)
    expect(config.github.on_drive_create).toBe(false)
    expect(config.github.target_branch).toBe('main')
    expect(config.witness).toBe(true)
  })

  it('should parse a complete .roadbridge.yml', () => {
    const yaml = `
drive:
  target_folder_id: 1aBcDeFgHiJk
  on_release: true
  on_merge: "dist/**/*.zip"
  exclude:
    - node_modules/
    - "*.env"
    - .git/
github:
  on_drive_create: true
  target_branch: develop
witness: true
`
    const config = parseConfig(yaml)
    expect(config.drive.target_folder_id).toBe('1aBcDeFgHiJk')
    expect(config.drive.on_release).toBe(true)
    expect(config.drive.on_merge).toBe('dist/**/*.zip')
    expect(config.drive.exclude).toEqual(['node_modules/', '*.env', '.git/'])
    expect(config.github.on_drive_create).toBe(true)
    expect(config.github.target_branch).toBe('develop')
    expect(config.witness).toBe(true)
  })

  it('should merge partial config with defaults', () => {
    const yaml = `
drive:
  on_release: false
witness: false
`
    const config = parseConfig(yaml)
    expect(config.drive.on_release).toBe(false)
    expect(config.drive.target_folder_id).toBe('') // default
    expect(config.github.target_branch).toBe('main') // default
    expect(config.witness).toBe(false)
  })
})

describe('getDefaultConfig', () => {
  it('should return a fresh copy of defaults', () => {
    const a = getDefaultConfig()
    const b = getDefaultConfig()
    expect(a).toEqual(b)
    // Verify they are distinct objects
    a.drive.on_release = false
    expect(b.drive.on_release).toBe(true)
  })

  it('should include .git/ and node_modules/ in default exclusions', () => {
    const config = getDefaultConfig()
    expect(config.drive.exclude).toContain('.git/')
    expect(config.drive.exclude).toContain('node_modules/')
    expect(config.drive.exclude).toContain('*.env')
  })
})

describe('validateConfig', () => {
  it('should validate a correct config', () => {
    const config = getDefaultConfig()
    const { valid, errors } = validateConfig(config)
    expect(valid).toBe(true)
    expect(errors).toHaveLength(0)
  })

  it('should report missing drive section', () => {
    const { valid, errors } = validateConfig({
      github: { on_drive_create: false, target_branch: 'main' },
      witness: true,
    })
    expect(valid).toBe(false)
    expect(errors).toContain('Missing "drive" section')
  })

  it('should report missing github section', () => {
    const { valid, errors } = validateConfig({
      drive: { on_release: true, exclude: [] },
      witness: true,
    })
    expect(valid).toBe(false)
    expect(errors).toContain('Missing "github" section')
  })
})

describe('isExcluded', () => {
  const patterns = ['.git/', 'node_modules/', '*.env', '*.key']

  it('should exclude .git/ directory paths', () => {
    expect(isExcluded('.git/HEAD', patterns)).toBe(true)
    expect(isExcluded('.git/objects/abc', patterns)).toBe(true)
  })

  it('should exclude node_modules/', () => {
    expect(isExcluded('node_modules/chalk/index.js', patterns)).toBe(true)
  })

  it('should exclude by extension', () => {
    expect(isExcluded('.env', patterns)).toBe(true)
    expect(isExcluded('config.env', patterns)).toBe(true)
    expect(isExcluded('secrets.key', patterns)).toBe(true)
  })

  it('should not exclude normal files', () => {
    expect(isExcluded('src/index.ts', patterns)).toBe(false)
    expect(isExcluded('README.md', patterns)).toBe(false)
    expect(isExcluded('package.json', patterns)).toBe(false)
  })

  it('should handle empty patterns', () => {
    expect(isExcluded('anything', [])).toBe(false)
    expect(isExcluded('anything', undefined as any)).toBe(false)
  })
})
