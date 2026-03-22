import { Policy, createPolicy, mergePolicy } from "../../packages/prism-core/src/policies";
import { Capability, PrismEvent } from "../../packages/prism-core/src";

type Approval = Policy["approvals"][Capability];

type PolicyUpdate = {
  mode?: Policy["mode"];
  approvals?: Partial<Record<Capability, Approval>>;
};

export type RunStatus = "running" | "ok" | "error" | "cancelled";

export interface RunRecord {
  runId: string;
  projectId: string;
  summary: string;
  actor: string;
  status: RunStatus;
  startedAt: string;
  endedAt?: string;
  ctx?: Record<string, any>;
  events: PrismEvent[];
}

export interface ProjectStateSnapshot {
  projectId: string;
  policy: Policy;
  env: Record<string, string>;
  runs: RunRecord[];
}

class InMemoryStateStore {
  private projects = new Map<string, ProjectStateSnapshot>();
  private runIndex = new Map<string, RunRecord>();

  private ensureProject(projectId: string): ProjectStateSnapshot {
    let snapshot = this.projects.get(projectId);
    if (!snapshot) {
      snapshot = {
        projectId,
        policy: createPolicy("dev"),
        env: {},
        runs: [],
      };
      this.projects.set(projectId, snapshot);
    }
    return snapshot;
  }

  getProjects(): ProjectStateSnapshot[] {
    return Array.from(this.projects.values()).map((snapshot) => ({
      projectId: snapshot.projectId,
      policy: { ...snapshot.policy, approvals: { ...snapshot.policy.approvals } },
      env: { ...snapshot.env },
      runs: snapshot.runs.map((run) => ({ ...run, events: run.events.map((evt) => ({ ...evt, payload: { ...evt.payload } })) })),
    }));
  }

  getProject(projectId: string): ProjectStateSnapshot {
    const snapshot = this.ensureProject(projectId);
    return {
      projectId: snapshot.projectId,
      policy: { ...snapshot.policy, approvals: { ...snapshot.policy.approvals } },
      env: { ...snapshot.env },
      runs: snapshot.runs.map((run) => ({ ...run, events: run.events.map((evt) => ({ ...evt, payload: { ...evt.payload } })) })),
    };
  }

  getPolicy(projectId: string): Policy {
    const snapshot = this.ensureProject(projectId);
    return { ...snapshot.policy, approvals: { ...snapshot.policy.approvals } };
  }

  updatePolicy(projectId: string, update: PolicyUpdate | Policy): Policy {
    const snapshot = this.ensureProject(projectId);
    const next = "mode" in update || "approvals" in update ? mergePolicy(snapshot.policy, update as PolicyUpdate) : update;
    snapshot.policy = {
      mode: next.mode,
      approvals: { ...next.approvals },
    };
    return this.getPolicy(projectId);
  }

  updateEnv(projectId: string, values: Record<string, string | undefined>): Record<string, string> {
    const snapshot = this.ensureProject(projectId);
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined) {
        delete snapshot.env[key];
      } else {
        snapshot.env[key] = String(value);
      }
    }
    return { ...snapshot.env };
  }

  startRun(event: PrismEvent): RunRecord {
    const { runId, summary, status, ctx, projectId = "global" } = event.payload as any;
    if (!runId || !summary) {
      throw new Error("startRun event missing required payload");
    }
    const snapshot = this.ensureProject(projectId);
    const record: RunRecord = {
      runId,
      projectId,
      summary,
      actor: event.actor,
      status: status ?? "running",
      startedAt: event.at,
      ctx: ctx ? { ...ctx } : undefined,
      events: [cloneEvent(event)],
    };
    snapshot.runs = [...snapshot.runs.filter((run) => run.runId !== runId), record];
    this.runIndex.set(runId, record);
    return { ...record, events: record.events.map(cloneEvent) };
  }

  endRun(event: PrismEvent): RunRecord {
    const { runId, status, ctx, summary, projectId = "global" } = event.payload as any;
    if (!runId) {
      throw new Error("endRun event missing runId");
    }
    const record = this.runIndex.get(runId);
    if (!record) {
      throw new Error(`Unknown run: ${runId}`);
    }
    record.status = (status ?? "ok") as RunStatus;
    record.endedAt = event.at;
    if (summary) record.summary = summary;
    if (ctx) {
      record.ctx = { ...(record.ctx ?? {}), ...ctx };
    }
    record.events.push(cloneEvent(event));
    const snapshot = this.ensureProject(projectId);
    snapshot.runs = snapshot.runs.map((run) => (run.runId === runId ? record : run));
    return { ...record, events: record.events.map(cloneEvent) };
  }

  appendRunEvent(runId: string, projectId: string, event: PrismEvent): RunRecord {
    const record = this.runIndex.get(runId);
    if (!record) {
      throw new Error(`Unknown run: ${runId}`);
    }
    record.events.push(cloneEvent(event));
    const snapshot = this.ensureProject(projectId);
    snapshot.runs = snapshot.runs.map((run) => (run.runId === runId ? record : run));
    return { ...record, events: record.events.map(cloneEvent) };
  }

  listRuns(options: { projectId?: string; limit?: number } = {}): RunRecord[] {
    const { projectId, limit } = options;
    let runs: RunRecord[];
    if (projectId) {
      runs = [...this.ensureProject(projectId).runs];
    } else {
      runs = Array.from(this.projects.values()).flatMap((snapshot) => snapshot.runs);
    }
    runs = runs
      .slice()
      .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))
      .map((run) => ({ ...run, events: run.events.map(cloneEvent) }));
    return typeof limit === "number" ? runs.slice(0, limit) : runs;
  }

  reset() {
    this.projects.clear();
    this.runIndex.clear();
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

const STORE = new InMemoryStateStore();

export function getStateStore(): InMemoryStateStore {
  return STORE;
}

export function resetStateStore(): void {
  STORE.reset();
}
