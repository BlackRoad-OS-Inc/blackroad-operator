import type { GatewayEvent, Command, UserRole } from "@office/shared";

export interface CommandMeta {
  role: UserRole;
  clientId: string;
}

/**
 * Channel interface — every message channel implements this.
 * "activate if configured, skip if not"
 */
export interface Channel {
  /** Channel name for logging */
  readonly name: string;
  /** Initialize and connect. Return false to skip (e.g. missing config). */
  init(commandHandler: (cmd: Command, meta: CommandMeta) => void): Promise<boolean>;
  /** Broadcast an event to this channel's clients */
  broadcast(event: GatewayEvent): void;
  /** Cleanup on shutdown */
  destroy?(): void;
}

const channels: Channel[] = [];

/** Register a channel. Call before initTransports(). */
export function registerChannel(channel: Channel) {
  channels.push(channel);
}

/** Initialize all registered channels. Skips those that return false from init(). */
export async function initTransports(commandHandler: (cmd: Command, meta: CommandMeta) => void) {
  const active: string[] = [];
  const skipped: string[] = [];

  for (const ch of channels) {
    const ok = await ch.init(commandHandler);
    if (ok) {
      active.push(ch.name);
    } else {
      skipped.push(ch.name);
    }
  }

  // Remove channels that didn't activate
  for (let i = channels.length - 1; i >= 0; i--) {
    if (skipped.includes(channels[i].name)) {
      channels.splice(i, 1);
    }
  }

  console.log(`[Transport] Active channels: ${active.join(", ") || "none"}`);
  if (skipped.length) {
    console.log(`[Transport] Skipped channels: ${skipped.join(", ")}`);
  }
}

/** Broadcast event to all active channels */
export function publishEvent(event: GatewayEvent) {
  for (const ch of channels) {
    ch.broadcast(event);
  }
}

/** Destroy all channels on shutdown */
export function destroyTransports() {
  for (const ch of channels) {
    ch.destroy?.();
  }
}
