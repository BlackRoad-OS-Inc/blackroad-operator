import { describe, it, expect, beforeEach } from "vitest";
import Fastify from "fastify";
import request from "supertest";
import policyRoutes from "../api/policies";
import runRoutes from "../api/run";
import traceRoutes from "../api/traces";
import eventRoutes, { resetEventLogForTest } from "../api/events";
import { resetStateStore } from "../store/stateStore";
import { resetTraceExporter } from "../store/traceExporter";

beforeEach(() => {
  resetStateStore();
  resetEventLogForTest();
  resetTraceExporter();
});

describe("policy routes", () => {
  it("updates policy mode", async () => {
    const app = Fastify();
    await app.register(policyRoutes);
    await app.ready();
    const initial = await request(app.server).get("/mode");
    expect(initial.body.currentMode).toBe("dev");
    await request(app.server).put("/mode").send({ mode: "trusted" }).expect(200);
    const updated = await request(app.server).get("/policies");
    expect(updated.body.policies[0].policy.mode).toBe("trusted");
  });
});

describe("run lifecycle routes", () => {
  it("starts, updates, and ends a run", async () => {
    const app = Fastify();
    await app.register(runRoutes);
    await app.register(eventRoutes);
    await app.ready();

    const start = await request(app.server)
      .post("/runs")
      .send({ projectId: "proj", sessionId: "session", summary: "Compile" })
      .expect(200);
    const runId = start.body.runId;
    expect(runId).toBeDefined();

    await request(app.server)
      .post(`/runs/${runId}/events`)
      .send({ topic: "actions.file.write", payload: { path: "main.ts" }, actor: "agent:coder" })
      .expect(200);

    await request(app.server).post(`/runs/${runId}/end`).send({ status: "ok" }).expect(200);

    const runs = await request(app.server).get("/runs?projectId=proj");
    expect(runs.body.runs[0].status).toBe("ok");
    const events = await request(app.server).get("/events");
    expect(events.body.events.length).toBeGreaterThan(0);
  });
});

describe("trace routes", () => {
  it("stores and returns trace trees", async () => {
    const app = Fastify();
    await app.register(traceRoutes);
    await app.ready();

    const span = {
      spanId: "s1",
      name: "root",
      startTs: new Date().toISOString(),
      status: "ok" as const,
    };

    await request(app.server).post("/traces").send({ traceId: "t1", spans: [span] }).expect(200);
    const res = await request(app.server).get("/traces/t1").expect(200);
    expect(res.body.trace.traceId).toBe("t1");
    expect(res.body.tree[0].spanId).toBe("s1");
  });
});
