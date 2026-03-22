import { createHash, randomUUID } from 'node:crypto';
import { mkdtemp, readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { renderReport } from './pdf/report.js';

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const VERSION_FILE = path.join(MODULE_DIR, 'VERSION');

function stable(value) {
  if (Array.isArray(value)) {
    return value.map(stable);
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) {
      const v = value[key];
      if (v === undefined) continue;
      out[key] = stable(v);
    }
    return out;
  }
  return value;
}

function stableStringify(value) {
  return JSON.stringify(stable(value));
}

async function loadVersion() {
  try {
    return (await readFile(VERSION_FILE, 'utf-8')).trim();
  } catch (err) {
    return '0.0.0';
  }
}

function hashesFor(inputs, prompt) {
  const hash = createHash('sha256');
  hash.update(Buffer.from(stableStringify(inputs ?? {})));
  const promptHash = createHash('sha256').update(Buffer.from(String(prompt ?? ''))).digest('hex');
  return {
    inputs: hash.digest('hex'),
    prompt: promptHash
  };
}

function canonicalManifest(manifest) {
  const copy = JSON.parse(JSON.stringify(manifest));
  delete copy.signatures;
  if (copy.bundle) {
    delete copy.bundle.hash;
  }
  return stable(copy);
}

function bundleHashFrom(manifest, pdfBuffer) {
  const canonical = canonicalManifest(manifest);
  const manifestBuffer = Buffer.from(stableStringify(canonical));
  const h = createHash('sha256');
  h.update(manifestBuffer);
  h.update(pdfBuffer);
  return {
    hashHex: h.digest('hex'),
    manifestBuffer
  };
}

const baseRequire = createRequire(import.meta.url);

async function requireEd25519() {
  try {
    return await import('@noble/ed25519');
  } catch (err) {
    const altRequire = createRequire(new URL('../apps/api/package.json', import.meta.url));
    const resolved = altRequire.resolve('@noble/ed25519');
    return await import(resolved);
  }
}

function normalizeSeed(seedHex) {
  const hex = (seedHex || '').toLowerCase().replace(/[^0-9a-f]/g, '');
  return hex.padEnd(64, '0').slice(0, 64);
}

async function derivePublicKey(seedHex) {
  const { getPublicKey } = await requireEd25519();
  const seed = Buffer.from(normalizeSeed(seedHex), 'hex');
  const pk = await getPublicKey(seed);
  return Buffer.from(pk).toString('base64');
}

async function signEd(hashHex, seedHex) {
  const { sign } = await requireEd25519();
  const seed = Buffer.from(normalizeSeed(seedHex), 'hex');
  const sig = await sign(Buffer.from(hashHex, 'hex'), seed);
  return Buffer.from(sig).toString('base64');
}

async function verifyEd(hashHex, signatureB64, publicKeyB64) {
  const { verify } = await requireEd25519();
  const sig = Buffer.from(signatureB64, 'base64');
  const pk = Buffer.from(publicKeyB64, 'base64');
  return await verify(sig, Buffer.from(hashHex, 'hex'), pk);
}

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function runTar(args) {
  await new Promise((resolve, reject) => {
    const proc = spawn('tar', args);
    proc.on('error', reject);
    proc.on('exit', code => (code === 0 ? resolve(undefined) : reject(new Error(`tar exited with ${code}`))));
  });
}

async function pqcSignCanonical(manifest, pdfBuffer) {
  const cli = process.env.OQS_CLI;
  if (!cli) {
    return { mode: 'unavailable' };
  }
  const tmp = await mkdtemp(path.join(tmpdir(), 'attest-pqc-'));
  const manifestPath = path.join(tmp, 'manifest.json');
  const reportPath = path.join(tmp, 'report.pdf');
  const { manifestBuffer } = bundleHashFrom(manifest, pdfBuffer);
  await writeFile(manifestPath, Buffer.concat([manifestBuffer, Buffer.from('\n')]));
  await writeFile(reportPath, pdfBuffer);
  const tarPath = path.join(tmp, 'bundle.tgz');
  try {
    await runTar(['-czf', tarPath, '-C', tmp, 'manifest.json', 'report.pdf']);
    const sigPath = `${tarPath}.sig`;
    await new Promise((resolve, reject) => {
      const proc = spawn(cli, ['sig', 'default', '--in', tarPath, '--out', sigPath]);
      proc.on('error', reject);
      proc.on('exit', code => (code === 0 ? resolve(undefined) : reject(new Error(`oqs cli exited ${code}`))));
    });
    const sig = await readFile(sigPath);
    return { mode: 'signed', algorithm: 'default', signature: sig.toString('base64') };
  } catch (err) {
    return { mode: 'error', message: err instanceof Error ? err.message : String(err) };
  }
}

export async function generateAttestationBundle(options) {
  const {
    inputs = {},
    prompt = '',
    model = 'unknown',
    policy = { name: 'default', version: '0' },
    decisions = {},
    evaluatedAt = new Date().toISOString(),
    workspace,
    metadata = {}
  } = options || {};
  const disablePqc = metadata?.disablePqc === true;
  const usePlainReport = metadata?.usePlainReport === true;
  const bundledAt = metadata?.fixedTimestamp
    ? new Date(metadata.fixedTimestamp).toISOString()
    : new Date().toISOString();

  const version = await loadVersion();
  const dir = workspace || (await mkdtemp(path.join(tmpdir(), 'attest-')));
  await ensureDir(dir);

  const manifestPath = path.join(dir, 'manifest.json');
  const reportPath = path.join(dir, 'report.pdf');

  const hashes = hashesFor(inputs, prompt);
  const bundleId = metadata.bundleId || randomUUID();

  const manifest = {
    version,
    bundle: {
      id: bundleId,
      hash: '',
      artifacts: {
        manifest: path.basename(manifestPath),
        report: path.basename(reportPath)
      }
    },
    inputs,
    model: {
      name: model,
      prompt,
      promptHash: hashes.prompt
    },
    policy,
    decisions,
    timestamps: {
      evaluatedAt,
      bundledAt
    },
    hashes,
    signatures: {}
  };

  const placeholderReport = usePlainReport
    ? Buffer.from('report-placeholder')
    : await renderReport({
        bundleId,
        bundleHash: '',
        policyName: policy.name,
        policyVersion: policy.version,
        evaluatedAt,
        signedAt: manifest.timestamps.bundledAt,
        ed25519: { publicKey: 'pending' },
        pqc: { mode: 'unavailable' },
        promptHash: hashes.prompt,
        inputHash: hashes.inputs
      });

  const seed = process.env.ATTEST_SEED || ''.padEnd(64, '0');
  const publicKey = await derivePublicKey(seed);
  const signedAt = bundledAt;

  let finalReport = usePlainReport
    ? Buffer.from(`bundle:${bundleId}`)
    : await renderReport({
        bundleId,
        bundleHash: '',
        policyName: policy.name,
        policyVersion: policy.version,
        evaluatedAt,
        signedAt,
        ed25519: { publicKey },
        pqc: { mode: 'unavailable' },
        promptHash: hashes.prompt,
        inputHash: hashes.inputs
      });

  const pqc = disablePqc ? { mode: 'disabled' } : await pqcSignCanonical(manifest, finalReport);
  manifest.signatures.pqc = pqc;

  if (!usePlainReport && !disablePqc && pqc?.mode && pqc.mode !== 'unavailable') {
    finalReport = await renderReport({
      bundleId,
      bundleHash: '',
      policyName: policy.name,
      policyVersion: policy.version,
      evaluatedAt,
      signedAt,
      ed25519: { publicKey },
      pqc,
      promptHash: hashes.prompt,
      inputHash: hashes.inputs
    });
  }

  await writeFile(manifestPath, `${stableStringify(manifest)}\n`);
  await writeFile(reportPath, finalReport);

  const canonical = bundleHashFrom(manifest, finalReport);
  const bundleHash = canonical.hashHex;
  manifest.bundle.hash = bundleHash;
  manifest.signatures.ed25519 = {
    publicKey,
    signature: await signEd(bundleHash, seed),
    signedAt
  };

  await writeFile(manifestPath, `${stableStringify(manifest)}\n`);
  await writeFile(reportPath, finalReport);

  const bundleName = `${bundleId}.tgz`;
  const bundlePath = path.join(dir, bundleName);
  await runTar(['-czf', bundlePath, '-C', dir, path.basename(manifestPath), path.basename(reportPath)]);

  return {
    manifest,
    manifestPath,
    reportPath,
    bundlePath,
    signatures: manifest.signatures,
    bundleHash
  };
}

export async function verifyAttestationBundle(bundlePath) {
  const tmp = await mkdtemp(path.join(tmpdir(), 'attest-verify-'));
  await runTar(['-xzf', bundlePath, '-C', tmp]);
  const manifestPath = path.join(tmp, 'manifest.json');
  const reportPath = path.join(tmp, 'report.pdf');
  const manifestBuf = await readFile(manifestPath, 'utf-8');
  const reportBuf = await readFile(reportPath);
  const manifest = JSON.parse(manifestBuf);
  const { hashHex } = bundleHashFrom(manifest, reportBuf);
  const reasons = [];
  if (hashHex !== manifest.bundle?.hash) {
    reasons.push('hash-mismatch');
  }
  const ed = manifest.signatures?.ed25519;
  let edValid = false;
  if (ed?.signature && ed?.publicKey) {
    edValid = await verifyEd(hashHex, ed.signature, ed.publicKey);
    if (!edValid) reasons.push('ed25519-invalid');
  } else {
    reasons.push('ed25519-missing');
  }
  return {
    valid: reasons.length === 0,
    reasons,
    hash: hashHex,
    manifest,
    edValid
  };
}
