import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { checkCapability } from '../policy';
import { startRun, listRuns, cancelRun } from '../state/runs';

const runRequestSchema = z.object({
  projectId: z.string(),
  sessionId: z.string(),
  cmd: z.string(),
  cwd: z.string().optional(),
  env: z.record(z.string()).optional(),
});
import { recordWorkflowEvent } from '../observability';

export default async function runRoutes(app: FastifyInstance) {
  app.post('/run', async (req, reply) => {
    const decision = checkCapability('exec');
    recordWorkflowEvent(`run.decision.${decision}`);
    req.log.info({ decision }, 'run capability decision');
    if (decision === 'forbid') {
      recordWorkflowEvent('run.forbidden');
      reply.code(403).send({ capability: 'exec', mode: 'forbid', message: 'exec forbidden in this mode' });
      return;
    }
    if (decision === 'review') {
      recordWorkflowEvent('run.pending_review');
      reply.send({ status: 'pending' });
      return;
    }
    const payload = runRequestSchema.parse(req.body);
    try {
      const result = startRun(payload.projectId, payload.sessionId, payload.cmd, payload.cwd, payload.env);
      reply.send(result);
    } catch (error) {
      reply.code(400).send({ error: (error as Error).message });
    }
  });

  app.get('/runs', async (req, reply) => {
    const query = z.object({ projectId: z.string(), limit: z.coerce.number().default(50) }).parse(req.query);
    reply.send(listRuns(query.projectId, query.limit));
  });

  app.post('/run/:id/cancel', async (req, reply) => {
    const params = z.object({ id: z.string() }).parse(req.params);
    const cancelled = cancelRun(params.id);
    reply.send({ ok: cancelled });
    recordWorkflowEvent('run.started');
    req.log.info('run accepted for execution');
    reply.send({ status: 'started' });
  });
}
