// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect } from 'vitest'
import { TaskRouter } from '../../src/orchestration/router.js'
import type { AgentDefinition } from '../../src/schemas/agent.js'

const mockAgents: AgentDefinition[] = [
  {
    name: 'arch',
    title: 'Architect',
    role: 'design',
    description: 'Designs systems',
    color: '#9C27B0',
    providers: ['anthropic'],
    maxTokens: 8192,
    capabilities: ['architecture', 'design', 'systems'],
    fallbackChain: ['anthropic'],
  },
  {
    name: 'ops',
    title: 'Operator',
    role: 'operations',
    description: 'Runs things',
    color: '#4CAF50',
    providers: ['openai'],
    maxTokens: 4096,
    capabilities: ['deploy', 'monitoring', 'automation'],
    fallbackChain: ['openai'],
  },
]

describe('TaskRouter', () => {
  it('should route to preferred agent when specified', () => {
    const router = new TaskRouter(mockAgents)
    const decision = router.route({ task: 'anything', preferredAgent: 'ops' })
    expect(decision.agent.name).toBe('ops')
    expect(decision.score).toBe(1)
  })

  it('should route by capability match', () => {
    const router = new TaskRouter(mockAgents)
    const decision = router.route({
      task: 'deploy the service',
      requiredCapabilities: ['deploy'],
    })
    expect(decision.agent.name).toBe('ops')
  })

  it('should route by task keyword match', () => {
    const router = new TaskRouter(mockAgents)
    const decision = router.route({ task: 'design a new architecture' })
    expect(decision.agent.name).toBe('arch')
  })

  it('should fallback to first agent with no matching capabilities', () => {
    const router = new TaskRouter(mockAgents)
    const decision = router.route({ task: 'something unrelated' })
    expect(decision.agent).toBeDefined()
  })
})
