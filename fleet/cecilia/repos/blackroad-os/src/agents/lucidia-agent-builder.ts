/**
 * Lucidia Agent Builder
 * 
 * TypeScript module for dynamically instantiating and managing agents in code or UI.
 * Provides a fluent API for creating, loading, and manipulating agents.
 */

import * as fs from "fs";
import * as path from "path";
import type { Agent, AgentRole, AgentTrigger, AgentCapability } from "./types";
import { spawnAgent, saveAgent } from "./spawn-agent";

const AGENTS_DIR = path.join(__dirname, ".");

/**
 * Agent Builder - Fluent API for creating agents
 */
export class AgentBuilder {
  private agent: Partial<Agent>;
  
  constructor(name: string) {
    this.agent = {
      id: name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      name,
      traits: [],
      triggers: [],
      capabilities: [],
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: "agent-builder",
        version: "1.0.0"
      }
    };
  }
  
  /**
   * Set the agent's role
   */
  withRole(role: AgentRole): AgentBuilder {
    this.agent.role = role;
    return this;
  }
  
  /**
   * Set the agent's description
   */
  withDescription(description: string): AgentBuilder {
    this.agent.description = description;
    return this;
  }
  
  /**
   * Add traits to the agent
   */
  withTraits(...traits: string[]): AgentBuilder {
    this.agent.traits = [...(this.agent.traits || []), ...traits];
    return this;
  }
  
  /**
   * Add a trigger to the agent
   */
  withTrigger(emoji: string, action: string): AgentBuilder {
    this.agent.triggers = this.agent.triggers || [];
    (this.agent.triggers as (AgentTrigger | string)[]).push({ emoji, action });
    return this;
  }
  
  /**
   * Add a capability to the agent
   */
  withCapability(name: string, description: string, enabled = true): AgentBuilder {
    this.agent.capabilities = this.agent.capabilities || [];
    this.agent.capabilities.push({ name, description, enabled });
    return this;
  }
  
  /**
   * Set the parent agent (for spawned agents)
   */
  withParent(parentId: string): AgentBuilder {
    this.agent.parentAgent = parentId;
    return this;
  }
  
  /**
   * Set custom metadata
   */
  withMetadata(metadata: Partial<Agent["metadata"]>): AgentBuilder {
    this.agent.metadata = { ...this.agent.metadata, ...metadata } as Agent["metadata"];
    return this;
  }
  
  /**
   * Build the agent
   */
  build(): Agent {
    if (!this.agent.id || !this.agent.name) {
      throw new Error("Agent must have an id and name");
    }
    
    // Set defaults if not provided
    if (!this.agent.role) {
      this.agent.role = "custom";
    }
    
    if (!this.agent.description) {
      this.agent.description = `${this.agent.name} - A ${this.agent.role} agent`;
    }
    
    // Add base capabilities if none exist
    if (this.agent.capabilities?.length === 0) {
      this.agent.capabilities = [
        { name: "self-describe", description: "Agent can describe itself", enabled: true },
        { name: "issue-link", description: "Can be linked to issues", enabled: true },
        { name: "pr-link", description: "Can be linked to PRs", enabled: true }
      ];
    }
    
    // Add default trigger if none exist
    if (this.agent.triggers?.length === 0) {
      this.agent.triggers = [{ emoji: "🤖", action: "activate" }];
    }
    
    return this.agent as Agent;
  }
  
  /**
   * Build and save the agent to a file
   */
  buildAndSave(outputDir?: string): { agent: Agent; filePath: string } {
    const agent = this.build();
    const filePath = saveAgent(agent, outputDir);
    return { agent, filePath };
  }
}

/**
 * Agent Registry - Manages all agents in the system
 */
export class AgentRegistry {
  private agents: Map<string, Agent> = new Map();
  private agentsDir: string;
  
  constructor(agentsDir: string = AGENTS_DIR) {
    this.agentsDir = agentsDir;
  }
  
  /**
   * Load all agents from the directory
   */
  loadAll(): Agent[] {
    const files = fs.readdirSync(this.agentsDir).filter(f => 
      f.endsWith(".json") && !f.includes("template")
    );
    
    for (const file of files) {
      const filePath = path.join(this.agentsDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const agent: Agent = JSON.parse(content);
      this.agents.set(agent.id, agent);
    }
    
    return Array.from(this.agents.values());
  }
  
  /**
   * Get agent by ID
   */
  get(id: string): Agent | undefined {
    if (!this.agents.has(id)) {
      this.loadAgent(id);
    }
    return this.agents.get(id);
  }
  
  /**
   * Load a specific agent
   */
  private loadAgent(id: string): void {
    const filePath = path.join(this.agentsDir, `${id}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const agent: Agent = JSON.parse(content);
      this.agents.set(agent.id, agent);
    }
  }
  
  /**
   * List all agent IDs
   */
  list(): string[] {
    if (this.agents.size === 0) {
      this.loadAll();
    }
    return Array.from(this.agents.keys());
  }
  
  /**
   * Find agents by role
   */
  findByRole(role: AgentRole): Agent[] {
    if (this.agents.size === 0) {
      this.loadAll();
    }
    return Array.from(this.agents.values()).filter(a => a.role === role);
  }
  
  /**
   * Find agents by trigger emoji
   */
  findByTrigger(emoji: string): Agent[] {
    if (this.agents.size === 0) {
      this.loadAll();
    }
    return Array.from(this.agents.values()).filter(agent =>
      agent.triggers.some((trigger: AgentTrigger | string) =>
        typeof trigger === "string" ? trigger === emoji : trigger.emoji === emoji
      )
    );
  }
  
  /**
   * Get child agents of a parent
   */
  getChildren(parentId: string): Agent[] {
    const parent = this.get(parentId);
    if (!parent || !parent.childAgents) {
      return [];
    }
    return parent.childAgents.map((id: string) => this.get(id)).filter(Boolean) as Agent[];
  }
  
  /**
   * Spawn a new agent
   */
  spawn(name: string, options?: { role?: AgentRole; parent?: string }): Agent {
    const agent = spawnAgent(name, options);
    saveAgent(agent, this.agentsDir);
    this.agents.set(agent.id, agent);
    
    // Update parent if provided
    if (options?.parent) {
      const parent = this.get(options.parent);
      if (parent) {
        parent.childAgents = parent.childAgents || [];
        if (!parent.childAgents.includes(agent.id)) {
          parent.childAgents.push(agent.id);
          saveAgent(parent, this.agentsDir);
        }
      }
    }
    
    return agent;
  }
  
  /**
   * Check if agent can spawn children
   */
  canSpawn(agentId: string): boolean {
    const agent = this.get(agentId);
    if (!agent) return false;
    return agent.capabilities?.some((c: AgentCapability) => c.name === "spawn-agent" && c.enabled) ?? false;
  }
}

/**
 * Create a new agent builder
 */
export function createAgent(name: string): AgentBuilder {
  return new AgentBuilder(name);
}

/**
 * Get the default agent registry
 */
let defaultRegistry: AgentRegistry | null = null;

export function getRegistry(agentsDir?: string): AgentRegistry {
  if (!defaultRegistry) {
    defaultRegistry = new AgentRegistry(agentsDir);
  }
  return defaultRegistry;
}

// Export spawn functions for convenience
export { spawnAgent, saveAgent };
