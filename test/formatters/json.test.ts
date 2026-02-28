// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { formatJson } from '../../src/formatters/json.js'

describe('formatJson', () => {
  it('should return a string for an object', () => {
    const result = formatJson({ name: 'test', count: 3 })
    expect(typeof result).toBe('string')
    expect(result).toContain('name')
    expect(result).toContain('test')
  })

  it('should handle null values', () => {
    const result = formatJson({ value: null })
    expect(result).toContain('null')
  })

  it('should handle boolean values', () => {
    const result = formatJson({ active: true, deleted: false })
    expect(result).toContain('true')
    expect(result).toContain('false')
  })

  it('should handle nested objects', () => {
    const result = formatJson({ outer: { inner: 'deep' } })
    expect(result).toContain('outer')
    expect(result).toContain('inner')
    expect(result).toContain('deep')
  })

  it('should handle arrays', () => {
    const result = formatJson([1, 2, 3])
    expect(result).toContain('1')
    expect(result).toContain('2')
    expect(result).toContain('3')
  })
})
