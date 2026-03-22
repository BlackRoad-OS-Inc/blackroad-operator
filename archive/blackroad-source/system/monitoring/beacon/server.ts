/**
 * BlackRoad OS Beacon Service
 * System monitoring and beacon service
 */

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', cors());

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'blackroad-os-beacon',
    timestamp: new Date().toISOString(),
  });
});

app.get('/version', (c) => {
  return c.json({
    service: 'blackroad-os-beacon',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
  });
});

app.get('/', (c) => {
  return c.json({
    service: 'blackroad-os-beacon',
    description: 'System monitoring and beacon service',
    status: 'operational',
    endpoints: ['/health', '/version'],
  });
});

const port = parseInt(process.env.PORT || '8000', 10);
console.log(`🖤 BlackRoad OS Beacon Service`);
console.log(`   Running on http://localhost:${port}`);
console.log(`   Health check: GET /health\n`);

serve({
  fetch: app.fetch,
  port,
});
