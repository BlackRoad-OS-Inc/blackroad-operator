import { spawn, type ChildProcessWithoutNullStreams } from 'child_process';
import { randomUUID } from 'crypto';
import { parse as parseShell } from 'shell-quote';
import { emitBusEvent } from './event-bus';

export type RunStatus = 'running' | 'ok' | 'error' | 'cancelled';

export interface RunRecord {
  id: string;
  projectId: string;
  sessionId: string;
  cmd: string;
  cwd?: string;
  status: RunStatus;
  exitCode?: number | null;
  startedAt: string;
  endedAt?: string;
}

const runs: RunRecord[] = [];
const activeRuns = new Map<string, ChildProcessWithoutNullStreams>();
const MAX_RUN_HISTORY = 100;

function pruneRuns() {
  if (runs.length <= MAX_RUN_HISTORY) {
    return;
  }
  let remove = runs.length - MAX_RUN_HISTORY;
  for (let i = 0; i < runs.length && remove > 0;) {
    if (runs[i].status !== 'running') {
      runs.splice(i, 1);
      remove -= 1;
    } else {
      i += 1;
    }
  }
}

function parseCommand(cmd: string): string[] {
  const parts = parseShell(cmd);
  if (parts.some((p) => typeof p !== 'string')) {
    throw new Error('invalid cmd');
  }
  return parts as string[];
}

function ensureAllowed(command: string) {
  const allowEnv = (process.env.PRISM_RUN_ALLOW || '').split(',').map((p) => p.trim()).filter(Boolean);
  if (allowEnv.length > 0 && !allowEnv.includes(command)) {
    throw new Error('cmd not allowed');
  }
}

function hasDangerousToken(parts: string[]): boolean {
  const dangerous = new Set(['&&', ';', '|', '||', '>', '<']);
  return parts.some((p) => dangerous.has(p));
}

export function listRuns(projectId: string, limit: number): RunRecord[] {
  return runs.filter((r) => r.projectId === projectId).slice(-limit);
}

export function cancelRun(id: string): boolean {
  const child = activeRuns.get(id);
  if (!child) {
    return false;
  }
  child.kill('SIGTERM');
  return true;
}

export function startRun(
  projectId: string,
  sessionId: string,
  cmd: string,
  cwd?: string,
  env?: Record<string, string>,
) {
  const parts = parseCommand(cmd);
  if (parts.length === 0) {
    throw new Error('cmd required');
  }
  if (hasDangerousToken(parts)) {
    throw new Error('cmd not allowed');
  }
  const command = parts[0];
  ensureAllowed(command);

  const id = randomUUID();
  const startedAt = new Date().toISOString();
  const record: RunRecord = {
    id,
    projectId,
    sessionId,
    cmd,
    cwd,
    status: 'running',
    startedAt,
  };
  runs.push(record);

  let child: ChildProcessWithoutNullStreams;
  try {
    child = spawn(command, parts.slice(1), { cwd, env });
  } catch (err) {
    emitBusEvent('run.err', { runId: id, error: (err as Error).message });
    finalizeRun(record, 'error', null, { error: (err as Error).message });
    throw err;
  }

  activeRuns.set(id, child);
  emitBusEvent('run.start', { runId: id, cmd, cwd });

  child.stdout.on('data', (chunk) => {
    emitBusEvent('run.out', { runId: id, chunk: chunk.toString() });
  });

  child.stderr.on('data', (chunk) => {
    emitBusEvent('run.err', { runId: id, chunk: chunk.toString() });
  });

  child.on('close', (code) => {
    finalizeRun(record, record.status === 'cancelled' ? 'cancelled' : code === 0 ? 'ok' : 'error', code ?? null);
  });

  child.on('error', (err) => {
    emitBusEvent('run.err', { runId: id, error: err.message });
    finalizeRun(record, 'error', null, { error: err.message });
  });

  return { runId: id };
}

function finalizeRun(
  record: RunRecord,
  status: RunStatus,
  exitCode: number | null,
  extra?: Record<string, unknown>,
) {
  if (record.endedAt) {
    return;
  }
  record.status = status;
  record.exitCode = exitCode;
  record.endedAt = new Date().toISOString();
  activeRuns.delete(record.id);
  pruneRuns();
  emitBusEvent('run.end', {
    runId: record.id,
    status,
    exitCode,
    durationMs: Date.parse(record.endedAt) - Date.parse(record.startedAt),
    ...(extra ?? {}),
  });
}
