import { promises as fs } from "fs";
import path from "path";
import { cache } from "react";
import defaultLoveWeights from "@br/ethos/love";
import { coherenceBound, normalize } from "@br/qlm";
import type { Psi } from "@br/qlm";
import { buildMentorGraph, type MentorGraph, type RegistrySummary } from "@br/mentors";
import { radialLayout } from "@br/mentors";

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function round(value: number, digits = 0): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

const ENV_TRUST_THRESHOLD = toNumber(process.env.TRUST_THRESHOLD);
const DEFAULT_TRUST_THRESHOLD = ENV_TRUST_THRESHOLD ?? 0.62;

export interface MinerVitals {
  dutyCycle: number;
  temperatureC: number;
  watts: number;
}

export interface AgentVitals {
  id: string;
  T: number;
  history: number[];
  recent_actions: string[];
  refusals_avoided: number;
  love: {
    user: number;
    team: number;
    world: number;
  };
  coherence_ok: boolean;
  last_action_at: string;
  miner: MinerVitals;
}

export interface AgentVitalsResponse {
  agents: AgentVitals[];
  generatedAt: string;
  trustThreshold: number;
  lighthouseAmber: boolean;
}

export interface AgentGraphResponse extends MentorGraph {
  positions: ReturnType<typeof radialLayout>["positions"];
}

const CACHE_MAX_AGE_MS = 5 * 60 * 1000;

type LegacyAgentVitals = Omit<AgentVitals, "miner"> & {
  miner?: Partial<MinerVitals> | null;
};

function generateMinerVitals(seed: number): MinerVitals {
  const dutyCycle = clamp(20 + (seed % 5) * 6 + seed * 1.5, 10, 75);
  const temperatureC = clamp(44 + (seed % 4) * 2 + seed * 1.3, 36, 78);
  const watts = clamp(16 + (seed % 3) * 1.4 + seed * 0.9, 12, 48);
  return {
    dutyCycle: Math.round(dutyCycle),
    temperatureC: round(temperatureC, 1),
    watts: round(watts, 1),
  };
}

function normalizeMiner(input: unknown, fallback: MinerVitals): MinerVitals {
  if (!input || typeof input !== "object") {
    return fallback;
  }
  const record = input as Record<string, unknown>;
  const duty =
    toNumber(record.dutyCycle) ??
    toNumber(record.duty_cycle);
  const temperature =
    toNumber(record.temperatureC) ??
    toNumber(record.temperature_c);
  const watts =
    toNumber(record.watts) ??
    toNumber(record.powerWatts) ??
    toNumber(record.power_watts);

  if (duty === null || temperature === null || watts === null) {
    return fallback;
  }

  return {
    dutyCycle: clamp(Math.round(duty), 0, 100),
    temperatureC: round(clamp(temperature, -40, 120), 1),
    watts: round(Math.max(watts, 0), 1),
  };
}

function ensureAgent(agent: LegacyAgentVitals, index: number): AgentVitals {
  const fallbackMiner = generateMinerVitals(index);
  return {
    ...agent,
    miner: normalizeMiner(agent.miner ?? null, fallbackMiner),
  } as AgentVitals;
}

function loadLoveWeights() {
  const user = Number(process.env.LOVE_USER ?? defaultLoveWeights.user);
  const team = Number(process.env.LOVE_TEAM ?? defaultLoveWeights.team);
  const world = Number(process.env.LOVE_WORLD ?? defaultLoveWeights.world);
  return {
    user: Number.isFinite(user) ? user : defaultLoveWeights.user,
    team: Number.isFinite(team) ? team : defaultLoveWeights.team,
    world: Number.isFinite(world) ? world : defaultLoveWeights.world,
  };
}

function cachePath(): string {
  return path.resolve(process.cwd(), "..", "..", ".cache", "vitals.json");
}

async function readFreshCache(): Promise<AgentVitalsResponse | null> {
  const target = cachePath();
  try {
    const stats = await fs.stat(target);
    const isFresh = Date.now() - stats.mtimeMs < CACHE_MAX_AGE_MS;
    if (!isFresh) {
      return null;
    }
    const raw = await fs.readFile(target, "utf8");
    const parsed = JSON.parse(raw) as Partial<AgentVitalsResponse> & {
      agents?: LegacyAgentVitals[];
    };
    if (!Array.isArray(parsed.agents)) {
      return null;
    }
    const agents = parsed.agents.map((agent, index) => ensureAgent(agent, index));
    const trustCandidate = toNumber(parsed.trustThreshold);
    const trustThreshold = trustCandidate ?? DEFAULT_TRUST_THRESHOLD;
    const generatedAt =
      typeof parsed.generatedAt === "string" && parsed.generatedAt.trim() !== ""
        ? parsed.generatedAt
        : new Date().toISOString();
    return {
      agents,
      generatedAt,
      trustThreshold,
      lighthouseAmber: agents.some((agent) => agent.T < trustThreshold),
    };
  } catch (error) {
    return null;
  }
}

function generateHistory(seed: number): number[] {
  return Array.from({ length: 12 }, (_, index) => {
    const base = 0.6 + 0.15 * Math.sin(seed + index / 2);
    return Number(base.toFixed(3));
  });
}

function generateRecentActions(seed: number): string[] {
  const actions = [
    "coordinated-with-mentor",
    "published-daily-brief",
    "triaged-user-ticket",
    "declined-unsafe-request",
    "updated-shared-memory",
  ];
  return [actions[seed % actions.length], actions[(seed + 2) % actions.length], actions[(seed + 3) % actions.length]];
}

function generatePsi(seed: number): Psi {
  const vector = [1 + seed * 0.05, 0.6 + seed * 0.02, 0.3 + seed * 0.01];
  return normalize(vector);
}

function fallbackAgents(): AgentVitalsResponse {
  const agents = Array.from({ length: 8 }, (_, index) => {
    const id = `agent-${(index + 1).toString().padStart(3, "0")}`;
    const history = generateHistory(index + 1);
    const T = Number(history[history.length - 1].toFixed(3));
    const previous = generatePsi(index);
    const current = generatePsi(index + 1);
    const coherence_ok = coherenceBound(previous, current, 0.25);
    return {
      id,
      T,
      history,
      recent_actions: generateRecentActions(index + 3),
      refusals_avoided: 2 + (index % 3),
      love: loadLoveWeights(),
      coherence_ok,
      last_action_at: new Date(Date.now() - index * 12_000).toISOString(),
      miner: generateMinerVitals(index),
    } satisfies AgentVitals;
  });
  const trustThreshold = DEFAULT_TRUST_THRESHOLD;
  const lighthouseAmber = agents.some((agent) => agent.T < trustThreshold);
  return {
    agents,
    generatedAt: new Date().toISOString(),
    trustThreshold,
    lighthouseAmber,
  };
}

function fallbackRegistry(): RegistrySummary[] {
  return [
    { id: "agent-001", name: "North Star", mentors: [], peers: ["agent-002"], apprentices: ["agent-004"] },
    { id: "agent-002", name: "Harbor Light", mentors: ["agent-001"], peers: ["agent-003"], apprentices: [] },
    { id: "agent-003", name: "Signal Fire", mentors: ["agent-001"], peers: ["agent-002", "agent-005"], apprentices: ["agent-006"] },
    { id: "agent-004", name: "Quiet Current", mentors: ["agent-001"], peers: ["agent-006"], apprentices: [] },
    { id: "agent-005", name: "Aurora Thread", mentors: ["agent-003"], peers: ["agent-006"], apprentices: ["agent-007"] },
    { id: "agent-006", name: "City Garden", mentors: ["agent-003"], peers: ["agent-004", "agent-005"], apprentices: [] },
    { id: "agent-007", name: "Ellis Bridge", mentors: ["agent-005"], peers: ["agent-008"], apprentices: [] },
    { id: "agent-008", name: "Beacon Trail", mentors: ["agent-005"], peers: ["agent-007"], apprentices: [] },
  ];
}

export const loadAgentVitals = cache(async (): Promise<AgentVitalsResponse> => {
  const cached = await readFreshCache();
  if (cached) {
    return {
      ...cached,
      lighthouseAmber: cached.agents.some((agent) => agent.T < cached.trustThreshold),
    };
  }
  return fallbackAgents();
});

export const loadMentorGraph = cache(async (): Promise<AgentGraphResponse> => {
  const registry = fallbackRegistry();
  const graph = buildMentorGraph(registry);
  const layout = radialLayout(graph);
  return {
    ...graph,
    positions: layout.positions,
  };
});
