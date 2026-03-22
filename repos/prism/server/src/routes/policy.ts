import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getPolicy, setMode, updateApprovals, checkCapability, resetApprovals, type Decision, type Capability } from '../policy';

const decisionSchema = z.enum(['auto', 'review', 'forbid']);

export default async function policyRoutes(fastify: FastifyInstance) {
  fastify.get('/policy', async (_req, reply) => {
    reply.send(getPolicy());
  });

  fastify.put('/policy', async (req, reply) => {
    const body = z.object({ approvals: z.record(decisionSchema).optional() }).parse(req.body ?? {});
    if (body.approvals) {
      updateApprovals(body.approvals as Partial<Record<Capability, Decision>>);
    } else {
      resetApprovals();
    }
    reply.send(getPolicy());
  });

  fastify.get('/mode', async (_req, reply) => {
    reply.send({ currentMode: getPolicy().mode });
  });

  fastify.put('/mode', async (req, reply) => {
    const body = z.object({ mode: z.enum(['playground', 'dev', 'trusted', 'prod']) }).parse(req.body);
    setMode(body.mode);
    reply.send({ currentMode: body.mode });
  });

  fastify.get('/policy/check/:capability', async (req, reply) => {
    const params = z.object({ capability: z.enum(['write', 'exec', 'net', 'secrets', 'dns', 'deploy', 'read']) }).parse(req.params);
    reply.send({ decision: checkCapability(params.capability) });
  });
}
