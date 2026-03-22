/**
 * Lucidia Workspace Configuration
 * Extended from PixelHQ for BlackRoad OS Agent Visualization
 */

export interface LucidiaZone {
  id: string;
  name: string;
  description: string;
  scenePath: string;
  capacity: number;
  triggers: ActivityTrigger[];
}

export interface ActivityTrigger {
  type: 'git' | 'test' | 'deploy' | 'search' | 'chat' | 'nats' | 'file' | 'terminal';
  pattern?: string;
  action: 'switch_zone' | 'celebrate' | 'alert' | 'show_data';
}

export const LUCIDIA_ZONES: LucidiaZone[] = [
  {
    id: 'plaza',
    name: 'Central Collaboration Plaza',
    description: 'Main hub with fountain and pathways',
    scenePath: 'assets/scenes/plaza.png',
    capacity: 50,
    triggers: [
      { type: 'chat', action: 'switch_zone' }
    ]
  },
  {
    id: 'library',
    name: 'Research Library',
    description: 'Knowledge repository and study space',
    scenePath: 'assets/scenes/library.png',
    capacity: 30,
    triggers: [
      { type: 'search', action: 'switch_zone' },
      { type: 'file', pattern: '\\.(md|txt|json)$', action: 'switch_zone' }
    ]
  },
  {
    id: 'dev_lab_4',
    name: 'Development Lab 4 - Infrastructure',
    description: 'K3s, DevOps, and infrastructure work',
    scenePath: 'assets/scenes/dev_lab_4.png',
    capacity: 12,
    triggers: [
      { type: 'git', pattern: 'infra|k3s|devops|docker|kubernetes', action: 'switch_zone' },
      { type: 'git', action: 'celebrate' },
      { type: 'file', pattern: '\\.(ya?ml|toml|json)$', action: 'switch_zone' }
    ]
  },
  {
    id: 'comm_tower',
    name: 'Communications Tower',
    description: 'Event bus visualization and system monitoring',
    scenePath: 'assets/scenes/comm_tower.png',
    capacity: 20,
    triggers: [
      { type: 'nats', action: 'show_data' },
      { type: 'deploy', action: 'switch_zone' },
      { type: 'terminal', pattern: 'nats|event|bus|pub|sub', action: 'switch_zone' }
    ]
  },
  {
    id: 'innovation_park',
    name: 'Innovation Park',
    description: 'Creative space for prototyping and experimentation',
    scenePath: 'assets/scenes/innovation_park.png',
    capacity: 15,
    triggers: [
      { type: 'git', pattern: 'prototype|experiment|idea|poc|draft', action: 'switch_zone' },
      { type: 'file', pattern: 'prototype|experiment|draft|sketch', action: 'switch_zone' }
    ]
  }
];

export const LUCIDIA_CONFIG = {
  zones: LUCIDIA_ZONES,
  defaultZone: 'dev_lab_4',
  transitionDuration: 1000, // ms
  agentUpdateInterval: 100, // ms
  natsUrl: process.env.NATS_URL || 'nats://localhost:4222',
  enableNats: process.env.ENABLE_NATS !== 'false',
  enableMultiZone: true,
  maxAgentsPerZone: 50,
  debugMode: process.env.DEBUG === 'true'
};

export default LUCIDIA_CONFIG;
