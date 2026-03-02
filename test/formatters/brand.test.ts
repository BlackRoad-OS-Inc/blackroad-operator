// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { brand } from '../../src/formatters/brand.js'

describe('brand', () => {
  it('should have color functions', () => {
    expect(typeof brand.hotPink).toBe('function')
    expect(typeof brand.amber).toBe('function')
    expect(typeof brand.violet).toBe('function')
    expect(typeof brand.electricBlue).toBe('function')
  })

  it('should produce a logo string', () => {
    const logo = brand.logo()
    expect(logo).toBeTruthy()
    expect(typeof logo).toBe('string')
  })

  it('should produce a header string', () => {
    const header = brand.header('Test')
    expect(header).toContain('Test')
  })

  it('should produce a tagline string', () => {
    const tagline = brand.tagline(0)
    expect(tagline).toBeTruthy()
    expect(typeof tagline).toBe('string')
  })

  it('should return a random tagline when no index given', () => {
    const tagline = brand.tagline()
    expect(tagline).toBeTruthy()
  })

  it('should produce a shebang string', () => {
    const shebang = brand.shebang()
    expect(shebang).toBeTruthy()
    expect(typeof shebang).toBe('string')
  })

  it('should produce a footer string', () => {
    const footer = brand.footer()
    expect(footer).toBeTruthy()
    expect(typeof footer).toBe('string')
  })

  it('should produce a manifesto string', () => {
    const manifesto = brand.manifesto()
    expect(manifesto).toBeTruthy()
    expect(typeof manifesto).toBe('string')
  })
})
