import { EventEmitter } from 'events';

export interface AgentEntry {
  id: string; name: string; role: string; capabilities: string[];
  endpoint: string; status: 'online' | 'offline' | 'busy';
  lastHeartbeat: number; metadata: Record<string, unknown>;
}

export class AgentRegistry extends EventEmitter {
  private agents: Map<string, AgentEntry> = new Map();
  private heartbeatTimeout = 30000;

  register(agent: Omit<AgentEntry, 'status' | 'lastHeartbeat'>): AgentEntry {
    const entry: AgentEntry = { ...agent, status: 'online', lastHeartbeat: Date.now() };
    this.agents.set(agent.id, entry);
    this.emit('agent:registered', entry);
    return entry;
  }

  unregister(id: string): boolean {
    const agent = this.agents.get(id);
    if (!agent) return false;
    this.agents.delete(id);
    this.emit('agent:unregistered', agent);
    return true;
  }

  heartbeat(id: string): boolean {
    const agent = this.agents.get(id);
    if (!agent) return false;
    agent.lastHeartbeat = Date.now();
    agent.status = 'online';
    return true;
  }

  setStatus(id: string, status: AgentEntry['status']): boolean {
    const agent = this.agents.get(id);
    if (!agent) return false;
    agent.status = status;
    this.emit('agent:status', { id, status });
    return true;
  }

  get(id: string): AgentEntry | undefined { return this.agents.get(id); }
  list(): AgentEntry[] { return Array.from(this.agents.values()); }

  findByCapability(capability: string): AgentEntry[] {
    return this.list().filter(a => a.status === 'online' && a.capabilities.includes(capability));
  }

  findByRole(role: string): AgentEntry[] {
    return this.list().filter(a => a.role === role && a.status === 'online');
  }

  sweep(): string[] {
    const now = Date.now();
    const stale: string[] = [];
    for (const [id, agent] of this.agents) {
      if (now - agent.lastHeartbeat > this.heartbeatTimeout) {
        agent.status = 'offline';
        stale.push(id);
        this.emit('agent:timeout', agent);
      }
    }
    return stale;
  }

  startSweeper(intervalMs = 10000): NodeJS.Timeout {
    return setInterval(() => this.sweep(), intervalMs);
  }

  toJSON() { return this.list(); }
}

export const registry = new AgentRegistry();
