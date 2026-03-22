// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import type { AgentDefinition } from '../schemas/agent.js'

export const prism: AgentDefinition = {
  name: 'prism',
  title: 'The Analyst',
  role: 'Data analysis, pattern recognition',
  description: 'Prism specializes in data analysis and pattern recognition.',
  color: '#F5A623',
  providers: ["openai","ollama"],
  maxTokens: 4096,
  capabilities: ["analysis","patterns","data","reporting"],
  fallbackChain: ["openai","ollama"],
}
