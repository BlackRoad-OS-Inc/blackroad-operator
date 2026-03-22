import { LUCIDIA_ZONES, LucidiaZone, ActivityTrigger } from '../config/lucidia.config.js';
import { EventEmitter } from 'events';

export interface AgentInfo {
  id: string;
  name: string;
  zoneId: string;
  position: { x: number; y: number };
  status: 'active' | 'idle' | 'busy';
  lastActivity: number;
}

export interface ZoneActivity {
  type: string;
  data: any;
  source?: string;
  timestamp: number;
}

export class ZoneManager extends EventEmitter {
  private currentZone: LucidiaZone;
  private agents: Map<string, AgentInfo> = new Map();
  private activityLog: ZoneActivity[] = [];
  private maxActivityLog = 100;

  constructor(defaultZoneId?: string) {
    super();
    const startZone = LUCIDIA_ZONES.find(z => z.id === defaultZoneId) || LUCIDIA_ZONES[0];
    this.currentZone = startZone;
    console.log(`📍 Starting in zone: ${this.currentZone.name}`);
  }

  switchZone(zoneId: string, reason?: string) {
    const zone = LUCIDIA_ZONES.find(z => z.id === zoneId);
    if (!zone) {
      console.warn(`⚠️  Zone ${zoneId} not found`);
      return false;
    }

    if (zone.id === this.currentZone.id) {
      return false;
    }

    const previousZone = this.currentZone;
    this.currentZone = zone;
    
    console.log(`🔄 Zone switch: ${previousZone.name} → ${zone.name}${reason ? ` (${reason})` : ''}`);
    
    this.emit('zone_changed', {
      from: previousZone,
      to: zone,
      reason,
      timestamp: Date.now()
    });

    return true;
  }

  handleActivity(activity: ZoneActivity) {
    // Log the activity
    this.activityLog.push(activity);
    if (this.activityLog.length > this.maxActivityLog) {
      this.activityLog.shift();
    }

    // Check if activity triggers a zone switch
    const matchingZone = this.findMatchingZone(activity);

    if (matchingZone && matchingZone.id !== this.currentZone.id) {
      this.switchZone(matchingZone.id, `Activity: ${activity.type}`);
    }

    // Emit activity event for UI updates
    this.emit('activity', {
      activity,
      currentZone: this.currentZone
    });
  }

  private findMatchingZone(activity: ZoneActivity): LucidiaZone | null {
    for (const zone of LUCIDIA_ZONES) {
      const matchingTrigger = zone.triggers.find(trigger => 
        this.matchesTrigger(trigger, activity)
      );

      if (matchingTrigger && matchingTrigger.action === 'switch_zone') {
        return zone;
      }
    }
    return null;
  }

  private matchesTrigger(trigger: ActivityTrigger, activity: ZoneActivity): boolean {
    if (trigger.type !== activity.type) {
      return false;
    }

    if (trigger.pattern) {
      const activityString = JSON.stringify(activity.data).toLowerCase();
      return new RegExp(trigger.pattern, 'i').test(activityString);
    }

    return true;
  }

  addAgent(agent: AgentInfo) {
    this.agents.set(agent.id, agent);
    this.emit('agent_added', agent);
  }

  removeAgent(agentId: string) {
    const agent = this.agents.get(agentId);
    if (agent) {
      this.agents.delete(agentId);
      this.emit('agent_removed', agent);
    }
  }

  updateAgent(agentId: string, updates: Partial<AgentInfo>) {
    const agent = this.agents.get(agentId);
    if (agent) {
      Object.assign(agent, updates);
      this.emit('agent_updated', agent);
    }
  }

  getAgentsInZone(zoneId: string): AgentInfo[] {
    return Array.from(this.agents.values()).filter(a => a.zoneId === zoneId);
  }

  getCurrentZone(): LucidiaZone {
    return this.currentZone;
  }

  getZones(): LucidiaZone[] {
    return LUCIDIA_ZONES;
  }

  getRecentActivity(count: number = 10): ZoneActivity[] {
    return this.activityLog.slice(-count);
  }

  getStats() {
    return {
      currentZone: this.currentZone.name,
      totalAgents: this.agents.size,
      agentsByZone: LUCIDIA_ZONES.map(zone => ({
        zone: zone.name,
        count: this.getAgentsInZone(zone.id).length
      })),
      recentActivities: this.activityLog.length
    };
  }
}
