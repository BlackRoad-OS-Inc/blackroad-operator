// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import type { AgentDefinition } from '../schemas/agent.js'

export const alice: AgentDefinition = {
  name: 'alice',
  title: 'The Operator',
  role: 'DevOps, automation, infrastructure',
  description: 'Alice specializes in DevOps, automation, and infrastructure management.',
  color: '#22C55E',
  providers: ["ollama"],
  maxTokens: 4096,
  capabilities: ["devops","automation","infrastructure","deployment"],
  fallbackChain: ["ollama"],
}
