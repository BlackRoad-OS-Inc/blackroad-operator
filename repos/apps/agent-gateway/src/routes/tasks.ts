import { Router } from 'express';
import type { Request, Response } from 'express';
import { taskExecutor } from '../services/task-executor.js';

const router = Router();

/**
 * GET /v1/tasks/:taskId
 * Get task status and results
 */
router.get('/:taskId', (req: Request, res: Response) => {
  const { taskId } = req.params;
  const task = taskExecutor.getTask(taskId);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(task);
});

export default router;
