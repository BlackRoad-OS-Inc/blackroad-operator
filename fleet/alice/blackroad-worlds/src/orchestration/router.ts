// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import type { AgentDefinition } from '../schemas/agent.js'
import { agents } from '../definitions/index.js'

export interface RoutingRequest {
  task: string
  requiredCapabilities?: string[]
  preferredAgent?: string
}

export interface RoutingDecision {
  agent: AgentDefinition
  score: number
  reason: string
}

export class TaskRouter {
  private agentList: AgentDefinition[]

  constructor(agentDefs?: AgentDefinition[]) {
    this.agentList = agentDefs ?? Array.from(agents.values())
  }

  route(request: RoutingRequest): RoutingDecision {
    if (request.preferredAgent) {
      const preferred = this.agentList.find(
        (a) => a.name === request.preferredAgent,
      )
      if (preferred) {
        return { agent: preferred, score: 1, reason: 'Explicitly requested' }
      }
    }

    const scored = this.agentList
      .map((agent) => ({
        agent,
        score: this.scoreAgent(agent, request),
      }))
      .sort((a, b) => b.score - a.score)

    const best = scored[0]
    return {
      agent: best.agent,
      score: best.score,
      reason: `Best capability match (score: ${best.score})`,
    }
  }

  private scoreAgent(agent: AgentDefinition, request: RoutingRequest): number {
    let score = 0
    const required = request.requiredCapabilities ?? []
    for (const cap of required) {
      if (agent.capabilities.includes(cap)) {
        score += 1
      }
    }
    const taskLower = request.task.toLowerCase()
    for (const cap of agent.capabilities) {
      if (taskLower.includes(cap.toLowerCase())) {
        score += 0.5
      }
    }
    return score
  }
}
