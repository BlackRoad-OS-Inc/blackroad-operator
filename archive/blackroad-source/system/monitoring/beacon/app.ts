import express from 'express';
import dotenv from 'dotenv';
import healthRouter from './routes/health';
import beaconRouter from './routes/beacon';
import servicesRouter from './routes/services';
import deploysRouter from './routes/deploys';

dotenv.config();

export const createApp = () => {
  const app = express();
  app.use(express.json());

  app.use('/health', healthRouter);
  app.use('/beacon', beaconRouter);
  app.use('/services', servicesRouter);
  app.use('/deploys', deploysRouter);

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({ ok: false, error: err.message });
  });

  return app;
};

if (require.main === module) {
  const app = createApp();
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`blackroad-os-beacon listening on port ${port}`);
  });
}
