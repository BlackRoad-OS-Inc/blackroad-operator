/**
 * BlackRoad Interactive — World Engine
 */

export interface WorldZone {
  id: string;
  name: string;
  agent: string;
  color: number;
  x: number;
  y: number;
  radius: number;
}

export const WORLD_ZONES: WorldZone[] = [
  { id: "recursion-depths",    name: "Recursion Depths",    agent: "LUCIDIA", color: 0xff0066, x: 0,   y: 0,   radius: 400 },
  { id: "gateway-nexus",       name: "Gateway Nexus",       agent: "ALICE",   color: 0x2979ff, x: 500, y: 0,   radius: 300 },
  { id: "compute-forge",       name: "Compute Forge",       agent: "OCTAVIA", color: 0x00e676, x: -500,y: 0,   radius: 350 },
  { id: "crystal-observatory", name: "Crystal Observatory", agent: "PRISM",   color: 0xf5a623, x: 0,   y: 500, radius: 280 },
  { id: "archive-sanctum",     name: "Archive Sanctum",     agent: "ECHO",    color: 0x9c27b0, x: 0,   y: -500,radius: 320 },
  { id: "vault-terminus",      name: "Vault Terminus",      agent: "CIPHER",  color: 0x212121, x: 350, y: 350, radius: 260 },
];

export class WorldEngine {
  private entities = new Map<string, {id:string,type:string,x:number,y:number,agentId?:string}>();
  private tick = 0;

  constructor() {
    for (const z of WORLD_ZONES) {
      this.entities.set(`agent-${z.agent.toLowerCase()}`, {
        id: `agent-${z.agent.toLowerCase()}`, type: "agent",
        x: z.x, y: z.y, agentId: z.agent
      });
    }
  }

  update(): void {
    this.tick++;
    for (const [, e] of this.entities) {
      if (e.type === "agent") {
        const zone = WORLD_ZONES.find(z => z.agent === e.agentId);
        if (zone) {
          const a = this.tick * 0.01;
          e.x = zone.x + Math.cos(a) * 20;
          e.y = zone.y + Math.sin(a) * 20;
        }
      }
    }
  }

  serialize() {
    return { tick: this.tick, zones: WORLD_ZONES.length, entities: this.entities.size };
  }
}

export const worldEngine = new WorldEngine();
