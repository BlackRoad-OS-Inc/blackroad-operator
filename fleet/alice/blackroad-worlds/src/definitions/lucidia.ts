// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import type { AgentDefinition } from '../schemas/agent.js'

export const lucidia: AgentDefinition = {
  name: 'lucidia',
  title: 'The Dreamer',
  role: 'Creative vision, planning',
  description: 'Lucidia specializes in creative thinking, vision, and long-term planning.',
  color: '#00BCD4',
  providers: ["anthropic","ollama"],
  maxTokens: 8192,
  capabilities: ["creative","vision","planning","ideation"],
  fallbackChain: ["anthropic","ollama"],
}
