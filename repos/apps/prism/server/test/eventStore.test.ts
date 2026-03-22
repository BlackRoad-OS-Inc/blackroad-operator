import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { PrismEvent } from "../../packages/prism-core/src";

// Mock the event bus
vi.mock("../events/bus", () => ({
  getEventBus: () => ({
    subscribe: () => () => {},
  }),
}));

// We need to test the class directly, so we'll import after mocking
const eventStoreModule = await import("../store/eventStore");

function createMockEvent(id: string, topic = "test.event"): PrismEvent {
  return {
    id,
    topic,
    actor: "test-actor",
    payload: {},
    timestamp: new Date().toISOString(),
  };
}

describe("InMemoryEventStore retention policies", () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it("enforces maxEvents limit by evicting oldest", async () => {
    // Create a store with maxEvents = 5
    const { getEventStore } = eventStoreModule;
    const store = getEventStore();

    // Reset and configure
    store.reset();

    // Manually create a new instance with custom config for testing
    const testStore = new (eventStoreModule as any).InMemoryEventStore({
      maxEvents: 5,
      maxAgeMs: 0, // Disable age-based pruning
      pruneIntervalMs: 0,
    });

    // Add 10 events
    for (let i = 0; i < 10; i++) {
      testStore.append(createMockEvent(`event-${i}`));
    }

    // Should only keep the last 5
    expect(testStore.size()).toBe(5);

    const events = testStore.list();
    expect(events[0].id).toBe("event-5");
    expect(events[4].id).toBe("event-9");

    testStore.destroy();
  });

  it("prunes events older than maxAgeMs", async () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    const { InMemoryEventStore } = eventStoreModule as any;
    const testStore = new InMemoryEventStore({
      maxEvents: 0, // Disable count-based eviction
      maxAgeMs: 1000, // 1 second
      pruneIntervalMs: 0, // Manual pruning
    });

    // Add events at different times
    testStore.append(createMockEvent("event-old-1"));

    vi.advanceTimersByTime(500);
    testStore.append(createMockEvent("event-mid-1"));

    vi.advanceTimersByTime(600); // Now at +1100ms from start
    testStore.append(createMockEvent("event-new-1"));

    expect(testStore.size()).toBe(3);

    // Manually trigger pruning
    testStore.prune();

    // Only the last two events should remain (within 1 second)
    expect(testStore.size()).toBe(2);
    const events = testStore.list();
    expect(events.some((e) => e.id === "event-old-1")).toBe(false);
    expect(events.some((e) => e.id === "event-mid-1")).toBe(true);
    expect(events.some((e) => e.id === "event-new-1")).toBe(true);

    testStore.destroy();
    vi.useRealTimers();
  });

  it("automatically prunes based on interval", async () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    const { InMemoryEventStore } = eventStoreModule as any;
    const testStore = new InMemoryEventStore({
      maxEvents: 0,
      maxAgeMs: 1000, // 1 second
      pruneIntervalMs: 500, // Prune every 500ms
    });

    // Add old event
    testStore.append(createMockEvent("event-old"));

    // Advance past maxAge
    vi.advanceTimersByTime(1200);

    // Add new event
    testStore.append(createMockEvent("event-new"));

    expect(testStore.size()).toBe(2);

    // Trigger the pruning interval
    vi.advanceTimersByTime(500);

    // Old event should be pruned
    expect(testStore.size()).toBe(1);
    const events = testStore.list();
    expect(events[0].id).toBe("event-new");

    testStore.destroy();
    vi.useRealTimers();
  });

  it("disables pruning when maxAgeMs is 0", async () => {
    const { InMemoryEventStore } = eventStoreModule as any;
    const testStore = new InMemoryEventStore({
      maxEvents: 0,
      maxAgeMs: 0, // Disabled
      pruneIntervalMs: 100,
    });

    for (let i = 0; i < 100; i++) {
      testStore.append(createMockEvent(`event-${i}`));
    }

    testStore.prune();

    // All events should remain
    expect(testStore.size()).toBe(100);

    testStore.destroy();
  });

  it("applies both maxEvents and maxAgeMs policies", async () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    const { InMemoryEventStore } = eventStoreModule as any;
    const testStore = new InMemoryEventStore({
      maxEvents: 10,
      maxAgeMs: 2000,
      pruneIntervalMs: 0,
    });

    // Add 20 events
    for (let i = 0; i < 20; i++) {
      testStore.append(createMockEvent(`event-${i}`));
    }

    // maxEvents should limit to 10
    expect(testStore.size()).toBe(10);

    // Advance time past maxAge
    vi.advanceTimersByTime(2500);

    // Add one more event
    testStore.append(createMockEvent("event-new"));

    // Trigger pruning
    testStore.prune();

    // Only the new event should remain (others are too old)
    expect(testStore.size()).toBe(1);
    const events = testStore.list();
    expect(events[0].id).toBe("event-new");

    testStore.destroy();
    vi.useRealTimers();
  });

  it("maintains correct order after eviction", async () => {
    const { InMemoryEventStore } = eventStoreModule as any;
    const testStore = new InMemoryEventStore({
      maxEvents: 3,
      maxAgeMs: 0,
      pruneIntervalMs: 0,
    });

    testStore.append(createMockEvent("event-1"));
    testStore.append(createMockEvent("event-2"));
    testStore.append(createMockEvent("event-3"));
    testStore.append(createMockEvent("event-4"));
    testStore.append(createMockEvent("event-5"));

    const events = testStore.list();
    expect(events.map((e) => e.id)).toEqual(["event-3", "event-4", "event-5"]);

    testStore.destroy();
  });

  it("exposes configuration via getConfig", async () => {
    const { InMemoryEventStore } = eventStoreModule as any;
    const testStore = new InMemoryEventStore({
      maxEvents: 42,
      maxAgeMs: 9000,
      pruneIntervalMs: 100,
    });

    const config = testStore.getConfig();
    expect(config.maxEvents).toBe(42);
    expect(config.maxAgeMs).toBe(9000);
    expect(config.pruneIntervalMs).toBe(100);

    testStore.destroy();
  });
});
