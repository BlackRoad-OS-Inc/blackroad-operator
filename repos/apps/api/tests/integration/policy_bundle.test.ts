import assert from 'node:assert';
import express from 'express';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { after, before, test } from 'node:test';
import policy from '../../src/routes/policy.ts';
import attestRoutes from '../../src/routes/attest.ts';
import { verifyAttestationBundle } from '../../../../attest/attest.js';

let server;
let baseUrl = '';
let storageDir = '';

before(async () => {
  storageDir = await mkdtemp(path.join(tmpdir(), 'attest-store-'));
  process.env.ATTEST_STORAGE_DIR = storageDir;
  process.env.ATTEST_SEED = '1111111111111111111111111111111111111111111111111111111111111111';
  process.env.ATTEST_PLAIN_REPORT = '1';
  const app = express();
  app.use(express.json());
  app.use('/api/policy', policy);
  app.use('/api/attest', attestRoutes);
  server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  if (server) {
    await new Promise(resolve => server.close(resolve));
  }
  if (storageDir) {
    await rm(storageDir, { recursive: true, force: true });
  }
});

test('policy evaluate with bundle', async () => {
  const response = await fetch(`${baseUrl}/api/policy/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-PQC': 'off' },
    body: JSON.stringify({
      inputs: { text: 'Vendor disclosed a red flag but remediation pending.' },
      prompt: 'Assess vendor incident.',
      model: 'gpt-4o',
      policy: 'Prism Default',
      policyVersion: '2024.09',
      bundle: true
    })
  });
  assert.equal(response.status, 200);
  const json = await response.json();
  assert.equal(json.ok, true);
  assert.ok(json.bundle?.url);
  assert.equal(json.bundle?.signatures?.pqc?.mode, 'disabled');
  const bundleRes = await fetch(`${baseUrl}${json.bundle.url}`);
  assert.equal(bundleRes.status, 200);
  const buffer = Buffer.from(await bundleRes.arrayBuffer());
  const tempDir = await mkdtemp(path.join(tmpdir(), 'attest-bundle-'));
  const bundlePath = path.join(tempDir, 'bundle.tgz');
  await writeFile(bundlePath, buffer);
  const verification = await verifyAttestationBundle(bundlePath);
  assert.equal(verification.valid, true);
  assert.equal(verification.hash, json.bundle.sha256);
  await rm(tempDir, { recursive: true, force: true });
});
