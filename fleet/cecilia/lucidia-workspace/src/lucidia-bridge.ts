/**
 * Lucidia Bridge - Extended PixelHQ Bridge
 * Adds multi-zone support and NATS integration for BlackRoad OS
 */

import { NATSBridge } from './integrations/nats-bridge.js';
import { ZoneManager, ZoneActivity } from './core/zone-manager.js';
import { LUCIDIA_CONFIG } from './config/lucidia.config.js';
import { EventEmitter } from 'events';

export interface LucidiaBridgeOptions {
  natsUrl?: string;
  enableNats?: boolean;
  defaultZone?: string;
  debugMode?: boolean;
}

export class LucidiaBridge extends EventEmitter {
  private nats: NATSBridge;
  private zoneManager: ZoneManager;
  private options: LucidiaBridgeOptions;
  private isRunning = false;

  constructor(options: LucidiaBridgeOptions = {}) {
    super();
    
    this.options = {
      natsUrl: options.natsUrl || LUCIDIA_CONFIG.natsUrl,
      enableNats: options.enableNats ?? LUCIDIA_CONFIG.enableNats,
      defaultZone: options.defaultZone || LUCIDIA_CONFIG.defaultZone,
      debugMode: options.debugMode ?? LUCIDIA_CONFIG.debugMode
    };

    this.nats = new NATSBridge();
    this.zoneManager = new ZoneManager(this.options.defaultZone);
    
    this.setupZoneManagerListeners();
  }

  async start() {
    if (this.isRunning) {
      console.warn('⚠️  Lucidia Bridge is already running');
      return;
    }

    console.log('🚀 Starting Lucidia Workspace Bridge...');
    console.log(`📊 Multi-zone system: ${LUCIDIA_CONFIG.enableMultiZone ? 'ENABLED' : 'DISABLED'}`);
    
    // Connect to NATS if enabled
    if (this.options.enableNats && this.options.natsUrl) {
      const connected = await this.nats.connect(this.options.natsUrl);
      if (connected) {
        this.setupNATSListeners();
        console.log('✅ NATS integration active');
      } else {
        console.log('ℹ️  Running without NATS (PixelHQ-only mode)');
      }
    } else {
      console.log('ℹ️  NATS disabled, running in PixelHQ-only mode');
    }

    // Initialize zone manager
    const currentZone = this.zoneManager.getCurrentZone();
    console.log(`📍 Current zone: ${currentZone.name}`);
    console.log(`📝 ${currentZone.description}`);
    
    this.isRunning = true;
    this.emit('started');

    console.log('\n🎨 Lucidia Workspace is ready!');
    console.log('   Connect your iOS Pixel Office app to see the visualization\n');
  }

  private setupZoneManagerListeners() {
    this.zoneManager.on('zone_changed', (event) => {
      if (this.options.debugMode) {
        console.log(`🗺️  Zone changed: ${event.from.name} → ${event.to.name}`);
      }
      
      // Broadcast zone change to connected clients
      this.emit('zone_changed', event);
      
      // Publish to NATS if connected
      if (this.nats.isConnected()) {
        this.nats.publish('lucidia.zone.changed', event);
      }
    });

    this.zoneManager.on('activity', (event) => {
      if (this.options.debugMode) {
        console.log(`⚡ Activity: ${event.activity.type} in ${event.currentZone.name}`);
      }
      this.emit('activity', event);
    });

    this.zoneManager.on('agent_added', (agent) => {
      if (this.options.debugMode) {
        console.log(`👤 Agent added: ${agent.name} in zone ${agent.zoneId}`);
      }
      this.emit('agent_added', agent);
    });
  }

  private setupNATSListeners() {
    this.nats.on('blackroad_event', (event) => {
      if (this.options.debugMode) {
        console.log('📨 BlackRoad event:', event.subject);
      }
      
      // Parse subject to determine event type
      const parts = event.subject.split('.');
      
      if (parts[1] === 'agents') {
        this.handleAgentEvent(event);
      } else if (parts[1] === 'dev') {
        this.handleDevEvent(event);
      } else if (parts[1] === 'system') {
        this.handleSystemEvent(event);
      } else if (parts[1] === 'zone') {
        this.handleZoneEvent(event);
      }
    });

    this.nats.on('disconnected', () => {
      console.warn('⚠️  NATS disconnected');
      this.emit('nats_disconnected');
    });

    this.nats.on('reconnected', () => {
      console.log('✅ NATS reconnected');
      this.emit('nats_reconnected');
    });
  }

  private handleAgentEvent(event: any) {
    const activity: ZoneActivity = {
      type: 'nats',
      data: event.data,
      source: 'blackroad.agents',
      timestamp: event.timestamp
    };
    
    this.zoneManager.handleActivity(activity);
  }

  private handleDevEvent(event: any) {
    const activity: ZoneActivity = {
      type: event.data.type || 'git',
      data: event.data,
      source: 'blackroad.dev',
      timestamp: event.timestamp
    };
    
    this.zoneManager.handleActivity(activity);
  }

  private handleSystemEvent(event: any) {
    const activity: ZoneActivity = {
      type: 'deploy',
      data: event.data,
      source: 'blackroad.system',
      timestamp: event.timestamp
    };
    
    this.zoneManager.handleActivity(activity);
  }

  private handleZoneEvent(event: any) {
    if (event.data.action === 'switch' && event.data.zoneId) {
      this.zoneManager.switchZone(event.data.zoneId, 'External request');
    }
  }

  // Public API for integration with PixelHQ events
  handlePixelEvent(eventType: string, data: any) {
    const activity: ZoneActivity = {
      type: this.mapPixelEventType(eventType),
      data,
      source: 'pixelhq',
      timestamp: Date.now()
    };
    
    this.zoneManager.handleActivity(activity);
  }

  private mapPixelEventType(pixelEvent: string): string {
    const mapping: Record<string, string> = {
      'file_changed': 'file',
      'git_commit': 'git',
      'test_run': 'test',
      'terminal_command': 'terminal',
      'search': 'search'
    };
    
    return mapping[pixelEvent] || 'chat';
  }

  getZoneManager(): ZoneManager {
    return this.zoneManager;
  }

  getNATSBridge(): NATSBridge {
    return this.nats;
  }

  getStats() {
    return {
      running: this.isRunning,
      natsConnected: this.nats.isConnected(),
      zones: this.zoneManager.getStats()
    };
  }

  async stop() {
    if (!this.isRunning) {
      return;
    }

    console.log('⏹️  Stopping Lucidia Bridge...');
    
    await this.nats.close();
    this.isRunning = false;
    this.emit('stopped');
    
    console.log('✅ Lucidia Bridge stopped');
  }
}

export default LucidiaBridge;
