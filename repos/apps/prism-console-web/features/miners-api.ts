import fallbackHistory from '@/mocks/miner-history.json';
import { config } from '@/lib/config';
import { z } from 'zod';

const optionalNumber = z.number().optional().nullable();
const optionalInt = z.number().int().optional().nullable();

const sampleSchema = z.object({
  miner: z.string(),
  ts: z.string(),
  pool: z.string().optional().nullable(),
  hashrate_1m: optionalNumber,
  hashrate_15m: optionalNumber,
  shares_accepted: optionalInt,
  shares_rejected: optionalInt,
  shares_stale: optionalInt,
  shares_total: optionalInt,
  stale_rate: optionalNumber,
  latency_ms: optionalNumber,
  temperature_c: optionalNumber,
});

const eventSchema = z.object({
  topic: z.string(),
  payload: z.object({
    type: z.literal('miner.sample'),
    orgId: z.string().optional(),
    agentId: z.string().optional(),
    sample: sampleSchema,
  }),
});

const eventsResponseSchema = z.object({
  events: z.array(eventSchema),
});

export type MinerSample = z.infer<typeof sampleSchema> & { timestamp: Date };

export interface MinerHistory {
  minerId: string;
  samples: MinerSample[];
}

function ensureEventsUrl() {
  const url = config.eventsUrl;
  if (!url) {
    return null;
  }
  return url.endsWith('/events') ? url : `${url.replace(/\/$/, '')}/events`;
}

function coerceHistory(minerId: string, limit: number): MinerHistory {
  const base = fallbackHistory as MinerHistory;
  const filtered = base.samples
    .filter((sample) => sample.miner === minerId)
    .map((sample) => ({
      ...sample,
      timestamp: new Date(sample.ts ?? sample.timestamp ?? Date.now()),
    }))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .slice(-limit);
  return {
    minerId,
    samples: filtered,
  };
}

export interface FetchMinerEventsOptions {
  minerId?: string;
  limit?: number;
  signal?: AbortSignal;
}

export async function fetchMinerEvents({
  minerId = 'xmrig',
  limit = 40,
  signal,
}: FetchMinerEventsOptions = {}): Promise<MinerHistory> {
  const eventsUrl = ensureEventsUrl();
  if (!eventsUrl) {
    return coerceHistory(minerId, limit);
  }

  try {
    const url = new URL(eventsUrl);
    url.searchParams.set('limit', String(limit));

    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (config.eventsToken) {
      headers.set('Authorization', `Bearer ${config.eventsToken}`);
    }

    const response = await fetch(url, { headers, cache: 'no-store', signal });
    if (!response.ok) {
      throw new Error(`events request failed (${response.status})`);
    }

    const body = await response.json();
    const parsed = eventsResponseSchema.parse(body);

    const samples = parsed.events
      .filter((event) => event.topic === 'miner.sample')
      .map((event) => event.payload.sample)
      .filter((sample) => sample.miner === minerId)
      .map((sample) => ({
        ...sample,
        timestamp: new Date(sample.ts),
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(-limit);

    return {
      minerId,
      samples,
    };
  } catch (error) {
    console.warn('Falling back to mock miner history:', error);
    return coerceHistory(minerId, limit);
  }
}
