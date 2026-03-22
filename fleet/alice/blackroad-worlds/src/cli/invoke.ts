// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import { agents } from '../definitions/index.js'
import { TaskRouter } from '../orchestration/router.js'

export const invokeCommand = new Command('invoke')
  .description('Invoke an agent with a task')
  .argument('<agent>', 'Agent name')
  .argument('<task>', 'Task description')
  .action((agentName: string, task: string) => {
    const agent = agents.get(agentName)
    if (!agent) {
      const router = new TaskRouter()
      const decision = router.route({ task })
      console.log(`Agent "${agentName}" not found. Suggested: ${decision.agent.name} (${decision.reason})`)
      return
    }
    console.log(`Invoking ${agent.title} (${agent.name}) with task: ${task}`)
    console.log(`Capabilities: ${agent.capabilities.join(', ')}`)
    console.log(`Fallback chain: ${agent.fallbackChain.join(' -> ')}`)
  })
