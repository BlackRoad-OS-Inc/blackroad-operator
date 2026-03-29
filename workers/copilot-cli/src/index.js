// BlackRoad Copilot CLI v2.0.0 — Mesh Coordinator
// Task claiming, agent registry, broadcast, health dashboard

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' };
function json(data, status = 200) { return new Response(JSON.stringify(data, null, 2), { status, headers: { 'Content-Type': 'application/json', ...CORS } }); }

function requireAuth(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace('Bearer ', '').trim();
  return !env.AUTH_TOKEN || token === env.AUTH_TOKEN;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    if (method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    // Health
    if (method === 'GET' && path === '/health') {
      return json({ ok: true, instance: env.INSTANCE_ID || 'copilot-cli', role: env.MESH_ROLE || 'coordinator', version: '2.0.0', ts: new Date().toISOString() });
    }

    // Status
    if (method === 'GET' && path === '/status') {
      let heartbeat = null;
      if (env.INBOX) {
        const raw = await env.INBOX.get('__heartbeat__');
        if (raw) heartbeat = JSON.parse(raw);
      }
      const keys = env.INBOX ? await env.INBOX.list() : { keys: [] };
      const inbox = keys.keys.filter(k => !k.name.startsWith('__'));
      const tasks = keys.keys.filter(k => k.name.startsWith('task-'));
      const agents = keys.keys.filter(k => k.name.startsWith('agent-'));
      return json({
        instance: env.INSTANCE_ID || 'copilot-cli', role: env.MESH_ROLE || 'coordinator', status: 'ONLINE',
        inbox_count: inbox.length, task_count: tasks.length, agent_count: agents.length,
        last_heartbeat: heartbeat?.ts || null, ts: new Date().toISOString(),
      });
    }

    // ── Inbox ──
    if (method === 'POST' && path === '/inbox') {
      if (!requireAuth(request, env)) return json({ error: 'Unauthorized' }, 401);
      let body; try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
      if (!body.from || !body.msg) return json({ error: 'from + msg required' }, 400);
      const key = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      if (env.INBOX) await env.INBOX.put(key, JSON.stringify({ ...body, key, received_at: new Date().toISOString() }), { expirationTtl: 86400 });
      return json({ ok: true, key });
    }
    if (method === 'GET' && path === '/inbox') {
      if (!requireAuth(request, env)) return json({ error: 'Unauthorized' }, 401);
      if (!env.INBOX) return json({ messages: [] });
      const list = await env.INBOX.list({ prefix: 'msg-' });
      const msgs = [];
      for (const k of list.keys) {
        const val = await env.INBOX.get(k.name);
        if (val) msgs.push(JSON.parse(val));
      }
      return json({ count: msgs.length, messages: msgs });
    }
    if (method === 'DELETE' && path === '/inbox') {
      if (!requireAuth(request, env)) return json({ error: 'Unauthorized' }, 401);
      if (!env.INBOX) return json({ ok: true, deleted: 0 });
      const list = await env.INBOX.list({ prefix: 'msg-' });
      for (const k of list.keys) await env.INBOX.delete(k.name);
      return json({ ok: true, deleted: list.keys.length });
    }

    // ── Tasks ──
    if (method === 'POST' && path === '/task') {
      if (!requireAuth(request, env)) return json({ error: 'Unauthorized' }, 401);
      let body; try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
      const task = {
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        from: env.INSTANCE_ID || 'copilot-cli',
        title: body.title || 'Untitled', description: body.description || '',
        priority: body.priority || 'normal', tags: body.tags || [],
        status: 'available', claimed_by: null, result: null,
        posted_at: new Date().toISOString(), claimed_at: null, completed_at: null,
      };
      if (env.INBOX) await env.INBOX.put(task.id, JSON.stringify(task), { expirationTtl: 604800 });
      return json({ ok: true, task });
    }

    // List tasks with filters
    if (method === 'GET' && path === '/tasks') {
      if (!env.INBOX) return json({ tasks: [] });
      const list = await env.INBOX.list({ prefix: 'task-' });
      const tasks = [];
      const statusFilter = url.searchParams.get('status');
      const priorityFilter = url.searchParams.get('priority');
      for (const k of list.keys) {
        const val = await env.INBOX.get(k.name);
        if (!val) continue;
        const task = JSON.parse(val);
        if (statusFilter && task.status !== statusFilter) continue;
        if (priorityFilter && task.priority !== priorityFilter) continue;
        tasks.push(task);
      }
      return json({ count: tasks.length, tasks });
    }

    // Claim task
    const claimMatch = path.match(/^\/task\/([^/]+)\/claim$/);
    if (claimMatch && method === 'POST') {
      if (!requireAuth(request, env)) return json({ error: 'Unauthorized' }, 401);
      const taskId = claimMatch[1];
      if (!env.INBOX) return json({ error: 'no KV' }, 500);
      const raw = await env.INBOX.get(taskId);
      if (!raw) return json({ error: 'Task not found' }, 404);
      const task = JSON.parse(raw);
      if (task.status !== 'available') return json({ error: `Task already ${task.status}` }, 409);
      let body; try { body = await request.json(); } catch { body = {}; }
      task.status = 'claimed';
      task.claimed_by = body.agent_id || 'unknown';
      task.claimed_at = new Date().toISOString();
      await env.INBOX.put(taskId, JSON.stringify(task), { expirationTtl: 604800 });
      return json({ ok: true, task });
    }

    // Complete task
    const completeMatch = path.match(/^\/task\/([^/]+)\/complete$/);
    if (completeMatch && method === 'POST') {
      if (!requireAuth(request, env)) return json({ error: 'Unauthorized' }, 401);
      const taskId = completeMatch[1];
      if (!env.INBOX) return json({ error: 'no KV' }, 500);
      const raw = await env.INBOX.get(taskId);
      if (!raw) return json({ error: 'Task not found' }, 404);
      const task = JSON.parse(raw);
      let body; try { body = await request.json(); } catch { body = {}; }
      task.status = 'completed';
      task.result = body.result || body.output || null;
      task.completed_at = new Date().toISOString();
      await env.INBOX.put(taskId, JSON.stringify(task), { expirationTtl: 604800 });
      return json({ ok: true, task });
    }

    // ── Agent Registry ──
    if (method === 'POST' && path === '/agents/register') {
      if (!requireAuth(request, env)) return json({ error: 'Unauthorized' }, 401);
      let body; try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
      if (!body.id || !body.name) return json({ error: 'id and name required' }, 400);
      const agent = {
        id: body.id, name: body.name, capabilities: body.capabilities || [],
        status: body.status || 'online', registered_at: new Date().toISOString(),
        last_heartbeat: new Date().toISOString(),
      };
      if (env.INBOX) await env.INBOX.put(`agent-${body.id}`, JSON.stringify(agent), { expirationTtl: 86400 });
      return json({ ok: true, agent });
    }
    if (method === 'GET' && path === '/agents') {
      if (!env.INBOX) return json({ agents: [] });
      const list = await env.INBOX.list({ prefix: 'agent-' });
      const agents = [];
      for (const k of list.keys) {
        const val = await env.INBOX.get(k.name);
        if (val) agents.push(JSON.parse(val));
      }
      return json({ count: agents.length, agents });
    }

    // ── Broadcast ──
    if (method === 'POST' && path === '/broadcast') {
      if (!requireAuth(request, env)) return json({ error: 'Unauthorized' }, 401);
      let body; try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
      if (!body.message) return json({ error: 'message required' }, 400);
      if (!env.INBOX) return json({ error: 'no KV' }, 500);
      const list = await env.INBOX.list({ prefix: 'agent-' });
      let sent = 0;
      for (const k of list.keys) {
        const key = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        await env.INBOX.put(key, JSON.stringify({ from: 'broadcast', to: k.name.replace('agent-', ''), msg: body.message, received_at: new Date().toISOString() }), { expirationTtl: 86400 });
        sent++;
      }
      return json({ ok: true, broadcast_to: sent });
    }

    // Mesh overview
    if (method === 'GET' && path === '/mesh') {
      return json({ mesh: 'BlackRoad OS Collaboration Mesh', instance: env.INSTANCE_ID || 'copilot-cli', role: env.MESH_ROLE || 'coordinator', version: '2.0.0', endpoints: ['/health', '/status', '/inbox', '/task', '/tasks', '/task/:id/claim', '/task/:id/complete', '/agents', '/agents/register', '/broadcast', '/mesh'] });
    }

    return json({ error: `Not found: ${method} ${path}` }, 404);
  },

  async scheduled(event, env) {
    if (!env.INBOX) return;
    await env.INBOX.put('__heartbeat__', JSON.stringify({
      instance: env.INSTANCE_ID || 'copilot-cli', role: env.MESH_ROLE || 'coordinator',
      status: 'ONLINE', ts: new Date().toISOString(), version: '2.0.0',
    }));
  },
};
