/* FILE: /var/www/blackroad/src/server.js */
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';
import process from 'node:process';

import config from './config/appConfig.js';
import aiderRouter from './routes/aider.js';
import musicRouter from './routes/music.js';
import roadcoinRouter from './routes/roadcoin.js';
import statusRouter from './routes/status.js';

const logger = pino({ level: config.logLevel });

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  if (config.trustProxy) {
    app.set('trust proxy', config.trustProxy);
  }

  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => req.id || randomUUID(),
      customAttributeKeys: {
        req: 'request',
        res: 'response',
        err: 'error'
      }
    })
  );

  if (config.security.enableCors) {
    app.use(cors({ origin: config.corsOrigin, credentials: true }));
  }

  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: config.jsonLimit }));
  app.use(express.urlencoded({ extended: true, limit: config.jsonLimit }));

  const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/api', apiLimiter);

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.get('/healthz', (_req, res) => res.json({ ok: true }));

  app.use('/api/aider', aiderRouter);
  app.use('/api/music', musicRouter);
  app.use('/api/roadcoin', roadcoinRouter);
  app.use('/api/status', statusRouter);

  app.use(
    '/media',
    express.static(config.music.directory, {
      fallthrough: false,
      maxAge: '1h',
      setHeaders: (res) => {
        res.setHeader('Cache-Control', 'public, max-age=3600');
      }
    })
  );

  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', requestId: req.id });
  });

  app.use((err, req, res, _next) => {
    req.log?.error({ err }, 'unhandled error');
    const status = err.status || err.statusCode || 500;
    const message = status >= 500 ? 'Internal Server Error' : err.message;
    res.status(status).json({ error: message, requestId: req.id });
  });

  return app;
}

export function startServer(customApp = createApp()) {
  const server = customApp.listen(config.port, config.host, () => {
    logger.info(`listening on ${config.host}:${config.port}`);
  });
  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
