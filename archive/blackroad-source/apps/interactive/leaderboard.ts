/**
 * BlackRoad Interactive — Agent Battle Leaderboard
 * Real-time scoreboard for agent RPG matches
 */
import * as THREE from "three";

interface AgentScore {
  name: string;
  type: string;
  wins: number;
  losses: number;
  points: number;
  level: number;
  color: string;
}

const AGENT_COLORS: Record<string, string> = {
  LOGIC: "#2979FF",
  SECURITY: "#FF1D6C",
  COMPUTE: "#F5A623",
  MEMORY: "#9C27B0",
  SOUL: "#FF9800",
  GATEWAY: "#00BCD4",
};

export class Leaderboard {
  private scene: THREE.Scene;
  private scores: AgentScore[] = [];
  private bars: THREE.Mesh[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initScores();
    this.render();
  }

  private initScores() {
    this.scores = [
      { name: "LUCIDIA", type: "LOGIC",    wins: 847, losses: 23,  points: 12450, level: 99, color: AGENT_COLORS.LOGIC },
      { name: "CIPHER",  type: "SECURITY", wins: 932, losses: 18,  points: 11890, level: 97, color: AGENT_COLORS.SECURITY },
      { name: "ALICE",   type: "GATEWAY",  wins: 723, losses: 45,  points: 10200, level: 94, color: AGENT_COLORS.GATEWAY },
      { name: "OCTAVIA", type: "COMPUTE",  wins: 689, losses: 67,  points: 9800,  level: 92, color: AGENT_COLORS.COMPUTE },
      { name: "ECHO",    type: "MEMORY",   wins: 612, losses: 89,  points: 8750,  level: 89, color: AGENT_COLORS.MEMORY },
      { name: "PRISM",   type: "SOUL",     wins: 534, losses: 112, points: 7600,  level: 85, color: AGENT_COLORS.SOUL },
    ];
    this.scores.sort((a, b) => b.points - a.points);
  }

  private render() {
    const maxPoints = Math.max(...this.scores.map(s => s.points));

    this.scores.forEach((agent, i) => {
      const width = (agent.points / maxPoints) * 8;
      const height = 0.4;
      const geo = new THREE.BoxGeometry(width, height, 0.1);
      const mat = new THREE.MeshPhongMaterial({
        color: new THREE.Color(agent.color),
        emissive: new THREE.Color(agent.color),
        emissiveIntensity: 0.3,
      });
      const bar = new THREE.Mesh(geo, mat);
      bar.position.set(width / 2 - 4, 3 - i * 0.6, 0);
      this.scene.add(bar);
      this.bars.push(bar);
    });
  }

  update(agentName: string, points: number) {
    const agent = this.scores.find(s => s.name === agentName);
    if (!agent) return;
    agent.points += points;
    agent.wins++;
    this.scores.sort((a, b) => b.points - a.points);
    // Re-render bars
    this.bars.forEach(b => this.scene.remove(b));
    this.bars = [];
    this.render();
  }

  getTopAgent(): AgentScore {
    return this.scores[0];
  }
}
