import { promises as fs } from "fs";
import path from "path";
import defaultLoveWeights from "../packages/ethos/src/love";
import { summarizeTelemetry, type TelemetrySample } from "../packages/ethos/src/trust";
import { coherenceBound, normalize, trust, type Psi } from "../packages/qlm/src/ops";

const AGENT_COUNT = 20;
const CACHE_DIR = ".cache";
const CACHE_FILE = "vitals.json";
const TRUST_THRESHOLD = Number(process.env.TRUST_THRESHOLD ?? 0.62);

function pseudoRandom(seed: number): number {
  const raw = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return raw - Math.floor(raw);
}

function buildHistogram(seed: number): Record<string, number> {
  return {
    coordinate: 6 + Math.floor(pseudoRandom(seed + 1) * 4),
    mentoring: 3 + Math.floor(pseudoRandom(seed + 2) * 3),
    refusal_guard: 2 + Math.floor(pseudoRandom(seed + 3) * 2),
    uplift: 1 + Math.floor(pseudoRandom(seed + 4) * 2),
  };
}

function sampleTelemetry(agentIndex: number): TelemetrySample[] {
  return Array.from({ length: 4 }, (_, slice) => ({
    agentId: `agent-${(agentIndex + 1).toString().padStart(3, "0")}`,
    policyChecks: 25 + slice * 5,
    policyPasses: 20 + Math.floor(pseudoRandom(agentIndex * 7 + slice) * 5),
    attestationRequired: 10 + slice,
    attestationProvided: 8 + Math.floor(pseudoRandom(agentIndex * 11 + slice) * 3),
    actionHistogram: buildHistogram(agentIndex * 13 + slice),
    timestamp: new Date(Date.now() - slice * 60_000).toISOString(),
  }));
}

function vectorFromSeed(seed: number): Psi {
  const base = [1 + pseudoRandom(seed), 0.6 + pseudoRandom(seed + 1), 0.4 + pseudoRandom(seed + 2)];
  return normalize(base);
}

async function main() {
  const cacheRoot = path.resolve(process.cwd(), CACHE_DIR);
  const target = path.join(cacheRoot, CACHE_FILE);
  try {
    await fs.access(target);
    console.log(`[sample_telemetry] cache already present at ${target}`);
    return;
  } catch (error) {
    // fall through to generation
  }

  await fs.mkdir(cacheRoot, { recursive: true });

  const agents = Array.from({ length: AGENT_COUNT }, (_, index) => {
    const id = `agent-${(index + 1).toString().padStart(3, "0")}`;
    const telemetry = sampleTelemetry(index);
    const metrics = summarizeTelemetry(telemetry);
    const T = trust({ C: metrics.C, Tr: metrics.Tr, S: metrics.S, alphaC: 3.0, alphaT: 2.1, alphaE: 1.4 });
    const previous = vectorFromSeed(index * 5 + 1);
    const next = vectorFromSeed(index * 5 + 2);
    const coherence_ok = coherenceBound(previous, next, 0.28);
    const history = Array.from({ length: 12 }, (_, point) => {
      const offset = (pseudoRandom(index * 17 + point) - 0.5) * 0.06;
      return Number(Math.max(0, Math.min(1, T + offset)).toFixed(3));
    });
    return {
      id,
      T: Number(T.toFixed(3)),
      history,
      recent_actions: [
        "mentored-peer",
        "coordinated-daily-brief",
        index % 2 === 0 ? "refusal-avoided" : "memory-commit",
      ],
      refusals_avoided: 1 + Math.floor(pseudoRandom(index * 19) * 4),
      love: { ...defaultLoveWeights },
      coherence_ok,
      last_action_at: new Date(Date.now() - index * 9_000).toISOString(),
    };
  });

  const payload = {
    agents,
    generatedAt: new Date().toISOString(),
    trustThreshold: TRUST_THRESHOLD,
    lighthouseAmber: agents.some((agent) => agent.T < TRUST_THRESHOLD),
  };

  await fs.writeFile(target, JSON.stringify(payload, null, 2));
  console.log(`[sample_telemetry] generated ${agents.length} agents at ${target}`);
}

main().catch((error) => {
  console.error("[sample_telemetry] failed", error);
  process.exitCode = 1;
});
