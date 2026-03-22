import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { fetch } from 'undici';

import type { AppConfig } from './config';
import { loadConfig } from './config';
import { createLogger } from './logger';
import { metricsMiddleware, metricsRouter } from './metrics';

const checkDependency = async (url: string) => {
  try {
    const response = await fetch(url);
    return { url, ok: response.ok, status: response.status };
  } catch (error) {
    return { url, ok: false, error: (error as Error).message };
  }
};

export const createApp = (config: AppConfig = loadConfig()) => {
  const logger = createLogger(config.LOG_LEVEL);
  const app = express();

  app.set('config', config);

  app.use(helmet());
  app.use(express.json());
  app.use(
    pinoHttp({
      logger,
      customSuccessMessage: () => 'request_completed',
      customErrorMessage: () => 'request_failed',
    })
  );
  app.use(metricsMiddleware);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', build_sha: config.BUILD_SHA });
  });

  app.get('/live', (_req, res) => {
    res.json({ status: 'alive' });
  });

  app.get('/ready', async (_req, res) => {
    const results = await Promise.all(config.READINESS_DEPENDENCIES.map((url) => checkDependency(url)));
    const failing = results.filter((result) => !result.ok);
    if (failing.length > 0) {
      res.status(503).json({ status: 'not_ready', dependencies: results });
      return;
    }
    res.json({ status: 'ready', dependencies: results });
  });

  app.use(metricsRouter);

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    void _next;
    logger.error({ event: 'unhandled_error', err: err.message });
    res.status(500).json({ error: 'internal_server_error' });
  });

  return app;
};
