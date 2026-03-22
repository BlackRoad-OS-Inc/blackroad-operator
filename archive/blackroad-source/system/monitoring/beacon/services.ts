import { Router } from 'express';
import { getServices } from '../lib/servicesRegistry';

const router = Router();

router.get('/', (_req, res) => {
  try {
    const services = getServices();
    res.json({ ok: true, services });
  } catch (error) {
    res.status(500).json({ ok: false, error: (error as Error).message });
  }
});

export default router;
