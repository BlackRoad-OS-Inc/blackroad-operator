// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { agents, getAgent } from '../../src/definitions/index.js'
import { AgentDefinitionSchema } from '../../src/schemas/agent.js'

describe('Agent Definitions', () => {
  it('should have exactly 8 agents', () => {
    expect(agents.size).toBe(8)
  })

  it('should include all expected agents', () => {
    const names = Array.from(agents.keys())
    expect(names).toContain('octavia')
    expect(names).toContain('lucidia')
    expect(names).toContain('alice')
    expect(names).toContain('cipher')
    expect(names).toContain('prism')
    expect(names).toContain('echo')
    expect(names).toContain('aria')
    expect(names).toContain('planner')
  })

  it('should retrieve an agent by name', () => {
    const octavia = getAgent('octavia')
    expect(octavia).toBeDefined()
    expect(octavia!.title).toBe('The Architect')
  })

  it('should return undefined for unknown agent', () => {
    expect(getAgent('nonexistent')).toBeUndefined()
  })

  it('should validate all agents against schema', () => {
    for (const [name, agent] of agents) {
      const result = AgentDefinitionSchema.safeParse(agent)
      expect(result.success, `Agent "${name}" failed validation`).toBe(true)
    }
  })

  it('should have non-empty fallback chains', () => {
    for (const [name, agent] of agents) {
      expect(agent.fallbackChain.length, `Agent "${name}" has empty fallback chain`).toBeGreaterThan(0)
    }
  })

  it('should have non-empty capabilities', () => {
    for (const [name, agent] of agents) {
      expect(agent.capabilities.length, `Agent "${name}" has no capabilities`).toBeGreaterThan(0)
    }
  })
})
