import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getApproval, listApprovals, resolveApproval, clearApprovalPayload } from '../state/approvals';
import { applyDiffs } from '../utils/diff-writer';
import type { PrismDiff } from '@prism/core';

export default async function approvalsRoutes(app: FastifyInstance) {
  app.get('/approvals', async (req, reply) => {
    const query = z.object({ status: z.enum(['pending', 'approved', 'denied']).optional() }).parse(req.query);
    reply.send(listApprovals(query.status));
  });

  app.get('/approvals/:id', async (req, reply) => {
    const params = z.object({ id: z.string() }).parse(req.params);
    const approval = getApproval(params.id);
    if (!approval) {
      reply.code(404).send({ error: 'not found' });
      return;
    }
    reply.send(approval);
  });

  app.post('/approvals/:id/approve', async (req, reply) => {
    const params = z.object({ id: z.string() }).parse(req.params);
    const approval = getApproval(params.id);
    if (!approval) {
      reply.code(404).send({ error: 'not found' });
      return;
    }
    if (approval.status !== 'pending') {
      reply.code(400).send({ error: 'not pending' });
      return;
    }
    if (approval.capability === 'write') {
      const payload = approval.payload as { diffs: PrismDiff[]; message: string } | undefined;
      if (!payload) {
        reply.code(400).send({ error: 'missing payload' });
        return;
      }
      try {
        applyDiffs(payload.diffs, payload.message);
      } catch (error) {
        reply.code(400).send({ error: (error as Error).message });
        return;
      }
    }
    resolveApproval(params.id, 'approved', 'user');
    clearApprovalPayload(params.id);
    reply.send({ status: 'approved' });
  });

  app.post('/approvals/:id/deny', async (req, reply) => {
    const params = z.object({ id: z.string() }).parse(req.params);
    const approval = getApproval(params.id);
    if (!approval) {
      reply.code(404).send({ error: 'not found' });
      return;
    }
    if (approval.status !== 'pending') {
      reply.code(400).send({ error: 'not pending' });
      return;
    }
    resolveApproval(params.id, 'denied', 'user');
    clearApprovalPayload(params.id);
    reply.send({ status: 'denied' });
  });
}
