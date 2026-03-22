import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getStateStore } from "../store/stateStore";
import { ALL_CAPABILITIES, Policy } from "../../packages/prism-core/src";

const modeSchema = z.object({
  mode: z.enum(["playground", "dev", "trusted", "prod"]),
});

const CAPABILITY_VALUES = ["read", "write", "exec", "net", "secrets", "dns", "deploy"] as const;
const capabilityEnum = z.enum(CAPABILITY_VALUES);

const policyUpdateSchema = z.object({
  mode: z.enum(["playground", "dev", "trusted", "prod"]).optional(),
  approvals: z.record(capabilityEnum, z.enum(["auto", "review", "forbid"])).optional(),
});

export async function policyRoutes(fastify: FastifyInstance) {
  const store = getStateStore();

  fastify.get("/mode", async () => {
    const policy = store.getPolicy("global");
    return { currentMode: policy.mode };
  });

  fastify.put("/mode", async (req) => {
    const body = modeSchema.parse(req.body ?? {});
    const policy = store.updatePolicy("global", { mode: body.mode });
    return { currentMode: policy.mode };
  });

  fastify.get("/policies", async (req) => {
    const query = z
      .object({
        projectId: z.string().optional(),
      })
      .parse(req.query ?? {});

    if (query.projectId) {
      const snapshot = store.getProject(query.projectId);
      return { policy: snapshot.policy };
    }

    return { policies: store.getProjects().map((project) => ({ projectId: project.projectId, policy: project.policy })) };
  });

  fastify.get("/policies/:projectId", async (req) => {
    const projectId = (req.params as any).projectId as string;
    const snapshot = store.getProject(projectId);
    return { policy: snapshot.policy };
  });

  fastify.put("/policies/:projectId", async (req) => {
    const projectId = (req.params as any).projectId as string;
    const body = policyUpdateSchema.parse(req.body ?? {});
    const policy = store.updatePolicy(projectId, body as Partial<Policy>);
    return { policy };
  });
}

export default policyRoutes;
