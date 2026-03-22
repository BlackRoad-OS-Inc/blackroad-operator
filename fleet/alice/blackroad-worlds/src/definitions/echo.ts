// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import type { AgentDefinition } from '../schemas/agent.js'

export const echo: AgentDefinition = {
  name: 'echo',
  title: 'The Librarian',
  role: 'Memory, recall, knowledge management',
  description: 'Echo specializes in memory consolidation, knowledge retrieval, and context management.',
  color: '#7AC2E0',
  providers: ['anthropic', 'ollama'],
  maxTokens: 4096,
  capabilities: ['memory', 'recall', 'knowledge', 'context', 'search'],
  fallbackChain: ['anthropic', 'ollama'],
}
