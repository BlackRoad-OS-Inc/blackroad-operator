import assert from 'node:assert';
import { test } from 'node:test';
import { generateAttestationBundle, verifyAttestationBundle } from '../../../../attest/attest.js';

const baseOptions = {
  inputs: { text: 'Vendor disclosed a potential violation.' },
  prompt: 'Evaluate risk.',
  model: 'gpt-4o',
  policy: { name: 'Prism Default', version: '2024.09' },
  decisions: { compliant: false, riskScore: 0.75, reasons: ['matched:red flag'] },
  evaluatedAt: '2024-01-01T00:00:00.000Z'
};

test('bundle generation is deterministic for same inputs', async () => {
  process.env.ATTEST_SEED = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const first = await generateAttestationBundle({
    ...baseOptions,
    metadata: { bundleId: 'demo', fixedTimestamp: '2024-01-01T01:00:00.000Z', disablePqc: true, usePlainReport: true }
  });
  const second = await generateAttestationBundle({
    ...baseOptions,
    metadata: { bundleId: 'demo', fixedTimestamp: '2024-01-01T01:00:00.000Z', disablePqc: true, usePlainReport: true }
  });
  assert.strictEqual(first.bundleHash, second.bundleHash);
  assert.deepStrictEqual(first.signatures.ed25519.publicKey, second.signatures.ed25519.publicKey);
});

test('ed25519 signature verifies', async () => {
  process.env.ATTEST_SEED = 'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210';
  const result = await generateAttestationBundle({
    ...baseOptions,
    metadata: { fixedTimestamp: '2024-01-02T00:00:00.000Z', disablePqc: true, usePlainReport: true }
  });
  const verification = await verifyAttestationBundle(result.bundlePath);
  assert.equal(verification.valid, true);
  assert.equal(verification.manifest.bundle.hash, result.bundleHash);
});

test('pqc unavailable path recorded', async () => {
  delete process.env.OQS_CLI;
  const bundle = await generateAttestationBundle({
    ...baseOptions,
    metadata: { fixedTimestamp: '2024-01-03T00:00:00.000Z', disablePqc: true, usePlainReport: true }
  });
  assert.equal(bundle.signatures.pqc.mode, 'disabled');
});
