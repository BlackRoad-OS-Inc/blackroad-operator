/**
 * BlackRoad Earth Metaverse - Main Entry Point
 *
 * Export all public APIs for the metaverse module.
 */

// Agent Avatar System
export {
  avatarManager,
  AgentAvatarManager,
  type AgentProfile,
  type AvatarConfig,
  type SpawnRequest,
  type AgentTransform,
  type AgentAvatar,
  type ClusterId,
  type AvatarVariant,
  type FormationType
} from './agent-avatar-system';

// API Server
export {
  startMetaverseAPI,
  integrateWithAgentSwarm
} from './agent-world-api';

// React Components (for web clients)
export { default as EarthMetaverse, EarthMetaverseContainer } from './components/EarthMetaverse';

// Roster helpers
export {
  getAgentRoster,
  getRosterMetadata,
  findAgentById,
  summarizeRoster,
  toSpawnRequest,
  type RosterAgent,
  type RosterDataset,
  type RosterMetadata,
  type RosterAgentMetaverseInfo
} from './agent-roster';
