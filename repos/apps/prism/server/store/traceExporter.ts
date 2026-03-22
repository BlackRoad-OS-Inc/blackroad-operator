import { PrismSpan } from "../../packages/prism-core/src";
import { getTraceRetentionConfig, TraceRetentionConfig } from "../config/retention";

type TraceRecord = {
  traceId: string;
  spans: PrismSpan[];
  startedAt: string;
  endedAt?: string;
};

interface StoredTrace {
  record: TraceRecord;
  receivedAt: number; // timestamp in ms
}

type TraceTreeNode = PrismSpan & { durationMs?: number; children: TraceTreeNode[] };

type TraceQuery = {
  limit?: number;
  offset?: number;
  traceId?: string;
  startTimeAfter?: string; // ISO timestamp
  startTimeBefore?: string; // ISO timestamp
};

type PaginatedResult<T> = {
  data: T[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
};

class InMemoryTraceExporter {
  private traces = new Map<string, StoredTrace>();
  private pruneTimer: NodeJS.Timeout | null = null;
  private config: TraceRetentionConfig;

  constructor(config?: Partial<TraceRetentionConfig>) {
    this.config = { ...getTraceRetentionConfig(), ...config };
    this.startPruning();
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
    const originalSize = this.traces.size;

    for (const [traceId, stored] of this.traces.entries()) {
      if (stored.receivedAt < cutoff) {
        this.traces.delete(traceId);
      }
    }

    const pruned = originalSize - this.traces.size;
    if (pruned > 0) {
      // Optional: emit metric or log
      // console.log(`Pruned ${pruned} traces older than ${this.config.maxAgeMs}ms`);
    }
  }

  private enforceMaxTraces() {
    if (this.config.maxTraces === 0) return;

    if (this.traces.size > this.config.maxTraces) {
      // Sort by receivedAt and keep only the most recent
      const sorted = Array.from(this.traces.entries()).sort(
        (a, b) => a[1].receivedAt - b[1].receivedAt
      );

      const excess = this.traces.size - this.config.maxTraces;
      for (let i = 0; i < excess; i++) {
        this.traces.delete(sorted[i][0]);
      }
    }
  }

  ingest(traceId: string, spans: PrismSpan[]): TraceRecord {
    const normalized = spans.map((span) => normalizeSpan(span));
    const existing = this.traces.get(traceId);
    const merged = existing ? mergeSpans(existing.record.spans, normalized) : normalized;
    const sorted = merged.slice().sort((a, b) => a.startTs.localeCompare(b.startTs));
    const startedAt = sorted[0]?.startTs ?? new Date().toISOString();
    const endedAt = sorted.reduce<string | undefined>((latest, span) => {
      if (!span.endTs) return latest;
      if (!latest || span.endTs > latest) return span.endTs;
      return latest;
    }, existing?.record.endedAt);
    const record: TraceRecord = {
      traceId,
      spans: sorted,
      startedAt,
      endedAt,
    };

    const stored: StoredTrace = {
      record,
      receivedAt: existing?.receivedAt ?? Date.now(),
    };

    this.traces.set(traceId, stored);
    this.enforceMaxTraces();
    return cloneRecord(record);
  }

  list(query: TraceQuery = {}): TraceRecord[] {
    const { limit, offset = 0, traceId, startTimeAfter, startTimeBefore } = query;

    let records = Array.from(this.traces.values()).map((stored) => stored.record);

    // Apply filters
    if (traceId) {
      records = records.filter((r) => r.traceId === traceId);
    }
    if (startTimeAfter) {
      records = records.filter((r) => r.startedAt >= startTimeAfter);
    }
    if (startTimeBefore) {
      records = records.filter((r) => r.startedAt <= startTimeBefore);
    }

    // Sort by most recent first
    records.sort((a, b) => b.startedAt.localeCompare(a.startedAt));

    // Apply pagination
    const sliced = records.slice(offset, limit ? offset + limit : undefined);

    return sliced.map(cloneRecord);
  }

  listPaginated(query: TraceQuery = {}): PaginatedResult<TraceRecord> {
    const { limit = 20, offset = 0, traceId, startTimeAfter, startTimeBefore } = query;

    let records = Array.from(this.traces.values()).map((stored) => stored.record);

    // Apply filters
    if (traceId) {
      records = records.filter((r) => r.traceId === traceId);
    }
    if (startTimeAfter) {
      records = records.filter((r) => r.startedAt >= startTimeAfter);
    }
    if (startTimeBefore) {
      records = records.filter((r) => r.startedAt <= startTimeBefore);
    }

    // Sort by most recent first
    records.sort((a, b) => b.startedAt.localeCompare(a.startedAt));

    const total = records.length;
    const sliced = records.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      data: sliced.map(cloneRecord),
      total,
      offset,
      limit,
      hasMore,
    };
  }

  get(traceId: string): TraceRecord | undefined {
    const stored = this.traces.get(traceId);
    return stored ? cloneRecord(stored.record) : undefined;
  }

  toTree(traceId: string): TraceTreeNode[] {
    const stored = this.traces.get(traceId);
    if (!stored) return [];
    return buildTree(stored.record.spans).map(cloneNode);
  }

  size(): number {
    return this.traces.size;
  }

  reset() {
    this.traces.clear();
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
  getConfig(): Readonly<TraceRetentionConfig> {
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
  }
}

function normalizeSpan(span: PrismSpan): PrismSpan {
  return {
    ...span,
    attrs: span.attrs ? { ...span.attrs } : undefined,
    links: span.links ? [...span.links] : undefined,
  };
}

function mergeSpans(existing: PrismSpan[], incoming: PrismSpan[]): PrismSpan[] {
  const byId = new Map<string, PrismSpan>();
  for (const span of existing) {
    byId.set(span.spanId, normalizeSpan(span));
  }
  for (const span of incoming) {
    byId.set(span.spanId, normalizeSpan(span));
  }
  return Array.from(byId.values());
}

function buildTree(spans: PrismSpan[]): TraceTreeNode[] {
  const byParent = new Map<string | undefined, TraceTreeNode[]>();
  const nodes = new Map<string, TraceTreeNode>();
  for (const span of spans) {
    const node: TraceTreeNode = { ...span, children: [] };
    if (span.endTs) {
      node.durationMs = Math.max(Date.parse(span.endTs) - Date.parse(span.startTs), 0);
    }
    nodes.set(span.spanId, node);
    const key = span.parentSpanId ?? undefined;
    const list = byParent.get(key);
    if (list) {
      list.push(node);
    } else {
      byParent.set(key, [node]);
    }
  }
  for (const node of nodes.values()) {
    node.children = (byParent.get(node.spanId) ?? []).sort((a, b) => a.startTs.localeCompare(b.startTs));
  }
  const roots = byParent.get(undefined) ?? [];
  return roots.sort((a, b) => a.startTs.localeCompare(b.startTs));
}

function cloneNode(node: TraceTreeNode): TraceTreeNode {
  return {
    ...node,
    attrs: node.attrs ? { ...node.attrs } : undefined,
    links: node.links ? [...node.links] : undefined,
    children: node.children.map(cloneNode),
  };
}

function cloneRecord(record: TraceRecord): TraceRecord {
  return {
    traceId: record.traceId,
    startedAt: record.startedAt,
    endedAt: record.endedAt,
    spans: record.spans.map((span) => ({
      ...span,
      attrs: span.attrs ? { ...span.attrs } : undefined,
      links: span.links ? [...span.links] : undefined,
    })),
  };
}

const EXPORTER = new InMemoryTraceExporter();

export function getTraceExporter(): InMemoryTraceExporter {
  return EXPORTER;
}

export function resetTraceExporter(): void {
  EXPORTER.reset();
}
