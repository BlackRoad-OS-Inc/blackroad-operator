// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { z } from 'zod'

export const TaskSchema = z.object({
  id: z.string(),
  description: z.string(),
  intent: z.string().optional(),
  requiredCapabilities: z.array(z.string()).optional(),
  maxTokens: z.number().optional(),
})

export const TaskResultSchema = z.object({
  taskId: z.string(),
  agentName: z.string(),
  provider: z.string(),
  content: z.string(),
  success: z.boolean(),
})

export const RoutingDecisionSchema = z.object({
  agentName: z.string(),
  provider: z.string(),
  reason: z.string(),
})

export type Task = z.infer<typeof TaskSchema>
export type TaskResult = z.infer<typeof TaskResultSchema>
export type RoutingDecision = z.infer<typeof RoutingDecisionSchema>
