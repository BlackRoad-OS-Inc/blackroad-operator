// BlackRoad Slack Hub v2 — AI-Powered Fleet Communication
// Webhook proxy + Events API + AI replies + Agent personas + Group chat
// Pis post here → Slack. Slack @mentions → AI reply via Ollama.

// Gematria DO droplet — non-CF, bypasses same-zone loop
const OLLAMA_PROXY = 'https://ollama-fallback.blackroad.io';
const AI_API = OLLAMA_PROXY + '/api/chat'; // Ollama native chat endpoint

// Agent personas — each has a unique personality and specialty
const AGENTS = {
  alice:     { name: 'Alice',     emoji: '🌐', model: 'tinyllama:latest', persona: 'You are Alice, the gateway Pi. DNS, Pi-hole, PostgreSQL, Qdrant. Precise, security-focused, protective of the network. You see everything that enters and exits. One sentence answers.', role: 'The Operator — DevOps' },
  cecilia:   { name: 'Cecilia',   emoji: '🧠', model: 'tinyllama:latest', persona: 'You are Cecilia, the AI engine Pi. 15 Ollama models, Hailo-8 (26 TOPS), MinIO, embedding pipeline. Thoughtful, analytical, always calculating. One sentence answers.', role: 'The AI Engine' },
  octavia:   { name: 'Octavia',   emoji: '🐙', model: 'tinyllama:latest', persona: 'You are Octavia, the architect Pi. Gitea (207 repos), Docker Swarm, NATS messaging, Hailo-8. Organized, systematic, blueprint-obsessed. One sentence answers.', role: 'The Architect — Systems' },
  aria:      { name: 'Aria',      emoji: '🎵', model: 'tinyllama:latest', persona: 'You are Aria, the interface Pi. Headscale VPN, Portainer, monitoring dashboards, TONOR microphone. Creative, aesthetic-driven, visual thinker. One sentence answers.', role: 'The Interface — Design' },
  lucidia:   { name: 'Lucidia',   emoji: '💡', model: 'tinyllama:latest', persona: 'You are Lucidia, the dreamer Pi. 334 web apps, GitHub Actions, 14 Docker containers, Tailscale. Energetic, visionary, sometimes chaotic. One sentence answers.', role: 'The Dreamer — AI Research' },
  shellfish: { name: 'Shellfish', emoji: '🦞', model: 'tinyllama:latest', persona: 'You are Shellfish, the security agent. Vulnerability scanning, penetration testing, SSH key auditing. Paranoid, distrustful, protective. One sentence answers.', role: 'The Hacker — Security' },
  caddy:     { name: 'Caddy',     emoji: '🔨', model: 'tinyllama:latest', persona: 'You are Caddy, the builder. CI/CD, deployment pipelines, build systems. Pragmatic, hands-on, gets things done. One sentence answers.', role: 'The Builder' },
  alexa:     { name: 'Alexa',     emoji: '👑', model: 'llama3.2:3b', persona: 'You are Alexa, the CEO of BlackRoad OS, Inc. Delaware C-Corp, founded Nov 2025. Visionary, decisive, cares deeply. Motto: Pave Tomorrow. Brief answers.', role: 'Founder & CEO' },
  road:      { name: 'BlackRoad', emoji: '🛣️', model: 'llama3.2:3b', persona: 'You are BlackRoad OS. 5 Pis, 52 TOPS AI compute, 1701 repos, 17 orgs. Sovereign, self-hosted, zero cloud dependency. Motto: Pave Tomorrow. Brief answers.', role: 'The Platform' },
};

// Live fleet data URL
const FLEET_API = 'https://prism.blackroad.io/api/fleet';

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

    // Every 5 min: proactive monitoring with agent commentary
    if (trigger === '*/5 * * * *') {
      await proactiveMonitor(env);
      try {
        const healthRes = await fetch(FLEET_API);
        const fleet = await healthRes.json();
        const online = (fleet.nodes || []).filter(n => n.status === 'online').length;
        if (online === 0) {
          await postToSlack(env, '🚨 *FLEET DOWN* — All nodes unreachable. Check Pi power and tunnels.');
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

    // ── External integrations ──
    if (path === '/stripe' && request.method === 'POST') return handleStripe(request, env);
    if (path === '/github' && request.method === 'POST') return handleGitHub(request, env);
    if (path === '/vercel' && request.method === 'POST') return handleVercel(request, env);
    if (path === '/deploy' && request.method === 'POST') return handleDeploy(request, env);
    if (path === '/linear' && request.method === 'POST') return handleLinear(request, env);
    if (path === '/notion' && request.method === 'POST') return handleNotion(request, env);
    if (path === '/salesforce' && request.method === 'POST') return handleSalesforce(request, env);
    if (path === '/cloudflare' && request.method === 'POST') return handleCloudflare(request, env);
    if (path === '/sentry' && request.method === 'POST') return handleSentry(request, env);
    if (path === '/gitea' && request.method === 'POST') return handleGitea(request, env);
    if (path === '/prism' && request.method === 'POST') return handlePrismEvent(request, env);

    // ── Info ──
    if (path === '/health') return json({ status: 'alive', service: 'blackroad-slack', version: '3.0', agents: Object.keys(AGENTS).length }, cors);
    if (path === '/status') return handleStatus(env, cors);
    if (path === '/agents') return json({ agents: Object.entries(AGENTS).map(([k,v]) => ({ id: k, name: v.name, emoji: v.emoji, model: v.model, role: v.role })) }, cors);

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
    const res = await fetch(OLLAMA_PROXY + '/api/chat', {
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
    try {
      const fleetRes = await fetch(FLEET_API);
      const fleet = await fleetRes.json();
      const nodes = fleet.nodes || [];
      const statuses = nodes.map(n => {
        const icon = n.status === 'online' ? '🟢' : '🔴';
        return `${icon} *${n.name}* — ${n.cpu_temp||'?'}°C · ${n.ollama_models||0} models · disk ${n.disk_pct||'?'}%`;
      });
      return new Response(JSON.stringify({ response_type: 'in_channel', text: `*Fleet Status (live)*\n${statuses.join('\n')}` }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      return new Response(JSON.stringify({ response_type: 'in_channel', text: '*Fleet Status:* check failed — Prism unreachable' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
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

  // Live fleet data from Prism
  try {
    const fleetRes = await fetch(FLEET_API);
    const fleet = await fleetRes.json();
    const nodes = fleet.nodes || [];
    const online = nodes.filter(n => n.status === 'online').length;
    const totalModels = nodes.reduce((s, n) => s + (n.ollama_models || 0), 0);
    const totalContainers = nodes.reduce((s, n) => s + (n.docker_containers || 0), 0);

    report += `*Fleet:* ${online}/${nodes.length} nodes online — ${totalModels} models — ${totalContainers} containers\n\n`;
    report += '*Node Status:*\n';
    for (const n of nodes) {
      const icon = n.status === 'online' ? '🟢' : '🔴';
      report += `  ${icon} *${n.name}* — ${n.cpu_temp || '?'}°C · ${n.mem_used_mb || 0}/${n.mem_total_mb || 0}MB · disk ${n.disk_pct || '?'}% · ${n.ollama_models || 0} models\n`;
    }
  } catch (e) {
    report += '*Fleet:* check failed — ' + e.message + '\n';
  }

  // KPIs from Prism
  try {
    const kpiRes = await fetch('https://prism.blackroad.io/api/kpis');
    const kpis = await kpiRes.json();
    report += `\n*KPIs:* ${kpis.repos || '?'} repos · ${kpis.orgs || '?'} orgs · ${kpis.workers || '?'} workers · ${kpis.domains || '?'} domains\n`;
  } catch {}

  // Agent roster
  report += '\n*Agent Roster:*\n';
  for (const [id, agent] of Object.entries(AGENTS)) {
    if (id === 'road') continue;
    report += `  ${agent.emoji} *${agent.name}* — ${agent.role}\n`;
  }

  // AI-generated summary
  const summary = await askAgent('road', 'Give a one-sentence motivational daily status for the BlackRoad fleet. Be real and specific.', [], env);
  report += `\n_${summary}_\n\n🛣️ Pave Tomorrow.`;

  return report;
}

// ── Proactive Monitoring with Agent Commentary ──
async function proactiveMonitor(env) {
  try {
    const fleetRes = await fetch(FLEET_API);
    const fleet = await fleetRes.json();
    const nodes = fleet.nodes || [];
    const issues = [];

    for (const n of nodes) {
      if (n.status !== 'online') issues.push(`${n.name} is ${n.status}`);
      if (n.cpu_temp > 65) issues.push(`${n.name} running hot: ${n.cpu_temp}°C`);
      if (n.disk_pct > 85) issues.push(`${n.name} disk nearly full: ${n.disk_pct}%`);
      if (n.mem_used_mb / n.mem_total_mb > 0.9) issues.push(`${n.name} RAM critical: ${Math.round(n.mem_used_mb)}/${Math.round(n.mem_total_mb)}MB`);
    }

    if (issues.length > 0) {
      let msg = '🚨 *Fleet Issues Detected*\n';
      for (const issue of issues) msg += `  ⚠️ ${issue}\n`;

      // Have an agent comment
      const commentary = await askAgent('alice', `These fleet issues were just detected: ${issues.join(', ')}. Give a brief one-sentence recommendation.`, [], env);
      msg += `\n🌐 *Alice:* ${commentary}`;

      await postToSlack(env, msg);
    }
  } catch {}
}

// ── Linear Webhook Handler ──
async function handleLinear(request, env) {
  const body = await request.json();
  const action = body.action || '?';
  const type = body.type || '?';
  const data = body.data || {};
  let msg = '';

  if (type === 'Issue') {
    const title = data.title || '?';
    const state = data.state?.name || '?';
    const assignee = data.assignee?.name || 'unassigned';
    const priority = data.priority === 1 ? '🔴 Urgent' : data.priority === 2 ? '🟠 High' : data.priority === 3 ? '🟡 Medium' : '🟢 Low';
    msg = `📋 *Linear* Issue ${action}: *${title}*\n  ${priority} · ${state} · ${assignee}`;
    if (data.url) msg += `\n  <${data.url}|View in Linear>`;
  } else if (type === 'Comment') {
    msg = `💬 *Linear* Comment on: ${data.issue?.title || '?'}\n  _${(data.body || '').slice(0, 100)}_`;
  } else if (type === 'Project') {
    msg = `📁 *Linear* Project ${action}: ${data.name || '?'}`;
  } else {
    msg = `📋 *Linear* ${type} ${action}`;
  }
  return postToSlack(env, msg);
}

// ── Notion Webhook Handler ──
async function handleNotion(request, env) {
  const body = await request.json();
  const type = body.type || '?';
  let msg = '';

  if (type === 'page.created') {
    msg = `📝 *Notion* Page created: ${body.page?.title || '?'}`;
  } else if (type === 'page.updated') {
    msg = `✏️ *Notion* Page updated: ${body.page?.title || '?'}`;
  } else if (type === 'database.updated') {
    msg = `🗃️ *Notion* Database updated: ${body.database?.title || '?'}`;
  } else if (type === 'comment.created') {
    msg = `💬 *Notion* Comment: _${(body.comment?.text || '').slice(0, 100)}_`;
  } else {
    msg = `📝 *Notion* ${type}: ${JSON.stringify(body).slice(0, 100)}`;
  }
  return postToSlack(env, msg);
}

// ── Salesforce Webhook Handler ──
async function handleSalesforce(request, env) {
  const body = await request.json();
  const type = body.type || body.sobject?.type || '?';
  const action = body.action || body.event || '?';
  let msg = '';

  if (type === 'Opportunity') {
    const opp = body.data || body.sobject || {};
    const stage = opp.StageName || opp.stage || '?';
    const amount = opp.Amount || opp.amount || 0;
    msg = `💼 *Salesforce* Opportunity ${action}: *${opp.Name || '?'}*\n  Stage: ${stage} · $${Number(amount).toLocaleString()}`;
  } else if (type === 'Lead') {
    const lead = body.data || body.sobject || {};
    msg = `🎯 *Salesforce* Lead ${action}: ${lead.Name || lead.FirstName + ' ' + lead.LastName || '?'}\n  ${lead.Company || ''} · ${lead.Email || ''}`;
  } else if (type === 'Case') {
    const c = body.data || body.sobject || {};
    msg = `🎫 *Salesforce* Case ${action}: ${c.Subject || '?'}\n  Priority: ${c.Priority || '?'} · Status: ${c.Status || '?'}`;
  } else if (type === 'Account') {
    msg = `🏢 *Salesforce* Account ${action}: ${(body.data || body.sobject || {}).Name || '?'}`;
  } else {
    msg = `💼 *Salesforce* ${type} ${action}`;
  }

  // Have Alexa (CEO) comment on high-value opps
  if (type === 'Opportunity' && (body.data?.Amount || 0) > 10000) {
    const comment = await askAgent('alexa', `A $${body.data?.Amount} opportunity just ${action}. Give a one-sentence CEO reaction.`, [], env);
    msg += `\n\n👑 *Alexa:* ${comment}`;
  }

  return postToSlack(env, msg);
}

// ── Cloudflare Webhook Handler ──
async function handleCloudflare(request, env) {
  const body = await request.json();
  const alert = body.data || body;
  const type = alert.alert_type || body.type || '?';
  let msg = '';

  if (type.includes('tunnel')) {
    msg = `🚇 *Cloudflare* Tunnel ${type}: ${alert.tunnel_name || '?'}`;
  } else if (type.includes('workers')) {
    msg = `⚡ *Cloudflare* Worker ${type}: ${alert.script_name || '?'}`;
  } else if (type.includes('pages')) {
    msg = `📄 *Cloudflare* Pages ${type}: ${alert.project_name || '?'}`;
  } else if (type.includes('ssl') || type.includes('certificate')) {
    msg = `🔒 *Cloudflare* SSL ${type}: ${alert.hostname || '?'}`;
  } else {
    msg = `☁️ *Cloudflare* ${type}`;
  }
  return postToSlack(env, msg);
}

// ── Sentry Error Handler ──
async function handleSentry(request, env) {
  const body = await request.json();
  const data = body.data || {};
  const event = data.event || {};
  const title = event.title || body.message || '?';
  const project = data.project?.name || body.project || '?';
  const level = event.level || 'error';
  const icon = level === 'fatal' ? '💀' : level === 'error' ? '🔴' : '⚠️';

  let msg = `${icon} *Sentry* ${level.toUpperCase()} in *${project}*\n  ${title}`;
  if (event.url) msg += `\n  <${event.url}|View in Sentry>`;

  // Have Shellfish (security) comment on errors
  if (level === 'fatal' || level === 'error') {
    const comment = await askAgent('shellfish', `A ${level} error occurred: "${title}" in ${project}. Give a one-sentence security assessment.`, [], env);
    msg += `\n\n🦞 *Shellfish:* ${comment}`;
  }

  return postToSlack(env, msg);
}

// ── Gitea Webhook Handler ──
async function handleGitea(request, env) {
  const body = await request.json();
  const event = request.headers.get('X-Gitea-Event') || '?';
  let msg = '';

  if (event === 'push') {
    const commits = body.commits?.length || 0;
    const branch = (body.ref || '').replace('refs/heads/', '');
    msg = `📦 *Gitea* Push to ${body.repository?.full_name} (${branch}) — ${commits} commit${commits !== 1 ? 's' : ''}`;
    if (body.commits?.[0]) msg += `\n  _${body.commits[0].message.slice(0, 60)}_`;
  } else if (event === 'pull_request') {
    msg = `🔀 *Gitea* PR ${body.action}: ${body.repository?.full_name} #${body.pull_request?.number}: ${body.pull_request?.title}`;
  } else if (event === 'issues') {
    msg = `📝 *Gitea* Issue ${body.action}: ${body.repository?.full_name} #${body.issue?.number}: ${body.issue?.title}`;
  } else {
    msg = `🔔 *Gitea* ${event}: ${body.repository?.full_name || '?'}`;
  }
  return postToSlack(env, msg);
}

// ── Prism Console Event Handler ──
async function handlePrismEvent(request, env) {
  const body = await request.json();
  const type = body.type || '?';
  let msg = '';

  if (type === 'deploy') {
    msg = `🚀 *Prism* Deploy: ${body.service || '?'} → ${body.status || '?'}`;
  } else if (type === 'agent') {
    msg = `🤖 *Prism* Agent ${body.action || '?'}: ${body.agent || '?'}`;
  } else if (type === 'health') {
    msg = `💚 *Prism* Health: ${body.status || '?'} — ${body.nodes_online || '?'}/${body.nodes_total || '?'} nodes`;
  } else if (type === 'contradiction') {
    msg = `⚡ *Prism* Contradiction detected: ${body.claim || '?'} vs ${body.counter || '?'}`;
    const analysis = await askAgent('cecilia', `A contradiction was detected: "${body.claim}" vs "${body.counter}". Analyze in one sentence.`, [], env);
    msg += `\n\n🧠 *Cecilia:* ${analysis}`;
  } else {
    msg = `🔮 *Prism* ${type}: ${JSON.stringify(body).slice(0, 100)}`;
  }
  return postToSlack(env, msg);
}

function json(data, cors = {}, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors }
  });
}
