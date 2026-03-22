import { mkdtemp, readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';

const moduleCandidates = [
  new URL('../../attest/attest.js', import.meta.url),
  new URL('../../../attest/attest.js', import.meta.url),
  new URL('../../../../attest/attest.js', import.meta.url)
];

const attestModulePromise = (async () => {
  for (const candidate of moduleCandidates) {
    try {
      return await import(candidate.href);
    } catch (err) {
      const code = err && typeof err === 'object' ? Reflect.get(err, 'code') : null;
      if (code !== 'ERR_MODULE_NOT_FOUND') {
        throw err;
      }
    }
  }
  throw new Error('attestation module not found');
})();
const STORAGE_DIR = path.resolve(
  process.env.ATTEST_STORAGE_DIR || path.join(process.cwd(), 'var/attest/bundles')
);

async function ensureStorage() {
  await mkdir(STORAGE_DIR, { recursive: true });
}

export async function buildEvidenceBundle(payload) {
  const module = await attestModulePromise;
  await ensureStorage();
  const workspace = await mkdtemp(path.join(tmpdir(), 'attest-api-'));
  const result = await module.generateAttestationBundle({ ...payload, workspace });
  const bundleId = path.basename(result.bundlePath);
  const destBundle = path.join(STORAGE_DIR, bundleId);
  await copyFile(result.bundlePath, destBundle);
  return {
    ...result,
    bundlePath: destBundle,
    url: `/api/attest/bundles/${bundleId}`
  };
}

export async function verifyEvidenceBundleFromPath(bundlePath) {
  const module = await attestModulePromise;
  return await module.verifyAttestationBundle(bundlePath);
}

export async function writeBufferToBundle(buffer, filename) {
  await ensureStorage();
  const dest = path.join(STORAGE_DIR, filename);
  await writeFile(dest, buffer);
  return dest;
}

export async function readBundleFile(filename) {
  const filePath = path.join(STORAGE_DIR, filename);
  return await readFile(filePath);
}

export function getBundlePath(filename) {
  return path.join(STORAGE_DIR, filename);
}
