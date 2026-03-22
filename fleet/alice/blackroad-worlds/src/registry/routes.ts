import { Hono } from 'hono';
import { registry } from './registry';
import type { AgentEntry } from './registry';

const app = new Hono();

app.get('/agents', (c) => c.json(registry.list()));
app.get('/agents/:id', (c) => {
  const agent = registry.get(c.req.param('id'));
  if (!agent) return c.json({ error: 'Agent not found' }, 404);
  return c.json(agent);
});

app.post('/agents', async (c) => {
  const body = await c.req.json<Omit<AgentEntry, 'status' | 'lastHeartbeat'>>();
  if (!body.id || !body.name || !body.capabilities) {
    return c.json({ error: 'Missing required fields: id, name, capabilities' }, 400);
  }
  return c.json(registry.register(body), 201);
});

app.delete('/agents/:id', (c) => {
  if (!registry.unregister(c.req.param('id'))) return c.json({ error: 'Agent not found' }, 404);
  return c.json({ ok: true });
});

app.post('/agents/:id/heartbeat', (c) => {
  if (!registry.heartbeat(c.req.param('id'))) return c.json({ error: 'Agent not found' }, 404);
  return c.json({ ok: true });
});

app.patch('/agents/:id/status', async (c) => {
  const { status } = await c.req.json<{ status: AgentEntry['status'] }>();
  if (!registry.setStatus(c.req.param('id'), status)) return c.json({ error: 'Agent not found' }, 404);
  return c.json({ ok: true });
});

app.get('/agents/capability/:cap', (c) => c.json(registry.findByCapability(c.req.param('cap'))));

app.get('/agents/events', (c) => {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      registry.on('agent:registered', (a) => send('registered', a));
      registry.on('agent:unregistered', (a) => send('unregistered', a));
      registry.on('agent:status', (d) => send('status', d));
      registry.on('agent:timeout', (a) => send('timeout', a));
      send('snapshot', registry.list());
    },
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
  });
});

app.get('/health', (c) => c.json({
  status: 'healthy',
  agents: registry.list().length,
  online: registry.list().filter(a => a.status === 'online').length,
  timestamp: new Date().toISOString(),
}));

export { app as registryRoutes };
