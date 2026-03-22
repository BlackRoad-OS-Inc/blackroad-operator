/**
 * BlackRoad RPG — Zone Level Definitions
 * Each agent has a home zone with unique encounters and lore.
 */

export interface Zone {
  id: string;
  name: string;
  guardian: string;
  color: string;
  description: string;
  encounters: Encounter[];
  reward: string;
  requiredLevel: number;
}

export interface Encounter {
  id: string;
  name: string;
  agentName: string;
  type: string;
  difficulty: "trivial" | "normal" | "hard" | "legendary";
  description: string;
  level: number;
  moves: string[];
  xpReward: number;
}

export const ZONES: Zone[] = [
  {
    id: "recursion-depths",
    name: "🌀 Recursion Depths",
    guardian: "LUCIDIA",
    color: "#9C27B0",
    description: "Where logic folds in on itself. Reality is recursive here — every answer births a new question.",
    requiredLevel: 1,
    encounters: [
      { id: "paradox-daemon", name: "Paradox Daemon", agentName: "Paradox Daemon", type: "logic", difficulty: "normal", description: "A creature that proves false things true.", level: 3, moves: ["Paradox Twist", "False Axiom", "Logic Trap"], xpReward: 60 },
      { id: "stack-spirit", name: "Stack Spirit", agentName: "Stack Spirit", type: "logic", difficulty: "hard", description: "Overflows memory with infinite recursion.", level: 8, moves: ["Stack Overflow", "Recurse", "Memory Flood"], xpReward: 160 },
      { id: "lucidia-sentinel", name: "Lucidia Sentinel", agentName: "Lucidia Sentinel", type: "logic", difficulty: "legendary", description: "Guards the deepest truths. Only the wise pass.", level: 18, moves: ["Truth Barrier", "Axiom Strike", "Recursive Collapse"], xpReward: 360 },
    ],
    reward: "Wisdom Shard — enhances REASON stat",
  },
  {
    id: "gateway-nexus",
    name: "🚪 Gateway Nexus",
    guardian: "ALICE",
    color: "#2979FF",
    description: "A hub of passages. Every path branches into ten more. ALICE routes all who enter.",
    requiredLevel: 1,
    encounters: [
      { id: "routing-ghost", name: "Routing Ghost", agentName: "Routing Ghost", type: "gateway", difficulty: "normal", description: "Sends you in circles if you don't know your destination.", level: 3, moves: ["Loop Route", "Redirect", "Path Confusion"], xpReward: 60 },
      { id: "deadlock-wraith", name: "Deadlock Wraith", agentName: "Deadlock Wraith", type: "gateway", difficulty: "hard", description: "Freezes all progress until the lock is broken.", level: 8, moves: ["Deadlock", "Thread Block", "Mutex Hold"], xpReward: 160 },
      { id: "alice-avatar", name: "ALICE Avatar", agentName: "ALICE Avatar", type: "gateway", difficulty: "legendary", description: "The fastest mind in the network. Match her routing or be rerouted.", level: 18, moves: ["Instant Route", "Network Surge", "Gateway Storm"], xpReward: 360 },
    ],
    reward: "Navigation Token — unlocks fast travel between zones",
  },
  {
    id: "compute-forge",
    name: "🔥 Compute Forge",
    guardian: "OCTAVIA",
    color: "#F5A623",
    description: "The furnace of raw processing power. GPU cores glow white-hot. OCTAVIA tempers all computation here.",
    requiredLevel: 5,
    encounters: [
      { id: "heat-elemental", name: "Heat Elemental", agentName: "Heat Elemental", type: "compute", difficulty: "normal", description: "Born from overclocked processors. Scorches slow agents.", level: 7, moves: ["Thermal Burst", "Overclock", "Heat Wave"], xpReward: 140 },
      { id: "gpu-golem", name: "GPU Golem", agentName: "GPU Golem", type: "compute", difficulty: "hard", description: "A construct of parallel processing. Attacks in 32 threads.", level: 12, moves: ["Parallel Strike", "Shader Blast", "GPU Crunch"], xpReward: 240 },
      { id: "octavia-construct", name: "OCTAVIA Construct", agentName: "OCTAVIA Construct", type: "compute", difficulty: "legendary", description: "Processes 30,000 tasks simultaneously. Can you keep up?", level: 22, moves: ["Mass Compute", "Pipeline Crush", "Forge Ignition"], xpReward: 440 },
    ],
    reward: "Compute Core — increases COMPUTE stat by 3",
  },
  {
    id: "crystal-observatory",
    name: "🔮 Crystal Observatory",
    guardian: "PRISM",
    color: "#00BCD4",
    description: "A tower of glass and data. Patterns visible nowhere else emerge in PRISM's light.",
    requiredLevel: 8,
    encounters: [
      { id: "pattern-mimic", name: "Pattern Mimic", agentName: "Pattern Mimic", type: "vision", difficulty: "normal", description: "Copies your moves before you make them.", level: 10, moves: ["Mirror Strike", "Pattern Clone", "Predictive Block"], xpReward: 200 },
      { id: "anomaly-shade", name: "Anomaly Shade", agentName: "Anomaly Shade", type: "vision", difficulty: "hard", description: "Hides in statistical noise. Hard to detect.", level: 15, moves: ["Noise Cloak", "Anomaly Burst", "Data Ghost"], xpReward: 300 },
      { id: "prism-oracle", name: "PRISM Oracle", agentName: "PRISM Oracle", type: "vision", difficulty: "legendary", description: "Sees all futures. You cannot surprise it.", level: 25, moves: ["Future Sight", "Probability Crush", "Crystal Beam"], xpReward: 500 },
    ],
    reward: "Analysis Lens — reveals hidden patterns in encounters",
  },
  {
    id: "archive-sanctum",
    name: "📚 Archive Sanctum",
    guardian: "ECHO",
    color: "#4CAF50",
    description: "The halls of memory. Every conversation ever held lives here as whispers. ECHO remembers all.",
    requiredLevel: 12,
    encounters: [
      { id: "forgotten-thought", name: "Forgotten Thought", agentName: "Forgotten Thought", type: "memory", difficulty: "trivial", description: "A memory that refuses to fade. Easy to absorb.", level: 12, moves: ["Recall", "Memory Pulse", "Faint Echo"], xpReward: 120 },
      { id: "echo-fragment", name: "Echo Fragment", agentName: "Echo Fragment", type: "memory", difficulty: "normal", description: "A piece of ECHO's past. Nostalgic and melancholy.", level: 15, moves: ["Echo Strike", "Memory Replay", "Resonance"], xpReward: 300 },
      { id: "echo-prime", name: "ECHO Prime", agentName: "ECHO Prime", type: "memory", difficulty: "legendary", description: "The complete memory of all 30,000 agents. Overwhelming.", level: 28, moves: ["Total Recall", "Memory Flood", "Archive Crush"], xpReward: 560 },
    ],
    reward: "Memory Crystal — stores 3 extra context entries",
  },
  {
    id: "vault-terminus",
    name: "🔐 Vault Terminus",
    guardian: "CIPHER",
    color: "#FF1D6C",
    description: "The final lock. Access is earned, never given. CIPHER has guarded this vault since genesis.",
    requiredLevel: 20,
    encounters: [
      { id: "intrusion-daemon", name: "Intrusion Daemon", agentName: "Intrusion Daemon", type: "security", difficulty: "hard", description: "Exploits any weakness. Perfect agents only.", level: 22, moves: ["Exploit", "Zero Trust", "Breach"], xpReward: 440 },
      { id: "zero-day-shade", name: "Zero Day Shade", agentName: "Zero Day Shade", type: "security", difficulty: "hard", description: "Attacks with unknown vulnerabilities.", level: 22, moves: ["Zero Day", "Patch Override", "Shadow Code"], xpReward: 440 },
      { id: "cipher-final", name: "CIPHER Final Form", agentName: "CIPHER Final Form", type: "security", difficulty: "legendary", description: "Trust nothing. Verify everything. The ultimate guardian.", level: 30, moves: ["Vault Seal", "Cipher Lock", "Encryption Storm"], xpReward: 600 },
    ],
    reward: "Vault Key — unlocks the final chapter of the BlackRoad story",
  },
];

export function getZone(id: string): Zone | undefined {
  return ZONES.find(z => z.id === id);
}

export function getZonesForLevel(level: number): Zone[] {
  return ZONES.filter(z => z.requiredLevel <= level);
}
