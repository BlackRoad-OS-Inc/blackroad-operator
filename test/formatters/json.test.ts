// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { formatJson } from '../../src/formatters/json.js'

describe('formatJson', () => {
  it('returns a string representation of the data', () => {
    const result = formatJson({ name: 'test', count: 42 })
    expect(typeof result).toBe('string')
    expect(result).toContain('name')
    expect(result).toContain('test')
  })

  it('handles booleans', () => {
    const result = formatJson({ active: true, paused: false })
    expect(result).toContain('true')
    expect(result).toContain('false')
  })

  it('handles null values', () => {
    const result = formatJson({ value: null })
    expect(result).toContain('null')
  })

  it('handles nested objects', () => {
    const result = formatJson({ outer: { inner: 'value' } })
    expect(result).toContain('outer')
    expect(result).toContain('inner')
  })

  it('handles arrays', () => {
    const result = formatJson([1, 2, 3])
    expect(result).toContain('1')
    expect(result).toContain('3')
  })
})
