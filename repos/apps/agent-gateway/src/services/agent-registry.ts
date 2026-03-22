import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { AgentManifest, AgentStatus } from '../types/agent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Agent Registry Service
 * Manages agent discovery, registration, and status tracking
 */
export class AgentRegistry {
  private agents: Map<string, AgentManifest> = new Map();
  private agentStatus: Map<string, AgentStatus> = new Map();
  private agentsPath: string;

  constructor(agentsPath?: string) {
    // Default to ../../agents from project root
    this.agentsPath = agentsPath || join(__dirname, '../../../../agents');
  }

  /**
   * Load all agent manifests from the agents directory
   */
  async loadAgents(): Promise<void> {
    try {
      const agentDirs = await readdir(this.agentsPath, { withFileTypes: true });

      for (const dir of agentDirs) {
        if (!dir.isDirectory()) continue;

        const manifestPath = join(this.agentsPath, dir.name, 'manifest.json');

        try {
          const manifestContent = await readFile(manifestPath, 'utf-8');
          const manifest: AgentManifest = JSON.parse(manifestContent);

          this.agents.set(manifest.agent_id || manifest.name, manifest);

          // Initialize status
          this.agentStatus.set(manifest.agent_id || manifest.name, {
            agent_id: manifest.agent_id || manifest.name,
            name: manifest.name,
            status: 'offline',
            tasks_completed: 0,
            tasks_failed: 0
          });
        } catch (error) {
          console.warn(`Failed to load manifest for ${dir.name}:`, error);
        }
      }

      console.log(`Loaded ${this.agents.size} agents from registry`);
    } catch (error) {
      console.error('Failed to load agents:', error);
      throw error;
    }
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): AgentManifest[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): AgentManifest | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get agent status
   */
  getAgentStatus(agentId: string): AgentStatus | undefined {
    return this.agentStatus.get(agentId);
  }

  /**
   * Update agent status
   */
  updateAgentStatus(agentId: string, status: Partial<AgentStatus>): void {
    const current = this.agentStatus.get(agentId);
    if (current) {
      this.agentStatus.set(agentId, { ...current, ...status });
    }
  }

  /**
   * Record agent heartbeat
   */
  heartbeat(agentId: string): void {
    const status = this.agentStatus.get(agentId);
    if (status) {
      this.agentStatus.set(agentId, {
        ...status,
        last_heartbeat: new Date(),
        status: 'online'
      });
    }
  }

  /**
   * Search agents by capability
   */
  findByCapability(capability: string): AgentManifest[] {
    return this.getAllAgents().filter(agent =>
      agent.capabilities?.includes(capability)
    );
  }

  /**
   * Get agents by status
   */
  getAgentsByStatus(status: AgentStatus['status']): AgentStatus[] {
    return Array.from(this.agentStatus.values()).filter(
      s => s.status === status
    );
  }
}

// Singleton instance
export const agentRegistry = new AgentRegistry();
