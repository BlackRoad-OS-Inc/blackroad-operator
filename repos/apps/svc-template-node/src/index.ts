import http from 'http';

import { loadConfig } from './config';
import { createLogger } from './logger';
import { createApp } from './server';
import { initTracing, shutdownTracing } from './tracing';

const config = loadConfig();
const logger = createLogger(config.LOG_LEVEL);

initTracing(config).catch((error) => {
  logger.error({ event: 'otel_init_failed', error });
});

const app = createApp(config);
const server = http.createServer(app);

server.listen(config.PORT, () => {
  logger.info({ event: 'server_started', port: config.PORT });
});

const gracefulShutdown = async (signal: string) => {
  logger.info({ event: 'shutdown_signal', signal });
  await shutdownTracing();
  server.close((error) => {
    if (error) {
      logger.error({ event: 'shutdown_error', error: error.message });
      process.exit(1);
    }
    logger.info({ event: 'shutdown_complete' });
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
