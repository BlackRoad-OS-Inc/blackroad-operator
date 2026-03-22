import { Router } from 'express';
import type { Request, Response } from 'express';
import { agentRegistry } from '../services/agent-registry.js';
import { taskExecutor } from '../services/task-executor.js';
import type { TaskRequest } from '../types/agent.js';

const router = Router();

/**
 * GET /v1/agents
 * List all registered agents
 */
router.get('/', (req: Request, res: Response) => {
  const agents = agentRegistry.getAllAgents();
  res.json({
    count: agents.length,
    agents: agents.map(agent => ({
      id: agent.agent_id || agent.name,
      name: agent.name,
      version: agent.version,
      description: agent.description,
      capabilities: agent.capabilities,
      status: agentRegistry.getAgentStatus(agent.agent_id || agent.name)?.status || 'offline'
    }))
  });
});

/**
 * GET /v1/agents/:id
 * Get agent details and status
 */
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const agent = agentRegistry.getAgent(id);

  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  const status = agentRegistry.getAgentStatus(id);

  res.json({
    manifest: agent,
    status: status || {
      agent_id: id,
      name: agent.name,
      status: 'offline'
    }
  });
});

/**
 * GET /v1/agents/:id/status
 * Get agent runtime status and metrics
 */
router.get('/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const status = agentRegistry.getAgentStatus(id);

  if (!status) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  res.json(status);
});

/**
 * POST /v1/agents/:id/tasks
 * Submit a task to an agent
 */
router.post('/:id/tasks', async (req: Request, res: Response) => {
  const { id } = req.params;
  const taskRequest: TaskRequest = req.body;

  if (!taskRequest.task) {
    return res.status(400).json({ error: 'Task description is required' });
  }

  try {
    const task = await taskExecutor.executeTask(id, taskRequest);
    res.status(202).json({
      task_id: task.task_id,
      status: task.status,
      message: 'Task submitted successfully',
      poll_url: `/v1/tasks/${task.task_id}`
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /v1/agents/:id/tasks
 * Get all tasks for a specific agent
 */
router.get('/:id/tasks', (req: Request, res: Response) => {
  const { id } = req.params;
  const tasks = taskExecutor.getAgentTasks(id);

  res.json({
    agent_id: id,
    count: tasks.length,
    tasks: tasks.map(task => ({
      task_id: task.task_id,
      status: task.status,
      started_at: task.started_at,
      completed_at: task.completed_at,
      execution_time_ms: task.execution_time_ms
    }))
  });
});

/**
 * POST /v1/agents/:id/heartbeat
 * Agent heartbeat endpoint
 */
router.post('/:id/heartbeat', (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    agentRegistry.heartbeat(id);
    res.json({ success: true, timestamp: new Date() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /v1/agents/capabilities/:capability
 * Find agents by capability
 */
router.get('/capabilities/:capability', (req: Request, res: Response) => {
  const { capability } = req.params;
  const agents = agentRegistry.findByCapability(capability);

  res.json({
    capability,
    count: agents.length,
    agents: agents.map(agent => ({
      id: agent.agent_id || agent.name,
      name: agent.name,
      description: agent.description
    }))
  });
});

export default router;
