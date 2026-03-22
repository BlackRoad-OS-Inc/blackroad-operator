import { Router } from 'express';
import { collectAllBeacons } from '../lib/sigBeacon';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const services = await collectAllBeacons();
    res.json({ ok: true, services });
  } catch (error) {
    res.status(500).json({ ok: false, error: (error as Error).message });
  }
});

export default router;
