import { FastifyInstance } from "fastify";
import { z } from "zod";
import { createRunLifecycle, RunLifecycle } from "../../packages/prism-core/src/run";
import { getStateStore } from "../store/stateStore";
import { getEventBus, publishEvent } from "../events/bus";

const startSchema = z.object({
  projectId: z.string().default("global"),
  sessionId: z.string().default("default"),
  summary: z.string().min(1),
  actor: z.string().optional(),
  ctx: z.record(z.any()).optional(),
  runId: z.string().optional(),
});

const endSchema = z.object({
  projectId: z.string().optional(),
  summary: z.string().optional(),
  status: z.enum(["ok", "error", "cancelled"]).optional(),
  actor: z.string().optional(),
  ctx: z.record(z.any()).optional(),
});

const eventSchema = z.object({
  topic: z.string().min(1),
  payload: z.record(z.any()).default({}),
  actor: z.string().optional(),
  at: z.string().optional(),
  kpis: z.record(z.union([z.string(), z.number()])).optional(),
  memory_deltas: z.array(z.record(z.any())).optional(),
});

const failSchema = endSchema.extend({
  error: z.any().optional(),
});

const listSchema = z.object({
  projectId: z.string().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

type RunIndexEntry = { key: string; projectId: string };

export async function runRoutes(fastify: FastifyInstance) {
  const store = getStateStore();
  const lifecycles = new Map<string, RunLifecycle>();
  const runIndex = new Map<string, RunIndexEntry>();

  const ensureLifecycle = (projectId: string, sessionId: string) => {
    const key = `${projectId}:${sessionId}`;
    const existing = lifecycles.get(key);
    if (existing) return existing;

    const lifecycle = createRunLifecycle({
      projectId,
      sessionId,
      publish: async (event) => {
        await getEventBus().publish(event);
        const payload = event.payload as any;
        const runId = payload.runId;
        const targetProject = payload.projectId ?? projectId;
        if (!runId) return;
        if (event.topic === "actions.run.start") {
          store.startRun(event);
        } else if (event.topic === "actions.run.end") {
          store.endRun(event);
          runIndex.delete(runId);
        } else {
          store.appendRunEvent(runId, targetProject, event);
        }
      },
    });
    lifecycles.set(key, lifecycle);
    return lifecycle;
  };

  fastify.post("/runs", async (req) => {
    const body = startSchema.parse(req.body ?? {});
    const lifecycle = ensureLifecycle(body.projectId, body.sessionId);
    const { runId, event } = await lifecycle.startRun({
      summary: body.summary,
      actor: body.actor,
      ctx: body.ctx,
      runId: body.runId,
    });
    runIndex.set(runId, { key: `${body.projectId}:${body.sessionId}`, projectId: body.projectId });
    const snapshot = store.getProject(body.projectId);
    const run = snapshot.runs.find((entry) => entry.runId === runId);
    return { runId, event, run };
  });

  fastify.post("/runs/:runId/end", async (req) => {
    const runId = (req.params as any).runId as string;
    const body = endSchema.parse(req.body ?? {});
    const info = runIndex.get(runId);
    if (!info) {
      throw new Error(`Unknown run: ${runId}`);
    }
    const lifecycle = lifecycles.get(info.key);
    if (!lifecycle) {
      throw new Error(`Lifecycle missing for run ${runId}`);
    }
    const event = await lifecycle.endRun(runId, {
      summary: body.summary,
      status: body.status,
      actor: body.actor,
      ctx: body.ctx,
    });
    const snapshot = store.getProject(body.projectId ?? info.projectId);
    const run = snapshot.runs.find((entry) => entry.runId === runId);
    return { event, run };
  });

  fastify.post("/runs/:runId/fail", async (req) => {
    const runId = (req.params as any).runId as string;
    const body = failSchema.parse(req.body ?? {});
    const info = runIndex.get(runId);
    if (!info) throw new Error(`Unknown run: ${runId}`);
    const lifecycle = lifecycles.get(info.key);
    if (!lifecycle) throw new Error(`Lifecycle missing for run ${runId}`);
    const error = body.error instanceof Error ? body.error : new Error(typeof body.error === "string" ? body.error : "run failed");
    const event = await lifecycle.failRun(runId, error, {
      summary: body.summary,
      status: body.status ?? "error",
      actor: body.actor,
      ctx: body.ctx,
    });
    const snapshot = store.getProject(body.projectId ?? info.projectId);
    const run = snapshot.runs.find((entry) => entry.runId === runId);
    return { event, run };
  });

  fastify.post("/runs/:runId/events", async (req) => {
    const runId = (req.params as any).runId as string;
    const body = eventSchema.parse(req.body ?? {});
    const info = runIndex.get(runId);
    if (!info) {
      throw new Error(`Unknown run: ${runId}`);
    }
    const event = await publishEvent(
      body.topic,
      { ...body.payload, runId, projectId: info.projectId },
      {
        actor: body.actor,
        at: body.at,
        kpis: body.kpis,
        memory_deltas: body.memory_deltas as any,
      }
    );
    store.appendRunEvent(runId, info.projectId, event);
    return { event };
  });

  fastify.get("/runs", async (req) => {
    const query = listSchema.parse(req.query ?? {});
    const runs = store.listRuns({ projectId: query.projectId, limit: query.limit });
    return { runs };
  });
}

export default runRoutes;
