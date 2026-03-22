// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { z } from 'zod'

export const AgentDefinitionSchema = z.object({
  name: z.string(),
  title: z.string(),
  role: z.string(),
  description: z.string(),
  color: z.string(),
  providers: z.array(z.string()).min(1),
  maxTokens: z.number().int().positive(),
  capabilities: z.array(z.string()).min(1),
  fallbackChain: z.array(z.string()).min(1),
})

export type AgentDefinition = z.infer<typeof AgentDefinitionSchema>
