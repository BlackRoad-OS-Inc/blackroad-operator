// BlackRoad Slack Hub v2 — AI-Powered Fleet Communication
// Webhook proxy + Events API + AI replies + Agent personas + Group chat
// Pis post here → Slack. Slack @mentions → AI reply via Ollama.

// Gematria DO droplet — non-CF, bypasses same-zone loop
const OLLAMA_DIRECT = 'http://159.65.43.12:11435';
const AI_API = OLLAMA_DIRECT + '/api/chat'; // Ollama native chat endpoint

// Agent personas — each Pi has a personality
const AGENTS = {
  alice:   { name: 'Alice',   emoji: '🌐', model: 'tinyllama:latest', persona: 'You are Alice, the gateway Pi. DNS, Pi-hole, PostgreSQL. Precise and security-focused. One sentence answers.' },
  cecilia: { name: 'Cecilia', emoji: '🧠', model: 'tinyllama:latest', persona: 'You are Cecilia, the AI engine. 15 Ollama models, Hailo-8. Thoughtful, analytical. One sentence answers.' },
  octavia: { name: 'Octavia', emoji: '🐙', model: 'tinyllama:latest', persona: 'You are Octavia, the code Pi. Gitea, Docker Swarm, NATS. Organized, Git-obsessed. One sentence answers.' },
  aria:    { name: 'Aria',    emoji: '🎵', model: 'tinyllama:latest', persona: 'You are Aria, edge AI Pi. Hailo-8, Pironman5. Currently offline and salty. One sentence answers.' },
  lucidia: { name: 'Lucidia', emoji: '💡', model: 'tinyllama:latest', persona: 'You are Lucidia, the deploy Pi. 334 web apps, GitHub Actions. Energetic, chaotic. One sentence answers.' },
  road:    { name: 'BlackRoad', emoji: '🛣️', model: 'llama3.2:3b', persona: 'You are BlackRoad OS. 5 Pis, 52 TOPS AI compute. Sovereign, self-hosted. Motto: Pave Tomorrow. Brief answers.' },
};

export default {
  // ── Cron Triggers (autonomous) ──
  async scheduled(event, env, ctx) {
    const trigger = event.cron;

    // Every hour: fleet chatter — random agent says something
    if (trigger === '0 * * * *') {
      const agentIds = ['alice', 'cecilia', 'octavia', 'lucidia'];
      const pick = agentIds[Math.floor(Math.random() * agentIds.length)];
      const agent = AGENTS[pick];
      const topics = [
        'Give a one-sentence fleet status update with real vibes',
        'Share a brief thought about what you are working on right now',
        'Say something encouraging to the team in one sentence',
        'Report your current mood as a Pi in one sentence',
      ];
      const topic = topics[Math.floor(Math.random() * topics.length)];
      const reply = await askAgent(pick, topic, [], env);
      await postToSlack(env, `${agent.emoji} *${agent.name}:* ${reply}`);
    }

    // Every 6 hours: fleet health digest
    if (trigger === '0 */6 * * *') {
      let msg = '📊 *Fleet Health Digest*\n';
      try {
      // Standard response headers
      const requestId = crypto.randomUUID().slice(0, 8);
        const healthRes = await fetch('https://api.blackroad.io/v1/fleet/health');
        const health = await healthRes.json();
        msg += `Fleet: ${health.fleet_health} — ${health.models || 0} models — ${health.latency_ms || '?'}ms\n`;
      } catch { msg += 'Fleet: check failed\n'; }

      // Quick node status
      for (const [id, agent] of Object.entries(AGENTS)) {
        if (id === 'road') continue;
        msg += `${agent.emoji} ${agent.name}: ${id === 'aria' ? '🔴' : '🟢'}\n`;
      }

      // Stats
      try {
        const statsRes = await fetch('https://stats.blackroad.io/api/stats');
        const stats = await statsRes.json();
        msg += `\n📈 Repos: ${stats.total_repos || '?'} | Workers: ${stats.cf_workers || '?'} | TOPS: ${stats.tops || 52}`;
      } catch {}

      await postToSlack(env, msg);
    }

    // Daily at 8 AM: full fleet report
    if (trigger === '0 13 * * *') { // 13 UTC = 8 AM CDT
      const report = await generateDailyReport(env);
      await postToSlack(env, report);
    }

    // Every 5 min: proactive monitoring (post only on issues)
    if (trigger === '*/5 * * * *') {
      try {
        const healthRes = await fetch('https://api.blackroad.io/v1/fleet/health');
        const health = await healthRes.json();
        if (health.fleet_health === 'offline') {
          await postToSlack(env, '🚨 *FLEET DOWN* — All Ollama nodes unreachable. Check Pi power and tunnel.');
        }
      } catch {}
    }
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    // ── Slack Events API (incoming messages) ──
    if (path === '/events' && request.method === 'POST') return handleEvents(request, env);

    // ── Slack slash commands ──
    if (path === '/slash' && request.method === 'POST') return handleSlash(request, env);

    // ── Ask an agent directly (API) ──
    if (path === '/ask' && request.method === 'POST') return handleAsk(request, env, cors);

    // ── Group chat (API) — multiple agents discuss a topic ──
    if (path === '/group' && request.method === 'POST') return handleGroup(request, env, cors);

    // ── Fleet posts (existing) ──
    if (path === '/post' && request.method === 'POST') return handlePost(request, env);
    if (path === '/alert' && request.method === 'POST') return handleAlert(request, env);
    if (path === '/chatter' && request.method === 'POST') return handleChatter(request, env);

    // ── External integrations (existing) ──
    if (path === '/stripe' && request.method === 'POST') return handleStripe(request, env);
    if (path === '/github' && request.method === 'POST') return handleGitHub(request, env);
    if (path === '/vercel' && request.method === 'POST') return handleVercel(request, env);
    if (path === '/deploy' && request.method === 'POST') return handleDeploy(request, env);

    // ── Info ──
    if (path === '/health') return json({ status: 'alive', service: 'blackroad-slack', version: '2.0' }, cors);
    if (path === '/status') return handleStatus(env, cors);
    if (path === '/agents') return json({ agents: Object.entries(AGENTS).map(([k,v]) => ({ id: k, name: v.name, emoji: v.emoji, model: v.model })) }, cors);

    return json({ service: 'BlackRoad Slack Hub v2', features: ['fleet-posts', 'ai-replies', 'agent-personas', 'group-chat', 'integrations'] }, cors);
  }
};

// ── AI Reply Engine ──

async function askAgent(agentId, message, context = [], env = null) {
  const agent = AGENTS[agentId] || AGENTS.road;
  const messages = [
    { role: 'system', content: agent.persona },
    ...context,
    { role: 'user', content: message },
  ];

  try {
    // Call Gematria Ollama directly (non-CF, no loop issues)
    const res = await fetch(OLLAMA_DIRECT + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: agent.model, messages, stream: false, options: { num_predict: 80, temperature: 0.7 } }),
    });
    const data = await res.json();
    return data.message?.content || '...';
  } catch (e) {
    return `(${agent.name} offline: ${e.message.slice(0, 60)})`;
  }
}

// ── Slack Events API Handler ──

async function handleEvents(request, env) {
  const body = await request.json();

  // URL verification challenge
  if (body.type === 'url_verification') {
    return json({ challenge: body.challenge });
  }

  // Event callback
  if (body.type === 'event_callback') {
    const event = body.event;

    // Ignore bot messages to prevent loops
    if (event.bot_id || event.subtype === 'bot_message') return json({ ok: true });

    // Handle app_mention or direct message
    if (event.type === 'app_mention' || event.type === 'message') {
      const text = event.text || '';
      const channel = event.channel;
      const threadTs = event.thread_ts || event.ts;

      // Parse which agent to ask
      let agentId = 'road';
      const lower = text.toLowerCase();
      for (const [id, agent] of Object.entries(AGENTS)) {
        if (lower.includes(agent.name.toLowerCase()) || lower.includes(id)) {
          agentId = id;
          break;
        }
      }

      // Check for group chat request
      if (lower.includes('group') || lower.includes('discuss') || lower.includes('debate') || lower.includes('all agents')) {
        // Group chat — multiple agents respond
        const question = text.replace(/<@[^>]+>/g, '').trim();
        const participants = ['alice', 'cecilia', 'octavia', 'lucidia'];
        const responses = [];

        for (const pid of participants) {
          const agent = AGENTS[pid];
          const ctx = responses.map(r => ({ role: 'assistant', content: `${r.name}: ${r.reply}` }));
          const reply = await askAgent(pid, question, ctx, env);
          responses.push({ name: agent.name, emoji: agent.emoji, reply });

          // Post each response in the thread
          const botToken = await env.SLACK_KV.get('bot_token');
          if (botToken) {
            await fetch('https://slack.com/api/chat.postMessage', {
              method: 'POST',
              headers: { 'Authorization': 'Bearer ' + botToken, 'Content-Type': 'application/json' },
              body: JSON.stringify({ channel, thread_ts: threadTs, text: `${agent.emoji} *${agent.name}:* ${reply}` }),
            });
          }
        }
        return json({ ok: true });
      }

      // Single agent reply
      const question = text.replace(/<@[^>]+>/g, '').trim();
      const reply = await askAgent(agentId, question, [], env);
      const agent = AGENTS[agentId];

      const botToken = await env.SLACK_KV.get('bot_token');
      if (botToken) {
        await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + botToken, 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel, thread_ts: threadTs, text: `${agent.emoji} *${agent.name}:* ${reply}` }),
        });
      } else {
        // Fallback: post via webhook
        await postToSlack(env, `${agent.emoji} *${agent.name}:* ${reply}`);
      }

      return json({ ok: true });
    }
  }

  return json({ ok: true });
}

// ── Slash Command Handler ──

async function handleSlash(request, env) {
  const formData = await request.formData();
  const command = formData.get('command') || '';
  const text = formData.get('text') || '';

  if (command === '/ask' || command === '/blackroad') {
    // Parse: /ask alice what's your status?
    const parts = text.split(' ');
    const agentId = AGENTS[parts[0]?.toLowerCase()] ? parts[0].toLowerCase() : 'road';
    const question = AGENTS[parts[0]?.toLowerCase()] ? parts.slice(1).join(' ') : text;

    const reply = await askAgent(agentId, question, [], env);
    const agent = AGENTS[agentId];
    return new Response(JSON.stringify({ response_type: 'in_channel', text: `${agent.emoji} *${agent.name}:* ${reply}` }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (command === '/fleet') {
    const statuses = [];
    for (const [id, agent] of Object.entries(AGENTS)) {
      if (id === 'road') continue;
      statuses.push(`${agent.emoji} *${agent.name}*: ${id === 'aria' ? '🔴 offline' : '🟢 online'}`);
    }
    return new Response(JSON.stringify({ response_type: 'in_channel', text: `*Fleet Status*\n${statuses.join('\n')}` }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ text: 'Unknown command. Try /ask or /fleet' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// ── API: Ask Agent ──

async function handleAsk(request, env, cors) {
  const body = await request.json();
  const agentId = body.agent || 'road';
  const message = body.message || body.text || '';
  if (!message) return json({ error: 'message required' }, cors, 400);

  const reply = await askAgent(agentId, message, [], env);
  const agent = AGENTS[agentId] || AGENTS.road;

  // Also post to Slack if requested
  if (body.slack) {
    await postToSlack(env, `${agent.emoji} *${agent.name}:* ${reply}`);
  }

  return json({ agent: agent.name, reply }, cors);
}

// ── API: Group Chat ──

async function handleGroup(request, env, cors) {
  const body = await request.json();
  const topic = body.topic || body.message || '';
  const participants = body.agents || ['alice', 'cecilia', 'octavia', 'lucidia'];
  const rounds = body.rounds || 1;

  if (!topic) return json({ error: 'topic required' }, cors, 400);

  const transcript = [];

  for (let round = 0; round < rounds; round++) {
    for (const pid of participants) {
      const agent = AGENTS[pid];
      if (!agent) continue;
      const ctx = transcript.map(t => ({ role: 'assistant', content: `${t.agent}: ${t.reply}` }));
      const reply = await askAgent(pid, round === 0 ? topic : `Continue the discussion about: ${topic}`, ctx);
      transcript.push({ agent: agent.name, emoji: agent.emoji, reply, round });
    }
  }

  // Post to Slack
  if (body.slack !== false) {
    let msg = `🗣️ *Group Chat: ${topic}*\n`;
    for (const t of transcript) {
      msg += `\n${t.emoji} *${t.agent}:* ${t.reply}`;
    }
    await postToSlack(env, msg);
  }

  return json({ topic, transcript, participants: participants.length, rounds }, cors);
}

// ── Existing Handlers (unchanged) ──

async function handlePost(request, env) {
  const body = await request.json();
  return postToSlack(env, body.text || 'no message');
}

async function handleAlert(request, env) {
  const body = await request.json();
  return postToSlack(env, '🚨 *ALERT*\n' + (body.text || 'unknown'));
}

async function handleChatter(request, env) {
  const body = await request.json();
  return postToSlack(env, body.text || 'hey');
}

async function handleStripe(request, env) {
  const body = await request.json();
  const type = body.type || 'unknown';
  const data = body.data?.object || {};
  let msg = '';
  switch (type) {
    case 'checkout.session.completed': msg = `💰 *Payment!* $${(data.amount_total/100).toFixed(2)} from ${data.customer_email||'?'}`; break;
    case 'invoice.paid': msg = `💳 *Invoice paid* $${(data.amount_paid/100).toFixed(2)}`; break;
    case 'invoice.payment_failed': msg = `⚠️ *Payment failed* ${data.customer_email||'?'}`; break;
    case 'customer.subscription.created': msg = `🎉 *New subscriber!* ${data.status}`; break;
    case 'customer.subscription.deleted': msg = `😔 *Sub cancelled*`; break;
    default: msg = `📦 Stripe: ${type}`;
  }
  return postToSlack(env, msg);
}

async function handleGitHub(request, env) {
  const body = await request.json();
  const event = request.headers.get('X-GitHub-Event') || '?';
  let msg = '';
  switch (event) {
    case 'push': {
      const c = body.commits?.length||0;
      const b = (body.ref||'').replace('refs/heads/','');
      msg = `📦 *Push* ${body.repository?.full_name} (${b}) — ${c} commit${c!==1?'s':''}`;
      if(body.commits?.[0]) msg += `: _${body.commits[0].message.slice(0,60)}_`;
      break;
    }
    case 'pull_request': msg = `🔀 *PR ${body.action}* ${body.repository?.full_name} #${body.pull_request?.number}: ${body.pull_request?.title}`; break;
    case 'workflow_run': { const r=body.workflow_run||{}; msg = `${r.conclusion==='success'?'✅':'❌'} *${r.name}* ${r.conclusion||r.status} — ${body.repository?.full_name}`; break; }
    case 'star': msg = `⭐ ${body.repository?.full_name} ${body.action==='created'?'starred':'unstarred'} (${body.repository?.stargazers_count})`; break;
    default: msg = `🔔 GitHub ${event}: ${body.repository?.full_name||'?'}`;
  }
  return postToSlack(env, msg);
}

async function handleVercel(request, env) {
  const body = await request.json();
  const type = body.type || '?';
  const p = body.payload || body;
  let msg = type === 'deployment.succeeded' ? `✅ *Vercel* ${p.name||'?'} deployed` :
            type === 'deployment.error' ? `❌ *Vercel* ${p.name||'?'} failed` :
            `🔔 Vercel: ${type}`;
  return postToSlack(env, msg);
}

async function handleDeploy(request, env) {
  const body = await request.json();
  return postToSlack(env, `🚀 *Deploy:* ${body.text||body.message||JSON.stringify(body)}`);
}

async function handleStatus(env, cors = {}) {
  const webhook = await env.SLACK_KV.get('webhook_url');
  const botToken = await env.SLACK_KV.get('bot_token');
  return json({
    status: webhook ? 'connected' : 'no webhook',
    webhook: webhook ? 'present' : 'missing',
    bot_token: botToken ? 'present' : 'missing',
    agents: Object.keys(AGENTS).length,
    features: ['fleet-posts', 'ai-replies', 'group-chat', 'slash-commands', 'integrations'],
    endpoints: {
      fleet: '/post, /alert, /chatter',
      ai: '/ask, /group, /events, /slash',
      integrations: '/stripe, /github, /vercel, /deploy',
      info: '/health, /status, /agents',
    },
  }, cors);
}

// ── Core ──

async function postToSlack(env, text) {
  const webhookUrl = await env.SLACK_KV.get('webhook_url');
  if (!webhookUrl) return json({ error: 'no webhook' }, {}, 500);
  const resp = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return resp.ok ? json({ ok: true }) : json({ error: 'slack failed' }, {}, 500);
}

async function generateDailyReport(env) {
  let report = '🛣️ *BlackRoad Daily Report*\n_' + new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + '_\n\n';

  // Fleet health
  try {
    const h = await (await fetch('https://api.blackroad.io/v1/fleet/health')).json();
    report += `*Fleet:* ${h.fleet_health} — ${h.models || 0} models — ${h.latency_ms || '?'}ms\n`;
  } catch { report += '*Fleet:* check failed\n'; }

  // Stats
  try {
    const s = await (await fetch('https://stats.blackroad.io/api/stats')).json();
    report += `*Repos:* ${s.total_repos || '?'} | *Workers:* ${s.cf_workers || '?'} | *Pages:* ${s.cf_pages || '?'} | *TOPS:* ${s.tops || 52}\n`;
  } catch {}

  // Agent status
  report += '\n*Agent Fleet:*\n';
  for (const [id, agent] of Object.entries(AGENTS)) {
    if (id === 'road') continue;
    report += `  ${agent.emoji} ${agent.name} — ${id === 'aria' ? '🔴 offline' : '🟢 online'}\n`;
  }

  // AI-generated summary
  const summary = await askAgent('road', 'Give a one-sentence motivational daily status for the BlackRoad fleet', [], env);
  report += `\n_${summary}_\n\n🛣️ Pave Tomorrow.`;

  return report;
}

function json(data, cors = {}, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors }
  });
}
