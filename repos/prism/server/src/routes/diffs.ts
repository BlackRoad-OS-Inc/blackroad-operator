import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createPatch } from 'diff';
import { createHash } from 'crypto';
import type { PrismDiff } from '@prism/core';
import { checkCapability } from '../policy';
import { createApproval } from '../state/approvals';
import { applyDiffs } from '../utils/diff-writer';

const diffSchema: z.ZodType<PrismDiff> = z.object({
  path: z.string(),
  beforeSha: z.string(),
  afterSha: z.string(),
  patch: z.string(),
  testsPredicted: z.array(z.string()).optional(),
});

export default async function diffsRoutes(app: FastifyInstance) {
  app.post('/diffs/propose', async (req, reply) => {
    const body = z.object({ files: z.record(z.string()) }).parse(req.body);
    const diffs = Object.entries(body.files).map(([filePath, content]) => ({
      path: filePath,
      beforeSha: createHash('sha1').update('').digest('hex'),
      afterSha: createHash('sha1').update(content).digest('hex'),
      patch: createPatch(filePath, '', content),
    } satisfies PrismDiff));
    reply.send(diffs);
  });

  app.post('/diffs/apply', async (req, reply) => {
    const body = z.object({ diffs: z.array(diffSchema), message: z.string() }).parse(req.body);
import { recordWorkflowEvent } from '../observability';

export default async function diffRoutes(app: FastifyInstance) {
  app.post('/diffs/apply', async (req, reply) => {
    const decision = checkCapability('write');
    recordWorkflowEvent(`diffs.decision.${decision}`);
    req.log.info({ decision }, 'diff apply capability decision');
    if (decision === 'forbid') {
      recordWorkflowEvent('diffs.forbidden');
      reply.code(403).send({ capability: 'write', mode: 'forbid', message: 'write forbidden in this mode' });
      return;
    }
    if (decision === 'review') {
      const approval = createApproval('write', body);
      reply.send({ status: 'pending', approvalId: approval.id });
      return;
    }
    try {
      const { commitSha } = applyDiffs(body.diffs, body.message);
      reply.send({ status: 'applied', commitSha });
    } catch (error) {
      reply.code(400).send({ error: (error as Error).message });
    const workRoot = path.resolve(process.cwd(), '../work');
    for (const d of body.diffs) {
      const result = applyPatch('', d.patch);
      const target = path.resolve(workRoot, d.path);
      if (!target.startsWith(workRoot + path.sep)) {
        reply.code(400).send({ error: 'Invalid path' });
        return;
      }
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, result);
      const event: PrismEvent = {
        id: nanoid(),
        ts: new Date().toISOString(),
        actor: 'lucidia',
        kind: 'file.write',
        projectId: 'local',
        sessionId: 'local',
        facet: 'space',
        summary: d.path,
        ctx: { message: body.message }
      };
      insertEvent(event);
      broadcast(event);
    }
      recordWorkflowEvent('diffs.pending_review');
      reply.send({ status: 'pending' });
      return;
    }
    recordWorkflowEvent('diffs.applied');
    reply.send({ status: 'applied' });
  });
}
