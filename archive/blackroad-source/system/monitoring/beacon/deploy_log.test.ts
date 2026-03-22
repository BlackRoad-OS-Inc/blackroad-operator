import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, it, expect, beforeEach } from 'vitest';
import { appendDeployRecord, queryDeployHistory } from '../src/lib/sigDeployLog';

const baseRecord = {
  service: 'blackroad-os-web',
  env: 'prod',
  git_sha: 'abc123',
  actor: 'deployer',
  started_at: new Date().toISOString(),
  completed_at: new Date().toISOString(),
  outcome: 'success' as const,
  links: ['https://example.com/pr/1'],
};

describe('sigDeployLog', () => {
  let logPath: string;

  beforeEach(() => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'deploy-log-'));
    logPath = path.join(dir, 'deploy-log.jsonl');
  });

  it('appends valid record', () => {
    appendDeployRecord(baseRecord, logPath);
    const contents = fs.readFileSync(logPath, 'utf-8');
    expect(contents).toContain(baseRecord.service);
  });

  it('rejects invalid record', () => {
    const invalid = { ...baseRecord } as any;
    delete invalid.service;
    expect(() => appendDeployRecord(invalid, logPath)).toThrow();
  });

  it('queries history with filters and limits', () => {
    const secondRecord = { ...baseRecord, service: 'blackroad-os-api', env: 'staging', outcome: 'rollback' as const };
    appendDeployRecord(baseRecord, logPath);
    appendDeployRecord(secondRecord, logPath);

    const filtered = queryDeployHistory({ service: 'blackroad-os-web' }, logPath);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].service).toBe('blackroad-os-web');

    const limited = queryDeployHistory({ limit: 1 }, logPath);
    expect(limited).toHaveLength(1);
  });
});
