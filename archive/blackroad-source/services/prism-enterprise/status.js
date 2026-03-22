import express from 'express';
import os from 'node:os';
import process from 'node:process';

import config from '../config/appConfig.js';

const router = express.Router();

const CHECKS = [
  {
    name: 'core-http',
    description: 'Primary heartbeat endpoint for Prism Console.',
    endpoint: '/health',
    status: 'pass',
    latencyMs: 12,
  },
  {
    name: 'agent-services',
    description: 'Agent orchestration APIs responding with registry data.',
    endpoint: '/api/agents',
    status: 'warn',
    latencyMs: null,
  },
  {
    name: 'roadcoin-ledger',
    description: 'RoadCoin settlement pipeline exposed to the console.',
    endpoint: '/api/roadcoin',
    status: 'pending',
    latencyMs: null,
  },
];

router.get('/health', (_req, res) => {
  const generatedAt = new Date();
  const memory = process.memoryUsage();
  const load = os.loadavg();
  const cpuCount = Math.max(os.cpus().length, 1);
  const uptimeSeconds = Number(process.uptime().toFixed(1));

  res.json({
    service: 'prism-console',
    environment: config.env,
    generatedAt: generatedAt.toISOString(),
    host: os.hostname(),
    nodeVersion: process.version,
    uptimeSeconds,
    checks: CHECKS,
    metrics: {
      memory: {
        rssBytes: memory.rss,
        heapUsedBytes: memory.heapUsed,
      },
      cpu: {
        cores: cpuCount,
        load1: Number(load[0]?.toFixed(2) ?? '0'),
        utilizationPercent: Number(((load[0] / cpuCount) * 100).toFixed(1)),
      },
      process: {
        pid: process.pid,
        uptimeSeconds,
      },
    },
  });
});

export default router;
