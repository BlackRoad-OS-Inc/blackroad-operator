import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import type { TaskRequest, TaskResult } from '../types/agent.js';
import { agentRegistry } from './agent-registry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Task Executor Service
 * Executes agent tasks via Prism Shell
 */
export class TaskExecutor {
  private tasks: Map<string, TaskResult> = new Map();
  private prismShellPath: string;

  constructor(prismShellPath?: string) {
    this.prismShellPath = prismShellPath || join(__dirname, '../../../../prism/prismsh.js');
  }

  /**
   * Execute a task on a specific agent
   */
  async executeTask(agentId: string, request: TaskRequest): Promise<TaskResult> {
    const agent = agentRegistry.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const taskId = uuidv4();
    const task: TaskResult = {
      task_id: taskId,
      agent_id: agentId,
      status: 'pending',
      started_at: new Date()
    };

    this.tasks.set(taskId, task);

    // Execute task asynchronously
    this.runTaskAsync(taskId, agent.name, request).catch(error => {
      console.error(`Task ${taskId} failed:`, error);
      this.updateTask(taskId, {
        status: 'failed',
        error: error.message,
        completed_at: new Date()
      });
    });

    return task;
  }

  /**
   * Run task asynchronously via Prism Shell
   */
  private async runTaskAsync(taskId: string, agentName: string, request: TaskRequest): Promise<void> {
    this.updateTask(taskId, { status: 'running' });

    return new Promise((resolve, reject) => {
      const timeout = request.timeout_ms || 30000; // Default 30s timeout
      let output = '';
      let errorOutput = '';

      // Spawn agent process via Prism Shell
      const child = spawn('node', [
        this.prismShellPath,
        'spawn',
        agentName,
        '--task',
        request.task,
        '--context',
        JSON.stringify(request.context || {})
      ]);

      const timeoutHandle = setTimeout(() => {
        child.kill();
        this.updateTask(taskId, {
          status: 'timeout',
          error: `Task exceeded timeout of ${timeout}ms`,
          completed_at: new Date()
        });
        reject(new Error('Task timeout'));
      }, timeout);

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        clearTimeout(timeoutHandle);

        if (code === 0) {
          try {
            const result = JSON.parse(output);
            this.updateTask(taskId, {
              status: 'completed',
              result,
              completed_at: new Date(),
              execution_time_ms: Date.now() - this.tasks.get(taskId)!.started_at.getTime()
            });

            // Update agent stats
            const status = agentRegistry.getAgentStatus(this.tasks.get(taskId)!.agent_id);
            if (status) {
              agentRegistry.updateAgentStatus(status.agent_id, {
                tasks_completed: (status.tasks_completed || 0) + 1
              });
            }

            resolve();
          } catch (error) {
            this.updateTask(taskId, {
              status: 'failed',
              error: 'Failed to parse agent output',
              result: { raw_output: output },
              completed_at: new Date()
            });
            reject(error);
          }
        } else {
          this.updateTask(taskId, {
            status: 'failed',
            error: errorOutput || `Process exited with code ${code}`,
            completed_at: new Date()
          });

          // Update agent stats
          const status = agentRegistry.getAgentStatus(this.tasks.get(taskId)!.agent_id);
          if (status) {
            agentRegistry.updateAgentStatus(status.agent_id, {
              tasks_failed: (status.tasks_failed || 0) + 1
            });
          }

          reject(new Error(errorOutput || `Process exited with code ${code}`));
        }
      });
    });
  }

  /**
   * Get task status
   */
  getTask(taskId: string): TaskResult | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks for an agent
   */
  getAgentTasks(agentId: string): TaskResult[] {
    return Array.from(this.tasks.values()).filter(
      task => task.agent_id === agentId
    );
  }

  /**
   * Update task details
   */
  private updateTask(taskId: string, updates: Partial<TaskResult>): void {
    const task = this.tasks.get(taskId);
    if (task) {
      this.tasks.set(taskId, { ...task, ...updates });
    }
  }
}

// Singleton instance
export const taskExecutor = new TaskExecutor();
