import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';

export type BusEvent<T = unknown> = {
  id: string;
  kind: string;
  ts: string;
  data: T;
};

const bus = new EventEmitter();

export function emitBusEvent<T>(kind: string, data: T): BusEvent<T> {
  const event: BusEvent<T> = {
    id: randomUUID(),
    kind,
    ts: new Date().toISOString(),
    data,
  };
  bus.emit('event', event);
  return event;
}

export { bus };
