import { Router } from 'express';
import type { GateCheckInput, GateCheckState, GateEnvironment, GateStatusInput } from '../types/gate.js';
import { getGateStatus, upsertGateCheck } from '../services/gate.js';

const router = Router();

function parseEnvironment(value: unknown): GateEnvironment | null {
  if (typeof value !== 'string') {
    return null;
  }
  const normalised = value.toLowerCase();
  if (normalised === 'preview' || normalised === 'staging' || normalised === 'production') {
    return normalised;
  }
  return null;
}

function parseCommit(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseStatus(value: unknown): GateCheckState | null {
  if (typeof value !== 'string') {
    return null;
  }
  const normalised = value.toLowerCase();
  if (normalised === 'success' || normalised === 'failure' || normalised === 'neutral') {
    return normalised;
  }
  return null;
}

router.get('/status', async (req, res, next) => {
  try {
    const commit = parseCommit(req.query.commit);
    const env = parseEnvironment(req.query.env) ?? 'preview';
    if (!commit) {
      return res.status(400).json({ error: 'invalid_commit' });
    }
    const input: GateStatusInput = { commit, env };
    const status = await getGateStatus(input);
    return res.json(status);
  } catch (error) {
    return next(error);
  }
});

router.post('/checks', async (req, res, next) => {
  try {
    const commit = parseCommit(req.body?.commit);
    const name = typeof req.body?.name === 'string' && req.body.name.trim() ? req.body.name.trim() : null;
    const status = parseStatus(req.body?.status);
    const summary = typeof req.body?.summary === 'string' ? req.body.summary : undefined;
    if (!commit || !name || !status) {
      return res.status(400).json({ error: 'invalid_payload' });
    }
    const input: GateCheckInput = { commit, name, status, summary };
    const result = await upsertGateCheck(input);
    return res.status(result.ok ? 200 : 202).json(result);
  } catch (error) {
    return next(error);
  }
});

export default router;
