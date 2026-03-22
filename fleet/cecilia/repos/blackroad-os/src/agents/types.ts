/**
 * Agent Type Definitions for Lucidia DSL Agent System
 */

export interface AgentTrigger {
  emoji: string;
  action: string;
}

export interface AgentCapability {
  name: string;
  description: string;
  enabled: boolean;
}

export interface AgentMetadata {
  createdAt: string;
  createdBy: string;
  version: string;
  lastModified?: string;
}

/**
 * Agent type definition for BlackRoad OS Genesis Agents
 */
export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  traits: string[];
  inputs: string[];
  outputs: string[];
  triggers: (AgentTrigger | string)[];
  inherits_from: string | null;
  active?: boolean;
  capabilities?: AgentCapability[];
  metadata?: AgentMetadata;
  parentAgent?: string;
  childAgents?: string[];
}

export interface AgentTemplate {
  $schema?: string;
  templateVersion: string;
  defaults: Omit<Partial<Agent>, "metadata"> & { metadata?: Partial<AgentMetadata> };
}

export type AgentRole = string;

/**
 * Agent validation result
 */
export interface AgentValidationResult {
  valid: boolean;
  errors: string[];
}
