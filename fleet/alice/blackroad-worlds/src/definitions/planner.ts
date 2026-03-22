// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import type { AgentDefinition } from '../schemas/agent.js'

export const planner: AgentDefinition = {
  name: 'planner',
  title: 'The Strategist',
  role: 'Task planning, decomposition, coordination',
  description: 'Planner specializes in task decomposition, planning, and multi-agent coordination.',
  color: '#FFFFFF',
  providers: ["anthropic","openai","gemini"],
  maxTokens: 16384,
  capabilities: ["planning","decomposition","coordination","delegation"],
  fallbackChain: ["anthropic","openai","gemini"],
}
