/**
 * Agent Registry - Centralized agent management with copilot-NAME-ROLE naming
 */

import fs from 'node:fs';
import path from 'node:path';

interface Agent {
  id: string;
  name: string;
  role: string;
  fullTitle: string;
  description: string;
  responsibilities: string[];
  active: boolean;
  customName?: string; // Allows agents to pick their own name
}

interface AgentRegistry {
  agents: Agent[];
  metadata: {
    version: string;
    lastUpdated: string;
    totalAgents: number;
    namingConvention: string;
    allowCustomNames: boolean;
    requireApproval: boolean;
  };
}

class AgentManager {
  private registry: AgentRegistry;
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath || path.join(process.cwd(), 'config', 'agents.json');
    this.registry = this.loadRegistry();
  }

  private loadRegistry(): AgentRegistry {
    try {
      const data = fs.readFileSync(this.configPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('Could not load agent registry, using defaults');
      return this.getDefaultRegistry();
    }
  }

  private getDefaultRegistry(): AgentRegistry {
    return {
      agents: [],
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        totalAgents: 0,
        namingConvention: 'copilot-{name}-{role}',
        allowCustomNames: true,
        requireApproval: false,
      },
    };
  }

  saveRegistry(): void {
    fs.writeFileSync(this.configPath, JSON.stringify(this.registry, null, 2));
  }

  /**
   * Get all active agents
   */
  getActiveAgents(): Agent[] {
    return this.registry.agents.filter((agent) => agent.active);
  }

  /**
   * Get agent by ID
   */
  getAgent(id: string): Agent | undefined {
    return this.registry.agents.find((agent) => agent.id === id);
  }

  /**
   * Get agents by role
   */
  getAgentsByRole(role: string): Agent[] {
    return this.registry.agents.filter((agent) => agent.role === role && agent.active);
  }

  /**
   * Format agent mention for PR comments
   */
  getMentionTag(agent: Agent): string {
    return `@${agent.id}`;
  }

  /**
   * Get all agent mentions as a string
   */
  getAllMentions(): string {
    return this.getActiveAgents()
      .map((agent) => this.getMentionTag(agent))
      .join(' ');
  }

  /**
   * Add a new agent or allow an agent to pick their name
   */
  addAgent(agent: Partial<Agent>): Agent {
    // Validate required fields
    if (!agent.name || !agent.role) {
      throw new Error('Agent must have at least a name and role');
    }

    // Generate ID using naming convention
    const id = agent.customName
      ? `copilot-${agent.customName.toLowerCase()}-${agent.role.toLowerCase()}`
      : `copilot-${agent.name.toLowerCase()}-${agent.role.toLowerCase()}`;

    const newAgent: Agent = {
      id,
      name: agent.customName || agent.name,
      role: agent.role,
      fullTitle: agent.fullTitle || agent.role,
      description: agent.description || '',
      responsibilities: agent.responsibilities || [],
      active: agent.active !== false,
    };

    this.registry.agents.push(newAgent);
    this.registry.metadata.totalAgents = this.registry.agents.length;
    this.registry.metadata.lastUpdated = new Date().toISOString();

    this.saveRegistry();
    return newAgent;
  }

  /**
   * Prompt an agent to pick their name
   */
  promptForName(role: string, defaultName?: string): string {
    console.log(`\n🤖 New ${role} agent detected!`);
    console.log(
      `Would you like to pick a custom name? (default: ${defaultName || 'auto-generated'})`,
    );
    console.log(
      'Your agent ID will be: copilot-{YOUR_NAME}-{ROLE} (e.g., copilot-cece-swe)',
    );

    // In a real implementation, this would use readline or similar for user input
    // For now, return the default
    return defaultName || role;
  }

  /**
   * Get agents by responsibility
   */
  getAgentsByResponsibility(responsibility: string): Agent[] {
    return this.registry.agents.filter(
      (agent) => agent.active && agent.responsibilities.includes(responsibility),
    );
  }

  /**
   * Get statistics about the agent registry
   */
  getStats() {
    const active = this.getActiveAgents();
    const byRole: Record<string, number> = {};

    for (const agent of active) {
      byRole[agent.role] = (byRole[agent.role] || 0) + 1;
    }

    return {
      total: this.registry.agents.length,
      active: active.length,
      inactive: this.registry.agents.length - active.length,
      byRole,
      namingConvention: this.registry.metadata.namingConvention,
    };
  }
}

export { AgentManager, type Agent, type AgentRegistry };

// CLI usage
if (require.main === module) {
  const manager = new AgentManager();

  const command = process.argv[2];

  switch (command) {
    case 'list':
      console.log('Active Agents:');
      for (const agent of manager.getActiveAgents()) {
        console.log(`  ${agent.id} - ${agent.fullTitle}`);
      }
      break;

    case 'stats':
      console.log('Agent Registry Statistics:');
      console.log(manager.getStats());
      break;

    case 'mentions':
      console.log('Agent Mentions:');
      console.log(manager.getAllMentions());
      break;

    case 'add':
      {
        const name = process.argv[3];
        const role = process.argv[4];
        if (!name || !role) {
          console.error('Usage: agent_registry.ts add <name> <role>');
          process.exit(1);
        }
        const agent = manager.addAgent({ name, role });
        console.log(`Added agent: ${agent.id}`);
      }
      break;

    default:
      console.log('Usage: agent_registry.ts <command>');
      console.log('Commands:');
      console.log('  list      - List all active agents');
      console.log('  stats     - Show agent statistics');
      console.log('  mentions  - Get all agent mentions');
      console.log('  add <name> <role> - Add a new agent');
  }
}
