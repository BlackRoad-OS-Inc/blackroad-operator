import { PrismEvent } from "../../packages/prism-core/src";
import { getEventBus } from "../events/bus";
import { getEventRetentionConfig, RetentionConfig } from "../config/retention";

type EventQuery = {
  topic?: string | RegExp;
  actor?: string;
  since?: string;
  limit?: number;
  reverse?: boolean;
};

interface StoredEvent {
  event: PrismEvent;
  receivedAt: number; // timestamp in ms
}

class InMemoryEventStore {
  private events: StoredEvent[] = [];
  private subscription: (() => void) | null = null;
  private pruneTimer: NodeJS.Timeout | null = null;
  private config: RetentionConfig;

  constructor(config?: Partial<RetentionConfig>) {
    this.config = { ...getEventRetentionConfig(), ...config };
    this.bindToBus();
    this.startPruning();
  }

  private bindToBus() {
    if (this.subscription) return;
    const bus = getEventBus();
    this.subscription = bus.subscribe((event) => {
      this.append(event);
    });
  }

  private startPruning() {
    if (this.config.maxAgeMs === 0 || this.config.pruneIntervalMs === 0) {
      return; // Pruning disabled
    }

    this.pruneTimer = setInterval(() => {
      this.pruneByAge();
    }, this.config.pruneIntervalMs);

    // Allow Node to exit even if timer is active
    if (this.pruneTimer.unref) {
      this.pruneTimer.unref();
    }
  }

  private pruneByAge() {
    if (this.config.maxAgeMs === 0) return;

    const now = Date.now();
    const cutoff = now - this.config.maxAgeMs;
    const originalSize = this.events.length;

    this.events = this.events.filter((stored) => stored.receivedAt >= cutoff);

    const pruned = originalSize - this.events.length;
    if (pruned > 0) {
      // Optional: emit metric or log
      // console.log(`Pruned ${pruned} events older than ${this.config.maxAgeMs}ms`);
    }
  }

  private enforceMaxEvents() {
    if (this.config.maxEvents === 0) return;

    if (this.events.length > this.config.maxEvents) {
      // Keep only the most recent maxEvents
      const excess = this.events.length - this.config.maxEvents;
      this.events = this.events.slice(excess);
    }
  }

  append(event: PrismEvent) {
    const stored: StoredEvent = {
      event: cloneEvent(event),
      receivedAt: Date.now(),
    };

    this.events.push(stored);
    this.enforceMaxEvents();
  }

  list(query: EventQuery = {}): PrismEvent[] {
    const { topic, actor, since, limit, reverse } = query;
    let items = [...this.events];
    if (since) {
      const index = items.findIndex((stored) => stored.event.id === since);
      if (index >= 0) {
        items = items.slice(index + 1);
      }
    }
    if (topic) {
      const matcher = typeof topic === "string" ? new RegExp(`^${topic.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}$`) : topic;
      items = items.filter((stored) => matcher.test(stored.event.topic));
    }
    if (actor) {
      items = items.filter((stored) => stored.event.actor === actor);
    }
    if (reverse) {
      items.reverse();
    }
    if (typeof limit === "number") {
      items = items.slice(0, limit);
    }
    return items.map((stored) => cloneEvent(stored.event));
  }

  latest(): PrismEvent | undefined {
    return this.events.length > 0 ? cloneEvent(this.events[this.events.length - 1].event) : undefined;
  }

  size(): number {
    return this.events.length;
  }

  reset() {
    this.events = [];
  }

  /**
   * Manually trigger age-based pruning
   */
  prune() {
    this.pruneByAge();
  }

  /**
   * Get current retention configuration
   */
  getConfig(): Readonly<RetentionConfig> {
    return { ...this.config };
  }

  /**
   * Stop pruning timer (useful for testing and cleanup)
   */
  destroy() {
    if (this.pruneTimer) {
      clearInterval(this.pruneTimer);
      this.pruneTimer = null;
    }
    if (this.subscription) {
      this.subscription();
      this.subscription = null;
    }
  }
}

function cloneEvent(event: PrismEvent): PrismEvent {
  return {
    ...event,
    payload: { ...(event.payload ?? {}) },
    kpis: event.kpis ? { ...event.kpis } : undefined,
    memory_deltas: event.memory_deltas ? event.memory_deltas.map((delta) => ({ ...delta })) : undefined,
  };
}

const STORE = new InMemoryEventStore();

export function getEventStore(): InMemoryEventStore {
  return STORE;
}

export function resetEventStore(): void {
  STORE.reset();
}
