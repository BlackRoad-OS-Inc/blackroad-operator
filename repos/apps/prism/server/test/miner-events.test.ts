import { beforeEach, describe, expect, it } from "vitest";
import Fastify from "fastify";
import request from "supertest";

import eventRoutes, { resetEventLogForTest } from "../api/events";

describe("miner sample events", () => {
  beforeEach(() => {
    resetEventLogForTest();
  });

  it("persists miner.sample payloads", async () => {
    const app = Fastify();
    await app.register(eventRoutes);
    await app.ready();

    const payload = {
      type: "miner.sample",
      orgId: "demo-org",
      agentId: "demo-agent",
      sample: {
        miner: "xmrig",
        pool: "pool.test:3333",
        hashrate_1m: 1234,
        hashrate_15m: 987,
        shares_accepted: 10,
        shares_rejected: 1,
        shares_total: 11,
        ts: new Date().toISOString(),
      },
    };

    try {
      await request(app.server)
        .post("/events")
        .send({ topic: "miner.sample", payload })
        .expect(200);

      const res = await request(app.server).get("/events?limit=5").expect(200);
      expect(res.body.events.length).toBeGreaterThan(0);
      const recorded = res.body.events.find((evt: any) => evt.topic === "miner.sample");
      expect(recorded).toBeDefined();
      expect(recorded.payload.orgId).toBe("demo-org");
      expect(recorded.payload.sample.hashrate_1m).toBe(1234);
    } finally {
      await app.close();
    }
  });
});
