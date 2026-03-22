import * as vscode from 'vscode';

export interface Agent {
  id: string;
  name: string;
  type: string;
  division?: string;
  level: number;
  status: string;
  load?: number;
  created_at: string;
  last_seen?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  division?: string;
  assigned_agent?: string;
  created_at: string;
}

export interface MemoryEntry {
  hash: string;
  timestamp: string;
  action: string;
  entity: string;
  details?: string;
  tags?: string[];
}

export interface Stats {
  total: number;
  by_status?: Record<string, number>;
  active?: number;
  pending?: number;
  completed?: number;
}

export class BlackRoadAPI {
  private apiKey: string;
  private baseUrl: string;
  private connected: boolean = false;

  constructor() {
    const config = vscode.workspace.getConfiguration('blackroad');
    this.apiKey = config.get('apiKey') || process.env.BLACKROAD_API_KEY || '';
    this.baseUrl = config.get('apiUrl') || 'https://api.blackroad.io/v1';
  }

  async connect(): Promise<boolean> {
    if (!this.apiKey) {
      const key = await vscode.window.showInputBox({
        prompt: 'Enter your BlackRoad API key',
        password: true,
        placeHolder: 'br_xxxxxxxxxxxxxxxx'
      });

      if (key) {
        this.apiKey = key;
        await vscode.workspace.getConfiguration('blackroad').update('apiKey', key, true);
      } else {
        return false;
      }
    }

    try {
      await this.request('GET', '/health');
      this.connected = true;
      return true;
    } catch (error) {
      this.connected = false;
      throw error;
    }
  }

  disconnect(): void {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  private async request<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'blackroad-vscode/1.0.0'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  // Agents API
  async listAgents(filters?: { division?: string; level?: number; status?: string }): Promise<Agent[]> {
    const params = new URLSearchParams();
    if (filters?.division) params.set('division', filters.division);
    if (filters?.level) params.set('level', String(filters.level));
    if (filters?.status) params.set('status', filters.status);

    const query = params.toString();
    const endpoint = query ? `/agents?${query}` : '/agents';
    const response = await this.request<{ agents: Agent[] }>('GET', endpoint);
    return response.agents || [];
  }

  async getAgent(agentId: string): Promise<Agent> {
    return this.request<Agent>('GET', `/agents/${agentId}`);
  }

  async registerAgent(name: string, type: string = 'ai', division?: string, level: number = 4): Promise<Agent> {
    return this.request<Agent>('POST', '/agents', { name, type, division, level });
  }

  async sendHeartbeat(agentId: string, load?: number): Promise<void> {
    await this.request('POST', `/agents/${agentId}/heartbeat`, { load });
  }

  async getAgentStats(): Promise<Stats> {
    return this.request<Stats>('GET', '/agents/stats');
  }

  // Tasks API
  async listTasks(filters?: { status?: string; priority?: string; division?: string }): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.priority) params.set('priority', filters.priority);
    if (filters?.division) params.set('division', filters.division);

    const query = params.toString();
    const endpoint = query ? `/tasks?${query}` : '/tasks';
    const response = await this.request<{ tasks: Task[] }>('GET', endpoint);
    return response.tasks || [];
  }

  async getTask(taskId: string): Promise<Task> {
    return this.request<Task>('GET', `/tasks/${taskId}`);
  }

  async dispatchTask(title: string, options?: { description?: string; priority?: string; division?: string }): Promise<Task> {
    return this.request<Task>('POST', '/tasks', {
      title,
      description: options?.description,
      priority: options?.priority || 'medium',
      division: options?.division
    });
  }

  async completeTask(taskId: string, result?: string): Promise<Task> {
    return this.request<Task>('PUT', `/tasks/${taskId}`, { status: 'completed', result });
  }

  async assignTask(taskId: string, agentId: string): Promise<Task> {
    return this.request<Task>('PUT', `/tasks/${taskId}`, { assigned_agent: agentId, status: 'assigned' });
  }

  async getTaskStats(): Promise<Stats> {
    return this.request<Stats>('GET', '/tasks/stats');
  }

  // Memory API
  async queryMemory(options?: { search?: string; action?: string; limit?: number }): Promise<MemoryEntry[]> {
    const params = new URLSearchParams();
    if (options?.search) params.set('q', options.search);
    if (options?.action) params.set('action', options.action);
    params.set('limit', String(options?.limit || 50));

    const response = await this.request<{ entries: MemoryEntry[] }>('GET', `/memory?${params.toString()}`);
    return response.entries || [];
  }

  async logMemory(action: string, entity: string, details?: string, tags?: string[]): Promise<MemoryEntry> {
    return this.request<MemoryEntry>('POST', '/memory', { action, entity, details, tags });
  }

  async getMemoryStats(): Promise<Stats> {
    return this.request<Stats>('GET', '/memory/stats');
  }

  // Health
  async health(): Promise<{ status: string; version: string }> {
    return this.request('GET', '/health');
  }
}
