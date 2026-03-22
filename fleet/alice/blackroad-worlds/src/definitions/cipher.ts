// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import type { AgentDefinition } from '../schemas/agent.js'

export const cipher: AgentDefinition = {
  name: 'cipher',
  title: 'The Sentinel',
  role: 'Security, encryption, access control',
  description: 'Cipher specializes in security, encryption, and access control.',
  color: '#2979FF',
  providers: ["anthropic"],
  maxTokens: 4096,
  capabilities: ["security","encryption","audit","access-control"],
  fallbackChain: ["anthropic"],
}
