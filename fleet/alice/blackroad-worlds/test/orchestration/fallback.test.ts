// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { FallbackChain } from '../../src/orchestration/fallback.js'
import type { AgentDefinition } from '../../src/schemas/agent.js'

function mockAgent(name: string): AgentDefinition {
  return {
    name,
    title: `The ${name}`,
    role: 'test',
    description: 'Test agent',
    color: '#000',
    providers: ['test'],
    maxTokens: 4096,
    capabilities: ['test'],
    fallbackChain: ['test'],
  }
}

describe('FallbackChain', () => {
  it('should return first successful result', async () => {
    const chain = new FallbackChain([mockAgent('a'), mockAgent('b')])
    const result = await chain.execute(async (agent) => `done by ${agent.name}`)
    expect(result.agent.name).toBe('a')
    expect(result.result).toBe('done by a')
    expect(result.attempts).toBe(1)
  })

  it('should fall back on failure', async () => {
    const chain = new FallbackChain([mockAgent('a'), mockAgent('b')])
    let call = 0
    const result = await chain.execute(async (agent) => {
      call++
      if (call === 1) throw new Error('first failed')
      return `done by ${agent.name}`
    })
    expect(result.agent.name).toBe('b')
    expect(result.attempts).toBe(2)
  })

  it('should throw AggregateError when all fail', async () => {
    const chain = new FallbackChain([mockAgent('a'), mockAgent('b')])
    await expect(
      chain.execute(async () => {
        throw new Error('fail')
      }),
    ).rejects.toThrow('All 2 agents in fallback chain failed')
  })

  it('should expose chain length', () => {
    const chain = new FallbackChain([mockAgent('a'), mockAgent('b'), mockAgent('c')])
    expect(chain.length).toBe(3)
  })
})
