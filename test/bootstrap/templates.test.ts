// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { templates } from '../../src/bootstrap/templates.js'

describe('templates', () => {
  it('should include worker and api templates', () => {
    expect(templates).toHaveLength(2)
    expect(templates.map((t) => t.name)).toEqual(['worker', 'api'])
  })

  it('worker template should have required files', () => {
    const worker = templates.find((t) => t.name === 'worker')!
    expect(worker.files['src/index.ts']).toBeDefined()
    expect(worker.files['wrangler.toml']).toBeDefined()
  })

  it('api template should have required files', () => {
    const api = templates.find((t) => t.name === 'api')!
    expect(api.files['src/index.ts']).toBeDefined()
    expect(api.files['package.json']).toBeDefined()
  })

  it('each template should have a description', () => {
    for (const t of templates) {
      expect(t.description).toBeTruthy()
    }
  })
})
