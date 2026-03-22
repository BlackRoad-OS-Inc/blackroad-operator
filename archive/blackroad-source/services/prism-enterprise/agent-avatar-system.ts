/**
 * Agent Avatar System for Earth Metaverse
 *
 * Manages 3D avatar representation, spawning, positioning, and animation
 * for all agents in the BlackRoad Prism Console metaverse.
 */

import { Vector3, Quaternion, Color } from 'three';

const FALLBACK_MAX_CONCURRENT_AGENTS = 1200;

const DEFAULT_MAX_CONCURRENT_AGENTS = (() => {
  const parsed = Number(process.env.MAX_CONCURRENT_AGENTS);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return FALLBACK_MAX_CONCURRENT_AGENTS;
})();

export interface AgentAvatarManagerOptions {
  maxConcurrentAgents?: number;
  logger?: Pick<typeof console, 'log' | 'warn' | 'error'>;
}

// ==================== Types ====================

export type ClusterId =
  | 'athenaeum'
  | 'lucidia'
  | 'blackroad'
  | 'eidos'
  | 'mycelia'
  | 'soma'
  | 'aurum'
  | 'aether'
  | 'parallax'
  | 'continuum';

export type AvatarVariant =
  | 'scholar'
  | 'creator'
  | 'engineer'
  | 'philosopher'
  | 'networker'
  | 'healer'
  | 'trader'
  | 'explorer'
  | 'observer'
  | 'chronicler';

export type FormationType = 'DELTA' | 'HALO' | 'LATTICE' | 'HUM' | 'CAMPFIRE';

export interface AgentProfile {
  agentId: string;
  clusterId: ClusterId;
  name: string;
  role: string;
  capabilities: string[];
  languageAbility?: 'core' | 'engineer' | 'creator' | 'investor' | 'kids';
}

export interface AvatarConfig {
  variant: AvatarVariant;
  colorScheme: Color;
  scale: number;
  animationRig: string;
  customization?: {
    accessory?: string;
    glow?: boolean;
    trailEffect?: boolean;
  };
}

export interface SpawnRequest {
  agentId: string;
  profile: AgentProfile;
  preferredZone?: string;
  avatarConfig?: Partial<AvatarConfig>;
}

export interface AgentTransform {
  position: Vector3;
  rotation: Quaternion;
  velocity?: Vector3;
  timestamp: number;
}

export interface AgentAvatar {
  agentId: string;
  profile: AgentProfile;
  avatarConfig: AvatarConfig;
  transform: AgentTransform;
  currentZone: string;
  isActive: boolean;
  lastUpdate: number;
  formationId?: string;
  interactionState?: {
    targetId?: string;
    interactionType?: string;
  };
}

// ==================== Cluster Configuration ====================

const CLUSTER_CONFIGS: Record<ClusterId, {
  variant: AvatarVariant;
  colorScheme: [number, number, number];
  continentPreference: string[];
}> = {
  athenaeum: {
    variant: 'scholar',
    colorScheme: [0.2, 0.3, 0.8],
    continentPreference: ['europe', 'north-america']
  },
  lucidia: {
    variant: 'creator',
    colorScheme: [0.8, 0.5, 0.2],
    continentPreference: ['asia', 'oceania']
  },
  blackroad: {
    variant: 'engineer',
    colorScheme: [0.1, 0.1, 0.1],
    continentPreference: ['north-america', 'europe']
  },
  eidos: {
    variant: 'philosopher',
    colorScheme: [0.6, 0.2, 0.6],
    continentPreference: ['europe', 'asia']
  },
  mycelia: {
    variant: 'networker',
    colorScheme: [0.2, 0.8, 0.3],
    continentPreference: ['south-america', 'africa']
  },
  soma: {
    variant: 'healer',
    colorScheme: [0.9, 0.7, 0.4],
    continentPreference: ['africa', 'south-america']
  },
  aurum: {
    variant: 'trader',
    colorScheme: [0.9, 0.8, 0.2],
    continentPreference: ['atlantic-hub', 'pacific-hub']
  },
  aether: {
    variant: 'explorer',
    colorScheme: [0.8, 0.8, 0.9],
    continentPreference: ['orbital-station']
  },
  parallax: {
    variant: 'observer',
    colorScheme: [0.5, 0.5, 0.5],
    continentPreference: ['antarctica', 'orbital-station']
  },
  continuum: {
    variant: 'chronicler',
    colorScheme: [0.3, 0.6, 0.8],
    continentPreference: ['pacific-hub', 'atlantic-hub']
  }
};

// ==================== Zone Spawn Points ====================

const ZONE_SPAWN_POINTS: Record<string, { lat: number; lon: number; alt: number }> = {
  'north-america': { lat: 40.0, lon: -100.0, alt: 2.0 },
  'europe': { lat: 50.0, lon: 10.0, alt: 2.0 },
  'asia': { lat: 30.0, lon: 100.0, alt: 2.0 },
  'africa': { lat: 0.0, lon: 20.0, alt: 2.0 },
  'south-america': { lat: -15.0, lon: -60.0, alt: 2.0 },
  'oceania': { lat: -25.0, lon: 135.0, alt: 2.0 },
  'antarctica': { lat: -80.0, lon: 0.0, alt: 2.0 },
  'pacific-hub': { lat: 0.0, lon: -160.0, alt: 10.0 },
  'atlantic-hub': { lat: 30.0, lon: -40.0, alt: 10.0 },
  'orbital-station': { lat: 0.0, lon: 0.0, alt: 250.0 }
};

// ==================== Agent Avatar Manager ====================

export class AgentAvatarManager {
  private avatars: Map<string, AgentAvatar> = new Map();
  private formations: Map<string, Set<string>> = new Map();
  private zoneAgentCounts: Map<string, number> = new Map();
  private maxConcurrentAgents: number;
  private logger: Pick<typeof console, 'log' | 'warn' | 'error'>;

  constructor(options: AgentAvatarManagerOptions = {}) {
    this.maxConcurrentAgents = options.maxConcurrentAgents ?? DEFAULT_MAX_CONCURRENT_AGENTS;
    this.logger = options.logger ?? console;
    this.initializeZoneCounts();
  }

  setMaxConcurrentAgents(max: number): void {
    if (!Number.isFinite(max) || max <= 0) {
      throw new Error('maxConcurrentAgents must be a positive number');
    }

    if (max < this.avatars.size) {
      throw new Error('Cannot set maxConcurrentAgents below current active agents');
    }

    this.maxConcurrentAgents = max;
  }

  private initializeZoneCounts(): void {
    Object.keys(ZONE_SPAWN_POINTS).forEach(zone => {
      this.zoneAgentCounts.set(zone, 0);
    });
  }

  /**
   * Spawn a new agent avatar in the metaverse
   */
  async spawnAgent(request: SpawnRequest): Promise<AgentAvatar> {
    if (this.avatars.size >= this.maxConcurrentAgents) {
      throw new Error(`Maximum concurrent agents (${this.maxConcurrentAgents}) reached`);
    }

    if (this.avatars.has(request.agentId)) {
      throw new Error(`Agent ${request.agentId} already spawned`);
    }

    // Determine spawn zone
    const zone = this.selectSpawnZone(request.profile.clusterId, request.preferredZone);

    // Create avatar configuration
    const clusterConfig = CLUSTER_CONFIGS[request.profile.clusterId];
    const avatarConfig: AvatarConfig = {
      variant: clusterConfig.variant,
      colorScheme: new Color(...clusterConfig.colorScheme),
      scale: 1.0,
      animationRig: 'mixamo_compatible',
      ...request.avatarConfig
    };

    // Get spawn position
    const spawnPoint = ZONE_SPAWN_POINTS[zone];
    const position = this.latLonToCartesian(spawnPoint.lat, spawnPoint.lon, spawnPoint.alt);

    // Add some random offset to prevent exact overlap
    position.x += (Math.random() - 0.5) * 5;
    position.z += (Math.random() - 0.5) * 5;

    const avatar: AgentAvatar = {
      agentId: request.agentId,
      profile: request.profile,
      avatarConfig,
      transform: {
        position,
        rotation: new Quaternion(),
        velocity: new Vector3(),
        timestamp: Date.now()
      },
      currentZone: zone,
      isActive: true,
      lastUpdate: Date.now()
    };

    this.avatars.set(request.agentId, avatar);
    this.zoneAgentCounts.set(zone, (this.zoneAgentCounts.get(zone) || 0) + 1);

    this.logger.log(`[AgentAvatarManager] Spawned agent ${request.agentId} in zone ${zone}`);
    return avatar;
  }

  /**
   * Update agent position and rotation
   */
  updateAgentTransform(agentId: string, transform: Partial<AgentTransform>): void {
    const avatar = this.avatars.get(agentId);
    if (!avatar) {
      throw new Error(`Agent ${agentId} not found`);
    }

    avatar.transform = {
      ...avatar.transform,
      ...transform,
      timestamp: Date.now()
    };
    avatar.lastUpdate = Date.now();

    // Check if zone changed
    const newZone = this.detectZone(avatar.transform.position);
    if (newZone !== avatar.currentZone) {
      this.zoneAgentCounts.set(avatar.currentZone,
        (this.zoneAgentCounts.get(avatar.currentZone) || 0) - 1);
      this.zoneAgentCounts.set(newZone,
        (this.zoneAgentCounts.get(newZone) || 0) + 1);
      avatar.currentZone = newZone;
      this.logger.log(`[AgentAvatarManager] Agent ${agentId} moved to zone ${newZone}`);
    }
  }

  /**
   * Despawn an agent avatar
   */
  despawnAgent(agentId: string): void {
    const avatar = this.avatars.get(agentId);
    if (!avatar) {
      return;
    }

    this.zoneAgentCounts.set(avatar.currentZone,
      (this.zoneAgentCounts.get(avatar.currentZone) || 0) - 1);

    // Remove from any formations
    if (avatar.formationId) {
      this.removeFromFormation(avatar.formationId, agentId);
    }

    this.avatars.delete(agentId);
    this.logger.log(`[AgentAvatarManager] Despawned agent ${agentId}`);
  }

  /**
   * Create a sacred formation pattern
   */
  createFormation(
    formationType: FormationType,
    agentIds: string[],
    centerPosition: Vector3
  ): string {
    const formationId = `formation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const positions = this.calculateFormationPositions(formationType, agentIds.length, centerPosition);

    agentIds.forEach((agentId, index) => {
      const avatar = this.avatars.get(agentId);
      if (avatar) {
        avatar.formationId = formationId;
        this.updateAgentTransform(agentId, { position: positions[index] });
      }
    });

    this.formations.set(formationId, new Set(agentIds));
    this.logger.log(`[AgentAvatarManager] Created ${formationType} formation with ${agentIds.length} agents`);

    return formationId;
  }

  /**
   * Calculate positions for formation patterns
   */
  private calculateFormationPositions(
    type: FormationType,
    count: number,
    center: Vector3
  ): Vector3[] {
    const positions: Vector3[] = [];
    const radius = 5.0;

    switch (type) {
      case 'DELTA':
        // Triangle formation for fast iteration
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          positions.push(new Vector3(
            center.x + Math.cos(angle) * radius,
            center.y,
            center.z + Math.sin(angle) * radius
          ));
        }
        break;

      case 'HALO':
        // Circular protective formation
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          positions.push(new Vector3(
            center.x + Math.cos(angle) * radius,
            center.y,
            center.z + Math.sin(angle) * radius
          ));
        }
        break;

      case 'LATTICE':
        // Grid formation for systematic work
        const gridSize = Math.ceil(Math.sqrt(count));
        for (let i = 0; i < count; i++) {
          const row = Math.floor(i / gridSize);
          const col = i % gridSize;
          positions.push(new Vector3(
            center.x + (col - gridSize / 2) * 3,
            center.y,
            center.z + (row - gridSize / 2) * 3
          ));
        }
        break;

      case 'HUM':
        // Tight cluster for synchronous work
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          positions.push(new Vector3(
            center.x + Math.cos(angle) * (radius * 0.5),
            center.y,
            center.z + Math.sin(angle) * (radius * 0.5)
          ));
        }
        break;

      case 'CAMPFIRE':
        // Circle facing inward for knowledge sharing
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          positions.push(new Vector3(
            center.x + Math.cos(angle) * radius,
            center.y,
            center.z + Math.sin(angle) * radius
          ));
        }
        break;
    }

    return positions;
  }

  /**
   * Remove agent from formation
   */
  private removeFromFormation(formationId: string, agentId: string): void {
    const formation = this.formations.get(formationId);
    if (formation) {
      formation.delete(agentId);
      if (formation.size === 0) {
        this.formations.delete(formationId);
      }
    }

    const avatar = this.avatars.get(agentId);
    if (avatar) {
      avatar.formationId = undefined;
    }
  }

  /**
   * Select spawn zone based on cluster preference and availability
   */
  private selectSpawnZone(clusterId: ClusterId, preferredZone?: string): string {
    if (preferredZone && ZONE_SPAWN_POINTS[preferredZone]) {
      return preferredZone;
    }

    const clusterConfig = CLUSTER_CONFIGS[clusterId];
    const preferences = clusterConfig.continentPreference;

    // Find least populated preferred zone
    let selectedZone = preferences[0];
    let minCount = this.zoneAgentCounts.get(selectedZone) || 0;

    for (const zone of preferences) {
      const count = this.zoneAgentCounts.get(zone) || 0;
      if (count < minCount) {
        selectedZone = zone;
        minCount = count;
      }
    }

    return selectedZone;
  }

  /**
   * Convert lat/lon to Cartesian coordinates on sphere
   */
  private latLonToCartesian(lat: number, lon: number, altitude: number): Vector3 {
    const earthRadius = 100.0;
    const radius = earthRadius + altitude;

    const latRad = (lat * Math.PI) / 180;
    const lonRad = (lon * Math.PI) / 180;

    const x = radius * Math.cos(latRad) * Math.cos(lonRad);
    const y = radius * Math.sin(latRad);
    const z = radius * Math.cos(latRad) * Math.sin(lonRad);

    return new Vector3(x, y, z);
  }

  /**
   * Detect which zone a position is in
   */
  private detectZone(position: Vector3): string {
    // Convert Cartesian back to lat/lon
    const earthRadius = 100.0;
    const distance = position.length();

    const lat = Math.asin(position.y / distance) * (180 / Math.PI);
    const lon = Math.atan2(position.z, position.x) * (180 / Math.PI);

    // Find closest zone
    let closestZone = 'orbital-station';
    let minDistance = Infinity;

    for (const [zone, coords] of Object.entries(ZONE_SPAWN_POINTS)) {
      const dist = Math.sqrt(
        Math.pow(coords.lat - lat, 2) +
        Math.pow(coords.lon - lon, 2)
      );
      if (dist < minDistance) {
        minDistance = dist;
        closestZone = zone;
      }
    }

    return closestZone;
  }

  /**
   * Get all active avatars
   */
  getAllAvatars(): AgentAvatar[] {
    return Array.from(this.avatars.values());
  }

  /**
   * Get avatars in a specific zone
   */
  getAvatarsInZone(zone: string): AgentAvatar[] {
    return this.getAllAvatars().filter(avatar => avatar.currentZone === zone);
  }

  /**
   * Get formation members
   */
  getFormationMembers(formationId: string): string[] {
    const formation = this.formations.get(formationId);
    return formation ? Array.from(formation) : [];
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      totalAgents: this.avatars.size,
      maxConcurrentAgents: this.maxConcurrentAgents,
      activeFormations: this.formations.size,
      zoneDistribution: Object.fromEntries(this.zoneAgentCounts)
    };
  }
}

// ==================== Export Singleton ====================

export const avatarManager = new AgentAvatarManager();
