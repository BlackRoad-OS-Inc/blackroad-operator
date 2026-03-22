import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { getGateStatus } from '../src/services/gate.js';

async function writeJson(target: string, value: unknown): Promise<void> {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, JSON.stringify(value, null, 2));
}

async function createFixture(granted: string[]): Promise<{ root: string; cleanup: () => Promise<void> }> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'gate-fixture-'));
  const casesDir = path.join(root, 'demo', 'cases');
  await fs.mkdir(casesDir, { recursive: true });
  await writeJson(path.join(casesDir, 'case-good.json'), {
    label: 'good',
    rules: [{ id: 'demo.rule', level: 'pass' }],
    warnings: [],
    violations: [],
  });
  await writeJson(path.join(casesDir, 'case-borderline.json'), {
    label: 'borderline',
    rules: [{ id: 'demo.rule', level: 'warn' }],
    warnings: [{ rule: 'demo.rule', message: 'borderline' }],
    violations: [],
  });
  await writeJson(path.join(root, 'config', 'approvals.json'), {
    staging: ['qa-signoff'],
    production: ['platform-lead'],
  });
  await writeJson(path.join(root, 'data', 'metrics', 'status.json'), {
    contract: 'green',
    observability: 'green',
  });
  await writeJson(path.join(root, 'data', 'tests', 'commit-1.json'), {
    unit: 'green',
    ui: 'green',
    opa: 'green',
  });
  await writeJson(path.join(root, 'data', 'approvals', 'commit-1.json'), {
    granted,
  });
  const cleanup = async () => {
    await fs.rm(root, { recursive: true, force: true });
  };
  return { root, cleanup };
}

test('gatekeeper reports ready when gates are green', async (t) => {
  const previous = process.env.PRISM_CONSOLE_ROOT;
  const fixture = await createFixture(['qa-signoff']);
  process.env.PRISM_CONSOLE_ROOT = fixture.root;
  t.after(async () => {
    process.env.PRISM_CONSOLE_ROOT = previous;
    await fixture.cleanup();
  });

  const status = await getGateStatus({ commit: 'commit-1', env: 'staging' });
  assert.equal(status.ready, true);
  assert.deepEqual(status.reasons, []);
  assert.equal(status.policy.pass, true);
  assert.equal(status.policy.violations, 0);
  assert.equal(status.tests.unit, 'green');
  assert.equal(status.metrics.contract, 'green');
  assert.deepEqual(status.approvals.pending, []);
});

test('gatekeeper lists missing approvals when pending', async (t) => {
  const previous = process.env.PRISM_CONSOLE_ROOT;
  const fixture = await createFixture([]);
  process.env.PRISM_CONSOLE_ROOT = fixture.root;
  t.after(async () => {
    process.env.PRISM_CONSOLE_ROOT = previous;
    await fixture.cleanup();
  });

  const status = await getGateStatus({ commit: 'commit-1', env: 'staging' });
  assert.equal(status.ready, false);
  assert.ok(status.reasons.includes('approval:qa-signoff pending'));
  assert.deepEqual(status.approvals.pending, ['qa-signoff']);
});
