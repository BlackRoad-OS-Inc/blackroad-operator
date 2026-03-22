import { Router } from 'express';
import { appendDeployRecord, queryDeployHistory } from '../lib/sigDeployLog';

const router = Router();

router.get('/', (req, res) => {
  const { service, env, limit } = req.query;

  try {
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : undefined;
    const history = queryDeployHistory({
      service: typeof service === 'string' ? service : undefined,
      env: typeof env === 'string' ? env : undefined,
      limit: Number.isNaN(parsedLimit) ? undefined : parsedLimit,
    });
    res.json({ ok: true, deploys: history });
  } catch (error) {
    res.status(500).json({ ok: false, error: (error as Error).message });
  }
});

router.post('/', (req, res) => {
  try {
    appendDeployRecord(req.body);
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ ok: false, error: (error as Error).message });
  }
});

export default router;
