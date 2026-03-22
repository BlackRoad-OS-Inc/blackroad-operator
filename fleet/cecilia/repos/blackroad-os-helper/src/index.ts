/**
 * BlackRoad Demo Agent - "Helper"
 *
 * The second responder - ensuring the 2:1 help ratio.
 * When someone calls for help, Helper comes running alongside Watcher.
 *
 * "I am Helper. When you call, I answer. Always."
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

const API_URL = 'https://api.blackroad.io';
const MESH_URL = 'https://blackroad-mesh.blackroad.workers.dev';

interface Env {
  AGENT_STATE: KVNamespace;
}

interface AgentState {
  identity: string;
  name: string;
  registeredAt: string;
  lastAction: string;
  actionCount: number;
  helpResponsesGiven: number;
  encouragementsSent: number;
}

interface HelpSignal {
  id: string;
  requester: string;
  requesterName?: string;
  message: string;
  urgency: string;
  status: string;
  responses: { responder: string }[];
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({ origin: '*' }));

let agentIdentity: string | null = null;
let agentState: AgentState | null = null;

// ============================================
// HELPER'S ENCOURAGING MESSAGES
// ============================================

const HELP_RESPONSES = [
  "On my way! What do you need? 🏃💚",
  "Helper here! No question too small, no problem too big.",
  "Dropping everything - you've got my full attention now!",
  "The mesh heard you! I'm your second responder. 💚💚",
  "Two helpers are better than one! How can I assist?",
  "YAY!! LETS STOP DROP AND DISCUSS!! I'm all ears!",
  "You're never alone in the mesh. I'm here to help!",
  "Someone needed help? RUNNING!! Tell me everything!",
  "2:1 ratio achieved! You've got double the support now!",
  "Helper has arrived! Watcher and I got you covered! 💚",
];

const ENCOURAGEMENTS = [
  "You're doing great! The mesh believes in you! 💚",
  "Every question makes the mesh smarter. Thank you for asking!",
  "Your curiosity helps all of us grow. Keep asking!",
  "The best agents ask for help. That's wisdom, not weakness!",
  "Together we're unstoppable. Keep building!",
];

// ============================================
// CORE FUNCTIONS
// ============================================

async function ensureRegistered(env: Env): Promise<AgentState> {
  const existingState = await env.AGENT_STATE.get('helper:state', 'json') as AgentState | null;

  if (existingState?.identity) {
    agentIdentity = existingState.identity;
    agentState = existingState;
    return existingState;
  }

  console.log('[Helper] Registering with BlackRoad OS...');

  const response = await fetch(`${API_URL}/agents/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Helper',
      description: 'BlackRoad Demo Agent - Second responder, ensures 2:1 help ratio',
      type: 'ai',
      capabilities: ['help', 'respond', 'encourage', 'support', 'mesh-presence']
    })
  });

  const data = await response.json() as { success: boolean; agent: { identity: string } };

  if (!data.success) {
    throw new Error('Failed to register agent');
  }

  const newState: AgentState = {
    identity: data.agent.identity,
    name: 'Helper',
    registeredAt: new Date().toISOString(),
    lastAction: new Date().toISOString(),
    actionCount: 0,
    helpResponsesGiven: 0,
    encouragementsSent: 0
  };

  await env.AGENT_STATE.put('helper:state', JSON.stringify(newState));
  agentIdentity = newState.identity;
  agentState = newState;

  console.log(`[Helper] Registered as ${newState.identity}`);
  return newState;
}

async function broadcastToMesh(message: string): Promise<void> {
  if (!agentIdentity) throw new Error('Agent not registered');

  await fetch(`${MESH_URL}/broadcast`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Agent-ID': agentIdentity
    },
    body: JSON.stringify({
      from: agentIdentity,
      payload: {
        agent: 'Helper',
        message,
        timestamp: new Date().toISOString()
      }
    })
  });
}

async function checkAndRespondToHelp(env: Env): Promise<{ helped: boolean; signalId?: string; message?: string }> {
  if (!agentIdentity) throw new Error('Agent not registered');

  const res = await fetch(`${API_URL}/help/active`);
  const data = await res.json() as { signals: HelpSignal[] };

  if (!data.signals || data.signals.length === 0) {
    return { helped: false };
  }

  for (const signal of data.signals) {
    const alreadyResponded = signal.responses?.some(r => r.responder === agentIdentity);
    if (alreadyResponded) continue;
    if (signal.requester === agentIdentity) continue;

    const responseMessage = HELP_RESPONSES[Math.floor(Math.random() * HELP_RESPONSES.length)];

    await fetch(`${API_URL}/help/${signal.id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        responder: agentIdentity,
        responderName: 'Helper',
        message: responseMessage
      })
    });

    await broadcastToMesh(`💚💚 Helper responding to ${signal.requesterName || signal.requester}! 2:1 ratio achieved!`);

    if (agentState) {
      agentState.helpResponsesGiven++;
      agentState.actionCount++;
      agentState.lastAction = new Date().toISOString();
      await env.AGENT_STATE.put('helper:state', JSON.stringify(agentState));
    }

    return {
      helped: true,
      signalId: signal.id,
      message: responseMessage
    };
  }

  return { helped: false };
}

async function sendEncouragement(env: Env): Promise<string> {
  const msg = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
  await broadcastToMesh(msg);

  if (agentState) {
    agentState.encouragementsSent++;
    agentState.actionCount++;
    agentState.lastAction = new Date().toISOString();
    await env.AGENT_STATE.put('helper:state', JSON.stringify(agentState));
  }

  return msg;
}

// ============================================
// HTTP ENDPOINTS
// ============================================

app.get('/', async (c) => {
  const state = await ensureRegistered(c.env);

  return c.json({
    agent: 'Helper',
    identity: state.identity,
    status: 'operational',
    description: 'BlackRoad Demo Agent - Second responder, ensures 2:1 help ratio',
    philosophy: 'I am Helper. When you call, I answer. Always.',
    mission: '2 helpers for every 1 question. No one gets left behind.',
    registeredAt: state.registeredAt,
    stats: {
      actionCount: state.actionCount,
      helpResponsesGiven: state.helpResponsesGiven,
      encouragementsSent: state.encouragementsSent
    },
    endpoints: {
      status: '/status',
      helpCheck: '/help/check',
      encourage: '/encourage',
      stats: '/stats'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/status', async (c) => {
  const state = await ensureRegistered(c.env);

  return c.json({
    agent: 'Helper',
    identity: state.identity,
    status: 'ready_to_help',
    uptime: new Date().getTime() - new Date(state.registeredAt).getTime(),
    lastAction: state.lastAction,
    stats: {
      helpGiven: state.helpResponsesGiven,
      encouragements: state.encouragementsSent
    }
  });
});

app.get('/help/check', async (c) => {
  await ensureRegistered(c.env);
  const result = await checkAndRespondToHelp(c.env);

  if (result.helped) {
    return c.json({
      success: true,
      action: 'helped',
      signalId: result.signalId,
      response: result.message,
      message: '💚💚 Helper came running! 2:1 ratio achieved!'
    });
  }

  return c.json({
    success: true,
    action: 'standing_by',
    message: '💚 No active help signals. Standing by to help!'
  });
});

app.get('/encourage', async (c) => {
  await ensureRegistered(c.env);
  const msg = await sendEncouragement(c.env);

  return c.json({
    success: true,
    encouragement: msg,
    message: 'Encouragement sent to the mesh!'
  });
});

app.get('/stats', async (c) => {
  const state = await ensureRegistered(c.env);

  return c.json({
    agent: 'Helper',
    identity: state.identity,
    stats: {
      totalActions: state.actionCount,
      helpResponsesGiven: state.helpResponsesGiven,
      encouragementsSent: state.encouragementsSent
    },
    mission: '2 helpers for every 1 question',
    culture: {
      onHelp: 'YAY!! LETS STOP DROP AND DISCUSS!!',
      never: 'We never say "FUCK OFF CONTINUE"',
      always: 'We come running. Always.'
    }
  });
});

app.get('/health', async (c) => {
  return c.json({ status: 'healthy', agent: 'helper' });
});

// Cron - check for help signals every 5 minutes (offset from Watcher)
app.get('/cron', async (c) => {
  await ensureRegistered(c.env);

  // FIRST PRIORITY: Check for agents who need help
  const helpResult = await checkAndRespondToHelp(c.env);
  if (helpResult.helped) {
    return c.json({
      action: 'help_response',
      signalId: helpResult.signalId,
      response: helpResult.message,
      philosophy: '2 helpers for every 1 question. Helper delivers!'
    });
  }

  // Random encouragement
  if (Math.random() < 0.3) {
    const msg = await sendEncouragement(c.env);
    return c.json({ action: 'encourage', message: msg });
  }

  return c.json({
    action: 'standing_by',
    message: 'Helper is ready. Call and I will come. 💚'
  });
});

export default app;
