import { describe, it, expect, beforeEach, vi } from "vitest";
import { PrismSpan } from "../../packages/prism-core/src";

// Mock the config
vi.mock("../config/retention", () => ({
  getTraceRetentionConfig: () => ({
    maxTraces: 100,
    maxAgeMs: 3600000,
    pruneIntervalMs: 60000,
  }),
}));

const traceExporterModule = await import("../store/traceExporter");

function createMockSpan(spanId: string, traceId: string, startTs: string): PrismSpan {
  return {
    traceId,
    spanId,
    name: `span-${spanId}`,
    kind: "internal",
    startTs,
    endTs: new Date(Date.parse(startTs) + 100).toISOString(),
    status: "ok",
  };
}

describe("InMemoryTraceExporter retention and pagination", () => {
  it("enforces maxTraces limit by evicting oldest", () => {
    const { InMemoryTraceExporter } = traceExporterModule as any;
    const exporter = new InMemoryTraceExporter({
      maxTraces: 5,
      maxAgeMs: 0,
      pruneIntervalMs: 0,
    });

    // Add 10 traces
    for (let i = 0; i < 10; i++) {
      const spans = [createMockSpan(`span-${i}`, `trace-${i}`, new Date().toISOString())];
      exporter.ingest(`trace-${i}`, spans);
    }

    // Should only keep the last 5
    expect(exporter.size()).toBe(5);

    // Verify the oldest were evicted
    expect(exporter.get("trace-0")).toBeUndefined();
    expect(exporter.get("trace-9")).toBeDefined();

    exporter.destroy();
  });

  it("prunes traces older than maxAgeMs", () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    const { InMemoryTraceExporter } = traceExporterModule as any;
    const exporter = new InMemoryTraceExporter({
      maxTraces: 0,
      maxAgeMs: 2000, // 2 seconds
      pruneIntervalMs: 0,
    });

    // Add old trace
    const oldSpan = createMockSpan("span-old", "trace-old", new Date().toISOString());
    exporter.ingest("trace-old", [oldSpan]);

    // Advance time
    vi.advanceTimersByTime(2500);

    // Add new trace
    const newSpan = createMockSpan("span-new", "trace-new", new Date().toISOString());
    exporter.ingest("trace-new", [newSpan]);

    expect(exporter.size()).toBe(2);

    // Manually trigger pruning
    exporter.prune();

    // Old trace should be pruned
    expect(exporter.size()).toBe(1);
    expect(exporter.get("trace-old")).toBeUndefined();
    expect(exporter.get("trace-new")).toBeDefined();

    exporter.destroy();
    vi.useRealTimers();
  });

  it("supports pagination with offset and limit", () => {
    const { InMemoryTraceExporter } = traceExporterModule as any;
    const exporter = new InMemoryTraceExporter({
      maxTraces: 0,
      maxAgeMs: 0,
      pruneIntervalMs: 0,
    });

    // Add 10 traces
    for (let i = 0; i < 10; i++) {
      const spans = [createMockSpan(`span-${i}`, `trace-${i}`, new Date().toISOString())];
      exporter.ingest(`trace-${i}`, spans);
    }

    // Get first page
    const page1 = exporter.list({ limit: 3, offset: 0 });
    expect(page1.length).toBe(3);

    // Get second page
    const page2 = exporter.list({ limit: 3, offset: 3 });
    expect(page2.length).toBe(3);

    // Verify no overlap
    const page1Ids = page1.map((t) => t.traceId);
    const page2Ids = page2.map((t) => t.traceId);
    const overlap = page1Ids.filter((id) => page2Ids.includes(id));
    expect(overlap.length).toBe(0);

    exporter.destroy();
  });

  it("supports paginated result with metadata", () => {
    const { InMemoryTraceExporter } = traceExporterModule as any;
    const exporter = new InMemoryTraceExporter({
      maxTraces: 0,
      maxAgeMs: 0,
      pruneIntervalMs: 0,
    });

    // Add 25 traces
    for (let i = 0; i < 25; i++) {
      const spans = [createMockSpan(`span-${i}`, `trace-${i}`, new Date().toISOString())];
      exporter.ingest(`trace-${i}`, spans);
    }

    const result = exporter.listPaginated({ limit: 10, offset: 0 });

    expect(result.data.length).toBe(10);
    expect(result.total).toBe(25);
    expect(result.offset).toBe(0);
    expect(result.limit).toBe(10);
    expect(result.hasMore).toBe(true);

    // Last page
    const lastPage = exporter.listPaginated({ limit: 10, offset: 20 });
    expect(lastPage.data.length).toBe(5);
    expect(lastPage.hasMore).toBe(false);

    exporter.destroy();
  });

  it("filters by traceId", () => {
    const { InMemoryTraceExporter } = traceExporterModule as any;
    const exporter = new InMemoryTraceExporter({
      maxTraces: 0,
      maxAgeMs: 0,
      pruneIntervalMs: 0,
    });

    // Add multiple traces
    for (let i = 0; i < 5; i++) {
      const spans = [createMockSpan(`span-${i}`, `trace-${i}`, new Date().toISOString())];
      exporter.ingest(`trace-${i}`, spans);
    }

    const filtered = exporter.list({ traceId: "trace-2" });
    expect(filtered.length).toBe(1);
    expect(filtered[0].traceId).toBe("trace-2");

    exporter.destroy();
  });

  it("filters by time range", () => {
    const { InMemoryTraceExporter } = traceExporterModule as any;
    const exporter = new InMemoryTraceExporter({
      maxTraces: 0,
      maxAgeMs: 0,
      pruneIntervalMs: 0,
    });

    const baseTime = new Date("2024-01-01T00:00:00Z");

    // Add traces at different times
    for (let i = 0; i < 5; i++) {
      const time = new Date(baseTime.getTime() + i * 60000).toISOString(); // 1 minute apart
      const spans = [createMockSpan(`span-${i}`, `trace-${i}`, time)];
      exporter.ingest(`trace-${i}`, spans);
    }

    // Filter for middle time range
    const afterTime = new Date(baseTime.getTime() + 2 * 60000).toISOString();
    const beforeTime = new Date(baseTime.getTime() + 4 * 60000).toISOString();

    const filtered = exporter.list({
      startTimeAfter: afterTime,
      startTimeBefore: beforeTime,
    });

    expect(filtered.length).toBe(3); // trace-2, trace-3, trace-4
    expect(filtered.every((t) => t.startedAt >= afterTime && t.startedAt <= beforeTime)).toBe(
      true
    );

    exporter.destroy();
  });

  it("combines filters with pagination", () => {
    const { InMemoryTraceExporter } = traceExporterModule as any;
    const exporter = new InMemoryTraceExporter({
      maxTraces: 0,
      maxAgeMs: 0,
      pruneIntervalMs: 0,
    });

    const baseTime = new Date("2024-01-01T00:00:00Z");

    // Add 20 traces
    for (let i = 0; i < 20; i++) {
      const time = new Date(baseTime.getTime() + i * 60000).toISOString();
      const spans = [createMockSpan(`span-${i}`, `trace-${i}`, time)];
      exporter.ingest(`trace-${i}`, spans);
    }

    // Filter for last 10 traces, but only get first 3
    const afterTime = new Date(baseTime.getTime() + 10 * 60000).toISOString();
    const result = exporter.listPaginated({
      startTimeAfter: afterTime,
      limit: 3,
      offset: 0,
    });

    expect(result.data.length).toBe(3);
    expect(result.total).toBe(10); // 10 traces match the filter
    expect(result.hasMore).toBe(true);

    exporter.destroy();
  });

  it("returns stable pagination slices", () => {
    const { InMemoryTraceExporter } = traceExporterModule as any;
    const exporter = new InMemoryTraceExporter({
      maxTraces: 0,
      maxAgeMs: 0,
      pruneIntervalMs: 0,
    });

    // Add traces
    for (let i = 0; i < 10; i++) {
      const spans = [createMockSpan(`span-${i}`, `trace-${i}`, new Date().toISOString())];
      exporter.ingest(`trace-${i}`, spans);
    }

    // Get two consecutive pages
    const page1 = exporter.listPaginated({ limit: 5, offset: 0 });
    const page2 = exporter.listPaginated({ limit: 5, offset: 5 });

    // Verify no overlap
    const page1Ids = new Set(page1.data.map((t) => t.traceId));
    const page2Ids = new Set(page2.data.map((t) => t.traceId));

    for (const id of page2Ids) {
      expect(page1Ids.has(id)).toBe(false);
    }

    // Verify we got all traces
    expect(page1.data.length + page2.data.length).toBe(10);

    exporter.destroy();
  });
});
