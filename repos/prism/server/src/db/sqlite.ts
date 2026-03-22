import fs from 'fs';
import path from 'path';
import { PrismEvent } from '@prism/core';
import { IntelligenceEvent } from '../types';

type StoredEvent = PrismEvent & { ctx?: Record<string, unknown> };

type StoredIntelligence = IntelligenceEvent;

type DbState = {
  events: StoredEvent[];
  intelligence: StoredIntelligence[];
};

let dbFile: string | null = null;
let state: DbState = { events: [], intelligence: [] };

function loadState(file: string) {
  if (!fs.existsSync(file)) {
    state = { events: [], intelligence: [] };
    return;
  }
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = JSON.parse(raw) as DbState;
    state = {
      events: parsed.events ?? [],
      intelligence: parsed.intelligence ?? [],
    };
  } catch {
    state = { events: [], intelligence: [] };
  }
}

function persist() {
  if (!dbFile || dbFile === ':memory:') {
    return;
  }
  const tmpFile = `${dbFile}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(state));
  fs.renameSync(tmpFile, dbFile);
}

export function initDb(filePath: string) {
  dbFile = filePath;
  if (dbFile !== ':memory:') {
    const dir = path.dirname(dbFile);
    fs.mkdirSync(dir, { recursive: true });
    loadState(dbFile);
  } else {
    state = { events: [], intelligence: [] };
  }
}

export function insertEvent(event: PrismEvent) {
  state.events.push(event);
  persist();
}

export function listEvents(projectId: string, limit: number) {
  return state.events
    .filter((event) => event.projectId === projectId)
    .sort((a, b) => b.ts.localeCompare(a.ts))
    .slice(0, limit);
}

export function insertIntelligenceEvent(event: IntelligenceEvent) {
  const existingIndex = state.intelligence.findIndex((row) => row.id === event.id);
  if (existingIndex >= 0) {
    state.intelligence[existingIndex] = event;
  } else {
    state.intelligence.push(event);
  }
  persist();
}

export function listIntelligenceEvents(limit: number) {
  return [...state.intelligence]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit);
}

export function getHydrationEvents(limit: number) {
  return [...state.intelligence]
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .slice(0, limit);
}
