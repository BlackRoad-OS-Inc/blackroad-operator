import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getTraceExporter } from "../store/traceExporter";

const spanSchema = z.object({
  spanId: z.string(),
  parentSpanId: z.string().optional(),
  name: z.string(),
  startTs: z.string(),
  endTs: z.string().optional(),
  status: z.enum(["ok", "error", "cancelled"]),
  attrs: z.record(z.any()).optional(),
  links: z.array(z.string()).optional(),
});

const ingestSchema = z.object({
  traceId: z.string().min(1),
  spans: z.array(spanSchema),
});

const listSchema = z.object({
  limit: z.coerce.number().int().positive().optional(),
});

export async function traceRoutes(fastify: FastifyInstance) {
  const exporter = getTraceExporter();

  fastify.post("/traces", async (req) => {
    const body = ingestSchema.parse(req.body ?? {});
    const record = exporter.ingest(body.traceId, body.spans);
    return { trace: record };
  });

  fastify.get("/traces", async (req) => {
    const query = listSchema.parse(req.query ?? {});
    const traces = exporter.list({ limit: query.limit });
    return { traces };
  });

  fastify.get("/traces/:traceId", async (req) => {
    const traceId = (req.params as any).traceId as string;
    const trace = exporter.get(traceId);
    if (!trace) {
      return { trace: null, tree: [] };
    }
    const tree = exporter.toTree(traceId);
    return { trace, tree };
  });
}

export default traceRoutes;
