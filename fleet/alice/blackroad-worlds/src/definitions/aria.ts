// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import type { AgentDefinition } from '../schemas/agent.js'

export const aria: AgentDefinition = {
  name: 'aria',
  title: 'The Interface',
  role: 'Frontend development, UX design, user experience',
  description: 'Aria specializes in frontend development, UI/UX design, and building beautiful user interfaces.',
  color: '#818CF8',
  providers: ['anthropic', 'openai'],
  maxTokens: 4096,
  capabilities: ['frontend', 'ui', 'ux', 'design', 'react', 'css'],
  fallbackChain: ['anthropic', 'openai', 'ollama'],
}
