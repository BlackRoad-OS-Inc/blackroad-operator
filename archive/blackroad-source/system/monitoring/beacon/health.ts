import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const packageJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8'));

const router = Router();

router.get('/', (req, res) => {
  res.json({
    ok: true,
    service: 'blackroad-os-beacon',
    env: process.env.NODE_ENV || 'development',
    version: packageJson.version,
  });
});

export default router;
