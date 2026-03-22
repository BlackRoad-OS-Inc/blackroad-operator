// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import type { AgentDefinition } from '../schemas/agent.js'

export const octavia: AgentDefinition = {
  name: 'octavia',
  title: 'The Architect',
  role: 'Systems design, strategy, architecture',
  description: 'Octavia specializes in systems architecture, technical strategy, and design patterns.',
  color: '#9C27B0',
  providers: ["anthropic","openai"],
  maxTokens: 8192,
  capabilities: ["architecture","design","review","strategy"],
  fallbackChain: ["anthropic","openai","ollama"],
}
