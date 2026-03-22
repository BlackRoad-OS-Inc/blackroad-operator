export type Trinary = -1 | 0 | 1;

export interface PropositionBeliefs {
  [proposition: string]: Trinary;
}

export interface Agent {
  id: string;
  beliefs: PropositionBeliefs;
  weight?: number;
}

export interface ConflictResult {
  pair: [string, string];
  score: number;
}

const propositions = ["P1", "P2", "P3", "P4"];

const agents: Agent[] = [
  { id: "alpha", beliefs: { P1: 1, P2: 0, P3: -1, P4: 1 }, weight: 1 },
  { id: "beta", beliefs: { P1: 1, P2: -1, P3: -1, P4: 0 }, weight: 1 },
  { id: "gamma", beliefs: { P1: 0, P2: 1, P3: 1, P4: -1 }, weight: 1 }
];

function conflictScore(a: Agent, b: Agent, props: string[]): number {
  const disagreements = props.reduce((score, key) => {
    const av = a.beliefs[key] ?? 0;
    const bv = b.beliefs[key] ?? 0;
    return score + Math.abs(av - bv);
  }, 0);
  const weight = (a.weight ?? 1) + (b.weight ?? 1);
  return disagreements * weight;
}

function pairwiseConflicts(agentList: Agent[], props: string[]): ConflictResult[] {
  const results: ConflictResult[] = [];
  for (let i = 0; i < agentList.length; i++) {
    for (let j = i + 1; j < agentList.length; j++) {
      const score = conflictScore(agentList[i], agentList[j], props);
      results.push({ pair: [agentList[i].id, agentList[j].id], score });
    }
  }
  return results.sort((a, b) => b.score - a.score);
}

function aggregateBeliefs(agentList: Agent[], props: string[]): Record<string, Trinary> {
  const aggregate: Record<string, Trinary> = {};
  for (const key of props) {
    const weightedSum = agentList.reduce((sum, agent) => sum + (agent.weight ?? 1) * (agent.beliefs[key] ?? 0), 0);
    if (weightedSum > 0) aggregate[key] = 1;
    else if (weightedSum < 0) aggregate[key] = -1;
    else aggregate[key] = 0;
  }
  return aggregate;
}

function shouldEscalate(conflicts: ConflictResult[], threshold: number): boolean {
  return conflicts.some((entry) => entry.score >= threshold);
}

const conflicts = pairwiseConflicts(agents, propositions);
const aggregate = aggregateBeliefs(agents, propositions);
const escalationThreshold = 4;

console.log("Pairwise conflicts:");
for (const entry of conflicts) {
  console.log(`${entry.pair[0]} vs ${entry.pair[1]} => score ${entry.score}`);
}

console.log("\nAggregate beliefs:");
for (const key of propositions) {
  console.log(`${key}: ${aggregate[key]}`);
}

if (shouldEscalate(conflicts, escalationThreshold)) {
  console.log("\nEscalate: contradictions exceed threshold, route to orchestrator.");
} else {
  console.log("\nNo escalation: contradictions within acceptable bounds.");
}

console.log("\nResolution suggestion:");
for (const key of propositions) {
  console.log(`- ${key}: ${aggregate[key]} (log decision in PS-SHA∞ journal)`);
}
