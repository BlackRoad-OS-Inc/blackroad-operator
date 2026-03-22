/**
 * BlackRoad Interactive — Main Game Loop
 * Orchestrates the agent RPG using Three.js 3D scene + AgentMesh renderer.
 */
import type { Zone, Encounter } from "./levels/index.js";
import { ZONES } from "./levels/index.js";

export interface PlayerState {
  level: number;
  xp: number;
  agents_captured: string[];
  current_zone: string;
  position: { x: number; y: number; z: number };
  party: CapturedAgent[];
}

export interface CapturedAgent {
  id: string;
  name: string;
  type: string;
  level: number;
  moves: string[];
  hp: number;
  max_hp: number;
}

export type GameEvent =
  | { type: "encounter"; encounter: Encounter }
  | { type: "zone_enter"; zone: Zone }
  | { type: "capture"; agent: CapturedAgent }
  | { type: "battle_win"; xp_gained: number }
  | { type: "level_up"; new_level: number };

type EventListener = (event: GameEvent) => void;

export class GameLoop {
  private player: PlayerState;
  private listeners: EventListener[] = [];
  private running = false;
  private tickRate = 60;  // fps

  constructor(playerName: string) {
    this.player = {
      level: 1, xp: 0, agents_captured: [],
      current_zone: "recursion-depths",
      position: { x: 0, y: 0, z: 0 },
      party: [],
    };
  }

  on(listener: EventListener): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  private emit(event: GameEvent) {
    this.listeners.forEach(l => l(event));
  }

  getCurrentZone(): Zone | undefined {
    return ZONES.find(z => z.id === this.player.current_zone);
  }

  async enterZone(zoneId: string): Promise<boolean> {
    const zone = ZONES.find(z => z.id === zoneId);
    if (!zone) return false;
    if (this.player.level < zone.requiredLevel) {
      console.warn(`Level ${zone.requiredLevel} required for ${zone.name}`);
      return false;
    }
    this.player.current_zone = zoneId;
    this.emit({ type: "zone_enter", zone });
    return true;
  }

  async triggerEncounter(encounterId?: string): Promise<Encounter | null> {
    const zone = this.getCurrentZone();
    if (!zone) return null;
    const eligibleEncounters = zone.encounters.filter(
      e => !this.player.agents_captured.includes(e.id)
    );
    if (!eligibleEncounters.length) return null;
    const encounter = encounterId
      ? zone.encounters.find(e => e.id === encounterId) ?? eligibleEncounters[0]
      : eligibleEncounters[Math.floor(Math.random() * eligibleEncounters.length)];
    this.emit({ type: "encounter", encounter });
    return encounter;
  }

  async captureAgent(encounter: Encounter): Promise<boolean> {
    const captureChance = 0.5 + (this.player.level - encounter.level) * 0.1;
    if (Math.random() > Math.max(0.1, Math.min(0.95, captureChance))) return false;
    const captured: CapturedAgent = {
      id: encounter.id, name: encounter.agentName, type: encounter.type,
      level: encounter.level, moves: encounter.moves,
      hp: encounter.level * 15, max_hp: encounter.level * 15,
    };
    this.player.agents_captured.push(encounter.id);
    if (this.player.party.length < 6) this.player.party.push(captured);
    this.emit({ type: "capture", agent: captured });
    await this.gainXP(encounter.xpReward);
    return true;
  }

  private async gainXP(amount: number) {
    this.player.xp += amount;
    const xpNeeded = this.player.level * 100;
    if (this.player.xp >= xpNeeded) {
      this.player.xp -= xpNeeded;
      this.player.level += 1;
      this.emit({ type: "level_up", new_level: this.player.level });
    }
  }

  getPlayerState(): Readonly<PlayerState> { return this.player; }
  getZones(): Zone[] { return ZONES; }
}

export default GameLoop;
