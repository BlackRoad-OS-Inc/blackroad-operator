import { connect, StringCodec, NatsConnection, ConnectionOptions } from 'nats';
import { EventEmitter } from 'events';

export interface NATSEvent {
  subject: string;
  data: any;
  timestamp: number;
}

export class NATSBridge extends EventEmitter {
  private nc?: NatsConnection;
  private sc = StringCodec();
  private connected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  async connect(url: string = 'nats://localhost:4222'): Promise<boolean> {
    try {
      const opts: ConnectionOptions = {
        servers: url,
        reconnect: true,
        maxReconnectAttempts: this.maxReconnectAttempts,
        reconnectTimeWait: 2000,
      };

      this.nc = await connect(opts);
      this.connected = true;
      this.reconnectAttempts = 0;
      
      console.log('✅ Connected to NATS at', url);
      
      // Set up connection event handlers
      this.setupConnectionHandlers();
      
      // Subscribe to BlackRoad events
      await this.subscribeToBlackRoadEvents();
      
      return true;
    } catch (err) {
      console.warn('⚠️  NATS connection failed (running without NATS):', (err as Error).message);
      this.connected = false;
      return false;
    }
  }

  private setupConnectionHandlers() {
    if (!this.nc) return;

    (async () => {
      for await (const status of this.nc!.status()) {
        console.log(`📡 NATS status: ${status.type}`);
        
        if (status.type === 'disconnect' || status.type === 'reconnecting') {
          this.connected = false;
          this.emit('disconnected');
        } else if (status.type === 'reconnect') {
          this.connected = true;
          this.emit('reconnected');
        }
      }
    })().catch(err => {
      console.error('NATS status monitoring error:', err);
    });
  }

  private async subscribeToBlackRoadEvents() {
    if (!this.nc) return;

    try {
      // Subscribe to all BlackRoad agent events
      const sub = this.nc.subscribe('blackroad.>');
      
      console.log('📨 Subscribed to blackroad.> events');
      
      (async () => {
        for await (const msg of sub) {
          try {
            const data = JSON.parse(this.sc.decode(msg.data));
            const event: NATSEvent = {
              subject: msg.subject,
              data,
              timestamp: Date.now()
            };
            
            this.emit('blackroad_event', event);
          } catch (err) {
            console.error('Failed to parse NATS message:', err);
          }
        }
      })().catch(err => {
        console.error('NATS subscription error:', err);
      });
    } catch (err) {
      console.error('Failed to subscribe to NATS:', err);
    }
  }

  async publish(subject: string, data: any): Promise<boolean> {
    if (!this.nc || !this.connected) {
      console.warn('Cannot publish - NATS not connected');
      return false;
    }

    try {
      this.nc.publish(subject, this.sc.encode(JSON.stringify(data)));
      return true;
    } catch (err) {
      console.error('Failed to publish to NATS:', err);
      return false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async close() {
    if (this.nc) {
      await this.nc.close();
      this.connected = false;
      console.log('🔌 NATS connection closed');
    }
  }
}
