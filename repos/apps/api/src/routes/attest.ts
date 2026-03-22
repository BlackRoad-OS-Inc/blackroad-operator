import { Router } from 'express';
import { incrementAttestBundle, type AttestStatus, type PqcMode } from '../metrics/metrics.js';
import { notifyAttest } from '../services/slack.js';

interface AttestRequestBody {
  status?: AttestStatus;
  pqc?: PqcMode;
  reason?: string;
  bundleUrl?: string;
}

const router = Router();

router.post('/bundle', (req, res) => {
  const body = req.body as AttestRequestBody | undefined;
  const status = normalizeStatus(body?.status);
  const pqc = normalizePqc(body?.pqc);
  const reason = typeof body?.reason === 'string' ? body.reason : undefined;
  incrementAttestBundle(status, pqc);
  void notifyAttest({ status, pqc, reason, bundleUrl: body?.bundleUrl });
  const response = { ok: status === 'ok', status, pqc };
  if (status === 'fail') {
    return res.status(502).json({ ...response, reason: reason ?? 'no details' });
  }
  return res.json(response);
});

function normalizeStatus(value: AttestStatus | undefined): AttestStatus {
  return value === 'fail' ? 'fail' : 'ok';
}

function normalizePqc(value: PqcMode | undefined): PqcMode {
  if (value === 'on' || value === 'off') {
    return value;
  }
  return 'unavailable';
}
import { mkdtemp, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import {
  buildEvidenceBundle,
  verifyEvidenceBundleFromPath,
  getBundlePath
} from '../services/attest.js';

const router = Router();

router.get('/bundles/:bundleId', async (req, res) => {
  try {
    const target = getBundlePath(req.params.bundleId);
    await stat(target);
    res.sendFile(path.resolve(target));
  } catch (err) {
    res.status(404).json({ ok: false, error: 'bundle_not_found' });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { bundleBase64, bundleUrl } = req.body || {};
    let buffer = null;
    if (typeof bundleBase64 === 'string') {
      buffer = Buffer.from(bundleBase64, 'base64');
    } else if (typeof bundleUrl === 'string' && bundleUrl.length > 0) {
      const response = await fetch(bundleUrl);
      if (!response.ok) {
        return res.status(400).json({ ok: false, error: 'bundle_fetch_failed' });
      }
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    if (!buffer) {
      return res.status(400).json({ ok: false, error: 'bundle_missing' });
    }

    const tmpDir = await mkdtemp(path.join(tmpdir(), 'attest-verify-'));
    const filePath = path.join(tmpDir, 'bundle.tgz');
    await writeFile(filePath, buffer);
    const result = await verifyEvidenceBundleFromPath(filePath);
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'verify_failed', message: err instanceof Error ? err.message : String(err) });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const payload = req.body || {};
    const result = await buildEvidenceBundle(payload);
    res.json({
      ok: true,
      bundle: {
        url: result.url,
        sha256: result.bundleHash,
        signatures: result.signatures
      },
      manifest: result.manifest
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'generate_failed', message: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
