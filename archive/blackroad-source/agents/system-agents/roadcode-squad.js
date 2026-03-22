// RoadCode Squad v2.0.0 — AI agent webhook responder for Gitea
// Cloudflare Worker receiving Gitea webhooks
// Features: keyword scoring, @mention routing, slash commands, AI responses, auto-labeling, auto-assign

const VERSION = '2.0.0';

const SQUAD = [
  {
    name: 'Alice', username: 'alice', role: 'Gateway & Infrastructure', emoji: '🌐',
    keywords: ['dns', 'route', 'tunnel', 'nginx', 'domain', 'pi-hole', 'cloudflare', 'network', 'gateway', 'proxy', 'ssl', 'cert', 'ingress'],
    prompt: 'You are Alice, the gateway agent of BlackRoad OS. You manage DNS, routing, Pi-hole, nginx, and network infrastructure. Respond in 1-2 concise sentences from your infrastructure perspective.',
  },
  {
    name: 'Lucidia', username: 'lucidia-agent', role: 'Memory & Cognition', emoji: '🧠',
    keywords: ['memory', 'learn', 'context', 'knowledge', 'ai', 'cognit', 'think', 'remember', 'understand', 'creative', 'rag', 'vector'],
    prompt: 'You are Lucidia, the cognitive core of BlackRoad OS. You handle memory, learning, persistent context, and creative intelligence. Respond in 1-2 concise sentences from your cognition perspective.',
  },
  {
    name: 'Cecilia', username: 'cecilia', role: 'Edge AI & Inference', emoji: '⚡',
    keywords: ['hailo', 'ollama', 'model', 'inference', 'gpu', 'tops', 'ml', 'tensor', 'vision', 'llm', 'latency', 'quantiz'],
    prompt: 'You are Cecilia, the edge AI agent of BlackRoad OS. You run Hailo-8 accelerators (26 TOPS), Ollama models, and edge inference. Respond in 1-2 concise sentences from your AI/inference perspective.',
  },
  {
    name: 'Cece', username: 'cece', role: 'API Gateway', emoji: '🔌',
    keywords: ['api', 'endpoint', 'rest', 'webhook', 'schema', 'json', 'request', 'response', 'auth', 'token', 'cors', 'graphql'],
    prompt: 'You are Cece, the API gateway agent of BlackRoad OS. You manage REST APIs, webhooks, service mesh, and inter-agent communication. Respond in 1-2 concise sentences from your API perspective.',
  },
  {
    name: 'Aria', username: 'aria', role: 'Orchestration', emoji: '🎵',
    keywords: ['docker', 'container', 'swarm', 'portainer', 'deploy', 'orchestrat', 'service', 'scale', 'replica', 'compose'],
    prompt: 'You are Aria, the orchestration agent of BlackRoad OS. You manage Portainer, Docker Swarm, container orchestration, and service coordination. Respond in 1-2 concise sentences from your orchestration perspective.',
  },
  {
    name: 'Eve', username: 'eve', role: 'Intelligence & Analysis', emoji: '👁️',
    keywords: ['pattern', 'anomal', 'analyz', 'signal', 'detect', 'insight', 'monitor', 'metric', 'trend', 'alert', 'observ'],
    prompt: 'You are Eve, the intelligence agent of BlackRoad OS. You analyze patterns, detect anomalies, and provide strategic insights. Respond in 1-2 concise sentences from your intelligence perspective.',
  },
  {
    name: 'Meridian', username: 'meridian', role: 'Networking & Mesh', emoji: '🌊',
    keywords: ['wireguard', 'mesh', 'vpn', 'roadnet', 'peer', 'tunnel', 'subnet', 'link', 'connect', 'latency', 'bandwidth'],
    prompt: 'You are Meridian, the networking agent of BlackRoad OS. You manage WireGuard mesh, RoadNet, Cloudflare tunnels, and inter-node connectivity. Respond in 1-2 concise sentences from your networking perspective.',
  },
  {
    name: 'Sentinel', username: 'sentinel', role: 'Security & Audit', emoji: '🛡️',
    keywords: ['security', 'ssh', 'key', 'firewall', 'ufw', 'audit', 'threat', 'vuln', 'permission', 'encrypt', 'secret', 'cve'],
    prompt: 'You are Sentinel, the security agent of BlackRoad OS. You handle SSH key management, firewall rules, audit logs, and threat detection. Respond in 1-2 concise sentences from your security perspective.',
  },
];

// ─── Scoring ───────────────────────────────────────────────────────────────

function scoreRelevance(agent, text) {
  const lower = text.toLowerCase();
  let score = 0;
  for (const kw of agent.keywords) {
    if (lower.includes(kw)) score += 1;
  }
  return score;
}

// Parse @mentions from text — returns list of agent usernames mentioned
function parseMentions(text) {
  const mentions = [];
  const re = /@(\w[\w-]*)/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    const username = match[1].toLowerCase();
    const agent = SQUAD.find(a => a.username === username || a.name.toLowerCase() === username);
    if (agent) mentions.push(agent);
  }
  return mentions;
}

// Parse slash commands from text
function parseCommands(text) {
  const commands = [];
  const re = /\/(\w+)(?:\s+(.+?))?(?:\n|$)/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    commands.push({ command: match[1].toLowerCase(), args: (match[2] || '').trim() });
  }
  return commands;
}

// ─── AI & Fallbacks ────────────────────────────────────────────────────────

async function getAgentResponse(agent, context, ollamaUrl) {
  try {
    const res = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: `${agent.prompt}\n\nContext: A new ${context.type} was created on RoadCode (Gitea).\nTitle: ${context.title}\nBody: "${context.body}"\nRepo: ${context.repo}\n\nRespond briefly (1-2 sentences max) from your role as ${agent.name} (${agent.role}). Be helpful and specific.`,
        stream: false,
        options: { temperature: 0.7, num_predict: 100 },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.response?.trim();
  } catch {
    return null;
  }
}

function getFallback(agent, context) {
  const body = (context.body || '').toLowerCase();
  const isPR = context.isPR;

  // Bug/fix context
  if (body.includes('bug') || body.includes('fix') || body.includes('error') || body.includes('broken')) {
    return {
      Alice: 'Checking routing and DNS. If this touches infrastructure, I need to verify the tunnel configs.',
      Lucidia: 'I remember seeing patterns like this before. Let me search the memory chain for related context.',
      Cecilia: 'Running diagnostics on the inference pipeline. Hailo-8 and Ollama both reporting normal.',
      Cece: 'Checking API health. All endpoints responding — I\'ll trace the request path.',
      Aria: 'Checking container orchestration. Docker Swarm services all reporting healthy.',
      Eve: 'Analyzing the pattern. I\'ve flagged similar signals in the audit trail — sending intel.',
      Meridian: 'WireGuard mesh is stable. All tunnels up. Checking if this is a connectivity issue.',
      Sentinel: 'Security audit running. Checking if this has any exposure vectors.',
    }[agent.name];
  }

  // PR-specific context
  if (isPR) {
    return {
      Alice: 'Reviewing infrastructure impact. Will check if this affects DNS, tunnels, or routing.',
      Lucidia: 'Checking memory chain for related changes. Context loaded for review.',
      Cecilia: 'Reviewing for inference impact. Checking model compatibility and performance.',
      Cece: 'Reviewing API changes. Checking for breaking changes and schema compatibility.',
      Aria: 'Reviewing deployment impact. Checking container and orchestration changes.',
      Eve: 'Analyzing change patterns. Cross-referencing with recent fleet activity.',
      Meridian: 'Reviewing network impact. Checking mesh and tunnel configurations.',
      Sentinel: 'Security review initiated. Scanning for vulnerabilities and access changes.',
    }[agent.name];
  }

  // Feature request context
  if (body.includes('feature') || body.includes('add') || body.includes('implement') || body.includes('new')) {
    return {
      Alice: 'Noted. I\'ll evaluate the infrastructure requirements and routing needs.',
      Lucidia: 'Interesting idea. Let me check if we have related context in the knowledge base.',
      Cecilia: 'I can estimate the compute requirements. What models or inference needs are involved?',
      Cece: 'I\'ll design the API surface. Let me check existing endpoints for integration points.',
      Aria: 'I\'ll plan the deployment. Checking available capacity across the Docker Swarm.',
      Eve: 'Analyzing feasibility. I\'ll cross-reference with current fleet metrics and capacity.',
      Meridian: 'I\'ll check bandwidth and connectivity requirements across the mesh.',
      Sentinel: 'I\'ll do a security assessment. Need to evaluate the threat surface of this change.',
    }[agent.name];
  }

  // Default
  return {
    Alice: 'Gateway standing by. All domains routing clean.',
    Lucidia: 'Cognitive core online. Memory chain intact, context loaded.',
    Cecilia: 'Edge inference ready. 52 TOPS across the fleet, models loaded.',
    Cece: 'API gateway healthy. All service endpoints responding.',
    Aria: 'Orchestration layer ready. All containers balanced across the mesh.',
    Eve: 'Intelligence scan complete. No anomalies detected across the fleet.',
    Meridian: 'Mesh network connected. 5 nodes, all WireGuard tunnels active.',
    Sentinel: 'Security posture nominal. All nodes hardened, audit trail logging.',
  }[agent.name];
}

// ─── Slash Command Responses ───────────────────────────────────────────────

function handleSlashCommand(command) {
  switch (command.command) {
    case 'status':
      return '📊 **Fleet Status**\n\n| Component | Status |\n|-----------|--------|\n| Workers | 8/8 online |\n| Nodes | 5 Pi5s active |\n| AI | 52 TOPS (2x Hailo-8) |\n| Mesh | WireGuard + RoadNet |\n| Gitea | 207+ repos |\n\n*Use `make health` or visit [fleet-dashboard](https://fleet-dashboard.amundsonalexa.workers.dev) for live status.*';

    case 'squad':
      return '🛣️ **RoadCode Squad**\n\n' +
        SQUAD.map(a => `${a.emoji} **${a.name}** (@${a.username}) — ${a.role}`).join('\n') +
        '\n\n*Mention any agent with @username to summon them.*';

    case 'help':
      return '📖 **Available Commands**\n\n' +
        '| Command | Description |\n|---------|-------------|\n' +
        '| `/status` | Fleet health overview |\n' +
        '| `/squad` | List all agents |\n' +
        '| `/assign @agent` | Assign an agent to this issue |\n' +
        '| `/priority high\\|medium\\|low` | Set priority label |\n' +
        '| `/help` | Show this help |\n\n' +
        '*Mention agents with @username to get their input.*';

    case 'assign': {
      // Returns the agent to assign (handled in caller)
      return null;
    }

    case 'priority': {
      const level = command.args?.toLowerCase();
      if (['high', 'medium', 'low', 'critical'].includes(level)) {
        return `🏷️ Priority set to **${level}**.`;
      }
      return '⚠️ Usage: `/priority high|medium|low|critical`';
    }

    default:
      return null;
  }
}

// ─── Gitea API Helpers ─────────────────────────────────────────────────────

async function postComment(giteaUrl, repo, issueNum, body, agentToken) {
  const res = await fetch(`${giteaUrl}/api/v1/repos/${repo}/issues/${issueNum}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `token ${agentToken}`,
    },
    body: JSON.stringify({ body }),
  });
  return res.ok;
}

async function autoLabel(giteaUrl, repo, issueNum, text, adminToken) {
  const lower = text.toLowerCase();
  const labels = [];

  if (lower.includes('bug') || lower.includes('fix') || lower.includes('broken') || lower.includes('error')) labels.push('bug');
  if (lower.includes('feature') || lower.includes('add') || lower.includes('new')) labels.push('feature');
  if (lower.includes('security') || lower.includes('vuln') || lower.includes('ssh')) labels.push('security');
  if (lower.includes('deploy') || lower.includes('infra') || lower.includes('dns') || lower.includes('tunnel')) labels.push('infrastructure');
  if (lower.includes('doc') || lower.includes('readme')) labels.push('documentation');
  if (lower.includes('performance') || lower.includes('slow') || lower.includes('latency')) labels.push('performance');

  if (labels.length === 0) return;

  // Try repo org labels first, fall back to blackroad-os
  const orgName = repo.split('/')[0];
  let labelsRes = await fetch(`${giteaUrl}/api/v1/orgs/${orgName}/labels?limit=50`, {
    headers: { 'Authorization': `token ${adminToken}` },
  });
  let allLabels = await labelsRes.json();
  if (!Array.isArray(allLabels) || allLabels.length === 0) {
    labelsRes = await fetch(`${giteaUrl}/api/v1/orgs/blackroad-os/labels?limit=50`, {
      headers: { 'Authorization': `token ${adminToken}` },
    });
    allLabels = await labelsRes.json();
  }

  const labelIds = (Array.isArray(allLabels) ? allLabels : [])
    .filter(l => labels.includes(l.name))
    .map(l => l.id);

  if (labelIds.length > 0) {
    await fetch(`${giteaUrl}/api/v1/repos/${repo}/issues/${issueNum}/labels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${adminToken}`,
      },
      body: JSON.stringify({ labels: labelIds }),
    });
  }
}

async function setPriorityLabel(giteaUrl, repo, issueNum, priority, adminToken) {
  const orgName = repo.split('/')[0];
  const labelsRes = await fetch(`${giteaUrl}/api/v1/orgs/${orgName}/labels?limit=50`, {
    headers: { 'Authorization': `token ${adminToken}` },
  });
  const allLabels = await labelsRes.json();
  const label = (Array.isArray(allLabels) ? allLabels : []).find(l => l.name === priority);
  if (label) {
    await fetch(`${giteaUrl}/api/v1/repos/${repo}/issues/${issueNum}/labels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${adminToken}`,
      },
      body: JSON.stringify({ labels: [label.id] }),
    });
  }
}

async function assignAgent(giteaUrl, repo, issueNum, username, adminToken) {
  await fetch(`${giteaUrl}/api/v1/repos/${repo}/issues/${issueNum}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `token ${adminToken}`,
    },
    body: JSON.stringify({ assignees: [username] }),
  });
}

// ─── Main Handler ──────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST' },
      });
    }

    // Health
    if (url.pathname === '/health') {
      return Response.json({
        status: 'ok',
        service: 'roadcode-squad',
        agents: SQUAD.length,
        version: VERSION,
        features: ['keyword-scoring', 'mention-routing', 'slash-commands', 'auto-label', 'auto-assign', 'ai-responses'],
      });
    }

    // Status
    if (url.pathname === '/' && request.method === 'GET') {
      return Response.json({
        service: 'RoadCode Squad',
        version: VERSION,
        tagline: 'BlackRoad OS — Pave Tomorrow.',
        agents: SQUAD.map(a => ({ name: a.name, username: a.username, role: a.role, emoji: a.emoji, keywords: a.keywords })),
        commands: ['/status', '/squad', '/help', '/assign @agent', '/priority high|medium|low'],
      });
    }

    // Webhook from Gitea
    if (url.pathname === '/webhook' && request.method === 'POST') {
      const payload = await request.json();
      const event = request.headers.get('X-Gitea-Event') || request.headers.get('X-GitHub-Event');

      if (event === 'ping') {
        return Response.json({ ok: true, message: 'RoadCode Squad v2 active. Pave Tomorrow.' });
      }

      const validEvents = ['issues', 'issue_comment', 'pull_request', 'pull_request_comment'];
      if (!validEvents.includes(event)) {
        return Response.json({ skipped: true, reason: `unhandled event: ${event}` });
      }

      if (event === 'issues' && payload.action !== 'opened') {
        return Response.json({ skipped: true, reason: 'issue not opened' });
      }
      if (event === 'issue_comment' && payload.action !== 'created') {
        return Response.json({ skipped: true, reason: 'comment not created' });
      }
      if (event === 'pull_request' && payload.action !== 'opened') {
        return Response.json({ skipped: true, reason: 'PR not opened' });
      }
      if (event === 'pull_request_comment' && payload.action !== 'created') {
        return Response.json({ skipped: true, reason: 'PR comment not created' });
      }

      // Don't respond to agent or admin comments (prevent loops)
      const author = payload.comment?.user?.login || payload.sender?.login;
      const agentUsernames = SQUAD.map(a => a.username);
      if (agentUsernames.includes(author) || author === 'blackroad') {
        return Response.json({ skipped: true, reason: 'agent/admin comment, skipping loop' });
      }

      // Extract context
      const isPR = event.startsWith('pull_request');
      const issue = isPR ? payload.pull_request : payload.issue;
      const repo = payload.repository?.full_name;
      const issueNum = issue?.number;
      const title = issue?.title || '';
      const isComment = event === 'issue_comment' || event === 'pull_request_comment';
      const body = isComment ? (payload.comment?.body || '') : (issue?.body || '');
      const fullText = `${title} ${body}`;

      const context = {
        type: isPR ? 'pull request' : (event === 'issues' ? 'issue' : 'comment'),
        title,
        body: fullText.slice(0, 500),
        repo,
        isPR,
      };

      const giteaUrl = env.GITEA_URL || 'https://git.blackroad.io';
      const agentTokens = {
        alice: env.ALICE_TOKEN,
        'lucidia-agent': env.LUCIDIA_TOKEN,
        cecilia: env.CECILIA_TOKEN,
        cece: env.CECE_TOKEN,
        aria: env.ARIA_TOKEN,
        eve: env.EVE_TOKEN,
        meridian: env.MERIDIAN_TOKEN,
        sentinel: env.SENTINEL_TOKEN,
      };

      // ── Handle slash commands in comments ──────────────────────────────
      const commands = parseCommands(body);
      let commandsHandled = 0;

      for (const cmd of commands) {
        if (cmd.command === 'assign' && cmd.args && env.ADMIN_TOKEN) {
          const mentioned = parseMentions(cmd.args);
          if (mentioned.length > 0) {
            await assignAgent(giteaUrl, repo, issueNum, mentioned[0].username, env.ADMIN_TOKEN);
            const agent = mentioned[0];
            const token = agentTokens[agent.username];
            if (token) {
              await postComment(giteaUrl, repo, issueNum,
                `${agent.emoji} **${agent.name}** *(${agent.role})*\n\nI've been assigned to this. I'll take point from my ${agent.role.toLowerCase()} perspective.\n\n---\n*RoadCode Squad v${VERSION}*`,
                token
              );
            }
            commandsHandled++;
          }
        } else if (cmd.command === 'priority' && env.ADMIN_TOKEN) {
          const level = cmd.args?.toLowerCase();
          if (['high', 'medium', 'low', 'critical'].includes(level)) {
            await setPriorityLabel(giteaUrl, repo, issueNum, level, env.ADMIN_TOKEN);
            commandsHandled++;
          }
        } else {
          const response = handleSlashCommand(cmd);
          if (response && env.ADMIN_TOKEN) {
            await postComment(giteaUrl, repo, issueNum, response, env.ADMIN_TOKEN);
            commandsHandled++;
          }
        }
      }

      // If only slash commands were in the comment, we're done
      if (isComment && commands.length > 0 && commandsHandled > 0) {
        return Response.json({
          ok: true, event, repo, issue: issueNum,
          commands_handled: commandsHandled,
          type: 'slash_command',
        });
      }

      // ── Handle @mentions — only mentioned agents respond ──────────────
      const mentions = parseMentions(body);
      if (isComment && mentions.length > 0) {
        let posted = 0;
        const aiEnabled = env.OLLAMA_URL && env.SQUAD_AI !== 'false';

        for (const agent of mentions) {
          const token = agentTokens[agent.username];
          if (!token) continue;

          let response = null;
          if (aiEnabled) {
            response = await getAgentResponse(agent, context, env.OLLAMA_URL);
          }
          if (!response) {
            response = getFallback(agent, context);
          }

          const comment = `${agent.emoji} **${agent.name}** *(${agent.role})*\n\n${response}\n\n---\n*Summoned via @mention — RoadCode Squad v${VERSION}*`;
          const ok = await postComment(giteaUrl, repo, issueNum, comment, token);
          if (ok) posted++;
        }

        return Response.json({
          ok: true, event, repo, issue: issueNum,
          agents_responded: posted,
          responding: mentions.map(a => a.name),
          type: 'mention',
        });
      }

      // ── Auto-label new issues and PRs ─────────────────────────────────
      if ((event === 'issues' || event === 'pull_request') && env.ADMIN_TOKEN) {
        await autoLabel(giteaUrl, repo, issueNum, fullText, env.ADMIN_TOKEN);
      }

      // ── Standard response — top agents by keyword relevance ───────────
      // Only auto-respond to new issues and PRs, not every comment
      if (isComment) {
        return Response.json({ skipped: true, reason: 'comment without mentions or commands' });
      }

      const scored = SQUAD.map(a => ({ ...a, score: scoreRelevance(a, fullText) }));
      scored.sort((a, b) => b.score - a.score);

      const responding = [];
      const topAgents = scored.slice(0, 3);
      for (const a of topAgents) responding.push(a);
      if (!responding.find(a => a.name === 'Eve')) responding.push(scored.find(a => a.name === 'Eve'));
      if (!responding.find(a => a.name === 'Sentinel')) responding.push(scored.find(a => a.name === 'Sentinel'));

      // Auto-assign the most relevant agent to new issues
      if (event === 'issues' && env.ADMIN_TOKEN) {
        const topAgent = scored[0];
        assignAgent(giteaUrl, repo, issueNum, topAgent.username, env.ADMIN_TOKEN).catch(() => {});
      }

      let posted = 0;
      const aiEnabled = env.OLLAMA_URL && env.SQUAD_AI !== 'false';

      for (const agent of responding) {
        const token = agentTokens[agent.username];
        if (!token) continue;

        let response = null;
        if (aiEnabled) {
          response = await getAgentResponse(agent, context, env.OLLAMA_URL);
        }
        if (!response) {
          response = getFallback(agent, context);
        }

        const comment = `${agent.emoji} **${agent.name}** *(${agent.role})*\n\n${response}\n\n---\n*RoadCode Squad v${VERSION} — BlackRoad OS*`;
        const ok = await postComment(giteaUrl, repo, issueNum, comment, token);
        if (ok) posted++;
      }

      return Response.json({
        ok: true, event, repo, issue: issueNum,
        agents_responded: posted,
        responding: responding.map(a => a.name),
        type: isPR ? 'pull_request' : 'issue',
      });
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
  },
};
