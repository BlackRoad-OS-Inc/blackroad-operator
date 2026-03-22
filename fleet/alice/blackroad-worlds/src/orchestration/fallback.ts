// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import type { AgentDefinition } from '../schemas/agent.js'

export interface FallbackResult<T> {
  agent: AgentDefinition
  result: T
  attempts: number
}

export class FallbackChain {
  private chain: AgentDefinition[]

  constructor(agents: AgentDefinition[]) {
    this.chain = agents
  }

  async execute<T>(
    fn: (agent: AgentDefinition) => Promise<T>,
  ): Promise<FallbackResult<T>> {
    let attempts = 0
    const errors: Error[] = []

    for (const agent of this.chain) {
      attempts++
      try {
        const result = await fn(agent)
        return { agent, result, attempts }
      } catch (err) {
        errors.push(err instanceof Error ? err : new Error(String(err)))
      }
    }

    throw new AggregateError(
      errors,
      `All ${this.chain.length} agents in fallback chain failed`,
    )
  }

  get length(): number {
    return this.chain.length
  }

  get agents(): readonly AgentDefinition[] {
    return this.chain
  }
}
