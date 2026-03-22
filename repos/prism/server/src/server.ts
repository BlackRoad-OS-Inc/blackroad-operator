import Fastify from 'fastify';
import cors from '@fastify/cors';
import path from 'path';
import eventsRoutes from './routes/events';
import diffsRoutes from './routes/diffs';
import policyRoutes from './routes/policy';
import healthRoutes from './routes/health';
import intelligenceRoutes from './routes/intelligence';
import intelRoutes from './routes/intel';
import graphRoutes from './routes/graph';
import runRoutes from './routes/run';
import approvalsRoutes from './routes/approvals';
import bridgePlugin from './bridge/prism-bridge';
import { initDb } from './db/sqlite';

export async function createServer(dbPath = path.resolve(process.cwd(), '../data/prism.sqlite')) {
  initDb(dbPath);
  const app = Fastify();
  await app.register(cors, { origin: true });
  await app.register(eventsRoutes);
  await app.register(diffsRoutes);
  await app.register(policyRoutes);
  await app.register(runRoutes);
  await app.register(approvalsRoutes);
  await app.register(healthRoutes);
  await app.register(bridgePlugin);
  await app.register(intelligenceRoutes);
  await app.register(intelRoutes);
  await app.register(graphRoutes);
  return app;
}

