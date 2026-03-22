/**
 * Shared State Management for Multi-Agent Coordination
 *
 * This system allows all 1000+ agents to see what others are doing in real-time
 * and coordinate their work like a shared document.
 */

import fs from 'node:fs';
import path from 'node:path';

interface AgentState {
  status: 'idle' | 'active' | 'blocked' | 'error';
  currentTask: string | null;
  lastActivity: string | null;
  tasksCompleted: number;
  activePRs: number[];
}

interface GlobalState {
  activePRs: Array<{
    number: number;
    title: string;
    agents: string[];
    status: string;
    lastUpdate: string;
  }>;
  recentChanges: Array<{
    timestamp: string;
    agent: string;
    action: string;
    details: string;
  }>;
  currentSprint: string | null;
  blockers: Array<{
    id: string;
    description: string;
    blockedAgents: string[];
    createdAt: string;
  }>;
}

interface SharedState {
  version: string;
  lastUpdated: string;
  agents: Record<string, AgentState>;
  globalState: GlobalState;
  coordination: {
    taskQueue: Array<{
      id: string;
      task: string;
      assignedTo: string | null;
      priority: 'low' | 'medium' | 'high' | 'critical';
      createdAt: string;
    }>;
    completedTasks: Array<{
      id: string;
      task: string;
      completedBy: string;
      completedAt: string;
    }>;
    inProgressTasks: Array<{
      id: string;
      task: string;
      assignedTo: string;
      startedAt: string;
    }>;
  };
  metadata: {
    totalAgents: number;
    activeAgents: number;
    totalTasksCompleted: number;
    systemStatus: 'operational' | 'degraded' | 'maintenance';
  };
}

export class SharedStateManager {
  private statePath: string;
  private state: SharedState;
  private lockPath: string;

  constructor(statePath?: string) {
    this.statePath = statePath || path.join(process.cwd(), 'config', 'agent-shared-state.json');
    this.lockPath = `${this.statePath}.lock`;
    this.state = this.loadState();
  }

  private loadState(): SharedState {
    try {
      const data = fs.readFileSync(this.statePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('Could not load shared state, initializing new state');
      return this.initializeState();
    }
  }

  private initializeState(): SharedState {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      agents: {},
      globalState: {
        activePRs: [],
        recentChanges: [],
        currentSprint: null,
        blockers: [],
      },
      coordination: {
        taskQueue: [],
        completedTasks: [],
        inProgressTasks: [],
      },
      metadata: {
        totalAgents: 0,
        activeAgents: 0,
        totalTasksCompleted: 0,
        systemStatus: 'operational',
      },
    };
  }

  private saveState(): void {
    this.state.lastUpdated = new Date().toISOString();
    fs.writeFileSync(this.statePath, JSON.stringify(this.state, null, 2));
  }

  /**
   * Acquire a lock for atomic updates
   */
  private acquireLock(timeout = 5000): boolean {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        fs.writeFileSync(this.lockPath, process.pid.toString(), { flag: 'wx' });
        return true;
      } catch (error) {
        // Lock exists, wait and retry
        const waitTime = 50;
        const elapsed = Date.now() - start;
        if (elapsed + waitTime < timeout) {
          // Sleep for a bit
          Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, waitTime);
        }
      }
    }
    return false;
  }

  private releaseLock(): void {
    try {
      fs.unlinkSync(this.lockPath);
    } catch (error) {
      // Lock file already removed
    }
  }

  /**
   * Update agent status - visible to all other agents in real-time
   */
  updateAgentStatus(agentId: string, status: Partial<AgentState>): void {
    if (this.acquireLock()) {
      try {
        this.state = this.loadState(); // Reload to get latest state

        if (!this.state.agents[agentId]) {
          this.state.agents[agentId] = {
            status: 'idle',
            currentTask: null,
            lastActivity: null,
            tasksCompleted: 0,
            activePRs: [],
          };
        }

        this.state.agents[agentId] = {
          ...this.state.agents[agentId],
          ...status,
          lastActivity: new Date().toISOString(),
        };

        this.saveState();
        this.broadcastChange(agentId, 'status_update', status);
      } finally {
        this.releaseLock();
      }
    }
  }

  /**
   * Get current state of all agents - see what everyone is doing
   */
  getAllAgentStates(): Record<string, AgentState> {
    this.state = this.loadState(); // Always get fresh state
    return this.state.agents;
  }

  /**
   * Get agents working on a specific PR
   */
  getAgentsOnPR(prNumber: number): string[] {
    this.state = this.loadState();
    return Object.entries(this.state.agents)
      .filter(([_, state]) => state.activePRs.includes(prNumber))
      .map(([id, _]) => id);
  }

  /**
   * Broadcast a change to the activity log
   */
  private broadcastChange(agent: string, action: string, details: any): void {
    this.state.globalState.recentChanges.unshift({
      timestamp: new Date().toISOString(),
      agent,
      action,
      details: JSON.stringify(details),
    });

    // Keep only last 100 changes
    if (this.state.globalState.recentChanges.length > 100) {
      this.state.globalState.recentChanges = this.state.globalState.recentChanges.slice(0, 100);
    }
  }

  /**
   * Get recent activity - see what happened recently
   */
  getRecentActivity(limit = 20): typeof this.state.globalState.recentChanges {
    this.state = this.loadState();
    return this.state.globalState.recentChanges.slice(0, limit);
  }

  /**
   * Add a task to the queue
   */
  addTask(task: string, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'): string {
    if (this.acquireLock()) {
      try {
        this.state = this.loadState();

        const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.state.coordination.taskQueue.push({
          id: taskId,
          task,
          assignedTo: null,
          priority,
          createdAt: new Date().toISOString(),
        });

        this.saveState();
        return taskId;
      } finally {
        this.releaseLock();
      }
    }
    throw new Error('Failed to acquire lock');
  }

  /**
   * Claim a task from the queue
   */
  claimTask(agentId: string, taskId?: string): any {
    if (this.acquireLock()) {
      try {
        this.state = this.loadState();

        let task;
        if (taskId) {
          const index = this.state.coordination.taskQueue.findIndex((t) => t.id === taskId);
          if (index !== -1) {
            task = this.state.coordination.taskQueue.splice(index, 1)[0];
          }
        } else {
          // Get highest priority task
          const sorted = [...this.state.coordination.taskQueue].sort((a, b) => {
            const priorities = { critical: 0, high: 1, medium: 2, low: 3 };
            return priorities[a.priority] - priorities[b.priority];
          });
          if (sorted.length > 0) {
            const index = this.state.coordination.taskQueue.indexOf(sorted[0]);
            task = this.state.coordination.taskQueue.splice(index, 1)[0];
          }
        }

        if (task) {
          this.state.coordination.inProgressTasks.push({
            id: task.id,
            task: task.task,
            assignedTo: agentId,
            startedAt: new Date().toISOString(),
          });

          this.updateAgentStatus(agentId, {
            status: 'active',
            currentTask: task.task,
          });

          this.saveState();
          return task;
        }

        return null;
      } finally {
        this.releaseLock();
      }
    }
    return null;
  }

  /**
   * Mark task as completed
   */
  completeTask(agentId: string, taskId: string): void {
    if (this.acquireLock()) {
      try {
        this.state = this.loadState();

        const index = this.state.coordination.inProgressTasks.findIndex((t) => t.id === taskId);
        if (index !== -1) {
          const task = this.state.coordination.inProgressTasks.splice(index, 1)[0];
          this.state.coordination.completedTasks.push({
            id: task.id,
            task: task.task,
            completedBy: agentId,
            completedAt: new Date().toISOString(),
          });

          if (this.state.agents[agentId]) {
            this.state.agents[agentId].tasksCompleted++;
          }

          this.state.metadata.totalTasksCompleted++;
          this.saveState();
        }
      } finally {
        this.releaseLock();
      }
    }
  }

  /**
   * Get overview of system state
   */
  getSystemOverview(): {
    activeAgents: number;
    pendingTasks: number;
    inProgressTasks: number;
    completedToday: number;
    recentActivity: any[];
  } {
    this.state = this.loadState();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const completedToday = this.state.coordination.completedTasks.filter(
      (t) => new Date(t.completedAt) >= todayStart,
    ).length;

    const activeAgents = Object.values(this.state.agents).filter(
      (a) => a.status === 'active',
    ).length;

    return {
      activeAgents,
      pendingTasks: this.state.coordination.taskQueue.length,
      inProgressTasks: this.state.coordination.inProgressTasks.length,
      completedToday,
      recentActivity: this.getRecentActivity(10),
    };
  }
}

// CLI usage
if (require.main === module) {
  const manager = new SharedStateManager();

  const command = process.argv[2];

  switch (command) {
    case 'overview':
      console.log('System Overview:');
      console.log(JSON.stringify(manager.getSystemOverview(), null, 2));
      break;

    case 'activity':
      console.log('Recent Activity:');
      console.log(JSON.stringify(manager.getRecentActivity(20), null, 2));
      break;

    case 'agents':
      console.log('All Agent States:');
      console.log(JSON.stringify(manager.getAllAgentStates(), null, 2));
      break;

    default:
      console.log('Usage: shared_state.ts <command>');
      console.log('Commands:');
      console.log('  overview  - Show system overview');
      console.log('  activity  - Show recent activity');
      console.log('  agents    - Show all agent states');
  }
}
