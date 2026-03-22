// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import type { AgentDefinition } from '../schemas/agent.js'
import { TaskRouter, type RoutingRequest } from './router.js'
import { FallbackChain } from './fallback.js'

export interface Task {
  id: string
  description: string
  requiredCapabilities?: string[]
  preferredAgent?: string
}

export interface TaskResult {
  taskId: string
  agentName: string
  status: 'success' | 'failure'
  output?: string
  error?: string
}

export class Coordinator {
  private router: TaskRouter
  private results: Map<string, TaskResult> = new Map()

  constructor(agents?: AgentDefinition[]) {
    this.router = new TaskRouter(agents)
  }

  assign(task: Task): AgentDefinition {
    const request: RoutingRequest = {
      task: task.description,
      requiredCapabilities: task.requiredCapabilities,
      preferredAgent: task.preferredAgent,
    }
    const decision = this.router.route(request)
    return decision.agent
  }

  buildFallbackChain(agents: AgentDefinition[]): FallbackChain {
    return new FallbackChain(agents)
  }

  recordResult(result: TaskResult): void {
    this.results.set(result.taskId, result)
  }

  getResult(taskId: string): TaskResult | undefined {
    return this.results.get(taskId)
  }

  get completedTasks(): number {
    return this.results.size
  }
}
