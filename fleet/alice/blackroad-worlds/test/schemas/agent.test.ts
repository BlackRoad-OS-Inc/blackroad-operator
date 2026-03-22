// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { AgentDefinitionSchema } from '../../src/schemas/agent.js'

describe('AgentDefinitionSchema', () => {
  const validAgent = {
    name: 'test-agent',
    title: 'The Tester',
    role: 'testing',
    description: 'A test agent',
    color: '#FF0000',
    providers: ['anthropic'],
    maxTokens: 4096,
    capabilities: ['testing', 'validation'],
    fallbackChain: ['anthropic', 'openai'],
  }

  it('should validate a valid agent definition', () => {
    const result = AgentDefinitionSchema.safeParse(validAgent)
    expect(result.success).toBe(true)
  })

  it('should reject missing name', () => {
    const { name, ...noName } = validAgent
    const result = AgentDefinitionSchema.safeParse(noName)
    expect(result.success).toBe(false)
  })

  it('should reject negative maxTokens', () => {
    const result = AgentDefinitionSchema.safeParse({ ...validAgent, maxTokens: -1 })
    expect(result.success).toBe(false)
  })

  it('should reject empty capabilities array', () => {
    const result = AgentDefinitionSchema.safeParse({ ...validAgent, capabilities: [] })
    expect(result.success).toBe(false)
  })

  it('should reject empty providers array', () => {
    const result = AgentDefinitionSchema.safeParse({ ...validAgent, providers: [] })
    expect(result.success).toBe(false)
  })
})
