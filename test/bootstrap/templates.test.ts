// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { templates } from '../../src/bootstrap/templates.js'

describe('templates', () => {
  it('contains at least two templates', () => {
    expect(templates.length).toBeGreaterThanOrEqual(2)
  })

  it('each template has required fields', () => {
    for (const t of templates) {
      expect(t.name).toBeTruthy()
      expect(t.description).toBeTruthy()
      expect(Object.keys(t.files).length).toBeGreaterThan(0)
    }
  })

  it('has a worker template', () => {
    const worker = templates.find((t) => t.name === 'worker')
    expect(worker).toBeDefined()
    if (!worker) return
    expect(worker.files['src/index.ts']).toBeTruthy()
    expect(worker.files['wrangler.toml']).toBeTruthy()
  })

  it('has an api template', () => {
    const api = templates.find((t) => t.name === 'api')
    expect(api).toBeDefined()
    if (!api) return
    expect(api.files['src/index.ts']).toBeTruthy()
  })
})
