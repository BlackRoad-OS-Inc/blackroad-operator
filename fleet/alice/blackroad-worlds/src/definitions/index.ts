// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import type { AgentDefinition } from '../schemas/agent.js'
import { octavia } from './octavia.js'
import { lucidia } from './lucidia.js'
import { alice } from './alice.js'
import { cipher } from './cipher.js'
import { prism } from './prism.js'
import { echo } from './echo.js'
import { aria } from './aria.js'
import { planner } from './planner.js'

export const agents = new Map<string, AgentDefinition>([
  ['octavia', octavia],
  ['lucidia', lucidia],
  ['alice', alice],
  ['cipher', cipher],
  ['prism', prism],
  ['echo', echo],
  ['aria', aria],
  ['planner', planner],
])

export function getAgent(name: string): AgentDefinition | undefined {
  return agents.get(name)
}

export { octavia, lucidia, alice, cipher, prism, echo, aria, planner }
