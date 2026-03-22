/**
 * Aggregated agent roster helpers for the Earth Metaverse.
 *
 * The roster is generated via `tools/build_metaverse_roster.py` and supplies
 * normalized metadata for the first 1,000 agents across the canonical
 * archetype clusters. This module provides type-safe helpers so the API layer
 * and 3D clients can access the roster without bespoke parsing.
 */

import rosterData from './data/agent_roster.json';
import {
  type AgentProfile,
  type SpawnRequest,
  type ClusterId,
  type AvatarVariant
} from './agent-avatar-system';

export interface RosterMetadata {
  generatedAt: string;
  totalAgents: number;
  clusterCounts: Record<ClusterId, number> & Record<string, number>;
  source: string;
  limit: number;
}

export interface RosterAgentMetaverseInfo {
  preferredZone: string;
  avatarVariant: AvatarVariant;
  color: [number, number, number];
  spawnIndex: number;
}

export interface RosterAgent {
  id: string;
  cluster: ClusterId;
  clusterLabel: string;
  name: string;
  title: string;
  role: string;
  generation: 'seed' | 'apprentice' | 'hybrid' | 'elder';
  ethos?: string;
  capabilities: string[];
  covenants: string[];
  traits: Record<string, number>;
  profileSummary: Record<string, string>;
  lineage: {
    parent?: string;
    mentors?: string[];
    ancestryDepth?: number;
  };
  metaverse: RosterAgentMetaverseInfo;
  sourceManifest: string;
}

export interface RosterDataset {
  metadata: RosterMetadata;
  agents: RosterAgent[];
}

const dataset = rosterData as RosterDataset;

export function getRosterMetadata(): RosterMetadata {
  return dataset.metadata;
}

export function getAgentRoster(limit?: number): RosterAgent[] {
  if (typeof limit === 'number') {
    return dataset.agents.slice(0, limit);
  }
  return dataset.agents.slice();
}

export function findAgentById(agentId: string): RosterAgent | undefined {
  return dataset.agents.find(agent => agent.id === agentId);
}

export function toSpawnRequest(agent: RosterAgent): SpawnRequest {
  const profile: AgentProfile = {
    agentId: agent.id,
    clusterId: agent.cluster,
    name: agent.name || agent.title || agent.id,
    role: agent.role || agent.title || 'agent',
    capabilities: agent.capabilities.length ? agent.capabilities : ['contextual_reasoning'],
    languageAbility: 'core'
  };

  const spawnRequest: SpawnRequest = {
    agentId: agent.id,
    profile,
    preferredZone: agent.metaverse.preferredZone,
    avatarConfig: {
      customization: {
        glow: agent.generation !== 'apprentice',
        trailEffect: agent.generation === 'elder'
      }
    }
  };

  return spawnRequest;
}

export function summarizeRoster(): string {
  const meta = getRosterMetadata();
  const clusters = Object.entries(meta.clusterCounts)
    .map(([cluster, count]) => `${cluster}: ${count}`)
    .join(', ');
  return `Roster ${meta.totalAgents} agents (limit ${meta.limit}) — ${clusters}`;
}
